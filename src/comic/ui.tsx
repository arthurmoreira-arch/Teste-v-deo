// Elementos de interface no estilo HQ: celular/conversa, legendas, título, enquete, onomatopeias.
import React, {useMemo} from 'react';
import {C, INK, Letter, W, burstPts, mix, pop, rnd, twos} from './kit';
import {parseTokens} from '../script';

const SANS = '"Liberation Sans", Arial, Helvetica, sans-serif';
export type Msg = {t?: string; me?: boolean; deleted?: boolean; reveal?: string; at?: number};

// ---------------------------------------------------------------- conversa
const Bubble = ({m, f, i, instant}: {m: Msg; f: number; i: number; instant?: boolean}) => {
  const appear = instant ? 1 : pop(f, 4 + i * 4);
  const at = m.at ?? 99999;
  const revealed = !!m.deleted && f >= at + 6;
  const glitch = !!m.deleted && f >= at && f < at + 6;
  const step = Math.floor(f / 2);
  const tease = !!m.deleted && !revealed && !glitch && step % 8 === 0;
  const jx = glitch ? (rnd(step * 7 + i) - 0.5) * 40 : tease ? 5 : 0;
  const bg = m.deleted ? (revealed ? C.yellow : '#2a2f44') : m.me ? '#22c97a' : '#eef0f8';
  const fg = m.deleted && !revealed ? '#9aa3bd' : '#0b0d14';
  const punch = revealed ? (f < at + 10 ? 1.12 : 1.03) : 1;
  if (appear <= 0) return <div style={{height: 82}} />;
  return (
    <div style={{alignSelf: m.me ? 'flex-end' : 'flex-start', maxWidth: '92%', position: 'relative', transform: `translateX(${jx}px) scale(${appear * punch})`, transformOrigin: m.me ? 'right center' : 'left center'}}>
      <div
        style={{
          background: bg,
          color: fg,
          border: `6px solid ${INK}`,
          borderRadius: 28,
          padding: '12px 24px',
          fontFamily: SANS,
          fontWeight: revealed ? 700 : 400,
          fontStyle: m.deleted && !revealed ? 'italic' : 'normal',
          fontSize: 38,
          lineHeight: 1.2,
          whiteSpace: 'nowrap',
          boxShadow: revealed ? `8px 8px 0 ${C.magenta}` : glitch ? `12px 0 0 ${C.magenta}, -12px 0 0 ${C.cyan}` : '5px 5px 0 rgba(0,0,0,.55)',
        }}
      >
        {m.deleted ? (revealed ? m.reveal : '🚫 Mensagem apagada') : m.t}
      </div>
      {glitch &&
        [0, 1, 2, 3, 4].map((k) => (
          <div key={k} style={{position: 'absolute', left: `${rnd(step * 3 + k) * 100}%`, top: `${rnd(step * 5 + k * 2) * 120 - 20}%`, width: 18 + rnd(k + step) * 50, height: 10 + rnd(k * 3 + step) * 16, background: [C.magenta, C.cyan, C.yellow][k % 3]}} />
        ))}
    </div>
  );
};

