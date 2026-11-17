// Episódio 17 — "Treina e não cresce?" (formato do vídeo de referência: mascote fixo, uma palavra por vez, músculos coloridos).
// Dicas de consenso científico: sobrecarga progressiva; séries perto da falha; cada músculo ~2x por semana;
// proteína ~1,6 g/kg/dia; sono de 7 a 9 horas. Render: pixel/render_ep17.py.
// Configuração lida pelas ferramentas: narrator: 'jovem' · pad: 0.2 · bpm: 130 · voiceSpeed: 1.04
import durations from '../../public/audio/ep17/durations.json';
import {ComicShot} from './ep08';

export const shots: ComicShot[] = [
  {
    id: 'gancho',
    text: 'Treina a semana inteira e *não cresce?* O problema pode não ser o treino.',
    sfx: 'hit',
  },
  {
    id: 'carga',
    text: 'Um: se você levanta o *mesmo peso* há meses, o músculo não tem motivo pra crescer. Aumenta a carga, ou as repetições, aos poucos.',
  },
  {
    id: 'falha',
    text: 'Dois: as últimas repetições têm que ser *difíceis.* Se você termina a série conversando, ficou leve.',
  },
  {
    id: 'frequencia',
    text: 'Três: treina cada músculo *duas vezes por semana.* Peito, por exemplo: segunda e quinta.',
  },
  {
    id: 'proteina',
    text: 'Quatro: proteína. Perto de *um vírgula seis grama por quilo,* por dia. Pesa oitenta quilos? Uns *cento e trinta gramas.*',
  },
  {
    id: 'sono',
    text: 'E o que quase todo mundo esquece: o músculo cresce *dormindo.* Menos de sete horas de sono, e o resultado !despenca.!',
    sfx: 'hit',
  },
  {
    id: 'cta',
    text: 'Qual desses você erra? *Comenta o número,* e salva pra não esquecer.',
  },
];

export const ep17 = {id: 'ep17', tag: 'TREINO', shots, durations: durations as Record<string, number>};
