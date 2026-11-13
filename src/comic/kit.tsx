// Ferramentas de base do estilo "quadrinhos em movimento" (2D, feito do zero):
// contorno a tinta, sombra chapada com retícula, letras de HQ, linhas de ação, painéis.
import React from 'react';
import {continueRender, delayRender} from 'remotion';
import bangers from '@fontsource/bangers/files/bangers-latin-400-normal.woff2';
import anton from '@fontsource/anton/files/anton-latin-400-normal.woff2';
import oswald700 from '@fontsource/oswald/files/oswald-latin-700-normal.woff2';

export const W = 1080;
export const H = 1920;
export const INK = '#0b0918';
export const C = {
  magenta: '#ff2bd6',
  cyan: '#22e0ff',
  yellow: '#ffe84a',
  red: '#ff3b4e',
  orange: '#ff8a3d',
  navy: '#0b0a2a',
  deep: '#15104a',
  purple: '#3b1c8c',
  violet: '#6a35d6',
  pink: '#ff6ac1',
  white: '#fffdf5',
};

// ---------------------------------------------------------------- fontes
let fontsStarted = false;
if (typeof document !== 'undefined' && !fontsStarted) {
  fontsStarted = true;
  const h = delayRender('fontes-hq');
  Promise.all([
    new FontFace('BangersX', `url(${bangers})`).load(),
    new FontFace('AntonX', `url(${anton})`).load(),
    new FontFace('OswaldC', `url(${oswald700})`, {weight: '700'}).load(),
  ])
    .then((fs) => {
      fs.forEach((f) => document.fonts.add(f));
      continueRender(h);
    })
    .catch(() => continueRender(h));
}

// ---------------------------------------------------------------- matemática
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const twos = (f: number) => Math.floor(f / 2) * 2;
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const ease = (k: number) => {
  k = clamp(k);
  return k * k * (3 - 2 * k);
};
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
export const prog = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
/** entrada "pop" em passos (animação em dois): 0 → 0.55 → 1.16 → 0.95 → 1 */
export const pop = (f: number, at: number) => {
  const s = Math.floor((f - at) / 2);
  return s < 0 ? 0 : s === 0 ? 0.55 : s === 1 ? 1.16 : s === 2 ? 0.95 : 1;
};

// ---------------------------------------------------------------- cor
const hex = (c: string) => {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const mix = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  const v = A.map((x, i) => Math.round(x + (B[i] - x) * k));
  return '#' + v.map((x) => x.toString(16).padStart(2, '0')).join('');
};

// ---------------------------------------------------------------- retícula (halftone)
const htCache = new Map<string, string>();
/** Gera uma textura de retícula com pontos de tamanho variável. fn(u,v) → 0..1 (0 = sem ponto). */
export const halftone = (key: string, w: number, h: number, step: number, color: string, fn: (u: number, v: number) => number, angle = Math.PI / 4): string => {
  const k = `${key}|${w}|${h}|${step}|${color}`;
  const hit = htCache.get(k);
  if (hit) return hit;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const c = cv.getContext('2d')!;
  c.fillStyle = color;
  const cos = Math.cos(angle), sin = Math.sin(angle);
  const R = Math.ceil(Math.hypot(w, h) / step / 2) + 2;
  for (let i = -R; i <= R; i++)
    for (let j = -R; j <= R; j++) {
      const x = w / 2 + (i * cos - j * sin) * step;
      const y = h / 2 + (i * sin + j * cos) * step;
      if (x < -step || y < -step || x > w + step || y > h + step) continue;
      const a = clamp(fn(x / w, y / h));
      if (a <= 0.015) continue;
      c.beginPath();
      c.arc(x, y, step * 0.72 * Math.sqrt(a), 0, Math.PI * 2);
      c.fill();
    }
  const url = cv.toDataURL('image/png');
  htCache.set(k, url);
  return url;
};

/** Padrão SVG de pontos (tamanho fixo) para usar como fill="url(#id)". */
export const Dots = ({id, step = 12, r = 3.4, color = INK, angle = 45}: {id: string; step?: number; r?: number; color?: string; angle?: number}) => (
  <pattern id={id} width={step} height={step} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
    <circle cx={step / 2} cy={step / 2} r={r} fill={color} />
  </pattern>
);
/** Padrão SVG de hachura (linhas). */
export const Hatch = ({id, step = 10, w = 2.6, color = INK, angle = 45}: {id: string; step?: number; w?: number; color?: string; angle?: number}) => (
  <pattern id={id} width={step} height={step} patternUnits="userSpaceOnUse" patternTransform={`rotate(${angle})`}>
    <rect x={0} y={0} width={w} height={step} fill={color} />
  </pattern>
);

// ---------------------------------------------------------------- formas a tinta
type FormProps = {
  id: string;
  d: string;
  fill: string;
  shade?: string; // cor da sombra (crescente no lado oposto à luz)
  rim?: string; // luz de recorte na borda da sombra
  ink?: number;
  off?: [number, number]; // deslocamento da sombra
  children?: React.ReactNode; // detalhes recortados dentro da forma
  stroke?: string;
};
/** Forma com contorno a tinta + sombra chapada em "crescente" + luz de recorte. */
export const Form = ({id, d, fill, shade, rim, ink = 7, off = [14, 12], children, stroke = INK}: FormProps) => (
  <g>
    <defs>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
    </defs>
    <path d={d} fill={rim ?? shade ?? fill} />
    <g clipPath={`url(#${id})`}>
      {rim && shade && <path d={d} fill={shade} transform={`translate(${-off[0] * 0.34},${-off[1] * 0.34})`} />}
      {shade && <path d={d} fill={fill} transform={`translate(${-off[0]},${-off[1]})`} />}
      {children}
    </g>
    {ink > 0 && <path d={d} fill="none" stroke={stroke} strokeWidth={ink} strokeLinejoin="round" strokeLinecap="round" />}
  </g>
);

