import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const KanbanBoardScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 540);
  const opacity = interpolate(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const tilt = interpolate(progress, [0, 1], [5, -5]);
  const panY = interpolate(progress, [0, 1], [200, -200]);
  
  return (
    <AbsoluteFill style={{ background: '#0C1A18', opacity, perspective: '2000px', padding: '200px' }}>
      <div style={{ display: 'flex', gap: '80px', height: '100%', transform: `rotateY(${tilt}deg) translateY(${panY}px)` }}>
        {['TO-DO', 'IN PROGRESS', 'DONE'].map((col, i) => (
          <div key={col} style={{ flex: 1, background: '#162220', borderRadius: '24px', padding: '60px', borderTop: '8px solid #7BCA9C' }}>
            <h3 style={{ fontSize: '50px', color: '#EFEABB', marginBottom: '60px' }}>{col}</h3>
            {[1, 2, 3].map(card => {
              const cardOffset = interpolate(progress, [0, 1], [0, i === 1 ? 300 : i === 2 ? 600 : 0]);
              return (
                <div key={card} style={{ background: '#0C1A18', padding: '40px', borderRadius: '16px', marginBottom: '40px', border: '2px solid rgba(123,202,156,0.3)', transform: `translateY(${cardOffset}px)` }}>
                  <div style={{ height: '30px', width: '60%', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', marginBottom: '30px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ height: '50px', width: '50px', borderRadius: '25px', background: '#7BCA9C' }} />
                    <div style={{ height: '30px', width: '100px', background: '#7BCA9C', borderRadius: '15px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
