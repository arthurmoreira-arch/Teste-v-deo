// Objetos desenhados para episódios de notícia: chip, gráfico da bolsa, dinheiro, dossiê, cadeira vazia.
import React from 'react';
import {C, Dots, INK, burstPts, mix, rnd} from './kit';

/** Chip de IA visto de cima: corpo escuro, pinos dourados e um "cérebro" de circuitos que pulsa. */
export const Chip = ({size = 520, pulse = 0, glow = C.cyan}: {size?: number; pulse?: number; glow?: string}) => {
  const h = size / 2;
  const pins = 9;
  const step = size / (pins + 1);
  const g = 0.55 + 0.45 * pulse;
  return (
    <g>
      <defs>
        <radialGradient id="chipGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={glow} stopOpacity={0.85 * g} />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        <Dots id="chipDots" step={12} r={3.2} color="#23305a" />
      </defs>
      <circle cx={0} cy={0} r={size * 0.95} fill="url(#chipGlow)" />
      {/* pinos */}
      {Array.from({length: pins}).map((_, i) => {
        const p = -h + step * (i + 1);
        return (
          <g key={i} fill="#e8b84a" stroke={INK} strokeWidth={6}>
            <rect x={p - 13} y={-h - 70} width={26} height={74} rx={4} />
            <rect x={p - 13} y={h - 4} width={26} height={74} rx={4} />
            <rect x={-h - 70} y={p - 13} width={74} height={26} rx={4} />
            <rect x={h - 4} y={p - 13} width={74} height={26} rx={4} />
          </g>
        );
      })}
      {/* corpo */}
      <rect x={-h} y={-h} width={size} height={size} rx={34} fill="#141b36" stroke={INK} strokeWidth={12} />
      <rect x={-h} y={-h} width={size} height={size} rx={34} fill="url(#chipDots)" opacity={0.6} />
      <path d={`M${-h + 30},${-h + 22} H${h - 40}`} stroke={C.magenta} strokeWidth={10} strokeLinecap="round" opacity={0.85} />
      <path d={`M${-h + 22},${-h + 40} V${h - 60}`} stroke={C.cyan} strokeWidth={8} strokeLinecap="round" opacity={0.7} />
      <rect x={-h * 0.62} y={-h * 0.62} width={size * 0.62} height={size * 0.62} rx={22} fill="#0b1026" stroke={INK} strokeWidth={9} />
      {/* cérebro de circuitos */}
      <g stroke={glow} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={g}>
        <path d={`M0,${-h * 0.46} C${-h * 0.5},${-h * 0.5} ${-h * 0.56},${h * 0.1} ${-h * 0.2},${h * 0.42} M0,${-h * 0.46} C${h * 0.5},${-h * 0.5} ${h * 0.56},${h * 0.1} ${h * 0.2},${h * 0.42}`} />
        <path d={`M0,${-h * 0.46} V${h * 0.42} M${-h * 0.3},${-h * 0.18} H${-h * 0.06} M${h * 0.3},${-h * 0.18} H${h * 0.06} M${-h * 0.34},${h * 0.12} H${-h * 0.08} M${h * 0.34},${h * 0.12} H${h * 0.08}`} />
      </g>
      {[[-0.3, -0.18], [0.3, -0.18], [-0.34, 0.12], [0.34, 0.12], [0, -0.46], [-0.2, 0.42], [0.2, 0.42]].map(([x, y], i) => (
        <circle key={i} cx={x * h} cy={y * h} r={15} fill={i % 2 ? C.yellow : '#fff'} stroke={INK} strokeWidth={5} />
      ))}
      <text x={0} y={h * 0.86} textAnchor="middle" fontFamily="BangersX" fontSize={size * 0.11} fill="#8fa2d8" letterSpacing={6}>
        AI · GPU
      </text>
    </g>
  );
};

