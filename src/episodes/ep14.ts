// Episódio 14 — "Viajei no tempo pra descobrir por que o Brasil não é rico" (PARTE 1). Pixel art, render: pixel/render_ep14.py.
// Fatos: ouro de Minas no séc. XVIII escoado a Portugal e, via Tratado de Methuen (1703), à Inglaterra;
// alvará de D. Maria I (1785) proibindo manufaturas têxteis na colônia.
// hold = silêncio depois da fala (pausa dramática). Configuração lida pelas ferramentas: narrator: 'voce' · pad: 0.25 · voiceSpeed: 1.02
import durations from '../../public/audio/ep14/durations.json';
import {ComicShot} from './ep08';

export const shots: ComicShot[] = [
  {
    id: 'gancho',
    text: 'Eu viajei no tempo pra descobrir por que o Brasil, com tanta riqueza, *não é rico.*',
    sfx: 'hit',
  },
  {
    id: 'escola',
    hold: 0.3,
    text: 'E a última parada... *a escola não te conta.*',
    tone: 'suspense',
  },
  {
    id: 'portal1',
    hold: 0.4,
    text: 'Primeira parada:',
  },
  {
    id: 'ouro',
    text: 'Mil setecentos e três. Minas Gerais tá *cheia de ouro.*',
  },
  {
    id: 'pausa1',
    hold: 0.9,
    text: 'Só que esse ouro...',
    tone: 'suspense',
  },
  {
    id: 'inglaterra',
    text: 'vai parar na !Inglaterra.! E vira *fábrica lá.* Não aqui.',
    sfx: 'hit',
  },
  {
    id: 'pior',
    hold: 0.3,
    text: 'E isso *nem foi o pior.*',
    tone: 'suspense',
  },
  {
    id: 'tear',
    text: 'Mil setecentos e oitenta e cinco. Um brasileiro abre uma *fábrica de tecido.*',
  },
  {
    id: 'pausa2',
    hold: 0.9,
    text: 'Aí chega uma ordem de Portugal...',
    tone: 'suspense',
  },
  {
    id: 'proibido',
    text: '!Proibido! fábrica no Brasil.',
    sfx: 'hit',
  },
  {
    id: 'chuta',
    hold: 1.0,
    text: 'Pausa e chuta: *o que isso causou?*',
  },
  {
    id: 'resposta',
    text: 'A gente virou o país que *vende matéria-prima barata,* e compra !tudo pronto, caro.!',
  },
  {
    id: 'gancho2',
    text: 'E a próxima parada foi *ainda pior.* Segue pra ver a !parte dois.!',
    tone: 'suspense',
  },
];

export const ep14 = {id: 'ep14', tag: 'PARTE 1', shots, durations: durations as Record<string, number>};
