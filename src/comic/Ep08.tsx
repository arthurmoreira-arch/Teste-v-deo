// Episódio 8 em quadrinhos: cada plano é uma "página" com painéis, personagens e letras.
import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, Canvas, Ghost, INK, Krackle, Panel, SpeedLines, W, ease, mix, pop, twos} from './kit';
import {BackBust, BiaSilhouette, Bust, Expr, LIGHTS} from './chars';
import {Bedroom, CityNight, Facade, Office, PopBG} from './sets';
import {Ask, CaptionBox, Captions, ChatCard, FloatBubble, PhoneList, Poll, Sfx, Tag, Thumb, TitleBlock} from './ui';
import {ComicShot, ep08} from '../episodes/ep08';

const FPS = 30;
type SP = {f: number; dur: number; shot: ComicShot};

// ================================================================ 1 · gancho
const S1 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const k = f / dur;
  const zoom = 1 + 0.07 * ease(k);
  const shock = f2 >= 70;
  const after = f2 >= 98;
  const blink = f2 >= 20 && f2 < 24;
  const e: Expr = after
    ? {tilt: 0.5, look: [0, 0.6], open: 0.8, brow: 0.9, mouth: 'frown', glow: 1}
    : shock
      ? {tilt: 0.45, look: [0, 0.7], open: 1.34, pupil: 0.62, browUp: 1, mouth: 'o', glow: 1}
      : {tilt: 0.8, look: [[-0.35, 0, 0.35, 0.1][Math.floor(f2 / 6) % 4], 0.9], open: blink ? 0.05 : 0.68, mouth: 'neutral', glow: 0.95};
  const bob = Math.sin(f2 / 9) * 4 + (shock && f2 < 76 ? -16 : 0);
  return (
    <AbsoluteFill>
      <Canvas>
        <g transform={`translate(540,1000) scale(${zoom}) translate(-540,-1000)`}>
          <Ghost d={6}>
            <CityNight f={f} base={1330} px={-60 * k} train={-260 + (f - 2) * 44} />
          </Ghost>
        </g>
        <g transform={`translate(540,${1356 + bob}) scale(1.3)`}>
          <Bust uid="s1" look="voce" e={e} light={LIGHTS.night} f={f} />
        </g>
      </Canvas>
      <TitleBlock f={f} y={112} size={108} instant lines={[{t: 'Você lê as', c: C.white}, {t: 'mensagens', c: C.yellow}, {t: 'apagadas.', c: '#ff4a5e'}]} />
      {f2 < 32 && <FloatBubble f={f} x={330} y={610} />}
      {f2 >= 30 && <ChatCard name="Lucas" y={506} f={f - 30} msgs={[{t: 'e aí, vai hoje?'}, {deleted: true, reveal: 'tomara que ele não vá kkk', at: 34}]} />}
      <Sfx text="BZZT!" f={f} at={66} x={900} y={500} rot={9} size={88} />
      <Captions text={shot.text} f={f} dur={dur} y={884} />
    </AbsoluteFill>
  );
};

// ================================================================ 2 · o chefe
const S2 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const rev = f2 >= 50;
  const boss: Expr = f2 < 34 ? {brow: 0.8, mouth: 'frown', look: [0, 0.85], tilt: 0.55, open: 0.8} : f2 < 50 ? {brow: 0.2, mouth: 'smile', look: [0, 0.85], tilt: 0.5, open: 0.9} : {brow: 0.5, mouth: 'frown', look: [0.8, 0.1], turn: 0.5, open: 0.9};
  const hero: Expr = rev ? {mouth: 'smirk', browUp: 0.8, open: 1.08, look: [0, 0.45], tilt: 0.35, glow: 1, turn: 0.3} : {tilt: 0.7, look: [0, 0.9], open: 0.72, glow: 1};
  const slide = (1 - pop(f, 0)) * 60;
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#ffd84a" b="#ff6a3d" dots="#ff3b6a" key2="s2" />
        <SpeedLines cx={540} cy={900} n={30} r0={700} seed={3 + (f2 % 4)} color="#fff" opacity={0.25} />
      </Canvas>
      <Panel pts={[[40, 150], [1040, 112], [1040, 770], [40, 820]]}>
        <Canvas>
          <Office f={f} />
          <g transform={`translate(${470 - slide},${432 + Math.sin(f2 / 8) * 3}) scale(0.9)`}>
            <Bust uid="s2b" look="chefe" e={boss} light={LIGHTS.day} f={f} />
          </g>
        </Canvas>
      </Panel>
      <Panel pts={[[40, 1196], [1040, 1158], [1040, 1650], [40, 1690]]}>
        <Canvas>
          <PopBG a="#4a2ab8" b="#150c44" dots="#22e0ff" key2="s2h" />
          <g transform={`translate(${540 + slide},${1396 + (rev && f2 < 56 ? -10 : 0)}) scale(1.46)`}>
            <Bust uid="s2h" look="voce" e={hero} light={LIGHTS.night} f={f} />
          </g>
        </Canvas>
      </Panel>
      <ChatCard name="Chefe" y={640} f={f - 4} hue={C.orange} msgs={[{t: 'relatório recebido.'}, {deleted: true, reveal: 'esse aí merece um aumento', at: 40}]} />
      <Sfx text="PLIM!" f={f} at={50} x={896} y={632} rot={10} size={88} burst="#28c8ff" />
      <Captions text={shot.text} f={f} dur={dur} y={1022} />
    </AbsoluteFill>
  );
};

