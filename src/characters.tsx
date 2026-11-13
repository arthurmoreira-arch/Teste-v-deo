import React from 'react';
import * as THREE from 'three';
import {Actor, Face, Pose, Who} from './script';
import {STYLE} from './style';

// degradê de 3 tons para o sombreamento chapado (cel shading)
let _grad: THREE.DataTexture | null = null;
const toonGrad = () => {
  if (!_grad) {
    _grad = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 165, 165, 165, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat);
    _grad.minFilter = _grad.magFilter = THREE.NearestFilter;
    _grad.needsUpdate = true;
  }
  return _grad;
};

const BLACK = '#0b0b0f';

type PartProps = {
  kind: 'sphere' | 'capsule' | 'box' | 'cyl';
  args: number[];
  color: string;
  pos?: [number, number, number];
  rot?: [number, number, number];
  scale?: [number, number, number];
  outline?: number; // fator de escala do contorno
  emissive?: string;
  emissiveIntensity?: number;
};

const geo = (kind: PartProps['kind'], a: number[]) => {
  switch (kind) {
    case 'sphere':
      return <sphereGeometry args={[a[0], 20, 16]} />;
    case 'capsule':
      return <capsuleGeometry args={[a[0], a[1], 6, 14]} />;
    case 'box':
      return <boxGeometry args={[a[0], a[1], a[2]]} />;
    case 'cyl':
      return <cylinderGeometry args={[a[0], a[1], a[2], 16]} />;
  }
};

/** Peça com contorno preto (casco invertido) — dá o look "cartoon grosso" do vídeo de referência. */
export const Part = ({kind, args, color, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1], outline = 1.09, emissive, emissiveIntensity}: PartProps) => (
  <group position={pos} rotation={rot} scale={scale}>
    <mesh castShadow receiveShadow>
      {geo(kind, args)}
      {STYLE.verse ? (
        <meshToonMaterial color={color} gradientMap={toonGrad()} emissive={emissive ?? '#000000'} emissiveIntensity={emissiveIntensity ?? 0} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.9} flatShading={false} emissive={emissive ?? '#000000'} emissiveIntensity={emissiveIntensity ?? 0} />
      )}
    </mesh>
    {outline > 1 && (
      <mesh scale={STYLE.verse ? [outline * 1.035, outline * 1.035, outline * 1.035] : [outline, outline, outline]}>
        {geo(kind, args)}
        <meshBasicMaterial color={BLACK} side={THREE.BackSide} />
      </mesh>
    )}
  </group>
);

type Look = {
  skin: string;
  hair: 'jane' | 'short' | 'long' | 'pigtails' | 'none';
  hairColor: string;
  top: string; // torso
  sleeves: string;
  pants: string;
  tie?: string;
  dress?: boolean;
  scale: number;
};

const LOOKS: Record<Exclude<Who, 'mannequin' | 'redjohn'>, Look> = {
  jane: {skin: '#f1b98c', hair: 'jane', hairColor: '#e7c04a', top: '#2c3c5a', sleeves: '#4a5d84', pants: '#37425d', tie: '#b3121b', scale: 1},
  angela: {skin: '#f1b98c', hair: 'long', hairColor: '#6a4025', top: '#d4506f', sleeves: '#d4506f', pants: '#d4506f', dress: true, scale: 0.95},
  charlotte: {skin: '#f1b98c', hair: 'pigtails', hairColor: '#6a4025', top: '#f1c04b', sleeves: '#f1c04b', pants: '#f1c04b', dress: true, scale: 0.55},
  voce: {skin: '#e7a65e', hair: 'short', hairColor: '#1c120c', top: '#e8392a', sleeves: '#e8392a', pants: '#2a4a9a', scale: 1},
  mae: {skin: '#8a5530', hair: 'short', hairColor: '#120c08', top: '#8e4fc4', sleeves: '#8e4fc4', pants: '#8e4fc4', dress: true, scale: 0.96},
  chefe: {skin: '#f0c09a', hair: 'short', hairColor: '#8d8d8d', top: '#3a3f4a', sleeves: '#3a3f4a', pants: '#2a2e36', tie: '#2a6fd1', scale: 1.04},
  lisbon: {skin: '#ecb48d', hair: 'long', hairColor: '#2a1a12', top: '#5d5d68', sleeves: '#5d5d68', pants: '#24242c', scale: 0.97},
};

