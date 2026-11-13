// Episódio 10 — terror em POV: "A última corrida" (PARTE 1).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Canvas, INK, ease, pop, prog, twos} from './kit';
import {CarPOV, Mirror, MountPhone} from './car';
import {Captions, ChatCard, Letter, Thumb} from './ui';
import {ComicShot} from '../episodes/ep08';
import {PAD, ep10} from '../episodes/ep10';
import {timingOf} from './Ep08';

type SP = {f: number; dur: number; shot: ComicShot};
const ORANGE = '#ff9a2e';
const PAL = {red: ORANGE};
const PASS = 'Passageiro · Corrida 313';

/** Notificação do celular deslizando do topo. */
const Notif = ({f, at = 0, icon, title, body, red = false}: {f: number; at?: number; icon: string; title: string; body: string; red?: boolean}) => {
  if (f < at) return null;
  const k = at <= 0 ? 1 : ease(prog(f, at, at + 6));
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 150 - (1 - k) * 220, opacity: k}}>
      <div style={{background: red ? '#ffe3e6' : '#f4f2f8', borderRadius: 34, border: `6px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, padding: '20px 26px', display: 'flex', gap: 22, alignItems: 'center'}}>
        <div style={{width: 92, height: 92, borderRadius: 24, background: red ? C.red : '#ff4a5e', border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56}}>{icon}</div>
        <div style={{flex: 1}}>
          <div style={{fontFamily: '"Liberation Sans", Arial', fontSize: 28, color: '#6a6680'}}>{title} · agora</div>
          <div style={{fontFamily: '"Liberation Sans", Arial', fontWeight: 700, fontSize: 44, color: '#14121c', lineHeight: 1.15}}>{body}</div>
        </div>
      </div>
    </div>
  );
};

/** Celular na mão (close): conversa com o passageiro. */
const PhoneClose = ({f, msgs, alert = false}: {f: number; msgs: {t: string; at: number; red?: boolean}[]; alert?: boolean}) => (
  <>
    <Canvas>
      <CarPOV f={f} dark={0.55} speed={1} />
    </Canvas>
    <ChatCard
      name={PASS}
      y={330}
      f={f + 10}
      instant
      minH={430}
      hue={alert ? C.red : '#9a7bff'}
      msgs={msgs.filter((m) => f >= m.at).map((m) => ({t: m.t}))}
    />
    {msgs.map((m, i) => (f >= m.at && f < m.at + 8 ? <Audio key={i} src={staticFile('audio/ding.mp3')} volume={0.6} /> : null))}
    <Canvas>
      <g transform="translate(700,1240) rotate(-30)">
        <Thumb skin="#9a5c34" sleeve="#c8262f" />
      </g>
    </Canvas>
  </>
);

// ================================================================ cenas
const S1 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <Canvas>
      <CarPOV f={f} phone={<MountPhone text="Corrida 313" />} />
    </Canvas>
    <Notif f={f} at={0} icon="🚗" title={PASS} body="Não olha pelo retrovisor." />
    <Captions text={shot.text} f={f} dur={dur} y={860} />
  </AbsoluteFill>
);

const S2 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <PhoneClose f={f} msgs={[{t: 'tô no ponto.', at: 0}, {t: 'já entrei.', at: 26}]} />
    <Captions text={shot.text} f={f} dur={dur} y={1010} />
  </AbsoluteFill>
);

const S3 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <PhoneClose f={f} msgs={[{t: 'tô no ponto.', at: -99}, {t: 'já entrei.', at: -99}, {t: 'não olha pelo retrovisor.', at: 10}, {t: 'só dirige.', at: 50}]} />
    <Captions text={shot.text} f={f} dur={dur} y={1010} />
  </AbsoluteFill>
);

const S4 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <Canvas>
      <CarPOV f={f} speed={1.1} phone={<MountPhone text="em rota" />} />
    </Canvas>
    <Captions text={shot.text} f={f} dur={dur} y={860} />
  </AbsoluteFill>
);

const S5 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <Canvas>
      <CarPOV f={f} speed={1} phone={<MountPhone text="CANCELADA" alert />} />
    </Canvas>
    <Notif f={f} at={6} icon="❌" title="App de corridas" body="Corrida cancelada pelo passageiro." red />
    {f >= 6 && f < 14 && <Audio src={staticFile('audio/ding.mp3')} volume={0.6} />}
    <Captions text={shot.text} f={f} dur={dur} y={860} />
  </AbsoluteFill>
);

const S6 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <Canvas>
      <CarPOV f={f} speed={0.9} mirrorGlow shake={f < 12 ? 6 : 0} dark={0.25} phone={<MountPhone text="CANCELADA" alert />} />
    </Canvas>
    <Captions text={shot.text} f={f} dur={dur} y={820} size={118} palette={PAL} />
  </AbsoluteFill>
);

const S7 = ({f, dur, shot}: SP) => {
  const kz = f >= 70 ? ease(prog(f, 70, 82)) : 0;
  const zoom = 1.62 + 0.05 * ease(f / dur) + 0.9 * kz;
  const fx = -150 * kz * zoom;
  const fy = -110 * kz * zoom;
  return (
    <AbsoluteFill>
      <Canvas>
        <rect x={0} y={0} width={1080} height={1920} fill="#05041a" />
        <g transform={`translate(${540 + fx},${720 + fy}) scale(${zoom})`}>
          <Mirror f={f} belt glow={f >= 70} />
        </g>
      </Canvas>
      <Captions text={shot.text} f={f} dur={dur} y={1180} />
    </AbsoluteFill>
  );
};

const S8 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <PhoneClose f={f} alert msgs={[{t: 'não olha pelo retrovisor.', at: -99}, {t: 'só dirige.', at: -99}, {t: 'ele não sou eu.', at: 14}, {t: 'NÃO PARA O CARRO.', at: 44}]} />
    <Captions text={shot.text} f={f} dur={dur} y={1010} />
  </AbsoluteFill>
);

const S9 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <Canvas>
      <CarPOV f={f} speed={0.9} dark={0.15} phone={<MountPhone text="Mãe ❤️" />} />
    </Canvas>
    <Notif f={f} at={4} icon="👩" title="Mãe ❤️" body="Filho, cadê você? Vem pra casa 🙏" />
    {f >= 4 && f < 12 && <Audio src={staticFile('audio/ding.mp3')} volume={0.6} />}
    <Captions text={shot.text} f={f} dur={dur} y={860} />
  </AbsoluteFill>
);

const S10 = ({f, dur, shot}: SP) => {
  const fig = ease(prog(f, 0, 18));
  const eyes = f >= 22 ? 1 : 0;
  return (
    <AbsoluteFill>
      <Canvas>
        <rect x={0} y={0} width={1080} height={1920} fill="#05041a" />
        <g transform={`translate(540,720) scale(${1.62 + 0.25 * ease(f / dur)})`}>
          <Mirror f={f} figure={fig} eyes={eyes} belt glow />
        </g>
      </Canvas>
      <Captions text={shot.text} f={f} dur={dur} y={1180} size={118} palette={PAL} />
    </AbsoluteFill>
  );
};

const S11 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <Canvas>
      <CarPOV f={f} speed={0.5 - 0.4 * ease(f / dur)} figure={1} eyes={twos(f) % 40 < 34 ? 1 : 0} dark={0.35} mirrorGlow />
    </Canvas>
    <Captions text={shot.text} f={f} dur={dur} y={860} size={118} />
  </AbsoluteFill>
);

const Btn = ({f, at, bg, icon, big, small}: {f: number; at: number; bg: string; icon: string; big: string; small: string}) => (
  <div style={{transform: `scale(${pop(f, at)})`, margin: '18px 50px', background: bg, border: `8px solid ${INK}`, borderRadius: 30, boxShadow: `12px 12px 0 ${INK}`, padding: '20px 34px', display: 'flex', alignItems: 'center', gap: 26}}>
    <div style={{fontSize: 96}}>{icon}</div>
    <div>
      <div style={{fontFamily: 'BangersX', fontSize: 120, lineHeight: 1, color: '#fff', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', letterSpacing: 3}}>{big}</div>
      <div style={{fontFamily: 'OswaldC', fontWeight: 700, fontSize: 40, color: '#fff'}}>{small}</div>
    </div>
  </div>
);

const S12 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <Canvas>
      <CarPOV f={f} speed={0.1} figure={1} eyes={1} dark={0.72} />
    </Canvas>
    <div style={{position: 'absolute', left: 0, right: 0, top: 170, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{transform: `scale(${pop(f, 2)})`}}>
        <Letter size={124} stroke={12} halo={C.white} color={C.white}>
          O que você
        </Letter>
      </div>
      <div style={{transform: `scale(${pop(f, 6)})`}}>
        <Letter size={124} stroke={12} halo={C.white} color={C.yellow}>
          faria?
        </Letter>
      </div>
      <div style={{marginTop: 18, transform: `scale(${pop(f, 12)})`, fontFamily: 'OswaldC', fontWeight: 700, fontSize: 54, color: C.yellow, textShadow: `0 4px 0 ${INK}`}}>COMENTA UMA PALAVRA 👇</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 640}}>
      <Btn f={f} at={20} bg="#e8213a" icon="🛑" big="PARAR" small="e olhar pra trás" />
      <Btn f={f} at={30} bg="#2a6fd1" icon="💨" big="ACELERAR" small="e não olhar" />
    </div>
    <div style={{position: 'absolute', left: 90, right: 90, top: 1110, transform: `scale(${pop(f, 40)})`}}>
      <div style={{height: 22, borderRadius: 11, background: '#2a2a44', border: `4px solid ${INK}`, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${30 + 40 * ease(prog(f, 40, dur))}%`, background: C.yellow}} />
      </div>
      <div style={{marginTop: 14, textAlign: 'center', fontFamily: 'OswaldC', fontWeight: 700, fontSize: 46, color: '#fff'}}>A mais votada decide a PARTE 2</div>
    </div>
    <Captions text={shot.text} f={f} dur={dur} y={1270} size={84} />
  </AbsoluteFill>
);

