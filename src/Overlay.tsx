import React, {useMemo} from 'react';
import {continueRender, delayRender, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import oswald600 from '@fontsource/oswald/files/oswald-latin-600-normal.woff2';
import oswald700 from '@fontsource/oswald/files/oswald-latin-700-normal.woff2';
import playfair800 from '@fontsource/playfair-display/files/playfair-display-latin-800-normal.woff2';
import {Comment, Poll as PollT, Shot, Thought, TitleLine, parseTokens} from './script';
import {useEp} from './ep';

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

const Tag = () => {
  const {ep} = useEp();
  return <div style={{position: 'absolute', left: 36, top: 118, fontFamily: 'OswaldX', fontWeight: 600, fontSize: 30, letterSpacing: 3, color: 'rgba(255,255,255,0.7)'}}>{ep.tag}</div>;
};

/** Legenda no centro-baixo, 2-3 palavras por vez, como no vídeo de referência. */
const Caption = ({shot}: {shot: Shot}) => {
  const frame = useCurrentFrame();
  const dur = useEp().frames(shot);
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
  const s = spring({frame: frame - 4 - pageStart + (shot.cover && page === 0 ? 12 : 0), fps, config: {damping: 14, stiffness: 220}, durationInFrames: 10});
  const pageLen = pages[page].map((t) => t.w).join(' ').length; // páginas longas encolhem para não cortar na borda
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 1180, textAlign: 'center', fontFamily: 'OswaldX', fontWeight: 700, fontSize: pageLen > 19 ? 84 : pageLen > 16 ? 94 : 104, lineHeight: 1.05, textTransform: 'uppercase', transform: `scale(${0.82 + 0.18 * s})`, opacity: Math.min(1, s * 1.6)}}>
      {pages[page].map((t, i) => (
        <span key={i} style={{color: COLORS[t.c], marginRight: 22, WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 5px 0 #000'}}>
          {t.w}
        </span>
      ))}
    </div>
  );
};

const Hud = ({shot}: {shot: Shot}) => {
  const top = shot.titleBar ? 560 : 320;
  const frame = useCurrentFrame();
  const dur = useEp().frames(shot);
  if (!shot.hud) return null;
  const {label, from, to, prefix = '', suffix = ''} = shot.hud;
  const v = Math.round(interpolate(frame, [0, dur * 0.8], [from, to], {extrapolateRight: 'clamp'}));
  const txt = prefix + v.toLocaleString('pt-BR') + suffix;
  const pop = shot.cover ? 1 : interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', left: 36, top, opacity: pop, transform: `translateY(${(1 - pop) * 20}px)`}}>
      <div style={{fontFamily: 'OswaldX', fontWeight: 600, fontSize: 32, letterSpacing: 4, color: 'rgba(255,255,255,0.8)', textShadow: '0 2px 0 #000'}}>{label}</div>
      <div style={{fontFamily: 'PlayfairX', fontWeight: 800, fontSize: 78, color: YELLOW, WebkitTextStroke: '6px #1a1200', paintOrder: 'stroke fill', textShadow: '0 4px 0 #1a1200'}}>{txt}</div>
    </div>
  );
};

const OPT_COLORS = [
  {bg: YELLOW, fg: '#1a1200'},
  {bg: '#ff5a4d', fg: '#fff'},
  {bg: '#3d8bff', fg: '#fff'},
  {bg: '#35c46a', fg: '#fff'},
];

