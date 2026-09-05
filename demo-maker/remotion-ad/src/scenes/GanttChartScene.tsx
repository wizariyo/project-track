import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

const GANTT_TASKS = [
  { name: 'Requirement', target: 15 },
  { name: 'UI Design', target: 42 },
  { name: 'Database', target: 78 },
  { name: 'Development', target: 95 },
  { name: 'Deployment', target: 5 },
];

export const GanttChartScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 540);
  const opacity = interpolate(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panX = interpolate(progress, [0, 1], [400, -400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#0C1A18', opacity }}>
      <div style={{ padding: '300px 400px', transform: `translateX(${panX}px)`, position: 'relative', width: '100%', height: '100%' }}>
        <h2 style={{ color: '#7BCA9C', fontSize: '80px', marginBottom: '100px', textShadow: '0 0 30px rgba(123,202,156,0.5)' }}>Project Timeline</h2>
        {GANTT_TASKS.map((task, idx) => {
          const taskStartProgress = (idx * 0.15);
          const taskProgress = Math.max(0, progress - taskStartProgress);
          const progressPercent = interpolate(taskProgress, [0, 0.8], [0, task.target], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={idx} style={{ marginBottom: '80px', display: 'flex', alignItems: 'center', gap: '60px' }}>
              <div style={{ width: '300px', color: '#EFEABB', fontSize: '40px', fontWeight: '600' }}>{task.name}</div>
              <div style={{ flex: 1, height: '60px', background: '#162220', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(123,202,156,0.2)' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: '#7BCA9C', boxShadow: '0 0 40px #7BCA9C' }} />
              </div>
              <div style={{ width: '150px', color: '#7BCA9C', fontSize: '40px', fontWeight: '800' }}>{Math.round(progressPercent)}%</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