// ================================================================ 3 · a conversa da melhor amiga
const S3 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const k = f / dur;
  const zoom = 1 + 0.08 * ease(k);
  const tap = 40;
  const tapped = f2 >= tap;
  const e: Expr = tapped ? {tilt: 0.6, look: [0, 0.8], open: 0.9, brow: -0.6, mouth: 'neutral', glow: 1} : {tilt: 0.75, look: [0, 0.9], open: 0.7, glow: 0.95, mouth: 'neutral'};
  const skin = mix('#dd9a5f', '#311a8c', 0.14);
  // dedo: paira, toca e solta
  const press = f2 < tap - 8 ? 1 : f2 < tap ? 0.35 : f2 < tap + 8 ? 0 : 0.5;
  const tx = 700 + press * 70;
  const ty = 672 + press * 46;
  return (
    <AbsoluteFill>
      <Canvas>
        <g transform={`translate(540,1100) scale(${zoom}) translate(-540,-1100)`}>
          <Ghost d={5}>
            <Bedroom f={f} px={-30 * k} />
          </Ghost>
          <g transform={`translate(540,${1430 + Math.sin(f2 / 9) * 4}) scale(1.3)`}>
            <Bust uid="s3" look="voce" e={e} light={LIGHTS.room} f={f} />
          </g>
        </g>
      </Canvas>
      <PhoneList f={f} y={250} tapAt={tap} />
      <Canvas>
        {tapped && f2 < tap + 10 && (
          <g>
            <circle cx={700} cy={672} r={40 + (f2 - tap) * 14} fill="none" stroke={C.yellow} strokeWidth={10} opacity={1 - (f2 - tap) / 10} />
            <circle cx={700} cy={672} r={20 + (f2 - tap) * 9} fill="none" stroke="#fff" strokeWidth={7} opacity={1 - (f2 - tap) / 10} />
          </g>
        )}
        <g transform={`translate(${tx},${ty}) rotate(24)`}>
          <Thumb skin={skin} sleeve={mix('#e8323f', '#311a8c', 0.14)} />
        </g>
      </Canvas>
      <Sfx text="TAP!" f={f} at={tap} x={880} y={500} rot={10} size={92} burst={C.magenta} hold={18} />
      <Captions text={shot.text} f={f} dur={dur} y={900} />
    </AbsoluteFill>
  );
};

