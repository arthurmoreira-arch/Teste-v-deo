#!/usr/bin/env python3
"""Batida original (hip-hop/trap sombrio, 100% sintetizada) cortada no ritmo das cenas do episódio.
Cada cena recebe um arranjo: introdução, batida cheia, pausa de suspense, tensão com golpes nas revelações,
subida e a "queda" na virada.  Uso: python3 tools/gerar-beat.py ep08  →  public/audio/ep08/beat.mp3
"""
import json, pathlib, re, subprocess, sys, wave
import numpy as np

root = pathlib.Path(__file__).resolve().parent.parent
ep = sys.argv[1] if len(sys.argv) > 1 else "ep08"
SR, FPS = 44100, 30
rng = np.random.default_rng(11)

dur = json.loads((root / "public" / "audio" / ep / "durations.json").read_text())
_code = (root / "src" / "episodes" / f"{ep}.ts").read_text(encoding="utf-8")
_m = re.search(r"pad: ([0-9.]+)", _code)
PAD = float(_m.group(1)) if _m else 0.3
HOLD = {}
for _b in re.split(r"\n  \{\n    id: ", _code)[1:]:
    _h = re.search(r"hold: ([0-9.]+)", _b)
    HOLD[_b.split("'")[1]] = float(_h.group(1)) if _h else 0.0
_b = re.search(r"bpm: ([0-9.]+)", _code)
BPM = float(_b.group(1)) if _b else 140
STEP = 60 / BPM / 4  # semicolcheia
BAR = STEP * 16
ids = list(dur.keys())
lens = [round((dur[i] + PAD + HOLD.get(i, 0)) * FPS) / FPS for i in ids]
starts = [sum(lens[:i]) for i in range(len(ids))]
TOTAL = sum(lens)

# arranjo por cena (na ordem do episódio) e instantes (s, dentro da cena) dos golpes nas revelações
ARR = {"carros": "full", "calcada": "break", "perto": "drop", "beco": "full", "policial": "break", "sorriram": "tension", "achei": "drop", "trem": "full", "reflexo": "build", "escolha": "break", "entrou": "break", "regra": "tension", "beleza": "break", "cancelada": "tension", "voz": "drop", "espelho": "tension", "msg": "break", "mae": "break", "para": "drop", "eagora": "build", "escolha": "break", "chip": "intro", "todos": "full", "queda": "break", "bomba": "drop", "cadeira": "tension", "investigacao": "tension", "dia": "drop", "valor": "full", "kress": "break", "importa": "build", "gancho": "intro", "engracado": "full", "amiga": "break", "tres": "tension", "minuto": "build", "twist": "drop", "enquete": "full"}
STABS = {"bomba": [1.6], "dia": [0.4, 1.4], "tres": [1.0, 1.733, 2.467], "twist": [1.667, 2.6], "gancho": [2.2], "engracado": [1.667]}


