// Episódio 6 — "E se você visse quanto tempo de vida cada pessoa tem?" (história nova, sem Red John)
// Mesmo padrão do ep. 5: gancho independente em "você", ~35s, pergunta no meio, twist e dilema + pedido de envio.
import durations from '../../public/audio/ep06/durations.json';
import lines from '../../public/audio/ep06/lines.json';
import {Actor, Episode, Poll, Shot} from '../script';

const V = (o: Partial<Actor> = {}): Actor => ({who: 'voce', pos: [0, 0, 0], ...o});

const POLL: Poll = {
  title: 'VOCÊ',
  highlight: 'SALVA ELA?',
  options: ['A · salvo, custe o que custar', 'B · não mexo no destino', 'C · conto a verdade pra ela'],
  footer: 'Manda pra quem você salvaria ❤️',
};

export const shots: Shot[] = [
  {
    id: 'gancho',
    text: 'E se você acordasse vendo *quanto tempo de vida* cada pessoa tem?',
    env: 'street',
    mood: 'day',
    cast: [V({face: 'shock', pose: 'stand'})],
    cam: [
      {p: [0, 1.78, 2.9], l: [0, 1.6, 0]},
      {p: [0, 1.74, 2.0], l: [0, 1.62, 0]},
    ],
    envProps: {crowd: 1},
    cover: true,
    titleBar: [{t: 'VOCÊ VÊ QUANTO'}, {t: 'TEMPO DE VIDA', c: 'yellow'}, {t: 'CADA UM TEM.', c: 'red'}],
    timers: [
      {text: '52 ANOS', x: 17, y: 640, at: 0},
      {text: '31 ANOS', x: 84, y: 660, at: 0},
    ],
    sfx: 'hit',
  },
  {
    id: 'rua',
    text: 'Na rua, todo mundo tem um *número* em cima da cabeça.',
    env: 'street',
    mood: 'day',
    cast: [V({pos: [0, 0, -3], to: [0, 0, 0.5], face: 'shock', pose: 'walk'})],
    cam: [
      {p: [0, 2.2, 5.5], l: [0, 1.4, -2]},
      {p: [0, 2.0, 4.2], l: [0, 1.4, 0]},
    ],
    envProps: {crowd: 1},
    hud: {label: 'PESSOAS QUE VOCÊ JÁ VIU HOJE', from: 0, to: 1284},
    timers: [
      {text: '52 ANOS', x: 20, y: 560},
      {text: '18 ANOS', x: 78, y: 520},
      {text: '70 ANOS', x: 30, y: 700},
      {text: '44 ANOS', x: 72, y: 690},
    ],
  },
  {
    id: 'homem',
    text: 'Até que passa um homem com !três minutos.!',
    tone: 'suspense',
    env: 'street',
    mood: 'day',
    cast: [{who: 'chefe', pos: [0, 0, -7], to: [0, 0, -2.4], face: 'neutral', pose: 'walk'}],
    cam: [
      {p: [0, 1.7, 2.2], l: [0, 1.65, -4]},
      {p: [0, 1.7, 1.2], l: [0, 1.7, -3]},
    ],
    envProps: {crowd: 1},
    timers: [{text: '3 MINUTOS', x: 50, y: 500, red: true, at: 16}],
    sfx: 'hit',
  },
  {
    id: 'segura',
    text: 'Você segura o braço dele por um segundo. E o número *muda.*',
    env: 'street',
    mood: 'day',
    cast: [
      V({pos: [-0.55, 0, -0.4], rotY: 0.7, face: 'shock', pose: 'zombie'}),
      {who: 'chefe', pos: [0.55, 0, -0.6], rotY: -0.5, face: 'shock', pose: 'stand'},
    ],
    cam: [
      {p: [0, 1.75, 3.2], l: [0, 1.5, -0.5]},
      {p: [0, 1.72, 2.5], l: [0, 1.52, -0.5]},
    ],
    envProps: {crowd: 1},
    timers: [{text: '40 ANOS', x: 68, y: 520, at: 48}],
  },
  {
    id: 'poder',
    text: 'Você pode *mudar o destino* das pessoas.',
    env: 'street',
    mood: 'day',
    cast: [V({face: 'smirk', pose: 'stand'})],
    cam: [
      {p: [0.5, 1.75, 2.1], l: [0, 1.68, 0]},
      {p: [0.2, 1.72, 1.5], l: [0, 1.68, 0]},
    ],
    envProps: {crowd: 1},
    ask: {text: 'Você salvaria um estranho? Comenta 👇', at: 4},
  },
  {
    id: 'casa',
    text: 'Aí você chega em casa. {mae:Tá tudo bem, filho?}',
    env: 'living',
    mood: 'warm',
    cast: [
      {who: 'mae', pos: [0.4, 0, -1.6], face: 'smirk', pose: 'sit'},
      V({pos: [-0.75, 0, 0.6], rotY: 2.5, face: 'neutral'}),
    ],
    cam: [
      {p: [0.3, 1.9, 5.2], l: [-0.1, 1.2, -0.6]},
      {p: [0.3, 1.8, 4.3], l: [-0.1, 1.25, -0.7]},
    ],
  },
  {
    id: 'mae',
    text: 'E vê o número da sua mãe. !Dois dias.!',
    tone: 'suspense',
    env: 'living',
    mood: 'warm',
    cast: [{who: 'mae', pos: [0.4, 0, -1.6], face: 'smirk', pose: 'sit'}],
    cam: [
      {p: [0.5, 1.7, 1.4], l: [0.4, 1.55, -1.6]},
      {p: [0.45, 1.65, 0.1], l: [0.4, 1.6, -1.6]},
    ],
    timers: [{text: '2 DIAS', x: 50, y: 360, red: true, at: 42}],
    sfx: 'hit',
  },
  {
    id: 'custo',
    text: 'Só que cada vida que você salva, tira tempo *da sua.*',
    tone: 'suspense',
    env: 'living',
    mood: 'cold',
    cast: [V({pos: [0, 0, 0.4], face: 'shock'})],
    cam: [
      {p: [0, 1.75, 2.9], l: [0, 1.68, 0.4]},
      {p: [0, 1.72, 1.8], l: [0, 1.68, 0.4]},
    ],
    hud: {label: 'SEU TEMPO DE VIDA', from: 61, to: 9, suffix: ' anos'},
    sfx: 'hit',
  },
  {
    id: 'enquete',
    text: 'Você *salva* ela? Manda pra pessoa que você salvaria. E segue pra ver o final.',
    env: 'living',
    mood: 'warm',
    cast: [
      {who: 'mae', pos: [0.4, 0, -1.6], face: 'smirk', pose: 'sit'},
      V({pos: [-0.75, 0, 0.6], rotY: 2.5, face: 'sad'}),
    ],
    cam: [
      {p: [0.3, 2.3, 6.0], l: [-0.1, 0.7, -0.6]},
      {p: [0.3, 2.1, 5.2], l: [-0.1, 0.75, -0.7]},
    ],
    poll: POLL,
  },
];

export const ep06: Episode = {id: 'ep06', tag: 'E SE #6', shots, durations, lines};
