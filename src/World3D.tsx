import React, {useLayoutEffect} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Character} from './characters';
import {City, House, Living, Office, Street, Studio} from './envs';
import {Shot, V3, shotFrames, shots, starts} from './script';

const MOODS = {
  warm: {amb: '#ffd9a8', ambI: 0.75, dir: '#ffcf99', dirI: 1.8, sky: '#1a1226'},
  cold: {amb: '#9fb4d6', ambI: 0.7, dir: '#cfe0ff', dirI: 1.3, sky: '#0d1424'},
  red: {amb: '#6a2030', ambI: 0.55, dir: '#ff6b5a', dirI: 1.1, sky: '#12060a'},
  day: {amb: '#ffffff', ambI: 1.0, dir: '#fff4e0', dirI: 2.2, sky: '#8ec9ff'},
} as const;

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const Rig = ({shot, k, local}: {shot: Shot; k: number; local: number}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const p = lerp3(shot.cam[0].p, shot.cam[1].p, k);
    const l = lerp3(shot.cam[0].l, shot.cam[1].l, k);
    // tremida nos planos de impacto + "zoom punch" no início de todo corte
    const hit = shot.sfx === 'hit' && local < 14 ? Math.exp(-local / 4) : 0;
    const sh = hit * 0.09;
    camera.position.set(p[0] + Math.sin(local * 5.1) * sh, p[1] + Math.cos(local * 6.3) * sh, p[2]);
    camera.lookAt(...l);
    const punch = local < 9 ? (1 - local / 9) * 7 : 0;
    (camera as THREE.PerspectiveCamera).fov = (shot.fov ?? 55) - punch;
    camera.updateProjectionMatrix();
  });
  return null;
};

export const World3D = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  let idx = shots.length - 1;
  for (let i = 0; i < shots.length; i++) if (frame < starts[i] + shotFrames(shots[i])) { idx = i; break; }
  const shot = shots[idx];
  const local = frame - starts[idx];
  const dur = shotFrames(shot);
  const k = interpolate(local, [0, dur], [0, 1], {easing: Easing.inOut(Easing.quad), extrapolateRight: 'clamp'});
  const t = frame / fps;
  const m = MOODS[shot.mood ?? 'warm'];
  const night = shot.night ?? 0;
  const sky = night > 0.5 ? '#070a18' : shot.env === 'street' && night > 0.3 ? '#2a1830' : shot.env === 'street' || shot.env === 'city' ? '#8ec9ff' : m.sky;
  const dirI = m.dirI * (1 - night * 0.8);
  const ambI = m.ambI * (1 - night * 0.45);

  return (
    <ThreeCanvas width={width} height={height} shadows camera={{position: [0, 2, 6], fov: 55, near: 0.1, far: 220}} gl={{antialias: true}}>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, shot.env === 'city' ? 70 : 30, shot.env === 'city' ? 140 : 80]} />
      <Rig shot={shot} k={k} local={local} />
      <ambientLight color={night > 0.5 ? '#3a4a8a' : m.amb} intensity={ambI} />
      <directionalLight
        color={night > 0.5 ? '#6f86d8' : m.dir}
        intensity={dirI}
        position={[8, 16, 10]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />
      {shot.env === 'studio' && <hemisphereLight args={['#ffe9c8', '#3a2a44', 0.9]} />}
      {shot.env === 'studio' && <spotLight position={[0, 9, 4]} angle={0.55} penumbra={0.6} intensity={shot.mood === 'cold' ? 180 : 260} color={shot.mood === 'cold' ? '#bcd0ff' : '#fff0c8'} castShadow target-position={[0, 0, 0]} />}
      {shot.env === 'studio' && <Studio crowd={shot.envProps?.crowd} cry={shot.envProps?.cry} t={t} />}
      {shot.env === 'living' && <Living />}
      {shot.env === 'office' && <Office />}
      {shot.env === 'city' && <City night={night} />}
      {shot.env === 'house' && <House t={t} />}
      {shot.env === 'street' && <Street crowd={shot.envProps?.crowd} t={t} night={night} />}
      {shot.env === 'city' && (
        <group position={[0, 17, -26]} rotation={[-0.08, 0, 0]} scale={1.7}>
          <mesh><torusGeometry args={[5, 0.35, 12, 48]} /><meshStandardMaterial color="#e01010" emissive="#ff0000" emissiveIntensity={1.6} /></mesh>
          <mesh position={[-1.7, 1.6, 0]}><circleGeometry args={[0.5, 16]} /><meshBasicMaterial color="#ff2020" /></mesh>
          <mesh position={[1.7, 1.6, 0]}><circleGeometry args={[0.5, 16]} /><meshBasicMaterial color="#ff2020" /></mesh>
          <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI]}><torusGeometry args={[2.6, 0.3, 10, 32, Math.PI]} /><meshStandardMaterial color="#e01010" emissive="#ff0000" emissiveIntensity={1.6} /></mesh>
          <pointLight color="#ff1a1a" intensity={160} distance={50} position={[0, 0, 6]} />
        </group>
      )}
      {shot.cast.map((a, i) => {
        const pos = a.to ? lerp3(a.pos, a.to, k) : a.pos;
        return (
          <group key={i}>
            <Character a={{...a, pos}} t={t} />
            {a.who === 'redjohn' && <pointLight color="#ff2a2a" intensity={5} distance={6} position={[pos[0], 2.2, pos[2] + 2]} />}
          </group>
        );
      })}
    </ThreeCanvas>
  );
};
