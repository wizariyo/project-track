import React from 'react';
import { AbsoluteFill, Video, Audio, staticFile, useCurrentFrame, Sequence, interpolate, useVideoConfig } from 'remotion';

export const WalkthroughDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // The 102s original demo video
  const videoDuration = 102 * fps; 

  const SECTIONS = [
    { start: 0, end: 15 * fps, title: "Welcome to ProjectTrack", audio: "assets/vo_intro.mp3" },
    { start: 15 * fps, end: 27 * fps, title: "1. Secure Role-Based Auth", audio: "assets/vo_auth.mp3" },
    { start: 27 * fps, end: 54 * fps, title: "2. Teacher Command Center", audio: "assets/vo_teacher.mp3" },
    { start: 54 * fps, end: 60 * fps, title: "3. Native Dark Mode", audio: "assets/vo_darkmode.mp3" },
    { start: 60 * fps, end: 73 * fps, title: "4. Zero-Latency Kanban", audio: "assets/vo_kanban.mp3" },
    { start: 73 * fps, end: videoDuration, title: "5. Real-Time Chat & Files", audio: "assets/vo_chat.mp3" },
  ];

  const currentSection = SECTIONS.find(s => frame >= s.start && frame < s.end) || SECTIONS[SECTIONS.length - 1];

  // Fade in animation for the title based on the start of the current section
  const sectionProgress = frame - currentSection.start;
  const titleOpacity = interpolate(sectionProgress, [0, 15, 30], [0, 0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(sectionProgress, [0, 15, 30], [-20, -20, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0C1A18', fontFamily: 'Inter, sans-serif' }}>
      {/* Background Music */}
      <Audio src={staticFile('bg_music.mp3')} volume={0.15} />

      {/* Voiceovers */}
      {SECTIONS.map((section, idx) => (
        <Sequence key={idx} from={section.start}>
          <Audio src={staticFile(section.audio)} volume={1} />
        </Sequence>
      ))}

      {/* Top Banner for Titles */}
      <div style={{ height: '18%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '30px' }}>
        <h1 style={{ 
          fontSize: '60px', 
          fontWeight: 800, 
          color: '#EFEABB', 
          textShadow: '0 5px 20px rgba(0,0,0,0.8), 0 0 40px rgba(85, 132, 103, 0.4)',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          margin: 0
        }}>
          {currentSection.title}
        </h1>
      </div>

      {/* The Demo Video in the Center */}
      <div style={{ height: '82%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: '50px' }}>
        <div style={{ 
          width: '80%', 
          height: '100%', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          border: '4px solid #17433F', 
          boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 0 2px #558467',
          backgroundColor: '#162220'
        }}>
          <Video src={staticFile('ProjectTrack_Epic_Demo.mp4')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