type ChatProps = {name: string; msgs: Msg[]; f: number; y: number; x?: number; w?: number; rot?: number; instant?: boolean; hue?: string; minH?: number};
export const ChatCard = ({name, msgs, f, y, x = 110, w = 860, rot = -2.5, instant = false, hue = C.magenta, minH = 0}: ChatProps) => {
  const k = instant ? 1 : pop(f, 0);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot}deg) scale(${k})`, transformOrigin: '50% 50%'}}>
      <div style={{background: '#10121e', border: `10px solid ${INK}`, borderRadius: 46, boxShadow: `14px 12px 0 ${C.magenta}, -10px -8px 0 ${C.cyan}`, overflow: 'hidden'}}>
        <div style={{background: '#1d2133', padding: '15px 26px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: `7px solid ${INK}`}}>
          <div style={{width: 66, height: 66, borderRadius: 33, background: `linear-gradient(135deg, ${hue}, ${C.yellow})`, border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'BangersX', fontSize: 44, color: '#fff', WebkitTextStroke: `2px ${INK}`}}>{name.charAt(0)}</div>
          <div style={{flex: 1}}>
            <div style={{fontFamily: 'OswaldC', fontWeight: 700, fontSize: 44, color: '#fff', lineHeight: 1.05}}>{name}</div>
            <div style={{fontFamily: SANS, fontSize: 24, color: '#3ddc84'}}>online</div>
          </div>
          <div style={{fontFamily: SANS, fontSize: 44, color: '#8b93b5'}}>⋮</div>
        </div>
        <div style={{padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', gap: 14, minHeight: minH, background: 'radial-gradient(circle, rgba(255,255,255,0.07) 2px, transparent 2.6px) 0 0 / 16px 16px, #11141f'}}>
          {msgs.map((m, i) => (
            <Bubble key={i} m={m} f={f} i={i} instant={instant} />
          ))}
        </div>
      </div>
    </div>
  );
};

/** Balão solto (antes de o celular abrir a conversa). */
export const FloatBubble = ({f, x, y, text = '🚫 Mensagem apagada'}: {f: number; x: number; y: number; text?: string}) => {
  const step = Math.floor(f / 2);
  const j = step % 7 === 0 ? 5 : 0;
  return (
    <div style={{position: 'absolute', left: x + j, top: y + Math.sin(step / 3) * 5, transform: 'rotate(3deg)'}}>
      <div style={{background: '#2a2f44', color: '#c3cae0', border: `6px solid ${INK}`, borderRadius: 28, padding: '12px 22px', fontFamily: SANS, fontStyle: 'italic', fontSize: 36, whiteSpace: 'nowrap', boxShadow: j ? `10px 0 0 ${C.magenta}, -10px 0 0 ${C.cyan}` : `7px 7px 0 ${C.magenta}`}}>{text}</div>
      <div style={{position: 'absolute', left: 54, bottom: -30, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '26px solid transparent', borderTop: `34px solid ${INK}`}} />
      <div style={{position: 'absolute', left: 58, bottom: -17, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '17px solid transparent', borderTop: '23px solid #2a2f44'}} />
    </div>
  );
};

/** Celular com a lista de conversas (o dedo toca na conversa da Bia). */
export const PhoneList = ({f, y, x = 150, w = 780, rot = 2.5, tapAt = 36}: {f: number; y: number; x?: number; w?: number; rot?: number; tapAt?: number}) => {
  const rows = [
    {n: 'Lucas', p: 'vou sim!', c: C.cyan, time: '21:04'},
    {n: 'Chefe', p: 'ok 👍', c: C.orange, time: '18:30'},
    {n: 'Bia ❤️', p: '🚫 3 mensagens apagadas', c: C.magenta, time: 'agora', hot: true},
  ];
  const tapped = f >= tapAt;
  const k = pop(f, 0);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, transform: `rotate(${rot}deg) scale(${k})`, transformOrigin: '50% 50%'}}>
      <div style={{background: '#0f111c', border: `12px solid ${INK}`, borderRadius: 60, boxShadow: `16px 14px 0 ${C.cyan}, -10px -8px 0 ${C.magenta}`, overflow: 'hidden'}}>
        <div style={{padding: '20px 34px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1d2133', borderBottom: `7px solid ${INK}`}}>
          <div style={{fontFamily: 'OswaldC', fontWeight: 700, fontSize: 52, color: '#fff'}}>Conversas</div>
          <div style={{fontFamily: SANS, fontSize: 28, color: '#0b0d14', background: '#3ddc84', border: `5px solid ${INK}`, borderRadius: 30, padding: '4px 18px', fontWeight: 700}}>3</div>
        </div>
        {rows.map((r, i) => {
          const hot = !!r.hot && tapped;
          const press = hot && f < tapAt + 6 ? 0.96 : 1;
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 22, padding: '18px 30px', borderBottom: i < 2 ? '4px solid #232840' : undefined, background: hot ? (Math.floor(f / 2) % 2 ? '#4a1560' : '#5c1a78') : r.hot ? '#1a1630' : undefined, transform: `scale(${press})`}}>
              <div style={{width: 92, height: 92, borderRadius: 46, background: `linear-gradient(135deg, ${r.c}, ${C.yellow})`, border: `6px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'BangersX', fontSize: 58, color: '#fff', WebkitTextStroke: `2px ${INK}`}}>{r.n.charAt(0)}</div>
              <div style={{flex: 1}}>
                <div style={{fontFamily: 'OswaldC', fontWeight: 700, fontSize: 48, color: '#fff', lineHeight: 1.1}}>{r.n}</div>
                <div style={{fontFamily: SANS, fontSize: 32, fontStyle: r.hot ? 'italic' : 'normal', fontWeight: r.hot ? 700 : 400, color: r.hot ? C.yellow : '#9aa3bd', whiteSpace: 'nowrap'}}>{r.p}</div>
              </div>
              <div style={{fontFamily: SANS, fontSize: 26, color: r.hot ? '#3ddc84' : '#6f7896'}}>{r.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Polegar que toca na tela (SVG; ponta em 0,0 apontando para a esquerda). */
export const Thumb = ({skin, sleeve}: {skin: string; sleeve: string}) => {
  const sh = mix(skin, '#1a1050', 0.4);
  return (
    <g>
      <defs>
        <clipPath id="thumbC">
          <path d="M0,0 C-6,-46 40,-72 112,-68 L540,-44 L540,96 L112,68 C40,72 -6,46 0,0 Z" />
        </clipPath>
      </defs>
      <path d="M0,0 C-6,-46 40,-72 112,-68 L540,-44 L540,96 L112,68 C40,72 -6,46 0,0 Z" fill={skin} />
      <g clipPath="url(#thumbC)">
        <rect x={-20} y={24} width={600} height={90} fill={sh} />
        <path d="M12,-4 C10,-36 38,-52 90,-50 L92,30 C42,38 14,28 12,-4 Z" fill={mix(skin, '#ffffff', 0.55)} stroke={INK} strokeWidth={5} />
        <path d="M216,-46 q-12,44 4,92 M244,-46 q-12,46 4,96" fill="none" stroke={INK} strokeWidth={4.5} opacity={0.6} />
      </g>
      <path d="M0,0 C-6,-46 40,-72 112,-68 L540,-44 L540,96 L112,68 C40,72 -6,46 0,0 Z" fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M430,-90 L640,-76 L640,140 L430,112 Z" fill={sleeve} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <path d="M452,-84 V110 M474,-82 V112" stroke={INK} strokeWidth={4} opacity={0.5} />
    </g>
  );
};

// ---------------------------------------------------------------- legendas palavra a palavra
const CAP = {white: C.white, yellow: C.yellow, red: '#ff4a5e'};
export const Captions = ({text, f, dur, y, size = 104}: {text: string; f: number; dur: number; y: number; size?: number}) => {
  const toks = useMemo(() => parseTokens(text), [text]);
  const pages = useMemo(() => {
    const out: (typeof toks)[] = [];
    let cur: typeof toks = [];
    toks.forEach((t) => {
      cur.push(t);
      const end = /[.,?!:]$/.test(t.w) || cur.length >= 3 || (cur.length === 2 && t.w.length > 7);
      if (end) {
        out.push(cur);
        cur = [];
      }
    });
    if (cur.length) out.push(cur);
    return out;
  }, [toks]);
  const speak = dur - 10;
  let acc = 0;
  let page = pages.length - 1;
  let start = 0;
  for (let i = 0; i < pages.length; i++) {
    const len = (pages[i].length / toks.length) * speak;
    if (f - 3 < acc + len) {
      page = i;
      start = acc;
      break;
    }
    acc += len;
  }
  const k = page === 0 && f < 6 ? 1 : pop(f, Math.round(start) + 3);
  const len = pages[page].map((t) => t.w).join(' ').length;
  const fs = len > 19 ? size * 0.78 : len > 15 ? size * 0.88 : size;
  return (
    <div style={{position: 'absolute', left: 20, right: 20, top: y, display: 'flex', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: fs * 0.2, transform: `scale(${Math.max(0.01, k)}) rotate(-2deg)`}}>
        {pages[page].map((t, i) => (
          <Letter key={i} size={fs} color={CAP[t.c]} stroke={fs * 0.11} rot={i % 2 ? 1.5 : -1.5} halo={C.white}>
            {t.w}
          </Letter>
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- título (premissa)
export const TitleBlock = ({f, y, lines, instant, size = 122}: {f: number; y: number; lines: {t: string; c: string}[]; instant?: boolean; size?: number}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2}}>
    {lines.map((l, i) => (
      <div key={i} style={{transform: `scale(${instant ? 1 : Math.max(0.01, pop(f, i * 4))})`}}>
        <Letter size={size} color={l.c} stroke={size * 0.115} rot={i % 2 ? 1.6 : -1.6}>
          {l.t}
        </Letter>
      </div>
    ))}
  </div>
);

// ---------------------------------------------------------------- enquete / pedido / caixas
export const Poll = ({f, y, title, hi, options, footer}: {f: number; y: number; title: string; hi: string; options: string[]; footer: string}) => {
  const cols = [
    {bg: C.yellow, fg: INK},
    {bg: '#ff4a6a', fg: '#fff'},
    {bg: '#28c8ff', fg: INK},
    {bg: '#3ddc84', fg: INK},
  ];
  const end = 16 + options.length * 8;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{display: 'flex', gap: 22, transform: `scale(${Math.max(0.01, pop(f, 4))})`}}>
        <Letter size={104} stroke={12}>
          {title}
        </Letter>
        <Letter size={104} stroke={12} color={C.yellow} rot={2}>
          {hi}
        </Letter>
      </div>
      {options.map((o, i) => {
        const c = cols[i % cols.length];
        return (
          <div key={i} style={{marginTop: 20, width: 920, transform: `scale(${Math.max(0.01, pop(f, 14 + i * 8))}) skewX(-6deg) rotate(${i % 2 ? 0.8 : -0.8}deg)`, background: c.bg, border: `8px solid ${INK}`, borderRadius: 18, boxShadow: `10px 10px 0 ${INK}`, padding: '10px 20px', textAlign: 'center', fontFamily: 'BangersX', fontSize: 62, letterSpacing: 2, color: c.fg, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
            {o}
          </div>
        );
      })}
      <div style={{marginTop: 26, transform: `scale(${Math.max(0.01, pop(f, end + 6))}) rotate(-1.5deg)`, background: INK, border: `5px solid ${C.white}`, borderRadius: 14, padding: '8px 24px', fontFamily: 'OswaldC', fontWeight: 700, fontSize: 40, color: C.white, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{footer}</div>
    </div>
  );
};

export const Ask = ({f, at = 4, y, text}: {f: number; at?: number; y: number; text: string}) => {
  const k = pop(f, at);
  const wob = Math.floor(f / 4) % 2 ? 1.5 : -1.5;
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center'}}>
      <div style={{transform: `scale(${k}) rotate(${-3 + wob}deg) skewX(-5deg)`, background: C.yellow, border: `8px solid ${INK}`, borderRadius: 20, boxShadow: `10px 10px 0 ${C.magenta}, 10px 10px 0 8px ${INK}`, padding: '12px 34px', fontFamily: 'BangersX', fontSize: 76, letterSpacing: 2, color: INK, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{text}</div>
    </div>
  );
};

/** Caixa de narração de HQ (amarela). */
export const CaptionBox = ({f, at = 0, x, y, text, rot = -2, bg = '#fff3a8'}: {f: number; at?: number; x: number; y: number; text: string; rot?: number; bg?: string}) => {
  const k = pop(f, at);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `scale(${k}) rotate(${rot}deg)`, transformOrigin: 'left center', background: bg, border: `7px solid ${INK}`, boxShadow: `8px 8px 0 ${INK}`, padding: '10px 24px', fontFamily: 'OswaldC', fontWeight: 700, fontSize: 46, color: INK, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>
      {text}
    </div>
  );
};

/** Onomatopeia com explosão atrás. */
export const Sfx = ({f, at, x, y, text, rot = -8, color = C.yellow, burst = C.red, size = 150, hold = 26}: {f: number; at: number; x: number; y: number; text: string; rot?: number; color?: string; burst?: string; size?: number; hold?: number}) => {
  if (f < at || f > at + hold) return null;
  const k = pop(f, at);
  const step = Math.floor(f / 2);
  const w = size * text.length * 0.52 + 120;
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - size * 0.9, width: w, height: size * 1.8, transform: `rotate(${rot + (step % 2 ? 2 : -2)}deg) scale(${k})`}}>
      <svg width={w} height={size * 1.8} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <polygon points={burstPts(w / 2 + 10, size * 0.9 + 10, w * 0.62, w * 0.4, 11, 3 + (step % 2))} fill={INK} />
        <polygon points={burstPts(w / 2, size * 0.9, w * 0.62, w * 0.4, 11, 3 + (step % 2))} fill={burst} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: size * 0.4, display: 'flex', justifyContent: 'center'}}>
        <Letter size={size} color={color} stroke={size * 0.1} skew={-12}>
          {text}
        </Letter>
      </div>
    </div>
  );
};

export const Tag = ({text}: {text: string}) => (
  <div style={{position: 'absolute', left: 34, top: 56, background: INK, border: `4px solid ${C.yellow}`, borderRadius: 10, padding: '2px 14px', fontFamily: 'BangersX', fontSize: 34, letterSpacing: 2, color: C.yellow, transform: 'rotate(-3deg)'}}>{text}</div>
);
