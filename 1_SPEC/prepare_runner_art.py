# -*- coding: utf-8 -*-
"""Turn the delivered artwork into the files the game actually loads.

The art arrived as 14 PNGs totalling 23.2 MB, at generation size (1024-2172px) and under
descriptive names. Three things have to happen before the game can use it:

  SIZE. 23 MB on a bundle already near its ceiling, to draw into a canvas about 1300px wide, is
  a download the child pays for and never sees. Each file is resized to roughly twice its largest
  on-screen size (enough for a 2x display) and re-encoded as WebP - lossy for the opaque scenery,
  lossless-alpha for the cut-outs, where a lossy edge shows as a halo.

  NAMES. The loader keys off the spec's filenames; the delivery uses its own. Mapped here, in one
  table, rather than by renaming files a person would have to redo next time.

  THE GROUND HAS TO TILE. grass and path are 1672x941 textures, not the 512px seamless tiles the
  spec asked for, and the renderer scrolls them vertically with createPattern - a non-seamless
  texture would show a hard line running down the screen every second. Each is stacked with a
  vertically mirrored copy of itself, which makes the vertical join continuous by construction.
  The horizontal direction never repeats: the image is wider than the canvas.

Re-run after dropping new files into 1_SPEC/game_art_src/.
"""
import io, os, sys
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# The delivered artwork is a build INPUT, so it lives with the others. Left inside
# 3_CURRENT_BUILD it shipped: 24MB of generation-size PNGs on the CDN beside the 3.8MB
# of processed files the game actually loads.
SRC  = os.path.join(HERE, "1_SPEC", "game_art_src")
DST  = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "MatraRunner")

# delivered file  ->  (slot filename the loader asks for, max width, mirror-tile?)
PLAN = [
    ("Background/Sky.png",                    "bg_sky.webp",     1600, False),
    ("Background/Temple skyline layer.png",   "bg_temples.webp", 1600, False),
    ("Background/Jungle canopy layer.png",    "bg_canopy.webp",  1600, False),
    # 480, not 768: the tile is MIRRORED into a 2x2 block, so whatever width it has is drawn
    # once and then flipped beside itself. At 768 the block was 1536 across - wider than half
    # the canvas - and the mirror read as a butterfly: the left half of the jungle floor was
    # visibly the right half backwards. Smaller, the same block reads as grass texture.
    ("Ground/Grass and jungle floor.png",     "tex_grass.webp",   480, True),
    ("Ground/Path.png",                       "tex_path.webp",    768, True),
    ("GATE/Gate arch, neutral.png",           "gate_neutral.webp", 520, False),
    ("GATE/gate_correct.png",                 "gate_correct.webp", 520, False),
    ("GATE/gate_wrong.png",                   "gate_wrong.webp",   520, False),
    ("Trees/tree_1.png",                      "tree_1.webp",     500, False),
    ("Trees/tree_2.png",                      "tree_2.webp",     500, False),
    ("Trees/tree_3.png",                      "tree_3.webp",     500, False),
    ("Bushes/bush_1.png",                     "bush_1.webp",     500, False),
    ("Temple pillars/pillar.png",             "pillar_1.webp",   400, False),
]


def trim_alpha(im):
    """Crop away fully transparent margin so the art sits on its own bounds.

    It matters for placement: the game anchors a tree by the bottom of its IMAGE, so a band of
    empty pixels under the trunk would hold every tree off the ground by that much.
    """
    if im.mode != "RGBA":
        return im
    box = im.getchannel("A").getbbox()
    return im.crop(box) if box else im


GEN = os.path.join(HERE, "1_SPEC", "game_art_src", "generated")

