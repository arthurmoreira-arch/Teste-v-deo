#!/usr/bin/env python3
"""Episódio 17 em pixel art no formato do vídeo de referência de academia:
mascote fixo no canto (avatar de regata), uma palavra por vez em amarelo itálico, boneco cinza com músculos coloridos
e alvo pulsando no músculo trabalhado. Uso: python3 pixel/render_ep17.py [--frames 0,40]
"""
import json, math, pathlib, re, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "avatar")); sys.path.insert(0, str(ROOT / "pixel"))
from avatar import build  # noqa: E402
from render_ep12 import INK, WHITE, YEL, RED, GRN, hx, text, box, ease, tokens  # noqa: E402

W, H, S, FPS, OUTFPS, SR = 270, 480, 4, 12, 30, 44100
EP = "ep17"
CODE = (ROOT / "src" / "episodes" / f"{EP}.ts").read_text(encoding="utf-8")
SHOTS = re.findall(r"id: '([^']+)',\n(?:\s+\w+: [^\n]*\n)*?\s+text: '((?:[^'\\]|\\.)*)'", CODE)
BLOCKS = {b.split("'")[1]: b for b in re.split(r"\n  \{\n    id: ", CODE)[1:]}
HITS = {k for k, b in BLOCKS.items() if "sfx: 'hit'" in b}
PAD = 0.2
DUR = json.loads((ROOT / "public" / "audio" / EP / "durations.json").read_text())
LENS = [round((DUR[i] + PAD) * FPS) for i, _ in SHOTS]
SPEAK = [round(DUR[i] * FPS) for i, _ in SHOTS]
STARTS = [sum(LENS[:k]) for k in range(len(LENS))]
TOTAL = sum(LENS)
RMS = [0.0] * TOTAL
ITAL = ImageFont.truetype("/usr/share/fonts/truetype/freefont/FreeSansBoldOblique.ttf", 26)
GRAY, GRAYSH, GRAYHI = hx("#b8b8c0"), hx("#8a8a94"), hx("#dcdce4")
PURPLE, ORANGE = hx("#a04ae8"), hx("#ff8a2a")

