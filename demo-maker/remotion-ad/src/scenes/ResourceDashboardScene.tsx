import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const ResourceDashboardScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 360);
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const scale = interpolate(progress, [0, 1], [0.8, 1.1]);

  const members = [
    { name: 'Yathaarth', val: 85 }, { name: 'Aryan', val: 62 }, { name: 'Priya', val: 91 },
    { name: 'Rahul', val: 45 }, { name: 'Neha', val: 78 }, { name: 'Aditya', val: 55 }
  ];

  return (
    <AbsoluteFill style={{ background: '#0C1A18', opacity, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '100px', transform: `scale(${scale})` }}>
        {members.map((m, i) => {
          const val = Math.round(interpolate(progress, [0, 0.5], [0, m.val], { extrapolateRight: 'clamp' }));
          return (
            <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#162220', padding: '60px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <div style={{ width: '200px', height: '200px', borderRadius: '100px', border: `16px solid #7BCA9C`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(123,202,156,0.4)' }}>
                <span style={{ fontSize: '60px', fontWeight: 'bold' }}>{val}%</span>
              </div>
              <h3 style={{ fontSize: '50px', marginTop: '40px', color: '#EFEABB' }}>{m.name}</h3>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
