// Episódio 1 — E se o Patrick Jane nunca tivesse se envolvido com o Red John?
import durations from '../../public/audio/ep01/durations.json';
import {Actor, Episode, Shot} from '../script';

const J = (o: Partial<Actor> = {}): Actor => ({who: 'jane', pos: [0, 0, 0], ...o});

export const shots: Shot[] = [
  {
    id: 'gancho',
    text: 'Se o Patrick Jane tivesse ficado *calado,* o !Red John! ainda estaria matando.',
    env: 'street',
    mood: 'cold',
    night: 0.4,
    cast: [{who: 'redjohn', pos: [0, 0, -2.2], rotY: 0, pose: 'stand', face: 'neutral'}],
    cam: [
      {p: [0, 1.85, 1.2], l: [0, 1.82, -2.2]},
      {p: [0, 1.82, -0.1], l: [0, 1.8, -2.2]},
    ],
    envProps: {crowd: 1},
    banner: 'E SE O JANE FICASSE CALADO?',
    sfx: 'hit',
  },
  {
    id: 'erro-1',
    text: 'Em rede nacional, ele chamou o assassino de *solitário e repulsivo.*',
    env: 'studio',
    mood: 'warm',
    cast: [J({face: 'talk', rotY: -0.25})],
    cam: [
      {p: [-1.8, 1.4, 2.8], l: [0, 1.6, 0]},
      {p: [-0.6, 1.7, 1.8], l: [0, 1.65, 0]},
    ],
    hud: {label: 'AUDIÊNCIA AO VIVO', from: 0, to: 8200000},
  },
  {
    id: 'erro-2',
    text: 'E pagou com !a própria família.!',
    env: 'house',
    night: 1,
    mood: 'red',
    cast: [],
    envProps: {windowSmiley: true},
    cam: [
      {p: [8, 4, 19], l: [0, 2.4, 0]},
      {p: [2.5, 2.8, 10], l: [-0.5, 2.4, 0]},
    ],
    sfx: 'hit',
  },
  {
    id: 'virada',
    text: 'Mas e se ele *nunca* tivesse dito nada?',
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
    text: 'Só que o Jane seria um *charlatão famoso,* lucrando com a !dor! dos outros.',
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
    text: 'Sem a tragédia, não existiria o *CBI.*',
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
    text: 'Nem a *Lisbon.* Nem um único caso !resolvido.!',
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
    sfx: 'hit',
  },
  {
    id: 'rj-2',
    text: 'Ninguém capaz de *ler os passos dele.*',
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
    poll: {title: 'VOCÊ', highlight: 'TROCARIA?', options: ['A · sim, a família dele', 'B · não, as vítimas'], footer: 'Comenta A ou B 👇'},
    sfx: 'hit',
  },
  {
    id: 'cta',
    text: '*Vota* A ou B nos comentários, *curte* e *segue* pra parte dois: e se a Lisbon tivesse matado o Red John?',
    env: 'street',
    mood: 'day',
    cast: [
      J({pos: [0, 0, 0], face: 'smirk', pose: 'stand'}),
      {who: 'lisbon', pos: [-1.6, 0, -3], face: 'neutral', pose: 'stand'},
    ],
    cam: [
      {p: [0, 6, 6], l: [0, 1.2, -3]},
      {p: [0, 5.4, 5.2], l: [0, 1.3, -3]},
    ],
    envProps: {crowd: 1},
    poll: {title: 'VOCÊ', highlight: 'TROCARIA?', options: ['A · sim, a família dele', 'B · não, as vítimas'], footer: 'Comenta A ou B 👇'},
    cta: true,
  },
];


export const ep01: Episode = {id: 'ep01', tag: 'E SE #1', shots, durations};
