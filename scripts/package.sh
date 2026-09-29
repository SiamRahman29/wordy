#!/bin/sh
# Zip the files the extension needs for a Chrome Web Store upload into dist/.
set -e
cd "$(dirname "$0")/.."
version=$(node -p 'require("./manifest.json").version')
out="dist/wordy-$version.zip"
mkdir -p dist
rm -f "$out"
bsdtar --format zip -cf "$out" manifest.json popup src icons/icon16.png icons/icon32.png icons/icon48.png icons/icon128.png
echo "$out"
