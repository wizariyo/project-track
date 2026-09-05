import os
import subprocess
import json

SECTIONS = [
    {
        "id": "intro",
        "title": "Seamless Onboarding",
        "vo": "Managing college projects is chaotic. Welcome to ProjectTrack, the ultimate collaboration platform built for students and teachers.",
        "durationFrames": 280,
        "vidStartFrame": 200 * 30  # Student login
    },
    {
        "id": "teacher",
        "title": "Teacher Command Center",
        "vo": "Teachers get a bird's-eye view of every team. Instantly monitor workloads, review tasks, and grade students in real-time.",
        "durationFrames": 280,
        "vidStartFrame": 65 * 30   # Teacher inspecting group
    },
    {
        "id": "kanban",
        "title": "Zero-Latency Kanban",
        "vo": "For students, it's all about deep collaboration. A zero-latency Kanban board lets you break down features, track time, and crush tasks.",
        "durationFrames": 340,
        "vidStartFrame": 230 * 30  # Timer and drag to done
    },
    {
        "id": "reports",
        "title": "Reports & File Sync",
        "vo": "Stay accountable with weekly progress reports. Share files, presentations, and code documentation instantly with your entire team.",
        "durationFrames": 280,
        "vidStartFrame": 268 * 30  # File upload dropzone
    },
    {
        "id": "chat",
        "title": "Chat & Peer Review",
        "vo": "Never leave your workspace. Chat directly with your team, and when milestones are hit, evaluate each other using the built-in Peer Review system.",
        "durationFrames": 330,
        "vidStartFrame": 302 * 30  # Peer review stars
    },
    {
        "id": "outro",
        "title": "Dark Mode & AI Assistant",
        "vo": "With a sleek Dark Mode and built-in AI assistance, ProjectTrack is your ultimate academic companion. Ship faster, together.",
        "durationFrames": 300,
        "vidStartFrame": 315 * 30  # Dark mode toggle & AI
    }
]

os.makedirs("public/assets", exist_ok=True)
timings = []

for sec in SECTIONS:
    filename = f"promo_vo_{sec['id']}.mp3"
    filepath = f"public/assets/{filename}"
    cmd = f'python -m edge_tts --voice "en-US-ChristopherNeural" --text "{sec["vo"]}" --write-media "{filepath}"'
    print(f"Generating {filename}...")
    subprocess.run(cmd, shell=True)
    
    timings.append({
        "id": sec["id"],
        "title": sec["title"],
        "durationFrames": sec["durationFrames"],
        "vidStartFrame": sec["vidStartFrame"],
        "audio": f"assets/{filename}"
    })

with open("src/promo_timings.json", "w") as f:
    json.dump({"sections": timings}, f, indent=2)

print("Promo Voiceovers generated!")
