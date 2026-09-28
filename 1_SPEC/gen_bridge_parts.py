# -*- coding: utf-8 -*-
"""Cut Yasir's bridge painting into the three parts the game can move.

bridge_path.png is a finished picture of the whole bridge in perspective. As a picture it cannot
move: drawn as it is, the world stands still round a runner (the treadmill of r67); scrolled as
if it were the floor, its upright posts grow about twice too fast as they approach, because floor
perspective and upright perspective are not the same curve.

So it becomes the STYLE REFERENCE for three parts, each drawn in the one view the game needs:
  deck  - the slabs seen from straight above, tileable, so the game can scroll it in perspective
  post  - one post, face on, so the game can stand it at any depth
  wall  - one bay of the low parapet, side on, so the game can lay it along the edge in perspective

Run:  python 1_SPEC/gen_bridge_parts.py [deck|post|wall|all] [n]
Output: 1_SPEC/game_art_src/bridge/<part>_<k>.png
"""
import base64, io, json, os, sys, time, urllib.request
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for line in io.open(os.path.join(HERE, "3_CURRENT_BUILD", ".env"), encoding="utf-8"):
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.strip().split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"\''))
KEY = os.environ.get("GEMINI_KEY") or os.environ.get("GKEY")
MODEL = os.environ.get("IMG_MODEL", "gemini-3.1-flash-image")
URL = ("https://generativelanguage.googleapis.com/v1beta/models/" + MODEL
       + ":generateContent?key=" + KEY)
REF = os.path.join(HERE, "1_SPEC", "game_art_src", "bridge", "bridge_path.png")
OUT = os.path.join(HERE, "1_SPEC", "game_art_src", "bridge")

STYLE = (" Match the attached bridge EXACTLY in art style, stone colour and lighting: bright "
         "friendly 2D cartoon game art for young children, warm tan-and-golden sandstone, clean "
         "dark outlines, soft cel shading, warm golden sunset light from the far end of the bridge, "
         "small bright green ivy. No text, no letters, no numbers, no border, no watermark, not "
         "photorealistic, no 3D render.")

PARTS = {
    "deck": ("1:1",
             "A SEAMLESS TILEABLE TEXTURE of the paving slabs of the bridge deck in the attached "
             "image, seen from DIRECTLY ABOVE - a flat orthographic top-down view with no "
             "perspective at all and no vanishing point. Large rectangular sandstone slabs with "
             "softly rounded worn corners, laid in running-bond rows that run left to right across "
             "the picture, each row offset by half a slab, about three slabs across the width and "
             "four rows down the height. Thin dark joints between the slabs with a little moss and "
             "a few tiny grass tufts in them. Even light over the whole tile, no cast shadows, no "
             "railings, no posts, no edges - the slabs fill the square frame edge to edge and "
             "continue seamlessly off all four sides." + STYLE),
    "post": ("3:4",
             "ONE single stone balustrade POST exactly like the posts along the bridge in the "
             "attached image: a square sandstone pillar with a square spiral emblem carved in a "
             "panel on its front face, a slightly wider plinth at its foot and a flat overhanging "
             "cap stone on top, a little green ivy trailing down one side. Seen straight on at eye "
             "level, showing its front face and a narrow slice of its right-hand side face. The "
             "whole post, centred, with a wide empty margin all round, on a FLAT SOLID PURE MAGENTA "
             "#FF00FF background - no ground, no floor, no shadow, nothing else in the picture." + STYLE),
    "wall": ("21:9",
             "ONE straight section of the low stone PARAPET WALL that runs between the posts along "
             "the edge of the bridge in the attached image, seen EXACTLY SIDE-ON as a flat "
             "elevation with no perspective: sandstone blocks in two courses, a flat capping stone "
             "running along the whole top, a row of small carved square panels, a little green "
             "ivy hanging from the top in a few places. The wall runs across the FULL WIDTH of the "
             "picture from the left edge to the right edge and continues off both sides; it fills "
             "the middle band of the picture, with a FLAT SOLID PURE MAGENTA #FF00FF background "
             "above it and below it - no ground, no posts, no shadow." + STYLE),
}


def post(body, tries=3):
    for k in range(tries):
        try:
            req = urllib.request.Request(URL, data=json.dumps(body).encode(),
                                         headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except Exception as e:
            print("   retry", k + 1, type(e).__name__, str(e)[:160])
            if k == tries - 1:
                raise
            time.sleep(6 + 6 * k)


def generate(prompt, aspect):
    b = io.BytesIO(); Image.open(REF).convert("RGBA").save(b, "PNG")
    body = {"contents": [{"parts": [
                {"inline_data": {"mime_type": "image/png", "data": base64.b64encode(b.getvalue()).decode()}},
                {"text": prompt}]}],
            "generationConfig": {"responseModalities": ["IMAGE", "TEXT"],
                                 "imageConfig": {"aspectRatio": aspect}}}
    j = post(body)
    for p in j.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        d = p.get("inlineData") or p.get("inline_data")
        if d:
            return Image.open(io.BytesIO(base64.b64decode(d["data"]))).convert("RGB")
    print("   no image:", json.dumps(j)[:300])
    return None


def main():
    which = sys.argv[1] if len(sys.argv) > 1 else "all"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 2
    for part in (PARTS if which == "all" else [which]):
        aspect, prompt = PARTS[part]
        for k in range(n):
            im = generate(prompt, aspect)
            if im is None:
                continue
            p = os.path.join(OUT, "%s_%d.png" % (part, k + 1))
            im.save(p)
            print("  wrote", p, im.size)


if __name__ == "__main__":
    main()
