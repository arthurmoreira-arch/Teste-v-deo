// Episódio 11 — Terror em perseguição, formato "cena de cinema" (tela 16:9 no meio do Reels): "Ela me segue" (PARTE 1).
// Configuração lida pelas ferramentas: narrator: 'voce' · pad: 0.4 · bpm: 96 · voiceSpeed: 1.0
import durations from '../../public/audio/ep11/durations.json';
import {ComicShot} from './ep08';

export const PAD = 0.4;

export const shots: ComicShot[] = [
  {
    id: 'gancho',
    hold: 0.4,
    text: 'Faz três dias que uma coisa me segue. *Só eu consigo ver.*',
    sfx: 'hit',
  },
  {
    id: 'carros',
    text: 'Se ela encostar em mim... !eu sumo.! Igual o meu irmão sumiu.',
    tone: 'suspense',
  },
  {
    id: 'calcada',
    text: 'Ninguém na rua percebe. Ela anda *no meio das pessoas.*',
    tone: 'suspense',
  },
  {
    id: 'perto',
    text: 'Hoje ela chegou mais perto. *Dez metros.*',
    sfx: 'hit',
  },
  {
    id: 'beco',
    text: 'Corri pro beco. Tinha dois policiais lá no fim.',
  },
  {
    id: 'policial',
    hold: 0.3,
    text: '{chefe:Ei, garoto! Parado aí!}',
  },
  {
    id: 'sorriram',
    text: 'Eu gritei pra eles correrem. Mas eles olharam pra trás de mim... e !sorriram.!',
    tone: 'suspense',
    sfx: 'hit',
    glitch: [70],
  },
  {
    id: 'achei',
    hold: 0.4,
    text: '{vulto:Achei você.}',
    sfx: 'hit',
    glitch: [4],
  },
  {
    id: 'trem',
    text: 'Pulei no trem. Ela ficou na plataforma. *Acenando.*',
  },
  {
    id: 'reflexo',
    text: 'Só que no vidro do trem... !o reflexo dela tava do meu lado.!',
    tone: 'suspense',
    sfx: 'hit',
    glitch: [56],
  },
  {
    id: 'escolha',
    hold: 2,
    text: 'O que você faz? *Comenta uma palavra.* A mais votada decide a parte dois.',
  },
];

export const ep11 = {id: 'ep11', tag: 'PARTE 1', shots, durations: durations as Record<string, number>};
