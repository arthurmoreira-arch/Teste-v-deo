// Story 01 — o boneco pede ideias de "E se" nos comentários do último vídeo.
import durations from '../../public/audio/story01/durations.json';
import {Actor, Episode, Shot} from '../script';

const V = (o: Partial<Actor> = {}): Actor => ({who: 'voce', pos: [0, 0, 0], ...o});

export const shots: Shot[] = [
  {
    id: 'oi',
    text: 'Fala, galera! Eu preciso da *ajuda de vocês.*',
    env: 'street',
    mood: 'day',
    cast: [V({face: 'talk', pose: 'clap'})],
    cam: [
      {p: [0, 1.7, 3.4], l: [0, 1.45, 0]},
      {p: [0, 1.7, 2.6], l: [0, 1.5, 0]},
    ],
    envProps: {crowd: 1},
    cover: true,
    titleBar: [{t: 'PRECISO DA'}, {t: 'SUA AJUDA!', c: 'yellow'}],
  },
  {
    id: 'pergunta',
    text: 'Qual *E se* você quer ver no próximo vídeo?',
    env: 'street',
    mood: 'day',
    cast: [V({face: 'talk', pose: 'stand'})],
    cam: [
      {p: [0.5, 1.75, 2.0], l: [0, 1.68, 0]},
      {p: [0.2, 1.72, 1.5], l: [0, 1.68, 0]},
    ],
    envProps: {crowd: 1},
    ask: {text: 'Qual "E se" você quer ver? 🤔', at: 4},
  },
  {
    id: 'comenta',
    text: 'Deixa a sua ideia nos *comentários* do último vídeo. A melhor vira episódio, !com o seu nome!!',
    env: 'street',
    mood: 'day',
    cast: [V({face: 'talk', pose: 'clap'})],
    cam: [
      {p: [0, 1.8, 3.2], l: [0, 1.5, 0]},
      {p: [0, 1.75, 2.3], l: [0, 1.55, 0]},
    ],
    envProps: {crowd: 1},
    ask: {text: 'Comenta no último vídeo 👇', at: 4},
  },
];

export const story01: Episode = {id: 'story01', tag: 'E SE', shots, durations, narrator: 'voce'};
