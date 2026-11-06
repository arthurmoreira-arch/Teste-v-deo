#!/usr/bin/env python3
"""Lê public/audio/shots/NN.mp3 e atualiza public/audio/durations.json (para áudios feitos à mão)."""
import json, pathlib, re, subprocess
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "src" / "script.ts").read_text(encoding="utf-8")
ids = [m for m, _ in re.findall(r"id: '([^']+)',\n\s+text: '((?:[^'\\]|\\.)*)'", src)]
d = {}
for i, sid in enumerate(ids):
    f = root / "public" / "audio" / "shots" / f"{i:02d}.mp3"
    d[sid] = round(float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)])), 3)
(root / "public" / "audio" / "durations.json").write_text(json.dumps(d, indent=2))
print(d)
