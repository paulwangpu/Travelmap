#!/usr/bin/env python3
"""Build a compact raster MBTiles archive from the GHSL 2020 population grid.

The input is GHS-POP R2023A, WGS84 30 arc-second. Values are residents per
source cell; this script converts them to residents/km², applies a fixed color
ramp, keeps very-low-density populated cells white, omits empty ocean tiles,
and writes XYZ tiles to MBTiles.
Convert the MBTiles output to PMTiles with the official pmtiles CLI.
"""

from __future__ import annotations

import argparse
import io
import json
import math
import sqlite3
import sys
import time
from pathlib import Path

import numpy as np
from PIL import Image

try:
    import rasterio
    from rasterio.enums import Resampling
    from rasterio.windows import from_bounds as window_from_bounds
except ImportError as exc:  # pragma: no cover - actionable CLI error
    raise SystemExit("Install rasterio first: python -m pip install rasterio") from exc


WEB_MERCATOR_LIMIT = 20037508.342789244
EARTH_RADIUS_KM = 6371.0088
TILE_SIZE = 256

# Residents/km². The breaks intentionally follow the Luminocity map guide while
# the colors are original and optimized for legibility under travel overlays.
BREAKS = np.array(
    [20, 100, 400, 1_000, 2_000, 3_500, 5_500, 7_500, 10_000, 12_000,
     16_000, 22_000, 30_000, 50_000, 100_000, 200_000],
    dtype=np.float32,
)
COLORS = np.array(
    [
        [250, 250, 247, 238],
        [255, 247, 188, 168], [254, 227, 145, 172], [254, 196, 79, 176],
        [254, 153, 41, 180], [236, 112, 20, 184], [204, 76, 2, 188],
        [153, 52, 4, 192], [122, 1, 119, 196], [123, 50, 148, 200],
        [84, 39, 143, 204], [44, 123, 182, 208], [33, 144, 141, 212],
        [0, 166, 202, 216], [0, 134, 174, 220], [8, 104, 172, 224],
        [8, 48, 107, 228],
    ],
    dtype=np.uint8,
)

def tile_bounds_mercator(z: int, x: int, y: int) -> tuple[float, float, float, float]:
    span = (WEB_MERCATOR_LIMIT * 2) / (1 << z)
    left = -WEB_MERCATOR_LIMIT + x * span
    right = left + span
    top = WEB_MERCATOR_LIMIT - y * span
    bottom = top - span
    return left, bottom, right, top


def mercator_y_to_lat(y: np.ndarray) -> np.ndarray:
    return np.degrees(2 * np.arctan(np.exp(y / 6378137.0)) - math.pi / 2)


def mercator_bounds_to_lonlat(bounds: tuple[float, float, float, float]) -> tuple[float, float, float, float]:
    left, bottom, right, top = bounds
    lon_left = left / WEB_MERCATOR_LIMIT * 180
    lon_right = right / WEB_MERCATOR_LIMIT * 180
    lat_bottom, lat_top = mercator_y_to_lat(np.array([bottom, top], dtype=np.float64))
    return lon_left, float(lat_bottom), lon_right, float(lat_top)


def read_population_tile(source, bounds: tuple[float, float, float, float], zoom: int) -> np.ndarray:
    lon_left, lat_bottom, lon_right, lat_top = mercator_bounds_to_lonlat(bounds)
    window = window_from_bounds(lon_left, lat_bottom, lon_right, lat_top, source.transform)
    # At small scales, oversample latitude before remapping it to Web Mercator;
    # at larger scales the curvature inside one tile is already small.
    sample_height = 1024 if zoom <= 3 else 384
    sampled = source.read(
        1,
        window=window,
        out_shape=(sample_height, TILE_SIZE),
        resampling=Resampling.average,
        boundless=True,
        fill_value=0,
    ).astype(np.float32, copy=False)
    left, bottom, right, top = bounds
    ys = top - (np.arange(TILE_SIZE, dtype=np.float64) + 0.5) * ((top - bottom) / TILE_SIZE)
    latitudes = mercator_y_to_lat(ys)
    rows = np.clip(
        ((lat_top - latitudes) / max(lat_top - lat_bottom, 1e-12) * sample_height).astype(np.int32),
        0,
        sample_height - 1,
    )
    return sampled[rows, :]


def source_cell_area_km2(latitudes: np.ndarray, lon_degrees: float, lat_degrees: float) -> np.ndarray:
    half_lat = math.radians(abs(lat_degrees)) / 2
    delta_lon = math.radians(abs(lon_degrees))
    latitude_radians = np.radians(latitudes)
    return (EARTH_RADIUS_KM ** 2) * delta_lon * (
        np.sin(latitude_radians + half_lat) - np.sin(latitude_radians - half_lat)
    )


