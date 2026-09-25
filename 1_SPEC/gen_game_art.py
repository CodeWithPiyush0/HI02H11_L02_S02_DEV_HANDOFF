# -*- coding: utf-8 -*-
"""Generate the runner's artwork with Gemini, using Swifty herself as the reference.

Yasir: "for the character we can use swifty so generate all the new assets".

Two things make this different from typing prompts into a web tool:

  SWIFTY HAS TO STAY SWIFTY. Every character pose is generated WITH her existing artwork attached
  as a reference image, not described in words. A white eagle chick in a yellow jacket described
  five times gives five different birds; anchored to the real file she stays the same character
  the child has seen on all seventeen screens before this one.

  THE BACKGROUND HAS TO GO, PROPERLY. The model paints an opaque background whatever it is asked
  for, so every cut-out is keyed here: flood-fill inward from the four corners, which removes the
  surround without touching a light colour enclosed by the drawing - Swifty's own white head and
  cream belly would vanish under a plain "remove everything near-white" pass.

Run:  python 1_SPEC/gen_game_art.py <group>      (character | scenery | ui | all)
Output lands in 1_SPEC/game_art_src/generated/ - the SOURCE folder, so prepare_runner_art.py
still owns sizing and naming. Nothing is written straight into the bundle.
"""
import base64, io, json, os, sys, time, urllib.request
from collections import deque
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for line in io.open(os.path.join(HERE, "3_CURRENT_BUILD", ".env"), encoding="utf-8"):
    if "=" in line and not line.strip().startswith("#"):
        k, v = line.strip().split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"\''))
KEY = os.environ.get("GEMINI_KEY") or os.environ.get("GKEY")
MODEL = os.environ.get("IMG_MODEL", "gemini-3.1-flash-image")
URL = ("https://generativelanguage.googleapis.com/v1beta/models/"
       + MODEL + ":generateContent?key=" + KEY)

REF = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "UI", "start_mascot.webp")
OUT = os.path.join(HERE, "1_SPEC", "game_art_src", "generated")

STYLE = (" Style: bright 2D cartoon game art for Indian children aged 5-8, clean bold outlines, "
         "soft cel shading, warm dusk jungle-temple palette (deep purple, sunset orange, gold, "
         "leaf green, river blue, cream), friendly rounded shapes, mobile game asset, crisp "
         "edges, centred, full body inside the frame with a small margin, PLAIN FLAT PURE WHITE "
         "BACKGROUND and nothing else behind the subject. No text, no letters, no words, no "
         "watermark, no logo, no border, no drop shadow on the background, not photorealistic, "
         "no 3D render.")

CHAR = ("The SAME character as the attached reference image - a small friendly white eagle chick "
        "with a bright yellow beak, wearing a BRIGHT YELLOW zip-up jacket with a smiley badge, a "
        "brown satchel across the body, BLUE shorts and orange feet. Keep her colours, outfit and "
        "proportions EXACTLY as the reference: the jacket is yellow, never orange or red. "
        "Seen from DIRECTLY BEHIND: the back of her head faces the camera, her face and beak are "
        "NOT visible, and her head is not turned. ")

# Once one clean back view exists it becomes the reference for the others. Describing "a white
# eagle chick seen from behind" five times produced five slightly different birds - one of them
# in an orange jacket - and in a run cycle that reads as a flicker rather than as running.
POSE_REF = "swifty_run_2.png"

JOBS = {
 "character": [
   ("swifty_run_1.png", CHAR + "Seen from BEHIND, running away from the camera, left foot "
        "forward and right arm forward, satchel swinging, mid-stride, full body, feet at the "
        "bottom of the frame."),
   ("swifty_run_2.png", CHAR + "Seen from BEHIND, running away from the camera, both feet off "
        "the ground at the peak of the stride, arms tucked, full body."),
   ("swifty_run_3.png", CHAR + "Seen from BEHIND, running away from the camera, right foot "
        "forward and left arm forward, mid-stride, full body, feet at the bottom of the frame."),
   ("swifty_run_4.png", CHAR + "Seen from BEHIND, running away from the camera, landing on one "
        "foot with knees slightly bent, full body, feet at the bottom of the frame."),
   ("swifty_lean_left.png", CHAR + "Seen from BEHIND, running and leaning her whole body to the "
        "LEFT to change lane, wings out for balance, full body."),
   ("swifty_lean_right.png", CHAR + "Seen from BEHIND, running and leaning her whole body to the "
        "RIGHT to change lane, wings out for balance, full body."),
   ("swifty_stumble.png", CHAR + "Seen from BEHIND, tripping slightly with both wings out for "
        "balance and three small cartoon dizzy stars above her head, gentle and funny, not hurt, "
        "full body."),
   ("swifty_cheer.png", CHAR + "Jumping straight up with both WHITE wings raised in "
        "celebration, full body filling the frame. Her wings are white, matching her head - not "
        "purple and not grey. NOTHING behind her: no panel, no card, no box, no frame, no glow "
        "shape, no sparkles, no stars - only the bird on the empty background. Leave a WIDE "
        "EMPTY MARGIN on all four sides - her wingtips must not touch or reach the edge of "
        "the frame."),
 ],
 "ui": [
   ("coin.png", "A single shiny gold coin for a children's game, face-on, a small embossed lotus "
        "flower on the face, bright highlight, thick clean outline."),
   ("plate.png", "A blank horizontal ornate name plaque for a game UI, wide rounded rectangle, "
        "dark navy centre area completely EMPTY and flat, thin carved gold decorative border."),
   ("heart_full.png", "A cute glossy red cartoon heart icon for game lives, thick outline, shine "
        "highlight."),
   ("heart_empty.png", "An empty cartoon heart icon, grey and translucent, same shape as a game "
        "lives heart, thick outline."),
   ("star_full.png", "A big glossy golden cartoon star icon for a level rating, thick outline, "
        "shine highlight."),
   ("star_empty.png", "A dull grey empty cartoon star icon for a level rating, thick outline."),
 ],
 "scenery": [
   ("bush_2.png", "A single round leafy jungle bush for a 2D game, dark green with a few tiny "
        "glowing teal fireflies and small pink flowers, flat bottom edge."),
   ("pillar_2.png", "A single ancient Indian carved stone temple pillar for a 2D game, "
        "lavender-grey stone, broken top, green vines wrapped around it, one small glowing teal "
        "gem, base at the bottom edge."),
 ],
}


