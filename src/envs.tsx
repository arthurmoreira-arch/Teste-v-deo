import React, {useMemo} from 'react';
import * as THREE from 'three';
import {Part, Character} from './characters';
import {Actor} from './script';

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const useCanvasTex = (draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, w: number, h: number, repeat?: [number, number]) =>
  useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    draw(cv.getContext('2d')!, w, h);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    if (repeat) t.repeat.set(repeat[0], repeat[1]);
    return t;
  }, []);

const Box = ({p, s, c, e, ei = 0, r}: {p: [number, number, number]; s: [number, number, number]; c: string; e?: string; ei?: number; r?: [number, number, number]}) => (
  <mesh position={p} scale={s} rotation={r} castShadow receiveShadow>
    <boxGeometry />
    <meshStandardMaterial color={c} roughness={0.95} emissive={e ?? '#000'} emissiveIntensity={ei} />
  </mesh>
);

const Tree = ({p, s = 1}: {p: [number, number, number]; s?: number}) => (
  <group position={p} scale={s}>
    <Part kind="cyl" args={[0.14, 0.2, 1.2]} color="#6b4a2e" pos={[0, 0.6, 0]} outline={1.12} />
    <mesh position={[0, 1.9, 0]} castShadow>
      <icosahedronGeometry args={[1.0, 0]} />
      <meshStandardMaterial color="#3fae3a" flatShading roughness={1} />
    </mesh>
    <mesh position={[0, 1.9, 0]} scale={1.06}>
      <icosahedronGeometry args={[1.0, 0]} />
      <meshBasicMaterial color="#0b0b0f" side={THREE.BackSide} />
    </mesh>
  </group>
);

const Lamp = ({p}: {p: [number, number, number]}) => (
  <group position={p}>
    <Box p={[0, 2.2, 0]} s={[0.14, 4.4, 0.14]} c="#9aa0a6" />
    <Box p={[0.5, 4.3, 0]} s={[1.1, 0.12, 0.12]} c="#9aa0a6" />
  </group>
);

// ---------------------------------------------------------------- crowd
const CrowdImpl = ({n, area, pose, t, rotY, skip}: {n: number; area: {x: [number, number]; z: [number, number]}; pose: Actor['pose']; t: number; rotY: number; skip?: number}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      let x = area.x[0] + rnd(i + 3) * (area.x[1] - area.x[0]);
      if (skip && Math.abs(x) < skip) x = Math.sign(x || 1) * (skip + rnd(i) * 2);
      const z = area.z[0] + rnd(i + 91) * (area.z[1] - area.z[0]);
      return <Character key={i} a={{who: 'mannequin', pos: [x, 0, z], rotY: rotY + (rnd(i + 7) - 0.5) * 0.6, pose, scale: 0.92 + rnd(i + 5) * 0.2}} t={t + i * 0.37} />;
    })}
  </>
);

// ---------------------------------------------------------------- studio
export const Studio = ({crowd, cry, t}: {crowd?: number; cry?: boolean; t: number}) => (
  <group>
    <Box p={[0, -0.15, 0]} s={[34, 0.3, 40]} c="#2b2230" />
    <Box p={[0, 0.02, 0]} s={[7, 0.06, 5]} c="#6a3f2a" /> {/* palco */}
    <Box p={[0, 4, -3.6]} s={[18, 8, 0.4]} c="#33285e" />
    <Box p={[0, 4, -3.35]} s={[7.4, 3.0, 0.1]} c="#0b0b0f" />
    <Box p={[0, 4, -3.28]} s={[7.0, 2.6, 0.1]} c="#59a9ff" e="#59a9ff" ei={0.9} />
    {[-7.2, 7.2].map((x) => (
      <Box key={x} p={[x, 3.5, -3.1]} s={[2.6, 7, 0.6]} c="#8e1520" />
    ))}
    {[-8, -6.2, 6.2, 8].map((x) => (
      <Box key={x} p={[x, 3.5, -2.75]} s={[0.4, 7, 0.4]} c="#6d0f18" />
    ))}
    <Box p={[0, 0.5, -1.6]} s={[2.4, 1.0, 0.8]} c="#7a2a2a" /> {/* poltrona ao fundo */}
    {crowd ? (
      <CrowdImpl n={22} area={{x: [-6.5, 6.5], z: [5, 10]}} pose={cry ? 'cry' : 'clap'} t={t} rotY={Math.PI} />
    ) : null}
  </group>
);

