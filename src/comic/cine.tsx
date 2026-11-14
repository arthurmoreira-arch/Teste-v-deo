// Cenas "de cinema" (16:9, coordenadas 1920x1080): personagem articulado de corpo inteiro e cenários urbanos em perspectiva.
import React, {useMemo} from 'react';
import {C, Dots, INK, halftone, mix, rnd} from './kit';

export const CW = 1920;
export const CH = 1080;
const R = Math.PI / 180;

// ================================================================ personagem articulado
export type Look = {skin: string; hair: string; top: string; topSh: string; pants: string; shoe: string; cap?: string; faceless?: boolean; smile?: boolean; pale?: boolean; pack?: string};
export const LOOK: Record<string, Look> = {
  heroi: {skin: '#b97a4a', hair: '#1a1436', top: '#d8303c', topSh: '#8e1a2c', pants: '#22264a', shoe: '#f4f4f8', pack: '#1b1b2e'},
  coisa: {skin: '#d9d6e8', hair: '#d9d6e8', top: '#cfcbe0', topSh: '#8f8aa8', pants: '#bdb8d4', shoe: '#bdb8d4', faceless: true, smile: true, pale: true},
  pm: {skin: '#c99a76', hair: '#22202a', top: '#22306e', topSh: '#141c48', pants: '#1a2050', shoe: '#0b0b12', cap: '#141c48'},
  pmSorri: {skin: '#c99a76', hair: '#22202a', top: '#22306e', topSh: '#141c48', pants: '#1a2050', shoe: '#0b0b12', cap: '#141c48', smile: true},
};
export const crowdLook = (i: number): Look => {
  const tops = ['#5a8ac8', '#e08a4a', '#7a5ac8', '#4aa878', '#c84a7a', '#d8b84a'];
  const skins = ['#e8b48c', '#b97a4a', '#8a5432', '#f0c8a8', '#a86a42'];
  const t = tops[i % tops.length];
  return {skin: skins[i % skins.length], hair: i % 3 ? '#2a1a12' : '#6a4a2a', top: t, topSh: mix(t, '#1a1040', 0.4), pants: i % 2 ? '#2a3050' : '#4a3a2a', shoe: '#1a1a22'};
};

export type Pose = {lean: number; th: [number, number]; kn: [number, number]; sh: [number, number]; el: [number, number]; head?: number};
/** Ciclo de corrida (fase p em radianos). th/sh em graus a partir da vertical (positivo = para frente). */
export const run = (p: number): Pose => ({
  lean: 14,
  th: [Math.sin(p) * 46, Math.sin(p + Math.PI) * 46],
  kn: [Math.max(0, -Math.cos(p)) * 95 + 12, Math.max(0, -Math.cos(p + Math.PI)) * 95 + 12],
  sh: [Math.sin(p + Math.PI) * 52, Math.sin(p) * 52],
  el: [80, 80],
});
export const walk = (p: number): Pose => ({
  lean: 3,
  th: [Math.sin(p) * 22, Math.sin(p + Math.PI) * 22],
  kn: [Math.max(0, -Math.cos(p)) * 40 + 5, Math.max(0, -Math.cos(p + Math.PI)) * 40 + 5],
  sh: [Math.sin(p + Math.PI) * 20, Math.sin(p) * 20],
  el: [20, 20],
});
export const JUMP: Pose = {lean: 20, th: [80, -20], kn: [120, 60], sh: [-60, 120], el: [40, 30]};
export const STAND: Pose = {lean: 0, th: [4, -4], kn: [4, 4], sh: [8, -8], el: [12, 12]};
export const WAVE: Pose = {lean: 0, th: [4, -4], kn: [4, 4], sh: [8, 160], el: [12, 30]};
export const HANG: Pose = {lean: -10, th: [30, -10], kn: [70, 40], sh: [170, 150], el: [10, 20]};

