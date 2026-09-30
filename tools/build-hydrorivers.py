#!/usr/bin/env python3
"""Build a browser-sized HydroRIVERS backbone from the official global shapefile.

The output keeps flow-order classes 1-5 (roughly >=10 m³/s) and the topology
identifiers needed to diagnose downstream continuity. HydroRIVERS contains no
waterbody names; labels remain sourced from the ArcGIS reference overlay.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

import shapefile


def feature_lines(shape: shapefile.Shape) -> list[list[list[float]]]:
    if not shape.points:
        return []
    parts = list(shape.parts) + [len(shape.points)]
    lines = [shape.points[parts[index] : parts[index + 1]] for index in range(len(parts) - 1)]
    return [
        [[round(point[0], 5), round(point[1], 5)] for point in line]
        for line in lines
        if len(line) >= 2
    ]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path, nargs="?")
    parser.add_argument("--max-flow-order", type=int, default=5)
    parser.add_argument("--stats", action="store_true")
    args = parser.parse_args()

    reader = shapefile.Reader(str(args.input))
    fields = ["ORD_FLOW", "DIS_AV_CMS", "ORD_STRA", "HYRIV_ID", "NEXT_DOWN", "MAIN_RIV"]

    if args.stats:
        counts = Counter()
        for record in reader.iterRecords(fields=["ORD_FLOW"]):
            counts[int(record[0])] += 1
        print(json.dumps(dict(sorted(counts.items())), indent=2))
        return 0

    if not args.output:
        parser.error("output is required unless --stats is used")
    args.output.parent.mkdir(parents=True, exist_ok=True)

    selected = 0
    buckets: dict[int, list[list[list[float]]]] = {
        order: [] for order in range(1, args.max_flow_order + 1)
    }
    for record in reader.iterRecords(fields=fields):
        flow_order = int(record["ORD_FLOW"])
        if flow_order > args.max_flow_order:
            continue
        lines = feature_lines(reader.shape(record.oid))
        if not lines:
            continue
        buckets[flow_order].extend(lines)
        selected += 1
        if selected % 100000 == 0:
            print(f"prepared {selected:,} reaches", file=sys.stderr)

    features = [
        {
            "type": "Feature",
            "properties": {"flowOrder": order},
            "geometry": {"type": "MultiLineString", "coordinates": buckets[order]},
        }
        for order in sorted(buckets)
        if buckets[order]
    ]
    with args.output.open("w", encoding="utf-8", newline="\n") as destination:
        json.dump(
            {"type": "FeatureCollection", "features": features},
            destination,
            ensure_ascii=False,
            separators=(",", ":"),
        )
    print(f"wrote {selected:,} reaches to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
