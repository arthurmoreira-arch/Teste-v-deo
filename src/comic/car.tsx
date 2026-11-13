// Cenário de terror em POV dentro do carro: estrada à noite, painel, volante com as mãos, retrovisor e celular no suporte.
import React, {useMemo} from 'react';
import {C, Dots, INK, W, halftone, mix, rnd, twos} from './kit';

const SKIN = '#9a5c34';
const SLEEVE = '#c8262f';

/** Vulto no banco de trás: silhueta escura com olhos que brilham. `a` 0..1. */
export const Figure = ({a = 1, eyes = 1}: {a?: number; eyes?: number}) => (
  <g opacity={a}>
    <path d="M-120,40 C-130,-60 -90,-150 0,-150 C90,-150 130,-60 120,40 C170,70 210,120 220,240 L-220,240 C-210,120 -170,70 -120,40 Z" fill="#05040c" />
    <g opacity={eyes}>
      <ellipse cx={-44} cy={-60} rx={26} ry={13} fill="#fff6c8" />
      <ellipse cx={44} cy={-60} rx={26} ry={13} fill="#fff6c8" />
      <ellipse cx={-44} cy={-60} rx={60} ry={34} fill="#fff6c8" opacity={0.18} />
      <ellipse cx={44} cy={-60} rx={60} ry={34} fill="#fff6c8" opacity={0.18} />
      <circle cx={-40} cy={-60} r={7} fill={INK} />
      <circle cx={48} cy={-60} r={7} fill={INK} />
    </g>
  </g>
);

/** Banco de trás visto pelo retrovisor (coordenadas: centro 0,0, largura ~520). */
export const BackSeat = ({f, figure = 0, eyes = 0, belt = true}: {f: number; figure?: number; eyes?: number; belt?: boolean}) => {
  const f2 = twos(f);
  const pass = (f2 * 7) % 700;
  return (
    <g>
      <rect x={-300} y={-160} width={600} height={340} fill="#0c0b26" />
      {/* vidro traseiro com faróis passando */}
      <rect x={-230} y={-150} width={460} height={140} rx={30} fill="#141a48" />
      <circle cx={-350 + pass} cy={-80} r={34} fill="#fff3b0" opacity={0.55} />
      <circle cx={-300 + pass} cy={-80} r={20} fill="#fff3b0" opacity={0.8} />
      {/* bancos */}
      {[-150, 150].map((x) => (
        <g key={x}>
          <rect x={x - 70} y={-70} width={140} height={70} rx={26} fill="#2a2a5a" stroke={INK} strokeWidth={6} />
          <rect x={x - 120} y={-10} width={240} height={200} rx={34} fill="#232352" stroke={INK} strokeWidth={6} />
        </g>
      ))}
      <rect x={-50} y={-10} width={100} height={200} fill="#1b1b44" stroke={INK} strokeWidth={6} />
      {figure > 0 && (
        <g transform="translate(150,20) scale(0.72)">
          <Figure a={figure} eyes={eyes} />
        </g>
      )}
      {/* cinto afivelado no banco vazio */}
      {belt && (
        <g>
          <path d="M70,-40 L210,150" stroke="#555a7a" strokeWidth={22} strokeLinecap="round" />
          <path d="M70,-40 L210,150" stroke={INK} strokeWidth={3} />
          <rect x={196} y={136} width={40} height={28} rx={6} fill="#c8c8d8" stroke={INK} strokeWidth={5} />
        </g>
      )}
    </g>
  );
};

/** Moldura do retrovisor com o banco de trás dentro. */
export const Mirror = ({f, figure = 0, eyes = 0, belt = true, glow = false}: {f: number; figure?: number; eyes?: number; belt?: boolean; glow?: boolean}) => (
  <g>
    <defs>
      <clipPath id="mirC">
        <rect x={-260} y={-110} width={520} height={220} rx={40} />
      </clipPath>
    </defs>
    <rect x={-12} y={-190} width={24} height={90} fill="#15142e" stroke={INK} strokeWidth={6} />
    <rect x={-284} y={-132} width={568} height={264} rx={56} fill="#15142e" stroke={INK} strokeWidth={10} />
    <g clipPath="url(#mirC)">
      <g transform="scale(0.86)">
        <BackSeat f={f} figure={figure} eyes={eyes} belt={belt} />
      </g>
      <path d="M-260,-110 L-90,-110 L-200,110 L-260,110 Z" fill="#fff" opacity={0.07} />
      <rect x={-260} y={-110} width={520} height={220} fill="#1a1050" opacity={0.25} />
    </g>
    {glow && <rect x={-284} y={-132} width={568} height={264} rx={56} fill="none" stroke={C.red} strokeWidth={8} opacity={0.8} />}
  </g>
);