type FigProps = {x: number; y: number; s?: number; face?: 1 | -1; pose: Pose; look: Look; uid: string; rim?: string; shadow?: boolean};
/** Personagem de corpo inteiro. (x,y) = quadril; altura total ~ 560*s. face = 1 olhando para a direita. */
export const Fig = ({x, y, s = 1, face = 1, pose, look, uid, rim = C.magenta, shadow = true}: FigProps) => {
  const L = look;
  const TH = 120, SH = 118, UA = 92, FA = 86, TOR = 170;
  const lean = pose.lean * R;
  const neck: [number, number] = [Math.sin(lean) * TOR, -Math.cos(lean) * TOR];
  const sho: [number, number] = [neck[0] * 0.92, neck[1] * 0.92];
  const leg = (i: 0 | 1) => {
    const a = pose.th[i] * R;
    const k: [number, number] = [Math.sin(a) * TH, Math.cos(a) * TH];
    const b = a - pose.kn[i] * R;
    const f: [number, number] = [k[0] + Math.sin(b) * SH, k[1] + Math.cos(b) * SH];
    return {k, f, b};
  };
  const arm = (i: 0 | 1) => {
    const a = pose.sh[i] * R + lean;
    const e: [number, number] = [sho[0] + Math.sin(a) * UA, sho[1] + Math.cos(a) * UA];
    const b = a + pose.el[i] * R;
    const h: [number, number] = [e[0] + Math.sin(b) * FA, e[1] + Math.cos(b) * FA];
    return {e, h};
  };
  const l0 = leg(0), l1 = leg(1), a0 = arm(0), a1 = arm(1);
  const limb = (pts: [number, number][], w: number, col: string, key: string) => {
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
    return (
      <g key={key}>
        <path d={d} fill="none" stroke={INK} strokeWidth={w + 12} strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    );
  };
  const shoe = (f: [number, number], b: number, key: string) => (
    <g key={key} transform={`translate(${f[0]},${f[1]}) rotate(${-b / R * 0.4})`}>
      <path d="M-18,-12 L40,-10 Q56,-4 52,12 L-22,14 Z" fill={L.shoe} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M-20,8 L52,8" stroke={mix(L.shoe, INK, 0.4)} strokeWidth={6} />
    </g>
  );
  const head: [number, number] = [neck[0] + Math.sin(lean) * 52, neck[1] - 52];
  const torsoD = `M${-34},10 L${34},10 L${sho[0] + 48},${sho[1] + 6} Q${sho[0]},${sho[1] - 26} ${sho[0] - 48},${sho[1] + 6} Z`;
  const bodyEls = [
    // perna e braço de trás (mais escuros)
    limb([[0, 0], l1.k, l1.f], 44, mix(L.pants, INK, 0.3), 'l1'),
    shoe(l1.f, l1.b, 's1'),
    limb([sho, a1.e, a1.h], 36, L.topSh, 'a1'),
    <circle key="h1" cx={a1.h[0]} cy={a1.h[1]} r={20} fill={mix(L.skin, INK, 0.25)} stroke={INK} strokeWidth={6} />,
  ];
  return (
    <g transform={`translate(${x},${y}) scale(${s * face},${s})`}>
      {shadow && <ellipse cx={0} cy={TH + SH + 14} rx={110} ry={20} fill="#000" opacity={0.3} />}
      {bodyEls}
      {/* mochila */}
      {L.pack && <rect x={sho[0] * 0.6 - 92} y={sho[1] * 0.55 - 40} width={70} height={120} rx={22} fill={L.pack} stroke={INK} strokeWidth={8} transform={`rotate(${pose.lean} ${sho[0] * 0.6 - 57} ${sho[1] * 0.55 + 20})`} />}
      {/* tronco */}
      <path d={torsoD} fill={L.top} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d={`M${-34},10 L${sho[0] - 48},${sho[1] + 6} L${sho[0] - 20},${sho[1] + 4} L-6,10 Z`} fill={L.topSh} opacity={0.85} />
      <path d={`M${34},10 L${sho[0] + 48},${sho[1] + 6}`} stroke={rim} strokeWidth={7} opacity={0.85} />
      {limb([[0, 0], l0.k, l0.f], 46, L.pants, 'l0')}
      {shoe(l0.f, l0.b, 's0')}
      {/* cabeça */}
      <g transform={`translate(${head[0]},${head[1]}) rotate(${(pose.head ?? 0) + pose.lean * 0.5})`}>
        <path d="M-14,30 L-16,60 L16,60 L14,30 Z" fill={mix(L.skin, INK, 0.2)} stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={0} rx={L.pale ? 38 : 44} ry={L.pale ? 58 : 50} fill={L.skin} stroke={INK} strokeWidth={8} />
        <path d="M-10,-44 Q30,-30 40,10 Q42,30 30,40 Q38,0 -10,-44 Z" fill={mix(L.skin, '#1a1040', 0.35)} />
        {!L.faceless && !L.cap && <path d="M-46,-6 L-50,-34 L-36,-58 L-16,-52 L-6,-72 L12,-56 L30,-68 L38,-46 L50,-30 L46,-4 L34,-24 L10,-30 L-14,-24 L-34,-30 Z" fill={L.hair} stroke={INK} strokeWidth={7} strokeLinejoin="round" />}
        {L.cap && (
          <g>
            <path d="M-46,-14 Q-44,-58 0,-60 Q44,-58 46,-14 Z" fill={L.cap} stroke={INK} strokeWidth={7} />
            <path d="M10,-16 L78,-12 L70,-2 L8,-4 Z" fill={INK} />
            <circle cx={-2} cy={-36} r={9} fill="#e8c84a" stroke={INK} strokeWidth={3} />
          </g>
        )}
        {!L.faceless && (
          <g>
            <ellipse cx={26} cy={2} rx={7} ry={9} fill={INK} />
            <path d="M14,-16 L38,-12" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <path d="M44,8 L52,18 L42,20" fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          </g>
        )}
        {L.smile && (
          <g>
            <path d={L.faceless ? 'M-26,16 Q8,52 40,12 Q8,36 -26,16 Z' : 'M8,22 Q30,40 48,18 Q30,30 8,22 Z'} fill="#14080e" stroke={INK} strokeWidth={4} />
            <path d={L.faceless ? 'M-20,20 Q8,40 34,16' : 'M12,24 Q30,34 44,20'} fill="none" stroke="#f4f0e0" strokeWidth={4} strokeDasharray="5 4" />
          </g>
        )}
        <path d="M-44,-10 Q-50,20 -30,44" fill="none" stroke={rim} strokeWidth={7} opacity={0.8} />
      </g>
      {limb([sho, a0.e, a0.h], 38, L.top, 'a0')}
      <circle cx={a0.h[0]} cy={a0.h[1]} r={22} fill={L.skin} stroke={INK} strokeWidth={7} />
    </g>
  );
};

