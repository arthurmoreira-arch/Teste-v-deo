// Episódio 4 — Parte 2 de "E se você ouvisse o pensamento de todo mundo?"
// Venceu a opção A: "finjo que não ouvi".
// Ajustes vindos dos insights do ep. 3: capa legível no quadro 0, pergunta no meio, pedido de envio mais cedo,
// promessa da parte 3 (motivo pra seguir) e final que emenda no começo (loop).
import durations from '../../public/audio/ep04/durations.json';
import {Actor, Episode, Poll, Shot} from '../script';

const V = (o: Partial<Actor> = {}): Actor => ({who: 'voce', pos: [0, 0, 0], ...o});
const RJ = (o: Partial<Actor> = {}): Actor => ({who: 'redjohn', pos: [0, 0, 0], pose: 'stand', face: 'neutral', ...o});

const POLL: Poll = {
  title: 'O QUE VOCÊ',
  highlight: 'FAZ?',
  options: ['A · chama a polícia', 'B · usa o medo dele', 'C · conta pra sua mãe', 'D · abre a porta'],
  footer: 'Manda pra quem abriria a porta 😬',
};

export const shots: Shot[] = [
  {
    id: 'gancho',
    text: 'Você fingiu que *não ouviu.* E continuou andando.',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [V({pos: [0, 0, 0], face: 'sad', pose: 'stand'}), RJ({pos: [1.4, 0, -6]})],
    cam: [
      {p: [0, 1.78, 2.6], l: [0.2, 1.6, -1]},
      {p: [0, 1.74, 2.0], l: [0.2, 1.62, -1]},
    ],
    envProps: {crowd: 1},
    cover: true,
    titleBar: [{t: 'PARTE 2:'}, {t: 'VOCÊ FINGIU', c: 'yellow'}, {t: 'QUE NÃO OUVIU.', c: 'red'}],
    hud: {label: 'SEGUNDOS ATÉ ELE PERCEBER', from: 10, to: 7},
    sfx: 'hit',
  },
  {
    id: 'atras',
    text: 'Mas atrás de você, os pensamentos dele *não param.*',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [V({pos: [0, 0, -2], to: [0, 0, 1], face: 'sad', pose: 'walk'}), RJ({pos: [1.4, 0, -10], to: [1.4, 0, -6], pose: 'walk'})],
    cam: [
      {p: [0, 2.0, 5], l: [0.3, 1.5, -4]},
      {p: [0, 1.9, 4.2], l: [0.3, 1.5, -3]},
    ],
    envProps: {crowd: 1},
    thoughts: [{text: 'ele tá fingindo...', x: 62, y: 520, red: true, at: 30}],
  },
  {
    id: 'casa',
    text: 'Em casa, você tenta agir normal. Mas sua mãe percebe.',
    env: 'living',
    mood: 'warm',
    cast: [
      {who: 'mae', pos: [0.4, 0, -1.6], face: 'neutral', pose: 'sit'},
      V({pos: [-0.75, 0, 0.6], rotY: 2.5, face: 'sad'}),
    ],
    cam: [
      {p: [0.3, 1.9, 5.2], l: [-0.1, 1.2, -0.6]},
      {p: [0.3, 1.8, 4.3], l: [-0.1, 1.25, -0.7]},
    ],
    thoughts: [{text: 'ele tá estranho hoje', x: 62, y: 470, at: 40}],
  },
  {
    id: 'madrugada',
    text: 'Três da manhã. Você ouve um pensamento vindo de fora da *janela.*',
    env: 'living',
    mood: 'cold',
    cast: [V({pos: [0, 0, -1.6], face: 'shock', pose: 'sit'})],
    cam: [
      {p: [0, 1.6, 3.4], l: [0, 1.3, -1.6]},
      {p: [0, 1.62, 1.2], l: [0, 1.55, -1.6]},
    ],
    hud: {label: 'DISTÂNCIA DELE', from: 300, to: 4, suffix: ' m'},
    sfx: 'hit',
  },
  {
    id: 'seguiu',
    text: '!Ele te seguiu até em casa.!',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [RJ({pos: [1.6, 0, 8], rotY: Math.PI})],
    cam: [
      {p: [-0.2, 2.1, 4.6], l: [1.6, 1.75, 8]},
      {p: [0.5, 1.95, 5.6], l: [1.6, 1.8, 8]},
    ],
    envProps: {warm: true},
    thoughts: [{text: 'achei você', x: 58, y: 420, red: true, at: 10}],
    sfx: 'hit',
  },
  {
    id: 'pergunta',
    text: 'E ele tá parado ali, olhando pra *sua porta.*',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [RJ({pos: [1.6, 0, 6.2], rotY: Math.PI})],
    cam: [
      {p: [6, 2.6, 13], l: [1.4, 1.8, 3]},
      {p: [4.4, 2.2, 11], l: [1.5, 1.8, 3]},
    ],
    envProps: {warm: true},
    ask: {text: 'Você abriria a porta? Comenta 👇', at: 6},
  },
  {
    id: 'virada',
    text: 'Só que tem uma coisa que ele *não sabe.*',
    env: 'living',
    mood: 'cold',
    cast: [V({pos: [0, 0, -1.6], face: 'neutral', pose: 'sit'})],
    cam: [
      {p: [0.4, 1.65, 0.6], l: [0, 1.6, -1.6]},
      {p: [0.15, 1.64, 0.1], l: [0, 1.6, -1.6]},
    ],
  },
  {
    id: 'medo',
    text: 'Você também ouve o *medo* dele.',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [RJ({pos: [0, 0, -2.2]})],
    cam: [
      {p: [0, 1.85, 1.2], l: [0, 1.82, -2.2]},
      {p: [0, 1.82, -0.1], l: [0, 1.8, -2.2]},
    ],
    envProps: {crowd: 1},
    thoughts: [{text: 'e se ele contar pra alguém?', x: 50, y: 300, red: true, at: 8}],
    sfx: 'hit',
  },
  {
    id: 'poder',
    text: 'Pela primeira vez, o Red John tem *medo de alguém.* E esse alguém é !você.!',
    env: 'living',
    mood: 'warm',
    cast: [V({pos: [0, 0, -1.6], face: 'smirk', pose: 'sit'})],
    cam: [
      {p: [0, 1.6, 2.4], l: [0, 1.55, -1.6]},
      {p: [0, 1.62, 0.6], l: [0, 1.6, -1.6]},
    ],
    hud: {label: 'MEDO DELE', from: 0, to: 100, suffix: '%'},
  },
  {
    id: 'enquete',
    text: 'O que você faz? Comenta a letra, e manda pra quem *abriria a porta.*',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [RJ({pos: [1.6, 0, 6.2], rotY: Math.PI})],
    cam: [
      {p: [1.2, 6.5, 13.5], l: [1.4, 1.2, 4]},
      {p: [1.4, 5.6, 12], l: [1.5, 1.3, 4]},
    ],
    envProps: {warm: true},
    poll: POLL,
  },
  {
    id: 'loop',
    text: 'A parte três sai amanhã. Segue pra não perder. E lembra: tudo isso porque...',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [RJ({pos: [1.6, 0, 6.2], rotY: Math.PI})],
    cam: [
      {p: [1.4, 5.6, 12], l: [1.5, 1.3, 4]},
      {p: [1.5, 5.0, 11], l: [1.5, 1.4, 4]},
    ],
    envProps: {warm: true},
    poll: POLL,
    cta: true,
  },
];

export const ep04: Episode = {id: 'ep04', tag: 'E SE #4 · PARTE 2', shots, durations};
