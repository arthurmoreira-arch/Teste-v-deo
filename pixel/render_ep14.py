#!/usr/bin/env python3
"""Episódio 14 em pixel art: "Viajei no tempo pra descobrir por que o Brasil não é rico" (PARTE 1).
O avatar viaja por portais, troca de roupa a cada época e reage; pausas com silêncio antes das revelações.
Uso: python3 pixel/render_ep14.py [--frames 0,40,90]
"""
import json, math, pathlib, re, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "avatar")); sys.path.insert(0, str(ROOT / "pixel"))
from avatar import build  # noqa: E402
import render_ep12 as K  # noqa: E402  (ferramentas: texto, bandeiras, caixas, fundo)
from render_ep12 import INK, WHITE, YEL, RED, GRN, hx, text, box, flag, ease, coin, font, tokens, pages, COL  # noqa: E402
from render_ep13 import uk_flag, pt_flag, factory, gold  # noqa: E402

W, H, S, FPS, OUTFPS, SR = 270, 480, 4, 12, 30, 44100
EP = "ep14"
CODE = (ROOT / "src" / "episodes" / f"{EP}.ts").read_text(encoding="utf-8")
SHOTS = re.findall(r"id: '([^']+)',\n(?:\s+\w+: [^\n]*\n)*?\s+text: '((?:[^'\\]|\\.)*)'", CODE)
BLOCKS = {b.split("'")[1]: b for b in re.split(r"\n  \{\n    id: ", CODE)[1:]}
HOLD = {k: float(m.group(1)) if (m := re.search(r"hold: ([0-9.]+)", b)) else 0 for k, b in BLOCKS.items()}
HITS = {k for k, b in BLOCKS.items() if "sfx: 'hit'" in b}
QUIET = {k for k, b in BLOCKS.items() if "tone: 'suspense'" in b}
PAD = 0.25
DUR = json.loads((ROOT / "public" / "audio" / EP / "durations.json").read_text())
SPEAK = [round((DUR[i] + PAD) * FPS) for i, _ in SHOTS]
LENS = [round((DUR[i] + PAD + HOLD[i]) * FPS) for i, _ in SHOTS]
STARTS = [sum(LENS[:k]) for k in range(len(LENS))]
TOTAL = sum(LENS)
SEPIA, PAPER = hx("#6a4a2a"), hx("#e8d8b0")