// ================================================================ céu, prédios e cenários
const WIN = ['#ffd27a', '#ffe9a8', '#7fd8ff', '#ffb36b'];
export const Sky = ({t = 0, night = 0}: {t?: number; night?: number}) => (
  <g>
    <defs>
      <linearGradient id={`cineSky${night}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={mix('#ff9a6a', '#14104a', night)} />
        <stop offset="0.6" stopColor={mix('#ffc98a', '#4a1a6a', night)} />
        <stop offset="1" stopColor={mix('#fff0c0', '#c8306a', night)} />
      </linearGradient>
    </defs>
    <rect x={-200} y={-200} width={CW + 400} height={CH + 400} fill={`url(#cineSky${night})`} />
  </g>
);

/** Avenida em perspectiva (ponto de fuga no centro), carros e táxis. cam = deslocamento lateral. */
export const Avenue = ({t, cam = 0, night = 0, cars = true}: {t: number; cam?: number; night?: number; cars?: boolean}) => {
  const vx = 960 + cam * 0.2, vy = 500;
  const sun = halftone('aveSun', 900, 900, 18, '#fff3c0', (u, v) => Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.5) * 2) * 0.8);
  const blds = useMemo(() => {
    const out: React.ReactNode[] = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i < 9; i++) {
        const z0 = Math.pow(i / 9, 1.7), z1 = Math.pow((i + 1) / 9, 1.7);
        const x0 = vx + side * (30 + z0 * 1400), x1 = vx + side * (30 + z1 * 1400);
        const top0 = vy - (90 + z0 * 900 + rnd(i * 7 + side) * 200 * z0), top1 = vy - (90 + z1 * 900 + rnd(i * 7 + side) * 200 * z1);
        const bot0 = vy + 20 + z0 * 700, bot1 = vy + 20 + z1 * 700;
        const col = mix(['#8a4a5a', '#7a5a8a', '#9a6a4a', '#6a4a7a'][i % 4], '#1a1040', night * 0.6 + 0.1 * (1 - z0));
        out.push(<polygon key={`${side}${i}`} points={`${x0},${top0} ${x1},${top1} ${x1},${bot1} ${x0},${bot0}`} fill={col} stroke={INK} strokeWidth={3 + z1 * 6} />);
        for (let r = 0; r < 6; r++)
          for (let c = 0; c < 3; c++) {
            if (rnd(i * 31 + r * 7 + c + side * 3) > 0.45) continue;
            const u = (c + 0.3) / 3.2, w = 0.18;
            const xa = x0 + (x1 - x0) * u, xb = x0 + (x1 - x0) * (u + w);
            const ya = top0 + (bot0 - top0) * (0.1 + r * 0.13), yb = top1 + (bot1 - top1) * (0.1 + r * 0.13);
            const hh = (bot0 - top0) * 0.07;
            out.push(<polygon key={`w${side}${i}${r}${c}`} points={`${xa},${ya} ${xb},${ya + (yb - ya) * w} ${xb},${ya + (yb - ya) * w + hh} ${xa},${ya + hh}`} fill={WIN[(i + r + c) % 4]} opacity={0.35 + night * 0.6} />);
          }
        if (i % 3 === 1) out.push(<path key={`fe${side}${i}`} d={`M${x0 + (x1 - x0) * 0.2},${top0 + (bot0 - top0) * 0.2} l${(x1 - x0) * 0.25},${(bot0 - top0) * 0.12} l${-(x1 - x0) * 0.25},${(bot0 - top0) * 0.12} l${(x1 - x0) * 0.25},${(bot0 - top0) * 0.12}`} fill="none" stroke={INK} strokeWidth={4 + z1 * 4} />);
      }
    }
    return out;
  }, [vx, night]);
  return (
    <g>
      <Sky night={night} />
      <image href={sun} x={vx - 450} y={vy - 520} width={900} height={900} opacity={0.75 - night * 0.5} />
      <polygon points={`${vx - 20},${vy} ${vx + 20},${vy} ${vx + 1700},${CH + 200} ${vx - 1700},${CH + 200}`} fill={mix('#5a4a6a', '#1a1636', night)} />
      {[-1, 1].map((s) => (
        <polygon key={s} points={`${vx + s * 22},${vy} ${vx + s * 30},${vy} ${vx + s * 1900},${CH + 200} ${vx + s * 1500},${CH + 200}`} fill={mix('#a88a8a', '#2a2448', night)} />
      ))}
      {Array.from({length: 8}).map((_, i) => {
        const p = Math.pow(((i + (t * 0.9) % 1) / 8), 2.1);
        return <polygon key={i} points={`${vx - 3 - p * 40},${vy + p * 640} ${vx + 3 + p * 40},${vy + p * 640} ${vx + 4 + p * 60},${vy + p * 640 + 8 + p * 90} ${vx - 4 - p * 60},${vy + p * 640 + 8 + p * 90}`} fill="#fff4d0" opacity={0.85} />;
      })}
      {blds}
      {cars &&
        [0, 1, 2, 3].map((i) => {
          const p = 0.15 + i * 0.18;
          const side = i % 2 ? 1 : -1;
          const x = vx + side * (90 + p * 520), y = vy + 40 + p * 520, sc = 0.25 + p * 1.1;
          return (
            <g key={i} transform={`translate(${x},${y}) scale(${sc})`}>
              <rect x={-150} y={-120} width={300} height={140} rx={30} fill={i % 2 ? '#f2c230' : '#3a6aa8'} stroke={INK} strokeWidth={10} />
              <rect x={-110} y={-190} width={220} height={90} rx={24} fill={i % 2 ? '#e0b028' : '#2e5a90'} stroke={INK} strokeWidth={10} />
              <rect x={-96} y={-176} width={192} height={60} rx={14} fill="#2a2a4a" />
              <circle cx={-110} cy={10} r={18} fill="#ff4a4a" />
              <circle cx={110} cy={10} r={18} fill="#ff4a4a" />
              {i % 2 === 1 && <rect x={-40} y={-226} width={80} height={36} rx={6} fill="#fff6c8" stroke={INK} strokeWidth={6} />}
            </g>
          );
        })}
    </g>
  );
};