# ================================================================ academia
def gym(d, f, tint=0):
    d.rectangle([0, 0, W, H], fill=hx("#1e1e24"))
    d.polygon([(0, 260), (W, 260), (W, H), (0, H)], fill=hx("#2a2a32"))
    for i in range(10):  # piso em perspectiva
        y = 260 + int((i / 10) ** 1.6 * 220)
        d.line([(0, y), (W, y)], fill=hx("#24242c"))
    for x in range(-200, 480, 40):
        d.line([(135 + (x - 135) * 0.2, 260), (x, H)], fill=hx("#24242c"))
    d.rectangle([0, 0, W, 40], fill=hx("#141418"))
    for row in range(3):  # luzes do teto
        y = 10 + row * 10; w = 30 - row * 8
        for k in range(-2, 3):
            x = 135 + k * (70 - row * 20)
            d.rectangle([x - w // 2, y, x + w // 2, y + 3], fill=hx("#f4f4f8"))
    for x in (20, 60, 210, 250):  # racks ao fundo
        d.rectangle([x - 2, 120, x + 2, 260], fill=hx("#3a3a44")); d.rectangle([x + 18, 120, x + 22, 260], fill=hx("#3a3a44"))
        d.line([(x, 150), (x + 20, 150)], fill=hx("#4a4a54"), width=2)
    d.rectangle([90, 70, 180, 90], fill=hx("#2a2a32")); text(d, (135, 80), "PIXEL GYM", 9, hx("#8a8a94"), 0)

# ================================================================ boneco (frente)
def mannequin(d, cx, cy, s=1.0, hl=None, pulse=0.0):
    """Corpo cinza musculoso de frente. hl = {'peito': cor, 'ombro': cor, 'braco': cor}."""
    hl = hl or {}
    def E(x0, y0, x1, y1, col):
        d.ellipse([cx + x0 * s, cy + y0 * s, cx + x1 * s, cy + y1 * s], fill=col, outline=INK)
    def R(x0, y0, x1, y1, col):
        d.rectangle([cx + x0 * s, cy + y0 * s, cx + x1 * s, cy + y1 * s], fill=col, outline=INK)
    R(-22, 70, 22, 110, hx("#141418"))  # short
    R(-20, 106, -4, 160, GRAY); R(4, 106, 20, 160, GRAY)  # pernas
    E(-34, -6, 34, 74, GRAY)  # tronco
    E(-46, -10, -22, 64, hl.get("braco", GRAY)); E(22, -10, 46, 64, hl.get("braco", GRAY))  # braços
    E(-48, -16, -22, 12, hl.get("ombro", GRAY)); E(22, -16, 48, 12, hl.get("ombro", GRAY))  # ombros
    E(-28, 0, 0, 26, hl.get("peito", GRAYHI)); E(0, 0, 28, 26, hl.get("peito", GRAY))  # peitoral
    for r in range(3):  # abdômen
        R(-12, 30 + r * 12, -1, 40 + r * 12, GRAYSH); R(1, 30 + r * 12, 12, 40 + r * 12, GRAYSH)
    R(-8, -30, 8, -14, GRAY)  # pescoço
    E(-14, -60, 14, -22, GRAY)  # cabeça sem rosto
    d.line([(cx - 6 * s, cy - 48 * s), (cx - 2 * s, cy - 36 * s)], fill=GRAYHI, width=2)
    if pulse:  # alvo pulsando no músculo
        for name, (tx, ty) in (("ombro", (-35, -2)), ("peito", (-14, 12)), ("braco", (-34, 30))):
            if name in hl and hl[name] == RED:
                for k in range(3):
                    r = (6 + k * 6 + pulse * 6) * s
                    d.ellipse([cx + tx * s - r, cy + ty * s - r, cx + tx * s + r, cy + ty * s + r], outline=RED, width=2)

# ================================================================ supino (de lado)
def bench(d, f, plates=2, rep_up=0.0, shake=0, strain=False):
    bx, by = 70, 300
    d.rectangle([bx, by, bx + 130, by + 10], fill=hx("#2a2a32"), outline=INK)
    d.rectangle([bx + 10, by + 10, bx + 16, by + 40], fill=hx("#4a4a54")); d.rectangle([bx + 110, by + 10, bx + 116, by + 40], fill=hx("#4a4a54"))
    for x in (bx + 20, bx + 70):  # suportes
        d.rectangle([x, 180, x + 6, by], fill=hx("#8a8a94"), outline=INK)
    # corpo deitado
    d.ellipse([bx + 96, by - 26, bx + 124, by - 2], fill=GRAY, outline=INK)  # cabeça
    d.rectangle([bx + 30, by - 22, bx + 98, by], fill=GRAY, outline=INK)
    d.rectangle([bx - 10, by - 18, bx + 32, by - 4], fill=hx("#141418"), outline=INK)
    d.line([(bx - 6, by - 6), (bx - 20, by + 36)], fill=GRAY, width=8)
    ybar = int(by - 34 - rep_up * 44) + (shake if strain else 0)
    d.line([(bx + 70, by - 18), (bx + 70, ybar)], fill=GRAY, width=8)  # braço
    d.line([(bx + 10, ybar), (bx + 150, ybar)], fill=hx("#c8c8d0"), width=4)
    for k in range(plates):
        for side in (bx + 16 + k * 7, bx + 138 - k * 7):
            d.rectangle([side - 3, ybar - 18 + k, side + 3, ybar + 18 - k], fill=hx("#2a2a32") if k % 2 else hx("#3a3a48"), outline=INK)
    if strain:
        for k in range(3):
            d.ellipse([bx + 120 + k * 6, by - 30 + ((f + k * 3) % 12), bx + 124 + k * 6, by - 24 + ((f + k * 3) % 12)], fill=hx("#6ab8ff"))
    return ybar

# ================================================================ cenas (f local)
def sc_gancho(img, d, f, n):
    gym(d, f)
    p = (math.sin(f * 0.6) + 1) / 2
    mannequin(d, 150, 160, 1.6, {"peito": GRAYHI}, 0)
    if f % 8 < 4:
        text(d, (150, 60), "?", 40, YEL, 3)
    for k in range(4):  # correntes nos pulsos
        d.line([(150 - 70 + k * 6, 240), (0, 290 + k * 6)], fill=hx("#6a6a74"), width=3)
        d.line([(150 + 70 - k * 6, 240), (W, 290 + k * 6)], fill=hx("#6a6a74"), width=3)

def sc_carga(img, d, f, n):
    gym(d, f)
    plates = 2 + min(3, f // 18)
    rep = (math.sin(f * 0.5) + 1) / 2
    bench(d, f, plates, rep)
    if f % 18 < 8 and f > 10:
        text(d, (200, 150), "+2 KG", 16, GRN, 2)
    text(d, (135, 120), f"{40 + 2 * (plates - 2) * 2} KG", 18, WHITE, 2)

def sc_falha(img, d, f, n):
    gym(d, f)
    reps = min(12, 6 + f // 8)
    near = reps >= 11
    rep = (math.sin(f * (0.5 if not near else 0.25)) + 1) / 2 * (1 if not near else 0.4)
    bench(d, f, 4, rep, shake=(2 if f % 2 else -2), strain=near)
    text(d, (135, 120), f"{reps} REPS", 18, YEL, 2)
    if near:
        box(d, 160, 200, 250, 222, RED); text(d, (205, 211), "QUASE FALHA", 9, WHITE, 0)

def sc_frequencia(img, d, f, n):
    gym(d, f)
    p = (math.sin(f * 0.6) + 1) / 2
    mannequin(d, 155, 196, 1.45, {"peito": PURPLE, "ombro": RED, "braco": GRN}, p)
    days = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"]
    for i, dd in enumerate(days):
        x = 12 + i * 36
        on = dd in ("SEG", "QUI") and f >= 18
        box(d, x, 52, x + 32, 74, PURPLE if on else hx("#2a2a32"), INK, 2)
        text(d, (x + 16, 63), dd, 8, WHITE, 0)
    text(d, (135, 92), "2x POR SEMANA", 13, YEL, 2)

def sc_proteina(img, d, f, n):
    gym(d, f)
    d.ellipse([60, 200, 210, 250], fill=hx("#f0f0f4"), outline=INK)  # prato
    d.ellipse([80, 206, 140, 236], fill=hx("#c8823a"), outline=INK)  # frango
    d.line([(134, 222), (152, 214)], fill=hx("#f4e8d0"), width=5)
    for k in range(3):  # ovos
        d.ellipse([150 + k * 16, 214, 164 + k * 16, 232], fill=WHITE, outline=INK); d.ellipse([154 + k * 16, 220, 160 + k * 16, 226], fill=YEL)
    k = ease((f - 30) / 20)
    text(d, (135, 100), "1,6 g × 80 kg", 16, WHITE, 2)
    if f >= 30:
        text(d, (135, 140), f"≈ {int(130 * k)} g/dia", 22, YEL, 3)

def sc_sono(img, d, f, n):
    d.rectangle([0, 0, W, H], fill=hx("#0e1030"))
    d.ellipse([200, 40, 240, 80], fill=hx("#f4f0d0")); d.ellipse([212, 36, 250, 74], fill=hx("#0e1030"))
    d.rectangle([40, 240, 230, 270], fill=hx("#4a3a8a"), outline=INK)  # cama
    d.rectangle([40, 230, 70, 250], fill=WHITE, outline=INK)
    d.ellipse([46, 214, 72, 238], fill=GRAY, outline=INK)
    d.rectangle([66, 226, 220, 246], fill=hx("#6a5ac8"), outline=INK)
    for k in range(3):
        if (f // 6 + k) % 3:
            text(d, (90 + k * 18, 200 - k * 16 - (f % 12)), "Z", 12 + k * 3, WHITE, 1)
    text(d, (135, 110), "7 A 9 HORAS", 18, YEL, 2)
    if f >= int(n * 0.6):  # "menos de 7h" -> resultado despenca
        k = ease((f - n * 0.6) / 10)
        box(d, 150, 150, 170, 190, hx("#2a2a32"))
        hgt = int(40 * (1 - 0.8 * k))
        d.rectangle([150, 190 - hgt, 170, 190], fill=RED)
        text(d, (210, 170), "MÚSCULO", 9, RED, 1)

def sc_cta(img, d, f, n):
    gym(d, f)
    items = ["1 · MESMO PESO", "2 · SÉRIE LEVE", "3 · 1x POR SEMANA", "4 · POUCA PROTEÍNA", "5 · DORME POUCO"]
    for i, it in enumerate(items):
        if f >= i * 3:
            y = 70 + i * 32
            box(d, 30, y, 240, y + 26, hx("#2a2a32"), YEL, 2); text(d, (135, y + 13), it, 11, WHITE, 0)
    if f >= 20:
        box(d, 60, 240, 210, 266, YEL, INK, 3); text(d, (135, 253), "SALVA ESSE VÍDEO", 11, INK, 0)

ZOOM = {"carga": (140, 250, 1.45), "falha": (140, 250, 1.45), "proteina": (135, 190, 1.3), "sono": (135, 200, 1.25)}
SC = {"gancho": sc_gancho, "carga": sc_carga, "falha": sc_falha, "frequencia": sc_frequencia, "proteina": sc_proteina, "sono": sc_sono, "cta": sc_cta}

# ================================================================ legenda: UMA palavra por vez
def word_at(txt, f, sp):
    tk = [(w, c) for w, c in tokens(txt) if w]
    weights = [len(w) + 2 for w, _ in tk]
    tot = sum(weights); t = 0
    for (w, c), wt in zip(tk, weights):
        t += wt / tot * sp
        if f < t:
            return w, c
    return tk[-1]

COLW = {"w": YEL, "y": hx("#ffffff"), "r": RED}
def caption(d, txt, f, sp):
    if f >= sp:
        return
    w, c = word_at(txt, f, sp)
    d.fontmode = "1"
    d.text((150, 332), w, font=ITAL, fill=COLW[c], stroke_width=3, stroke_fill=INK, anchor="mm")

_mascot = {}
def mascot(img, gi):
    expr = "talk" if RMS[gi] > 0.03 and gi % 2 == 0 else ("blink" if gi % 40 in (0, 1) else "smirk")
    if expr not in _mascot:
        _mascot[expr] = build("academia", expr).resize((176, 176), Image.NEAREST)
    a = _mascot[expr]
    img.paste(a, (-26, H - 176 + (1 if (gi // 6) % 2 else 0)), a)

def frame(gi):
    k = next(i for i in range(len(SHOTS)) if gi < STARTS[i] + LENS[i])
    sid, txt = SHOTS[k]
    f, n, sp = gi - STARTS[k], LENS[k], SPEAK[k]
    img = Image.new("RGB", (W, H)); d = ImageDraw.Draw(img); d.fontmode = "1"
    SC[sid](img, d, f, n)
    z = ZOOM.get(sid)
    if z:  # aproxima a cena (supino, prato, cama) para ocupar a tela como no vídeo de referência
        zx, zy, zf = z
        img.paste(img.crop((int(zx - W / 2 / zf), int(zy - H / 2 / zf), int(zx + W / 2 / zf), int(zy + H / 2 / zf))).resize((W, H), Image.NEAREST), (0, 0))
    d = ImageDraw.Draw(img); d.fontmode = "1"
    mascot(img, gi)
    d = ImageDraw.Draw(img); d.fontmode = "1"
    caption(d, txt, f, sp)
    if k > 0 and f < 2:
        d.rectangle([0, 0, W, H], outline=WHITE, width=6)
    return img

# ================================================================ áudio (voz + batida + golpes)
def load_mono(p):
    raw = subprocess.check_output(["ffmpeg", "-v", "error", "-i", str(p), "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"])
    return np.frombuffer(raw, np.float32)

def build_audio(path):
    total = int((TOTAL / FPS + 0.5) * SR)
    voice = np.zeros(total, np.float32); fx = np.zeros(total, np.float32)
    for k, (sid, _) in enumerate(SHOTS):
        a = load_mono(ROOT / "public" / "audio" / EP / "shots" / f"{k:02d}.mp3")
        i = int(STARTS[k] / FPS * SR); voice[i:i + len(a)] += a[: total - i]
        if sid in HITS:
            m = int(0.45 * SR); tt = np.arange(m) / SR
            fx[i:i + m] += (np.sin(2 * np.pi * (180 * np.exp(-tt * 8) + 40) * tt) * np.exp(-tt * 6) * 0.5)[: total - i]
    beat = load_mono(ROOT / "public" / "audio" / EP / "beat.mp3")
    music = np.zeros(total, np.float32); music[: min(total, len(beat))] = beat[:total]
    env = np.convolve(np.abs(voice), np.ones(2205) / 2205, mode="same")
    duck = 1 - 0.45 * np.clip(env / 0.03, 0, 1)
    mix = voice + music * 0.28 * duck + fx
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
    dst = out / "treina-e-nao-cresce.mp4"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(tmp / "%05d.png"), "-i", str(wav),
                    "-vf", f"fps={OUTFPS}", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
                    "-af", "loudnorm=I=-14:TP=-1.5", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(dst)], check=True)
    print("ok", dst, TOTAL / FPS, "s")
