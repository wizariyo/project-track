import os
import subprocess
import json

# Total video length is ~477 seconds (14334 frames)
# We divide it into 6 chunks, each roughly 75-80 seconds.
SECTIONS = [
    {
        "id": "1",
        "title": "Seamless Onboarding",
        "startFrame": 0,
        "vo": "Welcome to the ultimate walkthrough of Project Track. What you are seeing on screen right now is the seamless onboarding process. We designed this platform from the ground up to handle complex academic and collaborative environments. Right now, the system is automatically registering our student accounts. Notice how quickly the user interface responds. We believe that onboarding should be entirely frictionless. Now, we are shifting over to the teacher's perspective. The teacher account is being created. Once logged in, the teacher has the power to manage everything. Here, the teacher is creating a brand new project group. They can instantly assign subjects, pick a specific project name, and even designate a student as the team lead right from the dropdown menu. This ensures that before any work even begins, the hierarchy and structure of the team are perfectly established."
    },
    {
        "id": "2",
        "title": "Teacher Command Center",
        "startFrame": 2400, # 80 seconds
        "vo": "With the group successfully created, we transition into the Teacher Dashboard. This is the command center. We are now injecting some simulated project data so you can see exactly how a fully active workspace looks. The teacher clicks into the group inspection modal, which is divided into eight powerful tabs. First, they can review the overall workload and see how tasks are distributed among team members. Then, they can inspect submitted progress reports and project files. The evaluation tab is particularly special, it allows the teacher to assign grades and provide qualitative remarks seamlessly. We also have tabs for recent activity, peer reviews, and deliverables. Everything a supervisor needs to track a student's performance is available in one unified view, eliminating the need to jump between different tools or spreadsheets."
    },
    {
        "id": "3",
        "title": "Analytics & AI Integration",
        "startFrame": 4800, # 160 seconds
        "vo": "Communication is just as important as task management. Here, the teacher accesses the built-in real-time chat system to send a quick update to the team. Next, we explore the rich analytics section, featuring beautifully rendered charts that break down task completion rates and student engagement. The timeline or Gantt chart view provides a visual representation of the project's schedule, while the integrated calendar keeps everyone aligned on upcoming deadlines. We have also integrated an advanced AI Assistant directly into the platform. With just a click, teachers and students can generate intelligent prompts, brainstorm ideas, or get help structuring their project data. And of course, the entire interface supports a gorgeous dark mode, which we just toggled, making it comfortable to work late into the night."
    },
    {
        "id": "4",
        "title": "Student Workspace & Kanban",
        "startFrame": 6900, # 230 seconds
        "vo": "Now, let's switch gears and look at the platform from the student's perspective. The student logs in and is immediately greeted by their subject cards. Upon selecting their active subject, they enter the student workspace. The heart of this workspace is the zero-latency Kanban board. It provides a crystal-clear overview of what needs to be done. Watch as the student starts a timer on a specific task; a floating widget keeps track of their focused work sessions. Once the work is complete, they stop the timer and drag the task into the Done column. And to celebrate their hard work, a satisfying confetti animation triggers across the screen! They can also easily add new tasks, set priorities, and assign deadlines using the intuitive modal interface."
    },
    {
        "id": "5",
        "title": "Reports, Files & Peer Review",
        "startFrame": 9000, # 300 seconds
        "vo": "Beyond simple task tracking, Project Track excels at accountability. The student navigates to the reports tab to submit a comprehensive weekly progress report, detailing the hours worked, the tasks completed, and any blockers they might be facing. This structured reporting keeps supervisors fully informed. Next, we move to the project files section. The student selects a category and securely uploads their final code documentation or presentation directly into the cloud storage via a beautiful drag-and-drop zone. We then see the timeline and calendar views from the student's side, ensuring they never miss a milestone. But one of the most innovative features is the Peer Review system. Here, the student can anonymously evaluate their teammates across metrics like contribution, communication, and dependability. We can see them awarding a well-deserved five-star rating to their peers."
    },
    {
        "id": "6",
        "title": "End-to-End Lifecycle",
        "startFrame": 11700, # 390 seconds
        "vo": "Finally, the student checks the real-time chat to send a quick confirmation message to the professor, letting them know that the week's deliverables have been uploaded. Just like the teacher, the student can also enjoy a seamless dark mode experience, toggling it on and off effortlessly. The platform is designed to be responsive, lightning-fast, and incredibly user-friendly for both roles. As the student logs out and the teacher logs back in to verify the newly submitted reports and files, you can see the complete, end-to-end lifecycle of an academic project. From the initial group creation to task execution, file sharing, peer evaluation, and final grading, Project Track handles it all natively. Thank you for watching this deep dive into our platform. We built this to revolutionize how student projects are managed, and we can't wait for you to experience it."
    }
]

os.makedirs("public/assets", exist_ok=True)
timings = []

for sec in SECTIONS:
    filename = f"full_vo_{sec['id']}.mp3"
    filepath = f"public/assets/{filename}"
    cmd = f'python -m edge_tts --voice "en-US-ChristopherNeural" --text "{sec["vo"]}" --write-media "{filepath}"'
    print(f"Generating {filename}...")
    subprocess.run(cmd, shell=True)
    
    timings.append({
        "id": sec["id"],
        "title": sec["title"],
        "startFrame": sec["startFrame"],
        "durationFrames": 2400, # Arbitrary long duration since we just overlay them
        "audio": f"assets/{filename}"
    })

with open("src/ultimate_timings.json", "w") as f:
    json.dump({"sections": timings, "totalFrames": 14334}, f, indent=2)

print("All Continuous Ultimate Voiceovers generated and timings saved!")
