// Episódio 10 — Terror em POV: "A última corrida" (PARTE 1).
// Fórmula dos vídeos de referência: visão em 1ª pessoa, selo PARTE 1 + relógio, mensagens do app dando ordens estranhas,
// fala de outro personagem em laranja, virada, e escolha final com dois botões ("comenta uma palavra").
// Configuração lida pelas ferramentas: narrator: 'voce' · pad: 0.45 · bpm: 84 · voiceSpeed: 0.97
import durations from '../../public/audio/ep10/durations.json';
import {ComicShot} from './ep08';

export const PAD = 0.45;

export const shots: ComicShot[] = [
  {
    id: 'gancho',
    hold: 0.8,
    text: 'Última corrida da noite. *Graças a Deus.*',
    tone: 'suspense',
  },
  {
    id: 'entrou',
    text: 'O passageiro mandou: *já entrei.* Mas eu nem parei o carro.',
    tone: 'suspense',
  },
  {
    id: 'regra',
    text: 'E depois: !não olha pelo retrovisor.! Só dirige.',
    sfx: 'hit',
  },
  {
    id: 'beleza',
    hold: 0.8,
    text: 'Beleza. *Mais fácil pra mim.*',
  },
  {
    id: 'cancelada',
    text: 'Aí o app avisou: *corrida cancelada.* Então... quem tá no banco de trás?',
    tone: 'suspense',
    sfx: 'hit',
  },
  {
    id: 'voz',
    hold: 0.5,
    text: '{vulto:Moço... vira à esquerda.}',
    tone: 'suspense',
    sfx: 'hit',
    glitch: [6],
  },
  {
    id: 'espelho',
    text: 'Eu olhei. O banco tava *vazio.* Mas o cinto... !tava afivelado.!',
    tone: 'suspense',
    glitch: [70],
  },
  {
    id: 'msg',
    text: 'Outra mensagem: *ele não sou eu.* Não para o carro.',
    tone: 'suspense',
  },
  {
    id: 'mae',
    text: 'E a minha mãe: *filho, cadê você?*',
  },
  {
    id: 'para',
    hold: 0.6,
    text: '{vulto:Para o carro. Agora.}',
    sfx: 'hit',
    glitch: [4, 30],
  },
  {
    id: 'eagora',
    hold: 1.4,
    text: 'E agora...?',
    tone: 'suspense',
  },
  {
    id: 'escolha',
    hold: 2.2,
    text: 'O que você faria? *Comenta uma palavra.* A mais votada decide a parte dois.',
  },
];

export const ep10 = {id: 'ep10', tag: 'PARTE 1', shots, durations: durations as Record<string, number>};