const Eye = ({x, look, face, blink = 1}: {x: number; look: number; face: Face; blink?: number}) => (
  <group position={[x, 0.05, 0.3]} scale={[1, blink, 1]}>
    <Part kind="sphere" args={[0.105]} color="#ffffff" scale={[1, 1.25, 0.5]} outline={1.12} />
    <Part kind="sphere" args={[0.05]} color={BLACK} pos={[look * 0.03, 0, 0.05]} scale={[1, 1.2, 0.6]} outline={1} />
  </group>
);

const Face_ = ({face, redjohn, t, seed = 0}: {face: Face; redjohn?: boolean; t: number; seed?: number}) => {
  if (redjohn) {
    // Smiley pintado com sangue (assinatura do Red John): anel, dois olhos, sorriso largo e pingos
    const blood = <meshStandardMaterial color="#8f0a0e" roughness={0.35} emissive="#5a0000" emissiveIntensity={0.5} />;
    const drip = (x: number, y: number, len: number) => (
      <mesh key={`${x}${y}`} position={[x, y - len / 2, 0.275]}>
        <capsuleGeometry args={[0.012, len, 4, 8]} />
        {blood}
      </mesh>
    );
    return (
      <group position={[0, 0, 0.03]}>
        <mesh position={[0, 0, 0.26]}>
          <torusGeometry args={[0.235, 0.026, 10, 40]} />
          {blood}
        </mesh>
        <mesh position={[-0.085, 0.07, 0.31]} scale={[0.8, 1.35, 0.5]}>
          <sphereGeometry args={[0.04, 14, 12]} />
          {blood}
        </mesh>
        <mesh position={[0.085, 0.07, 0.31]} scale={[0.8, 1.35, 0.5]}>
          <sphereGeometry args={[0.04, 14, 12]} />
          {blood}
        </mesh>
        <mesh position={[0, -0.02, 0.29]} rotation={[0, 0, Math.PI * 1.5 - Math.PI * 0.425]}>
          <torusGeometry args={[0.135, 0.022, 10, 28, Math.PI * 0.85]} />
          {blood}
        </mesh>
        {drip(-0.085, 0.03, 0.09)}
        {drip(-0.17, -0.1, 0.12)}
        {drip(0.19, -0.1, 0.07)}
        {drip(0.02, -0.2, 0.1)}
      </group>
    );
  }
  const cyc = (t + seed * 1.37) % 3.6;
  const blink = face === 'shock' ? 1 : cyc < 0.12 ? 0.12 : 1;
  const browY = face === 'shock' ? 0.2 : 0.17;
  const browTilt = face === 'sad' ? 0.35 : face === 'angry' ? -0.4 : face === 'smirk' ? -0.12 : 0;
  const talkOpen = face === 'talk' ? 0.015 + Math.abs(Math.sin(t * 11)) * 0.045 : 0;
  return (
    <group>
      <Eye x={-0.13} look={face === 'shock' ? 0 : 0.6} face={face} blink={blink} />
      <Eye x={0.13} look={face === 'shock' ? 0 : 0.6} face={face} blink={blink} />
      <Part kind="box" args={[0.16, 0.035, 0.03]} color={BLACK} pos={[-0.13, browY + 0.03, 0.32]} rot={[0, 0, browTilt]} outline={1} />
      <Part kind="box" args={[0.16, 0.035, 0.03]} color={BLACK} pos={[0.13, browY + 0.03, 0.32]} rot={[0, 0, -browTilt]} outline={1} />
      {face === 'shock' ? (
        <Part kind="sphere" args={[0.045]} color="#3a0d0d" pos={[0, -0.16, 0.31]} scale={[1, 1.4, 0.5]} outline={1} />
      ) : face === 'talk' ? (
        <Part kind="sphere" args={[0.05]} color="#3a0d0d" pos={[0, -0.15, 0.31]} scale={[1.2, 0.3 + talkOpen * 14, 0.5]} outline={1} />
      ) : face === 'sad' ? (
        <Part kind="box" args={[0.1, 0.025, 0.03]} color={BLACK} pos={[0, -0.17, 0.31]} rot={[0, 0, 0.0]} outline={1} />
      ) : face === 'smirk' ? (
        <Part kind="box" args={[0.13, 0.03, 0.03]} color={BLACK} pos={[0.02, -0.15, 0.31]} rot={[0, 0, 0.22]} outline={1} />
      ) : (
        <Part kind="box" args={[0.1, 0.025, 0.03]} color={BLACK} pos={[0, -0.15, 0.31]} outline={1} />
      )}
    </group>
  );
};

