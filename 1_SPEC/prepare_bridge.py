# -*- coding: utf-8 -*-
"""Turn the bridge parts and Yasir's valley video into the runner's shipped assets.

  deck  deck_2.png  -> bridge_deck.webp   mirrored top-to-bottom: the generated tile meets itself
                                          across (wrap seam 34 vs 24 inside) but not down (64 vs 44)
  post  post_1.png  -> bridge_post.webp   magenta un-mixed to alpha, cropped to the post
  wall  wall_2.png  -> bridge_wall.webp   the wall band only, un-mixed, mirrored left-to-right:
                                          its two ends did not meet at all (seam 149 vs 23)
  video Water_moving_in_river_*.mp4 -> bg_valley.mp4 + bg_valley.webp (poster)
        the audio track is dropped (the game has its own music), and the loop is made seamless:
        the last second is cross-faded into the first, so frame 9.0 s runs straight into 0.0 s

Run:  python 1_SPEC/prepare_bridge.py
"""
import glob, os, subprocess, sys
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "1_SPEC", "game_art_src", "bridge")
DST = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "MatraRunner")
M = (255, 0, 255)


def magness(c):
    r, g, b = c[:3]
    return max(0.0, min(1.0, (min(r, b) - g - 40) / 175.0))


def unmix(im):
    """Magenta -> alpha, with the magenta's share subtracted back out of every edge pixel, so no
    pink rim is left on the dark outline."""
    im = im.convert("RGB"); w, h = im.size; px = im.load()
    out = Image.new("RGBA", (w, h)); op = out.load()
    for y in range(h):
        for x in range(w):
            c = px[x, y]; a = 1.0 - magness(c)
            if a <= 0.02:
                op[x, y] = (0, 0, 0, 0); continue
            if a < 0.98:
                c = tuple(int(max(0, min(255, (c[i] - (1 - a) * M[i]) / a))) for i in range(3))
            op[x, y] = (c[0], c[1], c[2], int(round(a * 255)))
    return out


def save(im, name, q=88):
    p = os.path.join(DST, name)
    im.save(p, "WEBP", quality=q, method=6)
    print("  %-18s %dx%d  %6.0f KB" % (name, im.width, im.height, os.path.getsize(p) / 1024))


def main():
    # ---- deck: mirror down so the rows meet themselves ---------------------------------------
    d = Image.open(os.path.join(SRC, "deck_2.png")).convert("RGB")
    t = Image.new("RGB", (d.width, d.height * 2))
    t.paste(d, (0, 0)); t.paste(d.transpose(Image.FLIP_TOP_BOTTOM), (0, d.height))
    save(t.resize((768, 1536), Image.LANCZOS), "bridge_deck.webp", 86)

    # ---- post ----------------------------------------------------------------------------------
    p = unmix(Image.open(os.path.join(SRC, "post_1.png")))
    p = p.crop(p.getchannel("A").getbbox())
    p = p.resize((round(p.width * 560 / p.height), 560), Image.LANCZOS)
    save(p, "bridge_post.webp")

    # ---- wall: the band, keyed, mirrored across so its ends meet ---------------------------
    w = unmix(Image.open(os.path.join(SRC, "wall_2.png")))
    # crop to the rows that are SOLID wall, not to the alpha's bounding box: one stray keyed pixel
    # stretched that box 38 rows below the wall's foot, and those empty rows showed as a strip of
    # lake between the deck and the parapet. The clip in the game draws the top at wall height
    # anyway, so ivy standing proud of the coping would be cut there regardless.
    a = w.getchannel("A"); W0, H0 = w.size
    solid = [y for y in range(H0)
             if sum(1 for x in range(0, W0, 4) if a.getpixel((x, y)) > 200) > 0.6 * (W0 / 4)]
    w = w.crop((0, solid[0], W0, solid[-1] + 1))
    m = Image.new("RGBA", (w.width * 2, w.height))
    m.paste(w, (0, 0)); m.paste(w.transpose(Image.FLIP_LEFT_RIGHT), (w.width, 0))
    # [r69] at the height it was painted, not shrunk to 240: the nearest wall is drawn ~500
    # device px tall, and 240 px of art stretched over that is what read as low quality
    save(m, "bridge_wall.webp", 90)

    # ---- video ---------------------------------------------------------------------------------
    srcv = sorted(glob.glob(os.path.join(HERE, "3_CURRENT_BUILD", "assets", "video", "*.mp4")))
    if not srcv:
        print("  (no video found)"); return
    v = srcv[-1]
    outv = os.path.join(DST, "bg_valley.mp4")
    # head = 0-1 s, tail = 9-10 s; the tail fades into the head, then 1-9 s follows: 9 s loop
    fc = ("[0:v]split=3[a][b][c];"
          "[a]trim=9:10,setpts=PTS-STARTPTS[tail];"
          "[b]trim=0:1,setpts=PTS-STARTPTS[head];"
          "[c]trim=1:9,setpts=PTS-STARTPTS[mid];"
          "[tail][head]xfade=transition=fade:duration=1:offset=0[seam];"
          "[seam][mid]concat=n=2:v=1:a=0,format=yuv420p[v]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", v, "-filter_complex", fc, "-map", "[v]",
                    "-an", "-c:v", "libx264", "-preset", "slow", "-crf", "25", "-profile:v", "main",
                    "-movflags", "+faststart", outv], check=True)
    print("  %-18s %6.0f KB  (source %6.0f KB)" % ("bg_valley.mp4", os.path.getsize(outv) / 1024,
                                                   os.path.getsize(v) / 1024))
    poster = os.path.join(DST, "_poster.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0", "-i", outv, "-frames:v", "1", poster],
                   check=True)
    save(Image.open(poster).convert("RGB"), "bg_valley.webp", 84)
    os.remove(poster)


if __name__ == "__main__":
    main()
