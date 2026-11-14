#!/usr/bin/env python3
"""Gera a narração (voz de IA pt-BR, Kokoro) de cada plano e as durações em public/audio/durations.json.
Uso: python3 tools/gerar-voz.py ep02   (precisa: pip install kokoro-onnx soundfile, ffmpeg e os modelos em tools/kokoro/)
"""
import json, re, subprocess, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent

ep = sys.argv[1] if len(sys.argv) > 1 else "ep01"
src = (root / "src" / "episodes" / f"{ep}.ts").read_text(encoding="utf-8")
shots = re.findall(r"id: '([^']+)',\n(?:\s+\w+: [^\n]*\n)*?\s+text: '((?:[^'\\]|\\.)*)'", src)
out = root / "public" / "audio" / ep / "shots"
out.mkdir(parents=True, exist_ok=True)
if not shots:
    sys.exit("não achei os shots em src/script.ts")

# pronúncia: nomes e siglas em fonemas exatos ([[...]] = IPA lido direto pelo Piper),
# do jeito que brasileiro fala os nomes da série.
# As palavrinhas antes do nome (o, a, e, de, nem...) e a pontuação depois entram no mesmo bloco,
# senão o Piper as lê isoladas ("Ô Jane") e perde a pausa da vírgula/ponto.
NAMES = [
    (r"Nvidia", "ẽnvˈidʒjɐ"),
    (r"Jensen Huang", "dʒˈẽsẽn wˈɐ̃ŋ"),
    (r"Colette Kress", "kolˈɛtʃi krˈɛs"),
    (r"IA", "i ˈa"),
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

# ---------------------------------------------------------------- elenco de vozes (Kokoro, 24 kHz)
# Falas de personagem no texto do shot:  {mae:Ele tá estranho hoje.}   {redjohn:Achei você.}
# Shot com  tone: 'suspense'  → narrador um pouco mais grave e com eco de ambiente.
import soundfile as sf
from kokoro_onnx import Kokoro
from kokoro_onnx.tokenizer import Tokenizer

KDIR = root / "tools" / "kokoro"
kokoro = Kokoro(str(KDIR / "kokoro-v1.0.onnx"), str(KDIR / "voices-v1.0.bin"))
tok = Tokenizer()

VOICES = {
    # nome: (voz Kokoro — pode misturar vozes "a:0.6+b:0.4" —, velocidade, pitch, filtros extras)
    # Cada pessoa tem um timbre próprio (medido: tom médio e brilho diferentes). Só o vulto/Red John
    # mudam o tom com rubberband; as outras vozes ficam sem processamento de tom, que deixava a fala robótica.
    "narrador": ("pm_alex", 1.05, 1.0, ""),                          # ~135 Hz, timbre claro
    "voce": ("pm_santa", 1.02, 1.0, ""),                             # ~135 Hz, timbre mais quente
    "passageiro": ("pm_alex:0.6+im_nicola:0.4", 0.98, 1.0, ",highpass=f=320,lowpass=f=3400,equalizer=f=1500:t=q:w=1:g=4"),  # ~120 Hz, som de áudio de celular
    "mae": ("pf_dora:0.6+if_sara:0.4", 1.0, 1.0, ""),                 # ~198 Hz, feminina e calorosa
    "amiga": ("pf_dora:0.5+ef_dora:0.5", 1.04, 1.0, ""),              # ~176 Hz, feminina mais jovem
    "chefe": ("pm_santa:0.5+em_alex:0.5", 0.97, 1.0, ""),             # ~132 Hz, mais firme
    "jane": ("pm_santa:0.6+em_santa:0.4", 1.04, 1.0, ""),
    "redjohn": ("pm_alex:0.65+am_onyx:0.35", 0.88, 0.85, ",lowpass=f=5200,aecho=0.8:0.85:90|180:0.35|0.2"),
    "vulto": ("pm_alex:0.65+am_onyx:0.35", 0.84, 0.8, ",lowpass=f=4300,aecho=0.8:0.88:70|160|260:0.4|0.25|0.15,tremolo=f=6:d=0.2"),
}
SUSPENSE = (0.95, 1.0, ",aecho=0.8:0.6:60:0.15")  # narrador em tom de suspense: um pouco mais lento + leve eco
CLEAN = "highpass=f=70,equalizer=f=160:t=q:w=1:g=1.5,equalizer=f=3800:t=q:w=1.2:g=2,acompressor=threshold=-21dB:ratio=2.5:attack=6:release=120"
GAP = 0.22  # respiro entre uma pessoa e outra

KSMALL = {"o": "ʊ", "a": "a", "e": "i", "de": "dʒy", "do": "dʊ", "da": "da", "nem": "nˈeɪŋ", "em": "eɪŋ", "com": "kõŋ", "se": "sy", "que": "ky"}
_names = re.compile("|".join(f"(?P<n{k}>(?<![\\w@]){pat}(?!\\w))" for k, (pat, _) in enumerate(NAMES)))

def to_phonemes(text: str) -> str:
    """Texto -> fonemas pt-BR; nomes da série entram com a pronúncia definida em NAMES."""
    text = re.sub(r"[*!]", "", text)
    out, pos = [], 0
    for m in _names.finditer(text):
        before = text[pos:m.start()]
        # artigos/preposições colados no nome: fonema átono (senão viram "Ó Jane", "Á Lisbon")
        sm = re.search(rf"((?:\b(?i:{_small})\s+)+)$", before)
        pre = ""
        if sm:
            before = before[:sm.start()]
            pre = " ".join(KSMALL[w.lower()] for w in sm.group(1).split()) + " "
        if before.strip():
            out.append(tok.phonemize(before, "pt-br"))
        out.append(pre + NAMES[int(m.lastgroup[1:])][1])
        pos = m.end()
    if text[pos:].strip():
        out.append(tok.phonemize(text[pos:], "pt-br"))
    return re.sub(r"\s+([.,?!:;])", r"\1", " ".join(out))

# episódio pode trocar quem narra:  narrator: 'voce'  (ex.: story em que o próprio boneco fala)
_sp = re.search(r"voiceSpeed: ([0-9.]+)", src)
if _sp:  # episódio pode pedir narração mais lenta/rápida
    for k, (v, sp, pi, fx) in list(VOICES.items()):
        VOICES[k] = (v, sp * float(_sp.group(1)), pi, fx)
_nm = re.search(r"narrator: '(\w+)'", src)
if _nm and _nm.group(1) in VOICES:
    VOICES["narrador"] = VOICES[_nm.group(1)]

blocks = re.split(r"\n  \{\n    id: ", src)[1:]
tones = {}
for b in blocks:
    sid = b.split("'")[1]
    tones[sid] = "suspense" if "tone: 'suspense'" in b else "normal"

def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]).decode())

