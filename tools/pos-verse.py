#!/usr/bin/env python3
"""Pós-produção do estilo quadrinhos: separação de cores (vermelho/azul) constante + rajadas nos cortes,
e normalização do áudio.  Uso: python3 tools/pos-verse.py ep07 out/ep7-raw.mp4 out/e-se-ep07.mp4
"""
import json, pathlib, re, subprocess, sys

root = pathlib.Path(__file__).resolve().parent.parent
ep, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
FPS = 30
dur = json.loads((root / "public" / "audio" / ep / "durations.json").read_text())
code = (root / "src" / "episodes" / f"{ep}.ts").read_text(encoding="utf-8")
blocks = re.split(r"\n  \{\n    id: ", code)[1:]
hits = {b.split("'")[1]: "sfx: 'hit'" in b for b in blocks}

filters = ["rgbashift=rh=4:rv=1:bh=-4:bv=-1"]
t = 0.0
for i, (sid, d) in enumerate(dur.items()):
    if i > 0:  # o 1º plano é a capa: sem rajada
        big = 20 if hits.get(sid) else 11
        for step, amt in enumerate([big, big * 0.6, big * 0.3]):
            a, b = t + step * 2 / FPS, t + (step + 1) * 2 / FPS
            n = round(amt)
            filters.append(f"rgbashift=rh={n}:bh={-n}:gv={round(n / 3)}:enable='between(t,{a:.3f},{b:.3f})'")
    t += round((d + 0.3) * FPS) / FPS

subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", ",".join(filters),
                "-af", "alimiter=limit=0.89,loudnorm=I=-14:TP=-1.5", "-c:v", "libx264", "-crf", "20", "-preset", "medium",
                "-pix_fmt", "yuv420p", "-b:a", "192k", dst], check=True)
print("ok", dst)
