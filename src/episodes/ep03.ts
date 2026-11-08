// Episódio 3 — E se você ouvisse o pensamento de todo mundo?
// Fórmula do vídeo viral de referência: premissa em "você" no 1º segundo (faixa no topo + contador),
// consequências que escalam com números, segredo/tensão, plot twist e dilema A/B + "manda pra alguém".
import durations from '../../public/audio/ep03/durations.json';
import {Actor, Episode, Shot} from '../script';

const V = (o: Partial<Actor> = {}): Actor => ({who: 'voce', pos: [0, 0, 0], ...o});

const POLL = {
  title: 'VOCÊ',
  highlight: 'RESPONDE?',
  options: ['A · finjo que não ouvi', 'B · olho pra ele'],
  footer: 'Manda pra pessoa que mais mente pra você',
};

export const shots: Shot[] = [
  {
    id: 'gancho',
    text: 'E se você acordasse ouvindo o *pensamento* de todo mundo?',
    env: 'living',
    mood: 'warm',
    cast: [V({face: 'shock', pose: 'cry'})],
    cam: [
      {p: [0, 1.6, 2.6], l: [0, 1.5, 0]},
      {p: [0, 1.7, 1.5], l: [0, 1.6, 0]},
    ],
    titleBar: [{t: 'VOCÊ OUVE O'}, {t: 'PENSAMENTO', c: 'yellow'}, {t: 'DE TODO MUNDO.', c: 'red'}],
    hud: {label: 'PENSAMENTOS AO SEU REDOR', from: 1, to: 8200000000},
    sfx: 'hit',
  },
  {
    id: 'mae-1',
    text: 'Sete da manhã. Sua mãe sorri e diz que tá *tudo bem.*',
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
    id: 'mae-2',
    text: 'Mas a cabeça dela grita: !as contas vencem amanhã.!',
    env: 'living',
    mood: 'warm',
    cast: [{who: 'mae', pos: [0.4, 0, -1.6], face: 'sad', pose: 'sit'}],
    cam: [
      {p: [0.5, 1.65, 0.2], l: [0.4, 1.6, -1.6]},
      {p: [0.45, 1.63, -0.3], l: [0.4, 1.6, -1.6]},
    ],
    thoughts: [{text: 'as contas vencem amanhã...', x: 50, y: 330, at: 22}],
  },
  {
    id: 'rua',
    text: 'Na rua, é pior. *Milhares de vozes* ao mesmo tempo.',
    env: 'street',
    mood: 'day',
    cast: [V({pos: [0, 0, -3], to: [0, 0, 0.5], face: 'shock', pose: 'walk'})],
    cam: [
      {p: [0, 2.2, 5.5], l: [0, 1.4, -2]},
      {p: [0, 2.0, 4.2], l: [0, 1.4, 0]},
    ],
    envProps: {crowd: 1},
    hud: {label: 'VOZES NA SUA CABEÇA', from: 0, to: 3000},
    thoughts: [
      {text: 'tô atrasado', x: 26, y: 520, at: 10},
      {text: 'ele me odeia', x: 72, y: 660, at: 18},
      {text: 'ninguém sabe...', x: 34, y: 800, at: 26},
    ],
  },
  {
    id: 'chefe-1',
    text: 'No trabalho, seu chefe te dá *parabéns.*',
    env: 'office',
    mood: 'cold',
    cast: [{who: 'chefe', pos: [0, 0, -2.2], face: 'smirk', pose: 'stand'}],
    cam: [
      {p: [0, 1.7, 4.4], l: [0, 1.5, -2.2]},
      {p: [0, 1.7, 2.4], l: [0, 1.6, -2.2]},
    ],
  },
  {
    id: 'chefe-2',
    text: 'E pensa: !você é o próximo a ser demitido.!',
    env: 'office',
    mood: 'cold',
    cast: [{who: 'chefe', pos: [0, 0, -2.2], face: 'smirk', pose: 'stand'}],
    cam: [
      {p: [0.4, 1.78, 0.1], l: [0, 1.75, -2.2]},
      {p: [0.15, 1.76, -0.5], l: [0, 1.75, -2.2]},
    ],
    thoughts: [{text: 'o próximo é você', x: 50, y: 330, red: true, at: 14}],
    sfx: 'hit',
  },
  {
    id: 'cidade',
    text: 'Em um dia, você descobre quem *mente,* quem *trai,* e quem tem !medo.!',
    env: 'city',
    mood: 'day',
    fov: 60,
    cast: [],
    cam: [
      {p: [0, 30, 44], l: [0, 4, -8]},
      {p: [-6, 18, 24], l: [0, 4, -10]},
    ],
    hud: {label: 'MENTIRAS QUE VOCÊ OUVIU HOJE', from: 0, to: 1284},
  },
  {
    id: 'jane',
    text: 'Igual ao *Patrick Jane.* Só que de verdade.',
    env: 'studio',
    mood: 'warm',
    cast: [{who: 'jane', pos: [0, 0, 0], face: 'smirk', pose: 'stand'}],
    cam: [
      {p: [0.5, 1.75, 3.0], l: [0, 1.65, 0]},
      {p: [0.1, 1.7, 1.9], l: [0, 1.65, 0]},
    ],
  },
  {
    id: 'diferente',
    text: 'Até que, no meio da multidão, você ouve um pensamento !diferente.!',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [V({pos: [0, 0, 0], face: 'shock', pose: 'stand'})],
    cam: [
      {p: [0, 1.75, 2.6], l: [0, 1.7, 0]},
      {p: [0, 1.72, 1.3], l: [0, 1.7, 0]},
    ],
    envProps: {crowd: 1},
    sfx: 'hit',
  },
  {
    id: 'twist',
    text: '!Eu sei que você consegue me ouvir.!',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [{who: 'redjohn', pos: [0, 0, -2.2], rotY: 0, pose: 'stand', face: 'neutral'}],
    cam: [
      {p: [0, 1.85, 1.2], l: [0, 1.82, -2.2]},
      {p: [0, 1.82, -0.1], l: [0, 1.8, -2.2]},
    ],
    envProps: {crowd: 1},
    thoughts: [{text: 'eu sei que você me ouve', x: 50, y: 300, red: true, at: 4}],
    sfx: 'hit',
  },
  {
    id: 'enquete',
    text: 'E aí? Você *responde?* Manda esse vídeo pra pessoa que mais mente pra você.',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [
      V({pos: [0, 0, 0], rotY: Math.PI, face: 'shock', pose: 'stand'}),
      {who: 'redjohn', pos: [-1.4, 0, -4], rotY: 0.3, pose: 'stand', face: 'neutral'},
    ],
    cam: [
      {p: [0.6, 8, 7], l: [0, 1, -2.5]},
      {p: [0.2, 7, 5.6], l: [0, 1, -2.5]},
    ],
    envProps: {crowd: 1},
    poll: POLL,
  },
];

export const ep03: Episode = {id: 'ep03', tag: 'E SE #3', shots, durations};