_av = {}
def av(outfit, expr, scale):
    key = (outfit, expr, scale)
    if key not in _av:
        _av[key] = build(outfit, expr).resize((64 * scale // 2, 64 * scale // 2), Image.NEAREST)
    return _av[key]

def put_avatar(img, outfit, expr, x, y, scale=5, flip=False):
    a = av(outfit, expr, scale)
    if flip:
        a = a.transpose(Image.FLIP_LEFT_RIGHT)
    img.paste(a, (int(x - a.width / 2), int(y - a.height)), a)

def bubble(d, x, y, s, col=YEL):
    box(d, x - 22, y - 18, x + 22, y + 10, WHITE, INK, 2)
    d.polygon([(x - 6, y + 10), (x + 4, y + 10), (x - 10, y + 20)], fill=WHITE, outline=INK)
    text(d, (x, y - 4), s, 16, col, 2)

# ================================================================ cenários
def room(img, d, f):
    d.rectangle([0, 0, W, H], fill=hx("#2a2048"))
    d.rectangle([0, 330, W, H], fill=hx("#3a2a24"))
    for x in range(0, W, 18):
        d.line([(x, 330), (x - 30, H)], fill=hx("#2e2018"))
    box(d, 160, 110, 252, 200, hx("#0e1430"), INK, 3)  # janela com a cidade
    for i in range(6):
        hgt = 20 + (i * 17) % 50
        d.rectangle([164 + i * 15, 198 - hgt, 175 + i * 15, 198], fill=hx("#1a1a48"))
        if (f // 6 + i) % 3:
            d.point((168 + i * 15, 190 - hgt // 2), fill=YEL)
    d.line([(206, 110), (206, 200)], fill=INK, width=3)
    box(d, 14, 250, 120, 262, hx("#6a4428"))  # mesa
    box(d, 30, 206, 92, 250, INK, hx("#6ab8ff"), 2)
    d.rectangle([34, 210, 88, 246], fill=hx("#2a6ae8") if f % 12 < 8 else hx("#3a7af8"))

def portal(d, cx, cy, f, r=110):
    cols = [hx("#ff2bd6"), hx("#22e0ff"), YEL, hx("#7a3aff")]
    for i in range(10, 0, -1):
        rr = r * i / 10
        a = (f * 0.35 + i) % 4
        d.ellipse([cx - rr, cy - rr * 1.15, cx + rr, cy + rr * 1.15], fill=cols[int(a)])
    d.ellipse([cx - 14, cy - 16, cx + 14, cy + 16], fill=WHITE)
    for k in range(18):
        ang = k / 18 * math.tau + f * 0.25
        rr = r * (1.05 + 0.15 * math.sin(f * 0.5 + k))
        d.point((cx + math.cos(ang) * rr, cy + math.sin(ang) * rr * 1.15), fill=WHITE)

def mine(img, d, f, zoom=0.0):
    d.rectangle([0, 0, W, H], fill=hx("#ffb46a"))
    d.ellipse([170, 60, 230, 120], fill=hx("#fff2b0"))
    pts = [(0, 250), (40, 170), (90, 220), (140, 150), (200, 230), (250, 180), (270, 210), (270, 360), (0, 360)]
    d.polygon(pts, fill=hx("#6a8a3a"), outline=INK)
    d.polygon([(0, 290), (60, 240), (130, 280), (200, 230), (270, 270), (270, 360), (0, 360)], fill=hx("#8a6a3a"), outline=INK)
    d.rectangle([0, 330, W, H], fill=hx("#6a4a2a"))
    box(d, 96, 252, 156, 300, INK, hx("#3a2a1a"), 3)  # entrada da mina
    d.line([(96, 252), (126, 236), (156, 252)], fill=hx("#6a4a2a"), width=6)
    for i in range(7):  # pepitas brilhando
        x, y = 40 + i * 30, 310 + (i * 9) % 20
        gold(d, x, y)
        if (f + i * 3) % 10 < 3:
            d.line([(x + 9, y - 6), (x + 9, y - 1)], fill=WHITE); d.line([(x + 6, y - 3), (x + 12, y - 3)], fill=WHITE)

def sea(img, d, f):
    d.rectangle([0, 0, W, H], fill=hx("#6ab8ff"))
    d.rectangle([0, 200, W, H], fill=hx("#1a5ab0"))
    for i in range(12):
        x = (i * 37 + f * 2) % W
        d.line([(x, 214 + (i % 4) * 30), (x + 12, 214 + (i % 4) * 30)], fill=hx("#6ab8ff"), width=2)

def workshop(img, d, f, gray=False):
    wall = hx("#8a6a4a") if not gray else hx("#5a5a64")
    d.rectangle([0, 0, W, H], fill=wall)
    for y in range(0, 330, 22):
        d.line([(0, y), (W, y)], fill=hx("#7a5a3a") if not gray else hx("#4a4a54"))
    d.rectangle([0, 330, W, H], fill=hx("#5a3a24"))
    # tear (máquina de tecido)
    box(d, 130, 170, 250, 320, hx("#6a4428"), INK, 3)
    d.line([(140, 180), (240, 180)], fill=INK, width=4)
    for i in range(10):
        d.line([(142 + i * 10, 182), (142 + i * 10, 300)], fill=hx("#e8d8b0"), width=1)
    off = 0 if gray else (f * 3) % 40
    for j in range(5):
        y = 200 + j * 20 + off * 0 
        col = [RED, YEL, hx("#2a5ac8"), GRN, hx("#ff6ac1")][j]
        d.rectangle([142, y, 238, y + 8], fill=col if not gray else hx("#7a7a84"))
    d.rectangle([150 + off * 2, 186, 166 + off * 2, 194], fill=hx("#c8a060"), outline=INK)  # lançadeira

# ================================================================ cenas (f local, n = quadros da cena, sp = quadros com fala)
def sc_gancho(img, d, f, n, sp):
    room(img, d, f)
    put_avatar(img, "casual", "talk" if f % 4 < 2 else "neutral", 135, 470, 5)
    box(d, 10, 18, 260, 92, INK, YEL, 3)
    text(d, (135, 38), "VIAJEI NO TEMPO", 20, WHITE, 2)
    text(d, (135, 60), "PRA DESCOBRIR POR QUE", 12, WHITE, 1)
    text(d, (135, 78), "O BRASIL NÃO É RICO", 14, YEL, 2)

def sc_escola(img, d, f, n, sp):
    room(img, d, f)
    box(d, 20, 110, 150, 190, hx("#1a3a2a"), hx("#8a6a3a"), 5)  # quadro negro
    if f >= 6:
        text(d, (85, 140), "A ESCOLA", 12, WHITE, 0); text(d, (85, 160), "NÃO TE CONTA", 12, RED, 0)
    put_avatar(img, "casual", "smirk", 135 + 4 * math.sin(f), 470, 5)

def sc_portal1(img, d, f, n, sp):
    d.rectangle([0, 0, W, H], fill=hx("#0a0620"))
    portal(d, 135, 200, f)
    k = ease(f / n)
    a = av("casual", "blink", 4).rotate(k * 360, resample=Image.NEAREST)
    a = a.resize((max(4, int(a.width * (1 - 0.85 * k))), max(4, int(a.height * (1 - 0.85 * k)))), Image.NEAREST)
    img.paste(a, (int(135 - a.width / 2), int(200 + 160 * (1 - k) - a.height / 2)), a)
    if f >= n - 8:
        box(d, 70, 300, 200, 346, PAPER, INK, 3); text(d, (135, 323), "1703", 28, SEPIA, 0)

def sc_ouro(img, d, f, n, sp):
    mine(img, d, f)
    x = 40 + 70 * ease(f / 14)
    put_avatar(img, "colono", "neutral" if f < 14 else "smirk", x, 470 + (4 if (f // 3) % 2 and f < 14 else 0), 5)
    box(d, 160, 20, 258, 52, PAPER, INK, 3); text(d, (209, 36), "1703 · MG", 13, SEPIA, 0)

def sc_pausa1(img, d, f, n, sp):
    mine(img, d, f)
    # zoom lento na pepita (recorte ampliado)
    z = 1 + 0.6 * ease(f / n)
    crop = img.crop((int(135 - 135 / z), int(320 - 320 / z), int(135 + 135 / z), int(320 + 160 / z))).resize((W, 480), Image.NEAREST)
    img.paste(crop, (0, 0))
    d = ImageDraw.Draw(img)
    put_avatar(img, "colono", "neutral", 200, 470, 4)
    d.rectangle([0, 0, W, H], outline=hx("#000000"), width=10)

def sc_inglaterra(img, d, f, n, sp):
    sea(img, d, f)
    flag(img, "BR", 10, 120, 50, 34); pt_flag(img, 110, 120, 50, 34); uk_flag(img, 210, 120, 50, 34)
    k = (f % 30) / 30
    sx = int(20 + k * 200)
    d.polygon([(sx, 216), (sx + 46, 216), (sx + 38, 230), (sx + 6, 230)], fill=hx("#6a3a1a"), outline=INK)
    d.line([(sx + 22, 216), (sx + 22, 186)], fill=INK, width=2)
    d.polygon([(sx + 24, 188), (sx + 40, 204), (sx + 24, 212)], fill=WHITE, outline=INK)
    gold(d, sx + 6, 206)
    gr = ease((f - 12) / 16)
    if gr > 0:
        factory(d, 196, 196, 0.8 * gr + 0.01)
        if f % 6 < 3:
            d.ellipse([240, 140 - (f % 6) * 3, 252, 150 - (f % 6) * 3], fill=hx("#d8d8e8"))
    put_avatar(img, "colono", "talk" if f % 4 < 2 else "neutral", 70, 470 - (12 if f < 4 else 0), 5)
    if f >= 2:
        bubble(d, 120, 290, "?!", RED)

def sc_pior(img, d, f, n, sp):
    d.rectangle([0, 0, W, H], fill=hx("#14040a"))
    for r in range(6):
        d.ellipse([135 - 40 - r * 30, 220 - 40 - r * 30, 135 + 40 + r * 30, 220 + 40 + r * 30], outline=hx("#3a0a14"), width=2)
    beat = 1.06 if f % 8 < 2 else 1.0
    a = av("colono", "neutral", 7)
    a = a.resize((int(a.width * beat), int(a.height * beat)), Image.NEAREST)
    img.paste(a, (int(135 - a.width / 2), int(470 - a.height)), a)

def sc_tear(img, d, f, n, sp):
    workshop(img, d, f)
    put_avatar(img, "imperio", "smirk", 70, 470, 5)
    box(d, 8, 20, 110, 52, PAPER, INK, 3); text(d, (59, 36), "1785", 18, SEPIA, 0)

def sc_pausa2(img, d, f, n, sp):
    workshop(img, d, f)
    k = ease(f / 14)
    y = int(-80 + 200 * k)
    box(d, 70, y, 200, y + 90, PAPER, INK, 3)  # carta/decreto caindo
    text(d, (135, y + 18), "ORDEM DA", 10, SEPIA, 0); text(d, (135, y + 32), "RAINHA", 10, SEPIA, 0)
    pt_flag(img, 117, y + 46, 36, 24)
    put_avatar(img, "imperio", "neutral", 70, 470, 5)
    d.rectangle([0, 0, W, H], outline=hx("#000000"), width=10)

def sc_proibido(img, d, f, n, sp):
    sh = (6 if f % 2 else -6) if f < 8 else 0
    tmp = Image.new("RGB", (W, H)); td = ImageDraw.Draw(tmp)
    workshop(tmp, td, f, gray=True)
    img.paste(tmp, (sh, 0)); d = ImageDraw.Draw(img)
    s = 1.0 if f >= 2 else 1.6
    w, h = int(220 * s), int(60 * s)
    d.rectangle([135 - w // 2, 200 - h // 2, 135 + w // 2, 200 + h // 2], fill=PAPER, outline=RED, width=7)
    text(d, (135, 200), "PROIBIDO", int(34 * s), RED, 0)
    put_avatar(img, "imperio", "talk", 70, 470, 5)
    bubble(d, 120, 296, "!!", RED)

def sc_chuta(img, d, f, n, sp):
    d.rectangle([0, 0, W, H], fill=hx("#1a1040"))
    text(d, (135, 90), "PAUSA E CHUTA:", 20, YEL, 2)
    text(d, (135, 118), "O QUE ISSO CAUSOU?", 14, WHITE, 2)
    left = max(0, n - f)
    secs = math.ceil(left / FPS)
    if f >= sp:
        text(d, (135, 200), str(max(1, secs)), 60, WHITE, 3)
    else:
        text(d, (135, 200), "?", 70, YEL, 3)
    put_avatar(img, "imperio", "smirk", 135, 470, 5)

def sc_resposta(img, d, f, n, sp):
    d.rectangle([0, 0, W, H], fill=hx("#101a3a"))
    k = (f % 30) / 30
    flag(img, "BR", 10, 90, 34, 22)
    x = int(50 + k * 160)
    d.polygon([(x, 106), (x + 12, 96), (x + 24, 106), (x + 16, 114), (x + 4, 114)], fill=hx("#9a4a2a"), outline=INK)
    d.line([(46, 120), (240, 120)], fill=hx("#c8c8d8"), width=2)
    box(d, 214, 84, 262, 104, GRN); text(d, (238, 94), "$", 14, WHITE, 0)
    text(d, (135, 136), "VENDE BARATO", 14, GRN)
    flag(img, "BR", 10, 170, 34, 22)
    x2 = int(220 - k * 160)
    box(d, x2, 160, x2 + 16, 188, INK, hx("#c8c8d8")); d.rectangle([x2 + 3, 164, x2 + 13, 182], fill=hx("#6ab8ff"))
    d.line([(46, 194), (240, 194)], fill=hx("#c8c8d8"), width=2)
    box(d, 196, 204, 262, 224, RED); text(d, (229, 214), "$$$$", 12, WHITE, 0)
    text(d, (100, 214), "COMPRA CARO", 14, RED)
    put_avatar(img, "imperio", "talk" if f % 4 < 2 else "neutral", 135, 470, 5)

def sc_gancho2(img, d, f, n, sp):
    d.rectangle([0, 0, W, H], fill=hx("#0a0620"))
    portal(d, 135, 170, f, 96)
    d.polygon([(110, 184), (160, 184), (154, 196), (116, 196)], fill=INK)  # navio inglês ao fundo
    d.line([(135, 184), (135, 150)], fill=INK, width=2); d.polygon([(137, 152), (152, 170), (137, 178)], fill=INK)
    if (f // 3) % 2:
        text(d, (135, 110), "1810", 18, WHITE, 2)
    put_avatar(img, "imperio", "neutral", 135, 470, 5)
    if f >= n - 20:
        box(d, 60, 290, 210, 326, RED, INK, 3); text(d, (135, 308), "PARTE 2", 20, WHITE, 2)

SC = {"gancho": sc_gancho, "escola": sc_escola, "portal1": sc_portal1, "ouro": sc_ouro, "pausa1": sc_pausa1, "inglaterra": sc_inglaterra,
      "pior": sc_pior, "tear": sc_tear, "pausa2": sc_pausa2, "proibido": sc_proibido, "chuta": sc_chuta, "resposta": sc_resposta, "gancho2": sc_gancho2}

def captions(d, txt, f, sp):
    tk = tokens(txt); pg = pages(tk)
    if f >= sp:
        return  # na pausa não há legenda nova (fica só a imagem)
    acc, page = 0, len(pg) - 1
    for i, p in enumerate(pg):
        ln = len(p) / len(tk) * (sp - 3)
        if f - 1 < acc + ln:
            page = i; break
        acc += ln
    words = pg[page]
    sz = 22
    while True:
        widths = [d.textlength(w.upper(), font=font(sz)) for w, _ in words]
        if sum(widths) + 6 * (len(words) - 1) <= W - 20 or sz <= 12:
            break
        sz -= 1
    x = (W - (sum(widths) + 6 * (len(words) - 1))) / 2
    for (w, c), wd in zip(words, widths):
        text(d, (x, 254), w.upper(), sz, COL[c], 3, "lm")
        x += wd + 6

def frame(gi):
    k = next(i for i in range(len(SHOTS)) if gi < STARTS[i] + LENS[i])
    sid, txt = SHOTS[k]
    f, n, sp = gi - STARTS[k], LENS[k], SPEAK[k]
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img); d.fontmode = "1"
    SC[sid](img, d, f, n, sp)
    d = ImageDraw.Draw(img); d.fontmode = "1"
    if sid != "chuta":
        captions(d, txt, f, sp)
    box(d, 8, H - 22, 82, H - 8, RED, INK, 2); text(d, (45, H - 15), "PARTE 1", 9, WHITE, 0)
    d.rectangle([0, 0, int(W * gi / TOTAL), 3], fill=YEL)
    if k > 0 and f < 2 and sid not in QUIET:  # varredura de pixels na troca de cena
        for y in range(0, H, 6):
            if (y // 6 + f) % 2 == 0:
                d.rectangle([0, y, W, y + 5], fill=WHITE)
    return img

# ================================================================ áudio
def load_mono(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32)

def build_audio(path):
    total = int((TOTAL / FPS + 0.5) * SR)
    voice = np.zeros(total, np.float32); music = np.zeros(total, np.float32); fx = np.zeros(total, np.float32)
    for k, (sid, _) in enumerate(SHOTS):
        a = load_mono(ROOT / "public" / "audio" / EP / "shots" / f"{k:02d}.mp3")
        i = int(STARTS[k] / FPS * SR); voice[i:i + len(a)] += a[: total - i]
    step = 60 / 112 / 2
    mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74]
    bas = [48, 48, 53, 53, 55, 55, 48, 48]
    def sq(fr, n):
        tt = np.arange(n) / SR; return np.where((tt * fr) % 1 < 0.25, 1.0, -1.0) * np.exp(-tt * 5)
    for s in range(int(total / SR / step)):
        i = int(s * step * SR); n = int(step * SR)
        if i + 2 * n > total: break
        music[i:i + n] += 0.11 * sq(440 * 2 ** ((mel[s % 16] - 69) / 12), n)
        if s % 2 == 0:
            tt = np.arange(2 * n) / SR; fr = 440 * 2 ** ((bas[(s // 2) % 8] - 69) / 12)
            music[i:i + 2 * n] += 0.18 * (2 * np.abs(2 * ((tt * fr) % 1) - 1) - 1) * np.exp(-tt * 2)
        if s % 4 == 0:
            kk = np.arange(int(0.12 * SR)) / SR
            music[i:i + len(kk)] += 0.32 * np.sin(2 * np.pi * (120 * np.exp(-kk * 30) + 40) * kk) * np.exp(-kk * 18)
    # volume da música por cena: some nas pausas (suspense), volta forte na revelação
    vol = np.ones(total, np.float32) * 0.45
    for k, (sid, _) in enumerate(SHOTS):
        a = int(STARTS[k] / FPS * SR); b = int((STARTS[k] + LENS[k]) / FPS * SR)
        if sid in QUIET:
            vol[a:b] = 0.0
            for t0 in np.arange(0, (b - a) / SR, 0.8):  # batimento cardíaco no silêncio
                for off, g in ((0, 0.5), (0.18, 0.32)):
                    j = a + int((t0 + off) * SR); m = int(0.16 * SR); tt = np.arange(m) / SR
                    fx[j:j + m] += g * np.sin(2 * np.pi * (60 - 18 * tt) * tt) * np.exp(-tt * 14) if j + m < total else 0
    vol = np.convolve(vol, np.ones(1500) / 1500, mode="same")
    env = np.convolve(np.abs(voice), np.ones(2205) / 2205, mode="same")
    duck = 1 - 0.5 * np.clip(env / 0.03, 0, 1)
    for k, (sid, _) in enumerate(SHOTS):
        i = int(STARTS[k] / FPS * SR)
        if sid in HITS:
            m = int(0.45 * SR); tt = np.arange(m) / SR
            fx[i:i + m] += (np.sin(2 * np.pi * (180 * np.exp(-tt * 8) + 40) * tt) * np.exp(-tt * 6) * 0.6)[: total - i]
        if sid.startswith("portal") or sid == "gancho2":
            m = int(1.2 * SR); tt = np.arange(m) / SR
            sweep = np.sin(2 * np.pi * np.cumsum(200 + 1600 * (tt / 1.2) ** 2) / SR) * 0.18 * np.sin(np.pi * tt / 1.2)
            fx[i:i + m] += sweep[: total - i]
    mix = voice + music * vol * duck + fx
    mix = mix / max(1e-6, np.abs(mix).max()) * 0.9
    with wave.open(str(path), "wb") as wv:
        wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
        wv.writeframes((mix * 32767).astype("<i2").tobytes())

if __name__ == "__main__":
    out = ROOT / "out"; out.mkdir(exist_ok=True)
    tmp = ROOT / "pixel" / "_frames"; tmp.mkdir(exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[1] == "--frames":
        for gi in map(int, sys.argv[2].split(",")):
            frame(gi).resize((W * 2, H * 2), Image.NEAREST).save(tmp / f"check_{gi:04d}.png")
        print("ok checks"); sys.exit()
    wav = ROOT / "pixel" / "_mix.wav"
    build_audio(wav)
    for f in tmp.glob("*.png"): f.unlink()
    for gi in range(TOTAL):
        frame(gi).resize((W * S, H * S), Image.NEAREST).save(tmp / f"{gi:05d}.png")
    dst = out / "viajei-no-tempo-parte1.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(tmp / "%05d.png"), "-i", str(wav),
                    "-vf", f"fps={OUTFPS}", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                    "-af", "loudnorm=I=-14:TP=-1.5", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(dst)], check=True)
    print("ok", dst, TOTAL / FPS, "s")
