// Episódio 11 — "Ela me segue" (PARTE 1): perseguição de terror em formato cena de cinema (16:9 no meio do Reels).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, INK, ease, pop, prog, twos} from './kit';
import {Alley, Avenue, CH, CW, Crowd, Dumpster, Fig, HANG, JUMP, LOOK, STAND, Sidewalk, TrainSide, WAVE, run} from './cine';
import {Captions, Letter} from './ui';
import {ComicShot} from '../episodes/ep08';
import {PAD, ep11} from '../episodes/ep11';
import {timingOf} from './Ep08';

type SP = {f: number; dur: number; shot: ComicShot};
const PAL = {red: '#ff9a2e'};
const PY = 650; // topo da tela de cinema
const PH = 608; // 1080 * 9/16

/** Tela de cinema 16:9: tudo dentro é desenhado em 1920x1080. */
const Cine = ({children, zoom = 1, cx = CW / 2, cy = CH / 2, shake = 0, f = 0}: {children: React.ReactNode; zoom?: number; cx?: number; cy?: number; shake?: number; f?: number}) => {
  const f2 = twos(f);
  const sx = shake ? (f2 % 4 ? shake : -shake) : 0;
  return (
    <svg width={1080} height={PH} viewBox={`0 0 ${CW} ${CH}`} style={{position: 'absolute', left: 0, top: PY}}>
      <defs>
        <clipPath id="cineClip">
          <rect x={0} y={0} width={CW} height={CH} />
        </clipPath>
      </defs>
      <g clipPath="url(#cineClip)">
        <g transform={`translate(${CW / 2 + sx},${CH / 2}) scale(${zoom}) translate(${-cx},${-cy})`}>{children}</g>
        {/* granulação + vinheta de cinema */}
        <rect x={0} y={0} width={CW} height={CH} fill="url(#vig)" />
      </g>
      <defs>
        <radialGradient id="vig" cx="50%" cy="50%" r="70%">
          <stop offset="0.6" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.55" />
        </radialGradient>
      </defs>
    </svg>
  );
};

/** Riscos de velocidade horizontais. */
const Streaks = ({f, n = 14, op = 0.35}: {f: number; n?: number; op?: number}) => (
  <g opacity={op}>
    {Array.from({length: n}).map((_, i) => {
      const y = ((i * 137) % 1000) + 40;
      const x = ((i * 523 - twos(f) * 60) % 2600 + 2600) % 2600 - 400;
      return <rect key={i} x={x} y={y} width={300 + (i % 4) * 120} height={5} fill="#fff" />;
    })}
  </g>
);

// ================================================================ cenas
const S1 = ({f, dur}: SP) => {
  const k = prog(f, 0, dur);
  const t = twos(f) / 30;
  const x = 380 + 1150 * ease(k);
  const y = 560 - Math.sin(Math.PI * Math.min(1, k * 1.2)) * 220;
  return (
    <Cine f={f} zoom={1.08 - 0.06 * k} cx={900 + 120 * k} cy={540}>
      <Avenue t={t} cam={-200 * k} />
      <Fig uid="h1" x={x} y={y} s={1.15} pose={k < 0.85 ? JUMP : run(t * 14)} look={LOOK.heroi} />
      <Streaks f={f} n={10} op={0.25} />
    </Cine>
  );
};

const S2 = ({f, dur}: SP) => {
  const k = prog(f, 0, dur);
  const t = twos(f) / 30;
  return (
    <Cine f={f} zoom={1.15} cx={960} cy={560}>
      <Avenue t={t} cam={100} cars={false} />
      <Fig uid="h2" x={420 + 900 * k} y={600} s={1.35} pose={run(t * 16)} look={LOOK.heroi} />
      {/* carros em primeiro plano passando */}
      <g transform={`translate(${-120 - 300 * k},760) scale(2.2)`}>
        <rect x={-200} y={-160} width={420} height={220} rx={50} fill="#2e5a90" stroke={INK} strokeWidth={8} />
        <rect x={-150} y={-260} width={300} height={120} rx={30} fill="#26507e" stroke={INK} strokeWidth={8} />
      </g>
      <g transform={`translate(${2050 - 260 * k},780) scale(2.3)`}>
        <rect x={-200} y={-160} width={420} height={220} rx={50} fill="#f2c230" stroke={INK} strokeWidth={8} />
        <rect x={-150} y={-260} width={300} height={120} rx={30} fill="#e0b028" stroke={INK} strokeWidth={8} />
        <rect x={-60} y={-300} width={120} height={44} rx={8} fill="#fff6c8" stroke={INK} strokeWidth={6} />
      </g>
      <Streaks f={f} n={16} op={0.3} />
    </Cine>
  );
};

