import React from 'react';
import { AbsoluteFill, Series, useVideoConfig, spring, interpolate, useCurrentFrame, Video, Audio, staticFile } from 'remotion';
import promoTimings from './promo_timings.json';

// Define a wrapper for each scene to handle internal animations
const Scene: React.FC<{ 
  sec: any; 
  isLast: boolean;
}> = ({ sec, isLast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgTeal = '#0C1A18';
  const sageGreen = '#558467';
  const cream = '#EFEABB';

  // Caption animation
  const captionY = spring({ frame, fps, config: { damping: 14 }, from: 50, to: 0 });
  
  // Fade out at the end of the scene (except the very last frame of the video)
  const fadeOutStart = sec.durationFrames - 15;
  const opacity = isLast 
    ? 1 
    : interpolate(frame, [fadeOutStart, sec.durationFrames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Browser scaling animation (slight zoom in per scene)
  const scale = interpolate(frame, [0, sec.durationFrames], [0.95, 0.98]);

  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(135deg, ${bgTeal} 0%, #000 100%)`, 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif',
      opacity
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: '100%', height: '100%',
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(85,132,103,0.15) 0%, transparent 60%)`
      }}/>

      {/* Browser Mockup */}
      <div style={{
        width: '1720px', height: '960px',
        background: '#000', borderRadius: '16px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden', border: `1px solid ${sageGreen}66`,
        display: 'flex', flexDirection: 'column',
        transform: `scale(${scale})`,
        zIndex: 5
      }}>
        <div style={{ height: '36px', background: cream, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
          <div style={{ marginLeft: 'auto', marginRight: 'auto', fontSize: '13px', color: '#333', fontWeight: 600 }}>projecttrack.com</div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          {/* Slice the video! */}
          <Video 
            src={staticFile('assets/ProjectTrack_Ultimate_Video.mp4')} 
            startFrom={sec.vidStartFrame}
            endAt={sec.vidStartFrame + sec.durationFrames}
            style={{ width: '100%', height: '100%', objectFit: 'cover', background: '#fff' }} 
            muted={true}
          />
        </div>
      </div>

      {/* Caption Overlay */}
      <div style={{
        position: 'absolute', bottom: '50px',
        background: 'rgba(12, 26, 24, 0.85)', backdropFilter: 'blur(16px)',
        padding: '20px 48px', borderRadius: '50px',
        border: `1px solid ${sageGreen}`, boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        transform: `translateY(${captionY}px)`, zIndex: 10
      }}>
        <h2 style={{ margin: 0, color: cream, fontSize: '32px', letterSpacing: '1px', fontWeight: 600 }}>
          {sec.title}
        </h2>
      </div>

      {/* Audio Voiceover for this specific section */}
      <Audio src={staticFile(sec.audio)} />

    </AbsoluteFill>
  );
};

export const EditedPromo: React.FC = () => {
  return (
    <Series>
      {promoTimings.sections.map((sec, index) => (
        <Series.Sequence key={sec.id} durationInFrames={sec.durationFrames}>
          <Scene sec={sec} isLast={index === promoTimings.sections.length - 1} />
        </Series.Sequence>
      ))}
    </Series>
  );
};
