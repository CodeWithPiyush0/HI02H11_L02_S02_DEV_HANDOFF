# -*- coding: utf-8 -*-
"""Generate the runner's artwork to match Yasir's reference sheet.

The first pass described the look in words and got a dark purple temple with ornate arches. The
reference is a different game: bright jungle at golden hour, a stone path with low railings, and
WOODEN word gates - two posts, a beam, vines and flowers, and a cream plank the word sits on.

So nothing here is described from scratch. The sheet is cut into its panels once
(scratchpad/ref/*.png by the caller, or _panels() below) and the matching panel is ATTACHED to
every request: the gate jobs see the gate panel, the scenery jobs see the environment strip, the
HUD jobs see the UI column. A style named in words drifts; a style shown does not.

Two rules the model keeps breaking, so they are enforced here rather than hoped for:

  NO WORDS ON THE SIGN. The plank has to be blank - the game writes the Hindi word onto it at
  run time, at the size the perspective calls for. A sign that arrives with "APPLE" painted on
  it is unusable, and the sheet's own signs carry words, so the reference actively pushes the
  wrong way. Hence the repeated "completely empty" in the plank prompt.

  THE BACKGROUND HAS TO GO, PROPERLY. Cut-outs are keyed by flooding inward from every border
  pixel - not from the four corners, and not by deleting near-white globally. Swifty's head and
  the plank's cream face are both light, and a global rule eats them; a corner-only fill misses
  a pocket that a raised wing or an arching vine fences off from the corners.

Run:  python 1_SPEC/gen_ref_art.py <group>     (scene | gates | ground | hud | fx | char | all)
Output lands in 1_SPEC/game_art_src/gen2/ - a build INPUT. prepare_runner_art.py still owns
sizing and naming; nothing is written straight into the bundle.
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

SHEET = os.environ.get("REF_SHEET", os.path.join(
    os.path.expandvars(r"%LOCALAPPDATA%\Temp\claude"),
    "f--CG-Game-FLN-File3-HI02H11-L02-S02-DEV-HANDOFF",
    "6d96b21a-18b2-4bc2-b09e-7a2d3f72e5f9", "images", "15.png"))
PANELS = os.path.join(HERE, "1_SPEC", "game_art_src", "ref_panels")
OUT = os.path.join(HERE, "1_SPEC", "game_art_src", "gen2")
SWIFTY = os.path.join(HERE, "1_SPEC", "game_art_src", "generated", "swifty_run_2.png")

# where each panel sits on the 1688x932 sheet
BOX = {
    "scene":   (0, 0, 1140, 582),
    "correct": (1145, 0, 1688, 290),
    "wrong":   (1145, 292, 1688, 582),
    "sprites": (0, 590, 648, 932),
    "gates":   (652, 590, 1024, 932),
    "env":     (1028, 590, 1322, 932),
    "ui":      (1326, 590, 1492, 932),
    "fx":      (1496, 590, 1688, 932),
}


def _panels():
    if not os.path.isdir(PANELS):
        os.makedirs(PANELS)
    im = Image.open(SHEET).convert("RGB")
    for k, b in BOX.items():
        p = os.path.join(PANELS, k + ".png")
        if not os.path.isfile(p):
            im.crop(b).save(p)
    # Everything in the folder, not just what BOX cuts out of the first sheet. The later asset
    # sheets are cropped by hand into the same folder, and a job names a panel by its filename.
    out = {}
    for f in os.listdir(PANELS):
        if f.lower().endswith(".png"):
            out[f[:-4]] = io.open(os.path.join(PANELS, f), "rb").read()
    return out


LOOK = (" Match the ART STYLE of the attached reference exactly: bright friendly 2D cartoon game "
        "art for young children, clean bold dark outlines, soft cel shading with warm rim light, "
        "lush saturated greens, warm tan stone, golden-hour sunset light, rounded chunky shapes. "
        "No text, no letters, no words, no numbers, no watermark, no logo, no UI label, no "
        "caption, no border around the picture, not photorealistic, no 3D render.")
CUTOUT = (" The subject alone on a PLAIN FLAT PURE WHITE BACKGROUND with nothing else behind it, "
          "centred, whole subject inside the frame with a wide empty margin on all four sides, "
          "nothing touching or running off the edge of the frame.")
WIDE = (" A WIDE PANORAMIC picture, far wider than it is tall, filling the whole frame edge to "
        "edge with no border and no margin.")

ARCH = ("ONE rustic WOODEN ARCH GATEWAY for a children's game, exactly like the one in the "
        "attached reference: two thick weathered wooden trunks standing on rough grey stone "
        "bases, joined at the top by a CURVED wooden bough that arches over the gap between "
        "them, leafy green vines wound around the trunks and along the bough, and a few small "
        "white flowers among the leaves. One gateway only, seen straight on. ")
EMPTY = ("The whole opening under the arch is COMPLETELY EMPTY and shows only the plain white "
         "background - NO sign, NO board, NO plank, NO plaque, NO banner, NO scroll, NO panel "
         "hanging from the bough, no curtain, no fruit, no writing of any kind. Just the bare "
         "wooden arch. ")

JOBS = {
 # ---- the backdrop, in the three layers the renderer already composites -------------------
 "scene": [
   ("bg_sky.png", "scene",
    "Only an empty golden-hour SKY for a side-scrolling game backdrop: warm orange and pink low "
    "down, softening up into lavender and deep blue, a few soft cartoon clouds catching the "
    "light, and a low range of hazy blue-green mountains along the very bottom. Nothing in the "
    "foreground, no trees, no ground, no characters." + WIDE),
   ("bg_temples.png", "scene",
    "A distant SKYLINE STRIP for a game backdrop: rounded blue-green jungle mountains with weathered "
    "pale stone temple ruins and stepped towers built into them, and one narrow waterfall falling "
    "between them. Only the skyline itself, sitting along the bottom of the frame; everything above "
    "it is empty PLAIN FLAT PURE WHITE that will be removed." + WIDE),
   ("bg_canopy.png", "env",
    "A LONG HORIZONTAL STRIP of jungle treetops for a game backdrop layer, nothing else in the "
    "picture: a dense unbroken row of lush mid-green and deep green rounded tree canopies with "
    "warm sunlight on their upper edges, running left to right along the BOTTOM HALF of the "
    "frame. The whole TOP HALF of the frame is empty PLAIN FLAT PURE WHITE and will be removed. "
    "This is one flat backdrop layer, NOT a scene: no ground, no road, no path, no stone, no "
    "gate, no arch, no ruins, no sky, no mountains, no characters, no perspective." + WIDE),
 ],
 # ---- the ground, as two tiles the renderer scrolls ----------------------------------------
 "ground": [
   ("tex_grass2.png", "env",
    "A TOP-DOWN TEXTURE of shaded jungle undergrowth for a game, filling the whole frame "
    "evenly: many small overlapping leaves and low ferns in DEEP and MEDIUM green with cool "
    "blue-green shadow between them, a few darker fallen leaves, only the occasional tiny pale "
    "flower. MUTED and DARK rather than bright - this lies at the side of a lit path and must "
    "not compete with it. A fine, even, all-over pattern with no single large object, no path, "
    "no horizon, no sky, no edges and no border." + WIDE),
   ("tex_grass.png", "env",
    "A TOP-DOWN TEXTURE of lush jungle floor for a game, filling the whole frame evenly: dense "
    "bright green leaves of several shapes, a scatter of tiny white and pink flowers and small "
    "ferns, soft shadows between the leaves. An even all-over pattern with no single large "
    "object, no path, no horizon, no sky, no edges and no border." + WIDE),
   ("tex_path.png", "env",
    "A TOP-DOWN TEXTURE of an old paved stone road for a game, filling the whole frame evenly: "
    "large irregular warm tan and sandy flagstones fitted together, darker mortar lines between "
    "them, a few tiny grass tufts in the cracks. An even all-over pattern, no kerb, no edges, no "
    "grass border, no horizon, no sky." + WIDE),
 ],
 # ---- the gates: posts and beam separately from the plank the word goes on -----------------
 "gates": [
   ("gate_neutral.png", "gate_arch",
    ARCH + EMPTY + CUTOUT),
   ("gate_correct.png", "gate_arch",
    ARCH + "The arch is lit up in CELEBRATION: the wood, leaves and flowers washed with warm "
    "golden-green light, and a few gold sparkles resting on the bough itself. " + EMPTY +
    "No glow cloud and no light beam in the opening either. " + CUTOUT),
   ("gate_wrong.png", "gate_arch",
    ARCH + "The arch shows a MISTAKE: the wood, leaves and flowers washed with warm "
    "red-orange light and the leaves tinged rust. " + EMPTY +
    "No cross and no red cloud in the opening either. " + CUTOUT),
   ("plate.png", "ui",
    "ONE SMALL BLANK SIGNBOARD lying on its own, and nothing else in the picture: a wide "
    "horizontal board with softly rounded corners, made of TWO PARTS - a thick warm BROWN WOODEN "
    "FRAME around the outside, and inside it a smooth flat PALE CREAM IVORY panel, much lighter "
    "than the frame, with a small round bolt in each corner of the frame. NO posts, NO gate, NO "
    "arch, NO rope, NO leaves, NO vines, NO flowers, NO fruit, NO apple, NO ground, NO shadow - "
    "only the board itself, floating alone. The pale cream panel is COMPLETELY EMPTY and "
    "perfectly flat - no letters, no words, no writing, no carving, no wood grain, no picture, "
    "no decoration at all on it." + CUTOUT),
   ("rail.png", "scene",
    "One short section of a LOW STONE ROADSIDE RAILING for a game, seen from the side: a flat "
    "weathered pale-grey stone top rail resting on two square stone posts, soft green moss and a "
    "few small leaves growing on it, warm sunlight on the top edge. One section only, standing "
    "level, nothing else." + CUTOUT),
   # The open lawn beside the road is what Yasir says looks bad, and the mockup answers it: the
   # kerb is backed by dense foliage, not by a field. This is drawn to REPEAT along the kerb, so
   # its ends are cut flat and its silhouette has no single feature the eye can count.
   ("hedge.png", "gates",
    "ONE SECTION of a dense low garden HEDGE for a children's game, seen from the side at eye "
    "level: a thick continuous mass of dark and mid green leaves of several shapes with a few "
    "tiny white and pink flowers, sitting on a flat ground line. The section is WIDE and low - "
    "about three times wider than it is tall - and both the LEFT and RIGHT ends are cut off "
    "FLAT and square, level with the frame, so that copies of it can stand side by side and "
    "look like one unbroken hedge. No gap, no single bush, no pot, no fence, no wall, no path, "
    "no ground beneath it." + CUTOUT),
   # The level cards were a plain rounded rectangle - "too generic", and against a painted
   # jungle they look like a browser dialog dropped on top. This is the same board the word
   # signs are, scaled up to carry a heading and a line of text.
   ("panel.png", "gates",
    "ONE LARGE BLANK WOODEN NOTICE BOARD standing alone, and nothing else in the picture: a "
    "wide board with softly rounded corners, made of TWO PARTS - a thick warm BROWN WOODEN "
    "FRAME around the outside with a small round bolt in each corner, and inside it a smooth "
    "flat PALE CREAM IVORY panel much lighter than the frame. A few green leaves and two small "
    "white flowers tucked into the top-left and bottom-right corners of the frame only. The "
    "board is about twice as wide as it is tall. The pale cream panel is COMPLETELY EMPTY and "
    "perfectly flat - no letters, no words, no writing, no carving, no wood grain, no picture, "
    "no decoration at all on it. NO posts, NO gate, NO arch, NO ground, NO shadow." + CUTOUT),
   # The first board came with legs and a patch of ground, so it reads as a signpost planted in
   # the scene rather than a card - and its cream face is a small window in a big frame. This is
   # a HANGING plaque: wider than tall, thin frame, most of it face.
   ("panel2.png", "gates",
    "ONE WIDE WOODEN PLAQUE HANGING FROM TWO SHORT ROPES, and nothing else in the picture: a "
    "horizontal board TWICE AS WIDE AS IT IS TALL with softly rounded corners, a THIN warm "
    "brown wooden frame, and inside it a large smooth flat PALE CREAM IVORY panel that fills "
    "most of the board. Two short ropes rise from the top corners to a small wooden bar above. "
    "A few green leaves and two small white flowers tucked into the top-left corner of the "
    "frame only. NO legs, NO posts, NO ground, NO grass, NO stones, NO shadow beneath it. The "
    "pale cream panel is COMPLETELY EMPTY and perfectly flat - no letters, no words, no "
    "writing, no carving, no wood grain, no picture, no decoration at all on it." + CUTOUT),
   ("lantern.png", "scene",
    "A single ORNATE HANGING LANTERN for a game, an old weathered stone and dark metal lantern "
    "with warm glowing golden light inside, hanging from a short curved iron bracket, a small "
    "vine curled around the bracket. Warm glow around the glass." + CUTOUT),
 ],
 # ---- the HUD, which is DOM: each of these becomes a CSS background ------------------------
 "hud": [
   ("ui_banner.png", "ui",
    "A WIDE WOODEN BANNER PLAQUE for a children's game interface: a long horizontal rounded "
    "wooden board with a warm tan flat centre and a thicker darker wooden frame, a small green "
    "leafy vine curling over the top left corner. EXACTLY ONE board in the picture - not two, "
    "not a stack, not a set, just one. The centre of the board is COMPLETELY EMPTY and flat - "
    "no letters, no words, no writing, no icon." + CUTOUT),
   ("ui_badge.png", "ui",
    "A ROUND WOODEN BADGE for a children's game interface: a circular cream-faced wooden medallion "
    "with a thick warm brown carved wooden rim. The face is COMPLETELY EMPTY and flat - no "
    "letters, no words, no writing, no symbol." + CUTOUT),
   ("ui_btn.png", "ui",
    "A SQUARE WOODEN BUTTON for a children's game interface, a small rounded-square block of warm "
    "brown wood with a lighter bevelled top edge and a darker base, empty face. No letters, no "
    "words, no icon, no symbol on it." + CUTOUT),
   ("heart_full.png", "ui",
    "A single plump glossy RED CARTOON HEART for a game's lives counter, bright cherry red with a "
    "soft white shine highlight and a bold dark outline." + CUTOUT),
   ("heart_empty.png", "ui",
    "A single SPENT CARTOON HEART for a game's lives counter, the same plump heart shape as a "
    "full red one but drained of colour: filled flat MID-GREY, clearly darker than white, with a "
    "darker grey outline and no shine. It must read as a grey heart, not as a white one." + CUTOUT),
 ],
 # ---- the two moments of feedback ---------------------------------------------------------
 "fx": [
   ("fx_star.png", "fx",
    "A CELEBRATION BURST for a children's game: one chunky rounded white-gold star in the middle "
    "with a soft warm golden glow behind it and small gold sparkles and streaks radiating "
    "outwards. Nothing else." + CUTOUT),
   ("fx_cross.png", "fx",
    "A GENTLE MISTAKE MARK for a children's game: a thick rounded WHITE CROSS (an X) inside a "
    "soft round red badge, with a warm red glow and a few small red streaks radiating outwards. "
    "Friendly and soft, not harsh or scary." + CUTOUT),
 ],
 # ---- the two poses the sheet adds, in front view ------------------------------------------
 "char": [
   ("swifty_happy.png", "sprites",
    "SWIFTY, the SAME character as the attached second reference image - a small friendly white "
    "eagle chick with a bright yellow beak, a BRIGHT YELLOW zip-up jacket with a smiley badge, a "
    "brown satchel across the body, BLUE shorts and orange feet. Keep her colours, outfit and "
    "proportions exactly. Seen from the FRONT, facing the camera, cheering with both wings spread "
    "out wide and a big happy open smile, eyes closed and happy, standing, full body." + CUTOUT),
   ("swifty_hit.png", "sprites",
    "SWIFTY, the SAME character as the attached second reference image - a small friendly white "
    "eagle chick with a bright yellow beak, a BRIGHT YELLOW zip-up jacket with a smiley badge, a "
    "brown satchel across the body, BLUE shorts and orange feet. Keep her colours, outfit and "
    "proportions exactly. Seen from the FRONT, sitting down on the ground after a small tumble, "
    "eyes squeezed shut, one wing rubbing her head, a couple of tiny sweat drops - gently funny "
    "and not hurt or sad, full body." + CUTOUT),
   ("swifty_jump.png", "sprites",
    "SWIFTY, the SAME character as the attached second reference image - a small friendly white "
    "eagle chick with a bright yellow beak, a BRIGHT YELLOW zip-up jacket with a smiley badge, a "
    "brown satchel across the body, BLUE shorts and orange feet. Keep her colours, outfit and "
    "proportions exactly. Seen from BEHIND, running away from the camera and JUMPING, both feet "
    "off the ground with knees tucked and both wings raised, full body." + CUTOUT),
 ],
}

OPAQUE = {"bg_sky.png", "tex_grass.png", "tex_path.png"}


def post(body, tries=3):
    for k in range(tries):
        try:
            req = urllib.request.Request(URL, data=json.dumps(body).encode(),
                                         headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=300) as r:
                return json.load(r)
        except Exception:
            if k == tries - 1:
                raise
            time.sleep(6 + 6 * k)


def generate(prompt, refs):
    parts = [{"inline_data": {"mime_type": "image/png",
                              "data": base64.b64encode(b).decode()}} for b in refs]
    parts.append({"text": prompt + LOOK})
    j = post({"contents": [{"parts": parts}]})
    for p in j.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        d = p.get("inlineData") or p.get("inline_data")
        if d:
            return base64.b64decode(d["data"])
    return None


def key_out_background(im, tol=32):
    """Flood the surround away, seeded from EVERY border pixel.

    Not a global "delete near-white": the plank's cream face and Swifty's white head are light
    and a global rule hollows them out. Not corner-only either: an arching vine or a raised wing
    that runs off the top of the frame fences off a pocket of background with no corner in it,
    and that pocket ships as a white box behind the art.
    """
    im = im.convert("RGBA")
    w, h = im.size
    px = im.load()
    seen = bytearray(w * h)
    q = deque()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]

    def like_bg(c):
        return any(abs(c[0] - r[0]) <= tol and abs(c[1] - r[1]) <= tol
                   and abs(c[2] - r[2]) <= tol for r in corners)

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
        if c[3] == 0 or not like_bg(c):
            continue
        seen[i] = 1
        px[x, y] = (c[0], c[1], c[2], 0)
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    box = im.getchannel("A").getbbox()
    im = im.crop(box) if box else im
    # a pocket the fill could not reach shows up as near-white still opaque on an edge
    p2, (w2, h2) = im.load(), im.size
    edge = sum(1 for x in range(0, w2, 3) for y in (0, h2 - 1)
               if p2[x, y][3] > 200 and min(p2[x, y][:3]) > 235)
    if edge > w2 // 12:
        print("     !! near-white still opaque along an edge - background pocket, regenerate")
    return im


def main():
    group = sys.argv[1] if len(sys.argv) > 1 else "all"
    only = sys.argv[2:] or None
    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    pan = _panels()
    swifty = io.open(SWIFTY, "rb").read() if os.path.isfile(SWIFTY) else None
    if swifty:
        b = io.BytesIO(); Image.open(io.BytesIO(swifty)).convert("RGBA").save(b, "PNG")
        swifty = b.getvalue()
    groups = list(JOBS) if group == "all" else [group]
    for g in groups:
        for name, panel, prompt in JOBS.get(g, []):
            if only and name not in only:
                continue
            out = os.path.join(OUT, name)
            if os.path.isfile(out):
                print("  %-22s already there, skipped" % name); continue
            refs = [pan[panel]] + ([swifty] if g == "char" and swifty else [])
            try:
                raw = generate(prompt, refs)
            except Exception as ex:
                print("  %-22s FAILED  %s" % (name, str(ex)[:60])); continue
            if not raw:
                print("  %-22s no image returned" % name); continue
            im = Image.open(io.BytesIO(raw))
            im = im.convert("RGB") if name in OPAQUE else key_out_background(im)
            im.save(out)
            print("  %-22s %sx%s  %.0f KB" % (name, im.size[0], im.size[1],
                                              os.path.getsize(out) / 1024.0))
            time.sleep(2)


if __name__ == "__main__":
    main()