# generated cut-out -> (slot filename, max width)
GEN_PLAN = [
    ("heart_full.png",        "heart_full.webp",        128),
    ("heart_empty.png",       "heart_empty.webp",       128),
    ("star_full.png",         "star_full.webp",         128),
    ("star_empty.png",        "star_empty.webp",        128),
    ("swifty_lean_left.png",  "swifty_lean_left.webp",  360),
    ("swifty_lean_right.png", "swifty_lean_right.webp", 360),
    ("swifty_stumble.png",    "swifty_stumble.webp",    360),
    ("swifty_cheer.png",      "swifty_cheer.webp",      360),
    ("plate.png",             "plate.webp",             420),
    ("coin.png",              "coin.webp",              140),
    ("bush_2.png",            "bush_2.webp",            500),
    ("pillar_2.png",          "pillar_2.webp",          400),
]
RUN_FRAMES = ["swifty_run_1.png", "swifty_run_2.png", "swifty_run_3.png", "swifty_run_4.png"]

GEN2 = os.path.join(HERE, "1_SPEC", "game_art_src", "gen2")

# The reference-matched set (gen_ref_art.py). It is processed LAST and deliberately reuses slot
# names from the tables above, so wherever it has a file it wins and wherever it does not the
# delivered artwork is still what ships - the trees, bushes and pillars were never the problem.
#   file -> (slot, max width, mirror-tile?, has alpha?)
GEN2_PLAN = [
    ("bg_sky.png",       "bg_sky.webp",      1600, False, False),
    ("bg_temples.png",   "bg_temples.webp",  1600, False, True),
    ("bg_canopy.png",    "bg_canopy.webp",   1600, False, True),
    # Small. Both are MIRRORED into a 2x2 block, so whatever width they have is drawn once and
    # then flipped beside itself - and at 480/640 the block was half the canvas wide, which made
    # the mirror legible as a mirror: the left half of the jungle floor was plainly the right
    # half backwards. Shrunk, the same block repeats often enough to read as ground texture.
    ("tex_grass.png",    "tex_grass.webp",    260, True,  False),
    ("tex_path.png",     "tex_path.webp",     380, True,  False),
    ("gate_neutral.png", "gate_neutral.webp", 560, False, True),
    ("gate_correct.png", "gate_correct.webp", 560, False, True),
    ("gate_wrong.png",   "gate_wrong.webp",   560, False, True),
    ("plate.png",        "plate.webp",        460, False, True),
    ("rail.png",         "rail.webp",         360, False, True),
    ("hedge.png",        "hedge.webp",        520, False, True),
    ("lantern.png",      "lantern.webp",      220, False, True),
    ("ui_banner.png",    "ui_banner.webp",    520, False, True),
    ("ui_badge.png",     "ui_badge.webp",     200, False, True),
    ("ui_btn.png",       "ui_btn.webp",       160, False, True),
    ("panel2.png",       "panel2.webp",       820, False, True),
    ("heart_full.png",   "heart_full.webp",   128, False, True),
    ("heart_empty.png",  "heart_empty.webp",  128, False, True),
    ("swifty_happy.png", "swifty_happy.webp", 360, False, True),
    ("swifty_hit.png",   "swifty_hit.webp",   360, False, True),
]


def mirror_block(im):
    """A 2x2 mirrored block, so the tile joins itself on BOTH axes.

    createPattern repeats horizontally as well as vertically and the canvas is wider than one
    tile, so stacking only vertically left a seam running down the screen.
    """
    w, h = im.size
    b = Image.new(im.mode, (w * 2, h * 2))
    b.paste(im, (0, 0))
    b.paste(ImageOps.mirror(im), (w, 0))
    b.paste(ImageOps.flip(im), (0, h))
    b.paste(ImageOps.flip(ImageOps.mirror(im)), (w, h))
    return b


# The delivered sheet is a build INPUT, so it lives with the other sources. Left in the bundle
# it shipped: 3.6 MB of generation-size PNG on the CDN beside the 850 KB strip cut from it,
# which nothing loads.
SHEETS_DIR = os.path.join(HERE, "1_SPEC", "game_art_src", "sheets")
SHEET_SRC = os.path.join(SHEETS_DIR, "swifty_running.png")
FALL_SRC  = os.path.join(SHEETS_DIR, "swifty_falling.png")


