# E se… (canal dark POP) — Shorts TikTok/Instagram

Vídeos verticais 1080x1920, 30fps, feitos com **Remotion + Three.js** e voz em off de IA (pt-BR).

## Episódio 01 — E se o Patrick Jane nunca tivesse se envolvido com o Red John?

```bash
npm install
npm run dev      # Remotion Studio (preview)
npm run render   # gera out/e-se-mentalista.mp4 (~55s)
```

- Roteiro e cenas: `src/script.ts` (fonte única) e `docs/01-roteiro.md`
- Prompts de imagem (opcional): `docs/02-prompts-imagem.md` → salve em `public/cenas/01.png…07.png` e ligue `HAS_SCENE_IMAGES` em `src/EseMentalista.tsx`
- Voz: `docs/03-producao.md` → salve em `public/audio/narracao.mp3` e ligue `HAS_NARRATION`
- Título, thumbnail, hashtags e trilha: `docs/03-producao.md`

> Nota: o estilo visual atual é uma base noir (smiley vermelho em 3D, poeira, legenda palavra a palavra).
> Ele deve ser ajustado ao vídeo de referência assim que eu puder ver o arquivo.
