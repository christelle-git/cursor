#!/usr/bin/env bash
# Lance le serveur MotionForge.
set -euo pipefail

HOST="${MF_HOST:-0.0.0.0}"
PORT="${MF_PORT:-8000}"

# Ajoute le répertoire des scripts pip --user au PATH si besoin.
export PATH="$HOME/.local/bin:$PATH"

echo "MotionForge -> http://localhost:${PORT}"
exec python3 -m uvicorn app.main:app --host "$HOST" --port "$PORT"
