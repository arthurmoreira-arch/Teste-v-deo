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

# ---- trilha: suspense cinematográfico em Lá menor (Am - F - C - E), 100 BPM, 60s
BPM = 100; beat = 60 / BPM; D = 60
N = D * SR
music = np.zeros(N)
chords = [  # (baixo, arpejo)
    (55.00, [220.00, 261.63, 329.63, 440.00]),
    (43.65, [174.61, 220.00, 261.63, 349.23]),
    (65.41, [261.63, 329.63, 392.00, 523.25]),
    (82.41, [329.63, 415.30, 493.88, 659.25]),
]

def add(buf, start, sig, gain=1.0):
    i = int(start * SR)
    if i >= len(buf): return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += gain * sig[:n]

def pluck(f, dur=0.55):
    t = np.arange(int(dur * SR)) / SR
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t) + 0.25 * np.sin(2 * np.pi * 3 * f * t)
    return x * np.exp(-t * 6.5) * np.minimum(1, t / 0.004)

def bass(f, dur):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 1.6) * np.minimum(1, t / 0.01)

def pad(freqs, dur):
    t = np.arange(int(dur * SR)) / SR
    x = sum(np.sin(2 * np.pi * f * (1 + 0.002 * np.sin(2 * np.pi * 0.3 * t)) * t) for f in freqs) / len(freqs)
    return x * np.sin(np.pi * np.minimum(t / dur, 1)) ** 0.7

def kick(dur=0.3):
    t = np.arange(int(dur * SR)) / SR
    return np.sin(2 * np.pi * (48 + 90 * np.exp(-t * 28)) * t) * np.exp(-t * 11)

def hat(dur=0.05):
    t = np.arange(int(dur * SR)) / SR
    nz = rng.standard_normal(len(t))
    return (nz - np.concatenate([[0], nz[:-1]])) * np.exp(-t * 70)

bar = 4 * beat
nbars = int(D / bar)
for b in range(nbars):
    root, arp = chords[(b // 1) % 4 if False else (b // 1) % 4]
    t0 = b * bar
    add(music, t0, bass(root, bar), 0.55)
    add(music, t0, pad([root * 2, arp[0], arp[2]], bar * 1.05), 0.18)
    intensity = min(1.0, 0.35 + b / 8)          # cresce ao longo do vídeo
    pattern = [0, 1, 2, 3, 2, 1, 2, 3]            # arpejo em colcheias
    for k, idx in enumerate(pattern):
        add(music, t0 + k * beat / 2, pluck(arp[idx]), 0.22 * intensity)
    for k in (0, 2):
        add(music, t0 + k * beat, kick(), 0.55 * intensity)
    if b >= 2:
        for k in range(8):
            add(music, t0 + k * beat / 2 + beat / 4, hat(), 0.10 * intensity)
music *= 0.9
# eco curto para dar espaço
echo = np.zeros_like(music); d = int(0.19 * SR); echo[d:] = music[:-d] * 0.28
music = music + echo
music = np.stack([music, np.roll(music, 300)], 1)
peak = np.max(np.abs(music)); music = music / peak * 0.85
save("music", music)

# ---- tensão: drone grave + agudo dissonante + batimento lento (planos de suspense)
D2 = 12; t = np.arange(D2 * SR) / SR
ten = 0.5 * np.sin(2 * np.pi * 41.2 * t) + 0.25 * np.sin(2 * np.pi * 43.65 * t)
ten += 0.06 * np.sin(2 * np.pi * 1244.5 * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.25 * t))
ten += 0.05 * np.sin(2 * np.pi * 1318.5 * t)
for k in np.arange(0.3, D2, 1.4):
    i = int(k * SR); n = int(0.3 * SR)
    if i + n < len(t):
        tt = np.arange(n) / SR
        ten[i:i + n] += 0.9 * np.sin(2 * np.pi * (55 - 20 * tt) * tt) * np.exp(-tt * 12)
ten *= np.minimum(1, t / 0.4)
save("tension", ten / np.max(np.abs(ten)) * 0.8)

# ---- teclado (digitação no terminal)
D3 = 8; ty = np.zeros(D3 * SR); pos = 0.05
while pos < D3 - 0.1:
    i = int(pos * SR); n = int(0.012 * SR); tt = np.arange(n) / SR
    click = rng.standard_normal(n) * np.exp(-tt * 420) * (0.5 + 0.5 * rng.random())
    ty[i:i + n] += click
    ty[i:i + n] += 0.4 * np.sin(2 * np.pi * (1800 + 900 * rng.random()) * tt) * np.exp(-tt * 300)
    pos += 0.045 + 0.07 * rng.random()
save("type", ty / np.max(np.abs(ty)) * 0.6)

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