const Poll = ({poll, instant}: {poll: PollT; instant?: boolean}) => {
  const frame = useCurrentFrame() + (instant ? 120 : 0);
  const a = interpolate(frame, [20, 34], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const many = poll.options.length > 2;
  const btn = (i: number, txt: string, d: number) => {
    const k = interpolate(frame, [d, d + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const c = OPT_COLORS[i % OPT_COLORS.length];
    return (
      <div key={i} style={{background: c.bg, color: c.fg, fontFamily: 'OswaldX', fontWeight: 700, fontSize: many ? 52 : 64, textTransform: 'uppercase', padding: many ? '10px 30px' : '14px 36px', borderRadius: 22, margin: many ? '12px auto' : '16px auto', width: 900, textAlign: 'center', transform: `scale(${0.8 + 0.2 * k})`, opacity: k, boxShadow: '0 8px 0 rgba(0,0,0,.45)'}}>{txt}</div>
    );
  };
  const end = 30 + poll.options.length * 12;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: many ? 200 : 250, textAlign: 'center', opacity: a}}>
      <div style={{fontFamily: 'OswaldX', fontWeight: 700, fontSize: many ? 88 : 96, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 5px 0 #000'}}>
        {poll.title} {poll.highlight && <span style={{color: YELLOW}}>{poll.highlight}</span>}
      </div>
      {poll.options.map((o, i) => btn(i, o, 30 + i * 12))}
      {poll.footer && (
        <div style={{fontFamily: 'OswaldX', fontWeight: 600, fontSize: 40, color: '#fff', textTransform: 'uppercase', marginTop: 10, textShadow: '0 3px 0 #000', opacity: interpolate(frame, [end, end + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          {poll.footer}
        </div>
      )}
    </div>
  );
};

/** Card de comentário no estilo do app (para "responder com vídeo"). */
const CommentCard = ({c, instant}: {c: Comment; instant?: boolean}) => {
  const frame = useCurrentFrame() + (instant ? 60 : 0);
  const {fps} = useVideoConfig();
  const k = spring({frame: frame - 3, fps, config: {damping: 12, stiffness: 160}});
  const initial = c.user.replace('@', '').charAt(0).toUpperCase();
  return (
    <div style={{position: 'absolute', left: 60, right: 60, top: 1340, transform: `scale(${0.7 + 0.3 * k}) rotate(${(1 - k) * -4}deg)`, opacity: Math.min(1, k * 1.4)}}>
      <div style={{background: 'rgba(24,25,28,0.96)', borderRadius: 34, padding: '30px 34px', display: 'flex', gap: 26, boxShadow: '0 18px 40px rgba(0,0,0,.6)', border: '3px solid rgba(255,255,255,.08)'}}>
        <div style={{flex: '0 0 auto', width: 104, height: 104, borderRadius: 52, padding: 5, background: 'linear-gradient(45deg,#feda75,#fa7e1e,#d62976,#962fbf)'}}>
          <div style={{width: '100%', height: '100%', borderRadius: 50, background: '#2b2d33', border: '4px solid #18191c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'OswaldX', fontWeight: 700, fontSize: 52, color: '#fff'}}>{initial}</div>
        </div>
        <div style={{flex: 1, fontFamily: 'Helvetica, Arial, sans-serif', color: '#fff'}}>
          <div style={{fontSize: 36, fontWeight: 700}}>
            {c.user.replace('@', '')} <span style={{fontWeight: 400, color: '#9aa0aa'}}>{c.ago ?? '7 h'} · <span style={{color: '#ff3040'}}>❤</span> pelo autor</span>
          </div>
          <div style={{fontSize: 44, lineHeight: 1.25, marginTop: 8}}>{c.text}</div>
        </div>
        <div style={{flex: '0 0 auto', color: '#ff3040', fontSize: 48, alignSelf: 'center'}}>❤</div>
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

const Banner = ({text}: {text: string}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = spring({frame, fps, config: {damping: 9, stiffness: 200}});
  const out = interpolate(frame, [70, 82], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shake = frame < 14 ? Math.sin(frame * 3) * 6 : 0;
  return (
    <div style={{position: 'absolute', left: 40, right: 40, top: 260, textAlign: 'center', opacity: out, transform: `scale(${k}) translateX(${shake}px)`, fontFamily: 'OswaldX', fontWeight: 700, fontSize: 124, lineHeight: 1.0, color: YELLOW, textTransform: 'uppercase', WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textShadow: '0 8px 0 #000'}}>
      {text}
    </div>
  );
};

/** Faixa escura no topo com a premissa em 3 linhas coloridas (igual ao vídeo viral de referência). */
const TitleBar = ({lines, instant}: {lines: TitleLine[]; instant?: boolean}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 0, paddingTop: 150, paddingBottom: 26, background: 'linear-gradient(#0d0f1a 82%, rgba(13,15,26,0))', textAlign: 'center'}}>
      {lines.map((l, i) => {
        const k = instant ? 1 : spring({frame: frame - i * 6, fps, config: {damping: 11, stiffness: 190}});
        return (
          <div key={i} style={{fontFamily: 'OswaldX', fontWeight: 700, fontSize: 108, lineHeight: 1.0, textTransform: 'uppercase', color: COLORS[l.c ?? 'white'], WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', textShadow: '0 6px 0 #000', transform: `scale(${k})`}}>
            {l.t}
          </div>
        );
      })}
    </div>
  );
};

/** Balões de pensamento ("ouvir a mente" dos personagens). */
const Thoughts = ({items, starts}: {items: Thought[]; starts?: number[]}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {items.map((th, i) => {
        const at = th.at ?? (starts?.[i] !== undefined ? Math.round(starts[i] * fps) : 6 + i * 5);
        const k = spring({frame: frame - at, fps, config: {damping: 10, stiffness: 170}});
        const bob = Math.sin((frame + i * 13) / 9) * 6;
        return (
          <div key={i} style={{position: 'absolute', left: `${th.x}%`, top: th.y + bob, transform: `translateX(-50%) scale(${Math.max(0, k)})`, transformOrigin: 'bottom center'}}>
            <div style={{background: th.red ? '#14070a' : '#ffffff', color: th.red ? '#ff3030' : '#16161c', border: `6px solid ${th.red ? '#ff2a2a' : '#000'}`, borderRadius: 60, padding: '22px 38px', fontFamily: 'OswaldX', fontWeight: 700, fontSize: 58, textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: th.red ? '0 0 40px rgba(255,0,0,.6)' : '0 10px 0 rgba(0,0,0,.35)'}}>
              💭 {th.text}
            </div>
            <div style={{width: 34, height: 34, borderRadius: 17, background: th.red ? '#14070a' : '#fff', border: `5px solid ${th.red ? '#ff2a2a' : '#000'}`, margin: '8px 0 0 70px'}} />
            <div style={{width: 18, height: 18, borderRadius: 9, background: th.red ? '#14070a' : '#fff', border: `4px solid ${th.red ? '#ff2a2a' : '#000'}`, margin: '6px 0 0 96px'}} />
          </div>
        );
      })}
    </>
  );
};

/** Etiquetas de contagem (ex.: tempo de vida) flutuando sobre as cabeças. */
const Timers = ({items}: {items: Thought[]}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <>
      {items.map((t, i) => {
        const k = t.at === 0 ? 1 : spring({frame: frame - (t.at ?? 3 + i * 4), fps, config: {damping: 11, stiffness: 190}});
        const bob = Math.sin((frame + i * 17) / 10) * 5;
        const blink = t.red ? 0.75 + 0.25 * Math.abs(Math.sin(frame / 5)) : 1;
        const c = t.red ? '#ff2d2d' : '#7dffb0';
        return (
          <div key={i} style={{position: 'absolute', left: `${t.x}%`, top: t.y + bob, transform: `translateX(-50%) scale(${Math.max(0, k)})`, transformOrigin: 'bottom center', display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: blink}}>
            <div style={{background: 'rgba(8,8,12,0.92)', color: c, border: `5px solid ${c}`, borderRadius: 18, padding: t.red ? '14px 30px' : '8px 20px', fontFamily: 'OswaldX', fontWeight: 700, fontSize: t.red ? 76 : 46, letterSpacing: 2, whiteSpace: 'nowrap', boxShadow: `0 0 ${t.red ? 44 : 18}px ${c}88`}}>
              ⏳ {t.text}
            </div>
            <div style={{width: 0, height: 0, borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: `18px solid ${c}`}} />
          </div>
        );
      })}
    </>
  );
};

const ThoughtsFor = ({shot}: {shot: Shot}) => {
  const {ep} = useEp();
  return <Thoughts items={shot.thoughts!} starts={ep.lines?.[shot.id]} />;
};

/** Figurinha de pergunta no meio do vídeo (puxa comentário/envio antes do final). */
const Ask = ({text, at = 8}: {text: string; at?: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const k = spring({frame: frame - at, fps, config: {damping: 9, stiffness: 200}});
  const pulse = 1 + Math.sin(frame / 4) * 0.025;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: '#f7c61a', color: '#16120a', fontFamily: 'OswaldX', fontWeight: 700, fontSize: 66, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.08, padding: '22px 40px', borderRadius: 30, border: '7px solid #000', maxWidth: 900, transform: `rotate(-3deg) scale(${Math.max(0, k) * pulse})`, boxShadow: '0 12px 0 rgba(0,0,0,.45)'}}>
        {text}
      </div>
    </div>
  );
};

export const Overlay = ({shot}: {shot: Shot}) => (
  <>
    <Tag />
    {shot.banner && <Banner text={shot.banner} />}
    {shot.titleBar && <TitleBar lines={shot.titleBar} instant={shot.cover} />}
    {shot.ask && <Ask text={shot.ask.text} at={shot.ask.at} />}
    {shot.thoughts && <ThoughtsFor shot={shot} />}
    {shot.timers && <Timers items={shot.timers} />}
    <Hud shot={shot} />
    {shot.comment && <CommentCard c={shot.comment} instant={!shot.banner} />}
    {shot.poll ? <Poll poll={shot.poll} instant={shot.cta} /> : <Caption shot={shot} />}
    {shot.cta && (
      <>
        <Caption shot={shot} />
        <CtaButtons />
      </>
    )}
  </>
);
