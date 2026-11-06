# Voz
`python3 tools/gerar-voz.py` gera a narração (Piper, voz pt-BR "edresson") e as durações dos planos.
O modelo `.onnx` (63 MB) não vai para o git: baixe de
https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-pt-br-edresson-low.tar.gz
e extraia em `tools/`. Para uma voz melhor, gere os MP3 no ElevenLabs e salve como `public/audio/shots/00.mp3 … 12.mp3`, atualizando `public/audio/durations.json`.
