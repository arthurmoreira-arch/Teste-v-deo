#!/usr/bin/env python3
"""Pós-produção dos episódios em quadrinhos (src/comic).
Aplica a "falha" (glitch) nos quadros de revelação — faixas deslocadas, canais de cor separados e blocos chapados —
e normaliza o áudio. Os quadros vêm de `glitch: [...]` em src/episodes/<ep>.ts.

Uso: python3 tools/pos-hq.py ep08 out/ep8-raw.mp4 out/e-se-ep07-hq.mp4
"""
import json, pathlib, re, subprocess, sys
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
ep, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
OFFSET = int(sys.argv[4]) if len(sys.argv) > 4 else 0  # só para testes com um trecho do vídeo
FPS = 30
dur = json.loads((root / "public" / "audio" / ep / "durations.json").read_text())
code = (root / "src" / "episodes" / f"{ep}.ts").read_text(encoding="utf-8")
blocks = re.split(r"\n  \{\n    id: ", code)[1:]
glitch = {}
for b in blocks:
    m = re.search(r"glitch: \[([0-9, ]+)\]", b)
    glitch[b.split("'")[1]] = [int(x) for x in m.group(1).split(",")] if m else []

# quadro absoluto -> (início da janela, passo). Cada janela dura 6 quadros = 3 passos de 2 (animação "em dois").
frames, start = {}, 0
for sid, d in dur.items():
    for a in glitch.get(sid, []):
        for k in range(6):
            frames[start + a + k] = (start + a, k // 2)
    start += round((d + 0.3) * FPS)

_wh = subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", src]).decode()
W, H = [int(x) for x in re.split(r"[,\s]+", _wh) if x][:2]
COLORS = np.array([[255, 43, 214], [34, 224, 255], [255, 232, 74]], dtype=np.uint8)


def glitch_frame(img, seed, power):
    rng = np.random.default_rng(seed)
    out = img.copy()
    k = max(2, int(W * 0.007 * power))  # separação leve de canais no quadro inteiro
    out[:, :, 0] = np.roll(img[:, :, 0], k, axis=1)
    out[:, :, 2] = np.roll(img[:, :, 2], -k, axis=1)
    for q in range(4):  # faixas horizontais deslocadas
        y0 = int(rng.uniform(0.05, 0.86) * H)
        y1 = min(H, y0 + int(rng.uniform(0.03, 0.11) * H))
        band = np.roll(img[y0:y1], int(rng.uniform(-0.09, 0.09) * W * power), axis=1)
        if q % 2 == 0:  # separação forte vermelho/azul
            kk = int(W * 0.03 * power)
            b2 = band.copy()
            b2[:, :, 0] = np.roll(band[:, :, 0], kk, axis=1)
            b2[:, :, 2] = np.roll(band[:, :, 2], -kk, axis=1)
            band = b2
        else:  # cores "erradas" (canais trocados)
            band = band[:, :, [2, 0, 1]]
        out[y0:y1] = band
    for q in range(6):  # blocos de cor chapada
        bw, bh = int(rng.uniform(0.04, 0.2) * W), int(rng.uniform(0.006, 0.022) * H)
        x0, y0 = int(rng.uniform(0, W - bw)), int(rng.uniform(0.05, 0.92) * H)
        out[y0 : y0 + bh, x0 : x0 + bw] = COLORS[q % 3]
    return out


dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
enc = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", src,
     "-map", "0:v", "-map", "1:a", "-af", "alimiter=limit=0.89,loudnorm=I=-14:TP=-1.5,afade=t=in:d=0.03,aresample=48000,alimiter=limit=0.71:level=false:attack=2:release=40", "-c:v", "libx264", "-crf", "18", "-preset", "medium",
     "-pix_fmt", "yuv420p", "-ar", "48000", "-b:a", "192k", "-movflags", "+faststart", dst],
    stdin=subprocess.PIPE,
)
size, n, done = W * H * 3, 0, 0
while True:
    buf = dec.stdout.read(size)
    if len(buf) < size:
        break
    if n + OFFSET in frames:
        a, step = frames[n + OFFSET]
        img = np.frombuffer(buf, np.uint8).reshape(H, W, 3)
        enc.stdin.write(glitch_frame(img, a * 10 + step, [1.0, 0.7, 0.4][step]).tobytes())
        done += 1
    else:
        enc.stdin.write(buf)
    n += 1
enc.stdin.close()
dec.wait()
enc.wait()
print(f"ok {dst}: {n} quadros, {done} com falha")