/** Calçada em vista lateral: fachada com toldo verde, escada de incêndio, árvore, grade. pan = deslocamento. */
export const Sidewalk = ({pan = 0, night = 0}: {pan?: number; night?: number}) => {
  const brick = mix('#b0583a', '#2a1a40', night * 0.7);
  return (
    <g>
      <Sky night={night} />
      <defs>
        <pattern id="brk" width={60} height={28} patternUnits="userSpaceOnUse">
          <path d="M0,0 H60 M0,14 H60 M0,0 V14 M30,14 V28" stroke={mix(brick, INK, 0.45)} strokeWidth={3} />
        </pattern>
        <Dots id="sideDots" step={13} r={3.6} color={mix(brick, INK, 0.5)} />
      </defs>
      <g transform={`translate(${pan},0)`}>
        {/* prédios do fundo */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={-600 + i * 520} y={-40 - rnd(i) * 120} width={500} height={760} fill={mix('#c8a090', '#2a2050', 0.3 + night * 0.5)} opacity={0.6} />
        ))}
        {/* fachada principal */}
        <rect x={-800} y={-60} width={3600} height={800} fill={brick} />
        <rect x={-800} y={-60} width={3600} height={800} fill="url(#brk)" />
        {Array.from({length: 9}).map((_, i) => (
          <g key={i}>
            <rect x={-700 + i * 380} y={40} width={150} height={190} fill={WIN[i % 4]} opacity={0.5 + night * 0.4} stroke={INK} strokeWidth={8} />
            <rect x={-700 + i * 380} y={290} width={150} height={190} fill={WIN[(i + 1) % 4]} opacity={0.4 + night * 0.4} stroke={INK} strokeWidth={8} />
            <path d={`M${-720 + i * 380},250 h190 M${-720 + i * 380},500 h190`} stroke={INK} strokeWidth={10} />
          </g>
        ))}
        {/* escada de incêndio */}
        <g stroke={INK} strokeWidth={8} fill="none">
          <path d="M520,250 H900 M520,500 H900 M560,500 L860,250 M520,200 V250 M900,200 V250 M520,450 V500 M900,450 V500" />
        </g>
        {/* loja com toldo */}
        <rect x={-500} y={520} width={1100} height={260} fill="#1a2a3a" stroke={INK} strokeWidth={9} />
        <rect x={-460} y={560} width={460} height={200} fill="#7ad8ff" opacity={0.35} />
        <path d="M-540,520 L640,520 L600,440 L-500,440 Z" fill="#2aa860" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
        {Array.from({length: 12}).map((_, i) => (
          <path key={i} d={`M${-500 + i * 92},440 L${-540 + i * 99},520`} stroke="#f4f4e8" strokeWidth={14} opacity={0.6} />
        ))}
        <rect x={-500} y={-60} width={3600} height={800} fill="url(#sideDots)" opacity={0.25} />
        {/* árvore */}
        <rect x={1180} y={180} width={46} height={620} fill="#4a2a1a" stroke={INK} strokeWidth={8} />
        <path d="M1203,260 L1100,120 M1203,330 L1320,200" stroke="#4a2a1a" strokeWidth={22} strokeLinecap="round" />
        {[[1080, 80, 120], [1220, 40, 140], [1350, 130, 110], [1160, 170, 100]].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={['#e8862a', '#d86a1a', '#f0a03a', '#c85a1a'][i]} stroke={INK} strokeWidth={8} />
        ))}
        {/* grade em volta da árvore */}
        <g stroke={INK} strokeWidth={7}>
          {Array.from({length: 8}).map((_, i) => (
            <path key={i} d={`M${1110 + i * 26},740 V${800}`} />
          ))}
          <path d="M1100,744 H1320" />
        </g>
      </g>
      {/* calçada e meio-fio */}
      <rect x={-200} y={780} width={CW + 400} height={180} fill={mix('#c8b8b0', '#3a3456', night)} stroke={INK} strokeWidth={8} />
      <rect x={-200} y={960} width={CW + 400} height={300} fill={mix('#5a5266', '#14122a', night)} />
    </g>
  );
};

