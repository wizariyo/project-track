#!/usr/bin/env python3
"""
build_assets.py
================
Prepares every asset the Remotion "ProjectTrack" ad needs, and writes a single
`timings.json` that drives the whole timeline. Nothing in Remotion ever guesses
a frame number â€” it all comes from here.

Pipeline:
  1. Slice ProjectTrack_Epic_Demo.mp4 into 6 physically separate 10s clips
     (fixes the startFrom() black-screen bug â€” Remotion never seeks inside
     the big source file, it just plays small self-contained chunks).
  2. Generate one AI voiceover per scene with edge-tts.
  3. ffprobe the EXACT duration of each voiceover (and each clip).
  4. Compute startFrame / durationInFrames per scene from the VO length,
     so scenes are placed back-to-back with zero gaps and zero overlaps.
  5. Copy mac_frame.png into public/assets so Remotion's staticFile() can
     find everything in one place.

Requirements:
    pip install edge-tts
    ffmpeg + ffprobe must be on your PATH

Usage:
    python build_assets.py
"""

import asyncio
import json
import math
import shutil
import subprocess
import sys
from pathlib import Path

import edge_tts

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
FPS = 30
SOURCE_VIDEO = "ProjectTrack_Epic_Demo.mp4"
MAC_FRAME_SRC = "mac_frame.png"
OUTPUT_DIR = Path("public/assets")          # Remotion serves everything under /public
CLIP_DURATION_SEC = 10
VOICE = "en-US-GuyNeural"                   # confident "keynote" voice
# Other good options: "en-US-ChristopherNeural", "en-GB-RyanNeural", "en-US-AriaNeural"
VOICE_RATE = "+2%"

# Extra silent B-roll time appended AFTER each voiceover ends, purely visual â€”
# this does NOT create a gap in narration (audio still plays back-to-back),
# it just gives the cut a beat of breathing room before the next VO starts.
TRAILING_PADDING_FRAMES = 12                # ~0.4s @ 30fps

# ---------------------------------------------------------------------------
# SCENE DEFINITIONS
# start_ts values are your exact requested slice points. In order, they line
# up with the features you described: Intro / Auth / Teacher Dashboard /
# Kanban / Chat / Dark Mode+Outro.
# ---------------------------------------------------------------------------
SCENES = [
    {
        "id": 1,
        "start_ts": "00:00:00",
        "feature": "Intro",
        "title": "Meet ProjectTrack",
        "highlight": "ProjectTrack",
        "script": "Managing college projects shouldn't feel like chaos. Meet ProjectTrack.",
    },
    {
        "id": 2,
        "start_ts": "00:00:15",
        "feature": "Multi-role Auth",
        "title": "One Platform. Every Role.",
        "highlight": "Every Role",
        "script": "One secure login for everyone. Teachers and students, instantly connected.",
    },
    {
        "id": 3,
        "start_ts": "00:00:27",
        "feature": "Teacher Dashboard",
        "title": "Build Your Team",
        "highlight": "Team",
        "script": "Teachers create groups in seconds, assign a lead, and watch progress unfold in real time.",
    },
    {
        "id": 4,
        "start_ts": "00:01:00",
        "feature": "Kanban Board",
        "title": "Work, Visualized",
        "highlight": "Visualized",
        "script": "Drag. Drop. Done. A Kanban board that keeps every student on track.",
    },
    {
        "id": 5,
        "start_ts": "00:01:13",
        "feature": "Chat & Files",
        "title": "Never Miss a Beat",
        "highlight": "Never Miss",
        "script": "Chat with your teacher, share files instantly, and keep every conversation in one place.",
    },
    {
        "id": 6,
        "start_ts": "00:00:54",
        "feature": "Dark Mode & Outro",
        "title": "ProjectTrack. Reimagined.",
        "highlight": "Reimagined",
        "script": "Beautifully designed, effortlessly dark. This is ProjectTrack. Try it today.",
    },
]


# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def run(cmd: list[str]) -> None:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(
            f"Command failed: {' '.join(cmd)}\n--- stderr ---\n{result.stderr}"
        )


def slice_clip(start_ts: str, duration_sec: int, out_path: Path) -> None:
    """Cut a precise, self-contained, re-encoded chunk (never used with
    startFrom in Remotion â€” this IS the seek)."""
    cmd = [
        "ffmpeg", "-y",
        "-ss", start_ts,
        "-i", SOURCE_VIDEO,
        "-t", str(duration_sec),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-movflags", "+faststart",
        str(out_path),
    ]
    run(cmd)


async def generate_voiceover(text: str, out_path: Path) -> None:
    communicate = edge_tts.Communicate(text, VOICE, rate=VOICE_RATE)
    await communicate.save(str(out_path))


def ffprobe_duration_ms(path: Path) -> int:
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "json",
        str(path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=True)
    data = json.loads(result.stdout)
    seconds = float(data["format"]["duration"])
    return round(seconds * 1000)


# ---------------------------------------------------------------------------
# MAIN ORCHESTRATION
# ---------------------------------------------------------------------------
async def build() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    if Path(MAC_FRAME_SRC).exists():
        shutil.copy(MAC_FRAME_SRC, OUTPUT_DIR / "mac_frame.png")
        print(f"âœ” Copied {MAC_FRAME_SRC} -> {OUTPUT_DIR / 'mac_frame.png'}")
    else:
        print(f"âš  Warning: {MAC_FRAME_SRC} not found next to this script. "
              f"Copy it into {OUTPUT_DIR}/mac_frame.png manually before rendering.")

    timeline = []
    cursor_frame = 0

    for scene in SCENES:
        clip_name = f"clip_{scene['id']}.mp4"
        audio_name = f"voice_{scene['id']}.mp3"
        clip_path = OUTPUT_DIR / clip_name
        audio_path = OUTPUT_DIR / audio_name

        print(f"\n[{scene['id']}/6] {scene['feature']}")
        print(f"    â†’ slicing @ {scene['start_ts']} for {CLIP_DURATION_SEC}s ...")
        slice_clip(scene["start_ts"], CLIP_DURATION_SEC, clip_path)

        print(f"    â†’ generating voiceover: \"{scene['script']}\"")
        await generate_voiceover(scene["script"], audio_path)

        audio_ms = ffprobe_duration_ms(audio_path)
        video_ms = ffprobe_duration_ms(clip_path)
        audio_frames = math.ceil((audio_ms / 1000) * FPS)
        scene_duration = audio_frames + TRAILING_PADDING_FRAMES

        print(f"    â†’ VO duration: {audio_ms}ms  |  scene length: {scene_duration}f "
              f"({scene_duration / FPS:.2f}s)  |  startFrame: {cursor_frame}")

        timeline.append({
            "id": scene["id"],
            "feature": scene["feature"],
            "title": scene["title"],
            "highlight": scene["highlight"],
            "script": scene["script"],
            "clip": f"assets/{clip_name}",
            "audio": f"assets/{audio_name}",
            "audioDurationMs": audio_ms,
            "videoDurationMs": video_ms,
            "startFrame": cursor_frame,
            "durationInFrames": scene_duration,
        })

        cursor_frame += scene_duration

    payload = {
        "fps": FPS,
        "totalDurationInFrames": cursor_frame,
        "scenes": timeline,
    }

    with open("timings.json", "w") as f:
        json.dump(payload, f, indent=2)

    print(f"\nâœ… Done. Total video length: {cursor_frame} frames "
          f"(~{cursor_frame / FPS:.1f}s) across {len(timeline)} scenes.")
    print("   timings.json written to project root.")
    print(f"   Assets written to {OUTPUT_DIR}/")


if __name__ == "__main__":
    if not Path(SOURCE_VIDEO).exists():
        sys.exit(f"âŒ Cannot find {SOURCE_VIDEO} â€” place it next to this script and re-run.")
    asyncio.run(build())
