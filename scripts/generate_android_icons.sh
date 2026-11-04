#!/bin/bash
set -e

SOURCE_ICON="public/icon.png"
if [ ! -f "$SOURCE_ICON" ]; then
  echo "Source icon not found at $SOURCE_ICON"
  exit 1
fi

echo "Generating Android launcher icons from $SOURCE_ICON..."

# Densities and sizes: density:icon_size:foreground_canvas:foreground_inner
CONFIGS=(
  "mdpi:48:108:72"
  "hdpi:72:162:108"
  "xhdpi:96:216:144"
  "xxhdpi:144:324:216"
  "xxxhdpi:192:432:288"
)

for config in "${CONFIGS[@]}"; do
  IFS=':' read -r density size canvas inner <<< "$config"
  DIR="android/app/src/main/res/mipmap-$density"
  mkdir -p "$DIR"

  echo "Processing $density (icon: ${size}x${size}, fg: ${canvas}x${canvas})..."

  # 1. Standard Square/Squircle Launcher Icon
  convert "$SOURCE_ICON" -resize "${size}x${size}" "$DIR/ic_launcher.png"

  # 2. Round Launcher Icon (Masked with Circle)
  half=$((size / 2))
  convert "$SOURCE_ICON" -resize "${size}x${size}" \
    \( -size "${size}x${size}" xc:none -fill white -draw "circle $half,$half $half,1" \) \
    -compose DstIn -composite "$DIR/ic_launcher_round.png"

  # 3. Adaptive Foreground Icon (Centered on transparent canvas)
  convert "$SOURCE_ICON" -resize "${inner}x${inner}" \
    -background none -gravity center -extent "${canvas}x${canvas}" \
    "$DIR/ic_launcher_foreground.png"
done

# Also generate 512x512 store/splash drawable
mkdir -p android/app/src/main/res/drawable
convert "$SOURCE_ICON" -resize 512x512 android/app/src/main/res/drawable/ic_launcher_512.png

echo "All Android launcher icons generated successfully!"