def post(body, tries=3):
    for k in range(tries):
        try:
            req = urllib.request.Request(URL, data=json.dumps(body).encode(),
                                         headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except Exception as ex:
            if k == tries - 1:
                raise
            time.sleep(6 + 6 * k)


def generate(prompt, ref_bytes=None):
    parts = [{"text": prompt + STYLE}]
    if ref_bytes:
        parts.insert(0, {"inline_data": {"mime_type": "image/png",
                                         "data": base64.b64encode(ref_bytes).decode()}})
    j = post({"contents": [{"parts": parts}]})
    for p in j.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        d = p.get("inlineData") or p.get("inline_data")
        if d:
            return base64.b64decode(d["data"])
    return None


def key_out_background(im, tol=32):
    """Flood-fill the surround away from the four corners.

    NOT a global 'delete near-white' pass: Swifty's head and belly are white, and a global rule
    eats them and leaves her hollow. Filling inward from the edges only removes background that
    is actually connected to the edge, so enclosed light areas survive.
    """
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q = deque()

    def like_bg(c, ref):
        return (abs(c[0] - ref[0]) <= tol and abs(c[1] - ref[1]) <= tol
                and abs(c[2] - ref[2]) <= tol)

    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    # Seed from EVERY border pixel, not only the four corners. A raised wing that runs off the
    # top of the frame splits the border, and the background between the two wings is then a
    # separate region with no corner in it - it survived as an opaque white box behind the
    # character. Every seed is still colour-tested against the corners, so this widens which
    # background is reachable without widening what counts as background.
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        c = px[x, y]
        if c[3] == 0 or not any(like_bg(c, r) for r in corners):
            continue
        seen[i] = 1
        px[x, y] = (c[0], c[1], c[2], 0)
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    # The fill only reaches background CONNECTED to an edge. When the drawing touches the frame
    # - a raised wing running off the top - it can fence off a pocket of background that stays
    # opaque, and that pocket is a white box behind the character on screen. It cannot be told
    # apart from her own white head by colour (both are white inside a dark outline), so the
    # honest thing is to report it and regenerate with a margin, not to guess.
    box = im.getchannel("A").getbbox()
    im = im.crop(box) if box else im
    px2, (w2, h2) = im.load(), im.size
    edge = 0
    for x in range(0, w2, 3):
        for y in (0, h2 - 1):
            c = px2[x, y]
            if c[3] > 200 and min(c[:3]) > 235:
                edge += 1
    if edge > w2 // 12:
        print("     !! near-white still opaque along the top/bottom edge - a pocket of "
              "background the fill could not reach; regenerate with a wider margin")
    return im


def main():
    group = sys.argv[1] if len(sys.argv) > 1 else "character"
    only = sys.argv[2:] if len(sys.argv) > 2 else None
    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    pose_ref = os.path.join(OUT, POSE_REF)
    use = pose_ref if os.path.isfile(pose_ref) else REF
    ref = io.open(use, "rb").read() if os.path.isfile(use) else None
    print("  character reference: %s" % os.path.basename(use))
    if ref:
        b = io.BytesIO()
        Image.open(io.BytesIO(ref)).convert("RGBA").save(b, "PNG")
        ref = b.getvalue()
    groups = list(JOBS) if group == "all" else [group]
    for g in groups:
        for name, prompt in JOBS.get(g, []):
            if only and name not in only:
                continue
            out = os.path.join(OUT, name)
            if os.path.isfile(out):
                print("  %-24s already there, skipped" % name); continue
            try:
                raw = generate(prompt, ref if g == "character" else None)
            except Exception as ex:
                print("  %-24s FAILED  %s" % (name, str(ex)[:60])); continue
            if not raw:
                print("  %-24s no image returned" % name); continue
            im = key_out_background(Image.open(io.BytesIO(raw)))
            im.save(out)
            print("  %-24s %sx%s  %.0f KB" % (name, im.size[0], im.size[1],
                                              os.path.getsize(out) / 1024.0))
            time.sleep(2)


if __name__ == "__main__":
    main()
