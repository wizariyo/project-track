import os
import subprocess
import json

# Total video length: ~477 seconds
# Let's space out 7 sections. 477 / 7 = ~68 seconds per section
SECTIONS = [
    {
        "id": 1,
        "title": "Seamless Onboarding",
        "vo": "Welcome to ProjectTrack. Our platform offers secure, role-based authentication, instantly routing students and teachers to their personalized workspaces.",
        "start_sec": 5
    },
    {
        "id": 2,
        "title": "Group & Team Assembly",
        "vo": "Teachers have complete control. They can effortlessly create new project groups, assign subjects, and designate student team leads from a unified interface.",
        "start_sec": 70
    },
    {
        "id": 3,
        "title": "Teacher Command Center",
        "vo": "The Teacher Dashboard provides a bird's-eye view of all academic groups. You can inspect workloads, review task progress, and track overall team activity.",
        "start_sec": 135
    },
    {
        "id": 4,
        "title": "Student Collaboration",
        "vo": "The Student Workspace is built for deep collaboration. A zero-latency Kanban board allows teams to break down features, assign tasks, and track time effortlessly.",
        "start_sec": 240
    },
    {
        "id": 5,
        "title": "Reports & File Management",
        "vo": "Stay accountable with structured weekly progress reports. The integrated file management system ensures all your deliverables and code documentation are organized in one place.",
        "start_sec": 300
    },
    {
        "id": 6,
        "title": "Real-time Communication",
        "vo": "Real-time, role-specific chat channels keep everyone connected. When milestones are hit, the Peer Review system allows teammates to evaluate each other constructively.",
        "start_sec": 370
    },
    {
        "id": 7,
        "title": "Final Evaluation & Dark Mode",
        "vo": "With a sleek, toggleable Dark Mode, ProjectTrack is easy on the eyes day or night. Teachers can seamlessly evaluate deliverables and grade students in real-time.",
        "start_sec": 420
    }
]

os.makedirs("public/assets", exist_ok=True)
timings = []

for sec in SECTIONS:
    filename = f"ult_vo_{sec['id']}.mp3"
    filepath = f"public/assets/{filename}"
    cmd = f'python -m edge_tts --voice "en-US-ChristopherNeural" --text "{sec["vo"]}" --write-media "{filepath}"'
    print(f"Generating {filename}...")
    subprocess.run(cmd, shell=True)
    
    timings.append({
        "id": sec["id"],
        "title": sec["title"],
        "startFrame": int(sec["start_sec"] * 30),
        "durationFrames": 300, # Approx 10 seconds of speech
        "audio": f"assets/{filename}"
    })

with open("src/ultimate_timings.json", "w") as f:
    json.dump({"sections": timings, "totalFrames": int(477.8 * 30)}, f, indent=2)

print("All Ultimate Voiceovers generated and timings saved!")
