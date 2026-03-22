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
DARK2 = (26, 26, 26)      # #1a1a1a

img = Image.new("RGB", (W, H), BG)
draw = ImageDraw.Draw(img)

# --- Pixel eye icon (large, centered vertically on left) ---
# 8x8 pixel art eye
eye_map = [
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

# Large eye: each pixel = 22px, positioned center-left
eye_px = 22
eye_w = 8 * eye_px  # 176
eye_h = 8 * eye_px  # 176
eye_start_x = 70
eye_start_y = (H - eye_h) // 2 - 10

for row_i, row in enumerate(eye_map):
    for col_i, val in enumerate(row):
        c = colors[val]
        if c:
            x0 = eye_start_x + col_i * eye_px
            y0 = eye_start_y + row_i * eye_px
            draw.rectangle([x0, y0, x0 + eye_px - 1, y0 + eye_px - 1], fill=c)

# --- Subtle glow behind eye ---
for r in range(120, 0, -2):
    alpha_color = (ACCENT[0], ACCENT[1], ACCENT[2])
    opacity = max(3, int(8 * (1 - r / 120)))
    glow_color = tuple(min(255, BG[i] + opacity) for i in range(3))
    cx = eye_start_x + eye_w // 2
    cy = eye_start_y + eye_h // 2
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=glow_color)

# Redraw eye on top of glow
for row_i, row in enumerate(eye_map):
    for col_i, val in enumerate(row):
        c = colors[val]
        if c:
            x0 = eye_start_x + col_i * eye_px
            y0 = eye_start_y + row_i * eye_px
            draw.rectangle([x0, y0, x0 + eye_px - 1, y0 + eye_px - 1], fill=c)

# --- Fonts ---
def load_font(size, bold=False):
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
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    ]
    for p in paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

font_brand = load_font(58, bold=True)
font_tagline = load_font(30, bold=True)
font_desc = load_font(22)
font_tag = load_font(18)
font_mono = load_mono_font(18)

# --- Accent bar at top ---
draw.rectangle([0, 0, W, 5], fill=ACCENT)

# --- Content area (right of eye) ---
text_x = 310

# Brand name
draw.text((text_x, 110), "perceptdot", fill=WHITE, font=font_brand)

# Tagline
draw.text((text_x, 185), "Give Your AI Agent Eyes", fill=ACCENT2, font=font_tagline)

# Separator line
draw.rectangle([text_x, 235, text_x + 500, 236], fill=ACCENT)

# Description
draw.text((text_x, 255), "MCP servers for GA4 · Vercel · GitHub · Sentry", fill=MUTED, font=font_desc)

# ROI line
draw.text((text_x, 295), "Built-in ROI tracking · ~450 tokens saved per call", fill=MUTED, font=font_tag)

# --- npm packages (terminal style) ---
packages = [
    "@perceptdot/ga4",
    "@perceptdot/vercel",
    "@perceptdot/github",
    "@perceptdot/sentry",
]

# Terminal window
term_x = text_x
term_y = 345
term_w = 520
term_line_h = 30
term_padding = 14
term_title_h = 28
term_h = term_title_h + term_padding * 2 + term_line_h * len(packages)

# Terminal background
draw.rounded_rectangle(
    [term_x, term_y, term_x + term_w, term_y + term_h],
    radius=8, fill=DARK2
)

# Terminal title bar
draw.rounded_rectangle(
    [term_x, term_y, term_x + term_w, term_y + term_title_h],
    radius=8, fill=(34, 34, 34)
)
# Fix bottom corners of title bar
draw.rectangle(
    [term_x, term_y + term_title_h - 8, term_x + term_w, term_y + term_title_h],
    fill=(34, 34, 34)
)

# Traffic light dots
for i, color in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
    cx = term_x + 18 + i * 18
    cy = term_y + term_title_h // 2
    draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=color)

# Terminal text
for i, pkg in enumerate(packages):
    y = term_y + term_title_h + term_padding + i * term_line_h
    draw.text((term_x + 16, y), "$ npx", fill=GREEN, font=font_mono)
    draw.text((term_x + 90, y), pkg, fill=ACCENT2, font=font_mono)

# --- Bottom bar ---
draw.rectangle([0, H - 48, W, H], fill=(17, 17, 17))
draw.text((40, H - 38), "perceptdot.com", fill=MUTED, font=font_tag)

# Beta badge
badge_text = "Open Beta · Free"
draw.text((W - 230, H - 38), badge_text, fill=GREEN, font=font_tag)

# --- Save ---
out_path = os.path.join(os.path.dirname(__file__), "..", "landing", "og-image.png")
out_path = os.path.abspath(out_path)
img.save(out_path, "PNG", optimize=True)
print(f"Saved: {out_path} ({os.path.getsize(out_path)} bytes)")
