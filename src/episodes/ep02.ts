// Episódio 2 — resposta ao comentário de @lyncowndetona:
// "A, ele não conhece a lisbon e nem a cbi, ele tenta sozinho, porém, com cautela."
// => Jane não provoca o Red John (família viva), não conhece Lisbon/CBI e caça o assassino sozinho, em silêncio.
import durations from '../../public/audio/ep02/durations.json';
import {Actor, Comment, Episode, Shot} from '../script';

const J = (o: Partial<Actor> = {}): Actor => ({who: 'jane', pos: [0, 0, 0], ...o});

const COMMENT: Comment = {
  user: '@lyncowndetona',
  text: 'A, ele não conhece a lisbon e nem a cbi, ele tenta sozinho, porém, com cautela.',
  ago: '7 h',
};

export const shots: Shot[] = [
  {
    id: 'comentario-1',
    text: 'O *@lyncowndetona* escolheu a letra A, e mandou essa:',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [J({pos: [0, 0, 0], face: 'smirk', pose: 'stand'})],
    cam: [
      {p: [0, 1.75, 2.8], l: [0, 1.6, 0]},
      {p: [0, 1.7, 1.9], l: [0, 1.6, 0]},
    ],
    envProps: {crowd: 1},
    banner: 'VOCÊ PEDIU, A GENTE FEZ!',
    comment: COMMENT,
    sfx: 'hit',
  },
  {
    id: 'comentario-2',
    text: 'Ele não conhece a *Lisbon,* nem o *CBI.* Ele tenta !sozinho.! Porém, com cautela.',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [J({pos: [0, 0, 0], face: 'neutral', pose: 'stand'})],
    cam: [
      {p: [0.8, 1.7, 2.2], l: [0, 1.65, 0]},
      {p: [0.3, 1.68, 1.5], l: [0, 1.65, 0]},
    ],
    envProps: {crowd: 1},
    comment: COMMENT,
  },
  {
    id: 'familia',
    text: 'Então imagina: Angela e Charlotte *vivas.* E o Jane, em silêncio, caçando o !Red John.!',
    env: 'living',
    mood: 'warm',
    cast: [
      J({pos: [-0.9, 0, -1.6], face: 'neutral', pose: 'sit'}),
      {who: 'angela', pos: [0.1, 0, -1.6], face: 'smirk', pose: 'sit'},
      {who: 'charlotte', pos: [1.0, 0, -1.55], face: 'smirk', pose: 'sit'},
    ],
    cam: [
      {p: [0.1, 1.5, 3.9], l: [0, 1.1, -1.6]},
      {p: [-0.6, 1.5, 2.2], l: [-0.9, 1.5, -1.6]},
    ],
  },
  {
    id: 'sozinho',
    text: 'Sem distintivo. Sem parceiros. Só ele, e o que ele *lê nas pessoas.*',
    env: 'street',
    mood: 'cold',
    night: 0.5,
    cast: [J({pos: [0, 0, -12], to: [0, 0, -2], face: 'neutral', pose: 'walk'})],
    cam: [
      {p: [0, 1.6, 3.5], l: [0, 1.5, -6]},
      {p: [0, 1.5, 1.4], l: [0, 1.6, -4]},
    ],
    envProps: {crowd: 1},
  },
  {
    id: 'sotao',
    text: 'De dia, ele finge ser médium. De noite, monta o *quebra-cabeça* no sótão.',
    env: 'office',
    mood: 'warm',
    night: 0.6,
    cast: [J({pos: [0.9, 0, -2.6], rotY: Math.PI, face: 'neutral', pose: 'stand'})],
    cam: [
      {p: [2.6, 2.0, 2.8], l: [0, 2.3, -4]},
      {p: [1.4, 2.0, 0.6], l: [0, 2.4, -4]},
    ],
    envProps: {board: 'full'},
    hud: {label: 'PISTAS REUNIDAS', from: 0, to: 47},
  },
  {
    id: 'cena-do-crime',
    text: 'Em cada cena de crime, ninguém nota o homem *quieto* atrás da fita.',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [J({pos: [2.2, 0, 7.4], rotY: Math.PI, face: 'neutral', pose: 'stand'})],
    cam: [
      {p: [4.2, 2.2, 13], l: [0, 2, 0]},
      {p: [3.2, 1.9, 10.2], l: [0.5, 2, 0]},
    ],
    envProps: {windowSmiley: true, tape: true},
  },
  {
    id: 'perto',
    text: 'Com cautela, ele chega mais perto do que *qualquer policial* jamais chegou.',
    env: 'office',
    mood: 'warm',
    night: 0.6,
    cast: [],
    cam: [
      {p: [0, 2.4, 1.5], l: [0, 2.5, -4]},
      {p: [0, 2.5, -2.4], l: [0, 2.5, -4]},
    ],
    envProps: {board: 'full'},
    hud: {label: 'SUSPEITOS', from: 2000, to: 7},
  },
  {
    id: 'problema',
    text: 'Mas tem um !problema.!',
    env: 'office',
    mood: 'cold',
    night: 0.6,
    cast: [J({pos: [0, 0, -1.8], rotY: 0, face: 'shock', pose: 'stand'})],
    cam: [
      {p: [0, 1.68, 0.4], l: [0, 1.66, -1.8]},
      {p: [0, 1.68, -0.2], l: [0, 1.66, -1.8]},
    ],
    envProps: {board: 'full'},
    sfx: 'hit',
  },
  {
    id: 'rj-le',
    text: 'O Red John também sabe *ler pessoas.*',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [{who: 'redjohn', pos: [0, 0, -2.2], rotY: 0, pose: 'stand', face: 'neutral'}],
    cam: [
      {p: [0, 1.85, 1.2], l: [0, 1.82, -2.2]},
      {p: [0, 1.82, -0.1], l: [0, 1.8, -2.2]},
    ],
    envProps: {crowd: 1},
    sfx: 'hit',
  },
  {
    id: 'porta',
    text: 'Uma noite, o Jane chega em casa, e encontra !isso! na porta.',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [J({pos: [1.6, 0, 6.2], rotY: Math.PI, face: 'shock', pose: 'stand'})],
    cam: [
      {p: [5, 2.4, 14], l: [1.2, 1.8, 2.5]},
      {p: [2.6, 1.8, 8.6], l: [1.6, 1.5, 2.5]},
    ],
    envProps: {warm: true, doorSmiley: true},
    sfx: 'hit',
  },
  {
    id: 'enquete',
    text: 'E agora? O que o Jane *faz?*',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [J({pos: [1.6, 0, 6.2], rotY: 0.3, face: 'shock', pose: 'stand'})],
    cam: [
      {p: [1.2, 6, 13], l: [1.4, 1.2, 4]},
      {p: [1.4, 5.2, 11.5], l: [1.5, 1.3, 4]},
    ],
    envProps: {warm: true, doorSmiley: true},
    poll: {
      title: 'O QUE O JANE',
      highlight: 'FAZ?',
      options: ['A · enfrenta sozinho', 'B · procura a Lisbon e o CBI', 'C · foge com a família', 'D · arma uma armadilha'],
      footer: 'Comenta a letra 👇',
    },
  },
  {
    id: 'cta',
    text: 'Comenta a *letra,* curte e *segue.* A resposta mais votada vira o !próximo episódio.!',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [J({pos: [1.6, 0, 6.2], rotY: 0.3, face: 'angry', pose: 'stand'})],
    cam: [
      {p: [1.4, 5.2, 11.5], l: [1.5, 1.3, 4]},
      {p: [1.5, 4.8, 10.6], l: [1.5, 1.4, 4]},
    ],
    envProps: {warm: true, doorSmiley: true},
    poll: {
      title: 'O QUE O JANE',
      highlight: 'FAZ?',
      options: ['A · enfrenta sozinho', 'B · procura a Lisbon e o CBI', 'C · foge com a família', 'D · arma uma armadilha'],
      footer: 'Comenta a letra 👇',
    },
    cta: true,
  },
];

export const ep02: Episode = {id: 'ep02', tag: 'E SE #2', shots, durations};
