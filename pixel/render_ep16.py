#!/usr/bin/env python3
"""Episódio 16 em pixel art: "Viajei no tempo… PARTE 1" (versão com explicação, analogias, quiz e ligação com hoje).
Uso: python3 pixel/render_ep15.py [--frames 0,40,90]
"""
import json, math, pathlib, re, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "avatar")); sys.path.insert(0, str(ROOT / "pixel"))
from render_ep12 import INK, WHITE, YEL, RED, GRN, hx, text, box, flag, ease, font, tokens, pages, COL  # noqa: E402
from render_ep13 import uk_flag, pt_flag, factory, gold  # noqa: E402
from render_ep14 import av, put_avatar, bubble, room, portal, sea, workshop, mine, PAPER, SEPIA, load_mono  # noqa: E402

W, H, S, FPS, OUTFPS, SR = 270, 480, 4, 12, 30, 44100
EP = "ep16"
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
TODAY = {"gancho", "escola", "analogia", "estagiario", "hoje", "cta"}
ERA = {"tear": "imperio", "pausa2": "imperio", "proibido": "imperio", "porque": "imperio"}

def talk(gi):
    return "talk" if RMS[gi] > 0.03 and (gi // 1) % 2 == 0 else ("blink" if gi % 40 in (0, 1) else "neutral")

def outfit(sid):
    return "casual" if sid in TODAY else ERA.get(sid, "colono")

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
def sc_gancho(img, d, f, n, sp, gi):
    room(img, d, f)
    box(d, 10, 18, 260, 92, INK, YEL, 3)
    text(d, (135, 38), "VIAJEI NO TEMPO", 20, WHITE, 2)
    text(d, (135, 60), "PRA DESCOBRIR POR QUE", 12, WHITE, 1)
    text(d, (135, 78), "O BRASIL NÃO É RICO", 14, YEL, 2)
    put_avatar(img, "casual", talk(gi), 135, 470, 5)

def sc_escola(img, d, f, n, sp, gi):
    room(img, d, f)
    box(d, 20, 110, 150, 190, hx("#1a3a2a"), hx("#8a6a3a"), 5)
    if f >= 6:
        text(d, (85, 140), "A ESCOLA", 12, WHITE, 0); text(d, (85, 160), "NÃO TE CONTA", 12, RED, 0)
    put_avatar(img, "casual", "smirk" if RMS[gi] < 0.03 else talk(gi), 135, 470, 5)

def sc_portal(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#0a0620")); portal(d, 135, 200, f)
    k = ease(f / n); a = av("casual", "blink", 4).rotate(k * 360, resample=Image.NEAREST)
    a = a.resize((max(4, int(a.width * (1 - 0.85 * k))), max(4, int(a.height * (1 - 0.85 * k)))), Image.NEAREST)
    img.paste(a, (int(135 - a.width / 2), int(200 + 160 * (1 - k) - a.height / 2)), a)
    if f >= n - 8:
        box(d, 70, 300, 200, 346, PAPER, INK, 3); text(d, (135, 323), "1703", 28, SEPIA, 0)

def sc_ouro(img, d, f, n, sp, gi):
    mine(img, d, f)
    x = 40 + 70 * ease(f / 14)
    put_avatar(img, "colono", talk(gi), x, 470 + (4 if (f // 3) % 2 and f < 14 else 0), 5)
    box(d, 160, 20, 258, 52, PAPER, INK, 3); text(d, (209, 36), "1703 · MG", 13, SEPIA, 0)

def sc_pausa1(img, d, f, n, sp, gi):
    mine(img, d, f)
    z = 1 + 0.6 * ease(f / n)
    crop = img.crop((int(135 - 135 / z), int(320 - 320 / z), int(135 + 135 / z), int(320 + 160 / z))).resize((W, 480), Image.NEAREST)
    img.paste(crop, (0, 0)); d = ImageDraw.Draw(img)
    put_avatar(img, "colono", talk(gi), 200, 470, 4)
    d.rectangle([0, 0, W, H], outline=hx("#000000"), width=10)

def bottle(d, x, y):
    d.rectangle([x + 6, y - 18, x + 12, y], fill=hx("#2a5a2a"), outline=INK)
    d.rectangle([x, y, x + 18, y + 40], fill=hx("#2a5a2a"), outline=INK)
    d.rectangle([x + 3, y + 14, x + 15, y + 28], fill=PAPER)
    d.rectangle([x + 4, y + 30, x + 14, y + 38], fill=hx("#8a1a2a"))

def cloth(d, x, y, col=hx("#c83a4a")):
    d.ellipse([x, y, x + 16, y + 40], fill=col, outline=INK)
    d.rectangle([x + 8, y, x + 46, y + 40], fill=col, outline=INK)
    d.ellipse([x + 38, y, x + 54, y + 40], fill=hx("#e86a7a"), outline=INK)
    for k in range(3):
        d.line([(x + 14, y + 10 + k * 10), (x + 40, y + 10 + k * 10)], fill=hx("#8a1a2a"))

def sc_tratado(img, d, f, n, sp, gi):
    sea(img, d, f); year(d, "1703")
    pt_flag(img, 30, 70, 60, 40); uk_flag(img, 180, 70, 60, 40)
    k = (f % 36) / 36
    bottle(d, int(50 + k * 150), 140)
    cloth(d, int(190 - k * 150), 178)
    text(d, (135, 128), "VINHO →", 12, WHITE, 2); text(d, (135, 230), "← TECIDO", 12, WHITE, 2)
    put_avatar(img, "colono", talk(gi), 70, 470, 5)

def sc_quiz(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#1a1040"))
    text(d, (135, 34), "QUIZ!", 26, YEL, 3)
    text(d, (135, 62), "QUEM SAIU GANHANDO?", 12, WHITE, 1)
    opts = [("A", "PORTUGAL", "PT"), ("B", "INGLATERRA", "UK"), ("C", "BRASIL", "BR")]
    for i, (l, lab, cc) in enumerate(opts):
        if f >= 14 + i * 12:
            y = 84 + i * 40
            box(d, 30, y, 240, y + 32, [hx("#ffd84a"), hx("#ff4a6a"), hx("#28c8ff")][i], INK, 3)
            text(d, (48, y + 16), l, 16, INK, 0); text(d, (128, y + 16), lab, 13, INK, 0)
            if cc == "PT": pt_flag(img, 204, y + 8, 26, 16)
            elif cc == "UK": uk_flag(img, 204, y + 8, 26, 16)
            else: flag(img, "BR", 204, y + 8, 26, 16)
    if f >= sp:
        text(d, (135, 222), str(max(1, math.ceil((n - f) / FPS))), 30, WHITE, 3)
    put_avatar(img, "colono", talk(gi), 70, 470, 5)

def sc_resposta(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#0a2a1a"))
    box(d, 30, 20, 240, 50, hx("#3ddc84"), INK, 3); text(d, (48, 35), "B", 16, INK, 0); text(d, (140, 35), "INGLATERRA ✔", 14, INK, 0)
    # balança: tecido pesa mais que vinho
    tilt = 10 * ease((f - 8) / 12)
    d.line([(135, 80), (135, 150)], fill=hx("#c8c8d8"), width=4)
    d.line([(75, 92 - tilt), (195, 92 + tilt)], fill=hx("#c8c8d8"), width=4)
    bottle(d, 66, int(100 - tilt)); cloth(d, 168, int(100 + tilt), hx("#c83a4a"))
    if f >= int(sp * 0.6):
        pt_flag(img, 20, 196, 40, 26); uk_flag(img, 210, 196, 40, 26)
        kk = (f % 20) / 20
        gold(d, int(66 + kk * 130), 206)
        text(d, (135, 236), "OURO DO BRASIL", 11, YEL, 2)
    put_avatar(img, "colono", talk(gi), 70, 470, 5)

def sc_analogia(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#1a2a3a"))
    box(d, 20, 40, 120, 110, hx("#3ddc84"), INK, 3); text(d, (70, 60), "SALÁRIO", 11, INK, 0); text(d, (70, 86), "R$", 18, INK, 0)
    box(d, 150, 40, 250, 110, hx("#ff4a6a"), INK, 3); text(d, (200, 60), "FATURA", 11, WHITE, 0); text(d, (200, 84), "DO VIZINHO", 9, WHITE, 0)
    k = (f % 18) / 18
    for i in range(3):
        x = int(110 + ((k + i / 3) % 1) * 40)
        d.ellipse([x, 70, x + 10, 80], fill=YEL, outline=INK)
    text(d, (135, 150), "TRABALHOU O MÊS INTEIRO...", 10, WHITE, 1)
    if f >= int(sp * 0.6):
        text(d, (135, 176), "...E FICOU SEM NADA", 12, RED, 2)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

def sc_cofre(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#3a3a4a"))
    uk_flag(img, 200, 20, 54, 34)
    box(d, 40, 70, 200, 220, hx("#6a6a7a"), INK, 3)  # cofre
    d.ellipse([100, 120, 140, 160], fill=hx("#9a9aa8"), outline=INK)
    pile = min(8, f // 4)
    for i in range(pile):
        gold(d, 52 + (i % 4) * 34, 196 - (i // 4) * 10)
    if f >= int(sp * 0.4):
        factory(d, 200, 240, 0.8)
    if f >= int(sp * 0.7):
        flag(img, "BR", 20, 24, 40, 26)
        box(d, 66, 24, 190, 50, hx("#2a0a10"), RED); text(d, (128, 37), "QUASE NADA FICOU", 10, RED, 0)
    put_avatar(img, "colono", talk(gi), 70, 470, 5)

def sc_pior(img, d, f, n, sp, gi):
    dark(d)
    beat = 1.06 if f % 8 < 2 else 1.0
    a = av("colono", "neutral", 7); a = a.resize((int(a.width * beat), int(a.height * beat)), Image.NEAREST)
    img.paste(a, (int(135 - a.width / 2), int(470 - a.height)), a)

def sc_tear(img, d, f, n, sp, gi):
    workshop(img, d, f); year(d, "1785")
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)
    if f >= 20:
        box(d, 150, 60, 258, 84, GRN); text(d, (204, 72), "FEITO AQUI", 11, WHITE, 0)

def sc_pausa2(img, d, f, n, sp, gi):
    workshop(img, d, f)
    k = ease(f / 14); y = int(-80 + 200 * k)
    box(d, 70, y, 200, y + 90, PAPER, INK, 3)
    text(d, (135, y + 18), "ORDEM DA", 10, SEPIA, 0); text(d, (135, y + 32), "RAINHA", 10, SEPIA, 0)
    pt_flag(img, 117, y + 46, 36, 24)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)
    d.rectangle([0, 0, W, H], outline=hx("#000000"), width=10)

def sc_proibido(img, d, f, n, sp, gi):
    sh = (6 if f % 2 else -6) if f < 8 else 0
    tmp = Image.new("RGB", (W, H)); td = ImageDraw.Draw(tmp); workshop(tmp, td, f, gray=True)
    img.paste(tmp, (sh, 0)); d = ImageDraw.Draw(img); d.fontmode = "1"
    s = 1.0 if f >= 2 else 1.6
    w, h = int(220 * s), int(60 * s)
    d.rectangle([135 - w // 2, 140 - h // 2, 135 + w // 2, 140 + h // 2], fill=PAPER, outline=RED, width=7)
    text(d, (135, 140), "PROIBIDO", int(34 * s), RED, 0)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)
    bubble(d, 120, 296, "!!", RED)

def sc_porque(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#2a1a10"))
    flag(img, "BR", 20, 40, 60, 40); pt_flag(img, 190, 40, 60, 40)
    box(d, 20, 100, 125, 150, hx("#6a4a2a")); text(d, (72, 116), "COLÔNIA:", 10, YEL, 0); text(d, (72, 134), "CAVA OURO", 10, WHITE, 0)
    box(d, 145, 100, 250, 150, hx("#1a3a6a")); text(d, (197, 116), "PORTUGAL:", 10, YEL, 0); text(d, (197, 134), "VENDE PRONTO", 9, WHITE, 0)
    k = (f % 24) / 24
    gold(d, int(60 + k * 120), 170)
    cloth(d, int(170 - k * 120), 200)
    put_avatar(img, "imperio", talk(gi), 70, 470, 5)

def sc_estagiario(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#d8d0c0")); d.rectangle([0, 220, W, H], fill=hx("#8a7a6a"))
    box(d, 30, 150, 240, 170, hx("#6a4a2a"))  # mesa
    person(d, 80, 220, hx("#2a2a4a"), 2.0)  # chefe
    d.rectangle([66, 144, 94, 150], fill=INK)
    person(d, 190, 220, hx("#5ac87a"), 1.6)  # estagiário
    box(d, 150, 60, 250, 100, PAPER, INK, 2); text(d, (200, 74), "MANUAL", 10, SEPIA, 0); text(d, (200, 88), "DO NEGÓCIO", 8, SEPIA, 0)
    if f >= 16:
        d.line([(154, 64), (246, 96)], fill=RED, width=3); d.line([(246, 64), (154, 96)], fill=RED, width=3)
        bubble(d, 80, 110, "NÃO!", RED)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

def sc_hoje(img, d, f, n, sp, gi):
    sea(img, d, f)
    d.rectangle([0, 0, W, 60], fill=hx("#1a1a2a")); text(d, (135, 30), "HOJE", 22, YEL, 2)
    k = (f % 40) / 40
    sx = int(20 + k * 180)  # navio saindo com soja e minério
    d.polygon([(sx, 150), (sx + 70, 150), (sx + 60, 168), (sx + 8, 168)], fill=hx("#3a3a4a"), outline=INK)
    box(d, sx + 8, 132, sx + 30, 150, hx("#7ab84a")); box(d, sx + 34, 132, sx + 56, 150, hx("#9a4a2a"))
    text(d, (135, 110), "VENDE: SOJA E MINÉRIO", 10, GRN, 2)
    sx2 = int(200 - k * 180)
    d.polygon([(sx2, 230), (sx2 + 70, 230), (sx2 + 60, 248), (sx2 + 8, 248)], fill=hx("#3a3a4a"), outline=INK)
    box(d, sx2 + 10, 210, sx2 + 24, 230, INK, hx("#6ab8ff")); box(d, sx2 + 34, 212, sx2 + 56, 230, WHITE, RED)
    d.line([(sx2 + 45, 214), (sx2 + 45, 228)], fill=RED, width=2); d.line([(sx2 + 38, 221), (sx2 + 52, 221)], fill=RED, width=2)
    text(d, (135, 196), "COMPRA: CELULAR E REMÉDIO", 10, RED, 2)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

def sc_cta(img, d, f, n, sp, gi):
    d.rectangle([0, 0, W, H], fill=hx("#0a0620")); portal(d, 135, 140, f, 80)
    d.polygon([(110, 154), (160, 154), (154, 166), (116, 166)], fill=INK)
    d.line([(135, 154), (135, 120)], fill=INK, width=2); d.polygon([(137, 122), (152, 140), (137, 148)], fill=INK)
    if (f // 3) % 2:
        text(d, (135, 36), "1810 · PARTE 2", 16, WHITE, 2)
    box(d, 30, 196, 240, 224, YEL, INK, 3); text(d, (135, 210), "QUAL TE REVOLTOU MAIS?", 11, INK, 0)
    put_avatar(img, "casual", talk(gi), 70, 470, 5)

SC = {"gancho": sc_gancho, "escola": sc_escola, "portal": sc_portal, "ouro": sc_ouro, "pausa1": sc_pausa1, "tratado": sc_tratado,
      "quiz": sc_quiz, "resposta": sc_resposta, "analogia": sc_analogia, "cofre": sc_cofre, "pior": sc_pior, "tear": sc_tear,
      "pausa2": sc_pausa2, "proibido": sc_proibido, "porque": sc_porque, "estagiario": sc_estagiario, "hoje": sc_hoje, "cta": sc_cta}

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
    if sid != "quiz":
        captions(d, txt, f, sp)
    box(d, 8, H - 22, 82, H - 8, RED, INK, 2); text(d, (45, H - 15), "PARTE 1", 9, WHITE, 0)
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
        if sid in ("portal", "cta", "gancho"):
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
    dst = out / "viajei-no-tempo-parte1-v2.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(tmp / "%05d.png"), "-i", str(wav),
                    "-vf", f"fps={OUTFPS}", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                    "-af", "loudnorm=I=-14:TP=-1.5", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(dst)], check=True)
    print("ok", dst, TOTAL / FPS, "s")
