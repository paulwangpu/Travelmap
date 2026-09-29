#!/usr/bin/env python3
"""Reproject NOAA SOS's equirectangular seafloor-age image to XYZ Web Mercator tiles."""
from __future__ import annotations

import argparse
import math
from pathlib import Path

import numpy as np
from PIL import Image


TILE_SIZE = 256


def sample_tile(source: np.ndarray, zoom: int, tile_x: int, tile_y: int) -> Image.Image:
    height, width = source.shape[:2]
    world_size = TILE_SIZE * (1 << zoom)
    global_x = tile_x * TILE_SIZE + np.arange(TILE_SIZE, dtype=np.float64) + 0.5
    global_y = tile_y * TILE_SIZE + np.arange(TILE_SIZE, dtype=np.float64) + 0.5
    longitude = global_x / world_size * 360.0 - 180.0
    mercator = math.pi * (1.0 - 2.0 * global_y / world_size)
    latitude = np.degrees(np.arctan(np.sinh(mercator)))
    source_x = (longitude + 180.0) / 360.0 * width - 0.5
    source_y = (90.0 - latitude) / 180.0 * height - 0.5

    x0 = np.floor(source_x).astype(np.int32) % width
    x1 = (x0 + 1) % width
    y0 = np.clip(np.floor(source_y).astype(np.int32), 0, height - 1)
    y1 = np.clip(y0 + 1, 0, height - 1)
    wx = (source_x - np.floor(source_x))[None, :, None]
    wy = (source_y - np.floor(source_y))[:, None, None]
    top = source[y0[:, None], x0[None, :]] * (1 - wx) + source[y0[:, None], x1[None, :]] * wx
    bottom = source[y1[:, None], x0[None, :]] * (1 - wx) + source[y1[:, None], x1[None, :]] * wx
    result = top * (1 - wy) + bottom * wy
    return Image.fromarray(np.clip(result, 0, 255).astype(np.uint8), "RGB")


def build(source_path: Path, output_dir: Path, max_zoom: int, base_path: Path | None = None) -> None:
    with Image.open(source_path) as image:
        source_image = image.convert("RGBA")
        if base_path:
            with Image.open(base_path) as base:
                base_image = base.convert("RGBA")
            if base_image.size != source_image.size:
                base_image = base_image.resize(source_image.size, Image.Resampling.LANCZOS)
            source_image = Image.alpha_composite(base_image, source_image)
        source = np.asarray(source_image.convert("RGB"), dtype=np.float32)
    for zoom in range(max_zoom + 1):
        side = 1 << zoom
        for tile_x in range(side):
            directory = output_dir / str(zoom) / str(tile_x)
            directory.mkdir(parents=True, exist_ok=True)
            for tile_y in range(side):
                tile = sample_tile(source, zoom, tile_x, tile_y)
                tile.save(directory / f"{tile_y}.jpg", "JPEG", quality=88, optimize=True, progressive=True)
        print(f"z{zoom}: {side * side} tiles")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--max-zoom", type=int, default=4)
    parser.add_argument("--base", type=Path, help="opaque equirectangular base to place below a transparent source")
    args = parser.parse_args()
    build(args.source, args.output, args.max_zoom, args.base)