/** Beco em perspectiva (vista de cima/atrás): paredes de tijolo, escadas de incêndio, fim iluminado. */
export const Alley = ({night = 0.4}: {night?: number}) => {
  const vx = 960, vy = 380;
  const wallL = mix('#8a3a3a', '#1a1030', night), wallR = mix('#6a2a3a', '#120a26', night);
  return (
    <g>
      <rect x={-200} y={-200} width={CW + 400} height={CH + 400} fill="#14102a" />
      {/* fim do beco: rua iluminada */}
      <rect x={vx - 110} y={vy - 260} width={220} height={300} fill="#ffcf8a" />
      <rect x={vx - 110} y={vy - 260} width={220} height={140} fill="#ff9a6a" />
      <rect x={vx - 70} y={vy - 200} width={60} height={160} fill="#c86a4a" />
      <polygon points={`${vx - 110},${vy + 40} ${vx + 110},${vy + 40} ${vx + 900},${CH + 200} ${vx - 900},${CH + 200}`} fill={mix('#4a4058', '#1a1630', night)} />
      <polygon points={`${vx - 110},${vy + 40} ${vx + 110},${vy + 40} ${vx + 300},${CH + 200} ${vx - 300},${CH + 200}`} fill="#ffcf8a" opacity={0.18} />
      <polygon points={`-200,-200 ${vx - 110},${vy - 260} ${vx - 110},${vy + 40} -200,${CH + 200}`} fill={wallL} stroke={INK} strokeWidth={8} />
      <polygon points={`${CW + 200},-200 ${vx + 110},${vy - 260} ${vx + 110},${vy + 40} ${CW + 200},${CH + 200}`} fill={wallR} stroke={INK} strokeWidth={8} />
      {/* linhas de tijolo em perspectiva */}
      {Array.from({length: 14}).map((_, i) => {
        const yy = -200 + i * 100;
        return (
          <g key={i} stroke={INK} strokeWidth={2} opacity={0.35}>
            <path d={`M-200,${yy} L${vx - 110},${vy - 260 + (yy + 200) * 0.2}`} />
            <path d={`M${CW + 200},${yy} L${vx + 110},${vy - 260 + (yy + 200) * 0.2}`} />
          </g>
        );
      })}
      {/* escadas de incêndio */}
      {[-1, 1].map((s) => (
        <g key={s} stroke={INK} strokeWidth={6} fill="none">
          {[0, 1, 2].map((k) => {
            const xa = s < 0 ? 200 + k * 180 : CW - 200 - k * 180;
            const xb = s < 0 ? xa + 140 : xa - 140;
            const ya = 80 + k * 40;
            return <path key={k} d={`M${xa},${ya} L${xb},${ya + 30} M${xa},${ya + 70} L${xb},${ya + 90} M${xa},${ya + 70} L${xb},${ya + 30}`} />;
          })}
        </g>
      ))}
      {/* lâmpada de parede */}
      <circle cx={430} cy={320} r={20} fill="#fff3b0" />
      <circle cx={430} cy={320} r={90} fill="#fff3b0" opacity={0.15} />
    </g>
  );
};

