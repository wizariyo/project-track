import os
import subprocess
import json

# Configuration
raw_video = "ProjectTrack_Epic_Demo.mp4"
clips = [
    {"id": 1, "start": "00:00:00", "text": "Managing complex college projects is hard. We fixed it with Project Track."},
    {"id": 2, "start": "00:00:15", "text": "Experience seamless multi-role authentication for teachers and students."},
    {"id": 3, "start": "00:00:27", "text": "Teachers can instantly create teams, assign subjects, and appoint group leads."},
    {"id": 4, "start": "00:01:00", "text": "Students stay perfectly in sync with a zero-latency Kanban board."},
    {"id": 5, "start": "00:01:13", "text": "Integrated chat and file sharing means you never have to leave your workflow."},
    {"id": 6, "start": "00:00:54", "text": "Fully customizable with a beautiful dark mode. Project Track is the ultimate platform."}
]

public_dir = os.path.join("remotion-ad", "public")
os.makedirs(public_dir, exist_ok=True)

print("1. Extracting 10-second perfect clips & Generating Audio...")
timings = []
current_frame = 0
fps = 30

for item in clips:
    cid = item["id"]
    # 1. Extract Video Clip (10 seconds exact)
    clip_file = os.path.join(public_dir, f"clip_{cid}.mp4")
    cmd_ext = f'ffmpeg -y -i {raw_video} -ss {item["start"]} -t 00:00:10 -c:v copy "{clip_file}" -loglevel error'
    subprocess.run(cmd_ext, shell=True)
    
    # 2. Generate Audio TTS
    audio_file = os.path.join(public_dir, f"vo_{cid}.mp3")
    cmd_tts = f'python -m edge_tts --voice en-US-BrianMultilingualNeural --rate=+5% --text "{item["text"]}" --write-media "{audio_file}"'
    subprocess.run(cmd_tts, shell=True)
    
    # 3. Get Audio Duration
    cmd_dur = f'ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "{audio_file}"'
    dur_str = subprocess.check_output(cmd_dur, shell=True).decode('utf-8').strip()
    dur_sec = float(dur_str) + 0.5 # Add 0.5s padding per scene for smooth transition
    
    duration_frames = int(dur_sec * fps)
    
    timings.append({
        "id": cid,
        "text": item["text"],
        "startFrame": current_frame,
        "durationFrames": duration_frames
    })
    
    current_frame += duration_frames

total_frames = current_frame + 60 # Extra 2 seconds for outro

# Save timings for Remotion
with open(os.path.join("remotion-ad", "src", "timings.json"), "w") as f:
    json.dump({"timings": timings, "totalFrames": total_frames}, f)

print(f"Total Frames: {total_frames}")
print("2. Generating Perfect Remotion React Code...")

tsx_code = """
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Video, Sequence, staticFile, Audio } from 'remotion';
import data from './timings.json';

export const AppleAd = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleStyle: React.CSSProperties = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontWeight: 800, fontSize: 80, textAlign: 'center', letterSpacing: '-0.03em', color: 'white',
    position: 'absolute', width: '100%', top: '10%', textShadow: '0px 10px 30px rgba(0,0,0,0.5)',
    padding: '0 100px', boxSizing: 'border-box'
  };

  const getScene = (scene, index) => {
    const localFrame = frame - scene.startFrame;
    if (localFrame < 0 || localFrame > scene.durationFrames) return null;

    // Animations
    const textOpacity = interpolate(localFrame, [0, 15, scene.durationFrames - 15, scene.durationFrames], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
    const textY = interpolate(localFrame, [0, 15], [30, 0], { extrapolateRight: 'clamp' });
    
    const macProgress = spring({ frame: localFrame - 5, fps, config: { damping: 14 } });
    const macScale = interpolate(macProgress, [0, 1], [0.85, 1]);
    const macOpacity = interpolate(localFrame, [5, 20, scene.durationFrames - 10, scene.durationFrames], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

    return (
      <AbsoluteFill key={scene.id}>
        <Audio src={staticFile(`vo_${scene.id}.mp3`)} />
        <div style={{ ...titleStyle, opacity: textOpacity, transform: `translateY(${textY}px)` }}>
          {scene.text}
        </div>
        
        <div style={{
          position: 'absolute', top: '55%', left: '50%', width: 1600, height: 900,
          marginLeft: -800, marginTop: -450, opacity: macOpacity,
          transform: `scale(${macScale})`,
          boxShadow: '0 50px 100px rgba(0,0,0,0.8)'
        }}>
          <img src={staticFile('mac_frame.png')} style={{ position: 'absolute', width: '110%', height: '115%', top: '-5%', left: '-5%', zIndex: 10 }} />
          <div style={{ position: 'absolute', top: 40, left: 160, width: 1280, height: 800, backgroundColor: '#111', zIndex: 1, overflow: 'hidden' }}>
            <Video src={staticFile(`clip_${scene.id}.mp4`)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted />
          </div>
        </div>
      </AbsoluteFill>
    );
  };

  return (
    <AbsoluteFill style={{ backgroundColor: 'black', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '20%', left: '30%', width: '40%', height: '60%', background: 'radial-gradient(circle, rgba(0,100,255,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(100px)' }} />
      {data.timings.map((scene, i) => getScene(scene, i))}
    </AbsoluteFill>
  );
};
"""

with open(os.path.join("remotion-ad", "src", "AppleAd.tsx"), "w") as f:
    f.write(tsx_code)

root_code = f"""
import {{ Composition }} from 'remotion';
import {{ AppleAd }} from './AppleAd';
import data from './timings.json';

export const RemotionRoot = () => {{
  return (
    <>
      <Composition
        id="ProjectTrackAd"
        component={{AppleAd}}
        durationInFrames={{data.totalFrames}}
        fps={{30}}
        width={{1920}}
        height={{1080}}
      />
    </>
  );
}};
"""

with open(os.path.join("remotion-ad", "src", "Root.tsx"), "w") as f:
    f.write(root_code)

print("3. Code generated successfully! Run 'cd remotion-ad && npm run build'")
