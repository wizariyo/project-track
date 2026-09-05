import { interpolate } from 'remotion';
export const getSceneProgress = (frame: number, sceneStart: number, sceneEnd: number): number => {
  return interpolate(frame, [sceneStart, sceneEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
