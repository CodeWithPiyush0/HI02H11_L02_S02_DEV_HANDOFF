# -*- coding: utf-8 -*-
"""Fold मात्रा रनर into the lesson's own code, so it stops being a second app.

Yasir: "you are still treating it as separate game, include its code, files assets etc all in
the main files and folder."

The iframe was the safe first step; this is the real merge. The game's stylesheet, its markup and
its 32KB of script are moved INTO the engine's own files, and its pictures into the lesson's
assets folder. Afterwards there is no matra-runner directory, no second document and no frame -
screen 18 is a slide like any other, drawn by the same engine.

Three things make that safe, and this script exists so they are done the same way every time
rather than by hand:

  SCOPING. The game's CSS opens with `*`, `html,body` and `:root`. Dropped into a document that
  already has 2000 lines of lesson CSS those are not styles, they are a collision. Every selector
  is rewritten under `.mr-root`, so the game can only paint inside its own container.

  THE ONE ID CLASH. Both documents call something `stage` - the lesson's is the whole scaled
  canvas. The game's is renamed `mrStage` in its markup, its CSS and its script together; leaving
  any one of the three would break silently and only on that screen.

  A WAY TO STOP IT. The game binds keydown and resize on `window` and drives a
  requestAnimationFrame loop. In its own tab it never needs to stop; inside a lesson it must, or
  every visit leaves another loop running under the next screen. Both calls are routed through
  helpers the wrapper owns, so teardown can take them all back.

Re-run it whenever the game itself changes: it rewrites the fenced blocks in place.
"""
import io, os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# The game's SOURCE lives with the other build inputs, not in the shipped bundle:
# 3_CURRENT_BUILD holds the lesson, and after this step the lesson IS the game.
SRC  = os.path.join(HERE, "1_SPEC", "matra_runner_src", "index.html")
JS   = os.path.join(HERE, "4_ENGINE", "train_modules.js")
CSS  = os.path.join(HERE, "4_ENGINE", "train_styles.css")
IMG_SRC = os.path.join(HERE, "1_SPEC", "matra_runner_src", "assets", "img")
IMG_DST = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "MatraRunner")

ROOT_CLASS = "mr-root"
JS_BEGIN, JS_END = "/* ==== MATRA-RUNNER EMBED BEGIN ==== */", "/* ==== MATRA-RUNNER EMBED END ==== */"
CSS_BEGIN, CSS_END = "/* ==== MATRA-RUNNER CSS BEGIN ==== */", "/* ==== MATRA-RUNNER CSS END ==== */"


def scope_css(css, root):
    """Confine every rule to `.root`. Handles @media/@supports by recursing into their bodies."""
    out, i, n = [], 0, len(css)
    while i < n:
        at = css.find("@", i)
        brace = css.find("{", i)
        if brace < 0:
            out.append(css[i:]); break
        if 0 <= at < brace:                      # an at-rule
            head = css[i:brace + 1]
            depth, j = 1, brace + 1
            while j < n and depth:
                if css[j] == "{": depth += 1
                elif css[j] == "}": depth -= 1
                j += 1
            body = css[brace + 1:j - 1]
            name = head[head.find("@"):].split()[0].lower()
            if name in ("@media", "@supports"):
                out.append(head + scope_css(body, root) + "}")
            else:                                 # @keyframes / @font-face: leave alone
                out.append(head + body + "}")
            i = j
            continue
        sels = css[i:brace]
        depth, j = 1, brace + 1
        while j < n and depth:
            if css[j] == "{": depth += 1
            elif css[j] == "}": depth -= 1
            j += 1
        body = css[brace + 1:j - 1]
        fixed = []
        for sel in sels.split(","):
            s = sel.strip()
            if not s:
                continue
            base = s.split()[0]
            if base in ("html", "body", ":root"):
                # the game's page-level rules become the container's own
                rest = s[len(base):].strip()
                fixed.append(("." + root + " " + rest).strip() if rest else "." + root)
            elif s.startswith("." + root):
                fixed.append(s)
            else:
                fixed.append("." + root + " " + s)
        out.append(", ".join(fixed) + "{" + body + "}")
        i = j
    return "".join(out)