// ================================================================ 4 · três mensagens apagadas
const S4 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const cf = f - 2;
  const n = cf >= 72 ? 3 : cf >= 50 ? 2 : cf >= 28 ? 1 : 0;
  const e: Expr = {open: [0.95, 1.12, 1.24, 1.36][n], pupil: [1, 0.85, 0.7, 0.55][n], brow: [-0.2, -0.5, -0.8, -1][n], browUp: [0, 0.3, 0.6, 1][n], look: [0, -0.15], glow: 1, glowColor: '#ff3b6a', tilt: -0.1};
  const jolt = [28, 50, 72].some((a) => cf >= a && cf < a + 4) ? 10 : 0;
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a="#8a1458" b="#16062a" dots="#ff2b6a" key2="s4" />
        <SpeedLines cx={540} cy={520} n={44} r0={620} seed={5 + (f2 % 6)} color="#fff" opacity={0.16} />
      </Canvas>
      <Panel pts={[[30, 936], [1050, 896], [1050, 1560], [30, 1600]]}>
        <Canvas>
          <PopBG a="#ff3b6a" b="#5a0a30" dots="#ffe84a" key2="s4e" />
          <g transform={`translate(${540 + (jolt ? (f2 % 4 ? 8 : -8) : 0)},${1262 - jolt}) scale(${2.5 + n * 0.08})`}>
            <Bust uid="s4" look="voce" e={e} light={LIGHTS.red} f={f} body={false} />
          </g>
          <Krackle cx={70} cy={1560} r={170} n={22} seed={3} color={INK} />
          <Krackle cx={1030} cy={930} r={150} n={18} seed={8} color={INK} />
        </Canvas>
      </Panel>
      <ChatCard name="Bia ❤️" y={205} f={cf} msgs={[{t: 'amiga, te amo! ❤️'}, {deleted: true, reveal: 'não aguento mais fingir', at: 22}, {deleted: true, reveal: 'ela não pode saber de nada', at: 44}, {deleted: true, reveal: 'conto ou não conto?', at: 66}]} />
      <Sfx text="BZZT!" f={f} at={26} x={830} y={200} rot={10} size={112} />
      <Captions text={shot.text} f={f} dur={dur} y={770} />
    </AbsoluteFill>
  );
};

// ================================================================ 5 · apagada há um minuto
const S5 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const k = f / dur;
  const zoom = 1.02 + 0.1 * ease(k);
  const sh = f2 < 8 ? (f2 % 4 ? 7 : -7) : 0;
  const e: Expr = {open: 1.34, pupil: 0.56, browUp: 1, brow: -0.7, mouth: 'grit', sweat: true, glow: 1, look: [0, 0.35], tilt: 0.2};
  return (
    <AbsoluteFill>
      <Canvas>
        <g transform={`translate(${540 + sh},1000) scale(${zoom}) translate(-540,-1000)`}>
          <g transform="translate(540,900) scale(1.3) translate(-540,-900)">
            <Ghost d={6}>
              <Bedroom f={f} mood={0.35} />
            </Ghost>
          </g>
          <SpeedLines cx={540} cy={930} n={40} r0={760} seed={2 + (f2 % 6)} color={C.cyan} opacity={0.22} />
          <g transform={`translate(540,${946 + Math.sin(f2 / 3) * 3}) scale(2.02)`}>
            <Bust uid="s5" look="voce" e={e} light={LIGHTS.room} f={f} />
          </g>
        </g>
      </Canvas>
      <Ask f={f} at={6} y={150} text="Você leria? Comenta 👇" />
      <CaptionBox f={f} at={12} x={70} y={318} text="⏱ apagada há 1 minuto" />
      <Captions text={shot.text} f={f} dur={dur} y={1396} />
    </AbsoluteFill>
  );
};

