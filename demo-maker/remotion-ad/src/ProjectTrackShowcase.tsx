import React from 'react';
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
