# -*- coding: utf-8 -*-
"""[r118] Swifty cheering, seen from the FRONT, for the runner's end screen - with her HANDS.

The old end pose (swifty_happy.webp) gave her big feathered wings instead of arms; Yasir: "her hand is
not present". The cover's Swifty (assets/UI/start_mascot.webp - front view, white mitten hands) is the
model, and the runner's art sets the style. Uses gen_ref_art.py's generator and background keying.
Output: 1_SPEC/game_art_src/gen2/swifty_happy2.png  -> prepare_runner_art.py swifty_happy2.png
"""
import io, os, sys
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gen_ref_art as G

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(G.OUT, "swifty_happy2.png")
ref = Image.open(os.path.join(HERE, "3_CURRENT_BUILD", "assets", "UI", "start_mascot.webp")).convert("RGBA")
bg = Image.new("RGBA", ref.size, (255, 255, 255, 255)); bg.alpha_composite(ref)
b = io.BytesIO(); bg.convert("RGB").save(b, "PNG")
panel = io.open(os.path.join(G.PANELS, "sprites.png"), "rb").read()
prompt = ("SWIFTY, the SAME character as the attached second reference image - a small friendly white eagle chick "
          "with a fluffy white head, a bright yellow beak, big happy eyes, a BRIGHT YELLOW hoodie with a smiley "
          "badge, a brown satchel across the body, BLUE shorts, orange feet, and small WHITE MITTEN HANDS at the "
          "ends of her yellow sleeves (NO feathered wings at all). Keep her colours, outfit and proportions exactly. "
          "Seen from the FRONT, CELEBRATING: both arms raised high above her head with her two white hands clearly "
          "visible and open, a big happy open-beak smile with her eyes squeezed shut in joy, standing on both feet, "
          "full body." + G.CUTOUT)
for k in range(3):
    raw = G.generate(prompt, [panel, b.getvalue()])
    if raw: break
if not raw: sys.exit("no image returned")
im = G.key_out_background(Image.open(io.BytesIO(raw)))
im.save(out); print("wrote", out, im.size)
