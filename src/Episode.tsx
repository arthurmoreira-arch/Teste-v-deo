import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {World3D} from './World3D';
import {Overlay} from './Overlay';
import {Episode as Ep} from './script';
import {EpProvider, useEp} from './ep';

const HAS_NARRATION = true; // public/audio/<ep>/shots/NN.mp3 (gerado por tools/gerar-voz.py)
const HAS_MUSIC = true; // public/audio/music.mp3 (gerado por tools/gerar-fx.py)

const Flash = ({hit}: {hit: boolean}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 7], [hit ? 0.75 : 0.35, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: hit ? '#ff1a1a' : '#ffffff', opacity: o, mixBlendMode: 'screen', pointerEvents: 'none'}} />;
};

const Progress = () => {
  const f = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return (
    <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: `${(f / durationInFrames) * 100}%`, background: '#f7c61a', boxShadow: '0 0 18px #f7c61a'}} />
  );
};

const Body = () => {
  const {ep, frames, starts} = useEp();
  return (
  <AbsoluteFill style={{backgroundColor: '#050507'}}>
    <World3D />
    {ep.shots.map((s, i) => (
      <Sequence key={s.id} from={starts[i]} durationInFrames={frames(s)}>
        <Flash hit={s.sfx === 'hit'} />
        <Overlay shot={s} />
        <Audio src={staticFile(s.sfx === 'hit' ? 'audio/hit.mp3' : 'audio/whoosh.mp3')} volume={s.sfx === 'hit' ? 0.7 : 0.22} />
        {HAS_NARRATION && <Audio src={staticFile(`audio/${ep.id}/shots/${String(i).padStart(2, '0')}.mp3`)} volume={1} />}
      </Sequence>
    ))}
    <Progress />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none'}} />
    {HAS_MUSIC && <Audio src={staticFile('audio/music.mp3')} volume={(f) => Math.min(0.26, f / 45 * 0.26)} />}
  </AbsoluteFill>
  );
};

export const Episode = ({ep}: {ep: Ep}) => (
  <EpProvider ep={ep}>
    <Body />
  </EpProvider>
);
