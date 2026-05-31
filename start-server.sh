#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Starting local server at http://localhost:5500/index.html"
echo "Press Ctrl+C to stop the server."
echo

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 5500
elif command -v python >/dev/null 2>&1; then
  python -m http.server 5500
else
  echo "Python 3 was not found. Please install Python 3 first."
  exit 1
fi
