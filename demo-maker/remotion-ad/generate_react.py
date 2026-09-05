import os

os.makedirs('src/scenes', exist_ok=True)
os.makedirs('src/utils', exist_ok=True)

with open('src/utils/animation.ts', 'w', encoding="utf-8") as f:
    f.write("""import { interpolate } from 'remotion';
export const getSceneProgress = (frame: number, sceneStart: number, sceneEnd: number): number => {
  return interpolate(frame, [sceneStart, sceneEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
""")

with open('src/Root.tsx', 'w', encoding="utf-8") as f:
    f.write("""import React from 'react';
import { Composition } from 'remotion';
import { ProjectTrackShowcase } from './ProjectTrackShowcase';

export const Root: React.FC = () => {
  return (
    <Composition
      id="ProjectTrackShowcase"
      component={ProjectTrackShowcase}
      durationInFrames={30 * 60} // 30 seconds @ 60fps
      fps={60}
      width={3840}
      height={2160}
      defaultProps={{}}
    />
  );
};
""")

with open('src/ProjectTrackShowcase.css', 'w', encoding="utf-8") as f:
    f.write("""@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
* { box-sizing: border-box; }
.showcase-root {
  font-family: 'Inter', sans-serif;
  background-color: #0B0F19;
  color: white;
}
""")

with open('src/ProjectTrackShowcase.tsx', 'w', encoding="utf-8") as f:
    f.write("""import React from 'react';
import { AbsoluteFill, Audio, Sequence, useCurrentFrame, staticFile } from 'remotion';
import { GanttChartScene } from './scenes/GanttChartScene';
import { KanbanBoardScene } from './scenes/KanbanBoardScene';
import { ResourceDashboardScene } from './scenes/ResourceDashboardScene';
import { MobileSyncScene } from './scenes/MobileSyncScene';
import { OpeningScene } from './scenes/OpeningScene';
import { ClosingScene } from './scenes/ClosingScene';
import './ProjectTrackShowcase.css';

const SCENE_TIMINGS = {
  opening: { start: 0, end: 180 }, // 0-3s
  gantt: { start: 180, end: 720 }, // 3-12s
  kanban: { start: 720, end: 1260 }, // 12-21s
  resource: { start: 1260, end: 1620 }, // 21-27s
  mobile: { start: 1620, end: 1800 }, // 27-30s
};

export const ProjectTrackShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill className="showcase-root">
      <Audio src={staticFile('bg_music.mp3')} volume={0.8} />
      <Sequence from={SCENE_TIMINGS.opening.start} durationInFrames={SCENE_TIMINGS.opening.end}>
        <OpeningScene frame={frame} />
      </Sequence>
      <Sequence from={SCENE_TIMINGS.gantt.start} durationInFrames={SCENE_TIMINGS.gantt.end - SCENE_TIMINGS.gantt.start}>
        <GanttChartScene frame={frame} sceneStart={SCENE_TIMINGS.gantt.start} />
      </Sequence>
      <Sequence from={SCENE_TIMINGS.kanban.start} durationInFrames={SCENE_TIMINGS.kanban.end - SCENE_TIMINGS.kanban.start}>
        <KanbanBoardScene frame={frame} sceneStart={SCENE_TIMINGS.kanban.start} />
      </Sequence>
      <Sequence from={SCENE_TIMINGS.resource.start} durationInFrames={SCENE_TIMINGS.resource.end - SCENE_TIMINGS.resource.start}>
        <ResourceDashboardScene frame={frame} sceneStart={SCENE_TIMINGS.resource.start} />
      </Sequence>
      <Sequence from={SCENE_TIMINGS.mobile.start} durationInFrames={SCENE_TIMINGS.mobile.end - SCENE_TIMINGS.mobile.start}>
        <MobileSyncScene frame={frame} sceneStart={SCENE_TIMINGS.mobile.start} />
      </Sequence>
      <Sequence from={SCENE_TIMINGS.mobile.end - 60} durationInFrames={60}>
        <ClosingScene frame={frame} sceneStart={SCENE_TIMINGS.mobile.end - 60} />
      </Sequence>
    </AbsoluteFill>
  );
};
""")

