import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
} from "remotion";

// ---------------------------------------------------------------------------
// Types — mirrors the shape of timings.json produced by build_assets.py
// ---------------------------------------------------------------------------
type SceneData = {
  id: number;
  feature: string;
  title: string;
  highlight: string;
  script: string;
  clip: string;
  audio: string;
  audioDurationMs: number;
  videoDurationMs: number;
  startFrame: number;
  durationInFrames: number;
};

type Timings = {
  fps: number;
  totalDurationInFrames: number;
  scenes: SceneData[];
};

const ACCENT = "#0a84ff";
const SF_FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif";

// ---------------------------------------------------------------------------
// Background: pitch black + soft radial blue/purple glow, centered
// ---------------------------------------------------------------------------
const BackgroundGlow: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(10,132,255,0.35) 0%, rgba(94,60,255,0.18) 32%, rgba(0,0,0,0) 65%)",
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Kinetic Typography — fades in + drifts upward, keyword highlighted in accent
// ---------------------------------------------------------------------------
const KineticText: React.FC<{ title: string; highlight: string }> = ({
  title,
  highlight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 120, mass: 0.6 },
  });

  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [40, 0]);

  const parts = title.split(highlight);

  return (
    <div
      style={{
        position: "absolute",
        top: "12%",
        left: 0,
        right: 0,
        textAlign: "center",
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <h1
        style={{
          fontFamily: SF_FONT_STACK,
          fontWeight: 800,
          fontSize: 76,
          color: "#f5f5f7",
          margin: 0,
          letterSpacing: "-0.02em",
          textShadow: "0 0 40px rgba(255,255,255,0.15)",
        }}
      >
        {parts[0]}
        {parts.length > 1 && (
          <span style={{ color: ACCENT }}>{highlight}</span>
        )}
        {parts[1]}
      </h1>
    </div>
  );
};

// ---------------------------------------------------------------------------
// MacBook Mockup — Ken Burns scale 0.85 -> 1.0 via spring, screen video
// stretched/compressed with playbackRate so it lands exactly on the last
// frame of the scene at the same moment the voiceover ends. No startFrom,
// no seeking into a big file — each clip is its own small self-contained
// asset, played with OffthreadVideo (ffmpeg-backed, avoids the browser
// decode issues that caused the black-screen bug).
// ---------------------------------------------------------------------------

// Percentage coordinates of the visible screen area INSIDE mac_frame.png.
// Tune these 4 numbers once to match your actual PNG's bezel, then every
// scene will line up automatically.
const SCREEN_BOX = {
  top: "6.4%",
  left: "13.2%",
  width: "73.6%",
  height: "80%",
};

const MacbookMockup: React.FC<{ scene: SceneData }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleProgress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 90, mass: 0.8 },
  });
  const scale = interpolate(scaleProgress, [0, 1], [0.85, 1]);
  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: "clamp",
  });

  const nativeClipFrames = Math.round((scene.videoDurationMs / 1000) * fps);
  const playbackRate = nativeClipFrames / scene.durationInFrames;

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "68%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        <div
          style={{
            position: "absolute",
            top: SCREEN_BOX.top,
            left: SCREEN_BOX.left,
            width: SCREEN_BOX.width,
            height: SCREEN_BOX.height,
            overflow: "hidden",
            borderRadius: 6,
            backgroundColor: "#000",
          }}
        >
          <OffthreadVideo
            src={staticFile(scene.clip)}
            playbackRate={playbackRate}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <Img
          src={staticFile("assets/mac_frame.png")}
          style={{ width: "100%", display: "block" }}
        />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// One Scene = its own Audio + Kinetic text + Macbook, with a gentle
// cross-fade at the in/out edges instead of a hard cut.
// ---------------------------------------------------------------------------
const SceneBlock: React.FC<{ scene: SceneData }> = ({ scene }) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [scene.durationInFrames - 12, scene.durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp" }
  );
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{ opacity }}>
      <BackgroundGlow />
      <Audio src={staticFile(scene.audio)} />
      <KineticText title={scene.title} highlight={scene.highlight} />
      <MacbookMockup scene={scene} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Root ad component — lays scenes end-to-end using the startFrame /
// durationInFrames computed entirely from voiceover length in Python.
// ---------------------------------------------------------------------------
export const AppleAd: React.FC<{ timings: Timings }> = ({ timings }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {timings.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          from={scene.startFrame}
          durationInFrames={scene.durationInFrames}
        >
          <SceneBlock scene={scene} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
