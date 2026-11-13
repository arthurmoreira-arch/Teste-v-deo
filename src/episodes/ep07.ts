// Episódio 7 — "E se você pudesse ler as mensagens que as pessoas apagaram?"
// Estilo novo ('verse'): tons chapados, retícula, cores separadas, animação em dois, neon rosa/ciano.
import durations from '../../public/audio/ep07/durations.json';
import {Actor, Episode, Poll, Shot} from '../script';

const V = (o: Partial<Actor> = {}): Actor => ({who: 'voce', pos: [0, 0, 0], ...o});

const POLL: Poll = {
  title: 'VOCÊ',
  highlight: 'RESPONDE?',
  options: ['A · finjo que não vi', 'B · mando o print', 'C · apago ela da minha vida'],
  footer: 'Manda pra quem mais apaga mensagem 👀',
};

export const shots: Shot[] = [
  {
    id: 'gancho',
    text: 'E se você pudesse ler *todas* as mensagens que as pessoas apagaram?',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [V({face: 'shock', pose: 'phone'})],
    cam: [
      {p: [0, 1.7, 2.8], l: [0, 1.5, 0]},
      {p: [0, 1.7, 2.2], l: [0, 1.5, 0]},
    ],
    envProps: {crowd: 1},
    cover: true,
    titleBar: [{t: 'VOCÊ LÊ AS'}, {t: 'MENSAGENS', c: 'yellow'}, {t: 'APAGADAS.', c: 'red'}],
    chat: {
      name: 'Lucas',
      msgs: [
        {t: 'e aí, vai hoje?'},
        {t: '', deleted: true, reveal: 'tomara que ele não vá kkk', at: 46},
        {t: 'vou sim!', me: true},
      ],
    },
    sfx: 'hit',
  },
  {
    id: 'engracado',
    text: 'No começo, é *engraçado.* Seu chefe apagou um elogio.',
    env: 'office',
    mood: 'cold',
    cast: [{who: 'chefe', pos: [0, 0, -2.2], face: 'smirk', pose: 'phone'}],
    cam: [
      {p: [0, 1.7, 2.4], l: [0, 1.6, -2.2]},
      {p: [0, 1.7, 1.2], l: [0, 1.6, -2.2]},
    ],
    chat: {
      name: 'Chefe',
      msgs: [
        {t: 'relatório recebido.'},
        {t: '', deleted: true, reveal: 'esse aí merece um aumento', at: 40},
        {t: 'ok 👍', me: true},
      ],
    },
    fxText: {text: 'PLIM!', x: 74, y: 1380, rot: 8, at: 42},
  },
  {
    id: 'amiga',
    text: 'Aí você abre a conversa da sua *melhor amiga.*',
    tone: 'suspense',
    env: 'living',
    mood: 'cold',
    cast: [V({pos: [0, 0, -1.6], face: 'neutral', pose: 'phone'})],
    cam: [
      {p: [0.6, 1.6, 1.8], l: [0, 1.4, -1.6]},
      {p: [0.2, 1.62, 0.5], l: [0, 1.5, -1.6]},
    ],
  },
  {
    id: 'tres',
    text: '!Três mensagens apagadas.! Todas sobre *você.*',
    tone: 'suspense',
    env: 'living',
    mood: 'cold',
    cast: [V({pos: [0, 0, -1.6], face: 'shock', pose: 'phone'})],
    cam: [
      {p: [0, 1.62, 0.6], l: [0, 1.5, -1.6]},
      {p: [0, 1.62, 0.3], l: [0, 1.5, -1.6]},
    ],
    chat: {
      name: 'Bia ❤️',
      msgs: [
        {t: 'amiga, te amo! ❤️'},
        {t: '', deleted: true, reveal: 'não aguento mais fingir', at: 22},
        {t: '', deleted: true, reveal: 'ela não pode saber de nada', at: 44},
        {t: '', deleted: true, reveal: 'conto ou não conto?', at: 66},
      ],
    },
    fxText: {text: 'BZZT!', x: 28, y: 1400, rot: -12, color: '#ff4040', at: 22},
    sfx: 'hit',
  },
  {
    id: 'minuto',
    text: 'E a última foi apagada *há um minuto.*',
    tone: 'suspense',
    env: 'living',
    mood: 'cold',
    cast: [V({pos: [0, 0, -1.6], face: 'shock', pose: 'phone'})],
    cam: [
      {p: [0.5, 1.66, 0.4], l: [0, 1.6, -1.6]},
      {p: [0.2, 1.66, -0.3], l: [0, 1.62, -1.6]},
    ],
    hud: {label: 'APAGADA HÁ', from: 60, to: 3, suffix: ' s'},
    ask: {text: 'Você leria? Comenta 👇', at: 6},
  },
  {
    id: 'twist',
    text: 'Você abre. E ela escreveu: !eu sei que você consegue ler.!',
    env: 'living',
    mood: 'red',
    cast: [V({pos: [0, 0, -1.6], face: 'shock', pose: 'phone'})],
    cam: [
      {p: [0, 1.62, 0.6], l: [0, 1.5, -1.6]},
      {p: [0, 1.62, 0.3], l: [0, 1.5, -1.6]},
    ],
    chat: {
      name: 'Bia ❤️',
      msgs: [
        {t: 'tá acordada?'},
        {t: '', deleted: true, reveal: 'eu sei que você consegue ler.', at: 38},
        {t: '', deleted: true, reveal: 'e agora?', at: 66},
      ],
    },
    sfx: 'hit',
  },
  {
    id: 'enquete',
    text: 'E aí, você *responde?* Manda pra pessoa que mais apaga mensagem.',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [V({face: 'sad', pose: 'phone'}), {who: 'angela', pos: [-1.5, 0, -3.5], rotY: 0.4, face: 'smirk', pose: 'phone'}],
    cam: [
      {p: [0.6, 6.5, 7], l: [0, 1, -2]},
      {p: [0.2, 5.6, 5.8], l: [0, 1.1, -2]},
    ],
    envProps: {crowd: 1},
    poll: POLL,
  },
];

export const ep07: Episode = {id: 'ep07', tag: 'E SE #7', shots, durations, style: 'verse'};
