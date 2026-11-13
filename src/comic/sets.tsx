// Cenários desenhados (2D em camadas com paralaxe).
import React, {useMemo} from 'react';
import {C, Dots, H, INK, W, halftone, mix, rnd, twos} from './kit';

const LIT = ['#ffe58a', '#ffd166', '#7df9ff', '#ff7ad9', '#fff3c4', '#ffb86b'];

type RowProps = {
  seed: number;
  y: number; // linha do chão
  minW: number;
  maxW: number;
  minH: number;
  maxH: number;
  wall: string;
  win: [number, number, number, number]; // largura, altura, espaço x, espaço y
  lit?: number;
  detail?: boolean;
  x0?: number;
  x1?: number;
  edge?: string;
  only?: (x: number, w: number) => boolean;
};

/** Uma fileira de prédios com janelas acesas, caixas d'água e antenas. */
const Row = ({seed, y, minW, maxW, minH, maxH, wall, win, lit = 0.28, detail = false, x0 = -420, x1 = 1500, edge, only}: RowProps) => {
  const els = useMemo(() => {
    const out: React.ReactNode[] = [];
    let x = x0;
    let i = 0;
    while (x < x1) {
      const s = seed * 100 + i;
      const w = minW + rnd(s) * (maxW - minW);
      const h = minH + rnd(s + 1) * (maxH - minH);
      const top = y - h;
      if (!only || only(x, w)) {
        out.push(<rect key={`b${i}`} x={x} y={top} width={w + 1} height={h + 1200} fill={wall} />);
        const r = rnd(s + 2);
        if (r < 0.32) {
          out.push(<rect key={`r${i}`} x={x + w * 0.18} y={top - h * 0.07} width={w * 0.64} height={h * 0.07 + 2} fill={wall} />);
          if (r < 0.14) out.push(<rect key={`r2${i}`} x={x + w * 0.38} y={top - h * 0.12} width={w * 0.24} height={h * 0.06} fill={wall} />);
        } else if (r < 0.52 && detail) {
          const tx = x + w * (0.25 + rnd(s + 5) * 0.4);
          const tw = Math.min(54, w * 0.42);
          out.push(
            <g key={`t${i}`}>
              <rect x={tx + 4} y={top - 34} width={4} height={34} fill={wall} />
              <rect x={tx + tw - 8} y={top - 34} width={4} height={34} fill={wall} />
              <rect x={tx} y={top - 78} width={tw} height={46} rx={3} fill={wall} />
              <polygon points={`${tx - 3},${top - 78} ${tx + tw / 2},${top - 102} ${tx + tw + 3},${top - 78}`} fill={wall} />
            </g>,
          );
        } else if (r < 0.74) {
          const ax = x + w * (0.3 + rnd(s + 6) * 0.4);
          const ah = 40 + rnd(s + 7) * 90;
          out.push(
            <g key={`a${i}`}>
              <rect x={ax} y={top - ah} width={3.5} height={ah} fill={wall} />
              <rect x={ax - 9} y={top - ah * 0.6} width={22} height={3} fill={wall} />
              <circle className={`blink${i % 2}`} cx={ax + 1.7} cy={top - ah - 3} r={4.2} fill={C.red} />
            </g>,
          );
        }
        const [ww, wh, gx, gy] = win;
        const cols = Math.floor((w - gx) / (ww + gx));
        const rows = Math.min(46, Math.floor((h + 260) / (wh + gy)));
        const ox = x + (w - (cols * (ww + gx) - gx)) / 2;
        for (let c = 0; c < cols; c++)
          for (let q = 0; q < rows; q++) {
            if (rnd(s * 7 + c * 13 + q * 31) > lit) continue;
            out.push(
              <rect
                key={`w${i}-${c}-${q}`}
                x={ox + c * (ww + gx)}
                y={top + gy + 4 + q * (wh + gy)}
                width={ww}
                height={wh}
                fill={LIT[Math.floor(rnd(s + c * 3 + q * 5) * LIT.length)]}
                opacity={0.7 + 0.3 * rnd(s + c + q * 9)}
              />,
            );
            if (ww >= 20) out.push(<path key={`m${i}-${c}-${q}`} d={`M${ox + c * (ww + gx) + ww / 2},${top + gy + 4 + q * (wh + gy)} v${wh} M${ox + c * (ww + gx)},${top + gy + 4 + q * (wh + gy) + wh * 0.45} h${ww}`} stroke={wall} strokeWidth={3} />);
          }
        if (edge) out.push(<rect key={`e${i}`} x={x} y={top} width={4} height={h + 1200} fill={edge} opacity={0.55} />);
      }
      x += w + (rnd(s + 3) < 0.3 ? rnd(s + 4) * 26 : 0);
      i++;
    }
    return out;
  }, [seed, y, minW, maxW, minH, maxH, wall, lit, detail, x0, x1, edge]);
  return <g>{els}</g>;
};

