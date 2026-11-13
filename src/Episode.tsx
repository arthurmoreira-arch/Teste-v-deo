import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {World3D} from './World3D';
import {Overlay} from './Overlay';
import {Episode as Ep} from './script';
import {EpProvider, useEp} from './ep';
import {STYLE} from './style';

const HAS_NARRATION = true; // public/audio/<ep>/shots/NN.mp3 (gerado por tools/gerar-voz.py)
const HAS_MUSIC = true; // public/audio/music.mp3 (gerado por tools/gerar-fx.py)

const Flash = ({hit}: {hit: boolean}) => {
  const v = STYLE.verse;
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 7], [hit ? 0.75 : 0.35, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: v ? (hit ? '#ff2bd6' : '#ffe84a') : hit ? '#ff1a1a' : '#ffffff', opacity: o, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

const Progress = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: `${(f / durationInFrames) * 100}%`, background: '#f7c61a', boxShadow: '0 0 18px #f7c61a'}} />
  );
};

const Body = () => {
  const {ep, frames, starts} = useEp();
  // música abaixa nos planos de suspense
  const tense = (f: number) => ep.shots.some((s, i) => s.tone === 'suspense' && f >= starts[i] && f < starts[i] + frames(s));
  const verse = ep.style === 'verse';
  STYLE.verse = verse;
  const frame = useCurrentFrame();
  let idx = ep.shots.length - 1;
  for (let i = 0; i < ep.shots.length; i++) if (frame < starts[i] + frames(ep.shots[i])) { idx = i; break; }
  const local = frame - starts[idx];
  const hitShot = ep.shots[idx].sfx === 'hit';
  // separação de cores (vermelho/azul): leve o tempo todo, forte nos primeiros quadros de cada corte
  const burst = local < 6 && !ep.shots[idx].cover ? (1 - local / 6) * (hitShot ? 22 : 12) : 0;
  const d = 3 + burst;
  return (
  <AbsoluteFill style={{backgroundColor: '#050507'}}>
    {verse && (
      <svg width="0" height="0" style={{position: 'absolute'}}>
        <filter id="chroma" x="-5%" y="-5%" width="110%" height="110%">
          <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feOffset in="r" dx={d} dy={d * 0.3} result="ro" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feOffset in="b" dx={-d} dy={-d * 0.3} result="bo" />
          <feBlend in="ro" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="bo" mode="screen" />
        </filter>
      </svg>
    )}
    {/* correção de cor: mais contraste e saturação, look mais "finalizado" */}
    <AbsoluteFill style={{filter: verse ? 'url(#chroma) contrast(1.18) saturate(1.55) brightness(1.04)' : 'contrast(1.1) saturate(1.2) brightness(1.03)'}}>
      <World3D />
    </AbsoluteFill>
    {verse && (
      <>
        {/* retícula de quadrinhos: pontos pretos nas sombras (base) e pontos rosa/ciano nos cantos */}
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.9) 2.6px, transparent 3.2px)', backgroundSize: '13px 13px', mixBlendMode: 'multiply', opacity: 0.42, WebkitMaskImage: 'linear-gradient(200deg, transparent 30%, #000 95%)', maskImage: 'linear-gradient(200deg, transparent 30%, #000 95%)', pointerEvents: 'none'}} />
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(255,43,214,0.95) 3px, transparent 3.8px)', backgroundSize: '18px 18px', backgroundPosition: `${Math.floor(frame / 2) % 2 * 3}px 0`, mixBlendMode: 'screen', opacity: 0.5, WebkitMaskImage: 'radial-gradient(ellipse at 100% 0%, #000 0%, transparent 45%)', maskImage: 'radial-gradient(ellipse at 100% 0%, #000 0%, transparent 45%)', pointerEvents: 'none'}} />
        <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(34,224,255,0.95) 3px, transparent 3.8px)', backgroundSize: '18px 18px', mixBlendMode: 'screen', opacity: 0.45, WebkitMaskImage: 'radial-gradient(ellipse at 0% 100%, #000 0%, transparent 42%)', maskImage: 'radial-gradient(ellipse at 0% 100%, #000 0%, transparent 42%)', pointerEvents: 'none'}} />
        {/* hachura diagonal leve */}
        <AbsoluteFill style={{backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.5) 0 2px, transparent 2px 9px)', mixBlendMode: 'multiply', opacity: 0.18, WebkitMaskImage: 'linear-gradient(20deg, #000 0%, transparent 35%)', maskImage: 'linear-gradient(20deg, #000 0%, transparent 35%)', pointerEvents: 'none'}} />
        {/* linhas de impacto nos cortes fortes */}
        {hitShot && local < 10 && !ep.shots[idx].cover && (
          <AbsoluteFill style={{background: 'repeating-conic-gradient(from 0deg at 50% 45%, rgba(255,255,255,0.95) 0deg 1.2deg, transparent 1.2deg 7deg)', WebkitMaskImage: 'radial-gradient(circle at 50% 45%, transparent 28%, #000 62%)', maskImage: 'radial-gradient(circle at 50% 45%, transparent 28%, #000 62%)', opacity: 1 - local / 10, transform: `rotate(${Math.floor(local / 2) * 3}deg) scale(1.6)`, pointerEvents: 'none'}} />
        )}
      </>
    )}
    {ep.shots.map((s, i) => (
      <Sequence key={s.id} from={starts[i]} durationInFrames={frames(s)}>
        {s.term && <Audio src={staticFile('audio/type.mp3')} volume={0.5} />}
        {s.tone === 'suspense' && <Audio src={staticFile('audio/tension.mp3')} volume={0.55} />}
        {!s.cover && <Flash hit={s.sfx === 'hit'} />}
        <Overlay shot={s} />
        <Audio src={staticFile(s.sfx === 'hit' ? 'audio/hit.mp3' : 'audio/whoosh.mp3')} volume={s.sfx === 'hit' ? 0.7 : 0.22} />
        {HAS_NARRATION && <Audio src={staticFile(`audio/${ep.id}/shots/${String(i).padStart(2, '0')}.mp3`)} volume={1} />}
      </Sequence>
    ))}
    {verse && <AbsoluteFill style={{border: '12px solid #000', boxShadow: 'inset 0 0 0 5px #fff', pointerEvents: 'none'}} />}
    <Progress />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
    {HAS_MUSIC && <Audio src={staticFile('audio/music.mp3')} volume={(f) => Math.min(tense(f) ? 0.1 : 0.26, f / 45 * 0.26)} />}
  </AbsoluteFill>
  );
};

export const Episode = ({ep}: {ep: Ep}) => (
  <EpProvider ep={ep}>
    <Body />
  </EpProvider>
);
