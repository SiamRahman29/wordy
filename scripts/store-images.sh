#!/bin/sh
# Render the Chrome Web Store screenshots and promo tile from store/images/*.html
# into store/images/out/ (requires chromium, python3, rsvg-convert and ImageMagick).
set -e
cd "$(dirname "$0")/.."
out=store/images/out
mkdir -p "$out"

port=8765
python3 -m http.server "$port" --bind 127.0.0.1 >/dev/null 2>&1 &
server=$!
trap 'kill $server' EXIT
sleep 1

base="http://127.0.0.1:$port/store/images"
profile=$(mktemp -d)

# render <file> <width> <height> <url> [extra chromium flags…]
render() {
  file=$1 width=$2 height=$3 url=$4
  shift 4
  chromium --headless --disable-gpu --hide-scrollbars --user-data-dir="$profile" \
    --force-device-scale-factor=1 --window-size="$width,$height" \
    --virtual-time-budget=4000 --blink-settings=preferredColorScheme=1 "$@" --screenshot="$out/$file" "$url" 2>/dev/null
  echo "$out/$file"
}

# shot <file> <word> <steps> <sense> <title> <text> <page> [extra chromium flags…]
shot() {
  file=$1
  url=$(python3 -c 'import sys, urllib.parse as u; print(u.urlencode(dict(zip(
    ["word", "steps", "sense", "title", "text", "page"], sys.argv[1:]))))' "$2" "$3" "$4" "$5" "$6" "$7")
  shift 7
  case "$*" in *preferredColorScheme=0*) url="$url&dark" ;; esac
  render "$file" 1280 800 "$base/shot.html?$url" "$@"
}

shot 1-slider.png hate 2 0 \
  "Find a stronger word, or a gentler one." \
  "Select a word on any page and open wordy. Slide right for stronger, left for weaker, then click to copy." \
  "Why I left my last job|Honestly, I [hate] meetings that could have been an email. Three of them a day is where my week goes to die.|What I want next is a team that writes things down and trusts people to read them."

shot 2-meanings.png fear 1 1 \
  "Every meaning gets its own scale." \
  "Words like fear, walk or good have more than one sense. Switch between them with a tab." \
  "Notes from the climb|The last hundred metres were pure [fear]. The ridge narrowed to a boot's width and the wind picked up.|At the top, nobody said anything for a long time."

shot 3-forms.png hated 2 0 \
  "It keeps your tense, plural and capitals." \
  "“hated” gives “detested”, “problems” gives “crises”, “Happier” gives “More thrilled”. Paste it straight back in." \
  "Review: The Long Evening|Critics [hated] the first act, and it's easy to see why: forty minutes pass before anyone speaks.|The second act is a different film entirely."

shot 4-dark.png big 2 0 \
  "Hand-picked scales. Works offline." \
  "Nearly 500 curated scales of nouns, verbs, adjectives and adverbs, ranked by hand. Follows your light or dark theme." \
  "Moving day|The new flat has a [big] window that looks straight onto the river.|We spent the first evening just watching the boats." \
  --blink-settings=preferredColorScheme=0

render promo-small.png 440 280 "$base/promo.html"
rm -rf "$profile"

# The store wants 24-bit PNGs without an alpha channel.
for image in "$out"/*.png; do
  magick "$image" -background white -alpha remove -alpha off "PNG24:$image"
done

# Store icon: 96×96 artwork centred in 128×128 with transparent padding, per the
# store's image guidelines. Rendered after the loop above so it keeps its alpha.
rsvg-convert -w 96 -h 96 icons/icon.svg |
  magick - -background none -gravity center -extent 128x128 "PNG32:$out/store-icon.png"
echo "$out/store-icon.png"
