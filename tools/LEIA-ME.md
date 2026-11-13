# Voz
`python3 tools/gerar-voz.py` gera a narração (Piper, voz pt-BR "edresson") e as durações dos planos.
O modelo `.onnx` (63 MB) não vai para o git: baixe de
https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-pt-br-edresson-low.tar.gz
e extraia em `tools/`. Para uma voz melhor, gere os MP3 no ElevenLabs e salve como `public/audio/shots/00.mp3 … 12.mp3`, atualizando `public/audio/durations.json`.

## Elenco de vozes (tools/gerar-voz.py)
Narrador = Faber · Você = Cadu · Mãe = Cadu (+tom agudo) · Chefe/Jane = Jeff · Red John = Jeff grave, lento, com eco.
Falas no texto do shot: `{mae:Ele tá estranho hoje.}` — viram outra voz, com eco de "pensamento", e a legenda fica amarela (vermelha no Red John).
`tone: 'suspense'` no shot: narrador mais lento e grave, música abaixa e entra o drone de tensão.
Modelos: baixe `vits-piper-pt_BR-{faber,cadu,jeff}-medium.tar.bz2` em github.com/k2-fsa/sherpa-onnx/releases (tag tts-models) e copie o `.onnx` e `.onnx.json` para `tools/`.

## Voz atual: Kokoro (mais natural que o Piper)
`pip install kokoro-onnx soundfile` e baixe `kokoro-v1.0.onnx` + `voices-v1.0.bin` de
github.com/thewh1teagle/kokoro-onnx/releases (tag model-files-v1.0) para `tools/kokoro/`.
Vozes pt-BR: `pm_alex` (narrador / Red John grave), `pm_santa` (você, chefe, Jane), `pf_dora` (mãe — feminina).
Troque o elenco em `VOICES` dentro de `tools/gerar-voz.py`.

## Episódios em quadrinhos (animação 2D, `src/comic/`)
Estilo novo, desenhado do zero em vetor: contorno a tinta, sombra reticulada, luz de recorte rosa/ciano,
fundo com cores separadas, painéis de HQ, onomatopeias e animação "em dois" (12 quadros por segundo).
- `src/comic/kit.tsx` (ferramentas), `chars.tsx` (personagens), `sets.tsx` (cenários), `ui.tsx` (celular, legendas, enquete), `Ep08.tsx` (cenas).
- Textos e tempos: `src/episodes/ep08.ts` (o mesmo formato dos outros episódios; `glitch: [...]` marca os quadros de falha).
- Passo a passo:
  1. `python3 tools/gerar-voz.py ep08` (voz) e `python3 tools/gerar-beat.py ep08` (batida cortada no ritmo das cenas)
  2. `npx remotion render src/index.ts EseApagadasHQ out/ep8-raw.mp4 --crf=16`
  3. `python3 tools/pos-hq.py ep08 out/ep8-raw.mp4 out/e-se-ep07-hq.mp4` (falhas de imagem + áudio normalizado)
