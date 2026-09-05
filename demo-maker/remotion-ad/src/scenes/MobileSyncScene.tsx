import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const MobileSyncScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 180);
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  
  return (
    <AbsoluteFill style={{ background: '#0C1A18', opacity, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '150px' }}>
      <div style={{ width: '600px', height: '1200px', background: '#162220', borderRadius: '80px', border: '16px solid #17433F', padding: '60px', position: 'relative' }}>
        <h2 style={{ fontSize: '60px', color: '#7BCA9C' }}>Mobile</h2>
        <div style={{ height: '80px', background: '#7BCA9C', borderRadius: '20px', marginTop: '60px', opacity: progress > 0.5 ? 1 : 0.2 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '100px', color: '#7BCA9C', textShadow: '0 0 40px #7BCA9C' }}>âŸ·</div>
        <div style={{ fontSize: '40px', color: '#7BCA9C', marginTop: '20px' }}>Real-time Sync</div>
      </div>

      <div style={{ width: '1200px', height: '800px', background: '#162220', borderRadius: '40px', border: '16px solid #17433F', padding: '60px' }}>
        <h2 style={{ fontSize: '60px', color: '#7BCA9C' }}>Team Dashboard</h2>
        <div style={{ height: '80px', background: '#7BCA9C', borderRadius: '20px', marginTop: '60px', opacity: progress > 0.5 ? 1 : 0.2 }} />
      </div>
    </AbsoluteFill>
  );
};
