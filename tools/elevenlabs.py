#!/usr/bin/env python3
"""Gera a narração no ElevenLabs (rode NA SUA MÁQUINA, com plano pago) e atualiza as durações.
  export ELEVENLABS_API_KEY=sua_chave
  python3 tools/elevenlabs.py [VOICE_ID]
Depois: npm run render
"""
import json, os, pathlib, re, subprocess, sys, urllib.request

root = pathlib.Path(__file__).resolve().parent.parent
key = os.environ["ELEVENLABS_API_KEY"]
voice = sys.argv[1] if len(sys.argv) > 1 else "pNInz6obpgDQGcFmaJgB"  # Adam (grave). Teste também: Daniel onwK4e9ZLuTAKqWW03F9, Brian nPczCjzI2devNBz1zQrb
out = root / "public" / "audio" / "shots"
out.mkdir(parents=True, exist_ok=True)

src = (root / "src" / "script.ts").read_text(encoding="utf-8")
shots = re.findall(r"id: '([^']+)',\n\s+text: '((?:[^'\\]|\\.)*)'", src)
durations = {}
for i, (sid, text) in enumerate(shots):
    t = re.sub(r"[*!]", "", text)
    body = json.dumps({
        "text": t, "model_id": "eleven_multilingual_v2", "language_code": "pt",
        "voice_settings": {"stability": 0.4, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True, "speed": 1.08},
    }).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=body, headers={"xi-api-key": key, "Content-Type": "application/json"})
    f = out / f"{i:02d}.mp3"
    f.write_bytes(urllib.request.urlopen(req).read())
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))
    durations[sid] = round(d, 3)
    print(f"{i:02d} {sid}: {d:.2f}s")
(root / "public" / "audio" / "durations.json").write_text(json.dumps(durations, indent=2))
print("ok -> npm run render")
