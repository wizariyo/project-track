import os
from elevenlabs.client import ElevenLabs

elevenlabs = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)

# The Cinematic Voiceover Script divided into 7 scenes
SCENES = [
    {
        "id": "scene_1",
        "text": "We all know how chaotic academic projects can get. Scattered files, missed deadlines, and endless email threads. Meet ProjectTrack—the ultimate, all-in-one collaboration platform built specifically to bridge the gap between students and educators. Right off the bat, you’ll notice our lightning-fast, role-based onboarding. Whether you’re a student logging in to check your tasks, or a professor setting up a new semester, the system instantly routes you to a personalized, distraction-free workspace. No complex setups. Just pure productivity from second one."
    },
    {
        "id": "scene_2",
        "text": "Let’s look at this from the Teacher’s perspective. Managing multiple teams usually feels like herding cats—but not here. With just a few clicks, a professor can create a brand-new project group, assign a specific subject, and even designate a student team lead right from a simple dropdown. Instantly, the team’s hierarchy is set. The workspace is provisioned. And the foundation for a successful project is laid out before a single line of code is written."
    },
    {
        "id": "scene_3",
        "text": "Welcome to the Teacher Command Center. This isn't just a dashboard; it's a bird's-eye view of your entire classroom's heartbeat. When a teacher clicks into a project group, they unlock a powerful 8-tab inspection suite. Want to see who’s actually doing the work? Check the Workload tab for real-time task distribution. Need to review this week’s progress? Jump into the Reports and Deliverables tabs. And when it’s time for grading, the Evaluation tab lets educators assign marks and qualitative feedback seamlessly. Everything you need to track performance is centralized right here. No more jumping between spreadsheets and external tools."
    },
    {
        "id": "scene_4",
        "text": "But we didn’t stop at basic tracking. ProjectTrack is packed with smart insights. The Analytics tab serves up beautifully rendered charts that break down engagement and completion rates, while the Gantt-style Timeline keeps the whole team aligned on deadlines. Stuck on a project idea or need help structuring an assignment? Our built-in AI Assistant is always just a click away, ready to brainstorm with you. And for those late-night grading sessions? We’ve got you covered with a gorgeous, toggleable Dark Mode that’s easy on the eyes."
    },
    {
        "id": "scene_5",
        "text": "Now, let’s flip the script and step into the Student Workspace. This is where the real work happens. At the core of the student experience is our zero-latency Kanban board. It’s designed for deep, focused collaboration. Students can break down massive features into bite-sized tasks, assign priorities, and set strict deadlines. Watch this—a student clicks the timer to track their focused work session. Once they crush that task, they drag it straight into the 'Done' column. And yes... that satisfying confetti pop? That’s the feeling of getting things done."
    },
    {
        "id": "scene_6",
        "text": "Accountability is built into the DNA of ProjectTrack. Every week, students can easily submit structured progress reports to keep their supervisors in the loop. Need to submit the final codebase or a presentation? Just drop it into our secure, integrated file management system. But here is where ProjectTrack truly shines: The Peer Review system. We all know that one group member who ghosts the team. Not anymore. Students can anonymously evaluate their peers on communication, contribution, and dependability. Seeing those 5-star ratings roll in ensures that every single team member is recognized for their hard work."
    },
    {
        "id": "scene_7",
        "text": "To tie it all together, our native, real-time chat system keeps communication flowing seamlessly without ever leaving the platform. From the moment a group is assembled, to task execution, file sharing, peer evaluation, and final grading—ProjectTrack handles the entire lifecycle of an academic project natively. It’s fast, it’s beautiful, and it’s going to change the way you work. Ship faster. Ship together. Welcome to ProjectTrack."
    }
]

VOICES = [
    {"name": "Charlie", "id": "IKne3meq5aSn9XLyUdCD"},
    {"name": "Callum", "id": "N2lVS1w4EtoT3dr4eOWO"}
]

for voice in VOICES:
    folder_path = f"public/assets/{voice['name']}"
    os.makedirs(folder_path, exist_ok=True)
    print(f"\n--- Generating full script for {voice['name']} ---")
    
    for scene in SCENES:
        filename = f"{scene['id']}.mp3"
        filepath = f"{folder_path}/{filename}"
        
        # Skip if already generated (helpful for resuming)
        if os.path.exists(filepath):
            print(f"Skipping {filename}, already exists.")
            continue
            
        print(f"Generating {filename}...")
        try:
            audio = elevenlabs.text_to_speech.convert(
                voice_id=voice['id'],
                text=scene['text'],
                model_id="eleven_v3",
                language_code="en",
            )
            with open(filepath, "wb") as f:
                for chunk in audio:
                    if chunk: f.write(chunk)
            print(f"Saved {filepath}")
        except Exception as e:
            print(f"Failed to generate {filename}: {e}")

print("\nAll folder-wise generation complete!")
