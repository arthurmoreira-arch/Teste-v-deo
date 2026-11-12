// Roteiro em SHOTS (planos) — cada shot tem narração, ambiente 3D, elenco e câmera.
// Marcação de legenda: *amarelo*  e  !vermelho!   (como no vídeo de referência)

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const WORDS_PER_SECOND = 2.8;

export type V3 = [number, number, number];
export type Cam = {p: V3; l: V3};
export type Env = 'studio' | 'living' | 'office' | 'city' | 'house' | 'street';
export type Who = 'jane' | 'angela' | 'charlotte' | 'lisbon' | 'redjohn' | 'mannequin' | 'voce' | 'mae' | 'chefe';
export type Pose = 'stand' | 'walk' | 'sit' | 'zombie' | 'cry' | 'clap';
export type Face = 'neutral' | 'smirk' | 'shock' | 'sad' | 'angry' | 'talk';

export type Actor = {
  who: Who;
  pos: V3;
  rotY?: number; // 0 = olhando para +z (para a câmera "de frente")
  pose?: Pose;
  face?: Face;
  scale?: number;
  to?: V3; // posição final (o ator caminha até ela durante o plano)
};

export type Hud = {label: string; from: number; to: number; prefix?: string; suffix?: string};

export type Poll = {title: string; highlight?: string; options: string[]; footer?: string};
export type TitleLine = {t: string; c?: 'white' | 'yellow' | 'red'};
export type Thought = {text: string; x: number; y: number; red?: boolean; at?: number};
export type Comment = {user: string; text: string; ago?: string};

export type Shot = {
  id: string;
  text: string;
  env: Env;
  night?: number; // 0 dia ... 1 noite
  mood?: 'warm' | 'cold' | 'red' | 'day';
  cast: Actor[];
  cam: [Cam, Cam]; // início -> fim do plano
  fov?: number;
  hud?: Hud;
  poll?: Poll; // enquete no topo (2 a 4 opções)
  comment?: Comment; // card de comentário de seguidor
  tone?: 'suspense' | 'normal'; // suspense: narrador mais lento/grave, música abaixa e entra tensão
  cover?: boolean; // 1º plano: quadro 0 já legível (capa do Reels) — sem flash e sem animação de entrada
  ask?: {text: string; at?: number}; // figurinha de pergunta/pedido no meio do vídeo (comentário/envio)
  titleBar?: TitleLine[]; // faixa escura no topo com a premissa (como no vídeo de referência)
  thoughts?: Thought[]; // balões de pensamento na tela
  timers?: Thought[]; // etiquetas de "tempo de vida" flutuando sobre as cabeças
  banner?: string; // título de gancho no topo (primeiros 2s)
  sfx?: 'hit' | 'whoosh'; // efeito sonoro no início do plano
  cta?: boolean; // chamada final: curtir, seguir, votar
  envProps?: {
    cry?: boolean;
    crowd?: number;
    board?: 'empty' | 'full'; // mural do escritório/sótão
    windowSmiley?: boolean; // casa: smiley vermelho na janela (cena do crime)
    doorSmiley?: boolean; // casa: smiley pintado na porta
    tape?: boolean; // casa: fita de isolamento da polícia
    warm?: boolean; // casa: janelas acesas (lar)
  };
};

export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);
export const plain = (w: string) => w.replace(/[*!]/g, '');

export type Tok = {w: string; c: 'white' | 'yellow' | 'red'};
/** Converte "*a b* c !d!" em palavras com cor (marcação pode atravessar palavras). */
export const parseTokens = (text: string): Tok[] => {
  const out: Tok[] = [];
  let mode: Tok['c'] = 'white';
  let speaker: Tok['c'] | null = null; // fala de personagem {quem:texto}
  for (let raw of text.split(/\s+/).filter(Boolean)) {
    const sp = raw.match(/^\{(\w+):/);
    if (sp) {
      speaker = sp[1] === 'redjohn' ? 'red' : 'yellow';
      raw = raw.slice(sp[0].length);
    }
    let closes = false;
    if (speaker && raw.endsWith('}')) {
      closes = true;
      raw = raw.slice(0, -1);
    }
    let word = '';
    let wordMode: Tok['c'] = speaker ?? mode;
    for (const ch of raw) {
      if (ch === '*') {
        mode = mode === 'yellow' ? 'white' : 'yellow';
        if (!word) wordMode = mode;
      } else if (ch === '!') {
        mode = mode === 'red' ? 'white' : 'red';
        if (!word) wordMode = mode;
      } else word += ch;
    }
    out.push({w: word, c: wordMode});
    if (closes) speaker = null;
  }
  return out;
};

export type Episode = {
  id: string; // pasta do áudio: public/audio/<id>/
  tag: string; // "E SE #1"
  shots: Shot[];
  durations: Record<string, number>; // segundos de narração por shot (gerado por tools/gerar-voz.py)
  narrator?: Who; // quem narra (padrão: narrador). Ex.: 'voce' para o boneco falar direto com a galera
  lines?: Record<string, number[]>; // início (s) de cada fala de personagem no shot
};

/** Duração do plano: segue a voz (quando existe) + respiro de 0,3s; senão estima pelo nº de palavras. */
export const timing = (ep: Episode) => {
  const frames = (s: Shot) => {
    const d = ep.durations[s.id];
    return d ? Math.round((d + 0.3) * FPS) : Math.max(45, Math.round((wordsOf(s.text).length / WORDS_PER_SECOND + 0.5) * FPS));
  };
  const starts: number[] = [];
  ep.shots.forEach((s, i) => starts.push(i === 0 ? 0 : starts[i - 1] + frames(ep.shots[i - 1])));
  const total = starts[starts.length - 1] + frames(ep.shots[ep.shots.length - 1]);
  return {frames, starts, total};
};
