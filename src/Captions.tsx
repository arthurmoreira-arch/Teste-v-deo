import {interpolate, useCurrentFrame} from 'remotion';
import {wordsOf} from './script';

/**
 * Legenda palavra a palavra, estilo Shorts/TikTok.
 * Fica na zona segura (acima da UI do app) e destaca a palavra falada.
 */
export const Captions = ({text, duration}: {text: string; duration: number}) => {
  const frame = useCurrentFrame();
  const words = wordsOf(text);
  const speakFrames = duration - 18;
  const perWord = speakFrames / words.length;
  const active = Math.min(words.length - 1, Math.max(0, Math.floor((frame - 6) / perWord)));

  // mostra no máximo 4 palavras por vez
  const page = Math.floor(active / 4);
  const pageWords = words.slice(page * 4, page * 4 + 4);

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        bottom: 460,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0 34px',
        fontFamily: 'Impact, "Arial Black", sans-serif',
        fontSize: 96,
        textTransform: 'uppercase',
        lineHeight: 1.15,
      }}
    >
      {pageWords.map((w, i) => {
        const idx = page * 4 + i;
        const isActive = idx === active;
        const pop = isActive
          ? interpolate((frame - 6) % perWord, [0, 4], [0.85, 1.08], {extrapolateRight: 'clamp'})
          : 1;
        return (
          <span
            key={idx}
            style={{
              color: isActive ? '#ff2a2a' : '#f4f1ea',
              transform: `scale(${pop})`,
              textShadow: '0 6px 0 #000, 0 0 24px rgba(0,0,0,0.9)',
              WebkitTextStroke: '3px #000',
              paintOrder: 'stroke fill',
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
