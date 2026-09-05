import React from 'react';
import { Composition } from 'remotion';
import { UltimateDemo } from './UltimateDemo';
import timingsData from './ultimate_timings.json';

export const Root: React.FC = () => {
  return (
    <Composition
      id="UltimateDemoPromo"
      component={UltimateDemo}
      durationInFrames={timingsData.totalFrames || 14334}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
