#!/usr/bin/env python3
"""Episódio 13 em pixel art: "5 fatos que impediram o Brasil de ser rico"
Desenha cada quadro em 270x480 (12 quadros/s, cara de jogo antigo), amplia 4x sem suavizar (1080x1920),
monta voz + trilha 8-bit + efeitos e gera out/brasil-rico.mp4.
Uso: python3 pixel/render_ep12.py [--frames 0,40,90] (sem argumentos = vídeo inteiro)
"""
import json, math, pathlib, re, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "avatar"))
from avatar import build  # noqa: E402

W, H, S, FPS, OUTFPS = 270, 480, 4, 12, 30
EP = "ep13"
PAD = 0.3
SR = 44100
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
CODE = (ROOT / "src" / "episodes" / f"{EP}.ts").read_text(encoding="utf-8")
SHOTS = re.findall(r"id: '([^']+)',\n(?:\s+\w+: [^\n]*\n)*?\s+text: '((?:[^'\\]|\\.)*)'", CODE)
HITS = {b.split("'")[1] for b in re.split(r"\n  \{\n    id: ", CODE)[1:] if "sfx: 'hit'" in b}
DUR = json.loads((ROOT / "public" / "audio" / EP / "durations.json").read_text())
LENS = [round((DUR[i] + PAD) * FPS) for i, _ in SHOTS]
STARTS = [sum(LENS[:k]) for k in range(len(LENS))]
TOTAL = sum(LENS)

def hx(c):
    c = c.lstrip("#"); return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))

INK, WHITE, YEL, RED, GRN, BLU = hx("#0c0a14"), hx("#ffffff"), hx("#ffd84a"), hx("#ff4a5e"), hx("#1f9a4a"), hx("#2a5ac8")
_fonts = {}
def font(sz):
    if sz not in _fonts:
        _fonts[sz] = ImageFont.truetype(FONT, sz)
    return _fonts[sz]

def text(d, xy, s, sz=14, fill=WHITE, stroke=2, anchor="mm"):
    d.fontmode = "1"
    d.text(xy, s, font=font(sz), fill=fill, stroke_width=stroke, stroke_fill=INK, anchor=anchor)

def ease(k):
    k = max(0.0, min(1.0, k)); return k * k * (3 - 2 * k)

def pop(f, at):
    s = f - at
    return 0 if s < 0 else (0.6 if s == 0 else (1.15 if s == 1 else 1))

def box(d, x0, y0, x1, y1, fill, ol=INK, w=2):
    d.rectangle([x0, y0, x1, y1], fill=fill, outline=ol, width=w)