// ---------------------------------------------------------------- living room
export const Living = () => {
  const wall = useCanvasTex((c, w, h) => {
    c.fillStyle = '#d9c7a1';
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(160,130,90,0.25)';
    for (let x = 0; x < w; x += 32) c.fillRect(x, 0, 6, h);
  }, 128, 128, [6, 3]);
  return (
    <group>
      <Box p={[0, -0.1, 0]} s={[14, 0.2, 14]} c="#80513b" />
      <mesh position={[0, 2.2, -3]} receiveShadow>
        <planeGeometry args={[14, 4.4]} />
        <meshStandardMaterial map={wall} roughness={1} />
      </mesh>
      <Box p={[0, 0.01, -0.5]} s={[5, 0.03, 3.6]} c="#5b86c9" /> {/* tapete */}
      <Box p={[0, 0.22, -1.7]} s={[3.8, 0.45, 1.1]} c="#a23b3b" />
      <Box p={[0, 0.85, -2.35]} s={[3.8, 1.3, 0.35]} c="#8c2f2f" />
      <Box p={[-1.95, 0.55, -1.8]} s={[0.35, 0.8, 1.2]} c="#8c2f2f" />
      <Box p={[1.95, 0.55, -1.8]} s={[0.35, 0.8, 1.2]} c="#8c2f2f" />
      <Box p={[-3.6, 2.2, -2.95]} s={[1.8, 1.6, 0.1]} c="#16203a" e="#3b5fbf" ei={0.5} />
      <Box p={[2.8, 2.5, -2.95]} s={[0.9, 1.1, 0.08]} c="#e8c27a" />
      <Box p={[3.0, 0.7, -2.3]} s={[0.15, 1.4, 0.15]} c="#4a3a2a" />
      <mesh position={[3.0, 1.5, -2.3]}>
        <sphereGeometry args={[0.35, 16, 12]} />
        <meshStandardMaterial color="#ffe3a8" emissive="#ffcf80" emissiveIntensity={1.6} />
      </mesh>
      <pointLight position={[3.0, 1.6, -2.0]} color="#ffbb66" intensity={14} distance={9} />
    </group>
  );
};

// ---------------------------------------------------------------- office
const BoardFull = () => {
  const pins = useMemo(() => Array.from({length: 22}).map((_, i) => ({x: -2.3 + rnd(i + 40) * 4.6, y: 1.35 + rnd(i + 80) * 2.3, c: ['#f2f2f2', '#e8e0c8', '#cfd8e8'][i % 3], w: 0.35 + rnd(i) * 0.25})), []);
  return (
    <group position={[0, 0, -3.88]}>
      {pins.map((p, i) => (
        <group key={i}>
          <Box p={[p.x, p.y, 0]} s={[p.w, p.w * 1.2, 0.02]} c={p.c} />
          <mesh position={[p.x, p.y + p.w * 0.5, 0.03]}><sphereGeometry args={[0.04, 8, 6]} /><meshBasicMaterial color="#d01010" /></mesh>
        </group>
      ))}
      {pins.slice(0, 14).map((p, i) => {
        const q = pins[(i * 5 + 3) % pins.length];
        const dx = q.x - p.x, dy = q.y - p.y;
        const len = Math.hypot(dx, dy);
        return (
          <mesh key={`s${i}`} position={[(p.x + q.x) / 2, (p.y + q.y) / 2 + 0.15, 0.04]} rotation={[0, 0, Math.atan2(dy, dx)]}>
            <boxGeometry args={[len, 0.018, 0.01]} />
            <meshBasicMaterial color="#c00000" />
          </mesh>
        );
      })}
      <group position={[0, 2.5, 0.06]}>
        <DrawnSmiley r={0.42} flick={0.6} />
      </group>
    </group>
  );
};