/** Trem elevado passando (janelas acesas + rastro). */
const Train = ({x, y}: {x: number; y: number}) => (
  <g transform={`translate(${x},${y})`}>
    {[0, 1, 2, 3, 4].map((c) => (
      <g key={c} transform={`translate(${-c * 318},0)`}>
        <rect x={-300} y={-84} width={300} height={84} rx={12} fill="#2b2f8f" stroke={INK} strokeWidth={5} />
        <rect x={-300} y={-30} width={300} height={8} fill={C.cyan} />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={-284 + k * 70} y={-70} width={54} height={32} rx={4} fill="#fff3a8" />
        ))}
        <rect x={-10} y={-20} width={24} height={10} fill={INK} />
      </g>
    ))}
    <polygon points="0,-64 260,-110 260,-10" fill={C.yellow} opacity={0.28} />
    <circle cx={-6} cy={-56} r={9} fill="#fffbd0" />
    {[0, 1, 2, 3, 4, 5].map((k) => (
      <rect key={k} x={-1700 - k * 90} y={-78 + k * 13} width={150 + k * 40} height={4} fill="#fff" opacity={0.5} />
    ))}
  </g>
);

type CityProps = {f: number; base?: number; px?: number; py?: number; train?: number; sign?: boolean};
/** Cidade à noite: céu com retícula, lua, 4 camadas de prédios, trem e letreiro neon. */
export const CityNight = ({f, base = 1300, px = 0, py = 0, train, sign = true}: CityProps) => {
  const f2 = twos(f);
  const skyDots = halftone('sky', W, 1500, 15, '#ff4fd8', (u, v) => Math.pow(Math.max(0, (v - 0.38) / 0.62), 1.6) * 0.85);
  const hazeDots = halftone('haze', W, 700, 13, '#22e0ff', (u, v) => Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.08)), 2.4) * 0.7 * (0.6 + 0.4 * Math.sin(u * 9)));
  const stars = useMemo(
    () =>
      Array.from({length: 70}).map((_, i) => {
        const x = rnd(i * 3 + 1) * W, y = rnd(i * 5 + 2) * 760, r = 1.2 + rnd(i * 7) * 2.4;
        return i % 6 === 0 ? (
          <path key={i} d={`M${x - r * 3},${y} L${x + r * 3},${y} M${x},${y - r * 3} L${x},${y + r * 3}`} stroke="#fff" strokeWidth={1.6} opacity={0.9} />
        ) : (
          <circle key={i} cx={x} cy={y} r={r} fill={i % 5 === 0 ? C.cyan : '#fff'} opacity={0.55 + 0.45 * rnd(i)} />
        );
      }),
    [],
  );
  const blinkOn = Math.floor(f2 / 14) % 2 === 0;
  const neonOn = !(f2 % 46 === 8 || f2 % 46 === 12);
  return (
    <g>
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070620" />
          <stop offset="0.36" stopColor="#1b0f58" />
          <stop offset="0.64" stopColor="#5b1d9c" />
          <stop offset="0.84" stopColor="#c8298f" />
          <stop offset="0.95" stopColor="#ff6a5c" />
          <stop offset="1" stopColor="#ffb347" />
        </linearGradient>
        <linearGradient id="fogG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff4fd8" stopOpacity="0" />
          <stop offset="1" stopColor="#ff4fd8" stopOpacity="0.55" />
        </linearGradient>
        <Dots id="moonDots" step={11} r={3.1} color="#b04fd0" />
        <clipPath id="moonClip">
          <circle cx={900} cy={270} r={150} />
        </clipPath>
      </defs>
      <rect x={-200} y={-200} width={W + 400} height={base + 260} fill="url(#skyG)" />
      <g transform={`translate(${px * 0.03},${py * 0.03})`}>
        {stars}
        {/* lua com sombra reticulada e borda fora de registro */}
        <circle cx={906} cy={274} r={150} fill={C.cyan} opacity={0.7} />
        <circle cx={894} cy={266} r={150} fill={C.magenta} opacity={0.7} />
        <circle cx={900} cy={270} r={150} fill="#ffe3f6" />
        <g clipPath="url(#moonClip)">
          <circle cx={960} cy={330} r={170} fill="url(#moonDots)" />
          <circle cx={850} cy={220} r={26} fill="#f4bfe6" />
          <circle cx={930} cy={300} r={16} fill="#f4bfe6" />
          <circle cx={880} cy={340} r={34} fill="#f4bfe6" />
        </g>
        {/* nuvens chapadas */}
        {[[120, 420, 520, 1], [620, 560, 640, 2], [-80, 700, 460, 3]].map(([cx, cy, cw, k]) => (
          <g key={k} opacity={0.75}>
            <rect x={cx} y={cy} width={cw} height={26} rx={13} fill="#3b2396" />
            <rect x={cx + cw * 0.18} y={cy - 18} width={cw * 0.5} height={26} rx={13} fill="#4a2cb0" />
            <rect x={cx + cw * 0.3} y={cy + 20} width={cw * 0.6} height={16} rx={8} fill="#2c1a78" />
          </g>
        ))}
      </g>
      <image href={skyDots} x={0} y={base - 1500} width={W} height={1500} opacity={0.5} style={{mixBlendMode: 'screen'}} />
      {/* camadas de prédios */}
      <g transform={`translate(${px * 0.12},${py * 0.1})`}>
        <Row seed={1} y={base - 30} minW={60} maxW={150} minH={200} maxH={520} wall="#7a3fb8" win={[5, 7, 9, 12]} lit={0.14} />
      </g>
      <rect x={-200} y={base - 420} width={W + 400} height={420} fill="url(#fogG)" opacity={0.7} />
      <g transform={`translate(${px * 0.24},${py * 0.2})`}>
        <Row seed={2} y={base - 10} minW={90} maxW={200} minH={300} maxH={760} wall="#3c2390" win={[7, 10, 9, 13]} lit={0.24} detail />
      </g>
      <rect x={-200} y={base - 300} width={W + 400} height={300} fill="url(#fogG)" opacity={0.55} />
      <g transform={`translate(${px * 0.42},${py * 0.34})`}>
        <Row seed={3} y={base + 30} minW={130} maxW={260} minH={360} maxH={900} wall="#1f1560" win={[11, 16, 11, 15]} lit={0.3} detail edge="#6a4be0" />
        <g className="blinkers" opacity={blinkOn ? 1 : 0.15} />
      </g>
      <image href={hazeDots} x={0} y={base - 640} width={W} height={700} opacity={0.42} style={{mixBlendMode: 'screen'}} />
      {/* viaduto + trem */}
      <g transform={`translate(${px * 0.6},${py * 0.5})`}>
        {train !== undefined && <Train x={train} y={base - 168} />}
        <rect x={-400} y={base - 168} width={W + 800} height={22} fill="#0c0930" />
        <rect x={-400} y={base - 168} width={W + 800} height={4} fill="#4b3bd0" />
        {Array.from({length: 9}).map((_, i) => (
          <g key={i}>
            <rect x={-360 + i * 230} y={base - 148} width={16} height={400} fill="#0c0930" />
            <path d={`M${-352 + i * 230},${base - 146} l230,70 M${-122 + i * 230},${base - 146} l-230,70`} stroke="#0c0930" strokeWidth={5} />
          </g>
        ))}
      </g>
      {/* prédios próximos (moldura) */}
      <g transform={`translate(${px * 0.85},${py * 0.7})`}>
        <Row seed={7} y={base + 120} minW={236} maxW={237} minH={1120} maxH={1121} wall="#0e0a38" win={[26, 40, 22, 26]} lit={0.24} x0={-60} x1={-59} edge={C.cyan} />
        <Row seed={9} y={base + 120} minW={250} maxW={251} minH={900} maxH={901} wall="#0e0a38" win={[26, 40, 22, 26]} lit={0.26} x0={900} x1={901} edge={C.magenta} />
        {sign && (
          <g transform="translate(934,640)" opacity={neonOn ? 1 : 0.25}>
            <rect x={-8} y={-10} width={104} height={330} rx={10} fill="#12093a" stroke={INK} strokeWidth={6} />
            {['E', 'S', 'E', '?'].map((ch, i) => (
              <g key={i}>
                <text x={44} y={62 + i * 78} textAnchor="middle" fontFamily="BangersX" fontSize={78} fill="none" stroke={C.magenta} strokeWidth={12} opacity={0.35}>
                  {ch}
                </text>
                <text x={44} y={62 + i * 78} textAnchor="middle" fontFamily="BangersX" fontSize={78} fill="#ffe9fb" stroke={C.magenta} strokeWidth={3}>
                  {ch}
                </text>
              </g>
            ))}
          </g>
        )}
      </g>
    </g>
  );
};

