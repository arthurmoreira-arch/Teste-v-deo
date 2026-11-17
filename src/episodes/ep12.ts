// Episódio 12 — "Por que o Brasil não é rico?" (pixel art, avatar apresentador).
// Renderizado em Python (pixel/render_ep12.py). Números aproximados, de fontes públicas (FMI 2024, USGS, ANA, USDA):
// ~12% da água doce superficial do mundo; maior produtor/exportador de café e soja; 2º maior exportador de minério de ferro;
// ~90% do nióbio do mundo; PIB per capita: Brasil ~US$10 mil, Japão ~33 mil, Coreia ~34 mil, Noruega ~90 mil, Suíça ~100 mil.
// Configuração lida pelas ferramentas: pad: 0.35 · voiceSpeed: 1.0
import durations from '../../public/audio/ep12/durations.json';
import {ComicShot} from './ep08';

export const shots: ComicShot[] = [
  {
    id: 'gancho',
    text: 'O Brasil tem mais riqueza natural que quase qualquer país. Então por que *a gente não é rico?*',
    sfx: 'hit',
  },
  {
    id: 'agua',
    text: 'A gente tem cerca de *doze por cento* da água doce do planeta.',
  },
  {
    id: 'minerio',
    text: 'É um dos maiores exportadores de *minério de ferro.* E tem quase *todo o nióbio* do mundo.',
  },
  {
    id: 'comida',
    text: 'E é o *maior produtor* de café e de soja da Terra.',
  },
  {
    id: 'virada',
    text: 'Mas olha a renda por pessoa: !dez mil dólares por ano.! Na Suíça, são *cem mil.*',
    sfx: 'hit',
  },
  {
    id: 'japao',
    text: 'E o Japão, que quase *não tem recurso natural,* tem uma renda três vezes maior.',
  },
  {
    id: 'segredo',
    text: 'O segredo tá aqui: o Brasil vende *matéria-prima barata,* e compra !produto pronto caro.!',
  },
  {
    id: 'cafe',
    text: 'A Alemanha nem planta café, mas é uma das maiores exportadoras de *café torrado.*',
  },
  {
    id: 'causas',
    text: 'Junta isso com educação fraca, desigualdade, burocracia e *impostos complicados.*',
  },
  {
    id: 'moral',
    text: 'Riqueza não é o que tá no chão. É *o que você consegue fazer* com ele.',
  },
  {
    id: 'cta',
    text: 'Qual é o maior problema? *Comenta a letra,* e manda pra quem acha que o Brasil é pobre.',
  },
];

export const ep12 = {id: 'ep12', tag: 'POR QUE?', shots, durations: durations as Record<string, number>};
