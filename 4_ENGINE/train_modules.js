
/* ============================================================================================
   «मात्राओं की रेल» — TRAIN MODULE SET                        [local to HI02H11_L02_S02]
   ============================================================================================
   Built to the SME's recommendations recorded verbatim in
   ../HI02H11_L02_S01/_SME_RECOMMENDATIONS.md (16 screens, deck of 2026-09-16).

   Everything here is ADDITIVE: new entries on SlideModules plus one CSS block. No existing
   module, helper or style is modified, so every other lesson on this engine line renders
   byte-identically. This is the kit's documented per-game route (engine_local/), not an edit
   to the shared engine.

   THREE ENGINE FACTS THIS CODE IS BUILT AROUND — change them at your peril:

   1. capture_pages.py injects `*{animation:none!important;transition:none!important}` to settle
      the renderer for review captures. So every element here is authored in its FINAL position
      with the entry motion applied as an added class. Kill the animation and you get the settled
      slide, not an empty one. (Four attempts were lost to this on the landing glow.)
   2. makeDraggable(tile, onDrop) hit-tests `.dd-zone` and calls onDrop(zone, tile). Coaches that
      accept a drop therefore carry `.dd-zone`; coaches that are only tap targets must NOT, or a
      stray drag would highlight them.
   3. A module that drives its own audio MUST set state.ownsAudio = true, or mountSlide's
      autoPlayChain fires the prompt concurrently and truncates the module's own chain.

   THE LADDER IS 3-ATTEMPT HERE, per the SME on all nine test screens:
      wrong 1 -> shake + hint1 VO, explicitly NO hand
      wrong 2 -> shake + hint2 VO + hand on the CORRECT target
      3rd try correct -> confetti + glow, and SILENT (no praise for a twice-missed item)
   Implemented inside these modules rather than by changing the shared scaffold, so the blast
   radius stays inside this game. Reads scaffold_rules.max_attempts, default 3.
   ============================================================================================ */