const S3 = ({f, dur}: SP) => {
  const k = prog(f, 0, dur);
  const t = twos(f) / 30;
  return (
    <Cine f={f} zoom={1.0 + 0.12 * ease(k)} cx={960 + 80 * k} cy={540}>
      <Sidewalk pan={-200 * k} />
      <Crowd t={t} n={6} coisaAt={3} pan={-200 * k} />
    </Cine>
  );
};

const S4 = ({f, dur}: SP) => {
  const k = prog(f, 0, dur);
  const t = twos(f) / 30;
  return (
    <Cine f={f} zoom={1.05} cx={960} cy={540} shake={f < 10 ? 8 : 0}>
      <Sidewalk pan={-400} night={0.3} />
      <Fig uid="h4" x={500 + 500 * k} y={560} s={1.1} pose={run(t * 16)} look={LOOK.heroi} />
      <Fig uid="c4" x={1650 - 120 * ease(k)} y={530} s={1.25 + 0.1 * k} face={-1} pose={STAND} look={LOOK.coisa} rim="#ffffff" />
      <g transform="translate(960,980)">
        <rect x={-210} y={-60} width={420} height={110} rx={18} fill={INK} stroke={C.red} strokeWidth={8} />
        <text x={0} y={30} textAnchor="middle" fontFamily="BangersX" fontSize={96} fill="#ff4a5e">
          {`${Math.max(10, Math.round(30 - 20 * ease(prog(f, 0, 30))))} METROS`}
        </text>
      </g>
    </Cine>
  );
};

const S5 = ({f, dur}: SP) => {
  const k = prog(f, 0, dur);
  const t = twos(f) / 30;
  const z = ease(k);
  return (
    <Cine f={f} zoom={1.0 + 0.15 * z} cx={960} cy={500}>
      <Alley night={0.3} />
      <Fig uid="p5a" x={920} y={392} s={0.16} pose={STAND} look={LOOK.pm} shadow={false} />
      <Fig uid="p5b" x={1000} y={392} s={0.16} face={-1} pose={STAND} look={LOOK.pm} shadow={false} />
      <Fig uid="h5" x={960 - 260 * (1 - z)} y={900 - 420 * z} s={0.95 - 0.6 * z} pose={run(t * 16)} look={LOOK.heroi} />
      <g transform="translate(1560,880) scale(0.9)">
        <Dumpster />
      </g>
    </Cine>
  );
};

const S6 = ({f, dur}: SP) => {
  const k = prog(f, 0, dur);
  return (
    <Cine f={f} zoom={1.25 + 0.08 * k} cx={960} cy={520}>
      <Alley night={0.35} />
      <Fig uid="p6a" x={800} y={560} s={0.85} pose={{...WAVE, sh: [8, 100], el: [12, -10]}} look={LOOK.pm} />
      <Fig uid="p6b" x={1110} y={560} s={0.85} face={-1} pose={STAND} look={LOOK.pm} />
      <g transform="translate(1600,860) scale(1.1)">
        <Dumpster />
      </g>
    </Cine>
  );
};

