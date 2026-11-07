#!/usr/bin/env python3
"""Sintetiza trilha dark (drone + batimento) e efeitos (impacto, whoosh) 100% originais, sem direitos autorais."""
import pathlib, subprocess, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
out = root / "public" / "audio"
out.mkdir(parents=True, exist_ok=True)
SR = 44100
rng = np.random.default_rng(7)

def save(name, x, stereo=True):
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = np.stack([x, x], 1) if stereo else x
    pcm = (x * 32767).astype("<i2")
    w = out / f"{name}.wav"
    with wave.open(str(w), "wb") as f:
        f.setnchannels(pcm.shape[1] if pcm.ndim > 1 else 1); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(w), "-b:a", "160k", str(out / f"{name}.mp3")], check=True)
    w.unlink()

def lowpass(x, a):
    y = np.zeros_like(x); acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc); y[i] = acc
    return y

# ---- trilha: Lá menor sombrio, 80s
D = 80; t = np.arange(D * SR) / SR
pad = np.zeros_like(t)
for f, g in [(55, .5), (82.41, .3), (110, .22), (130.81, .14), (164.81, .08)]:
    vib = 1 + 0.003 * np.sin(2 * np.pi * 0.2 * t + f)
    pad += g * np.sin(2 * np.pi * f * vib * t)
pad *= 0.6 + 0.4 * np.sin(2 * np.pi * t / 9.0 - 1)
noise = lowpass(rng.standard_normal(D * SR), 0.02) * 0.9
beat = np.zeros_like(t)
bpm_period = 1.05
for k in np.arange(0.5, D, bpm_period):
    for off, amp in [(0, 1.0), (0.22, 0.65)]:
        i = int((k + off) * SR); n = int(0.28 * SR)
        if i + n < len(t):
            tt = np.arange(n) / SR
            beat[i:i + n] += amp * np.sin(2 * np.pi * (60 - 25 * tt) * tt) * np.exp(-tt * 14)
rise = np.minimum(1, 0.5 + t / 40)
music = (0.55 * pad + 0.35 * noise + 0.9 * beat * rise) * 0.55
music = np.stack([music, np.roll(music, 380)], 1)
save("music", music)

# ---- impacto (hit)
n = int(1.6 * SR); tt = np.arange(n) / SR
hit = np.sin(2 * np.pi * (150 * np.exp(-tt * 3.2) + 32) * tt) * np.exp(-tt * 3.0)
hit += 0.5 * lowpass(rng.standard_normal(n), 0.3) * np.exp(-tt * 14)
save("hit", hit * 0.9)

# ---- whoosh
n = int(0.5 * SR); tt = np.arange(n) / SR
env = np.sin(np.pi * np.minimum(tt / 0.5, 1)) ** 2
nz = rng.standard_normal(n); y = np.zeros(n); acc = 0.0
for i in range(n):
    a = 0.02 + 0.5 * (i / n)
    acc += a * (nz[i] - acc); y[i] = acc
save("whoosh", y * env * 2.2)
print("ok")
