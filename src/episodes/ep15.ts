// Episódio 15 — "Viajei no tempo… PARTE 2": explicação + analogias + ligação com hoje + quiz. Render: pixel/render_ep15.py.
// Fatos: família real no Brasil (1808) escoltada pela marinha britânica; Tratado de 1810 (tarifa de 15% para produtos ingleses,
// 16% para portugueses); Lei de Terras (1850): terra só por compra; Lei Áurea (1888), último país das Américas; libertos sem
// terra/escola/indenização; desigualdade brasileira entre as maiores do mundo (índice de Gini); primeiras universidades:
// México e Lima (1551); no Brasil, a primeira universidade oficial que vingou é de 1920 (Rio de Janeiro).
// Configuração lida pelas ferramentas: narrator: 'jovem' · pad: 0.25 · voiceSpeed: 1.0
import durations from '../../public/audio/ep15/durations.json';
import {ComicShot} from './ep08';

export const shots: ComicShot[] = [
  {
    id: 'recap',
    text: 'Na parte um: nosso ouro foi pra Inglaterra, e Portugal *proibiu fábrica* aqui. Mas a viagem continua.',
  },
  {
    id: 'portal',
    hold: 0.4,
    text: 'Próxima parada:',
  },
  {
    id: 'familia',
    text: 'Mil oitocentos e dez. A família real fugiu do Napoleão pro Brasil. Quem escoltou? *A Inglaterra.*',
  },
  {
    id: 'preco',
    hold: 0.5,
    text: 'Só que esse favor... *teve um preço.*',
    tone: 'suspense',
  },
  {
    id: 'tratado',
    text: 'O produto inglês passou a pagar só !quinze por cento! de imposto aqui. Menos que o português.',
    sfx: 'hit',
  },
  {
    id: 'padaria',
    text: 'Pensa: você abre uma padaria, e do lado chega um gigante vendendo pão *mais barato* com desconto. Quanto tempo você dura?',
  },
  {
    id: 'sufocada',
    text: 'Foi isso com a indústria brasileira: nascia, e !morria sufocada.!',
  },
  {
    id: 'rehook',
    hold: 0.3,
    text: 'Mas a próxima parada explica a *desigualdade de hoje.*',
    tone: 'suspense',
  },
  {
    id: 'terras',
    text: 'Mil oitocentos e cinquenta: Lei de Terras. Terra, agora, *só comprando.*',
  },
  {
    id: 'quemcompra',
    text: 'E quem tinha dinheiro? Os *grandes fazendeiros.* Pobre e escravizado !ficou de fora.!',
  },
  {
    id: 'abolicao',
    text: 'Mil oitocentos e oitenta e oito: a escravidão acaba. O Brasil foi o *último das Américas.*',
    sfx: 'hit',
  },
  {
    id: 'pergunta',
    hold: 0.9,
    text: 'Aí vem a pergunta que a escola não faz: *e depois?*',
    tone: 'suspense',
  },
  {
    id: 'nada',
    text: '!Nada.! Sem terra, sem escola, sem indenização. Milhões de pessoas começando *do zero.*',
    sfx: 'hit',
  },
  {
    id: 'hoje',
    text: 'Isso passou de pai pra filho. Hoje somos um dos países *mais desiguais do mundo,* e muito talento !nunca tem chance.!',
  },
  {
    id: 'quiz',
    hold: 3.0,
    text: 'Quiz: quando nasceu a primeira universidade do Brasil? A, mil e quinhentos. B, mil e oitocentos. C, mil novecentos e vinte.',
  },
  {
    id: 'resposta',
    text: 'Letra C, *mil novecentos e vinte!* O México e o Peru tinham desde !mil quinhentos e cinquenta e um.!',
    sfx: 'hit',
  },
  {
    id: 'moral',
    text: 'Ouro levado, fábrica proibida, povo sem terra e sem escola. Não foi *falta de riqueza.* Foi !como ela foi usada.!',
  },
  {
    id: 'cta',
    text: 'Qual parada te chocou mais? *Comenta.* Na parte três: como a Coreia, *mais pobre que a gente,* passou o Brasil.',
  },
];

export const ep15 = {id: 'ep15', tag: 'PARTE 2', shots, durations: durations as Record<string, number>};