# ================================================================ bandeiras em pixel
def flag(img, cc, x, y, w, h, wave=0.0, t=0):
    f = Image.new("RGB", (w, h), WHITE)
    d = ImageDraw.Draw(f)
    if cc == "BR":
        d.rectangle([0, 0, w, h], fill=GRN)
        d.polygon([(w // 2, h // 9), (w - w // 10, h // 2), (w // 2, h - h // 9), (w // 10, h // 2)], fill=YEL)
        r = h // 4
        d.ellipse([w // 2 - r, h // 2 - r, w // 2 + r, h // 2 + r], fill=hx("#1e3a8c"))
        d.arc([w // 2 - r - 2, h // 2 - r // 3, w // 2 + r + 2, h // 2 + r * 2], 200, 340, fill=WHITE, width=max(1, h // 30))
        for k in range(7):
            d.point((w // 2 - r // 2 + (k * 37) % r, h // 2 + (k * 53) % (r // 1 + 1) - r // 4), fill=WHITE)
    elif cc == "JP":
        r = h * 3 // 10
        d.ellipse([w // 2 - r, h // 2 - r, w // 2 + r, h // 2 + r], fill=hx("#c8102e"))
    elif cc == "CH":
        d.rectangle([0, 0, w, h], fill=hx("#d52b1e"))
        a, b = h // 6, h // 2 - h // 12
        d.rectangle([w // 2 - a // 2 - 1, h // 2 - b // 1 + h // 12, w // 2 + a // 2, h // 2 + b - h // 12], fill=WHITE)
        d.rectangle([w // 2 - b + h // 12, h // 2 - a // 2 - 1, w // 2 + b - h // 12, h // 2 + a // 2], fill=WHITE)
    elif cc == "NO":
        d.rectangle([0, 0, w, h], fill=hx("#ba0c2f"))
        cx = w * 6 // 16
        d.rectangle([cx - h // 6, 0, cx + h // 6, h], fill=WHITE); d.rectangle([0, h // 2 - h // 6, w, h // 2 + h // 6], fill=WHITE)
        d.rectangle([cx - h // 12, 0, cx + h // 12, h], fill=hx("#00205b")); d.rectangle([0, h // 2 - h // 12, w, h // 2 + h // 12], fill=hx("#00205b"))
    elif cc == "KR":
        r = h // 5
        d.pieslice([w // 2 - r, h // 2 - r, w // 2 + r, h // 2 + r], 180, 360, fill=hx("#cd2e3a"))
        d.pieslice([w // 2 - r, h // 2 - r, w // 2 + r, h // 2 + r], 0, 180, fill=hx("#0047a0"))
        for sx, sy in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
            d.rectangle([w // 2 + sx * w * 3 // 10 - 3, h // 2 + sy * h * 3 // 10 - 3, w // 2 + sx * w * 3 // 10 + 3, h // 2 + sy * h * 3 // 10 + 3], fill=INK)
    elif cc == "DE":
        for i, c in enumerate(("#000000", "#dd0000", "#ffce00")):
            d.rectangle([0, i * h // 3, w, (i + 1) * h // 3], fill=hx(c))
    if wave:
        g = Image.new("RGBA", (w, h + 8), (0, 0, 0, 0))
        for cx in range(w):
            dy = int(round(math.sin(cx / max(4, w / 5) - t * 0.7) * wave))
            col = f.crop((cx, 0, cx + 1, h))
            shade = 0.82 + 0.18 * math.cos(cx / max(4, w / 5) - t * 0.7)
            col = col.point(lambda v: int(v * shade))
            g.paste(col, (cx, 4 + dy))
        img.paste(g, (x, y - 4), g)
        ImageDraw.Draw(img).line([(x - 2, y - 6), (x - 2, y + h + 30)], fill=hx("#c8c8d0"), width=2)
    else:
        img.paste(f, (x, y))
        ImageDraw.Draw(img).rectangle([x - 1, y - 1, x + w, y + h], outline=INK)

# ================================================================ fundo e elementos
STARS = [(int((i * 97) % W), int((i * 211) % 300), i % 3) for i in range(40)]
def background(img, top, bot, t):
    d = ImageDraw.Draw(img)
    for y in range(H):
        k = y / H
        c = tuple(int(top[i] * (1 - k) + bot[i] * k) for i in range(3))
        # dither: listras alternadas na transição (cara de 16 bits)
        if (y // 2) % 2 and 0.2 < k < 0.8:
            c = tuple(min(255, v + 6) for v in c)
        d.line([(0, y), (W, y)], fill=c)
    for x, y, s in STARS:
        if (t // 6 + s) % 3:
            d.point((x, y), fill=(255, 255, 255))

def coin(d, x, y, t, sz=7):
    w = max(1, int(abs(math.cos(t * 0.5 + x)) * sz))
    d.ellipse([x - w, y - sz, x + w, y + sz], fill=YEL, outline=INK)
    if w > 2:
        d.line([(x, y - sz + 3), (x, y + sz - 3)], fill=hx("#d8a818"))

def drop(d, x, y, s, lvl):
    pts = [(x, y - 2 * s)] + [(x + int(math.sin(a) * s), y + int(-math.cos(a) * s)) for a in np.linspace(math.pi * 0.35, math.pi * 1.65, 20)]
    d.polygon(pts, fill=hx("#2a7ae8"), outline=INK)
    d.line([(x - s // 2, y - s // 3), (x - s // 3, y + s // 3)], fill=hx("#b8e4ff"), width=3)

def bar(d, x, y, w, val, vmax, col, label, cc, img, f, at):
    k = ease((f - at) / 10)
    ln = int(w * val / vmax * k)
    flag(img, cc, x, y, 22, 14)
    box(d, x + 26, y, x + 26 + max(2, ln), y + 14, col)
    if k > 0.3:
        text(d, (x + 30 + ln, y + 7), label, 10, WHITE, 2, "lm")

# ================================================================ cenas (f = quadro local a 12 qps)
SCENE_Y0, SCENE_Y1 = 74, 270
PAPER, SEPIA = hx("#e8d8b0"), hx("#6a4a2a")

def uk_flag(img, x, y, w, h):
    f = Image.new("RGB", (w, h), hx("#012169")); d = ImageDraw.Draw(f)
    d.line([(0, 0), (w, h)], fill=WHITE, width=h // 5); d.line([(0, h), (w, 0)], fill=WHITE, width=h // 5)
    d.line([(0, 0), (w, h)], fill=hx("#c8102e"), width=h // 12); d.line([(0, h), (w, 0)], fill=hx("#c8102e"), width=h // 12)
    d.rectangle([w // 2 - h // 6, 0, w // 2 + h // 6, h], fill=WHITE); d.rectangle([0, h // 2 - h // 6, w, h // 2 + h // 6], fill=WHITE)
    d.rectangle([w // 2 - h // 10, 0, w // 2 + h // 10, h], fill=hx("#c8102e")); d.rectangle([0, h // 2 - h // 10, w, h // 2 + h // 10], fill=hx("#c8102e"))
    img.paste(f, (x, y)); ImageDraw.Draw(img).rectangle([x - 1, y - 1, x + w, y + h], outline=INK)

def pt_flag(img, x, y, w, h):
    f = Image.new("RGB", (w, h), hx("#da291c")); d = ImageDraw.Draw(f)
    d.rectangle([0, 0, w * 2 // 5, h], fill=hx("#046a38"))
    r = h // 4; d.ellipse([w * 2 // 5 - r, h // 2 - r, w * 2 // 5 + r, h // 2 + r], fill=YEL, outline=INK)
    img.paste(f, (x, y)); ImageDraw.Draw(img).rectangle([x - 1, y - 1, x + w, y + h], outline=INK)

def factory(d, x, y, s=1.0, col=hx("#8a8aa8")):
    box(d, x, y - int(40 * s), x + int(70 * s), y, col)
    box(d, x + int(50 * s), y - int(70 * s), x + int(62 * s), y - int(40 * s), hx("#6a6a88"))
    for i in range(3):
        d.rectangle([x + 8 + i * int(20 * s), y - int(30 * s), x + 16 + i * int(20 * s), y - int(20 * s)], fill=YEL)

def gold(d, x, y):
    d.polygon([(x, y), (x + 18, y), (x + 22, y + 8), (x - 4, y + 8)], fill=YEL, outline=INK)
    d.line([(x + 2, y + 2), (x + 10, y + 2)], fill=WHITE)

def year_card(d, f, year, cons, n):
    k = pop(f, 0)
    if k:
        box(d, 70, 80, 200, 112, PAPER, INK, 3)
        text(d, (135, 96), year, 22, SEPIA, 0)
    if f >= int(n * 0.55):  # a consequência aparece na 2ª metade da fala
        box(d, 14, 228, 256, 264, hx("#2a0a10"), RED, 2)
        text(d, (135, 238), "CONSEQUÊNCIA", 9, RED, 0)
        text(d, (135, 254), cons, 11, WHITE, 1)

def s_gancho(img, d, f, n):
    flag(img, "BR", 55, 96, 160, 108, wave=4, t=f)
    for i in range(5):
        if f >= 6 + i * 4:
            box(d, 22 + i * 46, 220, 58 + i * 46, 252, PAPER, INK, 2)
            text(d, (40 + i * 46, 236), str(i + 1), 16, SEPIA, 0)

def s_f1703(img, d, f, n):
    year_card(d, f, "1703", "nosso ouro virou fábrica inglesa", n)
    flag(img, "BR", 16, 140, 48, 32); pt_flag(img, 110, 140, 48, 32); uk_flag(img, 204, 140, 48, 32)
    t = (f % 24) / 24
    x = int(40 + t * 190)
    gold(d, x, 186)
    text(d, (88, 205), "→", 16, YEL, 0); text(d, (182, 205), "→", 16, YEL, 0)

def s_f1785(img, d, f, n):
    year_card(d, f, "1785", "só exportar matéria-prima", n)
    factory(d, 95, 210, 1.1)
    if f >= 10:
        d.line([(80, 130), (190, 214)], fill=RED, width=6); d.line([(190, 130), (80, 214)], fill=RED, width=6)
        box(d, 172, 120, 260, 138, PAPER); text(d, (216, 129), "PROIBIDO", 10, RED, 0)

def s_f1810(img, d, f, n):
    year_card(d, f, "1810", "a indústria daqui nasceu fraca", n)
    # navio inglês chegando
    sx = int(260 - min(1, f / 30) * 160)
    d.polygon([(sx, 196), (sx + 70, 196), (sx + 60, 214), (sx + 8, 214)], fill=hx("#6a3a1a"), outline=INK)
    d.line([(sx + 34, 196), (sx + 34, 150)], fill=INK, width=2)
    d.polygon([(sx + 36, 152), (sx + 60, 176), (sx + 36, 186)], fill=WHITE, outline=INK)
    uk_flag(img, sx + 14, 150, 18, 12)
    for i in range(4):
        d.line([(0, 218 + i * 3), (W, 218 + i * 3)], fill=hx("#2a6aa8") if i % 2 else hx("#3a8ae8"))
    box(d, 16, 130, 84, 160, PAPER); text(d, (50, 145), "IMPOSTO", 9, SEPIA, 0)
    text(d, (50, 176), "15%", 18, GRN, 2)

def s_f1888(img, d, f, n):
    year_card(d, f, "1888", "a desigualdade que existe até hoje", n)
    # corrente quebrada
    for i in range(6):
        x = 50 + i * 30 + (8 if i >= 3 and f >= 8 else 0)
        d.ellipse([x, 150, x + 26, 170], outline=hx("#b8bcc8"), width=4)
    if f >= 8:
        text(d, (135, 132), "ABOLIÇÃO", 12, YEL)
    if f >= 26:
        for i, lab in enumerate(("SEM TERRA", "SEM ESCOLA")):
            box(d, 24 + i * 120, 184, 126 + i * 120, 206, hx("#2a0a10"), RED)
            text(d, (75 + i * 120, 195), lab, 10, RED, 0)

def s_f1993(img, d, f, n):
    year_card(d, f, "ANOS 80", "duas décadas perdidas", n)
    k = ease(f / 30)
    pts = [(30 + i * 25, 214 - int((i / 8) ** 3 * 90 * k)) for i in range(9)]
    d.line(pts, fill=RED, width=4)
    d.line([(26, 216), (240, 216)], fill=hx("#6a6a88"), width=2)
    text(d, (190, 140), f"{int(2000 * k)}%", 18, RED, 2)
    text(d, (190, 160), "INFLAÇÃO/ANO", 9, WHITE, 1)

def s_moral(img, d, f, n):
    d.rectangle([0, 200, W, SCENE_Y1], fill=hx("#5a3a24"))
    for i in range(10):
        x, y = 20 + i * 25, 214 + (i * 13) % 44
        c = [YEL, hx("#6ab8ff"), hx("#ff6ac1"), hx("#3ddc84")][i % 4]
        d.polygon([(x, y), (x + 5, y - 5), (x + 10, y), (x + 5, y + 5)], fill=c, outline=INK)
    d.line([(0, 200), (W, 200)], fill=GRN, width=4)
    for i, lab in enumerate(("FÁBRICA", "ESCOLA", "ESTABILIDADE")):
        if f >= 4 + i * 6:
            box(d, 14 + i * 84, 110, 92 + i * 84, 134, hx("#22223a"))
            text(d, (53 + i * 84, 122), lab, 9, WHITE, 0)
            d.line([(20 + i * 84, 114), (86 + i * 84, 130)], fill=RED, width=2)

def s_cta(img, d, f, n):
    text(d, (135, 90), "QUAL MAIS ATRASOU O BRASIL?", 12, YEL)
    opts = [("1703", "OURO PRA INGLATERRA"), ("1785", "FÁBRICAS PROIBIDAS"), ("1810", "IMPOSTO INGLÊS"), ("1888", "DESIGUALDADE"), ("80s", "INFLAÇÃO")]
    for i, (y_, lab) in enumerate(opts):
        if f >= 3 + i * 3:
            y = 104 + i * 30
            box(d, 20, y, 250, y + 24, PAPER, INK, 2)
            text(d, (48, y + 12), y_, 12, SEPIA, 0)
            text(d, (164, y + 12), lab, 10, INK, 0)
    if f >= 22:
        text(d, (135, 262), "COMENTA O ANO", 12, WHITE)

SCENES = {"gancho": s_gancho, "f1703": s_f1703, "f1785": s_f1785, "f1810": s_f1810, "f1888": s_f1888, "f1993": s_f1993, "moral": s_moral, "cta": s_cta}
BG = {"gancho": ("#0e3a24", "#0a1a14"), "f1703": ("#3a2a0a", "#140e04"), "f1785": ("#2a1a2a", "#0e080e"), "f1810": ("#0a2a4a", "#04101a"),
      "f1888": ("#3a0a1a", "#14040a"), "f1993": ("#3a1010", "#140606"), "moral": ("#0a2a3a", "#040e14"), "cta": ("#2a1a10", "#0e0806")}

# ================================================================ legendas e título
def tokens(t):
    out, mode = [], "w"
    for raw in t.split():
        word, wm = "", mode
        for ch in raw:
            if ch == "*":
                mode = "y" if mode != "y" else "w"; wm = mode if not word else wm
            elif ch == "!":
                mode = "r" if mode != "r" else "w"; wm = mode if not word else wm
            else:
                word += ch
        out.append((word, wm))
    return out

def pages(toks):
    out, cur = [], []
    for w, c in toks:
        cur.append((w, c))
        if re.search(r"[.,?!:]$", w) or len(cur) >= 3 or (len(cur) == 2 and len(w) > 7):
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    return out

COL = {"w": WHITE, "y": YEL, "r": RED}
def captions(d, txt, f, n):
    tk = tokens(txt); pg = pages(tk)
    speak = n - 4
    acc, page = 0, len(pg) - 1
    for i, p in enumerate(pg):
        ln = len(p) / len(tk) * speak
        if f - 1 < acc + ln:
            page = i; break
        acc += ln
    words = pg[page]
    sz = 21
    while True:  # encolhe até caber na largura (com margem)
        widths = [d.textlength(w.upper(), font=font(sz)) for w, _ in words]
        if sum(widths) + 6 * (len(words) - 1) <= W - 20 or sz <= 12:
            break
        sz -= 1
    x = (W - (sum(widths) + 6 * (len(words) - 1))) / 2
    for (w, c), wd in zip(words, widths):
        text(d, (x, 296), w.upper(), sz, COL[c], 3, "lm")
        x += wd + 6

# ================================================================ avatar
AV = {}
def avatar(expr):
    if expr not in AV:
        AV[expr] = build("imperio", expr).resize((160, 160), Image.NEAREST)
    return AV[expr]

def load_mono(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32)

# ================================================================ quadro
def frame(gi, voice_rms):
    k = next(i for i in range(len(SHOTS)) if gi < STARTS[i] + LENS[i])
    sid, txt = SHOTS[k]
    f, n = gi - STARTS[k], LENS[k]
    img = Image.new("RGB", (W, H))
    background(img, hx(BG[sid][0]), hx(BG[sid][1]), gi)
    d = ImageDraw.Draw(img)
    d.fontmode = "1"
    # título fixo
    box(d, 8, 18, 262, 62, hx("#0c0a14"), YEL, 2)
    text(d, (135, 32), "5 FATOS QUE IMPEDIRAM", 14, WHITE)
    text(d, (135, 50), "O BRASIL DE SER RICO", 14, YEL)
    # palco da cena
    d.rectangle([6, SCENE_Y0 - 2, W - 7, SCENE_Y1 + 2], outline=hx("#3a3a5a"), width=2)
    SCENES[sid](img, d, f, n)
    captions(d, txt, f, n)
    # avatar apresentador (boca segue a voz; pisca a cada ~3 s)
    expr = "blink" if gi % 38 in (0, 1) else ("talk" if voice_rms[gi] > 0.035 and gi % 2 == 0 else "neutral")
    av = avatar(expr)
    bob = 1 if (gi // 6) % 2 else 0
    img.paste(av, (-8, H - 160 + bob), av)
    box(d, 150, H - 34, 264, H - 14, hx("#0c0a14"), GRN, 2)
    text(d, (207, H - 24), "SEGUE PRA PARTE 2", 9, YEL, 0) if sid == "cta" else text(d, (207, H - 24), f"{gi * 100 // TOTAL:>3}%  ▶", 9, WHITE, 0)
    # transição: varredura de pixels nos 2 primeiros quadros de cada cena
    if k > 0 and f < 2:
        for y in range(0, H, 6):
            if (y // 6 + f) % 2 == 0:
                d.rectangle([0, y, W, y + 5], fill=YEL if sid in HITS else WHITE)
    return img

# ================================================================ áudio
def build_audio(path):
    total_s = TOTAL / FPS + 0.5
    mix = np.zeros(int(total_s * SR), np.float32)
    voice = np.zeros_like(mix)
    for k, (sid, _) in enumerate(SHOTS):
        a = load_mono(ROOT / "public" / "audio" / EP / "shots" / f"{k:02d}.mp3")
        i = int(STARTS[k] / FPS * SR)
        voice[i:i + len(a)] += a[: len(voice) - i]
    # trilha 8-bit (onda quadrada + triangular + ruído), 112 bpm, Dó maior animado
    bpm = 112; step = 60 / bpm / 2
    t = np.arange(len(mix)) / SR
    mel = [72, 76, 79, 76, 74, 77, 81, 77, 72, 76, 79, 84, 83, 79, 76, 74]
    bas = [48, 48, 53, 53, 55, 55, 48, 48]
    music = np.zeros_like(mix)
    def sq(fr, n, duty=0.5):
        tt = np.arange(n) / SR
        return np.where((tt * fr) % 1 < duty, 1.0, -1.0) * np.exp(-tt * 5)
    def tri(fr, n):
        tt = np.arange(n) / SR
        return (2 * np.abs(2 * ((tt * fr) % 1) - 1) - 1) * np.exp(-tt * 2)
    nst = int(total_s / step)
    for s in range(nst):
        i = int(s * step * SR); n = int(step * SR)
        if i + n > len(music):
            break
        note = mel[s % len(mel)]
        music[i:i + n] += 0.12 * sq(440 * 2 ** ((note - 69) / 12), n, 0.25)
        if s % 2 == 0:
            b = bas[(s // 2) % len(bas)]
            music[i:i + 2 * n] += 0.2 * tri(440 * 2 ** ((b - 69) / 12), 2 * n)[: len(music[i:i + 2 * n])]
        if s % 4 == 0:  # bumbo
            kk = np.arange(int(0.12 * SR)) / SR
            music[i:i + len(kk)] += 0.35 * np.sin(2 * np.pi * (120 * np.exp(-kk * 30) + 40) * kk) * np.exp(-kk * 18)
        if s % 4 == 2:  # caixa (ruído)
            m = int(0.08 * SR)
            music[i:i + m] += 0.08 * np.random.default_rng(s).standard_normal(m) * np.exp(-np.arange(m) / SR * 40)
    # ducking: música abaixa quando tem voz
    env = np.convolve(np.abs(voice), np.ones(2205) / 2205, mode="same")
    duck = 1 - 0.55 * np.clip(env / 0.03, 0, 1)
    mix = voice * 1.0 + music * 0.5 * duck
    # efeitos: moedinha 8-bit no começo de cada cena, golpe nas viradas
    for k, (sid, _) in enumerate(SHOTS):
        i = int(STARTS[k] / FPS * SR)
        n = int(0.16 * SR); tt = np.arange(n) / SR
        blip = np.where((tt * np.where(tt < 0.05, 988, 1319)) % 1 < 0.5, 1, -1) * np.exp(-tt * 12) * 0.18
        if sid in HITS:
            m = int(0.4 * SR); tm = np.arange(m) / SR
            blip = np.concatenate([np.sin(2 * np.pi * (180 * np.exp(-tm * 8) + 40) * tm) * np.exp(-tm * 6) * 0.5, np.zeros(0)])
        mix[i:i + len(blip)] += blip[: len(mix) - i]
    mix = mix / max(1e-6, np.abs(mix).max()) * 0.9
    with wave.open(str(path), "wb") as wv:
        wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR)
        wv.writeframes((mix * 32767).astype("<i2").tobytes())
    # energia da voz por quadro (para a boca do avatar)
    per = SR // FPS
    return [float(np.sqrt(np.mean(voice[j * per:(j + 1) * per] ** 2))) if j * per < len(voice) else 0 for j in range(TOTAL)]

if __name__ == "__main__":
    out = ROOT / "out"; out.mkdir(exist_ok=True)
    tmp = ROOT / "pixel" / "_frames"; tmp.mkdir(exist_ok=True)
    wav = ROOT / "pixel" / "_mix.wav"
    rms = build_audio(wav)
    if len(sys.argv) > 2 and sys.argv[1] == "--frames":
        for gi in map(int, sys.argv[2].split(",")):
            frame(gi, rms).resize((W * 2, H * 2), Image.NEAREST).save(tmp / f"check_{gi:04d}.png")
        print("ok checks"); sys.exit()
    for f in tmp.glob("*.png"):
        f.unlink()
    for gi in range(TOTAL):
        frame(gi, rms).resize((W * S, H * S), Image.NEAREST).save(tmp / f"{gi:05d}.png")
    dst = out / "brasil-5-fatos.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(tmp / "%05d.png"), "-i", str(wav),
                    "-vf", f"fps={OUTFPS}", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                    "-af", "loudnorm=I=-14:TP=-1.5", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(dst)], check=True)
    print("ok", dst, TOTAL / FPS, "s")