/** Lixeira grande (caçamba) com tampa que pode levantar (0..1) e olhos lá dentro. */
export const Dumpster = ({lid = 0, eyes = 0}: {lid?: number; eyes?: number}) => (
  <g>
    <polygon points="-260,-160 260,-160 230,170 -230,170" fill="#3a5a4a" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
    <path d="M-200,-120 V140 M-80,-120 V150 M40,-120 V150 M160,-120 V140" stroke={INK} strokeWidth={5} opacity={0.5} />
    <rect x={-300} y={-176} width={600} height={30} rx={8} fill="#2a4a3a" stroke={INK} strokeWidth={8} />
    {eyes > 0 && (
      <g opacity={eyes}>
        <rect x={-240} y={-176 - lid * 70} width={480} height={lid * 70} fill="#05040c" />
        <ellipse cx={-50} cy={-176 - lid * 30} rx={20} ry={9} fill="#fff6c8" />
        <ellipse cx={40} cy={-176 - lid * 30} rx={20} ry={9} fill="#fff6c8" />
      </g>
    )}
    <g transform={`translate(-280,-176) rotate(${-lid * 28})`}>
      <rect x={0} y={-26} width={560} height={30} rx={8} fill="#4a6a5a" stroke={INK} strokeWidth={8} />
    </g>
    <circle cx={-180} cy={182} r={20} fill="#1a1a22" stroke={INK} strokeWidth={6} />
    <circle cx={180} cy={182} r={20} fill="#1a1a22" stroke={INK} strokeWidth={6} />
  </g>
);

