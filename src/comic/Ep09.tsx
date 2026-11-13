// Episódio 9 — "O caos da Nvidia, explicado": notícia em quadrinhos, ritmo mais lento (planos longos, câmera suave).
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Canvas, Ghost, INK, Krackle, SpeedLines, W, ease, pop, prog, rnd, twos} from './kit';
import {CityNight, PopBG} from './sets';
import {AiIcon, Bill, Boom, Chip, Dossier, EmptyChair, Magnifier, NameCard, StockChart} from './props';
import {Ask, CaptionBox, Captions, Poll, Sfx, Tag, TitleBlock} from './ui';
import {ComicShot} from '../episodes/ep08';
import {PAD, ep09} from '../episodes/ep09';
import {timingOf} from './Ep08';

type SP = {f: number; dur: number; shot: ComicShot};
const RED = '#ff3b4e';
const GREEN = '#3ddc84';
const CRASH: [number, number][] = [[0, 0.18], [0.12, 0.3], [0.24, 0.42], [0.36, 0.58], [0.46, 0.78], [0.54, 0.92], [0.6, 0.86], [0.68, 0.72], [0.76, 0.6], [0.84, 0.46], [0.92, 0.36], [1, 0.16]];

/** Número grande que conta até o alvo. */
const Counter = ({f, at, len, label, from, to, fmt, y, color = C.yellow}: {f: number; at: number; len: number; label: string; from: number; to: number; fmt: (v: number) => string; y: number; color?: string}) => {
  const k = pop(f, at);
  if (k <= 0) return null;
  const v = from + (to - from) * ease(prog(f, at, at + len));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${k})`}}>
      <div style={{background: INK, color: C.white, fontFamily: 'OswaldC', fontWeight: 700, fontSize: 40, padding: '6px 22px', borderRadius: 10, letterSpacing: 2, transform: 'rotate(-2deg)'}}>{label}</div>
      <div style={{fontFamily: 'BangersX', fontSize: 150, lineHeight: 1, color, WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', textShadow: `9px 8px 0 ${C.magenta}, -7px -5px 0 ${C.cyan}`, transform: 'skewX(-7deg)', marginTop: 6}}>{fmt(v)}</div>
    </div>
  );
};

// ================================================================ cenas
const S1 = ({f, dur, shot}: SP) => {
  const k = f / dur;
  const zoom = 1 + 0.05 * ease(k);
  return (
    <AbsoluteFill>
      <Canvas>
        <g transform={`translate(540,1000) scale(${zoom}) translate(-540,-1000)`}>
          <Ghost d={6}>
            <CityNight f={f} base={1500} px={-40 * k} train={-260 + f * 30} />
          </Ghost>
        </g>
        <g transform="translate(110,560)">
          <StockChart w={860} h={500} pts={CRASH} k={f < 2 ? 1 : 0.35 + 0.65 * ease(prog(f, 4, dur * 0.7))} color={RED} />
        </g>
      </Canvas>
      <TitleBlock f={f} y={150} size={128} instant lines={[{t: 'O caos da', c: C.white}, {t: 'Nvidia', c: GREEN}]} />
      <CaptionBox f={f} at={-10} x={130} y={480} text="▼ − US$ 1 TRILHÃO" bg={RED} rot={-3} />
      <Captions text={shot.text} f={f} dur={dur} y={1170} />
    </AbsoluteFill>
  );
};

const S2 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const pulse = 0.5 + 0.5 * Math.sin(f2 / 5);
  const k = f / dur;
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#2a3fd0" b="#0a0a3a" dots="#22e0ff" key2="n2" />
        <SpeedLines cx={540} cy={760} n={36} r0={520} seed={2} color="#fff" opacity={0.12} />
        <g transform={`translate(540,${760 + Math.sin(f2 / 10) * 6}) rotate(${-4 + 4 * ease(k)}) scale(${0.85 * pop(f, 2) + 0.08 * ease(k)})`}>
          <Chip size={520} pulse={pulse} />
        </g>
      </Canvas>
      <CaptionBox f={f} at={30} x={150} y={300} text="CHIP = CÉREBRO DA IA 🧠" rot={-3} />
      <Captions text={shot.text} f={f} dur={dur} y={1250} />
    </AbsoluteFill>
  );
};

const S3 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const icons: {kind: 'chat' | 'image' | 'car' | 'robot'; x: number; y: number}[] = [
    {kind: 'chat', x: 210, y: 420},
    {kind: 'image', x: 870, y: 420},
    {kind: 'car', x: 210, y: 1060},
    {kind: 'robot', x: 870, y: 1060},
  ];
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#1f7a5a" b="#06261c" dots="#3ddc84" key2="n3" />
        {icons.map((ic, i) => {
          const on = f2 >= 8 + i * 12;
          return on ? <path key={i} d={`M540,740 L${ic.x},${ic.y}`} stroke={GREEN} strokeWidth={10} strokeDasharray="22 18" strokeDashoffset={-f2 * 4} /> : null;
        })}
        <g transform={`translate(540,740) scale(0.62)`}>
          <Chip size={520} pulse={0.5 + 0.5 * Math.sin(f2 / 5)} glow={GREEN} />
        </g>
        {icons.map((ic, i) => (
          <g key={i} transform={`translate(${ic.x},${ic.y}) scale(${pop(f, 8 + i * 12)})`}>
            <AiIcon kind={ic.kind} />
          </g>
        ))}
      </Canvas>
      <CaptionBox f={f} at={Math.round(dur * 0.55)} x={90} y={250} text="🏆 UMA DAS MAIS VALIOSAS DO MUNDO" bg={C.yellow} rot={-2} />
      <Captions text={shot.text} f={f} dur={dur} y={1250} />
    </AbsoluteFill>
  );
};

const S4 = ({f, dur, shot}: SP) => {
  const weeks = Math.min(6, Math.floor(prog(f, 10, dur * 0.5) * 6.999));
  const STEPS: [number, number][] = [[0, 0.95], [0.16, 0.88], [0.32, 0.78], [0.48, 0.66], [0.64, 0.5], [0.8, 0.36], [1, 0.2]];
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#5a1030" b="#14040e" dots="#ff3b4e" key2="n4" />
        <g transform="translate(110,560)">
          <StockChart w={860} h={480} pts={STEPS} k={0.05 + 0.95 * ease(prog(f, 6, dur * 0.55))} color={RED} />
        </g>
      </Canvas>
      <Counter f={f} at={6} len={dur * 0.5} label="SEMANAS SEGUIDAS EM QUEDA" from={0} to={6} fmt={() => String(weeks)} y={200} color={RED} />
      <Ask f={f} at={Math.round(dur * 0.55)} y={1100} text="vão continuar gastando? 🤔" />
      <Captions text={shot.text} f={f} dur={dur} y={1300} size={94} />
    </AbsoluteFill>
  );
};

const S5 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const shake = f2 < 12 ? (f2 % 4 ? 10 : -10) : 0;
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a={f < 4 ? '#ffffff' : '#ffe84a'} b={f < 4 ? '#ffe84a' : '#ff6a3d'} dots={INK} key2={f < 4 ? 'n5a' : 'n5b'} />
        <SpeedLines cx={540} cy={760} n={56} r0={380} seed={4 + (f2 % 6)} color={INK} opacity={0.75} />
        <g transform={`translate(${540 + shake},760) scale(${pop(f, 0)}) rotate(${-6 + (f2 % 4 ? 1 : -1)})`}>
          <Boom r={430} fill={RED} seed={3 + (Math.floor(f2 / 4) % 2)} />
          <text x={0} y={60} textAnchor="middle" fontFamily="BangersX" fontSize={210} fill={C.white} stroke={INK} strokeWidth={16} paintOrder="stroke" transform="skewX(-8)">
            12/11
          </text>
        </g>
      </Canvas>
      <CaptionBox f={f} at={8} x={150} y={250} text="📰 URGENTE" bg={C.white} rot={-4} />
      <Captions text={shot.text} f={f} dur={dur} y={1330} />
    </AbsoluteFill>
  );
};

const Spot = ({warm = false}: {warm?: boolean}) => (
  <g>
    <defs>
      <linearGradient id={`spot${warm ? 'w' : 'c'}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={warm ? '#ffe2a8' : '#cfe0ff'} stopOpacity="0.75" />
        <stop offset="1" stopColor={warm ? '#ffe2a8' : '#cfe0ff'} stopOpacity="0.08" />
      </linearGradient>
    </defs>
    <polygon points="440,0 640,0 900,1290 180,1290" fill={`url(#spot${warm ? 'w' : 'c'})`} />
    <ellipse cx={540} cy={1290} rx={380} ry={60} fill={warm ? '#ffe2a8' : '#cfe0ff'} opacity={0.35} />
  </g>
);