def encode_tile(population: np.ndarray, bounds: tuple[float, float, float, float], source) -> bytes | None:
    left, bottom, right, top = bounds
    ys = top - (np.arange(TILE_SIZE, dtype=np.float64) + 0.5) * ((top - bottom) / TILE_SIZE)
    latitudes = mercator_y_to_lat(ys)
    cell_area = source_cell_area_km2(latitudes, source.transform.a, source.transform.e)
    density = np.divide(
        population,
        cell_area[:, None],
        out=np.zeros_like(population, dtype=np.float32),
        where=cell_area[:, None] > 0,
    )
    density[~np.isfinite(density)] = 0
    classes = np.digitize(density, BREAKS, right=False).astype(np.uint8)
    populated = population > 0
    if not np.any(populated):
        return None
    # Index 0 is transparent; density classes are shifted by one so class 0
    # can remain a visible near-white without making empty cells opaque.
    indices = classes + 1
    indices[~populated] = 0
    palette_colors = np.vstack((np.array([[0, 0, 0, 0]], dtype=np.uint8), COLORS))
    buffer = io.BytesIO()
    image = Image.fromarray(indices, mode="P")
    image.putpalette(palette_colors[:, :3].reshape(-1).tolist() + [0] * (256 * 3 - len(palette_colors) * 3))
    image.info["transparency"] = bytes(palette_colors[:, 3].tolist() + [0] * (256 - len(palette_colors)))
    image.save(buffer, format="PNG", optimize=False, compress_level=7)
    return buffer.getvalue()


def prepare_database(path: Path, metadata: dict[str, str]) -> sqlite3.Connection:
    if path.exists():
        path.unlink()
    connection = sqlite3.connect(path)
    connection.executescript(
        """
        PRAGMA journal_mode=OFF;
        PRAGMA synchronous=OFF;
        PRAGMA temp_store=MEMORY;
        CREATE TABLE metadata (name TEXT PRIMARY KEY, value TEXT);
        CREATE TABLE tiles (
          zoom_level INTEGER,
          tile_column INTEGER,
          tile_row INTEGER,
          tile_data BLOB,
          PRIMARY KEY (zoom_level, tile_column, tile_row)
        );
        """
    )
    connection.executemany("INSERT INTO metadata(name, value) VALUES (?, ?)", metadata.items())
    return connection


def ensure_source_overviews(path: Path) -> None:
    with rasterio.open(path, "r+", IGNORE_COG_LAYOUT_BREAK="YES") as source:
        if source.overviews(1):
            return
        factors = [2, 4, 8, 16, 32, 64, 128, 256]
        print("Building source overviews once for fast tiled reads...", flush=True)
        source.build_overviews(factors, Resampling.average)
        source.update_tags(ns="rio_overview", resampling="average")


def build(source_path: Path, output_path: Path, min_zoom: int, max_zoom: int) -> None:
    ensure_source_overviews(source_path)
    metadata = {
        "name": "GHSL population density 2020",
        "description": "Residents per km² derived from GHS-POP R2023A (2020, 30 arc-second)",
        "attribution": "European Commission, Joint Research Centre (JRC), GHSL 2023",
        "type": "overlay",
        "version": "1",
        "format": "png",
        "bounds": "-180,-85.051129,180,85.051129",
        "center": "0,20,2",
        "minzoom": str(min_zoom),
        "maxzoom": str(max_zoom),
        "json": json.dumps({"scheme": "xyz"}),
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    connection = prepare_database(output_path, metadata)
    started = time.perf_counter()
    written = 0
    scanned = 0
    batch: list[tuple[int, int, int, bytes]] = []

    with rasterio.open(source_path) as source:
        nodata = source.nodata
        for zoom in range(min_zoom, max_zoom + 1):
            side = 1 << zoom
            for y in range(side):
                for x in range(side):
                    bounds = tile_bounds_mercator(zoom, x, y)
                    destination = read_population_tile(source, bounds, zoom)
                    tile = encode_tile(destination, bounds, source)
                    scanned += 1
                    if tile is not None:
                        # MBTiles stores TMS rows; the PMTiles converter preserves XYZ semantics.
                        tms_y = side - 1 - y
                        batch.append((zoom, x, tms_y, tile))
                        written += 1
                    if len(batch) >= 256:
                        connection.executemany("INSERT INTO tiles VALUES (?, ?, ?, ?)", batch)
                        connection.commit()
                        batch.clear()
                if y % max(1, side // 8) == 0:
                    elapsed = time.perf_counter() - started
                    print(f"z{zoom}: row {y + 1}/{side}; {written:,} tiles; {elapsed:.0f}s", flush=True)
    if batch:
        connection.executemany("INSERT INTO tiles VALUES (?, ?, ?, ?)", batch)
    connection.commit()
    connection.execute("CREATE INDEX tile_index ON tiles (zoom_level, tile_column, tile_row)")
    connection.commit()
    connection.close()
    elapsed = time.perf_counter() - started
    print(f"Built {written:,}/{scanned:,} non-empty tiles in {elapsed:.1f}s: {output_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="GHS_POP_E2020...4326_30ss...tif")
    parser.add_argument("output", type=Path, help="Output MBTiles path")
    parser.add_argument("--minzoom", type=int, default=0)
    parser.add_argument("--maxzoom", type=int, default=8)
    args = parser.parse_args()
    if not 0 <= args.minzoom <= args.maxzoom <= 10:
        parser.error("expected 0 <= minzoom <= maxzoom <= 10")
    return args


if __name__ == "__main__":
    arguments = parse_args()
    build(arguments.input, arguments.output, arguments.minzoom, arguments.maxzoom)
