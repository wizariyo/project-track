import os
import subprocess

VOICEOVERS = [
    ("vo_intro.mp3", "Welcome to ProjectTrack. The ultimate platform to manage academic projects seamlessly."),
    ("vo_auth.mp3", "Experience secure, role-based authentication. Whether you are a student or a teacher, access your dedicated workspace instantly."),
    ("vo_teacher.mp3", "In the Teacher Dashboard, instructors have a powerful command center to monitor teams, review progress, and evaluate deliverables."),
    ("vo_darkmode.mp3", "Switch to our native Dark Mode for a comfortable viewing experience, day or night."),
    ("vo_kanban.mp3", "Keep everyone in sync with our zero-latency Kanban board. Visualize tasks and move them effortlessly."),
    ("vo_chat.mp3", "Stay connected with built-in real-time chat and file sharing. ProjectTrack: Ship faster, together.")
]

os.makedirs("public/assets", exist_ok=True)

for filename, text in VOICEOVERS:
    filepath = f"public/assets/{filename}"
    cmd = f'python -m edge_tts --voice "en-US-ChristopherNeural" --text "{text}" --write-media "{filepath}"'
    print(f"Generating {filename}...")
    subprocess.run(cmd, shell=True)

print("All Voiceovers generated!")