/** Mão fechada segurando o volante (s = 1 direita, -1 esquerda). */
const Hand = ({s}: {s: 1 | -1}) => (
  <g transform={`scale(${s},1)`}>
    <path d="M40,120 L180,300 L80,360 L-40,190 Z" fill={SLEEVE} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M60,150 L150,270" stroke={mix(SLEEVE, INK, 0.4)} strokeWidth={10} />
    <rect x={-70} y={-20} width={150} height={150} rx={46} fill={SKIN} stroke={INK} strokeWidth={9} />
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${-62 + i * 36},4 q18,-30 34,0`} fill={mix(SKIN, '#ffffff', 0.15)} stroke={INK} strokeWidth={7} />
    ))}
    <path d="M-66,60 q-20,40 18,60" fill="none" stroke={INK} strokeWidth={6} />
  </g>
);

type PovProps = {f: number; speed?: number; figure?: number; eyes?: number; belt?: boolean; shake?: number; phone?: React.ReactNode; mirrorGlow?: boolean; dark?: number};
/** Visão de dentro do carro: estrada, painel, volante, mãos, retrovisor e celular no suporte. */
export const CarPOV = ({f, speed = 1, figure = 0, eyes = 0, belt = true, shake = 0, phone, mirrorGlow, dark = 0}: PovProps) => {
  const f2 = twos(f);
  const t = f2 * speed;
  const sky = halftone('carsky', W, 900, 15, '#5a2aa8', (u, v) => Math.max(0, v - 0.35) * 0.9);
  const lamps = useMemo(() => [0, 1, 2, 3, 4, 5], []);
  const hz = 760; // horizonte
  return (
    <g transform={`translate(${shake ? (f2 % 4 ? shake : -shake) : 0},0)`}>
      <defs>
        <linearGradient id="carSkyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#05041a" />
          <stop offset="1" stopColor="#2a1060" />
        </linearGradient>
        <linearGradient id="roadG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1440" />
          <stop offset="1" stopColor="#3a3070" />
        </linearGradient>
        <radialGradient id="beam" cx="50%" cy="100%" r="80%">
          <stop offset="0" stopColor="#fff3b0" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff3b0" stopOpacity="0" />
        </radialGradient>
        <Dots id="dashDots" step={12} r={3} color="#0a0820" />
      </defs>
      {/* céu e silhueta de árvores */}
      <rect x={-100} y={-100} width={W + 200} height={hz + 120} fill="url(#carSkyG)" />
      <image href={sky} x={0} y={0} width={W} height={900} opacity={0.5} style={{mixBlendMode: 'screen'}} />
      <circle cx={820} cy={300} r={70} fill="#e9e3ff" opacity={0.8} />
      <path d={`M-20,${hz} ${Array.from({length: 24}).map((_, i) => `L${i * 48},${hz - 40 - rnd(i * 3) * 90} L${i * 48 + 24},${hz - 20 - rnd(i * 5) * 40}`).join(' ')} L1100,${hz} Z`} fill="#07061a" />
      {/* estrada */}
      <polygon points={`500,${hz} 580,${hz} 1500,1500 -420,1500`} fill="url(#roadG)" />
      <polygon points={`505,${hz} 575,${hz} 1100,1500 -20,1500`} fill="url(#beam)" />
      {Array.from({length: 7}).map((_, i) => {
        const z = ((i / 7 + (t * 0.012) % (1 / 7) * 7 / 7) % 1);
        const p = Math.pow(((i + (t * 0.08) % 1) / 7), 2.2);
        const y = hz + p * 760;
        const w = 4 + p * 30;
        const h = 10 + p * 90;
        return <rect key={i} x={540 - w / 2} y={y} width={w} height={h} fill="#ffe7a0" opacity={0.85} data-z={z} />;
      })}
      {/* postes passando dos dois lados */}
      {lamps.map((i) => {
        const p = ((i + (t * 0.05) % 1) / 6);
        const k = Math.pow(p, 2.4);
        return [-1, 1].map((s) => {
          const x = 540 + s * (40 + k * 1500);
          const y = hz - 10 + k * 300;
          const hgt = 30 + k * 900;
          if (x < -200 || x > 1280) return null;
          return (
            <g key={`${i}${s}`} opacity={0.9}>
              <rect x={x - 2 - k * 10} y={y - hgt} width={4 + k * 20} height={hgt} fill="#05040c" />
              <circle cx={x - s * k * 40} cy={y - hgt} r={4 + k * 40} fill="#fff3b0" />
              <circle cx={x - s * k * 40} cy={y - hgt} r={10 + k * 120} fill="#fff3b0" opacity={0.12} />
            </g>
          );
        });
      })}
      {/* moldura do para-brisa */}
      <path d={`M-40,0 L1120,0 L1120,1260 C900,1150 180,1150 -40,1260 Z`} fill="none" stroke="#0a0820" strokeWidth={120} />
      <path d="M-40,40 L140,1240 L-40,1260 Z M1120,40 L940,1240 L1120,1260 Z" fill="#100c2c" stroke={INK} strokeWidth={8} />
      {/* painel */}
      <path d={`M-60,1240 C200,1130 880,1130 1140,1240 L1140,2000 L-60,2000 Z`} fill="#1a1440" stroke={INK} strokeWidth={10} />
      <path d={`M-60,1240 C200,1130 880,1130 1140,1240 L1140,1320 C880,1220 200,1220 -60,1320 Z`} fill="#2a2060" />
      <path d={`M-60,1240 C200,1130 880,1130 1140,1240`} fill="none" stroke={C.cyan} strokeWidth={5} opacity={0.6} />
      <rect x={-60} y={1330} width={1200} height={700} fill="url(#dashDots)" opacity={0.5} />
      {/* velocímetro */}
      <g transform="translate(540,1430)">
        <circle r={120} fill="#0a0820" stroke={INK} strokeWidth={8} />
        <circle r={104} fill="none" stroke="#2a3a8a" strokeWidth={8} />
        <path d={`M0,0 L${Math.cos(Math.PI * (0.85 + 0.5 * speed)) * 86},${Math.sin(Math.PI * (0.85 + 0.5 * speed)) * 86}`} stroke={C.red} strokeWidth={9} strokeLinecap="round" />
        <text x={0} y={70} textAnchor="middle" fontFamily="OswaldC" fontWeight={700} fontSize={40} fill={C.cyan}>
          {Math.round(40 + speed * 40)}
        </text>
      </g>
      {/* volante */}
      <g transform="translate(540,1880)">
        <circle r={470} fill="none" stroke={INK} strokeWidth={96} />
        <circle r={470} fill="none" stroke="#2b2650" strokeWidth={74} />
        <path d="M-430,-150 A470,470 0 0 1 430,-150" fill="none" stroke="#4a4290" strokeWidth={18} opacity={0.7} />
        <path d="M-120,-80 L-430,-120 M120,-80 L430,-120" stroke={INK} strokeWidth={70} />
        <path d="M-120,-80 L-430,-120 M120,-80 L430,-120" stroke="#231e48" strokeWidth={50} />
        <circle r={150} fill="#231e48" stroke={INK} strokeWidth={10} />
      </g>
      <g transform="translate(160,1510) rotate(-18)">
        <Hand s={-1} />
      </g>
      <g transform="translate(920,1510) rotate(18)">
        <Hand s={1} />
      </g>
      {/* celular no suporte */}
      {phone && <g transform="translate(870,1150) rotate(6)">{phone}</g>}
      {/* retrovisor */}
      <g transform="translate(540,190) scale(0.92)">
        <Mirror f={f} figure={figure} eyes={eyes} belt={belt} glow={mirrorGlow} />
      </g>
      {dark > 0 && <rect x={-100} y={-100} width={W + 200} height={2200} fill="#000" opacity={dark} />}
    </g>
  );
};

/** Celular pequeno no suporte (só o brilho e uma mensagem). */
export const MountPhone = ({text, alert = false}: {text: string; alert?: boolean}) => (
  <g>
    <rect x={-100} y={-170} width={200} height={340} rx={30} fill="#0a0a14" stroke={INK} strokeWidth={9} />
    <rect x={-86} y={-150} width={172} height={300} rx={18} fill={alert ? '#3a0a1a' : '#121a3a'} />
    <rect x={-74} y={-60} width={148} height={64} rx={14} fill={alert ? C.red : '#2a2f44'} />
    <text x={0} y={-20} textAnchor="middle" fontFamily="Liberation Sans, Arial" fontSize={20} fontWeight={700} fill="#fff">
      {text}
    </text>
    <rect x={-40} y={170} width={80} height={60} fill="#15142e" stroke={INK} strokeWidth={6} />
  </g>
);
