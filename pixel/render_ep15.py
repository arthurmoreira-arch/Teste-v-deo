#!/usr/bin/env python3
"""Episódio 15 em pixel art: "Viajei no tempo… PARTE 2" — com explicação, analogias, ligação com hoje e quiz.
Uso: python3 pixel/render_ep15.py [--frames 0,40,90]
"""
import json, math, pathlib, re, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "avatar")); sys.path.insert(0, str(ROOT / "pixel"))
from render_ep12 import INK, WHITE, YEL, RED, GRN, hx, text, box, flag, ease, font, tokens, pages, COL  # noqa: E402
from render_ep13 import uk_flag, pt_flag, factory, gold  # noqa: E402
from render_ep14 import av, put_avatar, bubble, room, portal, sea, workshop, PAPER, SEPIA, load_mono  # noqa: E402

W, H, S, FPS, OUTFPS, SR = 270, 480, 4, 12, 30, 44100
EP = "ep15"
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
RMS = [0.0] * TOTAL
TODAY = {"recap", "hoje", "quiz", "resposta", "moral", "cta"}

def talk(gi):
    return "talk" if RMS[gi] > 0.03 and (gi // 1) % 2 == 0 else ("blink" if gi % 40 in (0, 1) else "neutral")

def outfit(sid):
    return "casual" if sid in TODAY else "imperio"

def person(d, x, y, col, s=1.0, sad=False):
    """Pessoinha pixel (16x28 * s)."""
    h = int(28 * s)
    d.ellipse([x - 5 * s, y - h, x + 5 * s, y - h + 10 * s], fill=hx("#c58a62"), outline=INK)
    d.rectangle([x - 6 * s, y - h + 10 * s, x + 6 * s, y - 8 * s], fill=col, outline=INK)
    d.line([(x - 3 * s, y - 8 * s), (x - 3 * s, y)], fill=INK, width=max(1, int(2 * s)))
    d.line([(x + 3 * s, y - 8 * s), (x + 3 * s, y)], fill=INK, width=max(1, int(2 * s)))
    if sad:
        d.line([(x - 2 * s, y - h + 7 * s), (x + 2 * s, y - h + 7 * s)], fill=INK)

def mx_flag(img, x, y, w, h):
    f = Image.new("RGB", (w, h), WHITE); d = ImageDraw.Draw(f)
    d.rectangle([0, 0, w // 3, h], fill=hx("#006847")); d.rectangle([2 * w // 3, 0, w, h], fill=hx("#ce1126"))
    d.ellipse([w // 2 - 3, h // 2 - 3, w // 2 + 3, h // 2 + 3], fill=hx("#8a5a2a"))
    img.paste(f, (x, y)); ImageDraw.Draw(img).rectangle([x - 1, y - 1, x + w, y + h], outline=INK)

def pe_flag(img, x, y, w, h):
    f = Image.new("RGB", (w, h), WHITE); d = ImageDraw.Draw(f)
    d.rectangle([0, 0, w // 3, h], fill=hx("#d91023")); d.rectangle([2 * w // 3, 0, w, h], fill=hx("#d91023"))
    img.paste(f, (x, y)); ImageDraw.Draw(img).rectangle([x - 1, y - 1, x + w, y + h], outline=INK)

def year(d, y_, x=14, yy=18):
    box(d, x, yy, x + 96, yy + 32, PAPER, INK, 3); text(d, (x + 48, yy + 16), y_, 18, SEPIA, 0)

def dark(d, col="#14040a"):
    d.rectangle([0, 0, W, H], fill=hx(col))
    for r in range(6):
        d.ellipse([135 - 40 - r * 30, 200 - 40 - r * 30, 135 + 40 + r * 30, 200 + 40 + r * 30], outline=hx("#3a0a14"), width=2)

def fence(d, x0, x1, y):
    d.line([(x0, y - 10), (x1, y - 10)], fill=hx("#8a5a2a"), width=2); d.line([(x0, y - 4), (x1, y - 4)], fill=hx("#8a5a2a"), width=2)
    for x in range(x0, x1 + 1, 10):
        d.rectangle([x, y - 16, x + 2, y], fill=hx("#6a4428"))

# ================================================================ cenas
def sc_recap(img, d, f, n, sp, gi):
    room(img, d, f)
    box(d, 12, 20, 128, 120, hx("#0a1a3a"), YEL, 2); text(d, (70, 32), "PARTE 1", 10, YEL, 0)
    gold(d, 30, 70); text(d, (66, 74), "→", 14, YEL, 0); uk_flag(img, 80, 62, 36, 24)
    box(d, 142, 20, 258, 120, hx("#2a0a10"), YEL, 2); text(d, (200, 32), "PARTE 1", 10, YEL, 0)
    factory(d, 170, 104, 0.8); d.line([(160, 50), (240, 108)], fill=RED, width=4); d.line([(240, 50), (160, 108)], fill=RED, width=4)
    put_avatar(img, "casual", talk(gi), 135, 470, 5)

def sc_portal(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#0a0620")); portal(d, 135, 200, f)
    k = ease(f / n); a = av("casual", "blink", 4).rotate(k * 360, resample=Image.NEAREST)
    a = a.resize((max(4, int(a.width * (1 - 0.85 * k))), max(4, int(a.height * (1 - 0.85 * k)))), Image.NEAREST)
    img.paste(a, (int(135 - a.width / 2), int(200 + 160 * (1 - k) - a.height / 2)), a)
    if f >= n - 8:
        box(d, 70, 300, 200, 346, PAPER, INK, 3); text(d, (135, 323), "1810", 28, SEPIA, 0)

def royal_ship(d, x, y, crown=True, uk=None, img=None):
    d.polygon([(x, y), (x + 70, y), (x + 60, y + 18), (x + 10, y + 18)], fill=hx("#6a3a1a"), outline=INK)
    for k, mx in enumerate((22, 46)):
        d.line([(x + mx, y), (x + mx, y - 40)], fill=INK, width=2)
        d.polygon([(x + mx + 2, y - 38), (x + mx + 18, y - 22), (x + mx + 2, y - 12)], fill=WHITE, outline=INK)
    if crown:
        d.polygon([(x + 30, y - 52), (x + 34, y - 46), (x + 38, y - 52), (x + 42, y - 46), (x + 46, y - 52), (x + 46, y - 42), (x + 30, y - 42)], fill=YEL, outline=INK)
    if uk and img:
        uk_flag(img, x + 26, y - 56, 22, 14)

def sc_familia(img, d, f, n, sp, gi):
    sea(img, d, f); year(d, "1810")
    k = (f % 60) / 60
    royal_ship(d, int(20 + k * 120), 196, crown=True)
    royal_ship(d, int(-40 + k * 120), 230, crown=False, uk=True, img=img)
    royal_ship(d, int(90 + k * 120), 236, crown=False, uk=True, img=img)
    if f >= sp * 0.7:
        bubble(d, 200, 120, "UK", hx("#012169"))
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)

def sc_preco(img, d, f, n, sp, gi):
    dark(d)
    w = max(2, int(abs(math.cos(f * 0.3)) * 40))
    d.ellipse([135 - w, 120, 135 + w, 200], fill=YEL, outline=INK)
    if w > 14:
        text(d, (135, 160), "$", 30, hx("#a87a10"), 0)
    put_avatar(img, "imperio", "neutral", 135, 470, 6)

def sc_tratado(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#3a2a1a"))
    box(d, 24, 30, 246, 230, PAPER, INK, 3)
    text(d, (135, 48), "TRATADO DE 1810", 14, SEPIA, 0)
    text(d, (135, 66), "IMPOSTO PRA ENTRAR NO BRASIL", 8, SEPIA, 0)
    rows = [("UK", 15, hx("#2a5ac8")), ("PT", 16, hx("#1f9a4a")), ("??", 24, hx("#8a8aa8"))]
    for i, (cc, v, col) in enumerate(rows):
        y = 90 + i * 40
        if cc == "UK": uk_flag(img, 36, y, 30, 20)
        elif cc == "PT": pt_flag(img, 36, y, 30, 20)
        else: text(d, (51, y + 10), "OUTROS", 8, SEPIA, 0)
        k = ease((f - 4 - i * 6) / 10)
        ln = int(v * 5 * k)
        if ln > 0:
            box(d, 74, y + 2, 74 + ln, y + 18, col)
            text(d, (80 + ln + 16, y + 10), f"{v}%", 12, SEPIA, 0)
    if f >= 30:
        s = 1.4 if f < 32 else 1.0
        d.rectangle([150 - int(50 * s), 212 - int(12 * s), 150 + int(50 * s), 212 + int(12 * s)], fill=PAPER, outline=RED, width=4)
        text(d, (150, 212), "ASSINADO", int(14 * s), RED, 0)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)

def shop(d, x, y, w, h, name, col, price, closed=False):
    box(d, x, y, x + w, y + h, col)
    d.polygon([(x - 4, y), (x + w + 4, y), (x + w - 2, y - 14), (x + 2, y - 14)], fill=RED if not closed else hx("#6a6a74"), outline=INK)
    for i in range(0, w, 10):
        d.line([(x + i, y - 14), (x + i - 2, y)], fill=WHITE)
    box(d, x + 4, y + 6, x + w - 4, y + 22, PAPER); text(d, (x + w // 2, y + 14), name, 8, SEPIA, 0)
    box(d, x + 8, y + 30, x + w - 8, y + h - 4, hx("#6ab8ff") if not closed else hx("#3a3a44"))
    box(d, x + w - 34, y - 34, x + w + 6, y - 18, YEL if not closed else hx("#6a6a74")); text(d, (x + w - 14, y - 26), price, 9, INK, 0)
    if closed:
        box(d, x + 6, y + 40, x + w - 6, y + 58, RED); text(d, (x + w // 2, y + 49), "FECHADO", 10, WHITE, 0)

def sc_padaria(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#8ac8ff")); d.rectangle([0, 230, W, H], fill=hx("#b8a088"))
    closed = f >= int(sp * 0.85)
    shop(d, 18, 140, 90, 90, "PADARIA DO ZÉ", hx("#e8c890"), "R$3", closed)
    shop(d, 140, 96, 120, 134, "GIGANTE", hx("#c8c8d8"), "R$1")
    for i in range(6):  # clientes indo para o gigante
        x = int(40 + ((f * 2 + i * 30) % 120))
        person(d, x, 252 + (i % 2) * 6, [hx("#e85a5a"), hx("#5a8ae8"), hx("#5ac87a")][i % 3], 0.8)
    if f >= 14:
        box(d, 150, 30, 258, 52, hx("#2a5ac8")); text(d, (204, 41), "DESCONTO DO GOVERNO", 7, WHITE, 0)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)
    if closed:
        bubble(d, 120, 296, ":(", RED)

def sc_sufocada(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#5a5a64")); d.rectangle([0, 230, W, H], fill=hx("#3a3a44"))
    k = ease(f / (sp * 0.5)); dead = f > sp * 0.55
    factory(d, 100, 228, 1.0, hx("#8a8aa8") if not dead else hx("#4a4a54"))
    if not dead and f % 6 < 3:
        d.ellipse([150, 140 - (f % 6) * 3, 164, 152 - (f % 6) * 3], fill=hx("#d8d8e8"))
    if dead:
        box(d, 70, 120, 200, 150, RED); text(d, (135, 135), "SUFOCADA", 16, WHITE, 0)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)

def sc_rehook(img, d, f, n, sp, gi):
    dark(d)
    beat = 1.06 if f % 8 < 2 else 1.0
    a = av("imperio", "neutral", 7); a = a.resize((int(a.width * beat), int(a.height * beat)), Image.NEAREST)
    img.paste(a, (int(135 - a.width / 2), int(470 - a.height)), a)

def field(d, f):
    d.rectangle([0, 0, W, H], fill=hx("#8ac8ff")); d.rectangle([0, 150, W, H], fill=hx("#6aa83a"))
    for i in range(8):
        d.line([(0, 160 + i * 12), (W, 160 + i * 12)], fill=hx("#5a9a2a"))

def sc_terras(img, d, f, n, sp, gi):
    field(d, f); year(d, "1850")
    k = ease((f - 6) / 20)
    fence(d, 20, 20 + int(230 * k), 220)
    if f >= 20:
        box(d, 150, 110, 258, 140, PAPER); text(d, (204, 120), "TERRA À VENDA", 9, SEPIA, 0); text(d, (204, 132), "$$$", 10, GRN, 0)
        d.line([(204, 140), (204, 170)], fill=hx("#6a4428"), width=3)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)

def sc_quemcompra(img, d, f, n, sp, gi):
    field(d, f)
    fence(d, 10, 180, 210)
    person(d, 120, 200, hx("#3a3a5a"), 1.6)  # fazendeiro grande dentro da cerca
    d.rectangle([108, 150, 132, 156], fill=INK); d.rectangle([112, 140, 128, 152], fill=INK)  # chapéu
    for i in range(4):
        person(d, 200 + i * 16, 246, [hx("#c86a4a"), hx("#7a7a8a")][i % 2], 0.9, sad=True)
    if f >= 20:
        box(d, 182, 160, 266, 184, hx("#2a0a10"), RED); text(d, (224, 172), "DE FORA", 11, RED, 0)
    put_avatar(img, "imperio", talk(gi), 60, 470, 5)

def sc_abolicao(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#2a1a3a")); year(d, "1888")
    split = 12 if f >= 8 else 0
    for i in range(6):
        x = 40 + i * 32 + (split if i >= 3 else -split)
        d.ellipse([x, 120, x + 28, 144], outline=hx("#c8ccd8"), width=5)
    if f >= 8:
        text(d, (135, 100), "ABOLIÇÃO", 16, YEL, 2)
    if f >= 30:
        box(d, 30, 170, 240, 200, hx("#2a0a10"), RED); text(d, (135, 185), "ÚLTIMO DAS AMÉRICAS", 12, RED, 0)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)

def sc_pergunta(img, d, f, n, sp, gi):
    dark(d, "#06040e")
    if f >= sp - 10:
        k = min(1.0, (f - sp + 10) / 4)
        text(d, (135, 160), "E DEPOIS?", int(16 + 18 * k), WHITE, 3)
    put_avatar(img, "imperio", "neutral", 135, 470, 5)

def sc_nada(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#1a0a14"))
    text(d, (135, 40), "NADA.", 30, RED, 3)
    for i, lab in enumerate(("TERRA", "ESCOLA", "INDENIZAÇÃO")):
        if f >= 8 + i * 8:
            y = 80 + i * 38
            box(d, 40, y, 230, y + 30, hx("#2a1a24"))
            text(d, (135, y + 15), lab, 13, WHITE, 0)
            d.line([(44, y + 4), (226, y + 26)], fill=RED, width=3)
    for i in range(5):
        person(d, int(30 + ((f * 2 + i * 50) % 240)), 230, hx("#7a7a8a"), 0.8, sad=True)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)

def sc_hoje(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#14182a"))
    # gerações (pai -> filho -> neto) dos dois lados
    for side, (col, lab, txt_col) in enumerate(((hx("#3ddc84"), "COM HERANÇA", GRN), (hx("#ff6a6a"), "DO ZERO", RED))):
        x = 70 + side * 130
        text(d, (x, 30), lab, 10, txt_col, 1)
        for g in range(3):
            if f >= g * 10:
                person(d, x, 70 + g * 46, col, 0.9)
                if g < 2:
                    text(d, (x, 80 + g * 46), "↓", 12, WHITE, 0)
    if f >= 34:
        box(d, 20, 196, 250, 230, hx("#2a0a10"), RED)
        text(d, (135, 213), "UM DOS PAÍSES MAIS DESIGUAIS", 10, WHITE, 0)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

def sc_quiz(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#1a1040"))
    text(d, (135, 34), "QUIZ!", 26, YEL, 3)
    text(d, (135, 62), "1ª UNIVERSIDADE DO BRASIL?", 11, WHITE, 1)
    for i, (l, y_) in enumerate((("A", "1500"), ("B", "1800"), ("C", "1920"))):
        if f >= 20 + i * 18:
            y = 84 + i * 40
            box(d, 40, y, 230, y + 32, [hx("#ffd84a"), hx("#ff4a6a"), hx("#28c8ff")][i], INK, 3)
            text(d, (60, y + 16), l, 16, INK, 0); text(d, (150, y + 16), y_, 18, INK, 0)
    if f >= sp:
        left = n - f; text(d, (135, 222), str(max(1, math.ceil(left / FPS))), 30, WHITE, 3)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

def sc_resposta(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#0a2a1a"))
    box(d, 40, 30, 230, 62, hx("#3ddc84"), INK, 3); text(d, (60, 46), "C", 16, INK, 0); text(d, (150, 46), "1920 ✔", 18, INK, 0)
    if f >= 22:
        d.line([(30, 160), (240, 160)], fill=WHITE, width=2)
        mx_flag(img, 30, 112, 30, 20); pe_flag(img, 64, 112, 30, 20)
        text(d, (62, 176), "1551", 14, YEL, 2)
        flag(img, "BR", 200, 112, 30, 20)
        text(d, (215, 176), "1920", 14, RED, 2)
        k = ease((f - 22) / 20)
        d.line([(62, 194), (62 + int(153 * k), 194)], fill=YEL, width=4)
        if k >= 1:
            text(d, (138, 212), "369 ANOS DE ATRASO", 11, RED, 1)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

def sc_moral(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#0a2a3a"))
    icons = ["OURO", "FÁBRICA", "TERRA", "ESCOLA"]
    for i, lab in enumerate(icons):
        if f >= 2 + i * 7:
            x = 20 + i * 62
            box(d, x, 60, x + 54, 110, hx("#22223a"))
            text(d, (x + 27, 85), lab, 8, WHITE, 0)
            d.line([(x + 4, 64), (x + 50, 106)], fill=RED, width=3)
    if f >= int(sp * 0.6):
        box(d, 20, 140, 250, 190, YEL, INK, 3)
        text(d, (135, 158), "NÃO FOI FALTA DE RIQUEZA", 11, INK, 0)
        text(d, (135, 176), "FOI COMO ELA FOI USADA", 12, RED, 0)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

def sc_cta(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#0a0620")); portal(d, 135, 140, f, 80)
    flag(img, "KR", 105, 124, 60, 40)
    if (f // 3) % 2:
        text(d, (135, 36), "PARTE 3", 18, WHITE, 2)
    box(d, 30, 196, 240, 224, YEL, INK, 3); text(d, (135, 210), "QUAL TE CHOCOU MAIS?", 12, INK, 0)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

SC = {"recap": sc_recap, "portal": sc_portal, "familia": sc_familia, "preco": sc_preco, "tratado": sc_tratado, "padaria": sc_padaria,
      "sufocada": sc_sufocada, "rehook": sc_rehook, "terras": sc_terras, "quemcompra": sc_quemcompra, "abolicao": sc_abolicao,
      "pergunta": sc_pergunta, "nada": sc_nada, "hoje": sc_hoje, "quiz": sc_quiz, "resposta": sc_resposta, "moral": sc_moral, "cta": sc_cta}

def captions(d, txt, f, sp, y=268):
    tk = tokens(txt); pg = pages(tk)
    if f >= sp:
        return
    acc, page = 0, len(pg) - 1
    for i, p in enumerate(pg):
        ln = len(p) / len(tk) * (sp - 3)
        if f - 1 < acc + ln:
            page = i; break
        acc += ln
    words = pg[page]; sz = 22
    while True:
        widths = [d.textlength(w.upper(), font=font(sz)) for w, _ in words]
        if sum(widths) + 6 * (len(words) - 1) <= W - 20 or sz <= 12:
            break
        sz -= 1
    x = (W - (sum(widths) + 6 * (len(words) - 1))) / 2
    for (w, c), wd in zip(words, widths):
        text(d, (x, y), w.upper(), sz, COL[c], 3, "lm"); x += wd + 6

def frame(gi):
    k = next(i for i in range(len(SHOTS)) if gi < STARTS[i] + LENS[i])
    sid, txt = SHOTS[k]
    f, n, sp = gi - STARTS[k], LENS[k], SPEAK[k]
    img = Image.new("RGB", (W, H)); d = ImageDraw.Draw(img); d.fontmode = "1"
    SC[sid](img, d, f, n, sp, gi)
    d = ImageDraw.Draw(img); d.fontmode = "1"
    if sid == "pergunta":
        if f < sp - 10:
            captions(d, txt, f, sp - 10, y=160)
    elif sid != "quiz":
        captions(d, txt, f, sp)
    box(d, 8, H - 22, 82, H - 8, RED, INK, 2); text(d, (45, H - 15), "PARTE 2", 9, WHITE, 0)
    d.rectangle([0, 0, int(W * gi / TOTAL), 3], fill=YEL)
    if k > 0 and f < 2 and sid not in QUIET:
        for y in range(0, H, 6):
            if (y // 6 + f) % 2 == 0:
                d.rectangle([0, y, W, y + 5], fill=WHITE)
    return img

def build_audio(path):
    total = int((TOTAL / FPS + 0.5) * SR)
    voice = np.zeros(total, np.float32); music = np.zeros(total, np.float32); fx = np.zeros(total, np.float32)
    for k, (sid, _) in enumerate(SHOTS):
        a = load_mono(ROOT / "public" / "audio" / EP / "shots" / f"{k:02d}.mp3")
        i = int(STARTS[k] / FPS * SR); voice[i:i + len(a)] += a[: total - i]
    step = 60 / 104 / 2
    mel = [69, 72, 76, 72, 71, 74, 77, 74, 69, 72, 76, 81, 79, 76, 72, 71]
    bas = [45, 45, 50, 50, 52, 52, 45, 45]
    for s in range(int(total / SR / step)):
        i = int(s * step * SR); n = int(step * SR)
        if i + 2 * n > total: break
        tt = np.arange(n) / SR; fr = 440 * 2 ** ((mel[s % 16] - 69) / 12)
        music[i:i + n] += 0.09 * np.where((tt * fr) % 1 < 0.25, 1.0, -1.0) * np.exp(-tt * 5)
        if s % 2 == 0:
            tt = np.arange(2 * n) / SR; fr = 440 * 2 ** ((bas[(s // 2) % 8] - 69) / 12)
            music[i:i + 2 * n] += 0.17 * (2 * np.abs(2 * ((tt * fr) % 1) - 1) - 1) * np.exp(-tt * 2)
        if s % 4 == 0:
            kk = np.arange(int(0.12 * SR)) / SR
            music[i:i + len(kk)] += 0.3 * np.sin(2 * np.pi * (120 * np.exp(-kk * 30) + 40) * kk) * np.exp(-kk * 18)
    vol = np.ones(total, np.float32) * 0.42
    for k, (sid, _) in enumerate(SHOTS):
        a = int(STARTS[k] / FPS * SR); b = int((STARTS[k] + LENS[k]) / FPS * SR)
        if sid in QUIET:
            vol[a:b] = 0.0
            for t0 in np.arange(0, (b - a) / SR, 0.8):
                for off, g in ((0, 0.5), (0.18, 0.32)):
                    j = a + int((t0 + off) * SR); m = int(0.16 * SR); tt = np.arange(m) / SR
                    if j + m < total:
                        fx[j:j + m] += g * np.sin(2 * np.pi * (60 - 18 * tt) * tt) * np.exp(-tt * 14)
        if sid == "quiz":  # tique-taque na contagem
            for t0 in np.arange(DUR[sid] + 0.25, LENS[k] / FPS, 0.5):
                j = a + int(t0 * SR); m = int(0.03 * SR)
                if j + m < total:
                    fx[j:j + m] += 0.35 * np.sin(2 * np.pi * 2200 * np.arange(m) / SR) * np.exp(-np.arange(m) / SR * 120)
    vol = np.convolve(vol, np.ones(1500) / 1500, mode="same")
    env = np.convolve(np.abs(voice), np.ones(2205) / 2205, mode="same")
    duck = 1 - 0.5 * np.clip(env / 0.03, 0, 1)
    for k, (sid, _) in enumerate(SHOTS):
        i = int(STARTS[k] / FPS * SR)
        if sid in HITS:
            m = int(0.45 * SR); tt = np.arange(m) / SR
            fx[i:i + m] += (np.sin(2 * np.pi * (180 * np.exp(-tt * 8) + 40) * tt) * np.exp(-tt * 6) * 0.6)[: total - i]
        if sid in ("portal", "cta"):
            m = int(1.2 * SR); tt = np.arange(m) / SR
            fx[i:i + m] += (np.sin(2 * np.pi * np.cumsum(200 + 1600 * (tt / 1.2) ** 2) / SR) * 0.18 * np.sin(np.pi * tt / 1.2))[: total - i]
    mix = voice + music * vol * duck + fx
    mix = mix / max(1e-6, np.abs(mix).max()) * 0.9
    with wave.open(str(path), "wb") as wv:
        wv.setnchannels(1); wv.setsampwidth(2); wv.setframerate(SR); wv.writeframes((mix * 32767).astype("<i2").tobytes())
    per = SR // FPS
    for j in range(TOTAL):
        RMS[j] = float(np.sqrt(np.mean(voice[j * per:(j + 1) * per] ** 2)))

if __name__ == "__main__":
    out = ROOT / "out"; out.mkdir(exist_ok=True)
    tmp = ROOT / "pixel" / "_frames"; tmp.mkdir(exist_ok=True)
    wav = ROOT / "pixel" / "_mix.wav"
    build_audio(wav)
    if len(sys.argv) > 2 and sys.argv[1] == "--frames":
        for gi in map(int, sys.argv[2].split(",")):
            frame(gi).resize((W * 2, H * 2), Image.NEAREST).save(tmp / f"check_{gi:04d}.png")
        print("ok checks"); sys.exit()
    for f in tmp.glob("*.png"): f.unlink()
    for gi in range(TOTAL):
        frame(gi).resize((W * S, H * S), Image.NEAREST).save(tmp / f"{gi:05d}.png")
    dst = out / "viajei-no-tempo-parte2.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(tmp / "%05d.png"), "-i", str(wav),
                    "-vf", f"fps={OUTFPS}", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                    "-af", "loudnorm=I=-14:TP=-1.5", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(dst)], check=True)
    print("ok", dst, TOTAL / FPS, "s")
