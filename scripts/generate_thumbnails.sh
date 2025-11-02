#!/usr/bin/env bash
set -euo pipefail

# Generate square WebP thumbnails for cover images.
# Usage:
#   scripts/generate_thumbnails.sh [DIM] [QUALITY]
# Defaults:
#   DIM=600 (results in DIM x DIM)
#   QUALITY=80 (lossy WebP quality)

DIM="${1:-600}"
QUALITY="${2:-80}"

if ! command -v convert >/dev/null 2>&1; then
  echo "Error: ImageMagick 'convert' is required but not found in PATH." >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC_DIR="$REPO_ROOT/images/covers"
OUT_DIR="$SRC_DIR/thumbs"

mkdir -p "$OUT_DIR"

shopt -s nullglob nocaseglob

SIZE="${DIM}x${DIM}"

echo "Generating ${SIZE} WebP thumbnails (quality=${QUALITY}) from: $SRC_DIR"

for f in "$SRC_DIR"/*.{png,jpg,jpeg,webp}; do
  [[ -e "$f" ]] || continue
  bn="$(basename "${f%.*}")"
  out="$OUT_DIR/${bn}.webp"

  # Skip if output exists and is newer than input
  if [[ -f "$out" && "$out" -nt "$f" ]]; then
    echo "Up-to-date: $out"
    continue
  fi

  echo "Converting: $f -> $out"
  convert "$f" \
    -resize "${SIZE}^" \
    -gravity center -extent "$SIZE" \
    -quality "$QUALITY" \
    "$out"
done

echo "Done. Thumbnails are in: $OUT_DIR"


