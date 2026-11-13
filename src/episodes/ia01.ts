// "Esse vídeo foi feito por uma IA" — bastidor real do canal no formato terminal + etapas + resultado.
// Tudo o que é dito é verdade: roteiro, voz, animação 3D e trilha deste canal são gerados por código.
import durations from '../../public/audio/ia01/durations.json';
import {Actor, Episode, Poll, Shot} from '../script';

const V = (o: Partial<Actor> = {}): Actor => ({who: 'voce', pos: [0, 0, 0], ...o});

const CTA: Poll = {
  title: 'COMENTA',
  highlight: '"QUERO"',
  options: ['👉 e eu te mostro como fazer o seu'],
  footer: 'Manda pra quem diz que IA não faz nada 😂',
};

export const shots: Shot[] = [
  {
    id: 'gancho',
    text: 'Esse vídeo inteiro foi feito por uma *inteligência artificial.* Sem câmera. Sem editor.',
    env: 'street',
    mood: 'day',
    cast: [],
    cam: [
      {p: [0, 2, 6], l: [0, 1.5, 0]},
      {p: [0, 2, 5], l: [0, 1.5, 0]},
    ],
    cover: true,
    titleBar: [{t: 'UMA IA FEZ'}, {t: 'ESSE VÍDEO', c: 'yellow'}, {t: 'SOZINHA.', c: 'red'}],
    term: {lines: ['> crie um vídeo pro meu Insta', '✓ entendido. começando...', 'escrevendo roteiro.ts', 'gerando voz...', 'animando cena 3D...']},
    sfx: 'hit',
  },
  {
    id: 'ideia',
    text: 'Eu só *descrevi a ideia.* Ela fez o resto.',
    env: 'street',
    mood: 'day',
    cast: [],
    cam: [
      {p: [0, 2, 6], l: [0, 1.5, 0]},
      {p: [0, 2, 5], l: [0, 1.5, 0]},
    ],
    term: {title: 'você', lines: ['> quero um vídeo de "E se..."', '> com bonecos 3D e suspense', '> pra viralizar no Reels', '', '✓ deixa comigo.', '// analisando 6 vídeos...', '// lendo os comentários...']},
  },
  {
    id: 'etapas',
    text: 'Ela dividiu o trabalho em *quatro funções.*',
    env: 'street',
    mood: 'day',
    cast: [],
    cam: [
      {p: [0, 2, 6], l: [0, 1.5, 0]},
      {p: [0, 2, 5], l: [0, 1.5, 0]},
    ],
    agents: [
      {icon: '🧠', name: 'Roteiro'},
      {icon: '🎙️', name: 'Voz'},
      {icon: '🎬', name: 'Animação 3D'},
      {icon: '🎵', name: 'Trilha'},
    ],
  },
  {
    id: 'voz',
    text: 'Uma escreveu o roteiro. Outra criou a voz que você tá ouvindo *agora.*',
    env: 'street',
    mood: 'day',
    cast: [],
    cam: [
      {p: [0, 2, 6], l: [0, 1.5, 0]},
      {p: [0, 2, 5], l: [0, 1.5, 0]},
    ],
    term: {title: 'roteiro.ts + voz', lines: ["text: 'E se você visse", "  quanto tempo de vida", "  cada um tem?'", '$ python gerar-voz.py', '✓ 00 gancho: 3.68s', '✓ 01 rua: 2.87s', '✓ 02 homem: 2.61s']},
  },
  {
    id: 'boneco',
    text: 'Outra programou cada boneco, *linha por linha.*',
    env: 'street',
    mood: 'day',
    cast: [V({pos: [0, 0, -5], to: [0, 0, -0.5], face: 'smirk', pose: 'walk'})],
    cam: [
      {p: [0, 1.6, 4.2], l: [0, 2.7, -2]},
      {p: [0, 1.6, 3.4], l: [0, 2.7, -1]},
    ],
    envProps: {crowd: 1},
    term: {title: 'characters.tsx', half: true, lines: ['<Character', '  who="voce"', '  pose="walk"', '  face="smirk"', '/>', '✓ renderizando...']},
  },
  {
    id: 'pronto',
    text: 'E em poucos minutos, o vídeo tava *pronto.*',
    env: 'street',
    mood: 'day',
    cast: [V({face: 'shock', pose: 'stand'})],
    cam: [
      {p: [0, 1.78, 2.9], l: [0, 1.6, 0]},
      {p: [0, 1.74, 2.0], l: [0, 1.62, 0]},
    ],
    envProps: {crowd: 1},
    hud: {label: 'LINHAS DE CÓDIGO', from: 0, to: 2900},
    timers: [
      {text: '52 ANOS', x: 17, y: 640},
      {text: '31 ANOS', x: 84, y: 660},
    ],
    sfx: 'hit',
  },
  {
    id: 'comentarios',
    text: 'E o próximo roteiro sai dos *seus comentários.*',
    env: 'street',
    mood: 'day',
    cast: [V({face: 'talk', pose: 'clap'})],
    cam: [
      {p: [0.5, 1.75, 2.4], l: [0, 1.6, 0]},
      {p: [0.2, 1.72, 1.7], l: [0, 1.62, 0]},
    ],
    envProps: {crowd: 1},
    ask: {text: 'Qual vídeo a IA deve criar agora? 👇', at: 4},
  },
  {
    id: 'cta',
    text: 'Comenta *quero,* que eu te mostro como fazer o seu.',
    env: 'street',
    mood: 'day',
    cast: [V({face: 'smirk', pose: 'stand'})],
    cam: [
      {p: [0, 5.5, 6.5], l: [0, 1, -2]},
      {p: [0, 5, 5.6], l: [0, 1.1, -2]},
    ],
    envProps: {crowd: 1},
    poll: CTA,
  },
];

export const ia01: Episode = {id: 'ia01', tag: 'FEITO 100% POR IA', shots, durations};
