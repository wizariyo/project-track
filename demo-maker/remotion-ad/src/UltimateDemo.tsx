import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, Video, Audio, staticFile } from 'remotion';
import timingsData from './ultimate_timings.json';

export const UltimateDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const bgTeal = '#0C1A18';
  const sageGreen = '#558467';
  const cream = '#EFEABB';

  // Find the active section based on the current frame
  let activeSection = null;
  let timeSinceSectionStart = 0;
  
  for (let i = timingsData.sections.length - 1; i >= 0; i--) {
    const sec = timingsData.sections[i];
    if (frame >= sec.startFrame) {
      activeSection = sec;
      timeSinceSectionStart = frame - sec.startFrame;
      break;
    }
  }

  // Animate the caption (slide up and fade in, then stay)
  const captionY = spring({ 
    frame: timeSinceSectionStart, 
    fps, 
    config: { damping: 14 }, 
    from: 50, 
    to: 0 
  });
  
  const captionOpacity = interpolate(
    timeSinceSectionStart, 
    [0, 15], 
    [0, 1], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(135deg, ${bgTeal} 0%, #000 100%)`, 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif' 
    }}>
      
      {/* BACKGROUND ELEMENTS */}
      <div style={{
        position: 'absolute',
        width: '100%', height: '100%',
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(85,132,103,0.15) 0%, transparent 60%)`
      }}/>

      {/* BROWSER MOCKUP */}
      <div style={{
        width: '1720px', 
        height: '960px',
        background: '#000',
        borderRadius: '16px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        border: `1px solid ${sageGreen}66`,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 5
      }}>
        {/* Browser Top Bar */}
        <div style={{ height: '36px', background: cream, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
          <div style={{ marginLeft: 'auto', marginRight: 'auto', fontSize: '13px', color: '#333', fontWeight: 600, letterSpacing: '0.5px' }}>
            projecttrack.com
          </div>
        </div>

        {/* Video Content */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Video 
            src={staticFile('assets/ProjectTrack_Ultimate_Video.mp4')} 
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#fff' }} 
            muted={true}
          />
        </div>
      </div>

      {/* DYNAMIC SECTION CAPTION */}
      {activeSection && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          background: 'rgba(12, 26, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          padding: '20px 48px',
          borderRadius: '50px',
          border: `1px solid ${sageGreen}`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          transform: `translateY(${captionY}px)`,
          opacity: captionOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10
        }}>
          <h2 style={{ margin: 0, color: cream, fontSize: '32px', letterSpacing: '1px', fontWeight: 600 }}>
            <span style={{ color: sageGreen, marginRight: '16px' }}>{activeSection.id}.</span>
            {activeSection.title}
          </h2>
        </div>
      )}

      {/* AUDIO VOICEOVERS */}
      {timingsData.sections.map((sec) => (
        <Sequence key={sec.id} from={sec.startFrame}>
          <Audio src={staticFile(sec.audio)} />
        </Sequence>
      ))}

    </AbsoluteFill>
  );
};