def build_sheet_strip(cols=4, rows=4, frame_h=360, src=None, out_name="swifty_run.webp"):
    """Turn the delivered 4x4 sprite sheet into the single row the loader reads.

    The generator exports a GRID; MR_ART.rect() slices a strip by width/frames and has no idea
    about rows. Converting here rather than teaching the loader about grids keeps one shape of
    file in the bundle and one code path reading it.

    Every cell is cropped to the SAME box - the union of all sixteen frames' ink, not each
    frame's own - because the game anchors a frame by the bottom of its image. Cropped
    individually the character would rise and fall by whatever each pose happened to occupy,
    which is a bob the animation already has and did not ask for twice.
    """
    src = src or SHEET_SRC
    if not os.path.isfile(src):
        return None
    im = Image.open(src).convert("RGBA")
    cw, ch = im.width // cols, im.height // rows
    cells = [im.crop((c*cw, r*ch, (c+1)*cw, (r+1)*ch)) for r in range(rows) for c in range(cols)]
    box = None
    for cell in cells:
        b = cell.getchannel("A").getbbox()
        if not b:
            continue
        box = b if box is None else (min(box[0], b[0]), min(box[1], b[1]),
                                     max(box[2], b[2]), max(box[3], b[3]))
    if not box:
        return None
    cells = [c.crop(box) for c in cells]
    w0, h0 = cells[0].size
    fw = max(1, round(w0 * frame_h / h0))
    cells = [c.resize((fw, frame_h), Image.LANCZOS) for c in cells]
    strip = Image.new("RGBA", (fw * len(cells), frame_h), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        strip.paste(c, (i * fw, 0), c)
    out = os.path.join(DST, out_name)
    strip.save(out, "WEBP", lossless=True, quality=100, method=4)
    return (strip.size, os.path.getsize(out) / 1024.0, len(cells), (fw, frame_h))


def build_run_strip(frame_h=420):
    """Lay the separate run poses into one horizontal strip on a common baseline.

    Each pose comes back cropped to its own ink, so they differ in height and width - played in
    sequence untouched, Swifty would jump in size and slide sideways every frame. Every pose is
    scaled to the same HEIGHT, centred in a cell as wide as the widest of them, and sat on the
    bottom edge, so the only thing that changes between frames is her legs.
    """
    ims = []
    for f in RUN_FRAMES:
        p = os.path.join(GEN, f)
        if not os.path.isfile(p):
            return None
        im = trim_alpha(Image.open(p).convert("RGBA"))
        w = max(1, round(im.width * frame_h / im.height))
        ims.append(im.resize((w, frame_h), Image.LANCZOS))
    cell = max(i.width for i in ims)
    strip = Image.new("RGBA", (cell * len(ims), frame_h), (0, 0, 0, 0))
    for i, im in enumerate(ims):
        strip.paste(im, (i * cell + (cell - im.width) // 2, 0), im)
    out = os.path.join(DST, out_name)
    strip.save(out, "WEBP", lossless=True, quality=100, method=6)
    return (strip.size, os.path.getsize(out) / 1024.0, len(ims))


def main():
    if not os.path.isdir(DST):
        os.makedirs(DST)
    total_in = total_out = 0
    print("  %-34s %-20s %-13s %s" % ("from", "to", "size", "KB"))
    for rel, out, maxw, mirror in PLAN:
        p = os.path.join(SRC, rel.replace("/", os.sep))
        if not os.path.isfile(p):
            print("  %-34s %-20s MISSING" % (rel[:34], out))
            continue
        total_in += os.path.getsize(p)
        im = Image.open(p)
        has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        im = im.convert("RGBA") if has_alpha else im.convert("RGB")
        if has_alpha:
            im = trim_alpha(im)
        if im.width > maxw:
            im = im.resize((maxw, max(1, round(im.height * maxw / im.width))), Image.LANCZOS)
        if mirror:
            # A 2x2 MIRRORED BLOCK. Stacking only vertically left the horizontal join visible:
            # createPattern repeats on BOTH axes and the canvas is wider than one tile, so a
            # 1024px-wide texture showed a seam running down the screen. Mirroring in both
            # directions makes every edge meet its own reflection, so the pattern is continuous
            # whichever way it repeats.
            w, h = im.size
            block = Image.new(im.mode, (w * 2, h * 2))
            block.paste(im, (0, 0))
            block.paste(ImageOps.mirror(im), (w, 0))
            block.paste(ImageOps.flip(im), (0, h))
            block.paste(ImageOps.flip(ImageOps.mirror(im)), (w, h))
            im = block
        o = os.path.join(DST, out)
        if has_alpha:
            im.save(o, "WEBP", lossless=True, quality=100, method=6)
        else:
            im.save(o, "WEBP", quality=82, method=6)
        kb = os.path.getsize(o) / 1024.0
        total_out += os.path.getsize(o)
        print("  %-34s %-20s %-13s %.0f" % (rel[:34], out, "%dx%d" % im.size, kb))
    # ---- the generated cut-outs -------------------------------------------------------------
    for src_name, out, maxw in GEN_PLAN:
        p = os.path.join(GEN, src_name)
        if not os.path.isfile(p):
            continue
        total_in += os.path.getsize(p)
        im = trim_alpha(Image.open(p).convert("RGBA"))
        if im.width > maxw:
            im = im.resize((maxw, max(1, round(im.height * maxw / im.width))), Image.LANCZOS)
        o = os.path.join(DST, out)
        im.save(o, "WEBP", lossless=True, quality=100, method=6)
        total_out += os.path.getsize(o)
        print("  %-34s %-20s %-13s %.0f" % (src_name[:34], out, "%dx%d" % im.size,
                                            os.path.getsize(o) / 1024.0))
    # ---- the reference-matched set, last so that it wins its slots --------------------------
    for src_name, out, maxw, mirror, alpha in GEN2_PLAN:
        p = os.path.join(GEN2, src_name)
        if not os.path.isfile(p):
            continue
        total_in += os.path.getsize(p)
        im = Image.open(p)
        im = im.convert("RGBA") if alpha else im.convert("RGB")
        if alpha:
            im = trim_alpha(im)
        if im.width > maxw:
            im = im.resize((maxw, max(1, round(im.height * maxw / im.width))), Image.LANCZOS)
        if mirror:
            im = mirror_block(im)
        o = os.path.join(DST, out)
        if alpha:
            im.save(o, "WEBP", lossless=True, quality=100, method=6)
        else:
            im.save(o, "WEBP", quality=82, method=6)
        total_out += os.path.getsize(o)
        print("  %-34s %-20s %-13s %.0f" % ("gen2/" + src_name[:28], out, "%dx%d" % im.size,
                                            os.path.getsize(o) / 1024.0))

    # the delivered sheet wins over the four generated stills, when it is there
    sh = build_sheet_strip()
    if sh:
        total_out += sh[1] * 1024
        print("  %-34s %-20s %-13s %.0f   (%d frames, cell %dx%d)"
              % ("swifty_running.png (4x4 grid)", "swifty_run.webp", "%dx%d" % sh[0], sh[1],
                 sh[2], sh[3][0], sh[3][1]))
    fl = build_sheet_strip(src=FALL_SRC, out_name="swifty_fall.webp")
    if fl:
        total_out += fl[1] * 1024
        print("  %-34s %-20s %-13s %.0f   (%d frames, cell %dx%d)"
              % ("swifty_falling.png (4x4 grid)", "swifty_fall.webp", "%dx%d" % fl[0], fl[1],
                 fl[2], fl[3][0], fl[3][1]))
    r = None if sh else build_run_strip()
    if r:
        total_out += r[1] * 1024
        print("  %-34s %-20s %-13s %.0f   (%d frames)"
              % ("swifty_run_1..4.png", "swifty_run.webp", "%dx%d" % r[0], r[1], r[2]))

    print()
    print("  %.1f MB of source  ->  %.1f MB shipped" % (total_in / 1048576.0, total_out / 1048576.0))


if __name__ == "__main__":
    main()