const S7 = ({f, dur}: SP) => {
  const smile = f >= 66;
  const k = prog(f, 66, 84);
  return (
    <Cine f={f} zoom={1.25 + 1.3 * ease(k)} cx={960} cy={520 - 190 * ease(k)}>
      <Alley night={0.35 + 0.3 * ease(k)} />
      <Fig uid="p7a" x={800} y={560} s={0.85} pose={STAND} look={smile ? LOOK.pmSorri : LOOK.pm} />
      <Fig uid="p7b" x={1110} y={560} s={0.85} face={-1} pose={STAND} look={smile ? LOOK.pmSorri : LOOK.pm} />
      <g transform="translate(1600,860) scale(1.1)">
        <Dumpster lid={smile ? 0.5 : 0} eyes={smile ? 1 : 0} />
      </g>
    </Cine>
  );
};

const S8 = ({f, dur}: SP) => (
  <Cine f={f} zoom={3.4 + 0.4 * ease(f / dur)} cx={960} cy={300} shake={f < 14 ? 10 : 0}>
    <rect x={-400} y={-400} width={2800} height={2000} fill="#14040c" />
    <Fig uid="c8" x={960} y={560} s={1.2} pose={STAND} look={LOOK.coisa} rim="#ff4a5e" shadow={false} />
  </Cine>
);

const S9 = ({f, dur}: SP) => {
  const t = twos(f) / 30;
  const k = prog(f, 0, dur);
  return (
    <Cine f={f} zoom={1.05} cx={960} cy={540}>
      <TrainSide t={t} />
      <g opacity={1 - ease(prog(f, dur * 0.4, dur))}>
        <Fig uid="c9" x={260 - 500 * k} y={430} s={0.6} pose={{...WAVE, sh: [8, 150 + Math.sin(t * 12) * 20], el: [12, 20]}} look={LOOK.coisa} rim="#ffffff" />
      </g>
      <Fig uid="h9" x={1180} y={520} s={1.05} pose={HANG} look={LOOK.heroi} />
      <Streaks f={f} n={18} op={0.3} />
    </Cine>
  );
};

const S10 = ({f, dur}: SP) => {
  const show = f >= 56;
  const a = ease(prog(f, 56, 66));
  return (
    <Cine f={f} zoom={1.0 + 0.1 * ease(f / dur)} cx={960} cy={540} shake={show && f < 66 ? 8 : 0}>
      <rect x={-200} y={-200} width={2400} height={1600} fill="#9aa0b4" />
      <rect x={260} y={90} width={1400} height={900} rx={70} fill="#0a0e24" stroke={INK} strokeWidth={14} />
      {/* reflexos no vidro */}
      <g opacity={0.75}>
        <Fig uid="h10" x={760} y={760} s={1.6} pose={{...STAND, head: -6}} look={LOOK.heroi} shadow={false} />
      </g>
      {show && (
        <g opacity={0.8 * a}>
          <Fig uid="c10" x={1180} y={760} s={1.75} face={-1} pose={STAND} look={LOOK.coisa} rim="#ff4a5e" shadow={false} />
        </g>
      )}
      <path d="M300,110 L620,110 L380,970 L300,970 Z" fill="#fff" opacity={0.08} />
      <rect x={260} y={90} width={1400} height={900} rx={70} fill="#3a6ac8" opacity={0.15} />
    </Cine>
  );
};

const Btn = ({f, at, bg, icon, big, small}: {f: number; at: number; bg: string; icon: string; big: string; small: string}) => (
  <div style={{transform: `scale(${pop(f, at)})`, margin: '16px 50px', background: bg, border: `8px solid ${INK}`, borderRadius: 30, boxShadow: `12px 12px 0 ${INK}`, padding: '16px 34px', display: 'flex', alignItems: 'center', gap: 26}}>
    <div style={{fontSize: 90}}>{icon}</div>
    <div>
      <div style={{fontFamily: 'BangersX', fontSize: 116, lineHeight: 1, color: '#fff', WebkitTextStroke: `8px ${INK}`, paintOrder: 'stroke fill', letterSpacing: 3}}>{big}</div>
      <div style={{fontFamily: 'OswaldC', fontWeight: 700, fontSize: 40, color: '#fff'}}>{small}</div>
    </div>
  </div>
);