export const Office = ({board}: {board?: 'empty' | 'full'}) => (
  <group>
    {board === 'full' && <BoardFull />}
    <Box p={[0, -0.1, 0]} s={[16, 0.2, 14]} c="#858c96" />
    <Box p={[0, 2.5, -4.2]} s={[16, 5, 0.3]} c="#c3ccd8" />
    <Box p={[0, 2.5, -4.0]} s={[5.6, 3.0, 0.1]} c="#5b4630" />
    <Box p={[0, 2.5, -3.94]} s={[5.3, 2.7, 0.06]} c="#b28b57" /> {/* mural de casos VAZIO */}
    <Box p={[-6, 2.6, -4.0]} s={[2.4, 2.2, 0.1]} c="#101830" e="#2a3f7a" ei={0.6} />
    <Box p={[6, 2.6, -4.0]} s={[2.4, 2.2, 0.1]} c="#101830" e="#2a3f7a" ei={0.6} />
    <Box p={[0, 0.42, -0.8]} s={[2.8, 0.84, 1.1]} c="#6e4f35" />
    <Box p={[0.7, 1.05, -0.9]} s={[0.7, 0.45, 0.06]} c="#111" e="#335" ei={0.3} />
    <Box p={[-4, 0.42, -2.4]} s={[2.4, 0.84, 1.0]} c="#6e4f35" />
    <Box p={[4, 0.42, -2.4]} s={[2.4, 0.84, 1.0]} c="#6e4f35" />
    <pointLight position={[0, 4.2, -1]} color="#bcd0ff" intensity={30} distance={14} />
  </group>
);

