import os

def replace_in_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements.items():
        content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Update GoogleAd.tsx colors
replacements_tsx = {
    "#0f172a": "#0C1A18",
    "#1e293b": "#162220",
    "#1a1a2e": "#0C1A18",
    "#16213e": "#17433F",
    "#000000": "#0C1A18"
}
replace_in_file("src/GoogleAd.tsx", replacements_tsx)

# Overwrite GoogleAd.css completely
css_content = """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@700;800&display=swap');

.google-ad-root {
    background-color: #0C1A18;
    font-family: 'Inter', sans-serif;
    color: #EFEABB;
}

.text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
}

.promo-text {
    font-size: 8rem;
    font-weight: 800;
    text-align: center;
    margin: 0;
    letter-spacing: -2px;
    color: #EFEABB;
    text-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 40px rgba(85, 132, 103, 0.4);
    max-width: 80%;
    line-height: 1.1;
}

.floating-ui-container {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 5;
}

.floating-ui {
    width: 70%;
    height: 70%;
    border-radius: 16px;
    box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8), 0 0 0 2px #558467, 0 0 60px rgba(85, 132, 103, 0.3);
    background-color: #162220;
    overflow: hidden;
}

.ui-content {
    width: 100%;
    height: 100%;
}
"""
with open("src/GoogleAd.css", "w", encoding="utf-8") as f:
    f.write(css_content)

# Overwrite Root.tsx to point back to GoogleAd
root_content = """import React from 'react';
import { Composition } from 'remotion';
import { GoogleAd } from './GoogleAd';

export const Root: React.FC = () => {
  return (
    <Composition
      id="ProjectTrackAd"
      component={GoogleAd}
      durationInFrames={30 * 20}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{}}
    />
  );
};
"""
with open("src/Root.tsx", "w", encoding="utf-8") as f:
    f.write(root_content)

# Update index.ts to use Root
index_content = """import { registerRoot } from "remotion";
import { Root } from "./Root";
registerRoot(Root);
"""
with open("src/index.ts", "w", encoding="utf-8") as f:
    f.write(index_content)

print("Done resetting architecture!")
