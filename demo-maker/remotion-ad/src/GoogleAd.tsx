import React, { useMemo } from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from 'remotion';
import { staticFile } from 'remotion';
import './GoogleAd.css';

const SCENE_1_START = 0; // 0s
const SCENE_1_END = 90; // 3s @ 30fps

const SCENE_2_START = 90; // 3s
const SCENE_2_END = 210; // 7s @ 30fps

const SCENE_3_START = 210; // 7s
const SCENE_3_END = 300; // 10s @ 30fps

const SCENE_4_START = 300; // 10s
const SCENE_4_END = 450; // 15s @ 30fps

const SCENE_5_START = 450; // 15s
const SCENE_5_END = 600; // 20s @ 30fps

interface AnimationProps {
  frame: number;
  sceneStart: number;
  sceneDuration: number;
}

const getSceneProgress = (frame: number, sceneStart: number, sceneEnd: number): number => {
  return interpolate(frame, [sceneStart, sceneEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

interface TextOverlayProps {
  text: string;
  sceneStart: number;
  sceneEnd: number;
  frame: number;
}

const BoldTextOverlay: React.FC<TextOverlayProps> = ({ text, sceneStart, sceneEnd, frame }) => {
  const progress = getSceneProgress(frame, sceneStart, sceneEnd);
  
  const opacity = interpolate(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scaleY = interpolate(progress, [0, 0.15, 1], [0.8, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      className="text-overlay"
      style={{
        opacity,
        transform: `scaleY(${scaleY})`,
      }}
    >
      <h1 className="promo-text">{text}</h1>
    </div>
  );
};

interface FloatingUIProps {
  videoSrc: string;
  sceneStart: number;
  sceneEnd: number;
  frame: number;
  initialRotateX?: number;
  initialRotateY?: number;
  finalRotateX?: number;
  finalRotateY?: number;
  applyKenBurns?: boolean;
}

const FloatingUI: React.FC<FloatingUIProps> = ({
  videoSrc,
  sceneStart,
  sceneEnd,
  frame,
  initialRotateX = 20,
  initialRotateY = -15,
  finalRotateX = 20,
  finalRotateY = -15,
  applyKenBurns = true,
}) => {
  const sceneDuration = sceneEnd - sceneStart;
  const progress = getSceneProgress(frame, sceneStart, sceneEnd);

  const rotateX = interpolate(progress, [0, 1], [initialRotateX, finalRotateX], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rotateY = interpolate(progress, [0, 1], [initialRotateY, finalRotateY], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rotateZ = interpolate(progress, [0, 0.5, 1], [0, 2, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = applyKenBurns
    ? interpolate(progress, [0, 1], [1, 1.05], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const translateX = applyKenBurns
    ? interpolate(progress, [0, 1], [0, 8], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const translateY = applyKenBurns
    ? interpolate(progress, [0, 1], [0, -12], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const floatingY = Math.sin((frame * Math.PI) / 120) * 4;

  return (
    <div
      className="floating-ui-container"
      style={{
        perspective: '1200px',
      }}
    >
      <div
        className="floating-ui"
        style={{
          transform: `translate3d(${translateX}px, ${translateY + floatingY}px, 0) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
        }}
      >
        <div className="ui-content">
          <Video
            src={staticFile(videoSrc)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export const GoogleAd: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill className="google-ad-root">
      <Audio src={staticFile('bg_music.mp3')} />

      {frame < SCENE_1_END && (
        <>
          <AbsoluteFill
            style={{
              opacity: interpolate(frame, [SCENE_1_START, SCENE_1_END], [1, 0], { extrapolateRight: 'clamp' }),
            }}
          >
            <Video src={staticFile('clip_student.mp4')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }} />
          </AbsoluteFill>
          <BoldTextOverlay text="Managing college projects is chaotic." sceneStart={SCENE_1_START} sceneEnd={SCENE_1_END} frame={frame} />
        </>
      )}

      {frame >= SCENE_2_START && frame < SCENE_2_END && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(135deg, #0C1A18 0%, #162220 100%)' }} />
          <FloatingUI videoSrc="assets/ui_clip_1.mp4" sceneStart={SCENE_2_START} sceneEnd={SCENE_2_END} frame={frame} initialRotateX={20} initialRotateY={-15} finalRotateX={20} finalRotateY={-15} applyKenBurns={true} />
          <BoldTextOverlay text="Meet ProjectTrack." sceneStart={SCENE_2_START} sceneEnd={SCENE_2_END} frame={frame} />
        </>
      )}

      {frame >= SCENE_3_START && frame < SCENE_3_END && (
        <>
          <AbsoluteFill
            style={{
              opacity: interpolate(frame, [SCENE_3_START, SCENE_3_START + 15, SCENE_3_END - 15, SCENE_3_END], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            <Video src={staticFile('clip_teacher.mp4')} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }} />
          </AbsoluteFill>
          <BoldTextOverlay text="Keep everyone in sync." sceneStart={SCENE_3_START} sceneEnd={SCENE_3_END} frame={frame} />
        </>
      )}

      {frame >= SCENE_4_START && frame < SCENE_4_END && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(135deg, #0C1A18 0%, #17433F 100%)' }} />
          <FloatingUI videoSrc="assets/ui_clip_2.mp4" sceneStart={SCENE_4_START} sceneEnd={SCENE_4_END} frame={frame} initialRotateX={35} initialRotateY={-25} finalRotateX={35} finalRotateY={-25} applyKenBurns={false} />
          <BoldTextOverlay text="Zero-latency Kanban." sceneStart={SCENE_4_START} sceneEnd={SCENE_4_END} frame={frame} />
        </>
      )}

      {frame >= SCENE_5_START && frame <= SCENE_5_END && (
        <>
          <AbsoluteFill style={{ background: 'radial-gradient(circle at center, #162220 0%, #0C1A18 100%)' }} />
          <FloatingUI videoSrc="assets/ui_clip_3.mp4" sceneStart={SCENE_5_START} sceneEnd={SCENE_5_END} frame={frame} initialRotateX={20} initialRotateY={-15} finalRotateX={0} finalRotateY={0} applyKenBurns={true} />
          <BoldTextOverlay text="ProjectTrack. Try it today." sceneStart={SCENE_5_START} sceneEnd={SCENE_5_END} frame={frame} />
        </>
      )}
    </AbsoluteFill>
  );
};