(function(){
  "use strict";

  const A = (slide, key) => (typeof audioFor === "function" ? audioFor(slide, key) : null);
  const maxTries = () => ((CARD.scaffold_rules && CARD.scaffold_rules.max_attempts) || 3);

  /* Turn a bare clip ID into a playable path. `audioFor()` does this for ids that live in
     slide.audio, but several modules carry ids INSIDE slide.data (a MEET_PAIR example's line, a
     MATRA_INTRO pair's name, a MATRA_FILL slot's word) and those never pass through it.

     THIS EXISTS BECAUSE THE BUG SHIPPED. MEET_PAIR called `say(ex.audio_line)` with the raw id
     "vo_meet_pul", so the browser requested `/vo_meet_pul` — 404 — and the child heard SILENCE on
     the line that teaches the word, on all three example screens. It was invisible to every check
     we had: the clip exists on disk, the preloader fetches it correctly by id, the asset sweep
     found it, and say()'s 9s fallback timer meant the chain still advanced and the slide still
     completed. Only the browser's own network log showed the 404.
     Found by reading the network log of the packaged handoff copy. */
  function clip(idOrPath){
    if(!idOrPath) return null;
    if(idOrPath.indexOf("/") >= 0 || idOrPath.indexOf(".") >= 0) return idOrPath;  // already a path
    return "assets/Audio/" + idOrPath + "." + AUDIO_EXT;
  }

  /* Speak `src`, run `next` when it ENDS. Per-clip fallback timer so one missing or slow clip
     can never stall a chain — the same belt-and-braces sortSeqReveal uses.
     `src` may be a path OR a bare clip id; clip() normalises it, so no caller can reintroduce
     the 404-on-a-bare-id bug described above. */
  function say(src, next){
    let done = false;
    const go = () => { if(done) return; done = true; if(next) next(); };
    try { play(clip(src) || null, go); } catch(e){ go(); return; }
    setTimeout(go, 9000);
  }
  /* say() for an OPTIONAL clip: a null/absent id runs `next` immediately instead of handing
     play() a null source and then sitting out the 9-second fallback timer. Round 3 has
     several rungs the SME deliberately SILENCES — the 3rd-attempt win on every test screen,
     the completion line on every sort screen — and each of those is an absent clip, not a
     pause the child should sit through. */
  function sayOpt(src, next){ if(!src){ if(next) next(); return; } say(src, next); }

  function sayAll(list, next){
    let i = 0;
    (function step(){ if(i >= list.length){ if(next) next(); return; } say(list[i++], step); })();
  }

  /* ---------------------------------------------------------------- procedural SFX */
  /* The SME asks for a train arrival sound, a soft pop as each matra lands and a sparkle when
     one is highlighted. The engine already synthesises its SFX with _tone() rather than
     shipping audio files, so these are built the same way — no new assets, nothing to 404. */
  const _t = (f, w, d, v) => { if(typeof _tone === "function") _tone(f, w, d, v); };
  /* REAL RECORDED SFX, brought over from the sibling lesson. The SME asks for "a soft train
     arrival / whistle SFX when the train enters" on the landing and on every train screen; round
     3 first synthesised those with the engine's own _tone(), which gives a two-note beep rather
     than a train. These play the actual files and fall back to the synthesised tone if one is
     ever missing, so a stripped bundle still makes a noise rather than going silent. */
  function sfxFile(name, fallback){
    try{
      const a = new Audio("assets/Audio/" + name + "." + AUDIO_EXT);
      a.volume = 0.55;
      a.play().catch(()=> fallback && fallback());
    }catch(e){ if(fallback) fallback(); }
  }
  const _toneWhistle = ()=> _t([430, 660, 560], "sine", 0.55, 0.075);
  const sfxWhistle      = ()=> sfxFile("sfx_whistle",      _toneWhistle);  // the toot
  const sfxTrainMove    = ()=> sfxFile("sfx_train_move",   null);          // the chug bed
  const sfxTrainArrive  = ()=> sfxFile("sfx_train_arrive", _toneWhistle);  // settling onto the rail
  const sfxPopSoft = ()=> _t([720], "sine", 0.10, 0.07);
  const sfxSparkle = ()=> _t([1180, 1560], "sine", 0.22, 0.055);

  /* ================================================================ matra highlight */
  /* Colour ONLY the matra inside a rendered word — the SME's most repeated teach-screen note
     («Highlight only the ा matra in the word»), and the one thing the first build could not do
     for this skill.

     WHY THE ENGINE'S OWN METHOD CANNOT DO IT. RIGHT_SPACING_MATRAS + _matraClipCols clip a
     vertical PIXEL COLUMN range out of a duplicate of the word. That works for ा and ी, which
     occupy their own advance width to the right of the consonant. ु and ू are BELOW-BASE marks
     with ZERO advance: they sit under their consonant and share its columns. A column clip
     therefore selects the consonant and whatever follows. Forced on and measured, «पुल» put
     11,342 red pixels on the ल and «फूल» produced a 13-pixel sliver. Both are silently wrong,
     which is worse than no highlight, so the builder hard-fails if either matra is added to
     RIGHT_SPACING_MATRAS.

     WHAT WORKS: clip in TWO dimensions instead of one.
       1. Segment the word into grapheme clusters (Intl.Segmenter, 'hi'), so «पुल» → ["पु","ल"]
          and the mark is never separated from its base.
       2. For each cluster containing the target mark, take that cluster's x-range with a Range
          rect — exact, and it costs nothing that guessing at character widths would save.
       3. Intersect with the band BELOW the baseline (found with a zero-size inline-block strut,
          which sits exactly on it). Nothing else in these words descends, so the intersection
          contains the mark and only the mark.
     For a right-spacing matra the below-baseline band is empty, so mode "right" clips the
     cluster's x-range at FULL height minus the base's advance — measured the same way, by
     rendering the cluster without its mark. Both modes are exercised; भाग 2 (ए/ऐ) will need the
     third, "above", for े/ै, and the hook is here.

     Verified at 150px on पुल, फूल and मुकुट — the last of which correctly reddens BOTH marks.
     The overlay duplicates the whole word and is clipped, so it can never drift out of register
     with the original, at any size or weight. aria-hidden keeps the word read once. */
  const _segmenter = (typeof Intl !== "undefined" && Intl.Segmenter)
    ? new Intl.Segmenter("hi", { granularity: "grapheme" }) : null;

  function clustersOf(word){
    if(_segmenter) return [..._segmenter.segment(word)].map(s => s.segment);
    return [...word];                                   // never hit in Chromium; safe fallback
  }

  /* Measure the advance width of `txt` in the same computed font as `ref`. */
  function _advance(txt, ref){
    const m = document.createElement("span");
    const cs = getComputedStyle(ref);
    m.style.cssText = "position:absolute;visibility:hidden;white-space:pre;left:-9999px;" +
      "font:" + cs.font + ";font-family:" + cs.fontFamily + ";font-size:" + cs.fontSize +
      ";font-weight:" + cs.fontWeight + ";letter-spacing:" + cs.letterSpacing;
    m.textContent = txt;
    document.body.appendChild(m);
    const w = m.getBoundingClientRect().width;
    m.remove();
    return w;
  }

  /* el: an element whose ONLY child is the word text. Rewrites it as .mh + clipped overlays. */
  function matraHL(el, matra, opts){
    if(!el || !matra) return false;
    const word = (el.dataset.mhWord || el.textContent || "").trim();
    if(!word || word.indexOf(matra) < 0) return false;
    el.dataset.mhWord = word;
    el.textContent = word;                              // reset if we are re-highlighting
    el.classList.add("mh");

    const clusters = clustersOf(word);
    const rect = el.getBoundingClientRect();
    if(!rect.width || !rect.height) return false;       // not laid out yet — caller retries

    /* baseline, via a zero-size inline-block strut: its top edge sits on the baseline */
    const strut = document.createElement("span");
    strut.style.cssText = "display:inline-block;width:0;height:0";
    el.appendChild(strut);
    const baseline = strut.getBoundingClientRect().top - rect.top;
    strut.remove();

    const tn = el.firstChild;
    if(!tn || tn.nodeType !== 3) return false;
    let off = 0, made = 0;
    clusters.forEach(cl => {
      if(cl.indexOf(matra) >= 0){
        const r = document.createRange();
        r.setStart(tn, off); r.setEnd(tn, off + cl.length);
        const cb = r.getBoundingClientRect();
        let x0 = cb.left - rect.left, x1 = cb.right - rect.left, y0 = baseline, y1 = rect.height;

        /* right-spacing marks (ा, ी) carry their own advance, so the mark is the slice of the
           cluster BEYOND the base's width, and it runs the full height rather than below the
           baseline. Detected by measuring, not by a hard-coded list of matras. */
        const base = cl.split(matra).join("");
        if(base){
          const grow = _advance(cl, el) - _advance(base, el);
          if(grow > 3){ x0 = x0 + (x1 - x0) - grow; y0 = 0; }
        }

        const ov = document.createElement("span");
        ov.className = "mh-ov" + (opts && opts.glow ? " mh-glow" : "");
        ov.setAttribute("aria-hidden", "true");
        /* THE OVERLAY'S TEXT LIVES IN AN ATTRIBUTE, NOT IN A TEXT NODE, and is painted by
           .mh-ov::before{content:attr(data-w)}. This is not a style preference — the engine's
           centerInkGlyph() measures a glyph with `span.textContent`, which CONCATENATES
           descendants. A plain text-node overlay would make «पुल» measure as «पुलपुल», so the
           engine would compute a double-width ink box and shrink the real word to fit it.
           A pseudo-element is invisible to textContent, so the two systems stop fighting. */
        ov.setAttribute("data-w", word);
        ov.style.clipPath = "polygon(" + x0 + "px " + y0 + "px," + x1 + "px " + y0 + "px," +
                            x1 + "px " + y1 + "px," + x0 + "px " + y1 + "px)";
        el.appendChild(ov);
        made++;
      }
      off += cl.length;
    });
    if(made && opts && opts.pulse) el.classList.add("mh-pulse");
    if(made && typeof sfxSparkle === "function") sfxSparkle();
    return made > 0;
  }

  /* Retry until the element is actually laid out.

     matraHL needs a real getBoundingClientRect, and there are three ways it can be zero at the
     moment a module mounts: the slide is still mid slide-in, the webfont has not resolved so
     the glyph has no metrics yet, or the engine's own centerInkGlyph is mid-measure. A single
     rAF retry was NOT enough — verified on the built page, where a MEET_PAIR word came back
     with zero overlays and no error, which is exactly the silent-failure mode this lesson has
     been bitten by before. So: retry across several frames, then give up quietly.
     Also re-run after document.fonts.ready, because a font swap changes every measurement. */
  function matraHLSoon(el, matra, opts){
    let tries = 0;
    (function attempt(){
      if(!el || !el.isConnected) return;
      if(matraHL(el, matra, opts)) return;
      if(++tries > 10) return;
      (tries < 4 ? requestAnimationFrame : (f)=> setTimeout(f, 60))(attempt);
    })();
    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(()=>{
        if(el && el.isConnected && !el.querySelector(".mh-ov")) matraHL(el, matra, opts);
      });
    }
  }

  /* The locomotive, shared. Round 3 puts a train on the landing and on MATRA_INTRO too
     («the matras can be shown inside two train bogies … so the lesson visually continues as
     a «मात्राओं की रेल» journey»), so the drawing is lifted out of buildTrain rather than
     copied three times. */
  const LOCO_SVG =
      '<svg viewBox="0 0 190 130" width="190" height="130" aria-hidden="true">' +
      '<rect x="8" y="46" width="104" height="52" rx="12" fill="#E8453C" stroke="#7A1F1A" stroke-width="5"/>' +
      '<rect x="104" y="20" width="62" height="78" rx="12" fill="#E8453C" stroke="#7A1F1A" stroke-width="5"/>' +
      '<rect x="116" y="34" width="38" height="30" rx="7" fill="#BFE3FF" stroke="#7A1F1A" stroke-width="5"/>' +
      '<rect x="20" y="26" width="26" height="26" rx="5" fill="#F7C948" stroke="#7A1F1A" stroke-width="5"/>' +
      '<rect x="2" y="92" width="176" height="12" rx="6" fill="#7A1F1A"/>' +
      '<circle cx="36" cy="110" r="17" fill="#3B3B4F" stroke="#1C1C2A" stroke-width="5"/>' +
      '<circle cx="36" cy="110" r="6" fill="#F7C948"/>' +
      '<circle cx="100" cy="110" r="17" fill="#3B3B4F" stroke="#1C1C2A" stroke-width="5"/>' +
      '<circle cx="100" cy="110" r="6" fill="#F7C948"/>' +
      '<circle cx="150" cy="110" r="14" fill="#3B3B4F" stroke="#1C1C2A" stroke-width="5"/>' +
      '</svg>';


  /* ==========================================================================================
     TRAIN CHROME — ported verbatim from HI02H11_L02_S01, whose [r7] note describes the exact
     defect this bundle had: "The cover ran the painted train while pages 8-14 drew a DIFFERENT
     locomotive next to CSS-drawn boxes. Same lesson, two trains."

     It slices the painted artwork at its couplings — measured columns in BOTH the hi-res parked
     png and the 36-cell sprite sheet, which agree to within 0.3% of the train's width — so every
     coach is a positioned DIV with a background-position rather than a flat image. That is what
     lets a painted coach still glow, shake, lock and accept a drop.

     THIS LESSON HAS TWO MATRAS AND THE ARTWORK HAS THREE COACHES, and slicing is what makes that
     a non-problem: a two-coach train is parts 0..2 and part 3 is simply never drawn. The earlier
     cropped sheet (train2_spritesheet.webp) is therefore gone, along with the script that made
     it — the original artwork is used unmodified.
     ========================================================================================== */
  /* [r7] Sampled from the painted train itself (assets/Images/train.png), so a coach's label
     plate is bordered in its OWN coach's colour. The old palette was a guess and put a pink
     plate over the yellow coach. Darkened a little from the raw fill so the border reads as a
     border against a cream plate. */
  const TRAIN_COACH_COLORS = ["#E9B400", "#37C425", "#F0559A", "#4EA3F0"];

  /* A BARE MATRA IS AN ORPHAN COMBINING MARK. Rendered alone it is font-dependent: a dotted
     placeholder on some platforms, a floating stroke on others. U+25CC is the standard carrier
     and is already the engine's own convention in the matra callout, so every bare matra goes
     through here and reads identically everywhere — and it shows the child WHERE the matra sits
     relative to a letter, which is the whole point of the lesson. */
  const _BARE_MATRA = /^[ा-ौॢॣ]$/;
  function matraGlyph(m){ return _BARE_MATRA.test(String(m || "")) ? "◌" + m : m; }

  /* a coach label / body cell may be plain text, a picture, or an emoji */
  function _coachCell(spec){
    if(spec == null) return "";
    if(typeof spec === "string") return spec;
    if(spec.img || spec.emoji) return imgOrEmoji(spec.img, spec.emoji, "cl-img", "cl-emoji");
    if(spec.html) return spec.html;
    return spec.text || "";
  }

  /* ==========================================================================================
     THE TRAIN ITSELF — one artwork for the cover and for every interactive train screen.
     [r7] The cover ran the painted train (a locomotive and three coaches with cream panels,
     wheels turning through 36 frames) while pages 8-14 drew a DIFFERENT locomotive next to
     CSS-drawn boxes. Same lesson, two trains. These screens now use the cover's train and the
     cover's sounds, and its wheels turn as it pulls in.

     Two files, one drawing, measured off both so they can be laid out interchangeably:
       · assets/Images/train.png ........ 2171x724, the parked pose at full resolution. What is
                                          on screen once the train has stopped, so a word sits on
                                          a crisp panel rather than an upscaled sprite cell.
       · assets/UI/train_spritesheet.webp 6x6 cells of 634x182 — the same drawing animated. Runs
                                          ONLY while the train is travelling, where its lower
                                          resolution is invisible because the thing is moving.
     Both are cut at the couplings, found by scanning for the columns where the ink is thin
     enough to be coupling-and-wheels only: art px 17/650/1151/1642/2155, sheet px 2/188/336/
     481/632. The two agree to within 0.3% of the train's width, which is why one geometry can
     drive both layers — they are aligned on their INK boxes, not their canvases, because the
     png carries more transparent padding than a sheet cell does. */
  const TRAIN_ART = {
    /* the lossless WebP re-encode of assets/Images/train.png (1184KB -> 814KB, pixel-exact when
       composited). Lossy was measured and rejected: at q90 4.6% of pixels moved, peak delta 112 —
       the same damage flat vector art with hard edges took when the cover's GIF was re-encoded. */
    src: "assets/UI/train_still.webp", W: 2171, H: 724,
    ink: { x: 17, y: 48, w: 2138, h: 592 },
    cut: [17, 650, 1151, 1642, 2155],
    /* the cream panel a word sits on, measured per coach (centre + size, art px) */
    panel: [null, { cx: 894, cy: 341, w: 409, h: 417 },
                  { cx: 1392, cy: 340, w: 396, h: 418 },
                  { cx: 1892, cy: 339, w: 418, h: 417 }]
  };
  const TRAIN_SPR = {
    src: "assets/UI/train_spritesheet.webp", cw: 634, ch: 182, cols: 6, rows: 6,
    ink: { x: 2, y: 3, w: 630, h: 175 },
    cut: [2, 188, 336, 481, 632],
    /* REST and SPIN are the cover's, and must stay the cover's: SPIN is the cells advanced over
       the whole travel and is congruent to REST mod 36 (71 % 36 = 35), so the last frame lands
       exactly on the parked pose instead of jumping to it. */
    spin: 71, rest: 35
  };
  const TRAIN_TRAVEL_MS = 3400;        /* the cover's travel, shared so the two feel like one train */

  /* The cover's easing, solved for y given x (Newton, then clamped). The frame advance rides
     the SAME curve as the movement, so the chug is a function of distance covered rather than of
     the clock and cannot drift out of sympathy with the loco. */
  function _trainEase(){
    const p1x = .40, p1y = .20, p2x = .45, p2y = 1;
    const cx = 3*p1x, bx = 3*(p2x-p1x)-cx, ax = 1-cx-bx;
    const cy = 3*p1y, by = 3*(p2y-p1y)-cy, ay = 1-cy-by;
    const fx = t=> ((ax*t + bx)*t + cx)*t, fy = t=> ((ay*t + by)*t + cy)*t;
    const dfx = t=> (3*ax*t + 2*bx)*t + cx;
    return (x)=>{ let t = x;
      for(let i = 0; i < 8; i++){ const e = fx(t) - x;
        if(Math.abs(e) < 1e-5) break;
        const d = dfx(t); if(Math.abs(d) < 1e-6) break; t -= e/d; }
      return fy(Math.min(1, Math.max(0, t))); };
  }

  const TrainChrome = {
    /* cfg: { coaches, coach_label[], coach_body[], drop_zone, multi, entry, on_enter } */
    mount(host, cfg){
      cfg = cfg || {};
      const n = cfg.coaches || (cfg.coach_label || []).length || 3;
      const A = TRAIN_ART, S = TRAIN_SPR;
      /* part i of the drawing: 0 is the locomotive, 1..3 the coaches. More than three coaches
         reuses the three that exist, which is what the artwork has. */
      const artPart = (i)=> ({ x0: A.cut[i], w: A.cut[i+1] - A.cut[i] });
      const sprPart = (i)=> ({ x0: S.cut[i], w: S.cut[i+1] - S.cut[i] });
      const idx = (i)=> i === 0 ? 0 : ((i - 1) % 3) + 1;

      let artW = artPart(0).w;
      for(let i = 0; i < n; i++) artW += artPart(idx(i + 1)).w;
      /* Fit to BOTH axes. The artwork is 3.6:1, so sizing on width alone made a 1160px train
         321px tall — which pushed TRAIN_SORT's coach labels off the top of the stage and left the
         tray sitting on the आगे button. A screen that also carries labels and a tray passes a
         smaller maxH. 0.56 is the cap that stops the png being upscaled past its own pixels.
         [r9] The width budget is 86% of the room available, not a fixed number: the track has to be
         visibly LONGER than the train, and a train filling its container left no line to arrive
         along. Measured before: train and track were both exactly the host width. */
      const avail = host.clientWidth || 1160;
      const k = Math.min(0.56, (cfg.maxW || avail * 0.86) / artW, (cfg.maxH || 300) / A.ink.h);
      const partH = A.ink.h * k;

      const shell = document.createElement("div"); shell.className = "train-shell";
      const rail  = document.createElement("div"); rail.className  = "train-rail";
      rail.style.setProperty("--tc-h", partH + "px");
      rail.style.setProperty("--tc-rail-h", Math.max(14, Math.round(partH * 0.07)) + "px");
      rail.style.setProperty("--lt-travel", TRAIN_TRAVEL_MS + "ms");

      /* The track is laid on the SHELL, not on the rail. The rail is the thing that translates
         in from the right, so a track parented to it slid in with the train — rails that arrive
         with the locomotive. The shell never moves, so the line is already there and the train
         runs along it. */
      const track = document.createElement("div"); track.className = "train-track";

      const sprEls = [];
      /* One part: the parked artwork underneath, the animated sheet on top. The sheet layer is
         what moves; it is faded out and dropped the moment the train stops, which is also the
         moment the resolution difference would first be visible. */
      const paint = (el, i)=>{
        const a = artPart(idx(i)), s = sprPart(idx(i));
        el.style.width = (a.w * k) + "px";
        el.style.height = partH + "px";
        const art = document.createElement("div"); art.className = "tc-art";
        art.style.backgroundImage = 'url("' + A.src + '")';
        art.style.backgroundSize = (A.W * k) + "px " + (A.H * k) + "px";
        art.style.backgroundPosition = (-a.x0 * k) + "px " + (-A.ink.y * k) + "px";
        el.appendChild(art);

        const sk = (A.ink.w * k) / S.ink.w;            /* sheet scale that matches the png's ink box */
        const spr = document.createElement("div"); spr.className = "tc-spr";
        spr.style.backgroundImage = 'url("' + S.src + '")';
        spr.style.backgroundSize = (S.cw * S.cols * sk) + "px " + (S.ch * S.rows * sk) + "px";
        spr.dataset.x0 = String(s.x0); spr.dataset.sk = String(sk);
        el.appendChild(spr);
        sprEls.push(spr);
        return { a, s };
      };
      const setCell = (cellIn)=>{
        const CELLS = S.cols * S.rows;
        const cell = ((cellIn % CELLS) + CELLS) % CELLS;
        const c = cell % S.cols, r = (cell / S.cols) | 0;
        sprEls.forEach(spr=>{
          const sk = parseFloat(spr.dataset.sk), x0 = parseFloat(spr.dataset.x0);
          spr.style.backgroundPosition =
            (-(c * S.cw + x0) * sk) + "px " + (-(r * S.ch + S.ink.y) * sk) + "px";
        });
      };

      const loco = document.createElement("div"); loco.className = "train-loco tc-part";
      paint(loco, 0);
      /* appendChild, never `innerHTML +=` — that serialises and RE-PARSES the whole subtree, which
         silently replaces the .tc-spr node paint() just handed to setCell. Measured: the loco's
         wheels stopped turning while the coaches' kept going, because its sprite element was a
         detached orphan. */
      /* the funnel mouth, measured off this artwork (see the CSS note): 28.4% across the
         locomotive part, 11.8% down the ink band. The puff size and the drift scale with the
         train so a small train does not get cover-sized smoke. */
      const steam = document.createElement("div"); steam.className = "train-steam";
      steam.style.left = (artPart(0).w * k * 0.284) + "px";
      steam.style.top  = (partH * 0.118) + "px";
      /* the cover sizes its puff at 4.6% of the rendered train width and its plume at about
         0.57x the train's height; kept proportional here so a short train gets short smoke. */
      const IW = A.ink.w * k;
      steam.style.setProperty("--tc-puff",       Math.round(IW * 0.040) + "px");
      steam.style.setProperty("--tc-rise",       Math.round(-partH * 0.62) + "px");
      steam.style.setProperty("--tc-drift",      Math.round(IW * 0.012) + "px");
      steam.style.setProperty("--tc-drift-move", Math.round(IW * 0.046) + "px");
      const PUFFS = 7;
      for(let i = 0; i < PUFFS; i++){
        const p = document.createElement("span");
        p.style.animationDelay = (i * (1610 / PUFFS) - 1610) + "ms";
        steam.appendChild(p);
      }
      loco.appendChild(steam);
      rail.appendChild(loco);

      const coachEls = [], faceEls = [], labelEls = [];
      for(let i = 0; i < n; i++){
        const pi = idx(i + 1), a = artPart(pi), pan = A.panel[pi];
        const c = document.createElement("div"); c.className = "train-coach";
        c.style.setProperty("--coach-c", TRAIN_COACH_COLORS[i % TRAIN_COACH_COLORS.length]);

        const lab = document.createElement("div"); lab.className = "coach-label";
        const labSpec = (cfg.coach_label || [])[i];
        if(labSpec == null) lab.style.display = "none";   /* not `visibility` — that still reserves 50px */
        lab.innerHTML = _coachCell(labSpec);

        const body = document.createElement("div"); body.className = "coach-body tc-part";
        paint(body, pi);
        if(cfg.drop_zone) body.classList.add("dropzone", "dd-zone");

        /* the word/card sits ON the coach's painted cream panel, placed from the measurement
           above rather than from padding — the panel is not centred in the coach slice */
        const face = document.createElement("div"); face.className = "coach-face" + (cfg.multi ? " multi" : "");
        face.style.left   = ((pan.cx - a.x0) * k) + "px";
        face.style.top    = ((pan.cy - A.ink.y) * k) + "px";
        face.style.width  = (pan.w * k * 0.94) + "px";
        face.style.height = (pan.h * k * 0.90) + "px";
        face.innerHTML = _coachCell((cfg.coach_body || [])[i]);
        body.appendChild(face);

        c.appendChild(lab); c.appendChild(body);
        c.dataset.coach = String(i);
        rail.appendChild(c);
        coachEls.push(c); faceEls.push(body.querySelector(".coach-face")); labelEls.push(lab);
      }
      shell.appendChild(track);        /* behind the rail in DOM order, so the train paints over it */
      shell.appendChild(rail);
      host.appendChild(shell);

      /* If the painted train cannot be fetched, fall back to the structured locomotive exactly as
         the old <img> onerror did — a background-image has no error event, so probe separately. */
      (function(){ const probe = new Image();
        probe.onerror = ()=>{ shell.classList.add("tc-noart"); };
        probe.src = TRAIN_ART.src; })();

      setCell(S.rest);

      /* "Train comes through animation from right to left. Train stops at the centre of the
         screen." (rows #8, #95, #107, #116, #124, #144, #175)
         The cover's entrance, beat for beat: whistle as it appears, the chug bed under the
         travel, the wheels turning on the travel's own easing curve, and the arrival sound as it
         settles. Rows X4/#95: "Soft train arrival sound." */
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let _raf = 0;
      /* "Train comes through animation ... Train stops at the centre. On screen: no instruction
         text, only VO should play." The VO waits for the train: mountSlide's auto chain is held
         here and released once the arrival sound has had a beat to clear. */
      let _promptGo = null, _parked = false;
      const _afterPrompt = ()=>{ if(typeof cfg.on_prompt_done === "function") cfg.on_prompt_done(); };
      const _release = (go)=> go(_afterPrompt);
      state.promptGate = (go)=>{ if(_parked) _release(go); else _promptGo = go; };
      const settle = ()=>{
        rail.classList.remove("tr-entering");
        shell.classList.add("tc-parked");               /* drops the sprite layer, reveals the png */
        _parked = true;
        if(_promptGo){ const g = _promptGo; _promptGo = null; setTimeout(()=> _release(g), 320); }
        if(typeof cfg.on_enter === "function") cfg.on_enter();
      };
      if(cfg.entry !== false && !reduce){
        rail.classList.add("tr-entering");
        sfxWhistle(); sfxTrainMove();
        const ease = _trainEase(), t0 = performance.now();
        const tick = ()=>{
          if(!rail.isConnected) return;                 /* navigated away mid-run */
          const p = Math.min(1, (performance.now() - t0) / TRAIN_TRAVEL_MS);
          setCell(Math.floor(ease(p) * S.spin));
          if(p < 1) _raf = requestAnimationFrame(tick);
          else setCell(S.rest);                         /* exact landing, no rounding drift */
        };
        _raf = requestAnimationFrame(tick);
        setTimeout(()=>{ sfxTrainArrive(); settle(); }, TRAIN_TRAVEL_MS);
      } else {
        setTimeout(settle, 0);
      }

      return {
        shell, rail, coachEls, faceEls, labelEls,
        body: (i)=> coachEls[i].querySelector(".coach-body"),
        /* "Coach labels आ (ा), इ (ि), ई (ी) appear one by one." (row #175) */
        popLabels(gapMs){
          labelEls.forEach((l, i)=>{
            l.classList.remove("cl-pop"); void l.offsetWidth;
            /* sfxSparkle removed: train chrome sounds like a train and nothing else. The pop is
               still visual; the answer-feedback effects in the slide modules are untouched. */
            setTimeout(()=>{ l.classList.add("cl-pop"); }, i * (gapMs || 260));
          });
        },
        /* "all three coaches glow · train gives a small whistle/steam animation"
           (rows #136, #143, #160, #174) */
        complete(){ shell.classList.add("complete"); sfxWhistle(); }
      };
    },

    /* Structured SVG locomotive — kept as the last-resort drawing if the painted train is
       missing. Deliberately simple and flat-vector, matching the mockup's silhouette. */
    locoSVG(){
      const w = document.createElement("div");
      w.innerHTML =
        '<svg viewBox="0 0 206 150" width="206" height="150" role="img" aria-label="रेलगाड़ी">' +
        '<rect x="4" y="112" width="198" height="10" rx="3" fill="#5A6672"/>' +
        '<rect x="96" y="34" width="86" height="78" rx="12" fill="#E4453C"/>' +
        '<rect x="112" y="48" width="48" height="36" rx="8" fill="#BFE4FF" stroke="#FFFFFF" stroke-width="4"/>' +
        '<rect x="88" y="24" width="102" height="16" rx="8" fill="#2F7BE0"/>' +
        '<rect x="30" y="62" width="74" height="50" rx="12" fill="#E4453C"/>' +
        '<rect x="24" y="74" width="12" height="26" rx="4" fill="#F2A33C"/>' +
        '<path d="M46 62 L46 34 L70 34 L70 62 Z" fill="#2F3A44"/>' +
        '<path d="M40 34 L76 34 L70 22 L46 22 Z" fill="#F2A33C"/>' +
        '<circle cx="62" cy="122" r="16" fill="#2F3A44"/><circle cx="62" cy="122" r="6" fill="#F2A33C"/>' +
        '<circle cx="126" cy="122" r="20" fill="#2F3A44"/><circle cx="126" cy="122" r="8" fill="#F2A33C"/>' +
        '<circle cx="172" cy="122" r="20" fill="#2F3A44"/><circle cx="172" cy="122" r="8" fill="#F2A33C"/>' +
        '</svg>';
      const svg = w.firstChild; svg.classList.add("train-loco-svg");
      return svg;
    }
  };


  /* ---------------------------------------------------------------- the train shell */
  /* ADAPTER, not a second train. Every module in this bundle was written against buildTrain()'s
     shape — `coaches[i].el / .body / .label` plus nudge/shake/correct/lock/finish — so rather
     than rewrite seven modules, buildTrain now mounts TrainChrome and presents that same shape
     over it. The payoff is that TRAIN_TAP, TRAIN_SORT, WORD_BUILD and MATRA_INTRO all get the
     painted train, its 36-frame roll-in and its real SFX without any of them knowing.

     TWO COMPATIBILITY DETAILS, both deliberate:
       · `.coach-body` also carries this bundle's old `.tr-body` class and its `data-idx`, because
         makeDraggable's drop handlers hit-test `zone.closest(".tr-body")`. One extra class keeps
         every drop path working unchanged.
       · `coaches[i].body` is the `.coach-face` — the painted cream panel — NOT the coach body.
         That is where a word, a blank or a snapped card belongs; the body is the coach's
         painted slice and is the drop target. */
  function buildTrain(host, opts){
    const n = opts.coaches;
    const tc = TrainChrome.mount(host, {
      coaches: n,
      coach_label: (opts.labels || []).map(h => (h == null || h === "") ? null : { html: h }),
      coach_body:  (opts.bodies || []).map(h => ({ html: h || "" })),
      drop_zone:   !!opts.dropZone,
      multi:       !!opts.multi,
      maxH:        opts.maxH || 250,
      on_enter:    opts.on_enter
    });
    const coaches = tc.coachEls.map((el, i) => {
      const body = tc.body(i);
      body.classList.add("tr-body");          /* makeDraggable hit-tests this */
      body.dataset.idx = String(i);
      return { el, body: tc.faceEls[i], zone: body, label: tc.labelEls[i] };
    });
    return {
      wrap: tc.shell, rail: tc.rail, coaches, chrome: tc,
      /* [28f] THE GUIDING HAND IS PHASE-GATED and handOnAnswer() is the one place that can
         enforce it: tutorial and guided get the hand, practice gets the coach glow only. */
      nudge(i, slide){ const c = coaches[i]; if(!c) return;
        c.el.classList.add("is-nudge");
        if(typeof handOnAnswer === "function") handOnAnswer(c.el, slide);
      },
      shake(i){ const c = coaches[i]; if(!c) return;
        c.el.classList.remove("is-shake"); void c.el.offsetWidth; c.el.classList.add("is-shake");
        setTimeout(()=> c.el.classList.remove("is-shake"), 520);
      },
      correct(i){ const c = coaches[i]; if(!c) return;
        c.el.classList.add("is-correct");
        if(typeof confettiCannon === "function") confettiCannon();
      },
      lock(i){ const c = coaches[i]; if(c) c.el.classList.add("is-locked"); },
      popLabels(gap){ tc.popLabels(gap); },
      /* SME, on every sort screen: "all coaches glow, train gives a small whistle/steam
         animation, Next button becomes active". */
      finish(){ coaches.forEach(c => c.el.classList.add("is-correct")); tc.complete(); }
    };
  }

  /* Shared 3-attempt ladder. Returns a `wrong()` you call on each miss. */
  function makeLadder(slide, train, correctIdx){
    let tries = 0;
    return function wrong(coachIdx){
      tries++;
      state.attempts = tries;
      if(typeof sfxWrongSoft === "function") sfxWrongSoft();
      if(typeof setSwMood === "function") setSwMood("tryagain");
      if(coachIdx != null) train.shake(coachIdx);
      SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: tries });
      if(tries === 1){
        /* SME: "No hand nudge. Only hint VO should come." */
        say(A(slide, "hint1") || A(slide, "try_again"), ()=>{});
      } else {
        /* SME: "Hint VO should play. Show hand nudge on the correct answer." */
        state.scaffoldLevel = 2; state.hintUsed = true;
        SwiftPAL.emit("hint_shown", { slide_id: slide.id, level: 2 });
        say(A(slide, "hint2") || A(slide, "hint") || A(slide, "try_again"),
            ()=> { if(correctIdx != null) train.nudge(correctIdx, slide); });
      }
      return tries;
    };
  }

  /* Finish a test slide. `silent` = solved on the final attempt -> celebrate visually only,
     which is the SME's "Correct Answer on 3rd Attempt … No VO." */
  function finishSlide(slide, train, silent, signal){
    state.locked = true;
    if(typeof stopNudge === "function") stopNudge();
    if(typeof sfxCorrect === "function") sfxCorrect();
    if(typeof setSwMood === "function") setSwMood("celebrate");
    train.finish();
    SwiftPAL.emit(signal || "train_first_try", {
      slide_id: slide.id, phase: slide.phase, value: true,
      first_try: state.attempts === 0, attempts: state.attempts + 1,
      latency_ms: Date.now() - state.slideStart
    });
    const unlock = ()=>{ setNavActive(true); $("navBtn").onclick = ()=> completeSlide(state.attempts === 0); };
    if(silent) setTimeout(unlock, 900); else say(A(slide, "correct"), unlock);
  }

  /* ================================================================ 1 · TRAIN_TAP */
  /* Tap the coach whose word carries the target matra.
     data: { coaches:[{word, correct?}], target } */
  SlideModules.TRAIN_TAP = {
    mount(host, slide){
      const d = slide.data;
      const correctIdx = d.coaches.findIndex(c => c.correct);
      /* SME, on all three tap screens: "Train comes through animation from right to left. Train
         stops at the centre of the screen. **After the train stops**, the three coaches पुल, दूध,
         सूरज appear clearly." So the words are held back until the train has parked — they are
         not part of the arriving picture, they are what the child is then asked to read. */
      const train = buildTrain(host, {
        coaches: d.coaches.length,
        labels: d.coaches.map(()=> ""),
        bodies: d.coaches.map(c => '<span class="tr-word ink-glyph tt-hold">' + c.word + "</span>"),
        dropZone: false,
        on_enter: ()=> [...host.querySelectorAll(".tt-hold")].forEach((w, i)=>
          setTimeout(()=> w.classList.add("tt-in"), i * 180))
      });
      state.ownsAudio = true;
      state.replayAudio = ()=> say(A(slide, "prompt"), ()=>{});
      setNavActive(false);
      const wrong = makeLadder(slide, train, correctIdx);

      train.coaches.forEach((c, i) => {
        c.el.classList.add("is-tappable");
        c.el.onclick = ()=>{
          if(state.locked || isPlaying) return;
          if(typeof sfxTap === "function") sfxTap();
          if(i === correctIdx){
            const silent = state.attempts >= maxTries() - 1;
            train.correct(i);
            /* Mark the matra in the word they just chose. The SME's correct-answer VO is
               «शाबाश! पुल शब्द में छोटी उ की मात्रा है» — this is that sentence made visible,
               and on a silent 3rd-attempt win it is the ONLY feedback the child gets. */
            const w = train.coaches[i].body.querySelector(".tr-word");
            if(w && d.matra) matraHLSoon(w, d.matra, { glow:true, pulse:true });
            finishSlide(slide, train, silent, "train_tap_first_try");
          } else {
            wrong(i);
          }
        };
      });
      /* instruction is VOICE only — the SME asks for no on-screen text on every test screen */
      say(A(slide, "prompt"), ()=>{});
    }
  };

  /* ================================================================ 2 · TRAIN_SORT */
  /* Drag cards into coaches. Three shapes, all one module:
       kind "word"    — coaches labelled by matra, cards are words (+picture)
       kind "matra"   — coaches labelled by WORD, cards are matras      (the reverse round)
       kind "picture" — coaches labelled by matra, cards are PICTURES ONLY, word still spoken
     data: { kind, bins:[{label, key}], cards:[{bin, word, img, emoji, audio}] } */
  SlideModules.TRAIN_SORT = {
    mount(host, slide){
      const d = slide.data;
      /* SME, word and picture rounds: "More than one word can be placed inside each coach."
         `multi` is what lets the painted coach's cream panel hold two cards side by side instead
         of stacking the second on top of the first. The matra round is `single` — "Only one matra
         card can be placed inside each coach" — and sets `filled` on the body instead. */
      const train = buildTrain(host, {
        coaches: d.bins.length,
        labels: d.bins.map(b => b.label),
        bodies: d.bins.map(()=> ""),
        dropZone: true,
        multi: d.kind !== "matra"
      });
      /* SME round 3, on the picture-sort screen: "Coach labels उ and ऊ appear one by one."
         Settled by default (engine fact 1) — `tr-lblseq` only drives the staggered fade-in, so a
         frozen capture still photographs BOTH labels rather than an empty coach roof. */
      requestAnimationFrame(()=> train.coaches.forEach((c, i) => {
        c.label.style.setProperty("--tr-lbl-delay", (i * 340) + "ms");
        c.label.classList.add("tr-lblseq");
      }));

      const tray = document.createElement("div");
      tray.className = "tr-tray";
      const cards = d.cards.slice().sort(()=> Math.random() - 0.5);
      cards.forEach(c => {
        const t = document.createElement("div");
        t.className = "tr-card k-" + d.kind;
        t.dataset.bin = c.bin;
        if(c.audio) t.dataset.audio = c.audio;
        /* ROUND 3: the praise line is PER CARD now, not one line for the whole screen. The SME
           writes it out card by card — «शाबाश! 'सुई' शब्द में उ की मात्रा है।» — and asks for NO
           completion VO, so the last card's own line is the last thing the child hears. */
        if(c.correct_audio) t.dataset.okaudio = c.correct_audio;
        if(d.kind === "matra"){
          t.innerHTML = '<span class="tr-matra ink-glyph">' + c.word + "</span>";
        } else if(d.kind === "picture"){
          /* SME: pictures only, the word must NEVER be shown — but it must still be SPOKEN,
             which is what keeps this a listening task rather than picture matching. */
          t.innerHTML = imgOrEmoji(c.img, c.emoji, "tr-pic", "tr-emoji");
        } else {
          t.innerHTML = imgOrEmoji(c.img, c.emoji, "tr-pic", "tr-emoji") +
                        '<span class="tr-cardlbl">' + c.word + "</span>";
        }
        tray.appendChild(t);
      });
      host.appendChild(tray);

      state.ownsAudio = true;
      state.replayAudio = ()=> say(A(slide, "prompt"), ()=>{});
      setNavActive(false);

      let placed = 0;
      const need = cards.length;
      const perCard = new Map();
      const binIdx = k => d.bins.findIndex(b => b.key === k);

      [...tray.children].forEach(tile => {
        tile.onclick = ()=>{ if(tile.dataset.audio && !isPlaying)
          say(clip(tile.dataset.audio), ()=>{}); };
        /* SME lists TWO sounds here, not one: "Light tap / pick-up sound when a card is selected"
           and "Soft drop sound when the card is placed". They were both the same tap. */
        makeDraggable(tile, (zone)=>{
          const body = zone.closest(".tr-body"); if(!body) return;
          const ci = parseInt(body.dataset.idx, 10);
          if(d.bins[ci].key === tile.dataset.bin){
            /* SME: "Correct Answer on 3rd Attempt … No VO." Counted PER CARD, because on a sort
               screen each card carries its own attempt ladder. */
            const quiet = (perCard.get(tile) || 0) >= maxTries() - 1;
            tile.classList.add("snapped");
            /* the card belongs on the coach's painted CREAM PANEL, not loose in the coach body.
               `body` is the drop target (it is what carries .dd-zone); `.coach-face` is the panel
               the artwork actually draws, and it is what centres and clips the cards. Appending
               to the body instead put them at its top-left and let them spill out of the coach. */
            (body.querySelector(".coach-face") || body).appendChild(tile);
            /* SME, matra round: "Only one matra card can be placed inside each coach."
               `filled` is the flag makeDraggable already hit-tests, so a second drop on a full
               coach springs back instead of counting as a wrong attempt. */
            if(d.single) body.classList.add("filled");
            /* On the WORD round the card still shows its word once it is in the coach, so mark
               the matra the child just sorted on. Not on the picture round — the SME is
               explicit there that "the word should not be displayed at any point". */
            if(d.kind === "word"){
              const lbl = tile.querySelector(".tr-cardlbl");
              if(lbl) matraHLSoon(lbl, tile.dataset.bin, { glow:true });
            }
            placed++;
            train.correct(ci);
            sfxPopSoft();                      /* the DROP, distinct from the pick-up tap */
            SwiftPAL.emit("matra_sort_item", { slide_id: slide.id, bin: tile.dataset.bin });
            const okvo = quiet ? null : (tile.dataset.okaudio || tile.dataset.audio);
            if(placed >= need){
              /* SME: "No extra completion VO required." finishSlide's silent branch skips
                 slide.audio.correct, so the per-card line above is the final word. */
              sayOpt(clip(okvo), ()=> finishSlide(slide, train, true, "matra_sort_first_try"));
            } else {
              sayOpt(clip(okvo), ()=>{});
            }
          } else {
            const n = (perCard.get(tile) || 0) + 1;
            perCard.set(tile, n);
            state.attempts++;
            if(typeof sfxWrongSoft === "function") sfxWrongSoft();
            if(typeof setSwMood === "function") setSwMood("tryagain");
            train.shake(ci);
            tile.style.transform = "";
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, attempts: state.attempts });
            if(n === 1){
              say(A(slide, "hint1") || A(slide, "try_again"), ()=>{});
            } else {
              state.hintUsed = true;
              say(A(slide, "hint2") || A(slide, "hint") || A(slide, "try_again"),
                  ()=> train.nudge(binIdx(tile.dataset.bin), slide));
            }
          }
        }, { onPick: ()=>{ if(typeof sfxTap === "function") sfxTap(); } });
      });

      /* prompt first, then each card speaks itself, then the tray unlocks — the same
         listen-before-you-act contract sortSeqReveal gives the stock sort. */
      state.revealing = true;
      [...tray.children].forEach(t => t.classList.add("tr-seq-hidden"));
      say(A(slide, "prompt"), ()=>{
        const tiles = [...tray.children];
        let i = 0;
        (function step(){
          if(i >= tiles.length){ state.revealing = false; return; }
          const t = tiles[i++]; t.classList.remove("tr-seq-hidden");
          say(clip(t.dataset.audio),
              ()=> setTimeout(step, 160));
        })();
      });
      setTimeout(()=>{ state.revealing = false;
        [...tray.children].forEach(t => t.classList.remove("tr-seq-hidden")); }, 16000);
    }
  };

  /* ================================================================ 3 · MATRA_FILL */
  /* A word with a BLANK where its matra belongs; drag the right matra in.
     data: { slots:[{word, pre, post, matra, img, emoji, audio}], options:[matra,…] }
     `pre`/`post` are authored as the DRAWN halves of the word, so a reordering matra (ि) can
     never be inserted at the wrong visual position. For उ/ऊ they are simply the two halves. */
  SlideModules.MATRA_FILL = {
    mount(host, slide){
      const d = slide.data;
      const train = buildTrain(host, {
        coaches: d.slots.length,
        labels: d.slots.map(s => imgOrEmoji(s.img, s.emoji, "tr-slotpic", "tr-emoji")),
        bodies: d.slots.map((s, i) =>
          '<span class="tr-fill" data-i="' + i + '">' +
            '<span class="ink-glyph">' + s.pre + "</span>" +
            '<span class="tr-blank dd-zone" data-idx="' + i + '"></span>' +
            '<span class="ink-glyph">' + s.post + "</span>" +
          "</span>"),
        dropZone: false
      });
      const tray = document.createElement("div");
      tray.className = "tr-tray";
      d.options.forEach(m => {
        const t = document.createElement("div");
        t.className = "tr-card k-matra";
        t.dataset.matra = m;
        t.innerHTML = '<span class="tr-matra ink-glyph">◌' + m + "</span>";
        tray.appendChild(t);
      });
      host.appendChild(tray);

      state.ownsAudio = true;
      state.replayAudio = ()=> say(A(slide, "prompt"), ()=>{});
      setNavActive(false);
      let filled = 0;
      const perCard = new Map();

      [...tray.children].forEach(tile => {
        makeDraggable(tile, (zone)=>{
          const blank = zone.closest(".tr-blank"); if(!blank) return;
          if(blank.classList.contains("filled")) return;
          const i = parseInt(blank.dataset.idx, 10);
          const slot = d.slots[i];
          if(tile.dataset.matra === slot.matra){
            blank.classList.add("filled");
            blank.innerHTML = '<span class="ink-glyph tr-inmatra">' + slot.matra + "</span>";
            /* the completed word replaces the split form, so the child reads it whole */
            const holder = blank.closest(".tr-fill");
            setTimeout(()=>{
              holder.innerHTML = '<span class="ink-glyph tr-doneword">' + slot.word + "</span>";
              /* the completed word keeps the matra marked, so the child sees WHICH mark they
                 just supplied rather than only that the word is now whole */
              matraHLSoon(holder.querySelector(".tr-doneword"), slot.matra, { glow:true });
            }, 450);
            tile.style.transform = "";
            filled++;
            train.correct(i);
            if(typeof sfxCorrect === "function") sfxCorrect();
            SwiftPAL.emit("matra_fill_item", { slide_id: slide.id, word: slot.word });
            if(filled >= d.slots.length){
              finishSlide(slide, train, false, "matra_fill_first_try");
            } else {
              say(clip(slot.audio), ()=>{});
            }
          } else {
            const n = (perCard.get(tile) || 0) + 1; perCard.set(tile, n);
            state.attempts++;
            if(typeof sfxWrongSoft === "function") sfxWrongSoft();
            train.shake(i);
            tile.style.transform = "";
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, attempts: state.attempts });
            if(n === 1) say(A(slide, "hint1") || A(slide, "try_again"), ()=>{});
            else { state.hintUsed = true;
              say(A(slide, "hint2") || A(slide, "hint"), ()=> train.nudge(i, slide)); }
          }
        });
      });
      say(A(slide, "prompt"), ()=>{});
    }
  };

  /* ================================================================ 4 · MATRA_BUILD */
  /* The transformation teach: base word -> consonant highlighted -> matra travels in ->
     syllable -> full word. Autonomous, zero taps, आगे locked until the chain ends.
     Every step is gated on the previous CLIP ENDING, never a timer: [32b nocut] records fixed
     1400ms advances truncating 27-35% of every reveal line.
     data: { base_word, consonant, matra, syllable, result_word, result_img, result_emoji,
             travel: "down"|"left"|"right" } */
  SlideModules.MATRA_BUILD = {
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div");
      wrap.className = "mb-stage";
      /* Laid out to the SME's own mockup (_SME_MOCKUPS/slide05_image5.png): each of the three
         panels is word → picture → caption, and the middle panel carries the equation with its
         own one-line explanation under it. The captions and the base picture were both missing
         from the first build. The base word has no picture of its own by design (पल / फल are
         the forms BEFORE the matra, not vocabulary), so that slot simply stays empty. */
      const cap = t => t ? '<span class="mb-cap">' + t + "</span>" : "";
      wrap.innerHTML =
        '<div class="mb-panel mb-p1">' +
          '<span class="ink-box"><span class="mb-word ink-glyph">' + d.base_word + "</span></span>" +
          (d.base_img || d.base_emoji
            ? '<span class="mb-pic">' + imgOrEmoji(d.base_img, d.base_emoji, "mb-img", "mb-emoji") + "</span>"
            : "") +
          cap(d.cap_base) +
        "</div>" +
        '<div class="mb-arrow">→</div>' +
        '<div class="mb-panel mb-p2">' +
          '<span class="mb-eqrow">' +
            '<span class="mb-cons ink-glyph">' + d.consonant + "</span>" +
            '<span class="mb-plus">+</span>' +
            '<span class="mb-matra ink-glyph mb-travel-' + (d.travel || "down") + '">◌' + d.matra + "</span>" +
            '<span class="mb-eq">=</span>' +
            '<span class="mb-syl ink-glyph">' + d.syllable + "</span>" +
          "</span>" +
          cap(d.cap_mid) +
        "</div>" +
        '<div class="mb-arrow">→</div>' +
        '<div class="mb-panel mb-p3">' +
          '<span class="ink-box"><span class="mb-word mb-result ink-glyph">' + d.result_word + "</span></span>" +
          '<span class="mb-pic">' + imgOrEmoji(d.result_img, d.result_emoji, "mb-img", "mb-emoji") + "</span>" +
          cap(d.cap_result) +
        "</div>";
      host.appendChild(wrap);

      const p1 = wrap.querySelector(".mb-p1"), p2 = wrap.querySelector(".mb-p2"), p3 = wrap.querySelector(".mb-p3");
      const cons = wrap.querySelector(".mb-cons"), mat = wrap.querySelector(".mb-matra");
      const syl = wrap.querySelector(".mb-syl"), res = wrap.querySelector(".mb-result");
      const arrows = [...wrap.querySelectorAll(".mb-arrow")];
      [p2, p3, ...arrows].forEach(e => e.classList.add("mb-seq-hidden"));
      [cons, mat, syl].forEach(e => e.classList.add("mb-seq-hidden"));

      /* PAINT THE MATRA HIGHLIGHT AT MOUNT AS WELL AS IN THE CHAIN.
         Live, panels 2 and 3 are `mb-seq-hidden` (opacity 0) until the audio reveals them, so
         the child never sees the red mark early — the teaching beat is unchanged. But the
         review capture STRIPS seq-hidden and freezes before any audio runs, so a highlight
         applied only in a play() callback photographs missing: the SME's deck showed «पुल»
         with no red ु even though the running game colours it. Painting here fixes the
         capture; matraHL is idempotent, so the chain re-applying it later is a no-op. */
      matraHLSoon(syl, d.matra, { glow:true });
      matraHLSoon(res, d.matra, { glow:true });

      state.ownsAudio = true; state.demoRunning = true; setNavActive(false);
      if(typeof setSwMood === "function") setSwMood("teach");
      state.replayAudio = null;

      const done = ()=>{
        state.demoRunning = false;
        state.replayAudio = ()=> sayAll([A(slide,"base"), A(slide,"onset"), A(slide,"result")], ()=>{});
        /* `explain` is gone in round 3 — its content is now inside `result` («अब 'ल' जुड़ने पर
           'पुल' बनता है।»), which is the line the SME wrote. */
        $("navBtn").onclick = ()=> completeSlide(true);
        setNavActive(true);
      };

      sayAll([A(slide, "prompt")], ()=>{
        p1.classList.add("mb-in");
        say(A(slide, "base"), ()=>{                       // "यह शब्द है, पल।"
          cons.classList.remove("mb-seq-hidden"); cons.classList.add("mb-in", "mb-hot");
          arrows[0].classList.remove("mb-seq-hidden"); p2.classList.remove("mb-seq-hidden");
          setTimeout(()=>{
            mat.classList.remove("mb-seq-hidden"); mat.classList.add("mb-in", "mb-fly");
            if(typeof sfxTap === "function") sfxTap();
            say(A(slide, "matra_name"), ()=>{             // "छोटी उ की मात्रा"
              syl.classList.remove("mb-seq-hidden"); syl.classList.add("mb-in", "mb-pop");
              sfxSparkle();          /* SME: "a light chime when प changes to पु" */
              /* the mockup shows «जा» with its ा already red — the syllable is the first place
                 the child sees the mark attached to a letter, so mark it here too */
              matraHLSoon(syl, d.matra, { glow:true });
              say(A(slide, "onset"), ()=>{                // "प के नीचे … तो बना पु।"
                arrows[1].classList.remove("mb-seq-hidden"); p3.classList.remove("mb-seq-hidden");
                res.classList.add("mb-in", "mb-pop");
                if(typeof sfxCorrect === "function") sfxCorrect();
                /* SME: "Highlight ा inside जाल" — the last step of every build screen, and the
                   one this lesson could not do before. Now it can (see matraHL). */
                matraHLSoon(res, d.matra, { glow:true, pulse:true });
                /* SME round 3, "Sound Differentiation": once the word is built, say the three
                   sounds with a pause between each — «प … पु … पुल» — "so the child can hear how
                   the sound changes after adding ु". ONE clip, because three clips back to back
                   lose the deliberate pause the note is asking for. */
                sayAll([A(slide, "result")], ()=> sayOpt(A(slide, "sounds"), done));
              });
            });
          }, 260);
        });
      });
      setTimeout(()=>{ if(state.demoRunning) done(); }, 34000);   // never strand the slide
    }
  };

  /* ================================================================ 5 · MEET_PAIR */
  /* Two example words, one at a time, each with its picture and its matra called out.
     A separate module rather than a change to MEET_LETTER, so the 11 shipped MEET_LETTER
     games keep rendering byte-identically.
     data: { examples:[{word, matra, img, emoji, audio}] } */
  SlideModules.MEET_PAIR = {
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div");
      wrap.className = "mp-stage";
      host.appendChild(wrap);
      state.ownsAudio = true; state.demoRunning = true; setNavActive(false);
      if(typeof setSwMood === "function") setSwMood("teach");

      const paint = (ex)=>{
        wrap.innerHTML =
          '<div class="mp-card">' +
            '<span class="ink-box"><span class="mp-word ink-glyph">' + ex.word + "</span></span>" +
            '<span class="mp-pic">' + imgOrEmoji(ex.img, ex.emoji, "mp-img", "mp-emoji") + "</span>" +
          "</div>" +
          '<div class="mp-callout">इस शब्द की मात्रा — ' +
            '<span class="mp-matra ink-glyph">◌' + ex.matra + "</span></div>";
        /* settled by default — `mp-in` only drives the fade, so a capture with animation
           disabled still shows a fully painted card and callout */
        wrap.querySelector(".mp-card").classList.add("mp-in");
        return { card: wrap.querySelector(".mp-card"),
                 word: wrap.querySelector(".mp-word"),
                 pic:  wrap.querySelector(".mp-pic"),
                 call: wrap.querySelector(".mp-callout") };
      };
      const show = (ex, after)=>{
        const { word, pic, call } = paint(ex);
        /* SME: "Word should appear first, then image should appear." The first build painted
           both at once, which loses the beat the note is asking for — the child should read
           the word before the picture tells them the answer. The picture is held back one
           clip; .mp-pic starts transparent and `mp-in` reveals it. */
        sfxPopSoft();
        say(clip(ex.audio_line), ()=>{                       // "पुल में छोटी उ की मात्रा है।"
          pic.classList.add("mp-in");
          sfxPopSoft();
          call.classList.add("mp-in");
          /* SME: "When the VO says the matra part, the ा should glow/highlight." Now real —
             the mark inside the word turns red and pulses. See matraHL(). */
          matraHLSoon(word, ex.matra, { glow:true, pulse:true });
          if(typeof handOnAnswer === "function") handOnAnswer(call, slide);
          /* ROUND 3 folds the matra call-out INTO the example line itself («… इसमें ग पर छोटी उ
             की मात्रा लगी है।»), so the separate matra clip is now optional. sayOpt keeps the
             beat when a card still supplies one and moves straight on when it does not. */
          sayOpt(clip(ex.matra_audio), ()=>{ if(typeof stopNudge === "function") stopNudge();
            setTimeout(after, 420); });
        });
      };
      /* PAINT EXAMPLE 1 SYNCHRONOUSLY, FULLY SETTLED. Everything after it is audio-driven, but
         the first example must exist in the DOM the instant the slide mounts — otherwise a
         frozen capture (and a reader on a slow connection) sees an empty card. Found in the
         review deck: all three MEET_PAIR pages photographed blank.
         It must also be COMPLETE, not half-painted: the picture and the matra highlight are
         normally held back a clip, and both are plain opacity rather than animation, so a
         capture would freeze them invisible. Reveal them here; show() repaints from scratch
         when the audio actually reaches this example, so the live beat is unaffected. */
      {
        const first = paint(d.examples[0]);
        first.pic.classList.add("mp-in");
        first.call.classList.add("mp-in");
        matraHLSoon(first.word, d.examples[0].matra, { glow:true });
      }
      let i = 0;
      const next = ()=>{
        if(i >= d.examples.length){
          state.demoRunning = false;
          state.replayAudio = ()=> say(A(slide, "prompt"), ()=>{});
          $("navBtn").onclick = ()=> completeSlide(true);
          setNavActive(true);
          return;
        }
        show(d.examples[i++], next);
      };
      say(A(slide, "prompt"), next);
      setTimeout(()=>{ if(state.demoRunning){ state.demoRunning = false; setNavActive(true);
        $("navBtn").onclick = ()=> completeSlide(true); } }, 40000);
    }
  };

  /* ================================================================ 6 · CONTRAST_PAIR */
  /* The minimal pair taught head to head — «फुल / फूल». The curriculum row asks for exactly
     this: «मिलते-जुलते जोड़े (फूल/फल) विपर्यय राउंड में», and names the error it prevents
     («'फूल' को 'फुल' पढ़ता है»). Autonomous teach, zero taps.
     data: { left:{word,matra,label}, right:{word,matra,img,emoji,label} } */
  SlideModules.CONTRAST_PAIR = {
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div");
      wrap.className = "cp-stage";
      const side = (s, cls)=>
        '<div class="cp-side ' + cls + '">' +
          '<span class="ink-box"><span class="cp-word ink-glyph">' + s.word + "</span></span>" +
          '<span class="cp-matra">◌' + s.matra + "</span>" +
          '<span class="cp-lbl">' + (s.label || "") + "</span>" +
        "</div>";
      wrap.innerHTML = side(d.left, "cp-a") + '<div class="cp-vs">≠</div>' + side(d.right, "cp-b");
      host.appendChild(wrap);
      const a = wrap.querySelector(".cp-a"), b = wrap.querySelector(".cp-b"), vs = wrap.querySelector(".cp-vs");
      [a, b, vs].forEach(e => e.classList.add("mb-seq-hidden"));

      state.ownsAudio = true; state.demoRunning = true; setNavActive(false);
      if(typeof setSwMood === "function") setSwMood("teach");
      /* The contrast IS the two marks, so highlighting them is not decoration here — a child
         who cannot see which mark differs cannot learn फुल ≠ फूल. Both are highlighted as
         their side is revealed. */
      const aw = a.querySelector(".cp-word"), bw = b.querySelector(".cp-word");
      /* painted at mount for the capture; both sides are mb-seq-hidden live (see MATRA_BUILD) */
      matraHLSoon(aw, d.left.matra,  { glow:true });
      matraHLSoon(bw, d.right.matra, { glow:true });
      say(A(slide, "prompt"), ()=>{
        a.classList.remove("mb-seq-hidden"); a.classList.add("mb-in");
        matraHLSoon(aw, d.left.matra, { glow:true });
        say(A(slide, "left"), ()=>{
          vs.classList.remove("mb-seq-hidden"); vs.classList.add("mb-in");
          b.classList.remove("mb-seq-hidden"); b.classList.add("mb-in");
          matraHLSoon(bw, d.right.matra, { glow:true, pulse:true });
          say(A(slide, "right"), ()=>{
            say(A(slide, "explain"), ()=>{
              state.demoRunning = false;
              state.replayAudio = ()=> sayAll([A(slide,"left"), A(slide,"right")], ()=>{});
              $("navBtn").onclick = ()=> completeSlide(true);
              setNavActive(true);
            });
          });
        });
      });
      setTimeout(()=>{ if(state.demoRunning){ state.demoRunning = false; setNavActive(true);
        $("navBtn").onclick = ()=> completeSlide(true); } }, 30000);
    }
  };

  /* ================================================================ 8 · MATRA_INTRO */
  /* The SME's screen 1, which the first build did not implement.

     Their note asks for the LETTER AND ITS MATRA SHOWN AS A PAIR, one pair at a time:
        "Show the letter and its corresponding matra symbol as a pair, one by one.
         Each pair should light up/highlight when its VO plays.
         Keep only one pair active at a time.
         Sequence: आ → ा · इ → ि · ई → ी"
     The stock INTRO module draws a row of bare symbols, so the built screen showed «◌ु ◌ू»
     with no letters at all — the child was never told which VOWEL each mark stands for, which
     is the whole point of the screen. For this skill the sequence is उ → ◌ु and ऊ → ◌ू.

     Also per the note: the Next button stays locked "only after all pairs have been shown and
     spoken", and a soft pop plays as each mark appears.
     data: { pairs:[{letter, matra, audio}] } */
  SlideModules.MATRA_INTRO = {
    mount(host, slide){
      const d = slide.data;
      /* ROUND 3: the SME asks to "keep the train-theme continuity by showing each pair inside a
         train-style card / bogie / box", and round 3b makes that the SAME painted train the cover
         and every test screen use — one train through the whole lesson, which is the point of the
         note. Each «उ → ◌ु» pair is painted onto its coach's cream panel. */
      const wrapHost = document.createElement("div");
      wrapHost.className = "mi-stage";
      host.appendChild(wrapHost);
      const train = buildTrain(wrapHost, {
        coaches: d.pairs.length,
        labels: d.pairs.map(()=> null),
        bodies: d.pairs.map(p =>
          '<span class="mi-pair-in">' +
            '<span class="mi-letter ink-glyph">' + p.letter + "</span>" +
            '<span class="mi-arrow">\u2192</span>' +
            '<span class="mi-matra ink-glyph">' + matraGlyph(p.matra) + "</span>" +
          "</span>"),
        dropZone: false, maxH: 210
      });
      const wrap = wrapHost;   /* the rest of this module refers to `wrap` */
      train.coaches.forEach((c)=> c.el.classList.add("mi-pair"));
      const pairs = train.coaches.map(c => c.el);

      state.ownsAudio = true; state.demoRunning = true; setNavActive(false);
      if(typeof setSwMood === "function") setSwMood("teach");

      /* SETTLED BY DEFAULT: every pair is painted and visible from the start, and `is-on` only
         adds the highlight. A capture with animation frozen therefore shows the whole screen,
         not one pair — the failure mode that shipped three blank teach pages last round. */
      const done = ()=>{
        state.demoRunning = false;
        pairs.forEach(p => p.classList.remove("is-dim"));
        state.replayAudio = ()=> sayAll(d.pairs.map(p => clip(p.audio)), ()=>{});
        $("navBtn").onclick = ()=> completeSlide(true);
        setNavActive(true);
      };
      let i = 0;
      const step = ()=>{
        if(i >= pairs.length){ done(); return; }
        const k = i++;
        pairs.forEach((p, n) => p.classList.toggle("is-dim", n !== k));
        pairs[k].classList.add("is-on");
        sfxPopSoft();
        say(clip(d.pairs[k].audio), ()=> setTimeout(step, 320));
      };
      /* `instruction` is optional in round 3 — the SME's VO list for this screen is the intro
         line and then the two pair lines, nothing between them. */
      say(A(slide, "prompt"), ()=> sayOpt(A(slide, "instruction"), step));
      setTimeout(()=>{ if(state.demoRunning) done(); }, 30000);
    }
  };

  /* ================================================================ 7 · POEM_SEARCH */
  /* «मात्रा खोजो» — a poem card, a draggable magnifying glass that magnifies whatever word is
     under it, N sequential rounds over the same poem, and THE GHOST.
     data: { lines:[[word,…],…], rounds:[{matra, targets:[word,…]}] }
     The target list is authored per round and every word carrying an in-scope matra MUST be in
     one — a child who taps a correct word that is not listed would be marked wrong, which is
     how the sibling's poem screen was caught. The builder audits this.

     THE GHOST WAS SPECIFIED IN FULL BY THE SME AND WAS MISSING FROM THE FIRST BUILD. Their
     note is unusually precise about it, and about the fact that it is a GUIDE rather than
     decoration — the same note deletes the old scenic art ("Remove extra decorative elements
     like: Ravi, kite, girl, tree") and keeps only the poem card, the lens, the targets and the
     ghost. All seven behaviours they list are implemented below and labelled SME-GHOST:
        entry flight · idle cue · happy bounce · thinking face · 2nd-attempt drift to a real
        target · round-completion fly-across with a sparkle trail · final spin.
     It is drawn rather than generated art because it has to fly to an arbitrary word position
     and change expression; a PNG can do neither. */
  SlideModules.POEM_SEARCH = {
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div");
      wrap.className = "ps-stage";
      const card = document.createElement("div");
      card.className = "ps-card";
      d.lines.forEach(line => {
        const ln = document.createElement("div"); ln.className = "ps-line";
        line.forEach(w => {
          const sp = document.createElement("span");
          sp.className = "ps-w ink-glyph"; sp.textContent = w; sp.dataset.w = w;
          ln.appendChild(sp);
        });
        card.appendChild(ln);
      });
      wrap.appendChild(card);

      /* round progress: the SME wants no instruction TEXT, but with six words to find over two
         rounds and no counter a child cannot tell a round ended. Dots carry it without words. */
      const dots = document.createElement("div");
      dots.className = "ps-dots";
      card.appendChild(dots);
      const paintDots = ()=>{
        const r = d.rounds[Math.min(round, d.rounds.length - 1)];
        dots.innerHTML = r.targets.map((_, i) =>
          '<span class="ps-dot' + (i < found ? " on" : "") + '"></span>').join("");
      };

      const lens = document.createElement("div");
      lens.className = "ps-lens";
      lens.innerHTML = '<svg viewBox="0 0 90 90" width="90" height="90" aria-hidden="true">' +
        '<circle cx="36" cy="36" r="27" fill="rgba(191,227,255,.42)" stroke="#0B3D8C" stroke-width="6"/>' +
        '<rect x="56" y="56" width="28" height="11" rx="5" transform="rotate(45 56 56)" fill="#0B3D8C"/></svg>';
      wrap.appendChild(lens);

      /* ---- SME-GHOST: the character itself ---- */
      const ghost = document.createElement("div");
      ghost.className = "ps-ghost";
      ghost.innerHTML =
        '<svg viewBox="0 0 74 74" width="74" height="74" aria-hidden="true">' +
          '<path d="M10 40a27 27 0 0 1 54 0v24c0 3-3 4-5 2l-5-5-6 5c-2 2-4 2-6 0l-5-5-6 5c-2 2-4 2-6 0l-5-5-5 5c-2 2-5 1-5-2z" ' +
                'fill="#F3F8FF" stroke="#7FA8E8" stroke-width="3.5" stroke-linejoin="round"/>' +
          '<circle class="gh-eye" cx="28" cy="36" r="5" fill="#0B3D8C"/>' +
          '<circle class="gh-eye" cx="47" cy="36" r="5" fill="#0B3D8C"/>' +
          '<ellipse class="gh-mouth" cx="37" cy="49" rx="6" ry="4.5" fill="#0B3D8C"/>' +
        "</svg>";
      wrap.appendChild(ghost);
      host.appendChild(wrap);

      state.ownsAudio = true;
      setNavActive(false);
      let round = 0, found = 0;
      const words = [...card.querySelectorAll(".ps-w")];

      /* Move the ghost to a point in stage coordinates. The stage is the offset parent, so a
         plain translate is enough and the CSS transition does the flight. */
      const stageBox = ()=> wrap.getBoundingClientRect();
      function ghostTo(clientX, clientY, opts){
        const s = stageBox();
        const x = clientX - s.left - 37, y = clientY - s.top - 37;
        ghost.style.transform = "translate(" + x + "px," + y + "px)";
        ghost.classList.add("gh-on");
        if(opts && opts.dim) ghost.classList.add("gh-dim"); else ghost.classList.remove("gh-dim");
      }
      function ghostToEl(el, dy){
        const b = el.getBoundingClientRect();
        ghostTo(b.left + b.width / 2, b.top + (dy == null ? -14 : dy));
      }
      const ghostFace = (mood)=>{
        ghost.classList.toggle("gh-think", mood === "think");
        const mouth = ghost.querySelector(".gh-mouth");
        if(!mouth) return;
        if(mood === "happy"){ mouth.setAttribute("ry", "6"); mouth.setAttribute("rx", "7"); }
        else if(mood === "think"){ mouth.setAttribute("ry", "2"); mouth.setAttribute("rx", "4"); }
        else { mouth.setAttribute("ry", "4.5"); mouth.setAttribute("rx", "6"); }
      };
      function sparkleAt(el){
        const s = stageBox(), b = el.getBoundingClientRect();
        const sp = document.createElement("span");
        sp.className = "ps-spark"; sp.textContent = "✨";
        sp.style.left = (b.left - s.left + b.width / 2 - 8) + "px";
        sp.style.top  = (b.top  - s.top  - 14) + "px";
        wrap.appendChild(sp);
        setTimeout(()=> sp.remove(), 1400);
      }

      /* ---- SME-GHOST 1: entry. "a small ghost floats in from one side, briefly circles the
         magnifying glass, then fades slightly or moves to a corner." ---- */
      let idleTimer = null, lastAct = Date.now();
      function ghostEntry(){
        const lb = lens.getBoundingClientRect();
        ghostTo(lb.left - 130, lb.top + 10);
        setTimeout(()=> ghostTo(lb.left + lb.width / 2, lb.top - 44), 420);   // circle the lens
        setTimeout(()=> ghostTo(lb.left + lb.width + 6, lb.top + 30), 1180);
        setTimeout(()=>{ ghost.classList.add("gh-dim", "gh-float"); }, 1900);
      }
      /* ---- SME-GHOST 2: idle cue. "If the child is idle for a few seconds, the ghost appears
         near the magnifying glass and gently moves toward the poem." ---- */
      function bumpIdle(){ lastAct = Date.now(); }
      idleTimer = setInterval(()=>{
        if(state.locked) return;
        if(Date.now() - lastAct < 7000) return;
        const tgt = words.find(x => d.rounds[round].targets.indexOf(x.dataset.w) >= 0 &&
                                    !x.classList.contains("ps-hit"));
        ghost.classList.remove("gh-dim");
        if(tgt) ghostToEl(tgt, -40); else ghostToEl(card, -30);
        setTimeout(()=> ghost.classList.add("gh-dim"), 2200);
        bumpIdle();
      }, 2500);

      /* the word under the lens grows — this is HOW the child scans, not decoration */
      const magnify = ()=>{
        const r = lens.getBoundingClientRect();
        const cx = r.left + r.width * 0.40, cy = r.top + r.height * 0.40;
        words.forEach(w => {
          const b = w.getBoundingClientRect();
          const near = Math.hypot(b.left + b.width / 2 - cx, b.top + b.height / 2 - cy) < 78;
          w.classList.toggle("ps-mag", near && !w.classList.contains("ps-hit"));
        });
      };
      let lx = 0, ly = 0, drag = false, sx = 0, sy = 0;
      const sc = ()=> parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--scale")) || 1;
      const down = e => { drag = true; const p = e.touches ? e.touches[0] : e; sx = p.clientX; sy = p.clientY; bumpIdle(); e.preventDefault(); };
      const move = e => { if(!drag) return; const p = e.touches ? e.touches[0] : e;
        lx += (p.clientX - sx) / sc(); ly += (p.clientY - sy) / sc(); sx = p.clientX; sy = p.clientY;
        lens.style.transform = "translate(" + lx + "px," + ly + "px)"; magnify(); bumpIdle(); e.preventDefault(); };
      const up = ()=> { drag = false; };
      lens.addEventListener("mousedown", down); lens.addEventListener("touchstart", down, {passive:false});
      document.addEventListener("mousemove", move); document.addEventListener("touchmove", move, {passive:false});
      document.addEventListener("mouseup", up); document.addEventListener("touchend", up);

      const startRound = ()=>{
        found = 0;
        paintDots();
        say(A(slide, "round" + (round + 1)), ()=>{});
      };
      const wrongCount = new Map();

      words.forEach(w => {
        w.onclick = ()=>{
          if(state.locked) return;
          bumpIdle();
          const r = d.rounds[round];
          if(w.classList.contains("ps-hit")) return;
          if(r.targets.indexOf(w.dataset.w) >= 0){
            w.classList.remove("ps-mag"); w.classList.add("ps-hit");
            /* the found word keeps its matra marked, so the poem becomes a record of the hunt */
            matraHLSoon(w, r.matra, { glow:true });
            if(typeof sfxTap === "function") sfxTap();
            found++;
            paintDots();
            /* ---- SME-GHOST 3: "Ghost pops up happily near the correct word. Small sparkle
               appears. Ghost can do a short happy bounce and disappear." ---- */
            ghost.classList.remove("gh-dim", "gh-float");
            ghostFace("happy"); ghostToEl(w, -46);
            sparkleAt(w); sfxSparkle();
            ghost.classList.remove("gh-bounce"); void ghost.offsetWidth;
            ghost.classList.add("gh-bounce");
            setTimeout(()=>{ ghostFace("idle"); ghost.classList.add("gh-dim", "gh-float"); }, 1300);
            SwiftPAL.emit("poem_word_found", { slide_id: slide.id, word: w.dataset.w, matra: r.matra });
            if(found >= r.targets.length){
              if(typeof sfxCorrect === "function") sfxCorrect();
              if(typeof confettiCannon === "function") confettiCannon();
              card.classList.add("ps-round-done");
              setTimeout(()=> card.classList.remove("ps-round-done"), 900);
              /* ---- SME-GHOST 4: round completion. "Ghost flies across the selected words
                 with a sparkle trail." ---- */
              const hits = words.filter(x => r.targets.indexOf(x.dataset.w) >= 0);
              ghost.classList.remove("gh-dim");
              hits.forEach((h, k) => setTimeout(()=>{ ghostToEl(h, -44); sparkleAt(h); }, 260 + k * 420));
              round++;
              if(round >= d.rounds.length){
                state.locked = true;
                clearInterval(idleTimer);
                if(typeof setSwMood === "function") setSwMood("celebrate");
                /* ---- SME-GHOST 5: final. "Ghost appears once in the centre, celebrates with
                   a small spin/sparkle. Magnifying glass gives a final glow." ---- */
                setTimeout(()=>{
                  const cb = card.getBoundingClientRect();
                  ghostFace("happy");
                  ghostTo(cb.left + cb.width / 2, cb.top + cb.height / 2);
                  ghost.classList.remove("gh-float"); void ghost.offsetWidth;
                  ghost.classList.add("gh-spin");
                  lens.classList.add("ps-lens-done");
                  sfxSparkle();
                }, 260 + hits.length * 420);
                SwiftPAL.emit("poem_search_complete", { slide_id: slide.id, attempts: state.attempts });
                say(A(slide, "correct"), ()=>{ setNavActive(true);
                  $("navBtn").onclick = ()=> completeSlide(state.attempts === 0); });
              } else {
                setTimeout(startRound, 260 + hits.length * 420 + 400);
              }
            }
          } else {
            const n = (wrongCount.get(w) || 0) + 1; wrongCount.set(w, n);
            state.attempts++;
            if(typeof sfxWrongSoft === "function") sfxWrongSoft();
            w.classList.remove("ps-mag"); w.classList.add("ps-miss");
            setTimeout(()=> w.classList.remove("ps-miss"), 520);
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, word: w.dataset.w });
            if(state.attempts === 1){
              /* ---- SME-GHOST 6: 1st wrong. "Ghost briefly appears with a thinking
                 expression. No hand nudge." ---- */
              ghost.classList.remove("gh-dim");
              ghostFace("think"); ghostToEl(w, -44);
              setTimeout(()=>{ ghostFace("idle"); ghost.classList.add("gh-dim"); }, 1600);
              say(A(slide, "hint1"), ()=>{});
            } else {
              state.hintUsed = true;
              say(A(slide, "hint2") || A(slide, "hint"), ()=>{
                const r2 = d.rounds[round];
                const tgt = words.find(x => r2.targets.indexOf(x.dataset.w) >= 0 && !x.classList.contains("ps-hit"));
                /* ---- SME-GHOST 7: 2nd wrong. "Ghost floats toward one correct target word.
                   It gently points/pulses near that word. This acts as the hint instead of
                   adding extra text." The ghost is OURS and is not phase-gated, so it still
                   guides on this practice screen; the engine's HAND stays withheld here under
                   the [28f] ruling, and handOnAnswer() is what enforces that. ---- */
                if(tgt){
                  ghost.classList.remove("gh-dim");
                  ghostFace("idle"); ghostToEl(tgt, -46);
                  ghost.classList.remove("gh-bounce"); void ghost.offsetWidth;
                  ghost.classList.add("gh-bounce");
                  sparkleAt(tgt);
                  if(typeof handOnAnswer === "function") handOnAnswer(tgt, slide);
                }
              });
            }
          }
        };
      });

      paintDots();
      say(A(slide, "prompt"), startRound);
      requestAnimationFrame(()=>{ magnify(); ghostEntry(); });
    }
  };

  /* ================================================================ 9 · WORD_BUILD */
  /* ROUND 3 — this REPLACES the round-2 MATRA_FILL screen, and it is a different task, not a
     re-skin. MATRA_FILL dragged a bare matra (`ु`) into `प_ल`: the child supplied a mark. The
     SME's round-3 note asks for a word-completion train instead —

        "Each coach will contain an incomplete word with the first and last letters visible and a
         blank space in between … The child will look at the picture above the coach, understand
         the word, and drag the correct अक्षर option to complete the word."
        "Keep only the last letter visible inside each coach: _ल · _ल · _ई"

     — so the child now supplies a whole अक्षर (consonant + matra as one cluster), and the blank
     sits FIRST, ahead of the tail. That is a harder and more useful task: it makes them choose
     between पु and फू, which is exactly the ह्रस्व/दीर्घ confusion this skill exists to fix.

     MATRA_FILL is left registered and untouched — nothing else in this bundle mounts it, and the
     sibling lessons on this engine line must keep rendering byte-identically.

     data: { slots:[{word, tail, matra, img, emoji, correct_audio}],
             options:[{akshar, audio}] }
     A drop is judged by RECONSTRUCTING the word — `akshar + slot.tail === slot.word` — rather
     than by an index, so a distractor matches nothing by construction and the two ...ल coaches
     can never both accept the same tile. */
  SlideModules.WORD_BUILD = {
    mount(host, slide){
      const d = slide.data;
      const train = buildTrain(host, {
        coaches: d.slots.length,
        /* SME: "Show related pictures above each coach" — the picture IS the question here, so
           it takes the label slot the other screens use for a matra name. */
        labels: d.slots.map(s => imgOrEmoji(s.img, s.emoji, "tr-slotpic", "tr-emoji")),
        bodies: d.slots.map((s, i) =>
          '<span class="tr-fill wb-fill" data-i="' + i + '">' +
            '<span class="tr-blank wb-blank dd-zone" data-idx="' + i + '"></span>' +
            '<span class="ink-glyph wb-tail">' + s.tail + "</span>" +
          "</span>"),
        dropZone: false
      });

      const tray = document.createElement("div");
      tray.className = "tr-tray wb-tray";
      /* SME: "Below the train, show draggable options: पु · फू · सु" plus 1–2 distractors.
         Shuffled, so the answer is never the n-th card two runs running. */
      d.options.slice().sort(()=> Math.random() - 0.5).forEach(o => {
        const t = document.createElement("div");
        t.className = "tr-card k-akshar";
        t.dataset.akshar = o.akshar;
        if(o.audio) t.dataset.audio = o.audio;
        t.innerHTML = '<span class="wb-akshar ink-glyph">' + o.akshar + "</span>";
        tray.appendChild(t);
      });
      host.appendChild(tray);

      state.ownsAudio = true;
      state.replayAudio = ()=> say(A(slide, "prompt"), ()=>{});
      setNavActive(false);
      let done = 0;
      const perCard = new Map();

      [...tray.children].forEach(tile => {
        /* SME: "Optional word support VO when a card is tapped: पु / फू / सु — This will help the
           child connect the picture, sound, and correct word formation." */
        tile.onclick = ()=>{ if(tile.dataset.audio && !isPlaying && !tile.classList.contains("snapped"))
          say(clip(tile.dataset.audio), ()=>{}); };

        makeDraggable(tile, (zone)=>{
          const blank = zone.closest(".wb-blank"); if(!blank) return;
          if(blank.classList.contains("filled")) return;
          const i = parseInt(blank.dataset.idx, 10);
          const slot = d.slots[i];
          tile.style.transform = "";
          if(tile.dataset.akshar + slot.tail === slot.word){
            const quiet = (perCard.get(tile) || 0) >= maxTries() - 1;
            blank.classList.add("filled");
            blank.innerHTML = '<span class="ink-glyph wb-inakshar">' + tile.dataset.akshar + "</span>";
            /* the option is consumed — it belongs to exactly one coach */
            tile.classList.add("snapped", "wb-used");
            /* SME: "Option snaps into the blank space. The complete word appears." The split form
               is replaced by the whole word a beat later so the child reads it as one word, with
               the matra they just supplied still marked. */
            const holder = blank.closest(".wb-fill");
            setTimeout(()=>{
              if(!holder || !holder.isConnected) return;
              holder.innerHTML = '<span class="ink-glyph tr-doneword">' + slot.word + "</span>";
              matraHLSoon(holder.querySelector(".tr-doneword"), slot.matra, { glow:true });
            }, 450);
            done++;
            train.correct(i);
            if(typeof sfxCorrect === "function") sfxCorrect();
            SwiftPAL.emit("word_build_item", { slide_id: slide.id, word: slot.word });
            /* «शाबाश! पुल बन गया।» / «शाबाश! सुई बन गई।» — per slot, and SILENT if the child
               needed the whole ladder ("Correct Answer on 3rd Attempt … No VO required"). */
            const okvo = quiet ? null : slot.correct_audio;
            if(done >= d.slots.length){
              /* "No extra completion VO required." */
              sayOpt(clip(okvo), ()=> finishSlide(slide, train, true, "word_build_first_try"));
            } else {
              sayOpt(clip(okvo), ()=>{});
            }
          } else {
            const n = (perCard.get(tile) || 0) + 1; perCard.set(tile, n);
            state.attempts++;
            if(typeof sfxWrongSoft === "function") sfxWrongSoft();
            if(typeof setSwMood === "function") setSwMood("tryagain");
            train.shake(i);
            SwiftPAL.emit("answer_wrong", { slide_id: slide.id, attempts: state.attempts });
            if(n === 1){
              /* SME: "No hand nudge. Only VO." */
              say(A(slide, "hint1") || A(slide, "try_again"), ()=>{});
            } else {
              state.hintUsed = true;
              SwiftPAL.emit("hint_shown", { slide_id: slide.id, level: 2 });
              say(A(slide, "hint2") || A(slide, "hint") || A(slide, "try_again"), ()=>{
                /* "Show hand nudge on the correct blank space." The correct blank is the one this
                   tile actually completes. A DISTRACTOR completes nothing, so there is no such
                   blank — pointing at any of them would teach the wrong thing. In that case the
                   coach the child dropped on is glowed instead, which sends them back to its
                   picture, and the hand is withheld. */
                const want = d.slots.findIndex(s => tile.dataset.akshar + s.tail === s.word);
                const at = want >= 0 ? want : i;
                train.nudge(at, slide);                 // coach glow + the [28f]-gated hand
                const bl = train.coaches[at].body.querySelector(".wb-blank");
                if(bl && want >= 0) bl.classList.add("wb-pulse");
              });
            }
          }
        }, { onPick: ()=>{ if(typeof sfxTap === "function") sfxTap(); } });
      });

      /* SME's entry order: "Train enters from right to left and stops at the centre. Picture cards
         appear first. Incomplete words appear inside the coaches. Options slide up from the
         bottom." Settled by default (engine fact 1) — these classes only drive the stagger, so a
         frozen capture shows the finished screen. */
      requestAnimationFrame(()=>{
        train.coaches.forEach((c, i) => {
          c.label.style.setProperty("--tr-lbl-delay", (260 + i * 220) + "ms");
          c.label.classList.add("tr-lblseq");
          c.body.style.setProperty("--tr-lbl-delay", (900 + i * 200) + "ms");
          c.body.classList.add("tr-bodyseq");
        });
        tray.classList.add("wb-trayin");
      });
      say(A(slide, "prompt"), ()=>{});
    }
  };

  /* ================================================================ 10 · SENTENCE_COMPLETE */
  /* ROUND 3 — a new module, four instances. It REPLACES the round-2 POEM_SEARCH screen (the poem
     was ours, not the SME's) and adds three more beside it. Laid out from the SME's own mockup,
     `2_MOCKUPS/slide15_sentence_complete_ALL_FOUR.png`: heading band, a large scene illustration
     on one side, the sentence with a dashed blank on the other, three picture option cards under
     the sentence, आगे below.

     WHY THIS IS THE RIGHT LAST BEAT. Every other screen in the lesson asks "which matra is in
     this word". This one asks the child to USE such a word in a meaning — the SME's words, "how
     मात्रा वाले शब्द are used in meaningful sentences". It is the only screen where the matra is
     not the visible question, which is what makes it a test of reading rather than of spotting.

     A TAP IS THE ANSWER, and it is also how the child READS the option: the note says "When an
     option is tapped, play the word VO", so the word is spoken first and the judgement follows on
     that clip ending. A pre-reader who cannot decode खुश can still hear it and decide.

     data: { scene_img, scene_emoji, sentence_pre, sentence_post, answer,
             options:[{word, img, emoji, audio}] } */
  SlideModules.SENTENCE_COMPLETE = {
    mount(host, slide){
      const d = slide.data;
      const wrap = document.createElement("div");
      wrap.className = "sc-stage";
      wrap.innerHTML =
        '<div class="sc-scene">' +
          imgOrEmoji(d.scene_img, d.scene_emoji, "sc-sceneimg", "sc-sceneemoji") +
        "</div>" +
        '<div class="sc-right">' +
          '<div class="sc-sentence">' +
            '<span class="sc-txt">' + (d.sentence_pre || "") + "</span>" +
            '<span class="sc-blank"></span>' +
            '<span class="sc-txt">' + (d.sentence_post || "") + "</span>" +
          "</div>" +
          '<div class="sc-opts"></div>' +
        "</div>";
      host.appendChild(wrap);

      const blank = wrap.querySelector(".sc-blank");
      const sent  = wrap.querySelector(".sc-sentence");
      const optsW = wrap.querySelector(".sc-opts");
      /* SME: "Keep the options visually supported with pictures so the child can independently
         understand the word." Picture AND word on every card, exactly as the mockup draws them. */
      d.options.forEach(o => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "sc-opt";
        b.dataset.word = o.word;
        if(o.audio) b.dataset.audio = o.audio;
        b.innerHTML = imgOrEmoji(o.img, o.emoji, "sc-optimg", "sc-optemoji") +
                      '<span class="ink-box"><span class="sc-optlbl ink-glyph">' + o.word + "</span></span>";
        optsW.appendChild(b);
      });
      const opts = [...optsW.children];

      state.ownsAudio = true;
      state.replayAudio = ()=> say(A(slide, "prompt"), ()=>{});
      setNavActive(false);
      let tries = 0;

      function sparkAt(el){
        const s = wrap.getBoundingClientRect(), b = el.getBoundingClientRect();
        const sp = document.createElement("span");
        sp.className = "sc-spark"; sp.textContent = "✨";
        sp.style.left = (b.left - s.left + b.width / 2 - 9) + "px";
        sp.style.top  = (b.top  - s.top  - 12) + "px";
        wrap.appendChild(sp);
        setTimeout(()=> sp.remove(), 1400);
      }

      function land(b){
        /* "Correct Answer on 3rd Attempt … No additional VO required." */
        const silent = tries >= maxTries() - 1;
        state.locked = true;
        if(typeof stopNudge === "function") stopNudge();
        opts.forEach(x => { x.disabled = true; if(x !== b) x.classList.add("sc-fade"); });
        b.classList.add("sc-won");
        /* "The option card snaps into the blank space" · "When the correct option is selected,
           the word smoothly moves into the blank space" (screens 15 and 16 say it in as many
           words). So the word actually TRAVELS: a clone of the chosen label is placed over the
           option at its real position, then transformed to the blank's position and size. FLIP,
           because the two live in different stacking contexts and animating layout between them
           would reflow the sentence mid-flight. */
        const lbl = b.querySelector(".sc-optlbl");
        const from = lbl && lbl.getBoundingClientRect();
        const to = blank.getBoundingClientRect();
        blank.classList.add("filled");
        blank.innerHTML = '<span class="ink-box"><span class="sc-word ink-glyph">' + d.answer + "</span></span>";
        sent.classList.add("sc-done");
        if(from && to.width){
          const fly = document.createElement("span");
          fly.className = "sc-fly"; fly.textContent = d.answer;
          fly.style.left = from.left + "px"; fly.style.top = from.top + "px";
          fly.style.font = getComputedStyle(lbl).font;
          document.body.appendChild(fly);
          const dx = (to.left + to.width / 2) - (from.left + from.width / 2);
          const dy = (to.top + to.height / 2) - (from.top + from.height / 2);
          const word = blank.querySelector(".sc-word");
          if(word) word.style.opacity = "0";
          requestAnimationFrame(()=>{
            fly.style.transform = "translate(" + dx + "px," + dy + "px)";
            fly.style.opacity = "1";
          });
          setTimeout(()=>{ fly.remove(); if(word) word.style.opacity = ""; }, 460);
        }
        if(typeof sfxCorrect === "function") sfxCorrect();
        if(typeof confettiCannon === "function") confettiCannon();
        if(typeof setSwMood === "function") setSwMood("celebrate");
        sparkAt(b); sfxSparkle();
        SwiftPAL.emit("sentence_complete_first_try", {
          slide_id: slide.id, phase: slide.phase, value: true,
          first_try: tries === 0, attempts: tries + 1,
          latency_ms: Date.now() - state.slideStart
        });
        const unlock = ()=>{ setNavActive(true);
          $("navBtn").onclick = ()=> completeSlide(tries === 0); };
        if(silent) setTimeout(unlock, 900); else say(A(slide, "correct"), unlock);
      }

      function miss(b){
        tries++;
        state.attempts = tries;
        if(typeof sfxWrongSoft === "function") sfxWrongSoft();
        if(typeof setSwMood === "function") setSwMood("tryagain");
        /* "Wrong option card gives a short shake/wiggle animation. Option returns to its original
           position." — it returns because it never left: a tap, not a drag. */
        b.classList.remove("sc-shake"); void b.offsetWidth; b.classList.add("sc-shake");
        setTimeout(()=> b.classList.remove("sc-shake"), 560);
        SwiftPAL.emit("answer_wrong", { slide_id: slide.id, phase: slide.phase, attempts: tries });
        if(tries === 1){
          say(A(slide, "hint1") || A(slide, "try_again"), ()=>{});   // SME: no hand on the 1st miss
        } else {
          state.scaffoldLevel = 2; state.hintUsed = true;
          SwiftPAL.emit("hint_shown", { slide_id: slide.id, level: 2 });
          say(A(slide, "hint2") || A(slide, "hint") || A(slide, "try_again"), ()=>{
            const right = opts.find(x => x.dataset.word === d.answer);
            if(!right) return;
            /* "Correct option gives a soft pulse/glow" — ours, not phase-gated, so a practice
               screen still escalates. "Show hand nudge on the correct option" goes through
               handOnAnswer(), which is where ruling [28f] is enforced: the hand appears in
               tutorial and guided and is withheld in practice. Flagged to the SME rather than
               silently overriding either side. */
            right.classList.add("sc-nudge");
            if(typeof handOnAnswer === "function") handOnAnswer(right, slide);
          });
        }
      }

      opts.forEach(b => {
        b.onclick = ()=>{
          if(state.locked || isPlaying || b.disabled) return;
          if(typeof sfxTap === "function") sfxTap();
          /* the tap READS the word and CHOOSES it, in that order */
          sayOpt(clip(b.dataset.audio), ()=>{
            if(state.locked) return;
            if(b.dataset.word === d.answer) land(b); else miss(b);
          });
        };
      });

      /* SME: "Picture appears first. Sentence box appears with the blank space. Options slide/fade
         in one by one." Settled by default; `sc-enter` only drives the stagger. */
      requestAnimationFrame(()=>{ wrap.classList.add("sc-enter"); sfxPopSoft(); });
      say(A(slide, "prompt"), ()=>{});
    }
  };

  /* ================================================================ 11 · THE LANDING TRAIN */
  /* THE SAME TRAIN AS EVERY OTHER SCREEN. Round 3b's whole point is that this lesson has one
     train, not a painted cover and a drawn everything-else — so the landing mounts TrainChrome
     exactly as the activity screens do, with the two matras painted onto the coaches' cream
     panels. The earlier landing-only implementation (and the cropped two-coach sprite sheet it
     needed) are gone: slicing gives a two-coach train from the three-coach artwork for free.

     SME: "Show only two matra boxes/cards: 1st box ु, 2nd box ू … The matras can be shown inside
     two train bogies/cards so that the lesson visually continues as a «मात्राओं की रेल» journey",
     with a right-to-left arrival, a whistle on entry, the bogies appearing one by one and a
     sparkle as each matra lands.

     The shared engine's boot() does not know this hero kind, so it leaves #sgHero empty and this
     fills it afterwards. Nothing in the shared engine is touched. */
  function dressLandingTrain(){
    const hero = (typeof CARD !== "undefined" && CARD.landing_hero) || null;
    if(!hero || hero.kind !== "matra_train") return false;
    const el = document.getElementById("sgHero");
    if(!el) return false;
    if(el.dataset.ltDone) return true;                    // idempotent
    el.dataset.ltDone = "1";
    const ms = hero.matras || [];

    const tc = TrainChrome.mount(el, {
      coaches: ms.length,
      coach_label: ms.map(()=> null),
      /* `lt-pending` holds each matra invisible until the train has parked — the SME asks for
         them "one by one" AFTER the arrival, so they land on a coach that is standing still */
      coach_body: ms.map(m => ({ html: '<span class="lt-matra lt-pending">' + matraGlyph(m) + "</span>" })),
      drop_zone: false,
      maxH: 220,
      on_enter: ()=>{
        [...el.querySelectorAll(".lt-matra")].forEach((sp, i)=> setTimeout(()=>{
          sp.classList.remove("lt-pending"); sp.classList.add("lt-pop");
          sfxSparkle();                       // SME: "a light sparkle/pop SFX when each matra appears"
        }, 220 + i * 520));
      }
    });
    el.classList.add("show");          // boot() only adds this for hero kinds it knows
    void tc;
    return true;
  }
  /* boot() runs after this script and the landing can be re-entered, so poll briefly rather than
     racing a single frame — the same belt-and-braces matraHLSoon uses. */
  (function watchLanding(){
    let n = 0;
    const tick = ()=>{ if(dressLandingTrain()) return; if(++n > 60) return; setTimeout(tick, 120); };
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", tick);
    else tick();
  })();


})();
