import React, {useLayoutEffect} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {interpolate, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {Character} from './characters';
import {City, House, Living, Office, Street, Studio} from './envs';
import {Shot, V3} from './script';
import {useEp} from './ep';
import {STYLE} from './style';

const MOODS = {
  warm: {amb: '#ffd9a8', ambI: 0.75, dir: '#ffcf99', dirI: 1.8, sky: '#1a1226'},
  cold: {amb: '#9fb4d6', ambI: 0.7, dir: '#cfe0ff', dirI: 1.3, sky: '#0d1424'},
  red: {amb: '#6a2030', ambI: 0.55, dir: '#ff6b5a', dirI: 1.1, sky: '#12060a'},
  day: {amb: '#ffffff', ambI: 1.0, dir: '#fff4e0', dirI: 2.2, sky: '#8ec9ff'},
} as const;

const lerp3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

const Rig = ({shot, k, local, dur}: {shot: Shot; k: number; local: number; dur: number}) => {
  const {camera} = useThree();
  useLayoutEffect(() => {
    const p = lerp3(shot.cam[0].p, shot.cam[1].p, k);
    const l = lerp3(shot.cam[0].l, shot.cam[1].l, k);
    // planos com celular na tela: desce o personagem para o terço de baixo (o rosto não fica atrás do celular)
    if (shot.chat) {
      const dist = Math.hypot(p[0] - l[0], p[1] - l[1], p[2] - l[2]);
      l[1] += dist * 0.3;
    }
    // tremida nos planos de impacto + "zoom punch" no início de todo corte
    const hit = shot.sfx === 'hit' && local < 14 ? Math.exp(-local / 4) : 0;
    const sh = hit * 0.09;
    // câmera "na mão": micro-movimento constante dá vida ao plano
    const hx = Math.sin(local * 0.21) * 0.012 + Math.sin(local * 0.37) * 0.006;
    const hy = Math.cos(local * 0.17) * 0.01;
    camera.position.set(p[0] + hx + Math.sin(local * 5.1) * sh, p[1] + hy + Math.cos(local * 6.3) * sh, p[2]);
    camera.lookAt(...l);
    const punch = local < 9 ? (1 - local / 9) * 7 : 0;
    // corte interno: em planos longos a câmera "pula" para mais perto na metade (mais ritmo, sem mudar a cena)
    const half = Math.round(dur * 0.52);
    const cutIn = dur > 80 && !shot.poll && !shot.chat && local >= half;
    const cutPunch = cutIn && local - half < 7 ? (1 - (local - half) / 7) * 5 : 0;
    (camera as THREE.PerspectiveCamera).fov = (shot.fov ?? 55) - punch - (cutIn ? 11 : 0) - cutPunch;
    camera.updateProjectionMatrix();
  });
  return null;
};

export const World3D = () => {
  const frame = useCurrentFrame();
  const {width, height, fps} = useVideoConfig();
  const {ep, frames, starts} = useEp();
  const shots = ep.shots;
  let idx = shots.length - 1;
  for (let i = 0; i < shots.length; i++) if (frame < starts[i] + frames(shots[i])) { idx = i; break; }
  const shot = shots[idx];
  const local = frame - starts[idx];
  const dur = frames(shot);
  const k = interpolate(local, [0, dur], [0, 1], {easing: Easing.inOut(Easing.quad), extrapolateRight: 'clamp'});
  const verse = STYLE.verse;
  // "em dois": no estilo quadrinhos os personagens animam a 12 qps (a câmera continua fluida)
  const t = verse ? (Math.floor(frame / 2) * 2) / fps : frame / fps;
  const kChar = verse ? Math.min(1, (Math.floor(local / 2) * 2) / dur) : k;
  const m = MOODS[shot.mood ?? 'warm'];
  const night = shot.night ?? 0;
  const sky0 = night > 0.5 ? '#070a18' : shot.env === 'street' && night > 0.3 ? '#2a1830' : shot.env === 'street' || shot.env === 'city' ? '#8ec9ff' : m.sky;
  const sky = verse ? (night > 0.5 ? '#12063a' : night > 0.3 ? '#3a0f6e' : shot.env === 'street' || shot.env === 'city' ? '#ff5fa8' : '#2a0f52') : sky0;
  const dirI = m.dirI * (1 - night * 0.8);
  const ambI = m.ambI * (1 - night * 0.45);

  return (
    <ThreeCanvas width={width} height={height} shadows camera={{position: [0, 2, 6], fov: 55, near: 0.1, far: 220}} gl={{antialias: true}}>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, shot.env === 'city' ? 70 : 30, shot.env === 'city' ? 140 : 80]} />
      <Rig shot={shot} k={k} local={local} dur={dur} />
      <ambientLight color={night > 0.5 ? '#3a4a8a' : m.amb} intensity={ambI} />
      {verse && <directionalLight color="#ff2bd6" intensity={1.5} position={[-9, 5, 4]} />}
      {verse && <directionalLight color="#22e0ff" intensity={1.3} position={[9, 4, 3]} />}
      {verse && <hemisphereLight args={['#ffd0f5', '#3a2080', 1.0]} />}
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
      {shot.env === 'office' && <Office board={shot.envProps?.board} />}
      {shot.env === 'city' && <City night={night} />}
      {shot.env === 'house' && <House t={t} {...shot.envProps} />}
      {shot.env === 'street' && <Street crowd={shot.envProps?.crowd} t={t} night={night} />}
      {shot.env === 'city' && night > 0.5 && (
        <group position={[0, 17, -26]} rotation={[-0.08, 0, 0]} scale={1.7}>
          <mesh><torusGeometry args={[5, 0.35, 12, 48]} /><meshStandardMaterial color="#e01010" emissive="#ff0000" emissiveIntensity={1.6} /></mesh>
          <mesh position={[-1.7, 1.6, 0]}><circleGeometry args={[0.5, 16]} /><meshBasicMaterial color="#ff2020" /></mesh>
          <mesh position={[1.7, 1.6, 0]}><circleGeometry args={[0.5, 16]} /><meshBasicMaterial color="#ff2020" /></mesh>
          <mesh position={[0, -0.4, 0]} rotation={[0, 0, Math.PI]}><torusGeometry args={[2.6, 0.3, 10, 32, Math.PI]} /><meshStandardMaterial color="#e01010" emissive="#ff0000" emissiveIntensity={1.6} /></mesh>
          <pointLight color="#ff1a1a" intensity={160} distance={50} position={[0, 0, 6]} />
        </group>
      )}
      {shot.cast.map((a, i) => {
        const pos = a.to ? lerp3(a.pos, a.to, kChar) : a.pos;
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
