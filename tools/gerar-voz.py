#!/usr/bin/env python3
"""Gera a narração (voz de IA pt-BR, Piper) de cada plano e as durações em public/audio/durations.json.
Uso: python3 tools/gerar-voz.py ep02   (precisa: pip install piper-tts, ffmpeg)
"""
import json, re, subprocess, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent

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

# ---------------------------------------------------------------- elenco de vozes
# Falas de personagem no texto do shot:  {mae:Ele tá estranho hoje.}   {redjohn:Achei você.}
# Shot com  tone: 'suspense'  → narrador mais lento, mais grave e com eco de ambiente.
VOICES = {
    # nome:      (modelo, length_scale, pitch, filtros extras)
    "narrador": ("pt_BR-faber-medium", 1.0, 1.0, ""),
    "voce": ("pt_BR-cadu-medium", 0.98, 1.0, ""),
    "mae": ("pt_BR-cadu-medium", 1.0, 1.32, ""),
    "chefe": ("pt_BR-jeff-medium", 1.0, 0.95, ""),
    "jane": ("pt_BR-jeff-medium", 0.97, 1.05, ""),
    "redjohn": ("pt_BR-jeff-medium", 1.18, 0.8, ",lowpass=f=5200,aecho=0.8:0.85:90|180:0.35|0.2"),
}
THOUGHT_FX = ",aecho=0.8:0.6:45:0.25"  # falas de personagem soam "dentro da cabeça"
SUSPENSE = (1.12, 0.94, ",aecho=0.8:0.7:70:0.22")  # narrador em tom de suspense
CLEAN = "highpass=f=70,equalizer=f=150:t=q:w=1:g=2,equalizer=f=3500:t=q:w=1.2:g=2.5,acompressor=threshold=-21dB:ratio=3:attack=4:release=90"
GAP = 0.22  # silêncio entre narrador e fala

blocks = re.split(r"\n  \{\n    id: ", src)[1:]
tones = {}
for b in blocks:
    sid = b.split("'")[1]
    tones[sid] = "suspense" if "tone: 'suspense'" in b else "normal"

def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]).decode())

def synth(text, speaker, suspense, dst):
    model, ls, pitch, extra = VOICES.get(speaker, VOICES["narrador"])
    fx = extra
    if speaker == "narrador" and suspense:
        ls, pitch, fx = ls * SUSPENSE[0], pitch * SUSPENSE[1], SUSPENSE[2]
    elif speaker != "narrador":
        fx += THOUGHT_FX
    raw = dst.with_suffix(".raw.wav")
    subprocess.run(
        [sys.executable, "-m", "piper", "-m", str(root / "tools" / f"{model}.onnx"), "-f", str(raw),
         "--length-scale", str(ls), "--noise-scale", "0.7", "--noise-w", "0.85", "--sentence-silence", "0.35"],
        input=fix(text).encode("utf-8"), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    pf = f"rubberband=pitch={pitch}," if abs(pitch - 1) > 1e-3 else ""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", f"aresample=44100,{pf}{CLEAN}{fx}", "-ac", "1", str(dst)], check=True)
    raw.unlink()

durations, lines = {}, {}
for i, (sid, text) in enumerate(shots):
    suspense = tones.get(sid) == "suspense"
    segs = []
    pos = 0
    for m in re.finditer(r"\{(\w+):(.*?)\}", text):
        if text[pos:m.start()].strip():
            segs.append(("narrador", text[pos:m.start()]))
        segs.append((m.group(1), m.group(2)))
        pos = m.end()
    if text[pos:].strip():
        segs.append(("narrador", text[pos:]))
    parts, t0, starts = [], 0.0, []
    for k, (spk, seg) in enumerate(segs):
        w = out / f"{i:02d}_{k}.wav"
        synth(seg, spk, suspense, w)
        if spk != "narrador":
            starts.append(round(t0, 3))
        parts.append(w)
        t0 += dur(w) + GAP
    fin = out / f"{i:02d}.mp3"
    inputs = sum([["-i", str(p)] for p in parts], [])
    pads = "".join(f"[{k}]apad=pad_dur={GAP}[p{k}];" for k in range(len(parts)))
    cat = "".join(f"[p{k}]" for k in range(len(parts))) + f"concat=n={len(parts)}:v=0:a=1,loudnorm=I=-15:TP=-1.5[o]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", pads + cat, "-map", "[o]", "-ar", "44100", "-b:a", "160k", str(fin)], check=True)
    for p in parts:
        p.unlink()
    d = dur(fin)
    durations[sid] = round(d, 3)
    if starts:
        lines[sid] = starts
    print(f"{i:02d} {sid} [{'suspense' if suspense else 'normal'}] {'+'.join(s for s, _ in segs)}: {d:.2f}s")

(root / "public" / "audio" / ep / "durations.json").write_text(json.dumps(durations, indent=2), encoding="utf-8")
(root / "public" / "audio" / ep / "lines.json").write_text(json.dumps(lines, indent=2), encoding="utf-8")
print("ok")
