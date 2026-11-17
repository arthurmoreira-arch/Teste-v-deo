#!/usr/bin/env python3
"""Episódio 12 em pixel art: "Por que o Brasil não é rico?"
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
EP = "ep12"
PAD = 0.35
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

def s_gancho(img, d, f, n):
    flag(img, "BR", 55, 100, 160, 108, wave=4, t=f)
    for i in range(6):
        if f >= 6 + i * 3:
            a = i / 6 * math.pi * 2 + f * 0.05
            coin(d, int(135 + math.cos(a) * 115), int(156 + math.sin(a) * 82), f + i)

def s_agua(img, d, f, n):
    drop(d, 135, 175, 46, 0)
    k = ease(f / 14)
    text(d, (135, 175), f"{int(12 * k)}%", 26, WHITE, 3)
    text(d, (135, 250), "DA ÁGUA DOCE DO MUNDO", 12, hx("#b8e4ff"))
    for i in range(8):
        x = (i * 41 + f * 3) % W
        d.line([(x, 262), (x + 14, 262)], fill=hx("#6ab8ff"), width=2)

def s_minerio(img, d, f, n):
    for i in range(14):  # monte de minério
        x, y = 70 + (i * 23) % 130, 230 - (i * 7) % 40
        d.polygon([(x, y), (x + 14, y - 10), (x + 26, y), (x + 18, y + 10), (x + 4, y + 10)], fill=hx("#9a4a2a") if i % 3 else hx("#c86a3a"), outline=INK)
    ang = math.sin(f * 0.7) * 0.6
    cx, cy = 200, 160
    hx_, hy = cx + int(math.cos(ang - 2.2) * 40), cy + int(math.sin(ang - 2.2) * 40)
    d.line([(cx + 30, cy + 40), (hx_, hy)], fill=hx("#7a4a2a"), width=5)
    d.polygon([(hx_ - 18, hy - 4), (hx_ + 18, hy - 10), (hx_ + 4, hy + 6)], fill=hx("#c8ccd4"), outline=INK)
    if f >= 20:
        k = pop(f, 20)
        box(d, 18, 92, 140, 128, hx("#2a2a44"))
        text(d, (79, 110), "90% DO NIÓBIO", 12, YEL)
    if f % 8 < 2:
        for i in range(4):
            d.point((150 + i * 5, 200 - i * 3), fill=YEL)

def s_comida(img, d, f, n):
    # saco de café
    box(d, 40, 140, 120, 240, hx("#b88a52"))
    text(d, (80, 185), "CAFÉ", 14, INK, 0)
    for i in range(6):
        d.ellipse([52 + i * 10, 124 - (i % 2) * 4, 60 + i * 10, 134 - (i % 2) * 4], fill=hx("#4a2a18"), outline=INK)
    # soja
    for i in range(5):
        y = 130 + i * 22
        d.ellipse([160, y, 230, y + 18], fill=hx("#7ab84a"), outline=INK)
        for k in range(3):
            d.ellipse([170 + k * 18, y + 4, 180 + k * 18, y + 14], fill=hx("#b8e070"))
    for x, at in ((80, 10), (195, 18)):
        if f >= at:
            box(d, x - 30, 96, x + 30, 116, YEL)
            text(d, (x, 106), "Nº 1", 12, INK, 0)

def s_virada(img, d, f, n):
    text(d, (135, 92), "RENDA POR PESSOA / ANO", 11, YEL)
    rows = [("BR", 10, "US$ 10 mil", RED), ("JP", 33, "US$ 33 mil", hx("#e8e8f0")), ("KR", 34, "US$ 34 mil", hx("#9ab8ff")), ("NO", 90, "US$ 90 mil", hx("#ff8a8a")), ("CH", 100, "US$ 100 mil", hx("#ff6a6a"))]
    for i, (cc, v, lab, col) in enumerate(rows):
        bar(d, 12, 110 + i * 30, 150, v, 100, col, lab, cc, img, f, 4 + i * 5)
    text(d, (135, 262), "valores aproximados · FMI 2024", 8, hx("#b0b0c8"), 1)

def s_japao(img, d, f, n):
    flag(img, "JP", 30, 104, 96, 64, wave=2, t=f)
    # carrinho de mina vazio
    box(d, 160, 190, 240, 226, hx("#6a6a7a"))
    d.ellipse([168, 222, 184, 238], fill=INK); d.ellipse([216, 222, 232, 238], fill=INK)
    text(d, (200, 176), "VAZIO", 11, hx("#c8c8d8"))
    if f >= 18:
        text(d, (78, 205), "3x", 34, YEL, 3)
        text(d, (78, 236), "MAIS RICO", 11, YEL)
    flag(img, "BR", 196, 100, 48, 32)

def s_segredo(img, d, f, n):
    k = (f % 30) / 30
    # linha 1: minério sai barato
    flag(img, "BR", 10, 108, 30, 20)
    x = int(50 + k * 160)
    d.polygon([(x, 122), (x + 12, 112), (x + 24, 122), (x + 16, 130), (x + 4, 130)], fill=hx("#9a4a2a"), outline=INK)
    d.line([(46, 136), (240, 136)], fill=hx("#c8c8d8"), width=2)
    box(d, 214, 100, 262, 120, GRN); text(d, (238, 110), "$", 14, WHITE, 0)
    text(d, (135, 150), "VENDE BARATO", 13, GRN)
    # linha 2: celular volta caro
    flag(img, "BR", 10, 196, 30, 20)
    x2 = int(220 - k * 160)
    box(d, x2, 186, x2 + 16, 214, INK, hx("#c8c8d8")); d.rectangle([x2 + 3, 190, x2 + 13, 208], fill=hx("#6ab8ff"))
    d.line([(46, 220), (240, 220)], fill=hx("#c8c8d8"), width=2)
    box(d, 196, 230, 262, 250, RED); text(d, (229, 240), "$$$$", 12, WHITE, 0)
    text(d, (100, 240), "COMPRA CARO", 13, RED)

def s_cafe(img, d, f, n):
    flag(img, "DE", 24, 100, 72, 48, wave=2, t=f)
    text(d, (60, 166), "NÃO PLANTA", 10, WHITE)
    # grãos -> pacote torrado
    for i in range(5):
        d.ellipse([22 + i * 14, 196, 32 + i * 14, 208], fill=hx("#6a8a3a"), outline=INK)
    t = ease((f - 8) / 14)
    ax = int(98 + t * 40)
    d.polygon([(98, 202), (ax, 202), (ax, 196), (ax + 10, 204), (ax, 212), (ax, 206), (98, 206)], fill=YEL, outline=INK)
    box(d, 168, 150, 248, 240, hx("#3a2418"))
    text(d, (208, 180), "CAFÉ", 13, YEL, 0)
    text(d, (208, 198), "TORRADO", 9, WHITE, 0)
    if f >= 18:
        text(d, (208, 222), "$$$", 14, GRN, 2)

def s_causas(img, d, f, n):
    items = [("📚", "EDUCAÇÃO FRACA", hx("#6ab8ff")), ("⚖", "DESIGUALDADE", hx("#ff8a8a")), ("📄", "BUROCRACIA", hx("#e8e8f0")), ("%", "IMPOSTOS", YEL)]
    per = max(6, n // 5)
    for i, (_, lab, col) in enumerate(items):
        if f >= 2 + i * per:
            y = 100 + i * 40
            box(d, 24, y, 246, y + 30, hx("#22223a"))
            d.rectangle([30, y + 6, 48, y + 24], fill=col, outline=INK)
            d.line([(32, y + 8), (46, y + 22)], fill=INK, width=2); d.line([(46, y + 8), (32, y + 22)], fill=INK, width=2)
            text(d, (60, y + 15), lab, 13, col, 2, "lm")

def s_moral(img, d, f, n):
    d.rectangle([0, 200, W, SCENE_Y1], fill=hx("#5a3a24"))
    for i in range(10):
        x, y = 20 + i * 25, 214 + (i * 13) % 44
        c = [YEL, hx("#6ab8ff"), hx("#ff6ac1"), hx("#3ddc84")][i % 4]
        d.polygon([(x, y), (x + 5, y - 5), (x + 10, y), (x + 5, y + 5)], fill=c, outline=INK)
    d.line([(0, 200), (W, 200)], fill=GRN, width=4)
    k = ease((f - 8) / 18)
    hgt = int(70 * k)
    if hgt > 0:
        box(d, 100, 198 - hgt, 170, 198, hx("#8a8aa8"))
        box(d, 150, 198 - hgt - 26, 162, 198 - hgt, hx("#6a6a88"))
        for i in range(3):
            if hgt > 20:
                d.rectangle([108 + i * 20, 198 - hgt + 10, 118 + i * 20, 198 - hgt + 20], fill=YEL)
        if f % 6 < 3:
            d.ellipse([150, 198 - hgt - 44 - (f % 6) * 3, 164, 198 - hgt - 32 - (f % 6) * 3], fill=hx("#d8d8e8"))

def s_cta(img, d, f, n):
    text(d, (135, 92), "QUAL É O MAIOR PROBLEMA?", 13, YEL)
    opts = [("A", "EDUCAÇÃO", hx("#ffd84a")), ("B", "CORRUPÇÃO", hx("#ff4a6a")), ("C", "IMPOSTOS", hx("#28c8ff")), ("D", "DESIGUALDADE", hx("#3ddc84"))]
    for i, (l, lab, col) in enumerate(opts):
        if f >= 4 + i * 4:
            y = 108 + i * 36
            box(d, 22, y, 248, y + 28, col, INK, 3)
            text(d, (40, y + 14), l, 16, INK, 0)
            text(d, (140, y + 14), lab, 14, INK, 0)
    if f >= 24:
        text(d, (135, 258), "COMENTA A LETRA", 12, WHITE)

SCENES = {"gancho": s_gancho, "agua": s_agua, "minerio": s_minerio, "comida": s_comida, "virada": s_virada, "japao": s_japao,
          "segredo": s_segredo, "cafe": s_cafe, "causas": s_causas, "moral": s_moral, "cta": s_cta}
BG = {"gancho": ("#0e3a24", "#0a1a14"), "agua": ("#0a2a5a", "#06142a"), "minerio": ("#3a1a10", "#140806"), "comida": ("#2a3a10", "#101806"),
      "virada": ("#3a0a1a", "#14040a"), "japao": ("#2a1a2a", "#0e080e"), "segredo": ("#101a3a", "#060a18"), "cafe": ("#2a1a10", "#0e0806"),
      "causas": ("#1a1030", "#08060e"), "moral": ("#0a2a3a", "#040e14"), "cta": ("#0e3a24", "#0a1a14")}

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
        AV[expr] = build("brasil", expr).resize((160, 160), Image.NEAREST)
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
    text(d, (135, 32), "POR QUE O BRASIL", 15, WHITE)
    text(d, (135, 50), "NÃO É RICO?", 15, YEL)
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
    text(d, (207, H - 24), "SEGUE PRA MAIS", 9, YEL, 0) if sid == "cta" else text(d, (207, H - 24), f"{gi * 100 // TOTAL:>3}%  ▶", 9, WHITE, 0)
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
    dst = out / "brasil-rico.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(tmp / "%05d.png"), "-i", str(wav),
                    "-vf", f"fps={OUTFPS}", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                    "-af", "loudnorm=I=-14:TP=-1.5", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(dst)], check=True)
    print("ok", dst, TOTAL / FPS, "s")
