// Episódio 8 — "E se você pudesse ler as mensagens que as pessoas apagaram?"
// Animação 2D em estilo de quadrinhos, feita do zero (src/comic). Aqui ficam só os textos e o tom de cada plano
// (formato lido pelo tools/gerar-voz.py); o desenho de cada plano está em src/comic/Ep08.tsx.
import durations from '../../public/audio/ep08/durations.json';

export type ComicShot = {id: string; text: string; tone?: 'suspense' | 'normal'; sfx?: 'hit'};

export const shots: ComicShot[] = [
  {
    id: 'gancho',
    text: 'E se você pudesse ler *todas* as mensagens que as pessoas apagaram?',
    sfx: 'hit',
  },
  {
    id: 'engracado',
    text: 'No começo, é *engraçado.* Seu chefe apagou um elogio.',
  },
  {
    id: 'amiga',
    text: 'Aí você abre a conversa da sua *melhor amiga.*',
    tone: 'suspense',
  },
  {
    id: 'tres',
    text: '!Três mensagens apagadas.! Todas sobre *você.*',
    tone: 'suspense',
    sfx: 'hit',
  },
  {
    id: 'minuto',
    text: 'E a última foi apagada *há um minuto.*',
    tone: 'suspense',
  },
  {
    id: 'twist',
    text: 'Você abre. E ela escreveu: !eu sei que você consegue ler.!',
    sfx: 'hit',
  },
  {
    id: 'enquete',
    text: 'E aí, você *responde?* Manda pra pessoa que mais apaga mensagem.',
  },
];

export const ep08 = {id: 'ep08', tag: 'E SE #8', shots, durations: durations as Record<string, number>};
