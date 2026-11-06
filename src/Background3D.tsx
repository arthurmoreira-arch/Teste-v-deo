import {ThreeCanvas} from '@remotion/three';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Dust} from './Dust';
import {Smiley} from './Smiley';
import {Mood} from './script';

export const Background3D = ({mood, localFrame, duration}: {mood: Mood; localFrame: number; duration: number}) => {
  const {width, height, fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const t = frame / fps;

  // fade-in do smiley dentro da cena e um "pulso" leve, como batimento cardíaco
  const appear = interpolate(localFrame, [0, 20, duration - 10, duration], [0, 1, 1, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulse = 1 + Math.sin(t * 5) * 0.03 * mood.smiley;
  const intensity = mood.smiley * appear;
  const camAngle = Math.sin(t * mood.orbit) * 0.25;

  return (
    <ThreeCanvas width={width} height={height} camera={{position: [0, 0, 4.2], fov: 50}} style={{position: 'absolute'}}>
      <color attach="background" args={['#050507']} />
      <fog attach="fog" args={['#050507', 3, 9]} />
      <ambientLight intensity={0.25} />
      <pointLight position={[2, 3, 3]} color={mood.color} intensity={30 + 20 * Math.sin(t * 3)} />
      <group rotation={[0, camAngle, 0]} scale={pulse} position={[0, 0.5, 0]}>
        <Smiley intensity={intensity} />
      </group>
      <Dust amount={mood.dust} time={t} color={mood.color} />
    </ThreeCanvas>
  );
};