const S6 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const k = f / dur;
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#2a1c6a" b="#07051c" dots="#6a35d6" key2="n6" />
        <g transform={`translate(540,800) scale(${1 + 0.06 * ease(k)}) translate(-540,-800)`}>
          <Spot />
          <g transform={`translate(540,820)`}>
            <EmptyChair sway={Math.sin(f2 / 14) * 1.5} />
          </g>
        </g>
        <g transform={`translate(540,1420) scale(${pop(f, 20)})`}>
          <NameCard name="JENSEN HUANG" role="FUNDADOR · 33 ANOS NO COMANDO" />
        </g>
      </Canvas>
      <Captions text={shot.text} f={f} dur={dur} y={210} size={96} />
    </AbsoluteFill>
  );
};

const S7 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const mx = 540 + Math.sin(f2 / 16) * 260;
  const my = 760 + Math.cos(f2 / 22) * 120;
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#3a2a1a" b="#0e0806" dots="#c8954a" key2="n7" />
        <g transform={`translate(540,800) rotate(-3) scale(${0.95 * pop(f, 0)})`}>
          <Dossier stamp={pop(f, Math.round(dur * 0.35))} open={ease(prog(f, 8, 40))} />
        </g>
        <g transform={`translate(${mx},${my}) rotate(-8)`}>
          <Magnifier />
        </g>
      </Canvas>
      <CaptionBox f={f} at={6} x={90} y={250} text="SEGUNDO A IMPRENSA DOS EUA" rot={-2} />
      <CaptionBox f={f} at={Math.round(dur * 0.6)} x={430} y={1120} text="⚠ AINDA É INVESTIGAÇÃO" bg={C.white} rot={2} />
      <Captions text={shot.text} f={f} dur={dur} y={1290} size={92} />
    </AbsoluteFill>
  );
};