const Hair = ({type, color}: {type: Look['hair']; color: string}) => {
  if (type === 'none') return null;
  if (type === 'jane') {
    // cabelo loiro cacheado (várias esferas)
    const curls: [number, number, number, number][] = [
      [0, 0.28, -0.02, 0.26], [-0.2, 0.22, 0.0, 0.2], [0.2, 0.22, 0.0, 0.2], [-0.22, 0.05, -0.12, 0.2],
      [0.22, 0.05, -0.12, 0.2], [0, 0.12, -0.2, 0.26], [-0.1, 0.34, 0.1, 0.16], [0.1, 0.34, 0.1, 0.16], [0, 0.3, 0.16, 0.14],
    ];
    return (
      <group>
        {curls.map((c, i) => (
          <Part key={i} kind="sphere" args={[c[3]]} color={color} pos={[c[0], c[1], c[2]]} outline={1.12} />
        ))}
      </group>
    );
  }
  return (
    <group>
      <Part kind="sphere" args={[0.37]} color={color} pos={[0, 0.1, -0.06]} scale={[1, 1, 0.95]} outline={1.07} />
      {type === 'long' && <Part kind="box" args={[0.7, 0.7, 0.2]} color={color} pos={[0, -0.18, -0.2]} outline={1.07} />}
      {type === 'pigtails' && (
        <>
          <Part kind="sphere" args={[0.13]} color={color} pos={[-0.38, -0.05, 0]} outline={1.12} />
          <Part kind="sphere" args={[0.13]} color={color} pos={[0.38, -0.05, 0]} outline={1.12} />
        </>
      )}
    </group>
  );
};

type Arms = {x: number; z: number};
const armsFor = (pose: Pose, t: number, side: 1 | -1): Arms => {
  switch (pose) {
    case 'zombie':
      return {x: -1.45 + Math.sin(t * 3 + side) * 0.08, z: side * 0.12};
    case 'cry':
      return {x: -2.6 + Math.sin(t * 9 + side) * 0.05, z: side * -0.5};
    case 'clap':
      return {x: -1.2, z: side * (0.25 - Math.abs(Math.sin(t * 7)) * 0.25)};
    case 'walk':
      return {x: Math.sin(t * 5 + (side === 1 ? 0 : Math.PI)) * 0.7, z: side * 0.1};
    case 'sit':
      return {x: -0.2, z: side * 0.08};
    case 'phone':
      return {x: -1.0 + Math.sin(t * 2 + side) * 0.03, z: side * -0.42};
    default:
      return {x: Math.sin(t * 1.4 + side) * 0.06, z: side * 0.1};
  }
};