// ================================================================ quarto à noite
export const Bedroom = ({f, px = 0, mood = 0}: {f: number; px?: number; mood?: number}) => {
  const f2 = twos(f);
  const bars = halftone('bars', 900, 900, 13, '#8fb0ff', (u, v) => (Math.sin(v * 26) > 0.1 ? 0.6 * (1 - u * 0.7) : 0), Math.PI / 5);
  const wallA = mix('#2f1c7c', '#5a1040', mood);
  const wallB = mix('#150c40', '#2a0620', mood);
  return (
    <g>
      <defs>
        <linearGradient id="wallG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={wallA} />
          <stop offset="1" stopColor={wallB} />
        </linearGradient>
        <linearGradient id="winG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#12104a" />
          <stop offset="0.7" stopColor="#7a2a9c" />
          <stop offset="1" stopColor="#ff6a8c" />
        </linearGradient>
        <clipPath id="winC">
          <rect x={650} y={250} width={360} height={560} />
        </clipPath>
      </defs>
      <rect x={-200} y={-100} width={W + 400} height={H + 200} fill="url(#wallG)" />
      <g transform={`translate(${px * 0.3},0)`}>
        {/* faixas de luz da persiana na parede */}
        <g transform="skewY(-13)">
          {Array.from({length: 8}).map((_, i) => (
            <rect key={i} x={-60} y={430 + i * 78} width={760 - i * 26} height={34} fill="#7f9cff" opacity={0.26} />
          ))}
        </g>
        <image href={bars} x={-40} y={250} width={900} height={900} opacity={0.28} style={{mixBlendMode: 'screen'}} />
        {/* janela com a cidade */}
        <rect x={650} y={250} width={360} height={560} fill="url(#winG)" />
        <g clipPath="url(#winC)">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const bx = 650 + i * 62 - 10, bh = 180 + rnd(i * 3 + 2) * 240;
            return (
              <g key={i}>
                <rect x={bx} y={810 - bh} width={58} height={bh} fill="#1a1258" />
                {Array.from({length: 14}).map((_, k) => (rnd(i * 31 + k) < 0.4 ? <rect key={k} x={bx + 8 + (k % 3) * 16} y={810 - bh + 14 + Math.floor(k / 3) * 34} width={9} height={14} fill={LIT[(i + k) % LIT.length]} /> : null))}
              </g>
            );
          })}
          {Array.from({length: 15}).map((_, i) => (
            <rect key={i} x={650} y={258 + i * 38} width={360} height={11} fill="#0e0a34" opacity={0.92} />
          ))}
        </g>
        <rect x={650} y={250} width={360} height={560} fill="none" stroke={INK} strokeWidth={12} />
        <rect x={634} y={806} width={392} height={26} fill="#3a2a8c" stroke={INK} strokeWidth={8} />
        <rect x={650} y={250} width={8} height={560} fill={C.cyan} opacity={0.6} />
        {/* pôsteres */}
        <g transform="rotate(-3 200 470)">
          <rect x={70} y={300} width={262} height={350} fill={C.yellow} stroke={INK} strokeWidth={9} />
          <polygon points="201,340 226,430 316,410 250,474 300,560 210,520 150,600 152,506 76,470 160,440" fill={C.red} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <text x={201} y={492} textAnchor="middle" fontFamily="BangersX" fontSize={66} fill="#fff" stroke={INK} strokeWidth={5} paintOrder="stroke">
            POW!
          </text>
          <rect x={170} y={286} width={62} height={26} fill="#fff6c8" opacity={0.85} transform="rotate(4 200 300)" />
        </g>
        <g transform="rotate(4 460 520)">
          <rect x={372} y={400} width={200} height={260} fill="#0e2a6a" stroke={INK} strokeWidth={9} />
          <circle cx={472} cy={520} r={66} fill={C.cyan} />
          <circle cx={494} cy={540} r={66} fill="#0e2a6a" opacity={0.55} />
          <ellipse cx={472} cy={520} rx={104} ry={22} fill="none" stroke={C.magenta} strokeWidth={8} transform="rotate(-18 472 520)" />
        </g>
        {/* varal de luzinhas */}
        <path d="M-20,150 Q180,250 380,170 Q560,110 760,190 Q920,250 1100,150" fill="none" stroke={INK} strokeWidth={5} />
        {Array.from({length: 13}).map((_, i) => {
          const u = i / 12;
          const x = -20 + u * 1120;
          const y = 150 + Math.sin(u * Math.PI * 3) * 46 + 40;
          const on = (i + Math.floor(f2 / 10)) % 4 !== 0;
          const col = [C.yellow, C.magenta, C.cyan][i % 3];
          return (
            <g key={i} opacity={on ? 1 : 0.35}>
              <circle cx={x} cy={y} r={26} fill={col} opacity={0.22} />
              <circle cx={x} cy={y} r={11} fill={col} stroke={INK} strokeWidth={4} />
            </g>
          );
        })}
        {/* prateleira com livros */}
        <rect x={60} y={900} width={420} height={22} fill="#3a2a8c" stroke={INK} strokeWidth={8} />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect key={i} x={84 + i * 44} y={900 - 110 - rnd(i + 4) * 50} width={36} height={110 + rnd(i + 4) * 50} fill={[C.red, C.cyan, C.yellow, '#8a5cff', C.pink, '#3ddc84', C.orange][i]} stroke={INK} strokeWidth={6} transform={i === 6 ? 'rotate(14 370 900)' : undefined} />
        ))}
      </g>
      {/* cabeceira */}
      <rect x={-100} y={1560} width={W + 200} height={500} fill="#120a36" stroke={INK} strokeWidth={10} />
    </g>
  );
};

