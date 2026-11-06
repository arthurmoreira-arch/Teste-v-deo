// Roteiro em SHOTS (planos) — cada shot tem narração, ambiente 3D, elenco e câmera.
// Marcação de legenda: *amarelo*  e  !vermelho!   (como no vídeo de referência)

import durations from '../public/audio/durations.json';

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const WORDS_PER_SECOND = 2.8;

export type V3 = [number, number, number];
export type Cam = {p: V3; l: V3};
export type Env = 'studio' | 'living' | 'office' | 'city' | 'house' | 'street';
export type Who = 'jane' | 'angela' | 'charlotte' | 'lisbon' | 'redjohn' | 'mannequin';
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
  poll?: boolean;
  envProps?: {cry?: boolean; crowd?: number};
};

const J = (o: Partial<Actor> = {}): Actor => ({who: 'jane', pos: [0, 0, 0], ...o});

export const shots: Shot[] = [
  {
    id: 'gancho-1',
    text: 'Patrick Jane é o *maior mentalista* da TV.',
    env: 'studio',
    mood: 'warm',
    cast: [J({face: 'smirk'})],
    cam: [
      {p: [0, 2.1, 5.4], l: [0, 1.3, 0]},
      {p: [0, 1.8, 3.4], l: [0, 1.45, 0]},
    ],
    envProps: {crowd: 0},
  },
  {
    id: 'gancho-2',
    text: 'Mas tudo começou com *uma única frase.*',
    env: 'studio',
    mood: 'warm',
    cast: [J({face: 'talk'})],
    cam: [
      {p: [0.5, 1.75, 3.2], l: [0, 1.65, 0]},
      {p: [0.1, 1.7, 1.9], l: [0, 1.65, 0]},
    ],
    hud: {label: 'AUDIÊNCIA AO VIVO', from: 0, to: 8200000},
  },
  {
    id: 'erro-1',
    text: 'Ele chamou o Red John de *homem solitário e repulsivo,* em rede nacional.',
    env: 'studio',
    mood: 'warm',
    cast: [J({face: 'smirk', rotY: -0.25})],
    cam: [
      {p: [-1.8, 1.4, 2.8], l: [0, 1.6, 0]},
      {p: [-0.6, 1.7, 1.8], l: [0, 1.65, 0]},
    ],
  },
  {
    id: 'erro-2',
    text: 'E pagou com !a própria família.!',
    env: 'house',
    night: 1,
    mood: 'red',
    cast: [],
    cam: [
      {p: [8, 4, 19], l: [0, 2.4, 0]},
      {p: [2.5, 2.8, 10], l: [-0.5, 2.4, 0]},
    ],
  },
  {
    id: 'virada',
    text: 'Agora imagine que ele *nunca* tivesse aberto a boca.',
    env: 'studio',
    mood: 'cold',
    cast: [J({face: 'shock'})],
    cam: [
      {p: [0, 1.65, 2.4], l: [0, 1.65, 0]},
      {p: [0, 1.65, 1.5], l: [0, 1.65, 0]},
    ],
  },
  {
    id: 'familia-1',
    text: '*Angela e Charlotte* estariam vivas.',
    env: 'living',
    mood: 'warm',
    cast: [
      J({pos: [-0.9, 0, -1.6], face: 'smirk', pose: 'sit'}),
      {who: 'angela', pos: [0.1, 0, -1.6], face: 'neutral', pose: 'sit'},
      {who: 'charlotte', pos: [1.0, 0, -1.55], face: 'smirk', pose: 'sit'},
    ],
    cam: [
      {p: [0, 1.5, 3.9], l: [0, 1.1, -1.6]},
      {p: [0.1, 1.4, 2.6], l: [0.1, 1.15, -1.6]},
    ],
  },
  {
    id: 'familia-2',
    text: 'Mas Jane seguiria como um *charlatão famoso,* lucrando com a !dor! de quem perdeu alguém.',
    env: 'studio',
    mood: 'warm',
    cast: [J({face: 'smirk', pose: 'stand'})],
    cam: [
      {p: [1.6, 2.5, -2.9], l: [0, 1.4, 7]},
      {p: [0.6, 2.1, -1.9], l: [0, 1.3, 7]},
    ],
    envProps: {crowd: 1, cry: true},
    hud: {label: 'PESSOAS ENGANADAS', from: 0, to: 12400},
  },
  {
    id: 'cbi-1',
    text: 'Sem a tragédia, não existiria o *CBI de Jane.*',
    env: 'office',
    mood: 'cold',
    cast: [{who: 'lisbon', pos: [0, 0, -2.2], face: 'sad', pose: 'stand'}],
    cam: [
      {p: [0, 1.7, 5], l: [0, 1.5, -3]},
      {p: [0, 1.6, 2.4], l: [0, 1.5, -3]},
    ],
    hud: {label: 'CASOS RESOLVIDOS', from: 0, to: 0},
  },
  {
    id: 'cbi-2',
    text: 'Nem a *Lisbon* ao lado dele. Nem um único caso !resolvido.!',
    env: 'office',
    mood: 'cold',
    cast: [{who: 'lisbon', pos: [0, 0, -2.2], face: 'sad', pose: 'stand'}],
    cam: [
      {p: [0.6, 1.75, 1.7], l: [0, 1.7, -2.2]},
      {p: [0.2, 1.7, 0.1], l: [0, 1.7, -2.2]},
    ],
    hud: {label: 'CASOS RESOLVIDOS', from: 0, to: 0},
  },
  {
    id: 'rj-1',
    text: 'E o *Red John?* !Livre.!',
    env: 'city',
    night: 1,
    mood: 'cold',
    fov: 62,
    cast: [],
    cam: [
      {p: [0, 26, 50], l: [0, 9, -12]},
      {p: [0, 14, 26], l: [0, 10, -14]},
    ],
    hud: {label: 'ASSASSINO SOLTO', from: 1, to: 1},
  },
  {
    id: 'rj-2',
    text: 'Sem ninguém no encalço dele. Sem ninguém capaz de *ler os seus passos.*',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [{who: 'redjohn', pos: [0, 0, -17], to: [0, 0, -3], rotY: 0, pose: 'walk', face: 'neutral'}],
    cam: [
      {p: [0, 1.5, 3.5], l: [0, 1.6, -4]},
      {p: [0, 1.4, 1.0], l: [0, 1.6, -4]},
    ],
    envProps: {crowd: 1},
  },
  {
    id: 'fecho-1',
    text: 'A dor que destruiu o Jane foi a *única coisa* que o transformou em !herói.!',
    env: 'street',
    mood: 'day',
    cast: [J({pos: [0, 0, 0], face: 'shock', pose: 'stand'})],
    cam: [
      {p: [0, 1.7, 2.6], l: [0, 1.65, 0]},
      {p: [0.1, 1.65, 1.5], l: [0, 1.65, 0]},
    ],
    envProps: {crowd: 1},
  },
  {
    id: 'fecho-2',
    text: 'Você *trocaria* a família dele pelas vítimas que ele salvou?',
    env: 'street',
    mood: 'day',
    cast: [
      J({pos: [0, 0, 0], face: 'sad', pose: 'stand'}),
      {who: 'lisbon', pos: [-1.6, 0, -3], face: 'neutral', pose: 'stand'},
    ],
    cam: [
      {p: [0.8, 7, 7.5], l: [0, 1, -3]},
      {p: [0, 6, 6], l: [0, 1.2, -3]},
    ],
    envProps: {crowd: 1},
    poll: true,
  },
];

export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);
export const plain = (w: string) => w.replace(/[*!]/g, '');

const audioSeconds = (id: string): number | undefined => (durations as Record<string, number>)[id];

/** Duração do plano: segue a voz (quando existe) + respiro de 0,4s; senão estima pelo nº de palavras. */
export const shotFrames = (s: Shot) => {
  const d = audioSeconds(s.id);
  return d ? Math.round((d + 0.4) * FPS) : Math.max(45, Math.round((wordsOf(s.text).length / WORDS_PER_SECOND + 0.5) * FPS));
};

export const starts = shots.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + shotFrames(shots[i - 1]));
  return acc;
}, []);

export const totalFrames = starts[shots.length - 1] + shotFrames(shots[shots.length - 1]);

export type Tok = {w: string; c: 'white' | 'yellow' | 'red'};
/** Converte "*a b* c !d!" em palavras com cor (marcação pode atravessar palavras). */
export const parseTokens = (text: string): Tok[] => {
  const out: Tok[] = [];
  let mode: Tok['c'] = 'white';
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    let word = '';
    let wordMode: Tok['c'] = mode;
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
  }
  return out;
};
