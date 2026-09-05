import os
import subprocess

VOICEOVERS = [
    ("vo_1.mp3", "Welcome to ProjectTrack. Our platform offers secure, role-based authentication, instantly routing students and teachers to their personalized workspaces."),
    ("vo_2.mp3", "The Student Dashboard gives a crystal-clear overview of your academic projects. Track overall progress and monitor upcoming milestones."),
    ("vo_3.mp3", "Collaboration is seamless with our zero-latency Kanban board. Move tasks effortlessly to keep your entire team in sync."),
    ("vo_4.mp3", "Teachers have a dedicated command center. They can inspect student progress, review deliverables, and provide structured peer-review feedback."),
    ("vo_5.mp3", "With built-in real-time chat and a native Dark Mode, your team stays connected day or night. ProjectTrack: Ship faster, together.")
]

os.makedirs("public/assets", exist_ok=True)

for filename, text in VOICEOVERS:
    filepath = f"public/assets/{filename}"
    cmd = f'python -m edge_tts --voice "en-US-ChristopherNeural" --text "{text}" --write-media "{filepath}"'
    print(f"Generating {filename}...")
    subprocess.run(cmd, shell=True)

print("All Voiceovers generated!")
