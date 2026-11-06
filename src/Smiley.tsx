import {useMemo} from 'react';
import * as THREE from 'three';

/** Smiley vermelho (assinatura do Red John), feito só de geometria Three.js. */
export const Smiley = ({intensity}: {intensity: number}) => {
  const smile = useMemo(() => {
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.55, -0.2, 0.06),
      new THREE.Vector3(0, -0.85, 0.06),
      new THREE.Vector3(0.55, -0.2, 0.06),
    );
    return new THREE.TubeGeometry(curve, 32, 0.045, 8, false);
  }, []);

  const mat = (
    <meshStandardMaterial
      color="#d10f1a"
      emissive="#ff0000"
      emissiveIntensity={1.4 * intensity}
      transparent
      opacity={intensity}
    />
  );

  return (
    <group>
      <mesh>
        <torusGeometry args={[1, 0.05, 16, 64]} />
        {mat}
      </mesh>
      <mesh position={[-0.35, 0.35, 0.06]}>
        <circleGeometry args={[0.09, 24]} />
        {mat}
      </mesh>
      <mesh position={[0.35, 0.35, 0.06]}>
        <circleGeometry args={[0.09, 24]} />
        {mat}
      </mesh>
      <mesh geometry={smile}>{mat}</mesh>
    </group>
  );
};
