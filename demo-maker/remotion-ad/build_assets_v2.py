#!/usr/bin/env python3
"""
build_assets_v2.py – Extract 3D UI clips from raw screen recording
Uses ffmpeg to slice ProjectTrack_Epic_Demo.mp4 at exact timestamps
"""

import subprocess
import sys
from pathlib import Path

# Define output directory
OUTPUT_DIR = Path("public/assets")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Input video
INPUT_VIDEO = "ProjectTrack_Epic_Demo.mp4"

# Clips to extract: (output_name, start_time, duration)
CLIPS = [
    ("ui_clip_1.mp4", "00:00:15", 4),   # Scene 2: 00:00:15 to 00:00:19 (4 sec)
    ("ui_clip_2.mp4", "00:01:00", 5),   # Scene 4: 00:01:00 to 00:01:05 (5 sec)
    ("ui_clip_3.mp4", "00:00:54", 5),   # Scene 5: 00:00:54 to 00:00:59 (5 sec)
]

def extract_clip(input_file: str, output_file: str, start_time: str, duration: int) -> bool:
    """Extract a clip from input video using ffmpeg."""
    output_path = OUTPUT_DIR / output_file
    
    cmd = [
        "ffmpeg",
        "-i", input_file,
        "-ss", start_time,
        "-t", str(duration),
        "-c:v", "libx264",
        "-preset", "fast",
        "-crf", "23",
        "-c:a", "aac",
        "-b:a", "128k",
        "-y",  # Overwrite output file
        str(output_path),
    ]
    
    print(f"Extracting: {output_file} (start={start_time}, duration={duration}s)")
    
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
        print(f"OK Successfully created: {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error extracting {output_file}:")
        print(e.stderr)
        return False

def main():
    if not Path(INPUT_VIDEO).exists():
        print(f"Error: {INPUT_VIDEO} not found!")
        sys.exit(1)
    
    success_count = 0
    for output_name, start_time, duration in CLIPS:
        if extract_clip(INPUT_VIDEO, output_name, start_time, duration):
            success_count += 1
            
if __name__ == "__main__":
    main()
