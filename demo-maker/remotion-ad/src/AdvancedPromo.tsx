import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate, Video } from 'remotion';

export const AdvancedPromo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // COLORS
  const bgTeal = '#0C1A18';
  const sageGreen = '#558467';
  const cream = '#EFEABB';
  const amber = '#F59E0B';

  // --- ANIMATIONS ---
  const titleY = spring({ frame, fps, config: { damping: 12 }, from: -200, to: 0 });
  const titleOpacity = interpolate(frame, [0, 15], [0, 1]);
  const titleScale = interpolate(frame, [0, 60, 90], [1, 1, 1.2]);
  
  const videoScale = spring({ frame: frame - 60, fps, config: { damping: 14 }, from: 0.5, to: 1 });
  const videoOpacity = interpolate(frame, [60, 75], [0, 1]);
  
  const cardY = spring({ frame: frame - 150, fps, config: { damping: 10 }, from: 100, to: 0 });
  const cardOpacity = interpolate(frame, [150, 165], [0, 1]);
  const cardScale = spring({ frame: frame - 150, fps, config: { damping: 12 }, from: 0.5, to: 1.1 });
  
  const starOpacity = interpolate(frame, [250, 260], [0, 1]);
  const starScale = spring({ frame: frame - 250, fps, config: { damping: 8 }, from: 0, to: 1.5 });

  return (
    <AbsoluteFill style={{ backgroundColor: bgTeal, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <Sequence from={0} durationInFrames={360}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ 
            color: cream, 
            fontSize: 140, 
            fontFamily: 'sans-serif',
            fontWeight: 'bold',
            transform: `translateY(${titleY}px) scale(${titleScale})`,
            opacity: titleOpacity,
            margin: 0
          }}>
            ProjectTrack
          </h1>
          <p style={{
            color: sageGreen,
            fontSize: 40,
            fontFamily: 'sans-serif',
            transform: `translateY(${titleY + 50}px)`,
            opacity: interpolate(frame, [15, 30], [0, 1])
          }}>
            Smart Project Tracking for Academic Teams
          </p>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={60} durationInFrames={300}>
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            transform: `scale(${videoScale}) translateY(${interpolate(frame, [60, 90], [200, 0])}px)`,
            opacity: videoOpacity,
            position: 'relative',
            width: '1200px',
            height: '700px',
            boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `4px solid ${sageGreen}`
          }}>
             {/* Using the 5-min video that actually saved instead of a missing full video */}
            <Video 
              src="/assets/ProjectTrack_Max_10Min.mp4" 
              onError={() => console.log('Video error skipped')}
              startFrom={120} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        </AbsoluteFill>
      </Sequence>

      <Sequence from={150} durationInFrames={210}>
         <div style={{
            position: 'absolute',
            top: '30%',
            right: '15%',
            width: '320px',
            background: cream,
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            transform: `translateY(${cardY}px) scale(${cardScale}) rotate(5deg)`,
            opacity: cardOpacity,
         }}>
            <div style={{ color: bgTeal, fontWeight: 'bold', fontSize: '24px', marginBottom: '8px' }}>Setup CI/CD Pipeline</div>
            <div style={{ color: sageGreen, fontSize: '18px' }}>High Priority</div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
               <div style={{ background: amber, padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>Dev</div>
               <div style={{ background: bgTeal, color: cream, padding: '6px 12px', borderRadius: '20px', fontSize: '14px' }}>Due: Nov 10</div>
            </div>
         </div>
      </Sequence>

      <Sequence from={250} durationInFrames={110}>
         <div style={{
            position: 'absolute',
            bottom: '20%',
            left: '20%',
            background: bgTeal,
            border: `2px solid ${sageGreen}`,
            padding: '30px',
            borderRadius: '24px',
            boxShadow: '0 40px 80px rgba(0,0,0,0.8)',
            opacity: starOpacity,
            transform: `scale(${starScale}) rotate(-3deg)`
         }}>
             <div style={{ color: cream, fontSize: '28px', marginBottom: '16px', fontWeight: 'bold' }}>Jane Doe - Contribution</div>
             <div style={{ display: 'flex', gap: '12px' }}>
                {[1,2,3,4,5].map(i => (
                  <svg key={i} width="40" height="40" viewBox="0 0 24 24" fill={amber}>
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                ))}
             </div>
         </div>
      </Sequence>
    </AbsoluteFill>
  );
};
