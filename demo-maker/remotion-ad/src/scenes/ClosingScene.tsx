import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const ClosingScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 60);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ background: '#0C1A18', opacity, justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '150px', color: '#EFEABB', fontWeight: '800' }}>ProjectTrack</h1>
      <h2 style={{ fontSize: '80px', color: '#7BCA9C', marginTop: '40px', textShadow: '0 0 40px #7BCA9C' }}>Ship Faster Together âœ“</h2>
    </AbsoluteFill>
  );
};
