// Roteiro "E se o Patrick Jane nunca tivesse se envolvido com o Red John?"
// Cada cena tem a narração (voz em off) e o "mood" visual usado pelo Three.js.
// Quando gravar a voz real, ajuste `WORDS_PER_SECOND` ou use `durationOverride` (em segundos).

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;
export const WORDS_PER_SECOND = 2.7; // ritmo de uma voz IA pt-BR dramática

export type Mood = {
  /** cor dominante da luz */
  color: string;
  /** 0..1 intensidade do smiley vermelho */
  smiley: number;
  /** 0..1 quantidade de partículas/poeira */
  dust: number;
  /** velocidade do giro da câmera */
  orbit: number;
};

export type Scene = {
  id: string;
  title: string;
  text: string;
  mood: Mood;
  durationOverride?: number;
};

export const scenes: Scene[] = [
  {
    id: 'gancho',
    title: 'Gancho',
    text: 'Patrick Jane é o maior mentalista da TV. Mas tudo começou com uma única frase.',
    mood: {color: '#c9a227', smiley: 0.0, dust: 0.5, orbit: 0.2},
  },
  {
    id: 'erro',
    title: 'O erro',
    text: 'Ele chamou o Red John de homem solitário e repulsivo, em rede nacional. E pagou com a própria família.',
    mood: {color: '#b3121b', smiley: 0.7, dust: 0.8, orbit: 0.5},
  },
  {
    id: 'virada',
    title: 'A virada',
    text: 'Agora imagine que ele nunca tivesse aberto a boca.',
    mood: {color: '#4a6fa5', smiley: 0.0, dust: 0.3, orbit: 0.1},
  },
  {
    id: 'familia',
    title: 'A família',
    text: 'Angela e Charlotte estariam vivas. Mas Jane seguiria como um charlatão famoso, lucrando com a dor de quem perdeu alguém.',
    mood: {color: '#e0b37a', smiley: 0.0, dust: 0.4, orbit: 0.15},
  },
  {
    id: 'sem-cbi',
    title: 'Sem CBI',
    text: 'Sem a tragédia, não existiria o CBI de Jane. Nem a Lisbon ao lado dele. Nem um único caso resolvido.',
    mood: {color: '#6b7280', smiley: 0.2, dust: 0.6, orbit: 0.3},
  },
  {
    id: 'red-john',
    title: 'Red John livre',
    text: 'E o Red John? Livre. Sem ninguém no encalço dele. Sem ninguém capaz de ler os seus passos.',
    mood: {color: '#ff1a1a', smiley: 1.0, dust: 1.0, orbit: 0.8},
  },
  {
    id: 'fecho',
    title: 'Fecho + CTA',
    text: 'A dor que destruiu o Jane foi a única coisa que o transformou em herói. Você trocaria a família dele pelas vítimas que ele salvou? Comenta aí.',
    mood: {color: '#b3121b', smiley: 0.9, dust: 0.7, orbit: 0.4},
  },
];

export const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);

export const sceneFrames = (s: Scene) =>
  Math.round(
    (s.durationOverride ?? wordsOf(s.text).length / WORDS_PER_SECOND + 0.6) * FPS,
  );

export const totalFrames = scenes.reduce((a, s) => a + sceneFrames(s), 0);
