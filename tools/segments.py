#!/usr/bin/env python3
"""Seven-segment displays for prototype C, drawn like the app icon (direction H, Clock): slanted cells whose G
lights a, f, e, d, c and a half crossbar. Writes inline SVG between <!--seg:NAME--> and <!--/seg--> markers in
prototypes/C/index.html, so the page needs no script to show them. Re-run after changing a display:

    python3 tools/segments.py
"""
import math
import pathlib
import re

W, H, T, GAP, SKEW, SPACE = 100, 180, 22, 3, 12, 24
SLANT = math.tan(math.radians(SKEW)) * H
h = T / 2
L, R, TOP, MID, BOT = h, W - h, h, H / 2, H - h

def hseg(y, x0, x1, flat_left=False):
    left = [(x0, y + h), (x0, y - h)] if flat_left else [(x0 + h, y + h), (x0, y), (x0 + h, y - h)]
    pts = left[-1:] + [(x1 - h, y - h), (x1, y), (x1 - h, y + h)] + left[:-1]
    return pts

def vseg(x, y0, y1):
    return [(x, y0), (x + h, y0 + h), (x + h, y1 - h), (x, y1), (x - h, y1 - h), (x - h, y0 + h)]

SEGS = {
    "a": hseg(TOP, L + GAP, R - GAP),
    "b": vseg(R, TOP + GAP, MID - GAP),
    "c": vseg(R, MID + GAP, BOT - GAP),
    "d": hseg(BOT, L + GAP, R - GAP),
    "e": vseg(L, MID + GAP, BOT - GAP),
    "f": vseg(L, TOP + GAP, MID - GAP),
    "g": hseg(MID, L + GAP, R - GAP),
    "h": hseg(MID, W / 2 - 4, R - GAP, flat_left=True),  # the icon's half crossbar
}
GLYPHS = {
    "0": "abcdef", "1": "bc", "2": "abdeg", "3": "abcdg", "4": "bcfg", "5": "acdfg", "6": "acdefg", "7": "abc",
    "8": "abcdefg", "9": "abcdfg", "G": "acdefh", "O": "abcdef", "d": "bcdeg", "r": "eg", "E": "adefg", "P": "abefg",
    " ": "",
}

def pts(p):
    return " ".join(f"{x:.1f},{y:.1f}" for x, y in p)

def cell(ch, ox, live, dots=False):
    lit = set(GLYPHS[ch])
    # Live cells carry every segment so a script can light any glyph; h (the half bar) comes before g so CSS can hide
    # whichever of the two is not in use. A static G swaps g for the half bar.
    names = "abcdefhg" if live else ("abcdefh" if "h" in lit else "abcdefg")
    out = [f'<g transform="translate({ox + SLANT:.1f} 0) skewX(-{SKEW})"' + (f' data-cell' if live else "") + ">"]
    for n in names:
        cls = "on" if n in lit else ""
        data = f' data-s="{n}"' if live else ""
        out.append(f'<polygon points="{pts(SEGS[n])}"{data}' + (f' class="{cls}"' if cls else "") + "/>")
    if dots:  # colon dots in the middle of this cell, off until a script shows a time
        for cy in (H * 0.32, H * 0.68):
            out.append(f'<rect class="colon" x="{W / 2 - 10:.1f}" y="{cy - 10:.1f}" width="20" height="20"/>')
    out.append("</g>")
    return "".join(out)

def display(text, label, live=False, colon_after=None, dots_cell=None):
    parts, x = [], 0.0
    for i, ch in enumerate(text):
        parts.append(cell(ch, x, live, dots=(i == dots_cell)))
        x += W + SPACE
        if colon_after is not None and i == colon_after:
            cx = x + SLANT / 2 - 4
            for cy in (H * 0.32, H * 0.68):
                dx = -math.tan(math.radians(SKEW)) * (cy - H / 2)
                k = math.tan(math.radians(SKEW)) * 9
                x0, y0 = cx + dx, cy
                quad = [(x0 - 9 + k, y0 - 9), (x0 + 9 + k, y0 - 9), (x0 + 9 - k, y0 + 9), (x0 - 9 - k, y0 + 9)]
                parts.append(f'<polygon class="on colon" points="{pts(quad)}"/>')
            x += 40
    width = x - SPACE + SLANT
    role = 'role="img" aria-label="' + label + '"' if label else 'aria-hidden="true"'
    return f'<svg class="seg" viewBox="-6 -6 {width + 12:.0f} {H + 12}" {role}>' + "".join(parts) + "</svg>"

DISPLAYS = {
    "kg": display("80", ""), "reps": display("8", ""),
    "clock": display(" 01 30 ", "Break timer 01:30", live=True, dots_cell=3),
    "n1": display("01", ""), "n2": display("02", ""), "n3": display("03", ""), "n4": display("04", ""),
    "zero1": display("0", ""), "zero2": display("0", ""), "zero3": display("0", ""), "zero4": display("0", ""), "zero5": display("0", ""),
    "foot": display("GOOdrEP", "GOODREP"),
}

page = pathlib.Path(__file__).resolve().parent.parent / "prototypes" / "C" / "index.html"
html = page.read_text()
for name, svg in DISPLAYS.items():
    html, n = re.subn(rf"<!--seg:{name}-->.*?<!--/seg-->", f"<!--seg:{name}-->{svg}<!--/seg-->", html, flags=re.S)
    if n == 0:
        print(f"marker seg:{name} not found")
page.write_text(html)
print("wrote", page)
