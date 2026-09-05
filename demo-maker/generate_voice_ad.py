import os
import subprocess

# Define the script and timings
voice_lines = [
    {"time": 0, "text": "Managing college projects used to be chaotic. Welcome to Project Track, where everything is in one place."},
    {"time": 9, "text": "Students can sign up in seconds, selecting their semester and project role."},
    {"time": 18, "text": "Teachers get their own portal to manage all subjects and assignments easily."},
    {"time": 27, "text": "Creating a new project group is seamless. Teachers can name the team, select the subject, and assign a group lead with just a few clicks."},
    {"time": 45, "text": "Once assigned, students can log into their personalized dashboard to see their active projects."},
    {"time": 54, "text": "The interface is fully customizable. You can even toggle a beautiful dark mode."},
    {"time": 60, "text": "To keep the team on track, students can use the built-in Kanban board. Just add a task, set the details, and assign it to a team member."},
    {"time": 73, "text": "Need help from the professor? The integrated chat system lets you communicate instantly without leaving the workspace."},
    {"time": 82, "text": "Submitting work is just as easy. Students can upload their deliverables directly into the project files."},
    {"time": 91, "text": "Project Track makes student collaboration effortless. Try it today!"}
]

# Generate audio files
audio_files = []
print("Generating Human-like AI Voiceover...")
for i, line in enumerate(voice_lines):
    filename = f"voice_{i}.mp3"
    audio_files.append(filename)
    cmd = f'python -m edge_tts --voice en-US-BrianMultilingualNeural --text "{line["text"]}" --write-media {filename}'
    subprocess.run(cmd, shell=True)
    print(f"Generated line {i+1}/10")

print("Stitching Audio to Video with FFmpeg...")

# Build FFmpeg complex filter
inputs = ['-i', 'ProjectTrack_Epic_Demo.mp4']
for audio in audio_files:
    inputs.extend(['-i', audio])

filter_complex = ""
mix_inputs = ""

for i, line in enumerate(voice_lines):
    delay_ms = line["time"] * 1000
    # aevalsrc is used to pad the audio so it starts at the correct time
    filter_complex += f"[{i+1}:a]adelay={delay_ms}|{delay_ms}[a{i}];"
    mix_inputs += f"[a{i}]"

# Mix all audio tracks together without expecting bg_audio from stream 0
filter_complex += f"{mix_inputs}amix=inputs={len(voice_lines)}:duration=longest[outa]"

output_file = "ProjectTrack_Full_Demo_With_Voice.mp4"

# Execute FFmpeg
ffmpeg_cmd = [
    'ffmpeg', '-y'
] + inputs + [
    '-filter_complex', filter_complex,
    '-map', '0:v',
    '-map', '[outa]',
    '-c:v', 'copy',
    '-c:a', 'aac',
    output_file
]

subprocess.run(ffmpeg_cmd)

# Cleanup temp audio files
for audio in audio_files:
    if os.path.exists(audio):
        os.remove(audio)

print(f"DONE! Final video saved as {output_file}")