with open('src/scenes/OpeningScene.tsx', 'w', encoding="utf-8") as f:
    f.write("""import React from 'react';
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
    <AbsoluteFill style={{ background: '#0B0F19' }}>
      {particles.map(p => (
        <div key={p.i} style={{
          left: p.x, top: p.y, opacity: glowOpacity * 0.6, width: '12px', height: '12px',
          borderRadius: '50%', background: '#84CC16', boxShadow: '0 0 30px #84CC16', position: 'absolute'
        }} />
      ))}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) scale(${scale})`, opacity: glowOpacity }}>
        <h1 style={{ fontSize: '120px', color: '#84CC16', textShadow: '0 0 50px #84CC16', fontWeight: 800 }}>ProjectTrack</h1>
      </div>
    </AbsoluteFill>
  );
};
""")

with open('src/scenes/GanttChartScene.tsx', 'w', encoding="utf-8") as f:
    f.write("""import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

const GANTT_TASKS = [
  { name: 'Design', target: 15 },
  { name: 'Development', target: 42 },
  { name: 'QA', target: 78 },
  { name: 'Deployment', target: 95 },
  { name: 'Launch', target: 5 },
];

export const GanttChartScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 540);
  const opacity = interpolate(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const panX = interpolate(progress, [0, 1], [400, -400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#0B0F19', opacity }}>
      <div style={{ padding: '300px 400px', transform: `translateX(${panX}px)`, position: 'relative', width: '100%', height: '100%' }}>
        <h2 style={{ color: '#84CC16', fontSize: '80px', marginBottom: '100px', textShadow: '0 0 30px rgba(132,204,22,0.5)' }}>Project Timeline</h2>
        {GANTT_TASKS.map((task, idx) => {
          const taskStartProgress = (idx * 0.15);
          const taskProgress = Math.max(0, progress - taskStartProgress);
          const progressPercent = interpolate(taskProgress, [0, 0.8], [0, task.target], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

          return (
            <div key={idx} style={{ marginBottom: '80px', display: 'flex', alignItems: 'center', gap: '60px' }}>
              <div style={{ width: '300px', color: '#E2E8F0', fontSize: '40px', fontWeight: '600' }}>{task.name}</div>
              <div style={{ flex: 1, height: '60px', background: '#1E293B', borderRadius: '16px', overflow: 'hidden', border: '2px solid rgba(132,204,22,0.2)' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: '#84CC16', boxShadow: '0 0 40px #84CC16' }} />
              </div>
              <div style={{ width: '150px', color: '#84CC16', fontSize: '40px', fontWeight: '800' }}>{Math.round(progressPercent)}%</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
""")

with open('src/scenes/KanbanBoardScene.tsx', 'w', encoding="utf-8") as f:
    f.write("""import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const KanbanBoardScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 540);
  const opacity = interpolate(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const tilt = interpolate(progress, [0, 1], [5, -5]);
  const panY = interpolate(progress, [0, 1], [200, -200]);
  
  return (
    <AbsoluteFill style={{ background: '#0B0F19', opacity, perspective: '2000px', padding: '200px' }}>
      <div style={{ display: 'flex', gap: '80px', height: '100%', transform: `rotateY(${tilt}deg) translateY(${panY}px)` }}>
        {['TO-DO', 'IN PROGRESS', 'DONE'].map((col, i) => (
          <div key={col} style={{ flex: 1, background: '#1E293B', borderRadius: '24px', padding: '60px', borderTop: '8px solid #84CC16' }}>
            <h3 style={{ fontSize: '50px', color: 'white', marginBottom: '60px' }}>{col}</h3>
            {[1, 2, 3].map(card => {
              const cardOffset = interpolate(progress, [0, 1], [0, i === 1 ? 300 : i === 2 ? 600 : 0]);
              return (
                <div key={card} style={{ background: '#0B0F19', padding: '40px', borderRadius: '16px', marginBottom: '40px', border: '2px solid rgba(132,204,22,0.3)', transform: `translateY(${cardOffset}px)` }}>
                  <div style={{ height: '30px', width: '60%', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', marginBottom: '30px' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ height: '50px', width: '50px', borderRadius: '25px', background: '#84CC16' }} />
                    <div style={{ height: '30px', width: '100px', background: '#84CC16', borderRadius: '15px' }} />
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
""")

