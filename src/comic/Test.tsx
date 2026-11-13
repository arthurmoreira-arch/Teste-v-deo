import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Canvas} from './kit';
import {Bust, LIGHTS, Expr, Look} from './chars';

const cells: {look: Look; e: Expr; light: keyof typeof LIGHTS}[] = [
  {look: 'voce', e: {tilt: 0.8, look: [0, 0.9], open: 0.62, glow: 1}, light: 'night'},
  {look: 'voce', e: {open: 1.3, pupil: 0.6, browUp: 1, mouth: 'open', glow: 0.8}, light: 'night'},
  {look: 'voce', e: {mouth: 'smirk', brow: 0.3, turn: 0.6, look: [0.5, 0]}, light: 'day'},
  {look: 'chefe', e: {brow: 0.8, mouth: 'frown', look: [0, 0.6], tilt: 0.4}, light: 'day'},
  {look: 'chefe', e: {browUp: 0.6, mouth: 'smile', turn: -0.5}, light: 'day'},
  {look: 'bia', e: {mouth: 'smirk', brow: 0.5, open: 0.8, look: [-0.4, 0], glow: 0.9, glowColor: '#ff2bd6'}, light: 'red'},
  {look: 'bia', e: {mouth: 'neutral', turn: 0.5}, light: 'night'},
  {look: 'voce', e: {open: 0.05, mouth: 'talk'}, light: 'room'},
  {look: 'voce', e: {brow: -1, open: 1.15, mouth: 'grit', sweat: true, glow: 0.7, glowColor: '#ff3b4e'}, light: 'red'},
];

export const ComicTest = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: '#2a1c6a'}}>
      <Canvas>
        {cells.map((c, i) => (
          <g key={i} transform={`translate(${180 + (i % 3) * 360},${330 + Math.floor(i / 3) * 640}) scale(0.62)`}>
            <Bust uid={`t${i}`} look={c.look} e={c.e} light={LIGHTS[c.light]} f={f} />
          </g>
        ))}
      </Canvas>
    </AbsoluteFill>
  );
};