def filt(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(fr)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(fr, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (fr / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def kick():
    n = int(0.42 * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(46 + 110 * np.exp(-t * 38)) / SR
    x = np.sin(ph) * np.exp(-t * 7.5)
    x[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
    return np.tanh(1.6 * (x + rng.standard_normal(n) * np.exp(-t * 900) * 0.25))


def sub(freq, length, glide=0.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(freq * (1 + glide * np.exp(-t * 18))) / SR
    e = np.minimum(1, t / 0.008) * np.exp(-t * 2.2)
    return np.tanh(1.8 * (np.sin(ph) + 0.25 * np.sin(2 * ph)) * e)


def clap():
    n = int(0.22 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n) * np.exp(-t * 16) * 0.5
    for d in (0, 0.011, 0.023):
        i = int(d * SR)
        x[i:] += rng.standard_normal(n - i) * np.exp(-np.arange(n - i) / SR * 60)
    return filt(x, 900, 7000) * 0.5


def hat(open_=False):
    n = int((0.16 if open_ else 0.045) * SR)
    t = np.arange(n) / SR
    return filt(rng.standard_normal(n) * np.exp(-t * (22 if open_ else 110)), 7000) * 0.6


def bell(freq, length=0.55):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t + 2.2 * np.sin(2 * np.pi * freq * 2.01 * t) * np.exp(-t * 9))
    return x * np.exp(-t * 6.5) * np.minimum(1, t / 0.003)


def riser(length):
    n = int(length * SR)
    u = np.arange(n) / n
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 3800 * u**2) / SR)
    return filt(0.5 * rng.standard_normal(n) * u**2 + 0.5 * sweep * u**1.5, 300) * u**1.5


def stab(freqs, length=0.55):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = sum(2 * ((f * t) % 1) - 1 for f in freqs) / len(freqs)
    return filt(x, 120, 2600) * np.exp(-t * 7) * np.minimum(1, t / 0.004)


def add(buf, t0, sig, gain=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i < 0:
        return
    n = min(len(sig), len(buf) - i)
    buf[i : i + n] += gain * sig[:n]


A1, C2, F1, G1 = 55.0, 65.41, 43.65, 49.0
BASS = [{0: A1, 6: A1, 10: C2}, {0: F1, 6: F1, 11: G1, 14: G1}]
MEL = [{0: 659.25, 3: 523.25, 6: 440.0, 8: 493.88, 11: 523.25, 14: 440.0}, {0: 587.33, 3: 523.25, 6: 440.0, 8: 415.3, 12: 440.0}]
K, CL, HH, OH = kick(), clap(), hat(), hat(True)


def section(kind, length, name):
    n = int(length * SR) + 1
    drums, bass, mel = np.zeros(n), np.zeros(n), np.zeros(n)
    bars = int(np.ceil(length / BAR))
    for b in range(bars):
        t0 = b * BAR
        if kind in ("full", "drop"):
            for st, fq in BASS[b % 2].items():
                add(drums, t0 + st * STEP, K, 0.95)
                add(bass, t0 + st * STEP, sub(fq, STEP * 5, 0.5), 0.8 if kind == "drop" else 0.66)
            add(drums, t0 + 8 * STEP, CL, 0.75)
            if b % 2:
                add(drums, t0 + 15 * STEP, CL, 0.3)
            for st in range(0, 16, 2):
                add(drums, t0 + st * STEP, HH, 0.34 if st % 4 == 0 else 0.2)
            if b % 2:
                for q in range(8):
                    add(drums, t0 + 12 * STEP + q * STEP / 2, HH, 0.12 + 0.03 * q)
            else:
                add(drums, t0 + 14 * STEP, OH, 0.22)
            for st, fq in MEL[b % 2].items():
                add(mel, t0 + st * STEP, bell(fq), 0.2)
                add(mel, t0 + (st + 3) * STEP, bell(fq), 0.07)
        elif kind == "intro":
            if b == 0:
                add(drums, 0, K, 0.9)
                add(bass, 0, sub(A1, BAR * 1.5, 0.3), 0.6)
            for st in range(0, 16, 4):
                add(drums, t0 + st * STEP, HH, 0.14)
            for st, fq in MEL[b % 2].items():
                add(mel, t0 + st * STEP, bell(fq), 0.16)
                add(mel, t0 + (st + 3) * STEP, bell(fq), 0.06)
        elif kind == "break":
            if b == 0:
                add(bass, 0, sub(A1, length, 0.0), 0.42)
            for st in (0, 8):
                add(drums, t0 + st * STEP, HH, 0.1)
            add(mel, t0, bell(440.0, 0.9), 0.14)
            add(mel, t0 + 6 * STEP, bell(415.3, 0.9), 0.1)
        elif kind == "tension":
            add(drums, t0, K, 0.9)
            add(bass, t0, sub(F1 if b % 2 else A1, BAR * 0.9, 0.4), 0.62)
            for st in (4, 8, 12):
                add(drums, t0 + st * STEP, HH, 0.12)
        elif kind == "build":
            if b == 0:
                add(bass, 0, sub(A1, length, 0.0), 0.4)
    if kind == "intro":
        add(drums, max(0, length - 1.3), riser(1.3), 0.34)
    if kind == "build":
        add(drums, 0, riser(max(0.3, length - 0.2)), 0.5)
        t, gap = 0.0, 0.34
        while t < length - 0.3:  # rufar acelerando
            add(drums, t, CL, 0.25 + 0.4 * t / length)
            gap = max(0.05, gap * 0.86)
            t += gap
        cut = int((length - 0.18) * SR)
        for buf in (drums, bass, mel):
            buf[cut:] = 0  # respiro antes da virada
    if kind == "drop":
        crash = filt(rng.standard_normal(int(1.2 * SR)) * np.exp(-np.arange(int(1.2 * SR)) / SR * 3.2), 3000)
        add(drums, 0, crash, 0.35)
        add(bass, 0, sub(A1, BAR, 0.9), 0.5)
    for st in STABS.get(name, []):
        add(mel, st, stab([220.0, 233.08, 329.63]), 0.5)
        add(drums, st, K, 0.5)
    x = drums + bass + mel
    fade = int(0.03 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)
    return x[: n - 1]


out = np.zeros(int(TOTAL * SR) + SR)
for name, t0, ln in zip(ids, starts, lens):
    add(out, t0, section(ARR.get(name, "full"), ln, name))
out = out[: int(TOTAL * SR)]
tail = int(0.5 * SR)
out[-tail:] *= np.linspace(1, 0, tail) ** 1.5
out = np.tanh(1.25 * out)
out = out / np.max(np.abs(out)) * 0.89
st = np.stack([out, np.roll(out, 180)], 1)
dst = root / "public" / "audio" / ep
wav = dst / "beat.wav"
with wave.open(str(wav), "wb") as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes((st * 32767).astype("<i2").tobytes())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(wav), "-b:a", "192k", str(dst / "beat.mp3")], check=True)
wav.unlink()
print("ok", round(TOTAL, 2), "s", [(n, ARR.get(n)) for n in ids])