const S8 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const shake = f2 < 14 ? (f2 % 4 ? 9 : -9) : 0;
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#ff3b4e" b="#3a0610" dots="#ffe84a" key2="n8" />
        <SpeedLines cx={540} cy={700} n={44} r0={500} seed={6 + (f2 % 6)} color="#fff" opacity={0.25} />
        <g transform={`translate(${130 + shake},620)`}>
          <StockChart w={820} h={420} pts={[[0, 0.85], [0.3, 0.8], [0.5, 0.78], [0.62, 0.4], [0.72, 0.12], [0.86, 0.2], [1, 0.16]]} k={0.4 + 0.6 * ease(prog(f, 0, 30))} color={C.white} fill={false} />
        </g>
      </Canvas>
      <div style={{position: 'absolute', left: 0, right: 0, top: 210, display: 'flex', justifyContent: 'center', gap: 30, transform: `scale(${pop(f, 2)}) rotate(-3deg)`}}>
        <div style={{background: INK, color: C.white, fontFamily: 'BangersX', fontSize: 120, padding: '6px 30px', borderRadius: 18}}>NVDA</div>
        <div style={{background: C.white, color: RED, fontFamily: 'BangersX', fontSize: 120, padding: '6px 30px', borderRadius: 18, border: `8px solid ${INK}`}}>▼ 14%</div>
      </div>
      <Sfx text="CRASH!" f={f} at={14} x={760} y={1150} rot={-8} size={110} burst={C.yellow} color={RED} hold={30} />
      <Captions text={shot.text} f={f} dur={dur} y={1300} />
    </AbsoluteFill>
  );
};

const S9 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#1f7a5a" b="#06261c" dots="#7fd99a" key2="n9" />
        {Array.from({length: 22}).map((_, i) => {
          const t0 = rnd(i) * 40;
          const t = Math.max(0, f2 - t0);
          const x = 120 + rnd(i * 3) * 840 + Math.sin(t / 8 + i) * 50;
          const y = 1300 - t * (9 + rnd(i * 7) * 9);
          if (y < -150) return null;
          return (
            <g key={i} transform={`translate(${x},${y})`}>
              <Bill rot={(rnd(i * 5) - 0.5) * 80 + t * (rnd(i) - 0.5) * 6} s={0.8 + rnd(i * 9) * 0.5} />
            </g>
          );
        })}
      </Canvas>
      <Counter f={f} at={4} len={dur * 0.7} label="VALOR PERDIDO DESDE O RECORDE" from={0} to={1.6} fmt={(v) => `US$ ${v.toFixed(1).replace('.', ',')} TRI`} y={560} color={C.yellow} />
      <Captions text={shot.text} f={f} dur={dur} y={1250} size={92} />
    </AbsoluteFill>
  );
};

const S10 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#5a2ad0" b="#120a3a" dots="#ff6ac1" key2="n10" />
        <Spot warm />
        <g transform={`translate(540,820) scale(0.95)`}>
          <EmptyChair sway={Math.sin(f2 / 14) * 1.2} />
        </g>
        <g transform={`translate(540,1420) scale(${pop(f, 10)})`}>
          <NameCard name="COLETTE KRESS" role="CEO INTERINA" color="#7fe9ff" />
        </g>
      </Canvas>
      <Captions text={shot.text} f={f} dur={dur} y={210} size={96} />
    </AbsoluteFill>
  );
};

