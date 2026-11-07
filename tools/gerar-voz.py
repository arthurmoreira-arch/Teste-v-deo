#!/usr/bin/env python3
"""Gera a narração (voz de IA pt-BR, Piper) de cada plano e as durações em public/audio/durations.json.
Uso: python3 tools/gerar-voz.py ep02   (precisa: pip install piper-tts, ffmpeg)
"""
import json, re, subprocess, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
model = root / "tools" / "pt_BR-faber-medium.onnx"

ep = sys.argv[1] if len(sys.argv) > 1 else "ep01"
src = (root / "src" / "episodes" / f"{ep}.ts").read_text(encoding="utf-8")
shots = re.findall(r"id: '([^']+)',\n\s+text: '((?:[^'\\]|\\.)*)'", src)
out = root / "public" / "audio" / ep / "shots"
out.mkdir(parents=True, exist_ok=True)
if not shots:
    sys.exit("não achei os shots em src/script.ts")

# pronúncia: nomes e siglas em fonemas exatos ([[...]] = IPA lido direto pelo Piper),
# do jeito que brasileiro fala os nomes da série.
# As palavrinhas antes do nome (o, a, e, de, nem...) e a pontuação depois entram no mesmo bloco,
# senão o Piper as lê isoladas ("Ô Jane") e perde a pausa da vírgula/ponto.
NAMES = [
    (r"@lyncowndetona", "lˈĩŋkoun detˈonɐ"),
    (r"Patrick Jane", "pˈatɾik dʒˈeɪn"),
    (r"Jane", "dʒˈeɪn"),
    (r"Red John", "xˈɛd dʒˈɔn"),
    (r"Lisbon", "lˈizbɔn"),
    (r"Charlotte", "ʃˈaɾlɔtʃi"),
    (r"Angela", "ˈɐ̃ʒelɐ"),
    (r"CBI", "sˌe bˌe ˈi"),
    (r"A ou B", "ˈa ow bˈe"),
    (r"letra A", "lˈetɾɐ ˈa"),
    (r"TV", "tˌe vˈe"),
]
SMALL = {"o": "u", "a": "a", "e": "i", "de": "dʒɪ", "do": "dʊ", "da": "dɐ", "nem": "neɪŋ", "em": "eɪŋ", "com": "kõ", "se": "sɪ", "que": "kɪ"}
_small = "|".join(SMALL)

def fix(t: str) -> str:
    t = re.sub(r"[*!]", "", t)
    for pat, ipa in NAMES:
        rx = re.compile(rf"((?:\b(?i:{_small})\s+){{0,3}})(?<![\w@]){pat}(?!\w)([.,?!:;]*)")
        def rep(m, ipa=ipa):
            pre = " ".join(SMALL[w.lower()] for w in m.group(1).split()) if m.group(1) else ""
            return "[[" + (pre + " " if pre else "") + ipa + m.group(2) + "]] "
        t = rx.sub(rep, t)
    return re.sub(r"\s+", " ", t).strip()

# cadeia de áudio: limpa graves, realça presença, comprime e sobe para 44,1 kHz (som de "locutor")
AF = "highpass=f=70,equalizer=f=150:t=q:w=1:g=2,equalizer=f=3500:t=q:w=1.2:g=2.5,acompressor=threshold=-21dB:ratio=3:attack=4:release=90,loudnorm=I=-15:TP=-1.5,aresample=44100"

durations = {}
for i, (sid, text) in enumerate(shots):
    t = fix(text)
    raw = out / f"{i:02d}_raw.wav"
    fin = out / f"{i:02d}.mp3"
    subprocess.run(
        [sys.executable, "-m", "piper", "-m", str(model), "-f", str(raw), "--length-scale", "1.0", "--noise-scale", "0.7", "--noise-w", "0.85", "--sentence-silence", "0.35"],
        input=t.encode("utf-8"), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", AF, "-b:a", "160k", str(fin)], check=True)
    d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(fin)]).decode())
    durations[sid] = round(d, 3)
    raw.unlink()
    print(f"{i:02d} {sid}: {d:.2f}s")

(root / "public" / "audio" / ep / "durations.json").write_text(json.dumps(durations, indent=2), encoding="utf-8")
print("ok")
