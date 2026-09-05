import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, Video, staticFile } from 'remotion';

export const SleekPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const bgTeal = '#0C1A18';
  const sageGreen = '#558467';
  const cream = '#EFEABB';

  const S1_INTRO = 0;
  const S2_DASHBOARD = 120;
  const S3_TABS = 240;

  // Simple, elegant zoom from 0.8 to 0.9. No crazy panning.
  const scale = interpolate(frame, 
    [S1_INTRO, S1_INTRO + 30, S2_DASHBOARD, S2_DASHBOARD + 30, S3_TABS, S3_TABS + 30], 
    [0.9, 0.85, 0.85, 0.9, 0.9, 0.85], 
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const getCaption = (f: number) => {
    if (f >= S3_TABS) return "Detailed Analytics & Insights";
    if (f >= S2_DASHBOARD) return "Real-time Teacher Dashboard";
    return "Welcome to ProjectTrack";
  };

  const captionY = spring({ frame: frame % 120, fps, config: { damping: 12 }, from: 50, to: 0 });
  const captionOpacity = interpolate(frame % 120, [0, 15, 105, 120], [0, 1, 1, 0]);

  return (
    <AbsoluteFill style={{ 
      background: `linear-gradient(135deg, ${bgTeal} 0%, #000 100%)`, 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: 'sans-serif' 
    }}>
      
      {/* PERFECTLY CENTERED BROWSER WINDOW */}
      <div style={{
        width: '1600px', // Wider, closer to 16:9
        height: '900px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        overflow: 'hidden',
        border: `1px solid ${sageGreen}66`,
        transform: `scale(${scale})`,
        display: 'flex',
        flexDirection: 'column',
        transformOrigin: 'center center'
      }}>
        <div style={{ height: '40px', background: cream, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '8px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FF5F56' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27C93F' }} />
          <div style={{ marginLeft: 'auto', marginRight: 'auto', fontSize: '13px', color: '#666', fontWeight: 500 }}>
            projecttrack.com
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: cream }}>
          
          <Sequence from={S1_INTRO} durationInFrames={120}>
            {/* Starts exactly at login form */}
            <Video src={staticFile('assets/Fixed_Demo.mp4')} startFrom={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={()=>console.log('err')} />
          </Sequence>

          <Sequence from={S2_DASHBOARD} durationInFrames={120}>
            {/* Jumps to Dashboard */}
            <Video src={staticFile('assets/Fixed_Demo.mp4')} startFrom={2000} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={()=>console.log('err')} />
          </Sequence>

          <Sequence from={S3_TABS} durationInFrames={120}>
            {/* Jumps to Analytics */}
            <Video src={staticFile('assets/Fixed_Demo.mp4')} startFrom={4000} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={()=>console.log('err')} />
          </Sequence>

        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '60px',
        background: 'rgba(12, 26, 24, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '16px 40px',
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
        <h2 style={{ margin: 0, color: cream, fontSize: '28px', letterSpacing: '1px' }}>
          {getCaption(frame)}
        </h2>
      </div>

    </AbsoluteFill>
  );
};