const S11 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const quake = f2 > dur * 0.45 ? (f2 % 4 ? 8 : -8) : 0;
  return (
    <AbsoluteFill>
      <Canvas>
        <g transform={`translate(${quake},${-Math.abs(quake) / 2})`}>
          <Ghost d={quake ? 12 : 5}>
            <CityNight f={f} base={1420} train={-300 + f * 26} />
          </Ghost>
        </g>
        {quake !== 0 && <Krackle cx={540} cy={1300} r={420} n={40} seed={f2 % 5} color={INK} />}
      </Canvas>
      <CaptionBox f={f} at={8} x={100} y={260} text="NVIDIA TREME 📉" bg={RED} rot={-3} />
      <CaptionBox f={f} at={Math.round(dur * 0.45)} x={430} y={380} text="O MUNDO DA IA TREME 🌎" bg={C.yellow} rot={2} />
      <Sfx text="TREME!" f={f} at={Math.round(dur * 0.45)} x={540} y={880} rot={-6} size={120} burst={C.magenta} hold={40} />
      <Captions text={shot.text} f={f} dur={dur} y={1230} />
    </AbsoluteFill>
  );
};

const S12 = ({f, dur, shot}: SP) => (
  <AbsoluteFill>
    <Canvas>
      <PopBG a="#1a2a7a" b="#060828" dots="#22e0ff" key2="n12" />
      <g transform={`translate(540,1470) scale(0.42)`} opacity={0.9}>
        <Chip size={520} pulse={0.5 + 0.5 * Math.sin(twos(f) / 5)} />
      </g>
    </Canvas>
    <Poll f={f} y={150} title="Ela" hi="volta?" options={['A · sim, a IA não para', 'B · não, a bolha estourou', 'C · só com um novo chefe']} footer="Manda pra quem tem ação da Nvidia 👀" />
    <CaptionBox f={f} at={40} x={250} y={760} text="📅 17/11 · RESULTADOS" bg={C.yellow} rot={-2} />
    <Captions text={shot.text} f={f} dur={dur} y={1000} size={92} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1210, textAlign: 'center', fontFamily: 'OswaldC', fontWeight: 700, fontSize: 30, color: 'rgba(255,255,255,0.75)', letterSpacing: 1}}>NÃO É RECOMENDAÇÃO DE INVESTIMENTO</div>
  </AbsoluteFill>
);

const SCENES: Record<string, (p: SP) => React.ReactElement> = {gancho: S1, chip: S2, todos: S3, queda: S4, bomba: S5, cadeira: S6, investigacao: S7, dia: S8, valor: S9, kress: S10, importa: S11, enquete: S12};

// ================================================================ montagem
export const ep09Timing = timingOf(ep09.shots, ep09.durations, PAD);

const Shot = ({i}: {i: number}) => {
  const f = useCurrentFrame();
  const shot = ep09.shots[i];
  const dur = ep09Timing.frames[i];
  const Scene = SCENES[shot.id];
  const hit = shot.sfx === 'hit';
  const f2 = twos(f);
  return (
    <AbsoluteFill>
      <Scene f={f} dur={dur} shot={shot} />
      {i > 0 && f < 6 && <AbsoluteFill style={{background: hit ? C.magenta : C.yellow, opacity: [0.7, 0.4, 0.15][Math.floor(f2 / 2)], mixBlendMode: 'screen'}} />}
      {i > 0 && f < 4 && <AbsoluteFill style={{backgroundImage: `radial-gradient(circle, ${INK} 7px, transparent 8px)`, backgroundSize: '26px 26px', opacity: 0.45, mixBlendMode: 'multiply'}} />}
    </AbsoluteFill>
  );
};

export const ComicEp09 = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {frames, starts} = ep09Timing;
  return (
    <AbsoluteFill style={{background: INK}}>
      {ep09.shots.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={frames[i]}>
          <Shot i={i} />
          <Audio src={staticFile(s.sfx === 'hit' ? 'audio/hit.mp3' : 'audio/whoosh.mp3')} volume={s.sfx === 'hit' ? 0.6 : 0.2} />
          {s.tone === 'suspense' && <Audio src={staticFile('audio/tension.mp3')} volume={0.28} />}
          <Audio src={staticFile(`audio/${ep09.id}/shots/${String(i).padStart(2, '0')}.mp3`)} />
        </Sequence>
      ))}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.85) 2.4px, transparent 3px)', backgroundSize: '12px 12px', mixBlendMode: 'multiply', opacity: 0.2, WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, transparent 45%, #000 100%)', maskImage: 'radial-gradient(ellipse at 50% 45%, transparent 45%, #000 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{border: `12px solid ${INK}`, boxShadow: `inset 0 0 0 5px ${C.white}`, pointerEvents: 'none'}} />
      <Tag text={ep09.tag} />
      <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: `${(frame / durationInFrames) * 100}%`, background: C.yellow, boxShadow: `0 0 18px ${C.yellow}`}} />
      <Audio src={staticFile(`audio/${ep09.id}/beat.mp3`)} volume={0.12} />
    </AbsoluteFill>
  );
};

export const _w = W;
