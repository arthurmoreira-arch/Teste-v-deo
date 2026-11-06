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

## Estilo (baseado no vídeo de referência)
3D low-poly cartoon com contorno preto grosso, multidão de bonecos brancos, câmera alternando drone/close-up a cada ~2s, legenda central em Oswald (2-3 palavras, destaque *amarelo*/!vermelho!), tag "E SE #1", contador dourado e card final A/B.
Tudo em `src/`: `script.ts` (planos), `characters.tsx`, `envs.tsx`, `World3D.tsx` (Three.js), `Overlay.tsx` (legenda/HUD/poll).

Renderização em CPU é lenta (~10 min em 0.4x); use `npx remotion render ... --scale=0.5` para revisar e GPU local para o final.
