import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {World3D} from './World3D';
import {Overlay} from './Overlay';
import {shotFrames, shots, starts} from './script';

// Ligue estas flags quando adicionar os arquivos em /public
const HAS_NARRATION = false; // public/audio/narracao.mp3
const HAS_MUSIC = false; // public/audio/trilha.mp3

export const EseMentalista = () => (
  <AbsoluteFill style={{backgroundColor: '#050507'}}>
    <World3D />
    {shots.map((s, i) => (
      <Sequence key={s.id} from={starts[i]} durationInFrames={shotFrames(s)}>
        <Overlay shot={s} />
      </Sequence>
    ))}
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
    {HAS_NARRATION && <Audio src={staticFile('audio/narracao.mp3')} />}
    {HAS_MUSIC && <Audio src={staticFile('audio/trilha.mp3')} volume={0.18} />}
  </AbsoluteFill>
);