const SCENES: Record<string, (p: SP) => React.ReactElement> = {gancho: S1, entrou: S2, regra: S3, beleza: S4, cancelada: S5, voz: S6, espelho: S7, msg: S8, mae: S9, para: S10, eagora: S11, escolha: S12};

// ================================================================ montagem
export const ep10Timing = timingOf(ep10.shots, ep10.durations, PAD);

const Clock = ({frame}: {frame: number}) => {
  const min = 12 + Math.floor(frame / (30 * 13));
  return (
    <div style={{position: 'absolute', right: 40, top: 54, background: INK, border: `5px solid ${C.red}`, borderRadius: 14, padding: '4px 18px', fontFamily: 'OswaldC', fontWeight: 700, fontSize: 46, color: '#fff'}}>
      🕒 03:{String(min).padStart(2, '0')}
    </div>
  );
};

const Shot = ({i}: {i: number}) => {
  const f = useCurrentFrame();
  const shot = ep10.shots[i];
  const dur = ep10Timing.frames[i];
  const Scene = SCENES[shot.id];
  const hit = shot.sfx === 'hit';
  const f2 = twos(f);
  return (
    <AbsoluteFill>
      <Scene f={f} dur={dur} shot={shot} />
      {i > 0 && hit && f < 6 && <AbsoluteFill style={{background: C.red, opacity: [0.55, 0.3, 0.1][Math.floor(f2 / 2)], mixBlendMode: 'screen'}} />}
      {i > 0 && !hit && f < 4 && <AbsoluteFill style={{background: '#000', opacity: [0.6, 0.25][Math.floor(f2 / 2)]}} />}
    </AbsoluteFill>
  );
};

