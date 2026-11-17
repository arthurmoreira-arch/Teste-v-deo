// Episódio 16 — "Viajei no tempo… PARTE 1" (versão nova: explicação + analogias + quiz + ligação com hoje). Render: pixel/render_ep16.py.
// Fatos: ciclo do ouro em Minas (séc. XVIII); Tratado de Methuen (1703): vinho português por tecidos de lã ingleses; o déficit
// comercial português era pago em boa parte com ouro do Brasil, que foi para a Inglaterra; alvará de D. Maria I (1785) mandou
// fechar as manufaturas têxteis da colônia (exceto panos grossos); hoje o Brasil exporta soja e minério e importa eletrônicos e remédios.
// Configuração lida pelas ferramentas: narrator: 'jovem' · pad: 0.25 · voiceSpeed: 1.0
import durations from '../../public/audio/ep16/durations.json';
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
    id: 'portal',
    hold: 0.4,
    text: 'Primeira parada:',
  },
  {
    id: 'ouro',
    text: 'Mil setecentos e três. Minas Gerais tá vivendo uma das *maiores corridas do ouro* da história.',
  },
  {
    id: 'pausa1',
    hold: 0.8,
    text: 'Só que esse ouro...',
    tone: 'suspense',
  },
  {
    id: 'tratado',
    text: 'Nesse ano, Portugal assina um acordo com a Inglaterra. Portugal vende *vinho,* e compra *tecido inglês.*',
  },
  {
    id: 'quiz',
    hold: 3.0,
    text: 'Quiz: quem saiu ganhando? A, Portugal. B, a Inglaterra. C, o Brasil.',
  },
  {
    id: 'resposta',
    text: 'Letra B! Tecido valia muito mais que vinho. Portugal ficava devendo, e pagava com o quê? !Com o nosso ouro.!',
    sfx: 'hit',
  },
  {
    id: 'analogia',
    text: 'É como você trabalhar o mês inteiro, e o seu salário cair direto na *fatura do cartão de outra pessoa.*',
  },
  {
    id: 'cofre',
    text: 'Esse ouro foi encher os cofres ingleses, pouco antes da Revolução Industrial. E aqui? !Quase nada ficou.!',
  },
  {
    id: 'pior',
    hold: 0.3,
    text: 'E isso *nem foi o pior.*',
    tone: 'suspense',
  },
  {
    id: 'tear',
    text: 'Mil setecentos e oitenta e cinco. Brasileiros começam a fazer o *próprio tecido.* Mais barato, feito aqui.',
  },
  {
    id: 'pausa2',
    hold: 0.8,
    text: 'Aí chega uma ordem da rainha de Portugal...',
    tone: 'suspense',
  },
  {
    id: 'proibido',
    text: '!Proibido! fazer tecido no Brasil. As fábricas tinham que fechar.',
    sfx: 'hit',
  },
  {
    id: 'porque',
    text: 'Por quê? Colônia não podia fabricar. Tinha que *cavar ouro,* e *comprar tudo pronto.*',
  },
  {
    id: 'estagiario',
    text: 'É como um chefe proibir o estagiário de aprender, só pra ele !nunca virar concorrente.!',
  },
  {
    id: 'hoje',
    text: 'E o mais louco? Até hoje o Brasil vende *soja e minério,* e compra !celular e remédio pronto.!',
  },
  {
    id: 'cta',
    text: 'Qual parada te deixou mais revoltado? *Comenta.* E a próxima foi ainda pior: segue pra ver a !parte dois.!',
  },
];

export const ep16 = {id: 'ep16', tag: 'PARTE 1', shots, durations: durations as Record<string, number>};
