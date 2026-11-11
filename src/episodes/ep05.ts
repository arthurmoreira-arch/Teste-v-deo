// Episódio 5 — "Um assassino sabe o seu segredo" (continua a história, mas funciona SOZINHO).
// Lições do ep. 4 (225 views, 15s de 53s): "PARTE 2" no gancho afasta quem não viu a parte 1,
// vídeo longo e narração lenta derrubam a retenção. Aqui: gancho independente, ~33s, ritmo rápido,
// pergunta no meio (funcionou: comentários 1,0%) e pedido de envio no final.
import durations from '../../public/audio/ep05/durations.json';
import lines from '../../public/audio/ep05/lines.json';
import {Actor, Episode, Poll, Shot} from '../script';

const V = (o: Partial<Actor> = {}): Actor => ({who: 'voce', pos: [0, 0, 0], ...o});
const RJ = (o: Partial<Actor> = {}): Actor => ({who: 'redjohn', pos: [0, 0, 0], pose: 'stand', face: 'neutral', ...o});

const POLL: Poll = {
  title: 'EM QUEM VOCÊ',
  highlight: 'CONFIA?',
  options: ['A · no assassino', 'B · na sua mãe', 'C · em ninguém'],
  footer: 'Manda pra pessoa que você MAIS confia 👀',
};

export const shots: Shot[] = [
  {
    id: 'gancho',
    text: 'Você ouve pensamentos. E um assassino acabou de *descobrir.*',
    tone: 'suspense',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [RJ({pos: [0, 0, -2.2]})],
    cam: [
      {p: [0, 1.85, 1.6], l: [0, 1.82, -2.2]},
      {p: [0, 1.82, 0.2], l: [0, 1.8, -2.2]},
    ],
    envProps: {crowd: 1},
    cover: true,
    titleBar: [{t: 'UM ASSASSINO'}, {t: 'SABE O SEU', c: 'yellow'}, {t: 'SEGREDO.', c: 'red'}],
    sfx: 'hit',
  },
  {
    id: 'porta',
    text: 'Três da manhã. Ele tá parado na *sua porta.*',
    tone: 'suspense',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [RJ({pos: [1.6, 0, 6.2], rotY: Math.PI})],
    cam: [
      {p: [6, 2.6, 13], l: [1.4, 1.8, 3]},
      {p: [3.4, 2.0, 9.6], l: [1.5, 1.8, 3]},
    ],
    envProps: {warm: true},
    hud: {label: 'DISTÂNCIA DELE', from: 300, to: 2, suffix: ' m'},
  },
  {
    id: 'medo',
    text: 'Mas você ouve o que ele esconde: !o medo.! {redjohn:E se ele contar pra alguém?}',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [RJ({pos: [0, 0, -2.2]})],
    cam: [
      {p: [0.5, 1.85, 0.9], l: [0, 1.82, -2.2]},
      {p: [0.1, 1.82, -0.2], l: [0, 1.8, -2.2]},
    ],
    envProps: {crowd: 1},
    thoughts: [{text: 'e se ele contar pra alguém?', x: 50, y: 300, red: true}],
  },
  {
    id: 'abre',
    text: 'Então você faz o que ninguém fez. Você *abre a porta.*',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [V({pos: [1.6, 0, 3.3], face: 'angry'}), RJ({pos: [1.6, 0, 6.2], rotY: Math.PI})],
    cam: [
      {p: [9.8, 2.0, 4.75], l: [1.6, 1.35, 4.75]},
      {p: [8.6, 1.8, 4.75], l: [1.6, 1.35, 4.75]},
    ],
    envProps: {warm: true},
    ask: {text: 'Você abriria? Comenta 👇', at: 30},
    sfx: 'hit',
  },
  {
    id: 'nome',
    text: 'E fala o nome verdadeiro dele. *Em voz alta.*',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [V({pos: [1.6, 0, 3.3], face: 'talk'})],
    cam: [
      {p: [1.9, 1.75, 5.4], l: [1.6, 1.68, 3.3]},
      {p: [1.7, 1.72, 4.6], l: [1.6, 1.68, 3.3]},
    ],
    envProps: {warm: true},
  },
  {
    id: 'recua',
    text: 'Pela primeira vez, o Red John *dá um passo pra trás.*',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [RJ({pos: [1.6, 0, 6.2], to: [1.6, 0, 8.4], rotY: Math.PI}), V({pos: [1.6, 0, 3.3], rotY: 0, face: 'angry'})],
    cam: [
      {p: [-8.5, 2.0, 5.8], l: [1.6, 1.3, 5.8]},
      {p: [-9.4, 2.0, 5.9], l: [1.6, 1.3, 5.9]},
    ],
    envProps: {warm: true},
    hud: {label: 'MEDO DELE', from: 0, to: 100, suffix: '%'},
  },
  {
    id: 'segundo',
    text: 'Só que aí você ouve um *segundo* pensamento. Vindo de !dentro da sua casa.!',
    tone: 'suspense',
    env: 'living',
    mood: 'cold',
    cast: [V({pos: [0, 0, 0.4], face: 'shock'})],
    cam: [
      {p: [0, 1.75, 2.9], l: [0, 1.68, 0.4]},
      {p: [0, 1.72, 1.7], l: [0, 1.68, 0.4]},
    ],
    sfx: 'hit',
  },
  {
    id: 'mae',
    text: 'É a voz da sua mãe. {mae:Não era pra você ter aberto.}',
    tone: 'suspense',
    env: 'living',
    mood: 'red',
    cast: [{who: 'mae', pos: [0.4, 0, -1.6], face: 'smirk', pose: 'sit'}],
    cam: [
      {p: [0.5, 1.7, 2.2], l: [0.4, 1.55, -1.6]},
      {p: [0.45, 1.65, 0.0], l: [0.4, 1.6, -1.6]},
    ],
    thoughts: [{text: 'não era pra você ter aberto', x: 50, y: 330, red: true}],
    sfx: 'hit',
  },
  {
    id: 'enquete',
    text: 'Em quem você *confia?* Manda pra essa pessoa. E segue pra ver quem mentiu.',
    env: 'house',
    night: 1,
    mood: 'cold',
    cast: [RJ({pos: [1.6, 0, 8.4], rotY: Math.PI}), V({pos: [1.6, 0, 3.3], rotY: 0, face: 'shock'})],
    cam: [
      {p: [1.2, 6.5, 14.5], l: [1.5, 1.2, 5]},
      {p: [1.4, 5.6, 13], l: [1.5, 1.3, 5]},
    ],
    envProps: {warm: true},
    poll: POLL,
  },
];

export const ep05: Episode = {id: 'ep05', tag: 'E SE #5', shots, durations, lines};