export const ComicEp10 = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {frames, starts} = ep10Timing;
  return (
    <AbsoluteFill style={{background: INK}}>
      {ep10.shots.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={frames[i]}>
          <Shot i={i} />
          {s.sfx === 'hit' && <Audio src={staticFile('audio/hit.mp3')} volume={0.6} />}
          {s.tone === 'suspense' && <Audio src={staticFile('audio/tension.mp3')} volume={0.4} />}
          <Audio src={staticFile(`audio/${ep10.id}/shots/${String(i).padStart(2, '0')}.mp3`)} />
        </Sequence>
      ))}
      {/* vinheta escura + retícula */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.7) 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.85) 2.4px, transparent 3px)', backgroundSize: '12px 12px', mixBlendMode: 'multiply', opacity: 0.2, pointerEvents: 'none'}} />
      <AbsoluteFill style={{border: `12px solid ${INK}`, boxShadow: `inset 0 0 0 5px ${C.white}`, pointerEvents: 'none'}} />
      <div style={{position: 'absolute', left: 40, top: 54, background: C.red, border: `5px solid ${INK}`, borderRadius: 12, padding: '2px 20px', fontFamily: 'BangersX', fontSize: 52, color: '#fff', letterSpacing: 2, transform: 'rotate(-3deg)', boxShadow: `6px 6px 0 ${INK}`}}>PARTE 1</div>
      <Clock frame={frame} />
      <div style={{position: 'absolute', left: 0, bottom: 0, height: 10, width: `${(frame / durationInFrames) * 100}%`, background: C.red}} />
      <Audio src={staticFile(`audio/${ep10.id}/beat.mp3`)} volume={0.1} />
    </AbsoluteFill>
  );
};