/** Gráfico de bolsa: linha que desenha de 0 até `k` (0..1). `pts` em coordenadas 0..1 (y para cima). */
export const StockChart = ({w = 900, h = 560, pts, k = 1, color = '#3ddc84', fill = true, grid = true}: {w?: number; h?: number; pts: [number, number][]; k?: number; color?: string; fill?: boolean; grid?: boolean}) => {
  const P = pts.map(([x, y]) => [x * w, h - y * h] as [number, number]);
  // corta a linha em k
  const total = P.length - 1;
  const upto = Math.max(0, Math.min(total, k * total));
  const n = Math.floor(upto);
  const fr = upto - n;
  const shown = P.slice(0, n + 1);
  if (n < total) shown.push([P[n][0] + (P[n + 1][0] - P[n][0]) * fr, P[n][1] + (P[n + 1][1] - P[n][1]) * fr]);
  const d = shown.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const end = shown[shown.length - 1];
  return (
    <g>
      <rect x={-30} y={-30} width={w + 60} height={h + 60} rx={26} fill="#0e1330" stroke={INK} strokeWidth={10} />
      {grid && (
        <g stroke="#26305a" strokeWidth={3}>
          {[0.25, 0.5, 0.75].map((y) => (
            <line key={y} x1={0} x2={w} y1={y * h} y2={y * h} />
          ))}
          {[0.2, 0.4, 0.6, 0.8].map((x) => (
            <line key={x} y1={0} y2={h} x1={x * w} x2={x * w} />
          ))}
        </g>
      )}
      {fill && shown.length > 1 && <path d={`${d} L${end[0]},${h} L0,${h} Z`} fill={color} opacity={0.22} />}
      <path d={d} fill="none" stroke={INK} strokeWidth={22} strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={end[0]} cy={end[1]} r={20} fill={color} stroke={INK} strokeWidth={7} />
    </g>
  );
};

/** Cédula de dólar estilizada. */
export const Bill = ({rot = 0, s = 1}: {rot?: number; s?: number}) => (
  <g transform={`rotate(${rot}) scale(${s})`}>
    <rect x={-110} y={-52} width={220} height={104} rx={10} fill="#7fd99a" stroke={INK} strokeWidth={7} />
    <rect x={-92} y={-36} width={184} height={72} rx={6} fill="none" stroke="#2f8a52" strokeWidth={4} />
    <circle cx={0} cy={0} r={27} fill="#bff0cc" stroke="#2f8a52" strokeWidth={4} />
    <text x={0} y={13} textAnchor="middle" fontFamily="BangersX" fontSize={40} fill="#1f6a3c">
      $
    </text>
  </g>
);

/** Pasta de investigação com carimbo. */
export const Dossier = ({stamp = 1, open = 0}: {stamp?: number; open?: number}) => (
  <g>
    <path d="M-330,-210 L-120,-210 L-80,-250 L330,-250 L330,230 L-330,230 Z" fill="#c8954a" stroke={INK} strokeWidth={11} strokeLinejoin="round" />
    <g transform={`translate(0,${-open * 40})`}>
      <rect x={-290} y={-220} width={560} height={400} fill="#fff8e6" stroke={INK} strokeWidth={7} transform="rotate(-3)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={-250} y={-170 + i * 50} width={i % 3 === 2 ? 260 : 440} height={16} rx={6} fill={i === 3 ? INK : '#9aa0b8'} transform="rotate(-3)" />
      ))}
    </g>
    <path d="M-330,-150 L330,-170 L330,230 L-330,230 Z" fill="#e0aa5a" stroke={INK} strokeWidth={11} strokeLinejoin="round" />
    <text x={0} y={60} textAnchor="middle" fontFamily="OswaldC" fontWeight={700} fontSize={54} fill="#7a4a12" letterSpacing={6}>
      CONFIDENCIAL
    </text>
    {stamp > 0 && (
      <g transform={`translate(30,150) rotate(-12) scale(${stamp})`}>
        <rect x={-270} y={-58} width={540} height={116} rx={14} fill="none" stroke="#e8213a" strokeWidth={13} />
        <text x={0} y={30} textAnchor="middle" fontFamily="BangersX" fontSize={92} fill="#e8213a" letterSpacing={4}>
          INVESTIGAÇÃO
        </text>
      </g>
    )}
  </g>
);

/** Lupa. */
export const Magnifier = () => (
  <g>
    <rect x={88} y={70} width={44} height={210} rx={18} fill="#3a2a1a" stroke={INK} strokeWidth={9} transform="rotate(-40 110 175)" />
    <circle cx={0} cy={0} r={120} fill="#bff3ff" opacity={0.35} stroke={INK} strokeWidth={16} />
    <path d="M-60,-70 Q-90,-20 -70,30" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" />
  </g>
);

