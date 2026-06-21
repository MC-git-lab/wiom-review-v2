#!/usr/bin/env python3
import csv
import glob
import os

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "raw")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "wiom_reviews.csv")
COLUMNS = ["source", "text", "rating", "date", "author", "source_url", "collected_at", "is_paraphrase"]


def main():
    rows = []
    seen = set()
    for path in sorted(glob.glob(os.path.join(RAW_DIR, "*.csv"))):
        with open(path, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                key = (row.get("source", ""), row.get("author", "").strip(), row.get("text", "").strip())
                if key in seen:
                    continue
                seen.add(key)
                rows.append({col: row.get(col, "") for col in COLUMNS})

    with open(OUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)

    counts = {}
    for row in rows:
        counts[row["source"]] = counts.get(row["source"], 0) + 1

    print(f"Wrote {len(rows)} rows to {OUT_PATH}")
    print("Rows by source:")
    for source, count in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {source}: {count}")


if __name__ == "__main__":
    main()