// ---------------------------------------------------------------- efeitos de HQ
export const burstPts = (cx: number, cy: number, rOut: number, rIn: number, n: number, seed = 1, jit = 0.2) => {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 + rnd(seed) * 6;
    const r = (i % 2 ? rIn : rOut) * (1 + (rnd(seed * 31 + i) - 0.5) * jit * 2);
    pts.push(`${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`);
  }
  return pts.join(' ');
};

export const SpeedLines = ({cx, cy, n = 46, r0 = 380, r1 = 1700, seed = 1, color = '#fff', opacity = 1}: {cx: number; cy: number; n?: number; r0?: number; r1?: number; seed?: number; color?: string; opacity?: number}) => (
  <g opacity={opacity}>
    {Array.from({length: n}).map((_, i) => {
      const a = ((i + rnd(seed * 17 + i) * 0.8) / n) * Math.PI * 2;
      const wA = 0.008 + rnd(seed * 5 + i) * 0.022;
      const ri = r0 * (0.75 + rnd(seed * 3 + i) * 0.9);
      const p = (ang: number, r: number) => `${(cx + Math.cos(ang) * r).toFixed(1)},${(cy + Math.sin(ang) * r).toFixed(1)}`;
      return <polygon key={i} points={`${p(a, ri)} ${p(a - wA, r1)} ${p(a + wA, r1)}`} fill={color} />;
    })}
  </g>
);

/** "Kirby krackle": cacho de bolinhas de energia. */
export const Krackle = ({cx, cy, r = 160, n = 26, seed = 1, color = INK}: {cx: number; cy: number; r?: number; n?: number; seed?: number; color?: string}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const a = rnd(seed * 13 + i) * Math.PI * 2;
      const d = Math.pow(rnd(seed * 7 + i), 0.6) * r;
      const s = (1 - d / r) * 26 + 5;
      return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.8} r={s * (0.5 + rnd(seed + i) * 0.7)} fill={color} />;
    })}
  </g>
);

// ---------------------------------------------------------------- painel de HQ
type Pt = [number, number];
/** Painel com borda preta e calha branca; o conteúdo é recortado no polígono. */
export const Panel = ({pts, children, border = 12, gutter = 9, bg}: {pts: Pt[]; children?: React.ReactNode; border?: number; gutter?: number; bg?: string}) => {
  const poly = pts.map((p) => `${p[0]}px ${p[1]}px`).join(', ');
  const sp = pts.map((p) => p.join(',')).join(' ');
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, clipPath: `polygon(${poly})`, background: bg, overflow: 'hidden'}}>{children}</div>
      <svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
        {gutter > 0 && <polygon points={sp} fill="none" stroke={C.white} strokeWidth={border + gutter * 2} strokeLinejoin="miter" />}
        <polygon points={sp} fill="none" stroke={INK} strokeWidth={border} strokeLinejoin="miter" />
      </svg>
    </>
  );
};

/** Tela SVG de 1080x1920 posicionada no quadro. */
export const Canvas = ({children, style}: {children: React.ReactNode; style?: React.CSSProperties}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, ...style}}>
    {children}
  </svg>
);

// ---------------------------------------------------------------- letras
type LetterProps = {children: React.ReactNode; size?: number; color?: string; stroke?: number; rot?: number; skew?: number; font?: string; style?: React.CSSProperties; shadow?: string | false; halo?: string};
/** Letra de HQ: preenchimento + contorno a tinta + sombra fora de registro (rosa/ciano).
 *  Com `halo`, ganha um segundo contorno claro por fora da tinta — fica legível sobre qualquer fundo. */
export const Letter = ({children, size = 120, color = C.white, stroke = 12, rot = 0, skew = -7, font = 'BangersX', style, shadow, halo}: LetterProps) => {
  const sh = shadow === false ? undefined : shadow ?? `${size * 0.06}px ${size * 0.055}px 0 ${C.magenta}, ${-size * 0.045}px ${-size * 0.035}px 0 ${C.cyan}, 0 ${size * 0.1}px 0 ${INK}`;
  const base: React.CSSProperties = {fontFamily: font, fontSize: size, lineHeight: 0.98, letterSpacing: size * 0.02, whiteSpace: 'nowrap', textTransform: 'uppercase', gridArea: '1 / 1'};
  return (
    <div style={{display: 'grid', transform: `rotate(${rot}deg) skewX(${skew}deg)`, ...style}}>
      {halo && <div style={{...base, color: halo, WebkitTextStroke: `${stroke + size * 0.15}px ${halo}`, textShadow: sh}}>{children}</div>}
      <div style={{...base, color, WebkitTextStroke: `${stroke}px ${INK}`, paintOrder: 'stroke fill', textShadow: halo ? undefined : sh}}>{children}</div>
    </div>
  );
};

/** Fundo "fora de foco" do jeito dos quadrinhos: em vez de borrar, separa as cores (vermelho/verde/azul deslocados). */
export const Ghost = ({children, d = 7}: {children: React.ReactNode; d?: number}) => {
  const layer = (tint: string, dx: number, dy: number) => (
    <g style={{isolation: 'isolate', mixBlendMode: 'screen'}} transform={`translate(${dx},${dy})`}>
      {children}
      <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill={tint} style={{mixBlendMode: 'multiply'}} />
    </g>
  );
  return (
    <g>
      <rect x={-600} y={-600} width={W + 1200} height={H + 1200} fill="#000" />
      {layer('#00ff00', 0, 0)}
      {layer('#ff0000', d, d * 0.35)}
      {layer('#0000ff', -d, -d * 0.35)}
    </g>
  );
};
