#!/usr/bin/env python3
"""Gera a narração (voz de IA pt-BR, Piper) de cada plano e as durações em public/audio/durations.json.
Uso: python3 tools/gerar-voz.py   (precisa: pip install piper-tts, ffmpeg)
"""
import json, re, subprocess, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
model = root / "tools" / "pt_BR-faber-medium.onnx"
out = root / "public" / "audio" / "shots"
out.mkdir(parents=True, exist_ok=True)

src = (root / "src" / "script.ts").read_text(encoding="utf-8")
shots = re.findall(r"id: '([^']+)',\n\s+text: '((?:[^'\\]|\\.)*)'", src)
if not shots:
    sys.exit("não achei os shots em src/script.ts")

# pronúncia: ajuda o TTS com nomes em inglês
FIX = {"Red John": "Réd Djón", "Patrick Jane": "Pátrick Djêin", "Jane": "Djêin", "CBI": "Cê Bê Í", "Charlotte": "Charlót", "Lisbon": "Lísbon", "parte dois": "parte dois"}

# cadeia de áudio: limpa graves, realça presença, comprime e sobe para 44,1 kHz (som de "locutor")
AF = "highpass=f=70,equalizer=f=150:t=q:w=1:g=2,equalizer=f=3500:t=q:w=1.2:g=2.5,acompressor=threshold=-21dB:ratio=3:attack=4:release=90,loudnorm=I=-15:TP=-1.5,aresample=44100"

durations = {}
for i, (sid, text) in enumerate(shots):
    t = re.sub(r"[*!]", "", text)
    for k, v in FIX.items():
        t = t.replace(k, v)
    raw = out / f"{i:02d}_raw.wav"
    fin = out / f"{i:02d}.mp3"
    subprocess.run(
        [sys.executable, "-m", "piper", "-m", str(model), "-f", str(raw), "--length-scale", "0.95", "--noise-scale", "0.75", "--noise-w", "0.9", "--sentence-silence", "0.3"],
        input=t.encode("utf-8"), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", AF, "-b:a", "160k", str(fin)], check=True)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(fin)]).decode())
    durations[sid] = round(d, 3)
    raw.unlink()
    print(f"{i:02d} {sid}: {d:.2f}s")

(root / "public" / "audio" / "durations.json").write_text(json.dumps(durations, indent=2), encoding="utf-8")
print("ok")
