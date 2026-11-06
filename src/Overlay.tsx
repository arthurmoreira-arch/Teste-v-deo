import React, {useMemo} from 'react';
import {continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import oswald600 from '@fontsource/oswald/files/oswald-latin-600-normal.woff2';
import oswald700 from '@fontsource/oswald/files/oswald-latin-700-normal.woff2';
import playfair800 from '@fontsource/playfair-display/files/playfair-display-latin-800-normal.woff2';
import {Shot, parseTokens, shotFrames} from './script';

const loadFonts = () => {
  const h = delayRender('fonts');
  Promise.all([
    new FontFace('OswaldX', `url(${oswald700})`, {weight: '700'}).load(),
    new FontFace('OswaldX', `url(${oswald600})`, {weight: '600'}).load(),
    new FontFace('PlayfairX', `url(${playfair800})`, {weight: '800'}).load(),
  ])
    .then((fs) => {
      fs.forEach((f) => document.fonts.add(f));
      continueRender(h);
    })
    .catch(() => continueRender(h));
};
let started = false;
if (typeof document !== 'undefined' && !started) {
  started = true;
  loadFonts();
}

const YELLOW = '#f7c61a';
const RED = '#ff3b30';
const COLORS = {white: '#ffffff', yellow: YELLOW, red: RED};

const Tag = () => (
  <div style={{position: 'absolute', left: 36, top: 118, fontFamily: 'OswaldX', fontWeight: 600, fontSize: 30, letterSpacing: 3, color: 'rgba(255,255,255,0.7)'}}>E SE #1</div>
);

/** Legenda no centro-baixo, 2-3 palavras por vez, como no vídeo de referência. */
const Caption = ({shot}: {shot: Shot}) => {
  const frame = useCurrentFrame();
  const dur = shotFrames(shot);
  const toks = useMemo(() => parseTokens(shot.text), [shot.text]);
  const pages = useMemo(() => {
    const out: typeof toks[] = [];
    let cur: typeof toks = [];
    toks.forEach((t, i) => {
      cur.push(t);
      const end = /[.,?!]$/.test(t.w) || cur.length >= 3 || (cur.length === 2 && t.w.length > 7);
      if (end) { out.push(cur); cur = []; }
    });
    if (cur.length) out.push(cur);
    return out;
  }, [toks]);
  const speak = dur - 12;
  const total = toks.length;
  let acc = 0;
  let page = pages.length - 1;
  let pageStart = 0;
  for (let i = 0; i < pages.length; i++) {
    const len = (pages[i].length / total) * speak;
    if (frame - 4 < acc + len) { page = i; pageStart = acc; break; }
    acc += len;
  }
  const {fps} = useVideoConfig();
  const s = spring({frame: frame - 4 - pageStart, fps, config: {damping: 14, stiffness: 220}, durationInFrames: 10});
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1180, textAlign: 'center', fontFamily: 'OswaldX', fontWeight: 700, fontSize: 104, lineHeight: 1.05, textTransform: 'uppercase', transform: `scale(${0.82 + 0.18 * s})`, opacity: Math.min(1, s * 1.6)}}>
      {pages[page].map((t, i) => (
        <span key={i} style={{color: COLORS[t.c], marginRight: 22, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 5px 0 #000'}}>
          {t.w}
        </span>
      ))}
    </div>
  );
};

const Hud = ({shot}: {shot: Shot}) => {
  const frame = useCurrentFrame();
  if (!shot.hud) return null;
  const dur = shotFrames(shot);
  const {label, from, to, prefix = '', suffix = ''} = shot.hud;
  const v = Math.round(interpolate(frame, [0, dur * 0.8], [from, to], {extrapolateRight: 'clamp'}));
  const txt = prefix + v.toLocaleString('pt-BR') + suffix;
  const pop = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 36, top: 320, opacity: pop, transform: `translateY(${(1 - pop) * 20}px)`}}>
      <div style={{fontFamily: 'OswaldX', fontWeight: 600, fontSize: 32, letterSpacing: 4, color: 'rgba(255,255,255,0.8)', textShadow: '0 2px 0 #000'}}>{label}</div>
      <div style={{fontFamily: 'PlayfairX', fontWeight: 800, fontSize: 78, color: YELLOW, WebkitTextStroke: '6px #1a1200', paintOrder: 'stroke fill', textShadow: '0 4px 0 #1a1200'}}>{txt}</div>
    </div>
  );
};

const Poll = ({instant}: {instant?: boolean}) => {
  const frame = useCurrentFrame() + (instant ? 80 : 0);
  const a = interpolate(frame, [20, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const btn = (bg: string, fg: string, txt: string, d: number) => {
    const k = interpolate(frame, [d, d + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return (
      <div style={{background: bg, color: fg, fontFamily: 'OswaldX', fontWeight: 700, fontSize: 64, textTransform: 'uppercase', padding: '14px 36px', borderRadius: 22, margin: '16px auto', width: 880, textAlign: 'center', transform: `scale(${0.8 + 0.2 * k})`, opacity: k, boxShadow: '0 8px 0 rgba(0,0,0,.45)'}}>{txt}</div>
    );
  };
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: a}}>
      <div style={{fontFamily: 'OswaldX', fontWeight: 700, fontSize: 96, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 5px 0 #000'}}>
        VOCÊ <span style={{color: YELLOW}}>TROCARIA?</span>
      </div>
      {btn(YELLOW, '#1a1200', 'A · sim, a família dele', 30)}
      {btn('#ff5a4d', '#fff', 'B · não, as vítimas', 42)}
      <div style={{fontFamily: 'OswaldX', fontWeight: 600, fontSize: 40, color: '#fff', textTransform: 'uppercase', marginTop: 10, textShadow: '0 3px 0 #000', opacity: interpolate(frame, [54, 64], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        Comenta A ou B 👇
      </div>
    </div>
  );
};

const CtaButtons = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = [
    {icon: '👍', label: 'CURTE', bg: '#ff3b5c', at: 14},
    {icon: '➕', label: 'SEGUE', bg: '#f7c61a', at: 40, fg: '#1a1200'},
    {icon: '🗳️', label: 'VOTA', bg: '#35c46a', at: 66},
  ];
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1500, display: 'flex', justifyContent: 'center', gap: 26}}>
      {items.map((it) => {
        const k = spring({frame: frame - it.at, fps, config: {damping: 10, stiffness: 180}});
        const wob = 1 + Math.sin(frame / 5 + it.at) * 0.025 * Math.min(1, k);
        return (
          <div key={it.label} style={{background: it.bg, color: it.fg ?? '#fff', borderRadius: 26, padding: '18px 26px', textAlign: 'center', fontFamily: 'OswaldX', fontWeight: 700, transform: `scale(${Math.max(0, k) * wob})`, boxShadow: '0 8px 0 rgba(0,0,0,.5)', width: 270}}>
            <div style={{fontSize: 74, lineHeight: 1}}>{it.icon}</div>
            <div style={{fontSize: 52}}>{it.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export const Overlay = ({shot}: {shot: Shot}) => (
  <>
    <Tag />
    <Hud shot={shot} />
    {shot.poll ? <Poll instant={shot.cta} /> : <Caption shot={shot} />}
    {shot.cta && (
      <>
        <Caption shot={shot} />
        <CtaButtons />
      </>
    )}
  </>
);
