import {useMemo} from 'react';
import * as THREE from 'three';

const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

/** Poeira/partículas flutuantes. Determinístico (necessário no Remotion). */
export const Dust = ({amount, time, color}: {amount: number; time: number; color: string}) => {
  const count = 400;
  const base = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand(i) - 0.5) * 8;
      arr[i * 3 + 1] = (rand(i + 1000) - 0.5) * 12;
      arr[i * 3 + 2] = (rand(i + 2000) - 0.5) * 6;
    }
    return arr;
  }, []);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = base[i * 3] + Math.sin(time * 0.6 + i) * 0.15;
      arr[i * 3 + 1] = ((base[i * 3 + 1] + time * 0.25 + 6) % 12) - 6;
      arr[i * 3 + 2] = base[i * 3 + 2];
    }
    return arr;
  }, [base, time]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.035} transparent opacity={0.15 + 0.6 * amount} sizeAttenuation />
    </points>
  );
};