// ================================================================ escritório no fim de tarde
export const Office = ({f}: {f: number}) => {
  const sun = halftone('sun', 600, 500, 12, '#ff5a3c', (u, v) => Math.max(0, v - 0.15) * 0.9);
  return (
    <g>
      <defs>
        <linearGradient id="offW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb25c" />
          <stop offset="1" stopColor="#ff7a59" />
        </linearGradient>
        <linearGradient id="offS" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe27a" />
          <stop offset="0.6" stopColor="#ff9a4a" />
          <stop offset="1" stopColor="#ff4f8a" />
        </linearGradient>
        <clipPath id="offC">
          <rect x={470} y={140} width={560} height={460} />
        </clipPath>
      </defs>
      <rect x={-100} y={0} width={W + 200} height={1000} fill="url(#offW)" />
      {/* janela com pôr do sol */}
      <rect x={470} y={140} width={560} height={460} fill="url(#offS)" />
      <g clipPath="url(#offC)">
        <circle cx={760} cy={470} r={150} fill="#fff3b0" />
        <image href={sun} x={460} y={150} width={600} height={500} opacity={0.55} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
          const bh = 90 + rnd(i * 5 + 1) * 200;
          return <rect key={i} x={470 + i * 72} y={600 - bh} width={66} height={bh} fill={i % 2 ? '#7a2a8c' : '#5a1f7a'} />;
        })}
        {Array.from({length: 7}).map((_, i) => (
          <rect key={i} x={470} y={150 + i * 30} width={560} height={9} fill="#7a3a2a" opacity={0.55} />
        ))}
      </g>
      <rect x={470} y={140} width={560} height={460} fill="none" stroke={INK} strokeWidth={12} />
      <path d="M750,140 V600" stroke={INK} strokeWidth={10} />
      {/* quadro com gráfico */}
      <g transform="rotate(-2 230 330)">
        <rect x={70} y={190} width={330} height={270} fill="#fff6e0" stroke={INK} strokeWidth={10} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={110 + i * 68} y={410 - (60 + i * 42)} width={44} height={60 + i * 42} fill={[C.cyan, C.magenta, C.yellow, C.red][i]} stroke={INK} strokeWidth={6} />
        ))}
        <path d="M104,372 L172,330 L240,290 L330,226" fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <polygon points="330,226 300,230 318,254" fill={INK} />
      </g>
      {/* relógio */}
      <circle cx={170} cy={96} r={46} fill="#fff" stroke={INK} strokeWidth={9} />
      <path d="M170,96 L170,66 M170,96 L192,108" stroke={INK} strokeWidth={7} strokeLinecap="round" />
    </g>
  );
};