export const Character = ({a, t}: {a: Actor; t: number}) => {
  const who = a.who;
  const pose = a.pose ?? 'stand';
  const face = a.face ?? 'neutral';
  const isMan = who === 'mannequin';
  const isRJ = who === 'redjohn';
  const look: Look = isMan
    ? {skin: '#e8ebf0', hair: 'none', hairColor: '#fff', top: '#e8ebf0', sleeves: '#e8ebf0', pants: '#e8ebf0', scale: 1}
    : isRJ
      ? {skin: '#e9e3d6', hair: 'none', hairColor: '#000', top: '#101016', sleeves: '#101016', pants: '#101016', scale: 1.05}
      : LOOKS[who as keyof typeof LOOKS];
  const s = (a.scale ?? 1) * look.scale;
  const sit = pose === 'sit';
  const walk = pose === 'walk';
  const bob = walk ? Math.abs(Math.sin(t * 5)) * 0.06 : Math.sin(t * 2) * 0.012;
  const legSwing = walk ? Math.sin(t * 5) * 0.55 : 0;
  const L = armsFor(pose, t, 1);
  const R = armsFor(pose, t, -1);
  const headTilt = pose === 'cry' ? 0.15 : face === 'sad' ? 0.12 : 0;
  const hairColor = look.hairColor;

  return (
    <group position={a.pos} rotation={[0, a.rotY ?? 0, 0]} scale={[s, s, s]}>
      <group position={[0, bob, 0]}>
        {/* pernas */}
        {!sit && (
          <>
            <group position={[-0.13, 0.62, 0]} rotation={[legSwing, 0, 0]}>
              <Part kind="capsule" args={[0.12, 0.38]} color={look.pants} pos={[0, -0.3, 0]} />
            </group>
            <group position={[0.13, 0.62, 0]} rotation={[-legSwing, 0, 0]}>
              <Part kind="capsule" args={[0.12, 0.38]} color={look.pants} pos={[0, -0.3, 0]} />
            </group>
          </>
        )}
        {/* torso */}
        <Part kind="capsule" args={[0.27, 0.42]} color={look.top} pos={[0, 0.98, 0]} scale={[1.05, 1, 0.78]} />
        {look.dress && <Part kind="cyl" args={[0.3, 0.5, 0.45]} color={look.pants} pos={[0, 0.62, 0]} />}
        {look.tie && <Part kind="box" args={[0.07, 0.34, 0.03]} color={look.tie} pos={[0, 1.0, 0.22]} outline={1} />}
        {/* braços */}
        <group position={[0.36, 1.16, 0]} rotation={[L.x, 0, -L.z]}>
          <Part kind="capsule" args={[0.095, 0.38]} color={look.sleeves} pos={[0, -0.26, 0]} />
        </group>
        <group position={[-0.36, 1.16, 0]} rotation={[R.x, 0, -R.z]}>
          <Part kind="capsule" args={[0.095, 0.38]} color={look.sleeves} pos={[0, -0.26, 0]} />
        </group>
        {pose === 'phone' && (
          <group position={[0, 1.02, 0.44]} rotation={[-0.5, 0, 0]}>
            <Part kind="box" args={[0.2, 0.36, 0.03]} color="#0c0c12" outline={1.12} />
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[0.17, 0.32]} />
              <meshBasicMaterial color="#9ff3ff" />
            </mesh>
            <pointLight color="#7fe9ff" intensity={1.6} distance={2.2} position={[0, 0.2, 0.3]} />
          </group>
        )}
        {/* cabeça */}
        <group position={[0, 1.7, 0]} rotation={[headTilt, Math.sin(t * 0.9) * 0.06, 0]}>
          <Part kind="sphere" args={[0.34]} color={look.skin} scale={[1, 1.03, 1]} outline={1.07} />
          {!isMan && <Face_ face={face} redjohn={isRJ} t={t} seed={who.length * 0.71 + (a.scale ?? 1)} />}
          <Hair type={look.hair} color={hairColor} />
        </group>
      </group>
    </group>
  );
};