// ---------------------------------------------------------------- city
const COLORS = ['#e8e1d0', '#d6d9e6', '#e9d9b8', '#c9d6df', '#efe4d1', '#cdd5c5'];
export const City = ({night}: {night: number}) => {
  const win = useCanvasTex((c, w, h) => {
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, w, h);
    for (let y = 6; y < h - 6; y += 16)
      for (let x = 6; x < w - 6; x += 16) {
        c.fillStyle = rnd(x * 7 + y * 13) > 0.35 ? '#2a3550' : '#d8d2a0';
        c.fillRect(x, y, 9, 10);
      }
  }, 128, 128);
  const glow = useCanvasTex((c, w, h) => {
    c.fillStyle = '#000';
    c.fillRect(0, 0, w, h);
    for (let y = 6; y < h - 6; y += 16)
      for (let x = 6; x < w - 6; x += 16) {
        if (rnd(x * 7 + y * 13) <= 0.35) {
          c.fillStyle = rnd(x + y * 3) > 0.5 ? '#ffd88a' : '#ffefc0';
          c.fillRect(x, y, 9, 10);
        }
      }
  }, 128, 128);

  const blds = useMemo(() => {
    const out: {x: number; z: number; w: number; d: number; h: number; c: string; i: number}[] = [];
    let i = 0;
    for (let bx = -5; bx <= 5; bx++)
      for (let bz = -6; bz <= 4; bz++) {
        const park = rnd(bx * 31 + bz * 17) > 0.86;
        if (park) continue;
        for (let k = 0; k < 4; k++) {
          const ox = (k % 2) * 3.1 - 1.55;
          const oz = Math.floor(k / 2) * 3.1 - 1.55;
          out.push({x: bx * 9 + ox, z: bz * 9 + oz, w: 2.7, d: 2.7, h: 4 + rnd(++i) * 14 * (1 - Math.min(0.7, Math.hypot(bx, bz) / 9)), c: COLORS[Math.floor(rnd(i + 5) * COLORS.length)], i});
        }
      }
    return out;
  }, []);

  return (
    <group>
      <Box p={[0, -0.1, -10]} s={[140, 0.2, 120]} c={night > 0.5 ? '#2b2f3a' : '#4a4e57'} />
      {blds.map((b) => (
        <mesh key={b.i} position={[b.x, b.h / 2, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.c} map={win} emissiveMap={glow} emissive={night > 0.5 ? '#ffffff' : '#000000'} emissiveIntensity={night > 0.5 ? 1.2 : 0} roughness={1} />
        </mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- house (night, red window)
const DrawnSmiley = ({r = 0.55, flick = 1}: {r?: number; flick?: number}) => (
  <group>
    <mesh>
      <torusGeometry args={[r, r * 0.08, 8, 32]} />
      <meshStandardMaterial color="#c0090f" emissive="#ff0000" emissiveIntensity={flick} />
    </mesh>
    <mesh position={[-r * 0.36, r * 0.3, 0]} scale={[0.8, 1.3, 1]}><circleGeometry args={[r * 0.11, 12]} /><meshBasicMaterial color="#d40f15" /></mesh>
    <mesh position={[r * 0.36, r * 0.3, 0]} scale={[0.8, 1.3, 1]}><circleGeometry args={[r * 0.11, 12]} /><meshBasicMaterial color="#d40f15" /></mesh>
    <mesh position={[0, -r * 0.05, 0]} rotation={[0, 0, Math.PI * 1.5 - Math.PI * 0.425]}>
      <torusGeometry args={[r * 0.52, r * 0.07, 8, 24, Math.PI * 0.85]} />
      <meshStandardMaterial color="#c0090f" emissive="#ff0000" emissiveIntensity={flick} />
    </mesh>
    {[-0.6, -0.2, 0.45].map((x, i) => (
      <mesh key={i} position={[x * r, -r * (0.75 + i * 0.08), 0]}>
        <boxGeometry args={[r * 0.05, r * (0.3 + i * 0.12), 0.01]} />
        <meshBasicMaterial color="#b00810" />
      </mesh>
    ))}
  </group>
);

type HouseProps = {t: number; windowSmiley?: boolean; doorSmiley?: boolean; tape?: boolean; warm?: boolean};
export const House = ({t, windowSmiley, doorSmiley, tape, warm}: HouseProps) => {
  const flick = 1.2 + Math.sin(t * 9) * 0.25 + (Math.sin(t * 23) > 0.9 ? -0.6 : 0);
  return (
    <group>
      <Box p={[0, -0.1, 0]} s={[60, 0.2, 60]} c="#15281d" />
      <Box p={[0, 2, 0]} s={[6, 4, 5]} c="#cfc6b5" />
      <mesh position={[0, 4.9, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.85]} castShadow>
        <coneGeometry args={[4.9, 1.8, 4]} />
        <meshStandardMaterial color="#4e2327" roughness={1} />
      </mesh>
      <Box p={[1.6, 1.1, 2.52]} s={[1.1, 2.2, 0.08]} c="#3b2616" />
      <Box p={[-1.6, 2.4, 2.52]} s={[1.5, 1.5, 0.08]} c="#0b0b0f" />
      {windowSmiley && (
        <group position={[-1.6, 2.4, 2.6]}>
          <DrawnSmiley r={0.55} flick={flick} />
        </group>
      )}
      {windowSmiley && <pointLight position={[-1.6, 2.4, 5.5]} color="#ff1a1a" intensity={9 * flick} distance={9} />}
      {warm && !windowSmiley && <Box p={[-1.6, 2.4, 2.57]} s={[1.3, 1.3, 0.04]} c="#ffcf7a" e="#ffb54a" ei={1.4} />}
      {warm && <pointLight position={[-1.6, 2.4, 4]} color="#ffb54a" intensity={6} distance={8} />}
      {/* luz de varanda: ilumina quem está na frente da porta */}
      {warm && <pointLight position={[1.6, 3.4, 5.2]} color="#ffe2b0" intensity={55} distance={16} />}
      {warm && <pointLight position={[3.5, 2.2, 9.5]} color="#8fa8ff" intensity={30} distance={14} />}
      {warm && <mesh position={[1.6, 3.3, 2.7]}><sphereGeometry args={[0.14, 10, 8]} /><meshBasicMaterial color="#fff1c8" /></mesh>}
      {doorSmiley && (
        <group position={[1.6, 1.5, 2.58]}>
          <DrawnSmiley r={0.38} flick={0.9} />
          <pointLight position={[0, 0, 1.5]} color="#ff2a2a" intensity={5} distance={5} />
        </group>
      )}
      {tape && (
        <group>
          {[-3.2, 3.2].map((x) => <Box key={x} p={[x, 0.6, 5]} s={[0.12, 1.2, 0.12]} c="#888" />)}
          <Box p={[0, 1.0, 5]} s={[6.4, 0.16, 0.03]} c="#ffd400" e="#5a4a00" ei={0.4} />
          <Box p={[0, 0.7, 5.02]} s={[6.4, 0.16, 0.03]} c="#ffd400" e="#5a4a00" ei={0.4} r={[0, 0, 0.04]} />
          {[-1.2, 1.2].map((x) => (
            <mesh key={x} position={[x, 3.2, 7]} >
              <sphereGeometry args={[0.12, 10, 8]} />
              <meshBasicMaterial color={Math.sin(t * 8 + x) > 0 ? '#ff2020' : '#2050ff'} />
            </mesh>
          ))}
          <pointLight position={[0, 3, 7]} color={Math.sin(t * 8) > 0 ? '#ff2020' : '#2050ff'} intensity={14} distance={14} />
        </group>
      )}
      <Box p={[1.6, 2.4, 2.52]} s={[0, 0, 0]} c="#000" />
      <Tree p={[-5.5, 0, 2]} s={1.5} />
      <Tree p={[6, 0, 3]} s={1.3} />
      <Tree p={[-9, 0, -4]} s={1.6} />
      <mesh position={[18, 26, -35]}>
        <sphereGeometry args={[2.2, 20, 16]} />
        <meshBasicMaterial color="#e9eefc" />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- street (cobblestone)
const FACADE = ['#d98fb6', '#4fb3a9', '#e3c24f', '#4a6fd1', '#b79be0', '#e0804a'];
export const Street = ({crowd, t, night}: {crowd?: number; t: number; night: number}) => {
  const cobble = useCanvasTex((c, w, h) => {
    c.fillStyle = '#4b4560';
    c.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 16)
      for (let x = (y / 16) % 2 ? 0 : -16; x < w; x += 32) {
        c.fillStyle = `hsl(255, 14%, ${34 + rnd(x * 3 + y * 7) * 14}%)`;
        c.fillRect(x + 2, y + 2, 28, 12);
      }
  }, 256, 256, [18, 40]);
  return (
    <group>
      <mesh position={[0, 0, -20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 90]} />
        <meshStandardMaterial map={cobble} roughness={1} />
      </mesh>
      {[-1, 1].map((side) =>
        Array.from({length: 10}).map((_, i) => {
          const h = 5 + rnd(i * 3 + side) * 4;
          const z = 6 - i * 4.6;
          const c = FACADE[Math.floor(rnd(i + side * 9) * FACADE.length)];
          return (
            <group key={`${side}-${i}`}>
              <Box p={[side * 8, h / 2, z]} s={[4, h, 4.4]} c={c} />
              <Box p={[side * 5.9, 1.9, z]} s={[0.1, 1.4, 1.1]} c="#1c2a5a" e="#ffd58a" ei={night > 0.4 ? 0.9 : 0.1} />
              <Box p={[side * 5.9, h - 1.4, z]} s={[0.1, 1.2, 1.0]} c="#1c2a5a" e="#ffd58a" ei={night > 0.4 ? 0.9 : 0.1} />
              <Box p={[side * 5.55, 3.2, z]} s={[0.9, 0.12, 2]} c={i % 2 ? '#e8e8e8' : '#d03030'} r={[0, 0, side * 0.3]} />
            </group>
          );
        }),
      )}
      {[-1, 1].map((side) =>
        Array.from({length: 6}).map((_, i) => <Tree key={`t${side}${i}`} p={[side * 4.8, 0, 1 - i * 8.5]} s={1.0} />),
      )}
      {Array.from({length: 4}).map((_, i) => (
        <Lamp key={i} p={[-4.6, 0, -2 - i * 12]} />
      ))}
      {/* igreja ao fundo */}
      <Box p={[0, 4, -48]} s={[9, 8, 6]} c="#ece6d8" />
      <Box p={[0, 10, -48]} s={[3, 4, 3]} c="#ece6d8" />
      <mesh position={[0, 13, -48]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.4, 3, 4]} />
        <meshStandardMaterial color="#2b4fb0" />
      </mesh>
      {crowd ? <CrowdImpl n={36} area={{x: [-4, 4], z: [-30, -6]}} pose="zombie" t={t} rotY={0} skip={1.8} /> : null}
    </group>
  );
};
