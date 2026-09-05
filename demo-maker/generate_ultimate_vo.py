import os
import subprocess

voice_lines = [
    {"name": "vo_1.mp3", "text": "Managing complex college projects is hard. Project Track makes it effortless."},
    {"name": "vo_2.mp3", "text": "With seamless multi-role authentication, teachers and students get tailored, intuitive workspaces."},
    {"name": "vo_3.mp3", "text": "Teachers can instantly create teams, assign subjects, and appoint group leads."},
    {"name": "vo_4.mp3", "text": "Students stay perfectly in sync with a zero-latency Kanban board. Just drag, drop, and conquer."},
    {"name": "vo_5.mp3", "text": "Need to communicate? The integrated chat and file sharing systems mean you never have to leave your workflow."},
    {"name": "vo_6.mp3", "text": "Fully customizable, featuring a beautiful dark mode and live profiles. Project Track. The ultimate student management platform."}
]

print("Generating high-quality TTS for Remotion...")
for line in voice_lines:
    filepath = os.path.join("remotion-ad", "public", line["name"])
    cmd = f'python -m edge_tts --voice en-US-BrianMultilingualNeural --rate=+10% --text "{line["text"]}" --write-media "{filepath}"'
    subprocess.run(cmd, shell=True)
    print(f"Generated {line['name']}")

print("All voiceovers generated!")