const S11 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <div style={{opacity: 0.35}}>
      <S10 f={90} dur={100} shot={shot} />
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{transform: `scale(${pop(f, 2)})`}}>
        <Letter size={120} stroke={12} halo={C.white}>
          O que você faz?
        </Letter>
      </div>
      <div style={{marginTop: 14, transform: `scale(${pop(f, 10)})`, fontFamily: 'OswaldC', fontWeight: 700, fontSize: 54, color: C.yellow, textShadow: `0 4px 0 ${INK}`}}>COMENTA UMA PALAVRA 👇</div>
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 620}}>
      <Btn f={f} at={18} bg="#e8213a" icon="🚆" big="PULAR" small="do trem andando" />
      <Btn f={f} at={28} bg="#2a6fd1" icon="👀" big="OLHAR" small="pro lado" />
    </div>
    <div style={{position: 'absolute', left: 90, right: 90, top: 1080, transform: `scale(${pop(f, 38)})`}}>
      <div style={{height: 22, borderRadius: 11, background: '#2a2a44', border: `4px solid ${INK}`, overflow: 'hidden'}}>
        <div style={{height: '100%', width: `${30 + 40 * ease(prog(f, 38, dur))}%`, background: C.yellow}} />
      </div>
      <div style={{marginTop: 14, textAlign: 'center', fontFamily: 'OswaldC', fontWeight: 700, fontSize: 46, color: '#fff'}}>A mais votada decide a PARTE 2</div>
    </div>
  </AbsoluteFill>
);

const SCENES: Record<string, (p: SP) => React.ReactElement> = {gancho: S1, carros: S2, calcada: S3, perto: S4, beco: S5, policial: S6, sorriram: S7, achei: S8, trem: S9, reflexo: S10, escolha: S11};

// ================================================================ montagem
export const ep11Timing = timingOf(ep11.shots, ep11.durations, PAD);

const Shot = ({i}: {i: number}) => {
  const f = useCurrentFrame();
  const shot = ep11.shots[i];
  const dur = ep11Timing.frames[i];
  const Scene = SCENES[shot.id];
  const hit = shot.sfx === 'hit';
  const f2 = twos(f);
  const vulto = shot.text.includes('{vulto:');
  const final = shot.id === 'escolha';
  return (
    <AbsoluteFill>
      <Scene f={f} dur={dur} shot={shot} />
      {i > 0 && hit && f < 6 && <div style={{position: 'absolute', left: 0, top: PY, width: 1080, height: PH, background: C.red, opacity: [0.55, 0.3, 0.1][Math.floor(f2 / 2)], mixBlendMode: 'screen'}} />}
      {!final && <Captions text={shot.text} f={f} dur={dur} y={PY + PH + 70} size={vulto ? 116 : 96} palette={PAL} />}
    </AbsoluteFill>
  );
};

export const ComicEp11 = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {frames, starts} = ep11Timing;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* gancho fixo em cima (some na escolha final) */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, opacity: frame < starts[starts.length - 1] ? 1 : 0, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Letter size={92} stroke={10} halo={C.white} color={C.white}>
          Ela me segue
        </Letter>
        <Letter size={92} stroke={10} halo={C.white} color="#ff4a5e" rot={1.5}>
          há 3 dias.
        </Letter>
      </div>
      {ep11.shots.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={frames[i]}>
          <Shot i={i} />
          {s.sfx === 'hit' && <Audio src={staticFile('audio/hit.mp3')} volume={0.6} />}
          {s.tone === 'suspense' && <Audio src={staticFile('audio/tension.mp3')} volume={0.35} />}
          <Audio src={staticFile(`audio/${ep11.id}/shots/${String(i).padStart(2, '0')}.mp3`)} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', left: 40, top: 100, background: C.red, border: `5px solid ${INK}`, borderRadius: 12, padding: '2px 20px', fontFamily: 'BangersX', fontSize: 52, color: '#fff', letterSpacing: 2, transform: 'rotate(-3deg)'}}>PARTE 1</div>
      <div style={{position: 'absolute', left: 0, top: PY + PH + 8, height: 8, width: `${(frame / durationInFrames) * 100}%`, background: C.red}} />
      <Audio src={staticFile(`audio/${ep11.id}/beat.mp3`)} volume={0.12} />
    </AbsoluteFill>
  );
};
