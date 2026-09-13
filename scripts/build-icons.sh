#!/bin/sh
# Render icons/icon.svg to the PNG sizes the manifest needs (requires rsvg-convert).
set -e
cd "$(dirname "$0")/../icons"
for size in 16 32 48 128; do
  rsvg-convert -w "$size" -h "$size" icon.svg -o "icon$size.png"
done