with open('src/scenes/ResourceDashboardScene.tsx', 'w', encoding="utf-8") as f:
    f.write("""import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const ResourceDashboardScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 360);
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const scale = interpolate(progress, [0, 1], [0.8, 1.1]);

  const members = [
    { name: 'Alex', val: 85 }, { name: 'Sam', val: 62 }, { name: 'Jordan', val: 91 },
    { name: 'Casey', val: 45 }, { name: 'Morgan', val: 78 }, { name: 'Taylor', val: 55 }
  ];

  return (
    <AbsoluteFill style={{ background: '#0B0F19', opacity, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '100px', transform: `scale(${scale})` }}>
        {members.map((m, i) => {
          const val = Math.round(interpolate(progress, [0, 0.5], [0, m.val], { extrapolateRight: 'clamp' }));
          return (
            <div key={m.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#1E293B', padding: '60px', borderRadius: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <div style={{ width: '200px', height: '200px', borderRadius: '100px', border: `16px solid #84CC16`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(132,204,22,0.4)' }}>
                <span style={{ fontSize: '60px', fontWeight: 'bold' }}>{val}%</span>
              </div>
              <h3 style={{ fontSize: '50px', marginTop: '40px', color: 'white' }}>{m.name}</h3>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
""")

with open('src/scenes/MobileSyncScene.tsx', 'w', encoding="utf-8") as f:
    f.write("""import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const MobileSyncScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 180);
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  
  return (
    <AbsoluteFill style={{ background: '#0B0F19', opacity, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '150px' }}>
      <div style={{ width: '600px', height: '1200px', background: '#1E293B', borderRadius: '80px', border: '16px solid #334155', padding: '60px', position: 'relative' }}>
        <h2 style={{ fontSize: '60px', color: '#84CC16' }}>Mobile</h2>
        <div style={{ height: '80px', background: '#84CC16', borderRadius: '20px', marginTop: '60px', opacity: progress > 0.5 ? 1 : 0.2 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ fontSize: '100px', color: '#84CC16', textShadow: '0 0 40px #84CC16' }}>âŸ·</div>
        <div style={{ fontSize: '40px', color: '#84CC16', marginTop: '20px' }}>Real-time Sync</div>
      </div>

      <div style={{ width: '1200px', height: '800px', background: '#1E293B', borderRadius: '40px', border: '16px solid #334155', padding: '60px' }}>
        <h2 style={{ fontSize: '60px', color: '#84CC16' }}>Dashboard</h2>
        <div style={{ height: '80px', background: '#84CC16', borderRadius: '20px', marginTop: '60px', opacity: progress > 0.5 ? 1 : 0.2 }} />
      </div>
    </AbsoluteFill>
  );
};
""")

with open('src/scenes/ClosingScene.tsx', 'w', encoding="utf-8") as f:
    f.write("""import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { getSceneProgress } from '../utils/animation';

export const ClosingScene: React.FC<{frame: number; sceneStart: number}> = ({ frame, sceneStart }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneStart + 60);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ background: '#0B0F19', opacity, justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ fontSize: '150px', color: 'white', fontWeight: '800' }}>ProjectTrack</h1>
      <h2 style={{ fontSize: '80px', color: '#84CC16', marginTop: '40px', textShadow: '0 0 40px #84CC16' }}>Ship Faster Together âœ“</h2>
    </AbsoluteFill>
  );
};
""")

with open('src/scenes/index.ts', 'w', encoding='utf-8') as f:
    f.write("""export * from './OpeningScene';
export * from './GanttChartScene';
export * from './KanbanBoardScene';
export * from './ResourceDashboardScene';
export * from './MobileSyncScene';
export * from './ClosingScene';
""")
