import os

# ProjectTrack Theme Colors
BG_COLOR = "#0C1A18"         # Deep Dark Teal
SURFACE_COLOR = "#162220"    # Slightly lighter teal surface
ACCENT_COLOR = "#558467"     # Sage
ACCENT_GLOW = "#7BCA9C"      # Brighter sage for neon glow
TEXT_COLOR = "#EFEABB"       # Cream
BORDER_COLOR = "#17433F"     # Teal border

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements.items():
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

replacements = {
    "#0B0F19": BG_COLOR,
    "#1E293B": SURFACE_COLOR,
    "#84CC16": ACCENT_GLOW,
    "rgba(132,204,22": "rgba(123,202,156",
    "#334155": BORDER_COLOR,
    "white": TEXT_COLOR,
    "#E2E8F0": TEXT_COLOR,
    "color: 'white'": f"color: '{TEXT_COLOR}'",
    "background: 'white'": f"background: '{TEXT_COLOR}'",
    "background-color: #0B0F19": f"background-color: {BG_COLOR}",
    "color: white": f"color: {TEXT_COLOR}",
    
    # Text content updates
    "'Design'": "'Requirement'",
    "'Development'": "'UI Design'",
    "'QA'": "'Database'",
    "'Deployment'": "'Development'",
    "'Launch'": "'Deployment'",
    
    # Names
    "'Alex'": "'Yathaarth'",
    "'Sam'": "'Aryan'",
    "'Jordan'": "'Priya'",
    "'Casey'": "'Rahul'",
    "'Morgan'": "'Neha'",
    "'Taylor'": "'Aditya'",
    
    # ProjectTrack text
    "Dashboard": "Team Dashboard"
}

files = [
    "src/ProjectTrackShowcase.css",
    "src/scenes/OpeningScene.tsx",
    "src/scenes/GanttChartScene.tsx",
    "src/scenes/KanbanBoardScene.tsx",
    "src/scenes/ResourceDashboardScene.tsx",
    "src/scenes/MobileSyncScene.tsx",
    "src/scenes/ClosingScene.tsx"
]

for file in files:
    if os.path.exists(file):
        replace_in_file(file, replacements)
        print(f"Updated {file}")
