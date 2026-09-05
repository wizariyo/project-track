import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const OpeningScene: React.FC<{frame: number}> = ({ frame }) => {
  const progress = getSceneProgress(frame, 0, 180);
  const scale = interpolate(progress, [0, 0.3, 1], [1.5, 1.2, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowOpacity = interpolate(progress, [0.2, 0.5, 1], [0.3, 1, 0.2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const particles = Array.from({ length: 50 }, (_, i) => {
    const angle = (i / 50) * Math.PI * 2;
    const distance = interpolate(progress, [0, 1], [0, 1200]);
    return { x: 1920 + Math.cos(angle) * distance, y: 1080 + Math.sin(angle) * distance, i };
  });

  return (
    <AbsoluteFill style={{ background: '#0C1A18' }}>
      {particles.map(p => (
        <div key={p.i} style={{
          left: p.x, top: p.y, opacity: glowOpacity * 0.6, width: '12px', height: '12px',
          borderRadius: '50%', background: '#7BCA9C', boxShadow: '0 0 30px #7BCA9C', position: 'absolute'
        }} />
      ))}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${scale})`, opacity: glowOpacity }}>
        <h1 style={{ fontSize: '120px', color: '#7BCA9C', textShadow: '0 0 50px #7BCA9C', fontWeight: 800 }}>ProjectTrack</h1>
      </div>
    </AbsoluteFill>
  );
};