/** Cadeira de escritório vazia com uma jaqueta de couro pendurada (o chefe que saiu). */
export const EmptyChair = ({sway = 0}: {sway?: number}) => (
  <g transform={`rotate(${sway})`}>
    <rect x={-20} y={200} width={40} height={170} fill="#2a2d3a" stroke={INK} strokeWidth={8} />
    <path d="M-170,380 L170,380 M0,370 L-150,430 M0,370 L150,430 M0,370 L0,440" stroke={INK} strokeWidth={14} strokeLinecap="round" />
    {[-150, 0, 150].map((x) => (
      <circle key={x} cx={x} cy={x === 0 ? 446 : 436} r={18} fill="#2a2d3a" stroke={INK} strokeWidth={6} />
    ))}
    <rect x={-200} y={150} width={400} height={80} rx={34} fill="#2b2f44" stroke={INK} strokeWidth={10} />
    <path d="M-160,170 C-180,-80 -150,-260 0,-270 C150,-260 180,-80 160,170 Z" fill="#33374f" stroke={INK} strokeWidth={10} />
    <path d="M-110,140 C-124,-60 -104,-210 0,-220" fill="none" stroke="#4a4f70" strokeWidth={10} strokeLinecap="round" />
    {/* jaqueta de couro pendurada */}
    <path d="M-150,-200 C-110,-250 110,-250 150,-200 L190,40 L120,60 L100,-60 L60,120 L-60,120 L-100,-60 L-120,60 L-190,40 Z" fill="#17161c" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M-60,-232 L0,-120 L60,-232" fill="none" stroke="#3a3946" strokeWidth={10} strokeLinejoin="round" />
    <path d="M0,-120 V118" stroke="#3a3946" strokeWidth={6} />
    <path d="M-150,-200 L-190,40 M150,-200 L190,40" stroke={C.magenta} strokeWidth={5} opacity={0.7} />
    <path d="M-100,-150 Q-60,-120 -70,-40" fill="none" stroke="#fff" strokeWidth={8} opacity={0.35} strokeLinecap="round" />
  </g>
);

/** Plaquinha de nome. */
export const NameCard = ({name, role, color = C.yellow}: {name: string; role: string; color?: string}) => (
  <g>
    <rect x={-360} y={-92} width={720} height={184} rx={20} fill={INK} />
    <rect x={-350} y={-82} width={700} height={164} rx={16} fill={color} stroke={INK} strokeWidth={6} />
    <text x={0} y={-8} textAnchor="middle" fontFamily="BangersX" fontSize={78} fill={INK} letterSpacing={2}>
      {name}
    </text>
    <text x={0} y={56} textAnchor="middle" fontFamily="OswaldC" fontWeight={700} fontSize={40} fill={INK}>
      {role}
    </text>
  </g>
);

/** Explosão de HQ (contorno + preenchimento). */
export const Boom = ({r = 420, seed = 2, fill = C.yellow, n = 14}: {r?: number; seed?: number; fill?: string; n?: number}) => (
  <g>
    <polygon points={burstPts(16, 16, r, r * 0.62, n, seed)} fill={INK} />
    <polygon points={burstPts(0, 0, r, r * 0.62, n, seed)} fill={fill} stroke={INK} strokeWidth={14} strokeLinejoin="round" />
    <polygon points={burstPts(0, 0, r * 0.66, r * 0.42, n, seed + 1)} fill={mix(fill, '#ffffff', 0.45)} />
  </g>
);

/** Ícone de app de IA (balão de chat com brilho). */
export const AiIcon = ({kind, s = 1}: {kind: 'chat' | 'image' | 'car' | 'robot'; s?: number}) => {
  const bg = {chat: '#3ddc84', image: C.magenta, car: '#28c8ff', robot: C.yellow}[kind];
  const emoji = {chat: '💬', image: '🎨', car: '🚗', robot: '🤖'}[kind];
  return (
    <g transform={`scale(${s})`}>
      <rect x={-86} y={-86} width={172} height={172} rx={44} fill={INK} transform="translate(10,10)" />
      <rect x={-86} y={-86} width={172} height={172} rx={44} fill={bg} stroke={INK} strokeWidth={9} />
      <text x={0} y={38} textAnchor="middle" fontSize={104}>
        {emoji}
      </text>
    </g>
  );
};

export const sparkle = (i: number) => rnd(i);
