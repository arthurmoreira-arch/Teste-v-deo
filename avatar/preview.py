#!/usr/bin/env python3
"""Prévia animada 1080x1920: o avatar pisca, "fala" e troca de roupa a cada tema."""
import pathlib, subprocess, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from PIL import Image, ImageDraw, ImageFont
from avatar import OUTFITS, build, hx

OUT = pathlib.Path(__file__).resolve().parent / "out" / "frames"
OUT.mkdir(parents=True, exist_ok=True)
for f in OUT.glob("*.png"):
    f.unlink()
LABEL = {"casual": "O CANAL", "historia": "HISTÓRIA", "cinema": "CINEMA", "terror": "TERROR", "detetive": "MISTÉRIO",
         "espaco": "ESPAÇO", "medieval": "IDADE MÉDIA", "ciencia": "CIÊNCIA", "mentalista": "SÉRIES", "pirata": "AVENTURA"}
font = ImageFont.truetype("/home/user/Teste-v-deo/node_modules/@fontsource/oswald/files/oswald-latin-700-normal.woff2", 110) if False else ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 96)
FPS, PER = 12, 18  # 1,5 s por roupa
n = 0
for name, (_, _, bg) in OUTFITS.items():
    for k in range(PER):
        expr = "blink" if k in (5, 6) else ("talk" if (k // 2) % 2 and k > 8 else "neutral")
        img = build(name, expr).resize((960, 960), Image.NEAREST)
        frame = Image.new("RGBA", (1080, 1920), hx(bg))
        bob = 12 if (k // 3) % 2 else 0
        frame.alpha_composite(img, (60, 600 + bob))
        d = ImageDraw.Draw(frame)
        w = d.textlength(LABEL[name], font=font)
        d.text(((1080 - w) / 2, 330), LABEL[name], font=font, fill=(255, 255, 255), stroke_width=8, stroke_fill=(0, 0, 0))
        frame.convert("RGB").save(OUT / f"{n:04d}.png")
        n += 1
dst = pathlib.Path(__file__).resolve().parent / "out" / "avatar-preview.mp4"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-framerate", str(FPS), "-i", str(OUT / "%04d.png"), "-vf", "fps=30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", str(dst)], check=True)
print("ok", dst)
