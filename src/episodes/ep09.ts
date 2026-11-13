// Episódio 9 — "O caos da Nvidia, explicado" (notícia, ritmo mais lento).
// Fatos de 12–13/11/2026, conforme ABC News, Fortune, Al Jazeera, CNBC e CoinDesk:
// renúncia de Jensen Huang (12/11), investigação interna sobre relações pessoais dele (incluindo uma com uma mulher
// que autoridades dos EUA suspeitam ter ligação com a inteligência chinesa), queda de até 14% no dia, 6 semanas
// seguidas de queda, ~US$ 1,6 tri perdidos desde o recorde de 6/10, Colette Kress interina, resultados em 17/11.
// Configuração lida pelas ferramentas: pad: 0.55 · bpm: 92 · voiceSpeed: 0.93
import durations from '../../public/audio/ep09/durations.json';
import {ComicShot} from './ep08';

export const PAD = 0.55; // respiro depois de cada fala (ritmo mais lento)

export const shots: ComicShot[] = [
  {
    id: 'gancho',
    text: 'Em seis semanas, a Nvidia perdeu mais de *um trilhão* de dólares. E o chefe dela !foi embora.!',
    sfx: 'hit',
  },
  {
    id: 'chip',
    text: 'A Nvidia faz *chips:* o cérebro que faz a *inteligência artificial* funcionar.',
  },
  {
    id: 'todos',
    text: 'Quase toda IA roda num chip dela. Por isso, ela virou uma das empresas *mais valiosas* do mundo.',
  },
  {
    id: 'queda',
    text: 'Mas, desde outubro, as ações caíam havia *seis semanas.* O mercado duvidava: as empresas vão continuar gastando tanto com IA?',
    tone: 'suspense',
  },
  {
    id: 'bomba',
    text: 'Aí, no dia doze de novembro, veio a !bomba.!',
    sfx: 'hit',
    glitch: [40],
  },
  {
    id: 'cadeira',
    text: 'Jensen Huang, o fundador que comandava a Nvidia havia *trinta e três anos,* renunciou.',
    tone: 'suspense',
  },
  {
    id: 'investigacao',
    text: 'Segundo a imprensa americana, a empresa investigava relações pessoais dele. Uma, com uma mulher que os Estados Unidos suspeitam ser ligada à *inteligência chinesa.*',
    tone: 'suspense',
  },
  {
    id: 'dia',
    text: 'Naquele dia, as ações chegaram a cair !catorze por cento.!',
    sfx: 'hit',
    glitch: [10],
  },
  {
    id: 'valor',
    text: 'Desde o recorde, a Nvidia perdeu cerca de *um trilhão e seiscentos bilhões* de dólares.',
  },
  {
    id: 'kress',
    text: 'Quem assumiu, por enquanto, foi a diretora financeira, *Colette Kress.*',
  },
  {
    id: 'importa',
    text: 'E por que isso importa? Porque quando a Nvidia treme, *o mundo da IA* treme junto.',
  },
  {
    id: 'enquete',
    text: 'Dia dezessete, saem os resultados. Ela volta mais forte? Comenta, e segue pro próximo capítulo.',
  },
];

export const ep09 = {id: 'ep09', tag: 'ENTENDA', shots, durations: durations as Record<string, number>};
