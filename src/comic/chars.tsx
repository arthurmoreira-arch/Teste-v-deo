// Personagens originais desenhados em vetor (estilo HQ): rosto com contorno a tinta,
// sombra chapada com retícula, luz de recorte colorida e expressões animáveis.
import React from 'react';
import {C, Dots, INK, mix, twos} from './kit';

export type Look = 'voce' | 'chefe' | 'bia';
export type Mouth = 'neutral' | 'smirk' | 'open' | 'o' | 'grit' | 'smile' | 'talk' | 'frown';
export type Expr = {
  brow?: number; // -1 preocupado … +1 bravo
  browUp?: number; // 0..1 sobrancelhas levantadas
  open?: number; // abertura dos olhos (1 = normal)
  pupil?: number; // tamanho da pupila (1 = normal)
  look?: [number, number]; // direção do olhar (-1..1)
  mouth?: Mouth;
  turn?: number; // -1..1 giro da cabeça
  tilt?: number; // -1..1 (positivo = olhando para baixo)
  glow?: number; // 0..1 luz do celular vinda de baixo
  glowColor?: string;
  sweat?: boolean;
};
export type Light = {amb: string; k: number; rimL: string; rimR: string};
export const LIGHTS: Record<'night' | 'room' | 'red' | 'day', Light> = {
  night: {amb: '#2a1c9c', k: 0.34, rimL: C.magenta, rimR: C.cyan},
  room: {amb: '#311a8c', k: 0.4, rimL: '#9a7bff', rimR: C.cyan},
  red: {amb: '#8a1040', k: 0.4, rimL: C.yellow, rimR: C.magenta},
  day: {amb: '#ff9a4a', k: 0.1, rimL: '#fff2b0', rimR: '#ffb86b'},
};

type LookDef = {
  skin: string;
  hair: string;
  hairHi: string;
  iris: string;
  jaw: [number, number, number, number, number]; // meia-largura, mandíbula x/y, queixo x/y
  browT: number;
  top: string;
  lip?: string;
};
const LOOKS: Record<Look, LookDef> = {
  voce: {skin: '#dd9a5f', hair: '#1a1436', hairHi: '#5a50f0', iris: '#7a431f', jaw: [150, 118, 122, 46, 206], browT: 16, top: '#e8323f'},
  chefe: {skin: '#f1c6a4', hair: '#b4b6cc', hairHi: '#ffffff', iris: '#4f7396', jaw: [154, 132, 128, 62, 214], browT: 15, top: '#39415f'},
  bia: {skin: '#b97348', hair: '#2b103c', hairHi: '#d946ef', iris: '#4a2a14', jaw: [144, 104, 120, 36, 202], browT: 9, top: '#ffd23f', lip: '#b0304f'},
};

const useTones = (light: Light) => ({
  lit: (c: string) => mix(c, light.amb, light.k * 0.32),
  sh: (c: string) => mix(mix(c, '#000000', 0.2), light.amb, Math.min(0.8, light.k * 1.5)),
});

type HeadProps = {uid: string; look: Look; e?: Expr; light?: Light; f?: number; body?: boolean; back?: boolean};

