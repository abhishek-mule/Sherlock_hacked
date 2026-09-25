#!/usr/bin/env bash
set -euo pipefail
# Build TWA APK via Bubblewrap (requires Node 18+, JDK 17)
# Usage: ./scripts/build-apk.sh [host]
HOST=${1:-"sherlock-five.vercel.app"}
echo "== Sherlock Hacked — TWA APK Builder =="
echo "Host: $HOST"
echo "Manifest: https://$HOST/manifest.json"

if ! command -v bubblewrap >/dev/null 2>&1; then
  echo "Installing @bubblewrap/cli..."
  npm i -g @bubblewrap/cli
fi
if ! command -v jarsigner >/dev/null 2>&1; then
  echo "ERROR: JDK 17 required (jarsigner not found). Install: sudo apt install openjdk-17-jdk"
  exit 1
fi

TMP=twa
if [ ! -f "$TMP/twa-manifest.json" ]; then
  echo "Initializing Bubblewrap in $TMP/..."
  mkdir -p "$TMP"
  bubblewrap init --manifest "https://$HOST/manifest.json" --directory "$TMP"
else
  echo "Using existing $TMP/twa-manifest.json"
fi

echo "Building..."
bubblewrap build --directory "$TMP"
echo "Done. APK/AAB in $TMP/app/build/outputs/"
ls -lh "$TMP/app/build/outputs/apk/release/" 2>/dev/null || true
ls -lh "$TMP/app/build/outputs/bundle/release/" 2>/dev/null || true
echo "Upload app-release-signed.apk to GitHub Releases or public/apk/ for direct download."