// ================================================================ 6 · a virada
const S6 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const cf = f - 6;
  const rev1 = cf >= 44;
  const bia = f2 >= 52;
  const hero: Expr = rev1 ? {open: 1.38, pupil: 0.5, browUp: 1, brow: -1, mouth: 'open', glow: 1, glowColor: '#ff3b6a', sweat: true} : {open: 1.1, brow: -0.5, look: [0, 0.5], tilt: 0.3, glow: 1, glowColor: '#ff3b6a', mouth: 'frown'};
  const biaE: Expr = {mouth: 'smirk', brow: 0.6, open: 0.82, look: [-0.75, 0.15], glow: 1, glowColor: C.magenta, turn: -0.4};
  const impact = f < 6;
  const slide = (1 - pop(f, 52)) * 220;
  return (
    <AbsoluteFill>
      <Canvas>
        <PopBG a={impact ? '#ffffff' : '#ff3b4e'} b={impact ? '#ffe84a' : '#3a0618'} dots={impact ? INK : '#ffe84a'} key2={impact ? 's6i' : 's6'} />
        <SpeedLines cx={540} cy={470} n={56} r0={impact ? 260 : 600} seed={7 + (f2 % 6)} color={impact ? INK : '#fff'} opacity={impact ? 0.9 : 0.2} />
      </Canvas>
      <Panel pts={[[30, 838], [524, 818], [492, 1562], [30, 1592]]}>
        <Canvas>
          <PopBG a="#5a2ad0" b="#150a44" dots="#22e0ff" key2="s6h" />
          <g transform={`translate(${272 + (rev1 && cf < 50 ? (f2 % 4 ? 8 : -8) : 0)},1190) scale(2.15)`}>
            <Bust uid="s6h" look="voce" e={hero} light={LIGHTS.red} f={f} body={false} />
          </g>
        </Canvas>
      </Panel>
      {f2 >= 8 && !bia && (
        <Panel pts={[[556, 816], [1050, 796], [1050, 1592], [524, 1562]]}>
          <Canvas>
            <PopBG a="#3a1c9c" b="#0c0630" dots="#ff2bd6" key2="s6t" />
            <g transform={`translate(795,${1120 + (Math.floor(f2 / 4) % 2 ? 4 : -4)})`}>
              <path d="M-178,-84 h356 a84,84 0 0 1 0,168 h-270 l-70,62 l14,-66 a84,84 0 0 1 -30,-164 Z" fill="#2a2f44" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
              {[0, 1, 2].map((i) => {
                const up = Math.floor(f2 / 4) % 3 === i;
                return <circle key={i} cx={-92 + i * 92} cy={up ? -24 : 0} r={up ? 32 : 27} fill={up ? C.yellow : '#c3cae0'} stroke={INK} strokeWidth={7} />;
              })}
            </g>
            <text x={795} y={1338} textAnchor="middle" fontFamily="OswaldC" fontWeight={700} fontSize={58} fill={C.white} stroke={INK} strokeWidth={10} paintOrder="stroke" strokeLinejoin="round">
              BIA ESTÁ
            </text>
            <text x={795} y={1406} textAnchor="middle" fontFamily="OswaldC" fontWeight={700} fontSize={58} fill={C.yellow} stroke={INK} strokeWidth={10} paintOrder="stroke" strokeLinejoin="round">
              DIGITANDO…
            </text>
          </Canvas>
        </Panel>
      )}
      {bia && (
        <div style={{position: 'absolute', inset: 0, transform: `translateX(${slide}px)`}}>
          <Panel pts={[[556, 816], [1050, 796], [1050, 1592], [524, 1562]]}>
            <Canvas>
              <PopBG a="#ff2bd6" b="#3a0a4a" dots="#ffe84a" key2="s6b" />
              <g transform="translate(792,1200) scale(2.05)">
                <Bust uid="s6b" look="bia" e={biaE} light={LIGHTS.red} f={f} />
              </g>
              <Krackle cx={1040} cy={1570} r={160} n={20} seed={5} color={INK} />
            </Canvas>
          </Panel>
        </div>
      )}
      <ChatCard name="Bia ❤️" y={196} f={cf} msgs={[{t: 'tá acordada?'}, {deleted: true, reveal: 'eu sei que você consegue ler.', at: 38}, {deleted: true, reveal: 'e agora?', at: 66}]} />
      <Sfx text="!?" f={f} at={50} x={270} y={900} rot={-12} size={150} burst={C.yellow} color="#ff4a5e" hold={22} />
      <Captions text={shot.text} f={f} dur={dur} y={694} />
    </AbsoluteFill>
  );
};

// ================================================================ 7 · enquete
const S7 = ({f, dur, shot}: SP) => {
  const f2 = twos(f);
  const k = f / dur;
  const zoom = 1.2 + 0.16 * ease(k);
  return (
    <AbsoluteFill>
      <Canvas>
        <defs>
          <clipPath id="biaWin">
            <rect x={420} y={1030} width={240} height={300} />
          </clipPath>
          <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b0824" stopOpacity="0.92" />
            <stop offset="1" stopColor="#0b0824" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g transform={`translate(540,1180) scale(${zoom}) translate(-540,-1180)`}>
          <g transform="translate(86,0)">
            <Facade f={f} />
            <g clipPath="url(#biaWin)">
              <g transform={`translate(${540 + Math.sin(f2 / 10) * 3},1262) scale(0.66)`}>
                <BiaSilhouette glow={0.6 + 0.4 * Math.sin(f2 / 4)} />
              </g>
            </g>
            <path d="M540,1030 v300 M420,1170 h240" stroke={INK} strokeWidth={8} />
          </g>
        </g>
        <rect x={0} y={0} width={W} height={1000} fill="url(#topShade)" />
        <g transform={`translate(292,${1668 + Math.sin(f2 / 9) * 3}) scale(1.3)`}>
          <BackBust uid="s7" light={{...LIGHTS.night, rimL: C.magenta, rimR: C.cyan}} />
        </g>
      </Canvas>
      <Poll f={f} y={170} title="Você" hi="responde?" options={['A · finjo que não vi', 'B · mando o print', 'C · apago ela da minha vida']} footer="Manda pra quem mais apaga mensagem 👀" />
      <Captions text={shot.text} f={f} dur={dur} y={856} size={96} />
    </AbsoluteFill>
  );
};

