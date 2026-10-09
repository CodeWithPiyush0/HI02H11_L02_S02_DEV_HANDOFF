# -*- coding: utf-8 -*-
"""[r116] Yasir's new runner art -> the files the game loads (the old ones are in git history).

  sources: 1_SPEC/game_art_src/r116_new/  (as delivered, moved out of the build)
           1_SPEC/game_art_src/gen2/wall2.png, deck2.png  (gen_ref_art.py bridge2 - generated FROM his
           bridge picture, which is drawn in perspective: the renderer needs the wall face front-on and
           the path surface as a tile, so it can scroll them)

  wall   wall2.png  -> bridge_wall.webp  solid rows only, mirrored left-to-right so its ends meet
  deck   deck2.png  -> bridge_deck.webp  mirrored top-to-bottom so it meets itself, 768x1536 as before
  coin   coin_star.png (cut from "Golden Star Coin and Floral Message Board.png") -> coin.webp, 140 px
  board  board.png (cut from the same sheet) -> ui_badge.webp, 380 px wide (the matra sits on it)
  video  Waterfalls_flowing_into_river_1080p_*.mp4 -> bg_valley.mp4 + bg_valley.webp (poster):
         the generator's sparkle mark left alone - it falls behind the right parapet in the game, 1280x720, no audio,
         and the loop made seamless (the last second cross-faded into the first: a 9 s loop)

Run:  python 1_SPEC/prepare_bridge2.py
"""
import glob, os, subprocess
from PIL import Image

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NEW = os.path.join(HERE, "1_SPEC", "game_art_src", "r116_new")
GEN2 = os.path.join(HERE, "1_SPEC", "game_art_src", "gen2")
DST = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "MatraRunner")


def save(im, name, q=88, lossless=False):
    p = os.path.join(DST, name)
    if lossless:
        im.save(p, "WEBP", lossless=True, quality=100, method=6)
    else:
        im.save(p, "WEBP", quality=q, method=6)
    print("  %-18s %5dx%-5d %6.0f KB" % (name, im.size[0], im.size[1], os.path.getsize(p) / 1024))


def main():
    # ---- wall: the solid band, mirrored so its two ends meet ------------------------------------
    w = Image.open(os.path.join(GEN2, "wall2.png")).convert("RGBA")
    a = w.getchannel("A"); W0, H0 = w.size
    solid = [y for y in range(H0)
             if sum(1 for x in range(0, W0, 4) if a.getpixel((x, y)) > 200) > 0.6 * (W0 / 4)]
    w = w.crop((0, solid[0], W0, solid[-1] + 1))
    m = Image.new("RGBA", (w.width * 2, w.height))
    m.paste(w, (0, 0)); m.paste(w.transpose(Image.FLIP_LEFT_RIGHT), (w.width, 0))
    save(m, "bridge_wall.webp", 90)

    # ---- deck: mirrored down so the rows meet themselves -----------------------------------------
    d = Image.open(os.path.join(GEN2, "deck2.png")).convert("RGB")
    t = Image.new("RGB", (d.width, d.height * 2))
    t.paste(d, (0, 0)); t.paste(d.transpose(Image.FLIP_TOP_BOTTOM), (0, d.height))
    save(t.resize((768, 1536), Image.LANCZOS), "bridge_deck.webp", 86)

    # ---- coin and board ---------------------------------------------------------------------------
    c = Image.open(os.path.join(NEW, "coin_star.png")).convert("RGBA")
    save(c.resize((140, round(140 * c.height / c.width)), Image.LANCZOS), "coin.webp", lossless=True)
    b = Image.open(os.path.join(NEW, "board.png")).convert("RGBA")
    save(b.resize((380, round(380 * b.height / b.width)), Image.LANCZOS), "ui_badge.webp", lossless=True)

    # ---- video --------------------------------------------------------------------------------------
    v = sorted(glob.glob(os.path.join(NEW, "*.mp4")))[-1]
    outv = os.path.join(DST, "bg_valley.mp4")
    # the generator's small sparkle mark (lower right, ~1704-1774 x 890-935 of 1080p) is left as it is:
    # the game pins the sun to the vanishing point and scales the frame to cover, which puts that corner
    # at about 91% across and 84% down the screen - behind the right-hand parapet. (Painting it out
    # smeared a streak; patching it showed a rectangle as the trees moved.)
    fc = ("[0:v]scale=1280:720:flags=lanczos,split=3[a][b][c];"
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
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", "0", "-i", outv, "-frames:v", "1", poster], check=True)
    save(Image.open(poster).convert("RGB"), "bg_valley.webp", 84)
    os.remove(poster)


if __name__ == "__main__":
    main()
