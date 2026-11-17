// Episódio 13 — "5 fatos que impediram o Brasil de ser rico" (pixel art, avatar de época). Renderizado por pixel/render_ep13.py.
// Fatos: Tratado de Methuen (1703); alvará de D. Maria I contra manufaturas (1785); tratado com a Inglaterra, tarifa de 15% (1810);
// abolição em 1888, último das Américas (Lei de Terras de 1850, libertos sem terra/escola); dívida + hiperinflação (anos 80/90, >2.000% ao ano em 1993; narrado como 'anos oitenta' por brevidade).
// Configuração lida pelas ferramentas: pad: 0.3 · voiceSpeed: 1.04
import durations from '../../public/audio/ep13/durations.json';
import {ComicShot} from './ep08';

export const shots: ComicShot[] = [
  {
    id: 'gancho',
    text: 'O Brasil tem tudo pra ser rico. Mas *cinco fatos* da história mudaram tudo.',
    sfx: 'hit',
  },
  {
    id: 'f1703',
    text: 'Mil setecentos e três: o nosso ouro vai parar na Inglaterra. E financia a indústria *deles,* não a nossa.',
  },
  {
    id: 'f1785',
    text: 'Mil setecentos e oitenta e cinco: Portugal !proíbe fábricas! no Brasil. A gente só aprende a *vender matéria-prima.*',
  },
  {
    id: 'f1810',
    text: 'Mil oitocentos e dez: produto inglês paga *menos imposto* que até o português. A indústria daqui !nasce sufocada.!',
  },
  {
    id: 'f1888',
    text: 'Mil oitocentos e oitenta e oito: último das Américas a abolir a escravidão. Libertos !sem terra e sem escola.! Nasce a *desigualdade* de hoje.',
    sfx: 'hit',
  },
  {
    id: 'f1993',
    text: 'Anos oitenta: dívida e inflação de *dois mil por cento.* São !duas décadas perdidas.!',
  },
  {
    id: 'moral',
    text: 'Riqueza no chão, sem fábrica e sem escola, *não vira dinheiro no bolso.*',
  },
  {
    id: 'cta',
    text: 'Qual desses fatos mais atrasou o Brasil? *Comenta o ano,* e segue pra parte dois.',
  },
];

export const ep13 = {id: 'ep13', tag: 'HISTÓRIA', shots, durations: durations as Record<string, number>};
