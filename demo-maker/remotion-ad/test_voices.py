import os
from elevenlabs.client import ElevenLabs

elevenlabs = ElevenLabs(
    api_key=os.getenv("ELEVENLABS_API_KEY")
)

test_text = "We all know how chaotic academic projects can get. Scattered files, missed deadlines, and endless email threads. Meet ProjectTrack."

VOICES = [
    {"name": "Charlie_Conversational", "id": "IKne3meq5aSn9XLyUdCD"},
    {"name": "Callum_Energetic", "id": "N2lVS1w4EtoT3dr4eOWO"},
    {"name": "Rachel_Professional", "id": "21m00Tcm4TlvDq8ikWAM"}
]

os.makedirs("public/assets", exist_ok=True)

for v in VOICES:
    filepath = f"public/assets/test_voice_{v['name']}.mp3"
    print(f"Testing {v['name']}...")
    try:
        audio = elevenlabs.text_to_speech.convert(
            voice_id=v['id'],
            text=test_text,
            model_id="eleven_v3",
            language_code="en",
        )
        with open(filepath, "wb") as f:
            for chunk in audio:
                if chunk: f.write(chunk)
        print(f"Saved {filepath}")
    except Exception as e:
        print(f"Failed {v['name']}: {e}")
