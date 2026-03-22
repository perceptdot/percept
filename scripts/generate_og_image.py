#!/usr/bin/env python3
"""Generate og-image.png (1200x630) for perceptdot.com SNS sharing."""

from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1200, 630
BG = (10, 10, 10)        # #0a0a0a
ACCENT = (124, 109, 250)  # #7c6dfa
ACCENT2 = (167, 139, 250) # #a78bfa
WHITE = (240, 240, 240)   # #f0f0f0
MUTED = (136, 136, 136)   # #888888
GREEN = (34, 197, 94)     # #22c55e

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# --- Pixel eye icon (centered, scaled) ---
# 8x8 pixel art eye, each pixel = 10px, positioned at left area
eye_x, eye_y = 80, 180
px = 10  # pixel size for the eye

# Eye pixel map: 0=empty, 1=accent, 2=accent2, 3=black(pupil)
eye = [
    [0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,2,2,1,2,1,0],
    [0,1,2,3,3,2,1,0],
    [0,1,2,2,1,2,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
]

colors = {0: None, 1: ACCENT, 2: ACCENT2, 3: BG}

# Draw a larger version of the eye (each pixel = 14px) at left side
eye_px = 14
eye_start_x = 85
eye_start_y = 220
for row_i, row in enumerate(eye):
    for col_i, val in enumerate(row):
        c = colors[val]
        if c:
            x0 = eye_start_x + col_i * eye_px
            y0 = eye_start_y + row_i * eye_px
            draw.rectangle([x0, y0, x0 + eye_px - 1, y0 + eye_px - 1], fill=c)

# --- Try to load fonts, fall back to default ---
def load_font(size, bold=False):
    """Try several font paths."""
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def load_mono_font(size):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

font_title = load_font(52, bold=True)
font_sub = load_font(26)
font_tag = load_font(18)
font_mono = load_mono_font(20)

# --- Accent bar at top ---
draw.rectangle([0, 0, W, 4], fill=ACCENT)

# --- Title: "perceptdot" ---
text_x = 220
draw.text((text_x, 140), "perceptdot", fill=WHITE, font=font_title)

# --- Tagline ---
draw.text((text_x, 210), "Give Your AI Agent Eyes", fill=ACCENT2, font=font_sub)

# --- Description ---
desc = "MCP servers for GA4 · Vercel · GitHub · Sentry"
draw.text((text_x, 260), desc, fill=MUTED, font=font_sub)

# --- ROI line ---
draw.text((text_x, 310), "Built-in ROI tracking · ~450 tokens saved per call", fill=MUTED, font=font_tag)

# --- npm packages (code-style) ---
packages = [
    "npx @perceptdot/ga4",
    "npx @perceptdot/vercel",
    "npx @perceptdot/github",
    "npx @perceptdot/sentry",
]

# Code block background
code_y = 370
code_bg_padding = 16
code_line_h = 32
code_bg_h = code_line_h * len(packages) + code_bg_padding * 2
draw.rounded_rectangle(
    [text_x, code_y, text_x + 480, code_y + code_bg_h],
    radius=8, fill=(26, 26, 26)  # #1a1a1a
)

for i, pkg in enumerate(packages):
    y = code_y + code_bg_padding + i * code_line_h
    # Green prompt symbol
    draw.text((text_x + 16, y), "$", fill=GREEN, font=font_mono)
    draw.text((text_x + 40, y), pkg, fill=ACCENT2, font=font_mono)

# --- Bottom bar ---
draw.rectangle([0, H - 50, W, H], fill=(17, 17, 17))
draw.text((40, H - 40), "perceptdot.com", fill=MUTED, font=font_tag)
draw.text((W - 300, H - 40), "Open Beta · Free Starter", fill=GREEN, font=font_tag)

# --- Subtle border ---
draw.rectangle([0, 0, W - 1, 0], fill=ACCENT)  # top
draw.rectangle([0, H - 1, W - 1, H - 1], fill=(34, 34, 34))  # bottom

# --- Save ---
out_path = os.path.join(os.path.dirname(__file__), "..", "landing", "og-image.png")
out_path = os.path.abspath(out_path)
img.save(out_path, "PNG", optimize=True)
print(f"Saved: {out_path} ({os.path.getsize(out_path)} bytes)")
