import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Background3D} from './Background3D';
import {Captions} from './Captions';
import {scenes, sceneFrames} from './script';

// Ligue estas flags quando adicionar os arquivos em /public
const HAS_NARRATION = false; // public/audio/narracao.mp3
const HAS_MUSIC = false; // public/audio/trilha.mp3
const HAS_SCENE_IMAGES = false; // public/cenas/01.png ... 07.png (9:16)

const SceneView = ({index}: {index: number}) => {
  const scene = scenes[index];
  const duration = sceneFrames(scene);
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [0, 8, duration - 8, duration], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const zoom = interpolate(frame, [0, duration], [1.0, 1.12]);

  return (
    <AbsoluteFill style={{opacity: fade}}>
      <Background3D mood={scene.mood} localFrame={frame} duration={duration} />
      {HAS_SCENE_IMAGES && (
        <AbsoluteFill style={{transform: `scale(${zoom})`, mixBlendMode: 'screen', opacity: 0.85}}>
          <img
            src={staticFile(`cenas/${String(index + 1).padStart(2, '0')}.png`)}
            style={{width: '100%', height: '100%', objectFit: 'cover'}}
          />
        </AbsoluteFill>
      )}
      <Captions text={scene.text} duration={duration} />
    </AbsoluteFill>
  );
};

export const EseMentalista = () => {
  let start = 0;
  return (
    <AbsoluteFill style={{backgroundColor: '#050507'}}>
      {scenes.map((s, i) => {
        const d = sceneFrames(s);
        const from = start;
        start += d;
        return (
          <Sequence key={s.id} from={from} durationInFrames={d}>
            <SceneView index={i} />
          </Sequence>
        );
      })}
      {/* vinheta + grão para o clima "dark" */}
      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)',
          pointerEvents: 'none',
        }}
      />
      {HAS_NARRATION && <Audio src={staticFile('audio/narracao.mp3')} />}
      {HAS_MUSIC && <Audio src={staticFile('audio/trilha.mp3')} volume={0.18} />}
    </AbsoluteFill>
  );
};