const SCENES: Record<string, (p: SP) => React.ReactElement> = {gancho: S1, engracado: S2, amiga: S3, tres: S4, minuto: S5, twist: S6, enquete: S7};
// ================================================================ montagem
export const timingOf = (shots: ComicShot[], durations: Record<string, number>) => {
  const frames = shots.map((s) => {
    const d = durations[s.id];
    return d ? Math.round((d + 0.3) * FPS) : 90;
  });
  const starts: number[] = [];
  frames.forEach((_, i) => starts.push(i === 0 ? 0 : starts[i - 1] + frames[i - 1]));
  return {frames, starts, total: starts[starts.length - 1] + frames[frames.length - 1]};
};
export const ep08Timing = timingOf(ep08.shots, ep08.durations);

const Shot = ({i}: {i: number}) => {
  const f = useCurrentFrame();
  const shot = ep08.shots[i];
  const dur = ep08Timing.frames[i];
  const Scene = SCENES[shot.id];
  const hit = shot.sfx === 'hit';
  const f2 = twos(f);
  return (
    <AbsoluteFill>
      <Scene f={f} dur={dur} shot={shot} />
      {/* corte: 3 passos de clarão reticulado */}
      {i > 0 && f < 6 && (
        <AbsoluteFill style={{background: hit ? C.magenta : C.yellow, opacity: [0.8, 0.45, 0.18][Math.floor(f2 / 2)], mixBlendMode: 'screen'}} />
      )}
      {i > 0 && f < 4 && <AbsoluteFill style={{backgroundImage: `radial-gradient(circle, ${INK} 7px, transparent 8px)`, backgroundSize: '26px 26px', opacity: 0.5, mixBlendMode: 'multiply'}} />}
    </AbsoluteFill>
  );
};

export const ComicEp08 = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {frames, starts} = ep08Timing;
  return (
    <AbsoluteFill style={{background: INK}}>
      {ep08.shots.map((s, i) => (
        <Sequence key={s.id} from={starts[i]} durationInFrames={frames[i]}>
          <Shot i={i} />
          <Audio src={staticFile(s.sfx === 'hit' ? 'audio/hit.mp3' : 'audio/whoosh.mp3')} volume={s.sfx === 'hit' ? 0.7 : 0.25} />
          {s.tone === 'suspense' && <Audio src={staticFile('audio/tension.mp3')} volume={0.32} />}
          <Audio src={staticFile(`audio/${ep08.id}/shots/${String(i).padStart(2, '0')}.mp3`)} />
        </Sequence>
      ))}
      {/* textura de papel/retícula e moldura de página */}
      <AbsoluteFill style={{backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.85) 2.4px, transparent 3px)', backgroundSize: '12px 12px', mixBlendMode: 'multiply', opacity: 0.22, WebkitMaskImage: 'radial-gradient(ellipse at 50% 45%, transparent 45%, #000 100%)', maskImage: 'radial-gradient(ellipse at 50% 45%, transparent 45%, #000 100%)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{border: `12px solid ${INK}`, boxShadow: `inset 0 0 0 5px ${C.white}`, pointerEvents: 'none'}} />
      <Tag text={ep08.tag} />
      <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: `${(frame / durationInFrames) * 100}%`, background: C.yellow, boxShadow: `0 0 18px ${C.yellow}`}} />
      {/* batida própria do episódio, já arranjada por cena (tools/gerar-beat.py) */}
      <Audio src={staticFile(`audio/${ep08.id}/beat.mp3`)} volume={0.15} />
    </AbsoluteFill>
  );
};