/** Cabeça + busto. Coordenadas locais: (0,0) = centro do rosto; a cabeça tem ~410 de altura. */
export const Bust = ({uid, look, e = {}, light = LIGHTS.night, f = 0, body = true}: HeadProps) => {
  const L = LOOKS[look];
  const {lit, sh} = useTones(light);
  const turn = e.turn ?? 0;
  const tilt = e.tilt ?? 0;
  const open = e.open ?? 1;
  const pupil = e.pupil ?? 1;
  const [lx, ly] = e.look ?? [0, 0];
  const brow = e.brow ?? 0;
  const browUp = e.browUp ?? 0;
  const glow = e.glow ?? 0;
  const glowColor = e.glowColor ?? C.cyan;
  const skin = lit(L.skin);
  const skinSh = sh(L.skin);
  const skinDeep = mix(skinSh, INK, 0.38);
  const skinHi = mix(skin, '#ffffff', 0.38);
  const hair = lit(L.hair);
  const hairHi = lit(L.hairHi);
  const top = lit(L.top);
  const topSh = sh(L.top);
  const fx = turn * 16;
  const fy = tilt * 18;
  const [w, jawW, jawY, chinW, chinY] = L.jaw;
  const T = 200;
  const cheekY = 70;
  const head = `M${-w},-20 C${-w},${-T * 0.92} ${-w * 0.62},${-T} 0,${-T} C${w * 0.62},${-T} ${w},${-T * 0.92} ${w},-20 C${w},${cheekY * 0.6} ${w * 0.98},${cheekY} ${jawW},${jawY} C${jawW * 0.8},${jawY + (chinY - jawY) * 0.62} ${chinW},${chinY} 0,${chinY} C${-chinW},${chinY} ${-jawW * 0.8},${jawY + (chinY - jawY) * 0.62} ${-jawW},${jawY} C${-w * 0.98},${cheekY} ${-w},${cheekY * 0.6} ${-w},-20 Z`;
  const hc = `${uid}h`;
  const f2 = twos(f);

  // ------------------------------------------------ olhos
  const eye = (s: 1 | -1) => {
    const k = 1 - 0.2 * Math.max(0, s * turn);
    const cx = s * 69 + fx;
    const cy = -4 + fy;
    const rx = 47 * k;
    const ry = 26.5;
    const xi = cx - s * rx;
    const xo = cx + s * rx;
    const yi = cy + 5;
    const yo = cy - 4;
    const upY = cy - 2 * ry * open - 2;
    const loY = cy + 2 * ry * 0.7 * Math.min(1, open + 0.12);
    if (open < 0.14) {
      return (
        <g key={s}>
          <path d={`M${xi},${yi} Q${cx},${cy + 16} ${xo},${yo + 4}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <path d={`M${xo},${yo + 4} l${s * 12},${6}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />
        </g>
      );
    }
    const dScl = `M${xi},${yi} Q${cx - s * 6},${upY} ${xo},${yo} Q${cx + s * 4},${loY} ${xi},${yi} Z`;
    const ix = cx + lx * 13 * k;
    const iy = cy + ly * 10 - (open > 1 ? 0 : (1 - open) * -3);
    const iris = L.iris;
    return (
      <g key={s}>
        <defs>
          <clipPath id={`${uid}e${s}`}>
            <path d={dScl} />
          </clipPath>
        </defs>
        <path d={dScl} fill="#fbf7ee" />
        <g clipPath={`url(#${uid}e${s})`}>
          <rect x={cx - 70} y={cy - 80} width={140} height={80 - ry * open * 0.55} fill="#a9a6d0" opacity={0.8} />
          <circle cx={ix} cy={iy} r={25} fill={mix(iris, INK, 0.55)} />
          <circle cx={ix} cy={iy} r={20.5} fill={iris} />
          {Array.from({length: 12}).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <line key={i} x1={ix + Math.cos(a) * 11} y1={iy + Math.sin(a) * 11} x2={ix + Math.cos(a) * 20} y2={iy + Math.sin(a) * 20} stroke={mix(iris, '#ffd27a', 0.5)} strokeWidth={1.6} opacity={0.7} />;
          })}
          <circle cx={ix} cy={iy} r={11 * pupil} fill={INK} />
          {glow > 0 && <rect x={ix - 11} y={iy + 2} width={11} height={15} rx={2.5} fill={glowColor} opacity={0.85 * glow} transform={`rotate(-10 ${ix} ${iy})`} />}
          <circle cx={ix - 8} cy={iy - 9} r={6.6} fill="#fff" />
          <circle cx={ix + 9} cy={iy + 8} r={3} fill="#fff" opacity={0.85} />
        </g>
        <path d={`M${xi},${yi} Q${cx - s * 6},${upY} ${xo},${yo}`} fill="none" stroke={INK} strokeWidth={look === 'bia' ? 10.5 : 8.5} strokeLinecap="round" />
        <path d={`M${xo},${yo} l${s * 13},${-9}`} stroke={INK} strokeWidth={look === 'bia' ? 7.5 : 5.5} strokeLinecap="round" />
        {look === 'bia' && <path d={`M${xo - s * 8},${yo - 6} l${s * 12},${-15} M${xo - s * 20},${yo - 10} l${s * 7},${-15}`} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />}
        <path d={`M${xi + s * 14},${yi + (loY - yi) * 0.42} Q${cx + s * 4},${loY - 1} ${xo - s * 6},${yo + 8}`} fill="none" stroke={INK} strokeWidth={3} opacity={0.7} strokeLinecap="round" />
        <path d={`M${xi + s * 10},${upY + ry * open * 0.5 - 12} Q${cx},${upY - 13} ${xo - s * 4},${yo - 15}`} fill="none" stroke={skinDeep} strokeWidth={3} opacity={0.75} strokeLinecap="round" />
      </g>
    );
  };

  // ------------------------------------------------ sobrancelhas
  const browEl = (s: 1 | -1) => {
    const cx = s * 69 + fx;
    const by = -4 + fy - 60 - browUp * 20;
    const xi = cx - s * 42;
    const xo = cx + s * 50;
    const yi = by + brow * 15;
    const yo = by - brow * 6 + 6;
    const ym = by - 10 - Math.abs(brow) * 2;
    const th = L.browT;
    return (
      <path
        key={s}
        d={`M${xi},${yi - th * 0.55} Q${cx},${ym - th * 0.5} ${xo},${yo} Q${cx},${ym + th * 0.66} ${xi},${yi + th * 0.55} Z`}
        fill={look === 'chefe' ? mix(hair, INK, 0.35) : mix(hair, INK, 0.2)}
        stroke={INK}
        strokeWidth={3.5}
        strokeLinejoin="round"
      />
    );
  };

  // ------------------------------------------------ boca
  const mx = fx * 1.1;
  const my = 124 + fy * 0.9;
  let mouthType = e.mouth ?? 'neutral';
  let talkOpen = 0;
  if (mouthType === 'talk') talkOpen = [0.35, 1, 0.15, 0.7][Math.floor(f2 / 4) % 4];
  const lipC = L.lip ? lit(L.lip) : mix(skinSh, '#a03a4a', 0.35);
  const mouth = (() => {
    switch (mouthType) {
      case 'smirk':
        return (
          <g>
            <path d={`M${mx - 30},${my + 4} Q${mx - 2},${my + 12} ${mx + 32},${my - 10}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <path d={`M${mx + 32},${my - 10} q9,-4 9,-13`} fill="none" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
            <path d={`M${mx - 14},${my + 22} Q${mx + 2},${my + 27} ${mx + 16},${my + 19}`} fill="none" stroke={skinDeep} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        );
      case 'smile':
        return (
          <g>
            <path d={`M${mx - 38},${my - 8} Q${mx},${my + 4} ${mx + 38},${my - 8} Q${mx + 24},${my + 30} ${mx},${my + 32} Q${mx - 24},${my + 30} ${mx - 38},${my - 8} Z`} fill="#5a1024" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
            <path d={`M${mx - 30},${my - 4} Q${mx},${my + 6} ${mx + 30},${my - 4} L${mx + 26},${my + 8} Q${mx},${my + 14} ${mx - 26},${my + 8} Z`} fill="#fff" />
          </g>
        );
      case 'open':
        return (
          <g>
            <path d={`M${mx - 25},${my - 14} Q${mx},${my - 25} ${mx + 25},${my - 14} Q${mx + 32},${my + 24} ${mx},${my + 38} Q${mx - 32},${my + 24} ${mx - 25},${my - 14} Z`} fill="#4a0d20" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
            <path d={`M${mx - 20},${my - 13} Q${mx},${my - 21} ${mx + 20},${my - 13} L${mx + 18},${my - 4} Q${mx},${my - 9} ${mx - 18},${my - 4} Z`} fill="#fff" />
            <ellipse cx={mx} cy={my + 24} rx={14} ry={9} fill="#e0566f" />
          </g>
        );
      case 'o':
        return <ellipse cx={mx} cy={my + 6} rx={13} ry={17} fill="#4a0d20" stroke={INK} strokeWidth={5.5} />;
      case 'grit':
        return (
          <g>
            <rect x={mx - 32} y={my - 12} width={64} height={28} rx={9} fill="#fff" stroke={INK} strokeWidth={5.5} />
            <path d={`M${mx - 32},${my + 2} h64 M${mx - 16},${my - 12} v28 M${mx},${my - 12} v28 M${mx + 16},${my - 12} v28`} stroke={INK} strokeWidth={3} />
          </g>
        );
      case 'frown':
        return (
          <g>
            <path d={`M${mx - 26},${my + 8} Q${mx},${my - 6} ${mx + 26},${my + 8}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <path d={`M${mx - 12},${my + 22} Q${mx},${my + 18} ${mx + 12},${my + 22}`} fill="none" stroke={skinDeep} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        );
      case 'talk':
        return (
          <g>
            <ellipse cx={mx} cy={my + 4} rx={17 + talkOpen * 5} ry={3 + talkOpen * 15} fill="#4a0d20" stroke={INK} strokeWidth={5.5} />
            {talkOpen > 0.5 && <rect x={mx - 12} y={my - 9} width={24} height={7} rx={3} fill="#fff" />}
          </g>
        );
      default:
        return (
          <g>
            <path d={`M${mx - 27},${my} Q${mx},${my + 8} ${mx + 27},${my - 1}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <path d={`M${mx - 13},${my + 19} Q${mx},${my + 24} ${mx + 13},${my + 19}`} fill="none" stroke={skinDeep} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        );
    }
  })();

  const nx = fx * 1.25;
  const ny = 36 + fy * 1.1;

  // ------------------------------------------------ cabelo
  const hairFront = (() => {
    if (look === 'voce') {
      const d = 'M-150,-66 L-160,-150 L-142,-214 L-104,-252 L-86,-232 L-54,-278 L-30,-246 L8,-294 L30,-256 L70,-286 L88,-246 L124,-258 L136,-214 L162,-196 L158,-140 L150,-66 L138,-92 L128,-130 L92,-108 L64,-142 L28,-106 L-6,-148 L-44,-108 L-78,-140 L-110,-104 L-134,-126 L-140,-88 Z';
      return (
        <g>
          <path d="M-152,-80 L-150,14 L-134,6 L-134,-90 Z" fill={mix(hair, skin, 0.3)} />
          <path d="M152,-80 L150,14 L134,6 L134,-90 Z" fill={mix(hair, skinSh, 0.25)} />
          <defs>
            <clipPath id={`${uid}hf`}>
              <path d={d} />
            </clipPath>
          </defs>
          <path d={d} fill={hair} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <g clipPath={`url(#${uid}hf)`}>
            <path d="M-60,-270 L-36,-240 L-72,-160 Z M0,-286 L26,-250 L-14,-170 Z M66,-280 L84,-244 L52,-176 Z M118,-250 L132,-216 L104,-168 Z" fill={hairHi} opacity={0.85} />
            <path d="M-170,-150 L-140,-220 L-100,-256 L-118,-190 L-150,-110 Z" fill={light.rimL} opacity={0.85} />
            <path d="M-44,-244 L-58,-150 M18,-258 L4,-150 M80,-252 L70,-152 M-98,-226 L-104,-150" fill="none" stroke={INK} strokeWidth={3.5} opacity={0.55} strokeLinecap="round" />
            <path d="M172,-190 L140,-220 L150,-150 L146,-90 L166,-120 Z" fill={light.rimR} opacity={0.7} />
          </g>
        </g>
      );
    }
    if (look === 'chefe') {
      const d = 'M-154,-36 L-162,-140 C-152,-216 -82,-234 -20,-228 C52,-238 132,-216 156,-150 L158,-36 L142,-70 L134,-128 C100,-162 40,-172 -30,-152 C-70,-142 -110,-122 -136,-96 L-142,-62 Z';
      return (
        <g>
          <defs>
            <clipPath id={`${uid}hf`}>
              <path d={d} />
            </clipPath>
          </defs>
          <path d={d} fill={hair} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <g clipPath={`url(#${uid}hf)`}>
            <path d="M-110,-214 C-40,-236 60,-232 130,-196 C60,-214 -30,-214 -100,-186 Z" fill={hairHi} opacity={0.8} />
            <path d="M40,-170 C90,-176 130,-160 160,-120 L170,-40 L130,-110 Z" fill={sh(L.hair)} />
            <path d="M-36,-226 C-50,-190 -70,-160 -100,-136" fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />
          </g>
        </g>
      );
    }
    const dl = 'M-4,-236 C-72,-240 -154,-204 -164,-112 C-170,-40 -166,60 -152,130 C-142,30 -128,-56 -90,-120 C-60,-162 -30,-192 -4,-236 Z';
    const dr = 'M4,-236 C72,-240 154,-204 164,-112 C170,-40 166,60 152,130 C142,30 128,-56 90,-120 C60,-162 30,-192 4,-236 Z';
    return (
      <g>
        <path d={dl} fill={hair} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d={dr} fill={hair} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d="M-120,-180 C-140,-120 -150,-40 -148,40 C-136,-50 -116,-120 -84,-170 Z" fill={hairHi} opacity={0.7} />
        <path d="M150,-150 C160,-80 158,0 150,70 C150,-10 140,-90 118,-150 Z" fill={light.rimR} opacity={0.75} />
      </g>
    );
  })();

  const hairBack =
    look === 'bia' ? (
      <path d="M-178,-60 C-194,-196 -112,-254 0,-250 C112,-254 194,-196 178,-60 C190,90 204,280 240,470 L-240,470 C-204,280 -190,90 -178,-60 Z" fill={mix(hair, INK, 0.3)} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    ) : null;

  // ------------------------------------------------ corpo
  const bodyEl = (() => {
    if (!body) return null;
    if (look === 'voce') {
      const d = 'M-76,236 C-150,246 -300,276 -352,372 C-382,470 -398,640 -406,860 L406,860 C398,640 382,470 352,372 C300,276 150,246 76,236 Q0,300 -76,236 Z';
      return (
        <g>
          <path d="M-176,150 C-262,184 -270,300 -204,356 L204,356 C270,300 262,184 176,150 C122,88 -122,88 -176,150 Z" fill={topSh} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <defs>
            <clipPath id={`${uid}bd`}>
              <path d={d} />
            </clipPath>
          </defs>
          <path d={d} fill={top} />
          <g clipPath={`url(#${uid}bd)`}>
            <path d="M120,230 C260,280 330,360 352,470 C372,600 380,720 388,880 L460,880 L460,200 Z" fill={topSh} />
            <path d="M100,250 C236,296 300,372 322,470 C342,600 350,720 358,880 L388,880 C380,720 372,600 352,470 C330,360 260,280 120,230 Z" fill={`url(#${uid}dotT)`} />
            <path d="M-420,330 C-380,300 -330,290 -300,292 C-350,330 -372,420 -384,560 L-430,560 Z" fill={light.rimL} opacity={0.8} />
            <path d="M-262,430 Q-238,540 -278,670 M262,430 Q238,540 278,670 M-116,430 q34,66 8,140" fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={0.75} />
            <path d="M-176,730 Q0,694 176,730" fill="none" stroke={INK} strokeWidth={6} />
            {glow > 0 && (
              <g opacity={glow}>
                <ellipse cx={0} cy={900} rx={430} ry={520} fill={`url(#${uid}gl)`} opacity={0.75} style={{mixBlendMode: 'screen'}} />
                <path d="M-430,600 Q0,500 430,600 L430,900 L-430,900 Z" fill={`url(#${uid}dotG)`} opacity={0.3} />
              </g>
            )}
          </g>
          <path d={d} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        </g>
      );
    }
    if (look === 'chefe') {
      const d = 'M-80,232 C-160,244 -310,270 -362,372 C-392,470 -404,640 -410,860 L410,860 C404,640 392,470 362,372 C310,270 160,244 80,232 Q0,270 -80,232 Z';
      return (
        <g>
          <defs>
            <clipPath id={`${uid}bd`}>
              <path d={d} />
            </clipPath>
          </defs>
          <path d={d} fill={top} />
          <g clipPath={`url(#${uid}bd)`}>
            <path d="M130,230 C270,280 340,360 362,470 C382,600 390,720 396,880 L470,880 L470,200 Z" fill={topSh} />
            <path d="M-86,228 L0,520 L86,228 Q0,262 -86,228 Z" fill={lit('#f4f6ff')} />
            <path d="M-22,268 L22,268 L32,320 L0,560 L-32,320 Z" fill={lit('#2a6fd1')} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M-22,268 L22,268 L14,306 L-14,306 Z" fill={sh('#2a6fd1')} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M-86,228 L-150,300 L-40,420 L0,520 Z M86,228 L150,300 L40,420 L0,520 Z" fill={mix(top, '#ffffff', 0.08)} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <path d="M-270,440 Q-250,560 -290,700 M270,440 Q250,560 290,700" fill="none" stroke={INK} strokeWidth={5} opacity={0.7} />
          </g>
          <path d={d} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        </g>
      );
    }
    const d = 'M-70,236 C-140,246 -270,270 -318,360 C-346,460 -360,640 -366,860 L366,860 C360,640 346,460 318,360 C270,270 140,246 70,236 Q0,330 -70,236 Z';
    return (
      <g>
        <defs>
          <clipPath id={`${uid}bd`}>
            <path d={d} />
          </clipPath>
        </defs>
        <path d={d} fill={top} />
        <g clipPath={`url(#${uid}bd)`}>
          <path d="M110,230 C240,280 300,350 318,460 C340,600 350,720 356,880 L430,880 L430,200 Z" fill={topSh} />
        </g>
        <path d={d} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      </g>
    );
  })();

  const ear = (s: 1 | -1) => (
    <g key={s}>
      <ellipse cx={s * (w - 2) + fx * 0.3} cy={24 + fy * 0.5} rx={25} ry={43} fill={s > 0 ? skinSh : skin} stroke={INK} strokeWidth={7} />
      <path d={`M${s * (w + 6) + fx * 0.3},${4 + fy * 0.5} q${s * 10},18 ${-s * 2},40`} fill="none" stroke={skinDeep} strokeWidth={4} strokeLinecap="round" />
      {look === 'bia' && <circle cx={s * (w + 2) + fx * 0.3} cy={84 + fy * 0.5} r={22} fill="none" stroke="#ffd23f" strokeWidth={7} />}
    </g>
  );

  return (
    <g>
      <defs>
        <clipPath id={hc}>
          <path d={head} />
        </clipPath>
        <Dots id={`${uid}dotS`} step={11} r={3.2} color={skinSh} />
        <Dots id={`${uid}dotT`} step={12} r={3.6} color={topSh} />
        <Dots id={`${uid}dotG`} step={12} r={3.4} color={glowColor} />
        <radialGradient id={`${uid}gl`} cx="50%" cy="100%" r="70%">
          <stop offset="0" stopColor={glowColor} stopOpacity="0.95" />
          <stop offset="0.6" stopColor={glowColor} stopOpacity="0.35" />
          <stop offset="1" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {hairBack}
      {bodyEl}
      {/* pescoço */}
      <path d="M-66,130 L-72,300 Q0,340 72,300 L66,130 Z" fill={skinSh} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M-66,130 L-72,300 Q-50,312 -26,318 L-34,190 Z" fill={skin} opacity={0.9} />
      <ellipse cx={0} cy={chinY + 6} rx={84} ry={46} fill={skinDeep} opacity={0.85} />
      {/* gola do moletom por cima do pescoço */}
      {body && look === 'voce' && (
        <g>
          <path d="M-82,170 C-152,198 -178,272 -130,342 C-98,314 -46,306 -6,338 C-30,284 -58,228 -82,170 Z" fill={top} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M82,170 C152,198 178,272 130,342 C98,314 46,306 6,338 C30,284 58,228 82,170 Z" fill={topSh} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M-34,336 L-40,470 M34,336 L40,470" stroke={lit('#fff6e8')} strokeWidth={8} strokeLinecap="round" />
          <path d="M-34,336 L-40,470 M34,336 L40,470" stroke={INK} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
          <rect x={-47} y={466} width={14} height={26} rx={4} fill={lit('#d8d8e8')} stroke={INK} strokeWidth={4} />
          <rect x={33} y={466} width={14} height={26} rx={4} fill={lit('#d8d8e8')} stroke={INK} strokeWidth={4} />
        </g>
      )}
      {body && look === 'chefe' && (
        <g>
          <path d="M-70,170 L-104,236 L-24,270 Z M70,170 L104,236 L24,270 Z" fill={lit('#f4f6ff')} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g>
      )}
      {ear(-1)}
      {ear(1)}
      {/* cabeça */}
      <path d={head} fill={skin} />
      <g clipPath={`url(#${hc})`}>
        {/* lado da sombra + franja reticulada */}
        <path d={`M${74 + fx},${-T - 20} C${132 + fx},-90 ${86 + fx},40 ${110 + fx},112 C${94 + fx * 0.5},170 54,200 14,${chinY + 14} L260,${chinY + 40} L260,${-T - 30} Z`} fill={`url(#${uid}dotS)`} transform="translate(-24,0)" />
        <path d={`M${74 + fx},${-T - 20} C${132 + fx},-90 ${86 + fx},40 ${110 + fx},112 C${94 + fx * 0.5},170 54,200 14,${chinY + 14} L260,${chinY + 40} L260,${-T - 30} Z`} fill={skinSh} />
        {/* testa sob o cabelo */}
        <path d={`M${-w - 10},${-T - 10} L${w + 10},${-T - 10} L${w + 10},-112 Q0,-84 ${-w - 10},-112 Z`} fill={skinSh} opacity={0.55} />
        <path d={`M${-w + 22},${-70 + fy} C${-w + 10},0 ${-w + 26},64 ${-jawW + 16},${jawY - 8} L${-jawW + 40},${jawY - 24} C${-w + 56},50 ${-w + 44},0 ${-w + 54},${-70 + fy} Z`} fill={skinHi} opacity={0.4} />
        <path d={`M${98 + fx},40 l26,-22 M${100 + fx},58 l30,-26 M${102 + fx},76 l28,-24 M${100 + fx},94 l22,-19`} stroke={INK} strokeWidth={3} opacity={0.45} strokeLinecap="round" />
        {/* luz de recorte nas bordas */}
        <path d={head} fill="none" stroke={light.rimL} strokeWidth={15} opacity={0.9} clipPath={`url(#${uid}cl)`} />
        <path d={head} fill="none" stroke={light.rimR} strokeWidth={17} opacity={0.9} clipPath={`url(#${uid}cr)`} />
        {/* luz do celular vinda de baixo */}
        {glow > 0 && (
          <g opacity={glow}>
            <ellipse cx={0} cy={chinY + 50} rx={250} ry={230} fill={`url(#${uid}gl)`} style={{mixBlendMode: 'screen'}} />
            <path d={`M-200,${chinY + 40} L-200,96 Q0,170 200,96 L200,${chinY + 40} Z`} fill={`url(#${uid}dotG)`} opacity={0.34} />
            <path d={head} fill="none" stroke={glowColor} strokeWidth={20} clipPath={`url(#${uid}cb)`} />
          </g>
        )}
      </g>
      <defs>
        <clipPath id={`${uid}cl`}>
          <rect x={-400} y={-400} width={320} height={800} />
        </clipPath>
        <clipPath id={`${uid}cr`}>
          <rect x={96} y={-400} width={320} height={800} />
        </clipPath>
        <clipPath id={`${uid}cb`}>
          <rect x={-400} y={96} width={800} height={400} />
        </clipPath>
      </defs>
      <path d={head} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {/* rugas do chefe */}
      {look === 'chefe' && (
        <g fill="none" stroke={skinDeep} strokeWidth={3.5} strokeLinecap="round" opacity={0.85}>
          <path d={`M-70,${-112 + fy} Q0,${-124 + fy} 70,${-112 + fy} M-50,${-134 + fy} Q0,${-144 + fy} 50,${-134 + fy}`} />
          <path d={`M${-34 + fx},${70 + fy} Q${-52 + fx},${100 + fy} ${-46 + fx},${132 + fy} M${34 + fx},${70 + fy} Q${52 + fx},${100 + fy} ${46 + fx},${132 + fy}`} />
          <path d={`M${-104 + fx},${26 + fy} q18,10 40,6 M${104 + fx},${26 + fy} q-18,10 -40,6`} />
        </g>
      )}
      {/* nariz */}
      <path d={`M${nx + 7},${ny - 38} L${nx + 23},${ny + 12} Q${nx + 20},${ny + 27} ${nx + 3},${ny + 27} Z`} fill={skinSh} opacity={0.9} />
      <path d={`M${nx - 18},${ny + 20} Q${nx - 21},${ny + 31} ${nx - 8},${ny + 30} Q${nx},${ny + 38} ${nx + 9},${ny + 30} Q${nx + 23},${ny + 31} ${nx + 20},${ny + 18}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M${nx + 9},${ny - 52} Q${nx + 16},${ny - 22} ${nx + 12},${ny - 2}`} fill="none" stroke={INK} strokeWidth={3.2} opacity={0.55} strokeLinecap="round" />
      <ellipse cx={nx - 3} cy={ny + 9} rx={7} ry={5} fill={skinHi} opacity={0.75} />
      {/* boca */}
      {look === 'bia' && mouthType !== 'open' && mouthType !== 'o' && mouthType !== 'grit' && (
        <path d={`M${mx - 30},${my} Q${mx - 12},${my - 12} ${mx},${my - 5} Q${mx + 12},${my - 12} ${mx + 30},${my - (mouthType === 'smirk' ? 10 : 0)} Q${mx},${my + 30} ${mx - 30},${my} Z`} fill={lipC} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      )}
      {mouth}
      {look === 'chefe' && (
        <path d={`M${mx - 50},${my - 10} Q${mx - 26},${my - 34} ${mx},${my - 24} Q${mx + 26},${my - 34} ${mx + 50},${my - 10} Q${mx + 24},${my - 12} ${mx},${my - 8} Q${mx - 24},${my - 12} ${mx - 50},${my - 10} Z`} fill={mix(hair, INK, 0.15)} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      )}
      {eye(-1)}
      {eye(1)}
      {browEl(-1)}
      {browEl(1)}
      {hairFront}
      {/* óculos do chefe */}
      {look === 'chefe' && (
        <g>
          {([-1, 1] as const).map((s) => (
            <g key={s}>
              <rect x={s * 69 + fx - 60} y={-50 + fy} width={120} height={88} rx={22} fill="#bfeaff" opacity={0.2} />
              <path d={`M${s * 69 + fx - 36},${-46 + fy} l-18,80 M${s * 69 + fx - 12},${-46 + fy} l-18,80`} stroke="#fff" strokeWidth={8} opacity={0.35} />
              <rect x={s * 69 + fx - 60} y={-50 + fy} width={120} height={88} rx={22} fill="none" stroke={INK} strokeWidth={8} />
            </g>
          ))}
          <path d={`M${fx - 12},${-14 + fy} Q${fx},${-24 + fy} ${fx + 12},${-14 + fy}`} fill="none" stroke={INK} strokeWidth={7} />
          <path d={`M${-129 + fx},${-18 + fy} L${-w},${-8} M${129 + fx},${-18 + fy} L${w},${-8}`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
      {/* gota de suor */}
      {e.sweat && <path d={`M${-118},${-70} q-16,30 0,40 q16,-10 0,-40 Z`} fill="#bff3ff" stroke={INK} strokeWidth={4} />}
    </g>
  );
};

/** Protagonista visto de costas (plano final): cabelo, orelhas, capuz e ombros com luz de recorte. */
export const BackBust = ({uid, light = LIGHTS.night}: {uid: string; light?: Light}) => {
  const L = LOOKS.voce;
  const {lit, sh} = useTones(light);
  const hair = lit(L.hair), top = sh(L.top), skinSh = sh(L.skin);
  const body = 'M-80,236 C-160,246 -320,276 -372,372 C-402,470 -416,640 -424,900 L424,900 C416,640 402,470 372,372 C320,276 160,246 80,236 Z';
  const hd = 'M-150,-66 L-160,-150 L-142,-214 L-104,-252 L-86,-232 L-54,-278 L-30,-246 L8,-294 L30,-256 L70,-286 L88,-246 L124,-258 L136,-214 L162,-196 L158,-140 L156,40 C150,120 90,170 0,176 C-90,170 -150,120 -156,40 Z';
  return (
    <g>
      <defs>
        <clipPath id={`${uid}bb`}>
          <path d={body} />
        </clipPath>
        <clipPath id={`${uid}bh`}>
          <path d={hd} />
        </clipPath>
      </defs>
      <path d={body} fill={top} />
      <g clipPath={`url(#${uid}bb)`}>
        <path d="M-440,330 C-380,290 -320,280 -280,286 C-340,330 -372,430 -392,600 L-450,600 Z" fill={light.rimL} />
        <path d="M440,330 C380,290 320,280 280,286 C340,330 372,430 392,600 L450,600 Z" fill={light.rimR} />
      </g>
      <path d={body} fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M-190,180 C-270,230 -250,430 -120,520 C-50,560 50,560 120,520 C250,430 270,230 190,180 C120,130 -120,130 -190,180 Z" fill={mix(top, INK, 0.2)} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M-120,300 Q0,380 120,300" fill="none" stroke={INK} strokeWidth={5} opacity={0.7} />
      <path d="M-66,130 L-72,260 L72,260 L66,130 Z" fill={skinSh} stroke={INK} strokeWidth={7} />
      <ellipse cx={-152} cy={24} rx={24} ry={42} fill={skinSh} stroke={INK} strokeWidth={7} />
      <ellipse cx={152} cy={24} rx={24} ry={42} fill={skinSh} stroke={INK} strokeWidth={7} />
      <path d={hd} fill={hair} />
      <g clipPath={`url(#${uid}bh)`}>
        <path d="M-176,-150 L-140,-224 L-100,-258 L-124,-180 L-140,40 L-170,60 Z" fill={light.rimL} opacity={0.9} />
        <path d="M176,-190 L138,-224 L146,-140 L142,60 L172,40 Z" fill={light.rimR} opacity={0.9} />
        <path d="M-60,-270 L-36,-240 L-66,-120 Z M0,-286 L26,-250 L-4,-110 Z M66,-280 L84,-244 L60,-130 Z" fill={lit(L.hairHi)} opacity={0.7} />
      </g>
      <path d={hd} fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    </g>
  );
};

/** Silhueta da Bia na janela, segurando o celular (o brilho pulsa). */
export const BiaSilhouette = ({glow = 1}: {glow?: number}) => (
  <g>
    <path d="M-62,-150 C-70,-214 -40,-250 0,-250 C40,-250 70,-214 62,-150 C70,-90 80,-20 96,60 L150,96 C176,112 184,150 186,220 L-186,220 C-184,150 -176,112 -150,96 L-96,60 C-80,-20 -70,-90 -62,-150 Z" fill="#160a2c" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M60,70 L112,-18 L140,-2 L104,96 Z" fill="#160a2c" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={96} y={-64} width={44} height={76} rx={8} fill="#0b0918" stroke={INK} strokeWidth={5} transform="rotate(14 118 -26)" />
    <rect x={101} y={-58} width={34} height={64} rx={5} fill={C.cyan} opacity={0.5 + 0.5 * glow} transform="rotate(14 118 -26)" />
    <path d="M-34,-176 q14,-12 28,0 M10,-176 q14,-12 28,0" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.95} />
    <path d="M-14,-132 q16,12 34,-4" fill="none" stroke={C.magenta} strokeWidth={5} strokeLinecap="round" />
    <path d="M-62,-150 C-70,-214 -40,-250 0,-250" fill="none" stroke={C.magenta} strokeWidth={5} opacity={0.9} />
    <path d="M62,-150 C70,-90 80,-20 96,60" fill="none" stroke={C.cyan} strokeWidth={5} opacity={0.9 * glow} />
  </g>
);