/** Lateral do trem do metrô em movimento. */
export const TrainSide = ({t}: {t: number}) => {
  const off = (t * 900) % 600;
  return (
    <g>
      <rect x={-200} y={-200} width={CW + 400} height={CH + 400} fill="#0e0c20" />
      {/* plataforma passando ao fundo (borrada) */}
      {Array.from({length: 8}).map((_, i) => (
        <rect key={i} x={-400 + ((i * 400 - off * 2) % 3200 + 3200) % 3200} y={120} width={30} height={500} fill="#ffcf8a" opacity={0.25} />
      ))}
      <rect x={-200} y={160} width={CW + 400} height={860} fill="#9aa0b4" stroke={INK} strokeWidth={10} />
      {Array.from({length: 7}).map((_, i) => (
        <g key={i} transform={`translate(${-300 + ((i * 600 - off) % 4200 + 4200) % 4200 - 600},0)`}>
          <rect x={60} y={260} width={380} height={300} rx={26} fill="#1a2040" stroke={INK} strokeWidth={9} />
          <path d="M80,280 L200,280 L120,540 L80,540 Z" fill="#fff" opacity={0.12} />
          <path d="M0,160 V1020" stroke={INK} strokeWidth={6} opacity={0.5} />
        </g>
      ))}
      <rect x={-200} y={640} width={CW + 400} height={24} fill="#c8303c" />
      {Array.from({length: 18}).map((_, i) => (
        <rect key={i} x={((i * 220 - off * 1.6) % 4000 + 4000) % 4000 - 200} y={40 + rnd(i) * 1000} width={260 + rnd(i * 3) * 300} height={4} fill="#fff" opacity={0.35} />
      ))}
      <circle cx={1760} cy={860} r={40} fill="#ff3a3a" />
      <circle cx={1760} cy={860} r={110} fill="#ff3a3a" opacity={0.2} />
    </g>
  );
};

/** Pessoas andando (vista lateral) em fila, com a "coisa" no meio delas. */
export const Crowd = ({t, n = 6, coisaAt = -1, pan = 0}: {t: number; n?: number; coisaAt?: number; pan?: number}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const x = 180 + i * 300 + pan + ((t * 60) % 300);
      const isC = i === coisaAt;
      return (
        <Fig
          key={i}
          uid={`cr${i}`}
          x={x}
          y={560}
          s={isC ? 0.95 : 0.78 + rnd(i) * 0.08}
          face={isC ? -1 : 1}
          pose={isC ? STAND : walk(t * 6 + i)}
          look={isC ? LOOK.coisa : crowdLook(i)}
          rim={isC ? '#ffffff' : C.cyan}
        />
      );
    })}
  </g>
);