_styles = {}
def style(spec):
    """'pm_alex:0.6+im_nicola:0.4' -> mistura dos estilos de voz (timbre novo, sotaque pt-BR mantido)."""
    if spec not in _styles:
        acc = None
        for part in spec.split("+"):
            name, w = (part.split(":") + ["1"])[:2]
            st = kokoro.get_voice_style(name) * float(w)
            acc = st if acc is None else acc + st
        _styles[spec] = acc
    return _styles[spec]

def synth(text, speaker, suspense, dst):
    voice, speed, pitch, extra = VOICES.get(speaker, VOICES["narrador"])
    fx = extra
    if speaker == "narrador" and suspense:
        speed, pitch, fx = speed * SUSPENSE[0], pitch * SUSPENSE[1], SUSPENSE[2]
    raw = dst.with_suffix(".raw.wav")
    # pausas curtas entre frases/vírgulas = fala corrida, sem "travadas"
    audio, sr = kokoro.create(to_phonemes(text), voice=style(voice), speed=speed, is_phonemes=True, sentence_pause=0.2, clause_pause=0.06)
    sf.write(str(raw), audio, sr)
    pf = f"rubberband=pitch={pitch}:formant=preserved," if abs(pitch - 1) > 1e-3 else ""
    # corte de silêncio suave (não come o início/fim das palavras) + fade curto + volume igual entre pessoas
    trim = "silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-55dB:start_silence=0.06,areverse,"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", f"{trim}aresample=44100,{pf}{CLEAN}{fx},afade=t=in:d=0.02,loudnorm=I=-16:TP=-2", "-ar", "44100", "-ac", "1", str(dst)], check=True)
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