// ================================================================ fachada (plano final)
export const Facade = ({f}: {f: number}) => {
  const f2 = twos(f);
  const glow = halftone('fac', 520, 620, 13, '#ff4fd8', (u, v) => Math.max(0, 1 - Math.hypot(u - 0.5, v - 0.5) * 2.1) * 0.9);
  const cols = [90, 420, 750];
  const rows = [250, 640, 1030, 1420];
  const tv = Math.floor(f2 / 6) % 3;
  return (
    <g>
      <defs>
        <linearGradient id="facG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1a78" />
          <stop offset="1" stopColor="#140c44" />
        </linearGradient>
        <pattern id="brick" width={64} height={32} patternUnits="userSpaceOnUse">
          <path d="M0,0 H64 M0,16 H64 M0,0 V16 M32,16 V32" stroke="#0e0834" strokeWidth={3} opacity={0.55} />
        </pattern>
        <linearGradient id="biaG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff8fd8" />
          <stop offset="1" stopColor="#ff3b9c" />
        </linearGradient>
      </defs>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#facG)" />
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill="url(#brick)" />
      <rect x={-100} y={150} width={W + 200} height={34} fill="#0e0834" stroke={INK} strokeWidth={8} />
      {rows.map((ry, r) =>
        cols.map((cx, c) => {
          const bia = r === 2 && c === 1;
          const warm = (r === 1 && c === 0) || (r === 3 && c === 2);
          const tvw = r === 1 && c === 2;
          return (
            <g key={`${r}-${c}`}>
              <rect x={cx - 16} y={ry - 16} width={272} height={332} fill="#0e0834" stroke={INK} strokeWidth={8} />
              <rect x={cx} y={ry} width={240} height={300} fill={bia ? 'url(#biaG)' : warm ? '#ffc95c' : tvw ? ['#3a6cff', '#7ad0ff', '#2a3fb0'][tv] : '#0a0726'} />
              {warm && (
                <g>
                  <rect x={cx} y={ry} width={70} height={300} fill="#c96a2a" opacity={0.75} />
                  <rect x={cx + 170} y={ry} width={70} height={300} fill="#c96a2a" opacity={0.75} />
                  <path d={`M${cx + 120},${ry + 300} v-70 q-30,-40 -6,-80 q26,34 6,80`} fill="#1a5a3a" stroke={INK} strokeWidth={5} />
                </g>
              )}
              {!bia && !warm && !tvw && <path d={`M${cx},${ry} h240 v70 q-120,60 -240,0 Z`} fill="#1c1458" opacity={0.9} />}
              <path d={`M${cx + 120},${ry} v300 M${cx},${ry + 140} h240`} stroke={INK} strokeWidth={8} />
              <rect x={cx} y={ry} width={240} height={300} fill="none" stroke={INK} strokeWidth={8} />
              <rect x={cx - 26} y={ry + 300} width={292} height={22} fill="#3a2a9c" stroke={INK} strokeWidth={7} />
            </g>
          );
        }),
      )}
      {/* brilho reticulado em volta da janela da Bia */}
      <image href={glow} x={280} y={870} width={520} height={620} opacity={0.75} style={{mixBlendMode: 'screen'}} />
      {/* escada de incêndio */}
      <g stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round">
        <path d="M690,560 H1040 M690,950 H1040 M690,1340 H1040 M690,1730 H1040" />
        <path d="M690,470 V560 M1040,470 V560 M690,860 V950 M1040,860 V950 M690,1250 V1340 M1040,1250 V1340" />
        <path d="M690,470 H1040 M690,860 H1040 M690,1250 H1040" strokeWidth={6} />
        <path d="M720,950 L1010,560 M720,1340 L1010,950 M720,1730 L1010,1340" />
        {Array.from({length: 9}).map((_, i) => (
          <path key={i} d={`M${722 + i * 36},470 V560 M${722 + i * 36},860 V950 M${722 + i * 36},1250 V1340`} strokeWidth={4} opacity={0.8} />
        ))}
      </g>
    </g>
  );
};

// ================================================================ fundo "pop" (retícula + linhas de ação)
export const PopBG = ({a, b, dots, key2}: {a: string; b: string; dots: string; key2: string}) => {
  const tex = halftone('pop' + key2, W, H, 26, dots, (u, v) => Math.pow(clampv(1 - Math.hypot(u - 0.5, (v - 0.42) * 1.5) * 1.25), 0.9));
  return (
    <g>
      <defs>
        <radialGradient id={`pop${key2}`} cx="50%" cy="42%" r="75%">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </radialGradient>
      </defs>
      <rect x={-100} y={-100} width={W + 200} height={H + 200} fill={`url(#pop${key2})`} />
      <image href={tex} x={0} y={0} width={W} height={H} opacity={0.6} />
    </g>
  );
};
const clampv = (v: number) => Math.max(0, Math.min(1, v));