def main():
    src = io.open(SRC, encoding="utf-8").read()

    css = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
    body = re.search(r"<body[^>]*>(.*?)</body>", src, re.S).group(1)
    scripts = re.findall(r"<script[^>]*>(.*?)</script>", src, re.S)
    game_js = max(scripts, key=len)              # the bridge block is the small one; drop it

    # markup: strip the <script> tags out of the body
    markup = re.sub(r"<script[^>]*>.*?</script>", "", body, flags=re.S).strip()

    # --- the one id clash, fixed in all three places at once ---------------------------------
    n_ids = markup.count('id="stage"')
    markup = markup.replace('id="stage"', 'id="mrStage"')
    css = css.replace("#stage", "#mrStage")
    game_js = game_js.replace('"stage"', '"mrStage"')

    # --- the .png probe goes -------------------------------------------------------------------
    # Standalone the game tried character.png first and fell back to the .svg, so an artist could
    # drop a PNG in without touching code. Merged into the lesson that convenience costs a 404 on
    # every single load, and the swap is now a one-line edit here instead. Only the file that
    # exists is asked for.
    n_probe = game_js.count('["character.png","character.svg"]')
    game_js = game_js.replace('["character.png","character.svg"]', '["character.svg"]')

    # --- assets move into the lesson's own folder ---------------------------------------------
    game_js = game_js.replace('"assets/img/"', '"assets/MatraRunner/"')
    game_js = game_js.replace('"assets/img/coin.svg"', '"assets/MatraRunner/coin.svg"')
    game_js = game_js.replace('dir: "assets/audio/"', 'dir: "assets/MatraRunner/audio/"')

    # --- lifecycle: everything the wrapper must be able to take back ---------------------------
    n_on = game_js.count("window.addEventListener(")
    game_js = game_js.replace("window.addEventListener(", "MR_ON(window, ")
    n_raf = game_js.count("requestAnimationFrame(")
    game_js = game_js.replace("requestAnimationFrame(", "MR_RAF(")

    scoped = scope_css(css, ROOT_CLASS)

    def js_str(s):
        return "\"" + s.replace("\\", "\\\\").replace('"', '\\"').replace("\n", "\\n") + "\""

    js = []
    js.append(JS_BEGIN)
    js.append("  /* GENERATED by 1_SPEC/embed_matra_runner.py - do not hand-edit.")
    js.append("     The whole of \u092e\u093e\u0924\u094d\u0930\u093e \u0930\u0928\u0930, folded into the engine: its markup, and its script")
    js.append("     wrapped so the lesson can start and stop it. Re-run that script to refresh. */")
    js.append("  const MATRA_RUNNER_HTML = " + js_str(markup) + ";")
    js.append("  function bootMatraRunner(){")
    js.append("    var _dead = false, _ls = [], _raf = 0;")
    js.append("    function MR_ON(t, e, f, o){ t.addEventListener(e, f, o); _ls.push([t, e, f, o]); }")
    js.append("    function MR_RAF(fn){ if(_dead) return 0; _raf = requestAnimationFrame(fn); return _raf; }")
    js.append("    try {")
    js.append(game_js)
    js.append("    } catch(err){ try{ console.error('matra-runner:', err); }catch(e){} }")
    js.append("    return function teardown(){")
    js.append("      _dead = true;")
    js.append("      if(_raf) { try{ cancelAnimationFrame(_raf); }catch(e){} }")
    js.append("      _ls.forEach(function(l){ try{ l[0].removeEventListener(l[1], l[2], l[3]); }catch(e){} });")
    js.append("      _ls.length = 0;")
    js.append("    };")
    js.append("  }")
    js.append(JS_END)
    block = "\n".join(js)

    s = io.open(JS, encoding="utf-8").read()
    if JS_BEGIN in s:
        s = re.sub(re.escape(JS_BEGIN) + ".*?" + re.escape(JS_END), lambda m: block, s, flags=re.S)
    else:
        anchor = "  SlideModules.MINI_GAME = {"
        assert s.count(anchor) == 1, "MINI_GAME module not found"
        s = s.replace(anchor, block + "\n\n" + anchor)
    io.open(JS, "w", encoding="utf-8").write(s)

    cblock = (CSS_BEGIN + "\n"
              "/* GENERATED by 1_SPEC/embed_matra_runner.py - do not hand-edit.\n"
              "   \u092e\u093e\u0924\u094d\u0930\u093e \u0930\u0928\u0930's own stylesheet, every selector confined to ." + ROOT_CLASS + " so a game\n"
              "   that styles `*`, `html,body` and `:root` cannot reach the lesson around it. */\n"
              + scoped + "\n" + CSS_END)
    c = io.open(CSS, encoding="utf-8").read()
    if CSS_BEGIN in c:
        c = re.sub(re.escape(CSS_BEGIN) + ".*?" + re.escape(CSS_END), lambda m: cblock, c, flags=re.S)
    else:
        c = c + "\n\n" + cblock + "\n"
    io.open(CSS, "w", encoding="utf-8").write(c)

    # --- pictures into the lesson's assets -----------------------------------------------------
    moved = []
    if os.path.isdir(IMG_SRC):
        if not os.path.isdir(IMG_DST): os.makedirs(IMG_DST)
        for f in sorted(os.listdir(IMG_SRC)):
            if f.lower().endswith((".svg", ".png", ".webp")):
                io.open(os.path.join(IMG_DST, f), "wb").write(
                    io.open(os.path.join(IMG_SRC, f), "rb").read())
                moved.append(f)

    print("  markup     : %.1f KB   (id=stage renamed in %d place(s))" % (len(markup)/1024.0, n_ids))
    print("  script     : %.1f KB   (%d window listeners and %d rAF calls made stoppable)"
          % (len(game_js)/1024.0, n_on, n_raf))
    print("  stylesheet : %.1f KB   scoped under .%s" % (len(scoped)/1024.0, ROOT_CLASS))
    print("  probe      : character.png dropped (%d site) - only the .svg is fetched now" % n_probe)
    print("  pictures   : %s -> assets/MatraRunner/" % (", ".join(moved) or "none"))


if __name__ == "__main__":
    main()
