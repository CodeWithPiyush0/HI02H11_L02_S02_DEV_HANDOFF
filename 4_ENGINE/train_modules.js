
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
  /* ONE CHAIN AT A TIME, EVER.
     Every module here drives a chain of clips that call each other's callbacks, and a chain has
     no idea the screen under it has changed. Mount a slide while a previous chain is still in
     flight — a re-mount, a replay, a fast आगे — and the two talk over each other. Measured on
     this bundle: two concurrent MATRA_INTRO mounts put `vo_pair_u` on top of itself for 2.1s.
     So every chain carries the epoch it started in, and a callback whose epoch has moved on is
     simply dropped. Nothing else has to know about it. */
  let _voGen = 0;
  function newVoEpoch(){
    /* the no-heading opt-out is per SLIDE, so it is cleared on every mount and re-applied only by
       a module whose card asks for it. Round 2 hid the band GLOBALLY and shipped 14 screens with
       a mascot sitting next to nothing; this cannot do that. */
    const st = document.getElementById("stage");
    if(st){ st.classList.remove("no-band"); st.classList.remove("mp-center"); }
    return ++_voGen;
  }
  function say(src, next){
    const gen = _voGen;
    let done = false;
    const go = () => { if(done) return; done = true;
      if(gen !== _voGen) return;                 // the screen moved on; this chain is stale
      if(next) next(); };
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
      /* [r17] versioned like every other clip - see _av() in the engine */
      const a = new Audio(typeof _av === "function"
        ? _av("assets/Audio/" + name + "." + AUDIO_EXT)
        : "assets/Audio/" + name + "." + AUDIO_EXT);
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
  /* ---------------------------------------------------------------- matra ink mask
     THE MATRA'S PIXELS, FOUND BY SUBTRACTION RATHER THAN BY GEOMETRY.

     Yasir, round 13: "when we highlight the matra then highlight only the matra, currently many
     place some matra is half highlighted, some are highlighted with the letter as well."

     Both symptoms come from the same thing: every previous version drew a RECTANGLE around where
     the matra was calculated to be, and then painted whatever ink fell inside it.
       · too small  -> the mark's tail or its lower curl sits outside the box and stays navy
                       ("half highlighted"),
       · too large  -> it catches the consonant's foot or the next letter's stem
                       ("highlighted with the letter as well").
     Every fix moved the edges and traded one symptom for the other, because a below-base matra is
     not rectangular and no rectangle can contain it exactly.

     So stop guessing the box. Raster the word TWICE at the same origin - once as written, once
     with the matra deleted - and take the difference. Those pixels are the matra and nothing else,
     by construction, whatever the font does with the cluster. The result is used as a MASK on the
     orange overlay, so the highlight is the mark's own silhouette.

     WHY THIS IS SAFE FOR ु / ू AND NOT FOR EVERY MATRA: ु and ू are non-spacing - they add no
     advance, so deleting one leaves every other glyph exactly where it was and the difference is
     purely the mark. A spacing matra (ा, ी) shifts the letters after it, and ि reorders, so the
     difference would include half the word. Those keep the advance-based path below, which is
     what the sibling lesson uses and what works for them. */
  const _MI_CACHE = new Map();
  function _matraInkMask(word, matra, fontPx, dpr){
    const key = word + "|" + matra + "|" + fontPx + "|" + dpr;
    if(_MI_CACHE.has(key)) return _MI_CACHE.get(key);

    const base = word.split(matra).join("");
    if(!base || base === word) return null;

    const S = Math.max(1, Math.round(fontPx * dpr));
    const font = '800 ' + S + 'px "Baloo 2","Noto Sans Devanagari",sans-serif';
    const cv = document.createElement("canvas");
    const cx = cv.getContext("2d", { willReadFrequently: true });
    cx.font = font;
    const w = Math.ceil(cx.measureText(word).width) + Math.ceil(S * 0.4);
    /* generous vertical room: ु / ू hang well under the baseline and the shirorekha sits high */
    const asc = Math.round(S * 1.05), desc = Math.round(S * 0.75);
    const h = asc + desc;
    cv.width = w; cv.height = h;

    const raster = (txt)=>{
      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.clearRect(0, 0, w, h);
      cx.font = font; cx.textBaseline = "alphabetic"; cx.fillStyle = "#000";
      cx.fillText(txt, Math.round(S * 0.2), asc);
      return cx.getImageData(0, 0, w, h).data;
    };
    const A = raster(word), B = raster(base);

    /* A pixel belongs to the matra when the full word inks it and the stripped word does not.
       The 26/40 split is deliberate: a pixel only just touched in A but solidly absent from B is
       still the mark's anti-aliased edge, and dropping those left a navy fringe around the
       orange - which read as "half highlighted" at 3x. */
    const out = cx.createImageData(w, h);
    const o = out.data;
    let any = false, minX = w, maxX = -1, minY = h, maxY = -1;
    for(let i = 0, p = 0; i < A.length; i += 4, p++){
      if(A[i + 3] > 26 && B[i + 3] <= 40){
        o[i] = o[i + 1] = o[i + 2] = 255;
        o[i + 3] = A[i + 3];
        any = true;
        const x = p % w, y = (p / w) | 0;
        if(x < minX) minX = x; if(x > maxX) maxX = x;
        if(y < minY) minY = y; if(y > maxY) maxY = y;
      }
    }
    if(!any){ _MI_CACHE.set(key, null); return null; }

    cx.putImageData(out, 0, 0);
    const res = { url: cv.toDataURL("image/png"), w: w, h: h, asc: asc,
                  padX: Math.round(S * 0.2), dpr: dpr,
                  box: [minX, minY, maxX, maxY] };
    _MI_CACHE.set(key, res);
    return res;
  }

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

    /* baseline, via an inline-block strut: its top edge sits on the baseline.
       [r14] The strut is 100 CSS px wide so it ALSO measures the local scale. Everything below
       comes from getBoundingClientRect(), which is in SCREEN pixels - the stage's --scale has
       already been applied - while style.left/top are written in CSS pixels and get scaled again.
       Dividing by _mhScale converts one to the other. Without it the overlay lands at
       `offset x scale`, which at a real window size (--scale 0.54-0.81) is a whole second matra
       sitting beside the first. */
    const strut = document.createElement("span");
    strut.style.cssText = "display:inline-block;width:100px;height:0";
    el.appendChild(strut);
    const _sr = strut.getBoundingClientRect();
    const _mhScale = _sr.width > 0 ? _sr.width / 100 : 1;
    const baseline = (_sr.top - rect.top) / _mhScale;
    strut.remove();

    const tn = el.firstChild;
    if(!tn || tn.nodeType !== 3) return false;

    /* [r13] NON-SPACING MARKS GO THROUGH THE INK MASK. ु and ू add no advance, so the word can
       be rastered with and without the mark and the difference IS the mark - no rectangle, no
       edges to tune, nothing of the consonant caught. One overlay for the whole word, because the
       mask already contains every occurrence of the matra in it. */
    if(!RIGHT_SPACING_MATRAS.has(matra)){
      const fs = parseFloat(getComputedStyle(el).fontSize) || 0;
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      const m = fs ? _matraInkMask(word, matra, fs, dpr) : null;
      if(m){
        const full = document.createRange();
        full.setStart(tn, 0); full.setEnd(tn, word.length);
        const tb = full.getBoundingClientRect();
        const ov = document.createElement("span");
        ov.className = "mh-ov mh-ink" + (opts && opts.glow ? " mh-glow" : "");
        ov.setAttribute("aria-hidden", "true");
        const W = m.w / m.dpr, H = m.h / m.dpr;
        ov.style.left   = ((tb.left - rect.left) / _mhScale - m.padX / m.dpr) + "px";
        ov.style.top    = (baseline - m.asc / m.dpr) + "px";
        ov.style.width  = W + "px";
        ov.style.height = H + "px";
        ov.style.webkitMaskImage = ov.style.maskImage = 'url("' + m.url + '")';
        ov.style.webkitMaskSize  = ov.style.maskSize  = W + "px " + H + "px";
        el.appendChild(ov);
        if(opts && opts.pulse) el.classList.add("mh-pulse");
        if(typeof sfxSparkle === "function") sfxSparkle();
        return true;
      }
      /* no mask (missing font metrics, or the mark left no difference) -> fall through to the
         geometric path rather than silently painting nothing */
    }

    let off = 0, made = 0;
    clusters.forEach(cl => {
      if(cl.indexOf(matra) >= 0){
        const r = document.createRange();
        r.setStart(tn, off); r.setEnd(tn, off + cl.length);
        const cb = r.getBoundingClientRect();
        let x0 = (cb.left - rect.left) / _mhScale, x1 = (cb.right - rect.left) / _mhScale,
            y0 = baseline, y1 = rect.height / _mhScale;

        /* right-spacing marks (ा, ी) carry their own advance, so the mark is the slice of the
           cluster BEYOND the base's width, and it runs the full height rather than below the
           baseline. Detected by measuring, not by a hard-coded list of matras. */
        const base = cl.split(matra).join("");
        let below = true;
        if(base){
          const grow = (_advance(cl, el) - _advance(base, el)) / _mhScale;
          if(grow > 3){ x0 = x0 + (x1 - x0) - grow; y0 = 0; below = false; }
        }
        /* [r12] BELOW-BASE MARKS CURL PAST THEIR CLUSTER. ु and ू add no advance, so x1 is the
           base consonant's right edge - and the mark's tail sweeps a few px beyond it and was
           being clipped off, left navy against an orange body. Reach further, but ONLY in the
           below-baseline band this branch already restricts us to: down there the next letter
           has no ink to catch, so nothing else can be painted by the extra room. */
        if(below){
          x1 = Math.min(rect.width / _mhScale, x1 + Math.max(3, (x1 - x0) * 0.18));
          /* [r12] AND THE FLOOR HAS TO DROP. y1 was rect.height, but these panels set
             line-height:1 and the mark descends below the content box - so the bottom of
             every ु / ू was left navy under an orange body, which is what made the
             highlight look like a band rather than a mark. Nothing else is down there. */
          const _fs = parseFloat(getComputedStyle(el).fontSize) || 0;
          y1 = rect.height + _fs * 0.34;
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
    /* [r24] THE CREAM PANEL, MEASURED OFF THE ARTWORK - not estimated.
       These said h:417/418/417. The painted panels are 228/222/226 art px tall: the declared
       height was very nearly DOUBLE the real one, so the drop rectangle hung far below the cream
       and down into the wheels, which is exactly what Yasir's screenshot shows. The widths were
       out too, by 7-16px.
       Found by scanning each coach's x-range for rows carrying a long unbroken run of the cream
       colour and taking that region's bounds, then checked by drawing the result back over the
       art - the boxes land on the panels with nothing to spare. */
    panel: [null, { cx: 898, cy: 330, w: 402, h: 228 },
                  { cx: 1394, cy: 327, w: 392, h: 222 },
                  { cx: 1898, cy: 330, w: 409, h: 226 }]
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
        /* [r24] EXACTLY the panel. The 0.94/0.90 shrink was compensating for a panel table
           that was too big - a fudge on top of a wrong number, which still left the box the
           wrong shape. With the table measured, the face IS the rectangle painted on the cart:
           "the drop area should be exactly same as the rectangle made in the coach". */
        face.style.width  = (pan.w * k) + "px";
        face.style.height = (pan.h * k) + "px";
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
      /* the sibling's engine reads state.promptGate to hold its auto prompt chain until the train
       parks. THIS engine has no such hook — it is set and never read — and the modules here gate
       their own prompts through buildTrain's whenParked() instead. Left assigned (harmless, and
       it keeps the ported block diffable against the sibling) but nothing depends on it. */
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
        complete(){ shell.classList.add("complete"); sfxWhistle(); },
        /* [r26] THE TRAIN LEAVES THE WAY IT CAME.
           Yasir: "after completing one page the train will animation again and move ahead and
           get out of the screen (to the left side) and from the right side the train will come
           for the next page and its instruction of next page will appear."
           The arrival already exists - .tr-entering slides the rail in from +86% over
           TRAIN_TRAVEL_MS while the sprite sheet rolls the wheels, then `settle` swaps the
           sprite for the still. Leaving is that in reverse: put the rolling sprite back (drop
           .tc-parked), run the same eased cell advance, and carry the rail off to the left.
           `done` fires when it is gone, whether or not the animation was allowed to run - a
           child on reduced motion must still get to the next screen. */
        depart(done){
          const finish = ()=>{ if(done){ const f = done; done = null; f(); } };
          if(reduce){ setTimeout(finish, 120); return; }
          shell.classList.remove("tc-parked");     /* the rolling wheels come back */
          rail.classList.remove("tr-entering");
          void rail.offsetWidth;
          rail.classList.add("tr-leaving");
          sfxWhistle(); sfxTrainMove();
          const ease = _trainEase(), t0 = performance.now();
          const tick = ()=>{
            if(!rail.isConnected){ finish(); return; }
            const p = Math.min(1, (performance.now() - t0) / TRAIN_TRAVEL_MS);
            setCell(Math.floor(ease(p) * S.spin));
            if(p < 1) _raf = requestAnimationFrame(tick);
          };
          _raf = requestAnimationFrame(tick);
          setTimeout(finish, TRAIN_TRAVEL_MS);
        }
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
    /* THE PROMPT MUST NOT TALK OVER THE TRAIN. The train takes 3.4s to pull in, with a whistle
       and a chug bed under it, and every module used to fire its prompt VO at mount — so the
       child heard the instruction under a moving train on all seven train screens. The SME's own
       ordering is explicit: "Train comes through animation from right to left. Train stops at the
       centre of the screen." and only then "VO: जिस डिब्बे में …". `whenParked` is the gate; the
       sibling does the same thing through state.promptGate. */
    let parked = false, waiting = [];
    /* THE EPOCH HAS TO BE CAPTURED HERE, NOT INSIDE say(). A deferred callback — whenParked, a
       setTimeout, anything that runs later — calls say() fresh, and say() reads the epoch at CALL
       time, which by then is the NEW screen's. So the previous slide's held prompt sailed through
       the guard and spoke over the next screen: measured, T1's pair chain landing on top of T3.
       Capturing the mount's epoch and checking it before running the callback closes that. */
    const myGen = _voGen;
    state.trainDepart = null;          /* [r26] cleared per mount; set once the train exists */
    const tc = TrainChrome.mount(host, {
      coaches: n,
      coach_label: (opts.labels || []).map(h => (h == null || h === "") ? null : { html: h }),
      coach_body:  (opts.bodies || []).map(h => ({ html: h || "" })),
      drop_zone:   !!opts.dropZone,
      multi:       !!opts.multi,
      maxH:        opts.maxH || 270,
      on_enter:    ()=>{ parked = true;
                         const q = waiting; waiting = [];
                         q.forEach(fn => fn());
                         if(typeof opts.on_enter === "function") opts.on_enter(); }
    });
    const coaches = tc.coachEls.map((el, i) => {
      const body = tc.body(i);
      body.classList.add("tr-body");          /* makeDraggable hit-tests this */
      body.dataset.idx = String(i);
      return { el, body: tc.faceEls[i], zone: body, label: tc.labelEls[i] };
    });
    /* [r26] the engine drives the departure through this, without knowing about trains */
    state.trainDepart = (done)=> tc.depart(done);
    return {
      wrap: tc.shell, rail: tc.rail, coaches, chrome: tc,
      /* run `fn` once the train has stopped — immediately if it already has, and never at all
         if the screen has moved on in the meantime */
      whenParked(fn){ const run = ()=>{ if(myGen !== _voGen) return; fn(); };
                      if(parked) run(); else waiting.push(run); },
      /* [28f] THE GUIDING HAND IS PHASE-GATED and handOnAnswer() is the one place that can
         enforce it: tutorial and guided get the hand, practice gets the coach glow only. */
      nudge(i, slide){ const c = coaches[i]; if(!c) return;
        c.el.classList.add("is-nudge");
        if(typeof handOnAnswer === "function") handOnAnswer(c.el, slide);
      },
      /* [r25] THE HAND SHOWS THE MOVE, not just the destination.
         Yasir: "in case of 2nd wrong attempt you are showing hand nudge but I want to show the
         animation how to drag and drop using hand nudge." A hand parked on the right cart says
         WHICH one but never says that the card has to be carried there - which, on a drag screen,
         is the whole gesture the child is being asked to make.
         travelNudge already exists in the engine for exactly this ([28o], written for the
         matching mechanics) and loops the hand from the tile to its target; the train screens
         simply never called it. `dest` lets WORD_BUILD point at its blank rather than the whole
         panel. Falls back to the static point wherever the hand cannot travel. */
      nudgeTo(i, fromEl, slide, dest){ const c = coaches[i]; if(!c) return;
        c.el.classList.add("is-nudge");
        const to = dest || c.body.querySelector(".coach-face") || c.body;
        if(fromEl && typeof travelNudge === "function") travelNudge(fromEl, to, slide);
        else if(typeof handOnAnswer === "function") handOnAnswer(c.el, slide);
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
      /* [r26] Registered here rather than in each mechanic: buildTrain is the one place every
         train screen passes through, so TRAIN_TAP, TRAIN_SORT and WORD_BUILD all get the
         departure without knowing it exists - the same reasoning that put the painted train
         behind this adapter. A screen with no train simply never sets it, and the engine falls
         back to advancing without one. */
      depart(done){ tc.depart(done); },
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
      newVoEpoch();          /* any chain still running from a previous mount is now stale */
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

      /* [r19/r20] "if user tap on incorrect cart then that cart will wiggle and if he does
         mistake 2 times then hand nudge appears on the correct option and that particular cart
         will be disabled." The hand was already here; the wiggle was here in name only (see
         [r20] in the stylesheet); the disable is below, and applies to that cart alone. */
      train.coaches.forEach((c, i) => {
        c.el.classList.add("is-tappable");
        /* the press colour, mirrored onto a class because :active does not survive a finger */
        c.el.addEventListener("pointerdown", ()=>{
          if(state.locked || isPlaying) return;
          c.el.classList.add("is-press");
        });
        ["pointerup", "pointercancel", "pointerleave"].forEach(ev =>
          c.el.addEventListener(ev, ()=> c.el.classList.remove("is-press")));
        c.el.onclick = ()=>{
          c.el.classList.remove("is-press");
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
            /* [r20] ONLY THE CART JUST TAPPED. r19 retired every cart tried so far, which on a
               three-cart screen left the answer as the only thing still alive - it removed the
               choice instead of narrowing it. Yasir: "do not disable both the cart, disable only
               the cart on which we tap on last." The first miss stays live; the hand does the
               pointing. */
            if(wrong(i) >= 2){
              c.el.classList.remove("is-press", "is-tappable");
              c.el.classList.add("is-out");
              c.el.onclick = null;
            }
          }
        };
      });
      /* instruction is VOICE only — the SME asks for no on-screen text on every test screen,
         and it waits for the train to stop so it is never spoken under the arrival. */
      train.whenParked(()=> say(A(slide, "prompt"), ()=>{}));
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
      newVoEpoch();          /* any chain still running from a previous mount is now stale */
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
            /* [r27] LEAVE A SHADOW WHERE THE CARD WAS - AND MEASURE IT FIRST. Moving the tile
               into the cart takes it out of the tray's flex row, so the cards after it slid left:
               the row reshuffled under the child's finger on every drop and nothing showed which
               had already gone. An empty box of the card's own footprint holds the gap open.
               It has to be measured BEFORE `snapped` is added - that class resizes the card to
               its in-cart size (112x124 -> 86x103), so measuring after leaves a shadow smaller
               than the card that cast it and the row still moves.
               offsetWidth/offsetHeight, not a client rect: the stage carries a --scale transform,
               so a rect would be screen px and the box would be wrong on any non-1:1 display. */
            if(!tile._ghost && tile.parentNode){
              const g = document.createElement("div");
              g.className = "tr-ghost";
              g.style.width  = tile.offsetWidth + "px";
              g.style.height = tile.offsetHeight + "px";
              tile.parentNode.insertBefore(g, tile);
              tile._ghost = g;
            }
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
            /* [r23] THE CART IS CARRYING SOMETHING NOW, so the empty-tray chrome comes off it -
               see .coach-body.dropzone.tr-has-card in the stylesheet. */
            body.classList.add("tr-has-card");
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
                  /* [r25] from the card the child is holding to the cart it belongs in */
                  ()=> train.nudgeTo(binIdx(tile.dataset.bin), tile, slide));
            }
          }
        }, { onPick: ()=>{ if(typeof sfxTap === "function") sfxTap(); } });
      });

      /* prompt first, then each card speaks itself, then the tray unlocks — the same
         listen-before-you-act contract sortSeqReveal gives the stock sort. */
      state.revealing = true;
      [...tray.children].forEach(t => t.classList.add("tr-seq-hidden"));
      train.whenParked(()=> say(A(slide, "prompt"), ()=>{
        const tiles = [...tray.children];
        let i = 0;
        (function step(){
          if(i >= tiles.length){ state.revealing = false; return; }
          const t = tiles[i++]; t.classList.remove("tr-seq-hidden");
          say(clip(t.dataset.audio),
              ()=> setTimeout(step, 160));
        })();
      }));
      setTimeout(()=>{ state.revealing = false;
        [...tray.children].forEach(t => t.classList.remove("tr-seq-hidden")); }, 20000);
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
      newVoEpoch();          /* any chain still running from a previous mount is now stale */
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
  /* «पल → प + ◌ु = पु → पुल» — the transformation teach, ported from HI02H11_L02_S01's page 2.
     Yasir: "page2 of my previous file is exactly same as page2 of my current file (just element,
     images changes rest animation, its flow it same) so try to match exactly with that file."

     So the STAGING is the sibling's, step for step: three panels revealed in turn, the consonant
     lighting inside the base word, the matra FLYING into the equation slot and handing over to
     it with a cross-fade, the syllable dissolving up while the equation gives a small nod, the
     result panel arriving, the matra pulsing inside the finished word, and the three-sound
     contrast pulsing the equation. The previous build did all of this as four nested say()
     callbacks with hard class swaps — same beats, none of the motion.

     TWO THINGS ARE DELIBERATELY NOT THE SIBLING'S, and both are forced by the matra:

     1. THE HIGHLIGHT. The sibling paints its matra with `_matraWordSVG`, which clips by COLUMN —
        an x-range over the full height. That works for ा / ि / ी, which are SPACING marks with
        an advance of their own. ु and ू have NO advance: they hang under the consonant, so the
        consonant's advance and the cluster's advance are the same number and the column comes
        out zero-width. This lesson's `matraHL` exists for exactly that — a 2-D clip, the
        cluster's x-range intersected with the below-baseline band. Using the sibling's helper
        here would silently paint nothing, or paint the next letter.
     2. THE DIRECTION OF TRAVEL. The sibling sends ा / ी in from the RIGHT and ि from the LEFT,
        because that is where those marks live. ु lives UNDERNEATH, and the note says so: "The ु
        मात्रा should softly pop/slide into its correct position below प." `data.travel` carries
        it, so the flight is vertical here and the keyframes take both axes.

     SFX are the note's three, and only those three: a soft pop as the matra arrives, a light
     chime as प becomes पु, a small success sound as पुल completes. The sibling also chimes when
     the consonant lights; the note lists three and asks to "keep SFX subtle so the pronunciation
     remains clear", so that fourth one is left out. */
  SlideModules.MATRA_BUILD = {
    mount(host, slide){
      const d = slide.data || {};
      newVoEpoch();
      if(d.no_heading){ const _st = document.getElementById("stage"); if(_st) _st.classList.add("no-band"); }

      const row = document.createElement("div"); row.className = "mb-row";

      /* --- panel 1: the base word ------------------------------------------------------
         पल / फल are bare consonant pairs with no combining marks, so splitting them per
         character is safe — there is no cluster for the browser to shape. NEVER do this to a
         word that carries a matra; that is what panel 3 is careful about. */
      /* [r18] hidden until the opening line has played — see step 2 */
      const p1 = document.createElement("div"); p1.className = "mb-panel mb-p1 mb-hidden";
      const baseChars = [...(d.base_word || "")].map(ch =>
        '<span class="mb-c" data-ch="' + ch + '">' + ch + "</span>").join("");
      p1.innerHTML = '<div class="mb-word">' + baseChars + "</div>" +
                     '<div class="mb-pic">' +
                       ((d.base_img || d.base_emoji)
                         ? imgOrEmoji(d.base_img, d.base_emoji, "mb-img", "mb-emoji") : "") +
                     "</div>";
      row.appendChild(p1);

      const a1 = document.createElement("div");
      a1.className = "mb-arrow mb-panel mb-hidden"; a1.textContent = "→";
      row.appendChild(a1);

      /* --- panel 2: the equation  consonant + matra = syllable -------------------------- */
      /* ONE DOTTED CIRCLE, NOT TWO. This was '<span class=mb-dot>◌</span><span
         class=mb-mk>ु</span>' - two spans so the placeholder could be greyed and the matra
         coloured. But ु is a COMBINING mark: alone in its own span it has no base to attach to,
         so the renderer supplies a dotted circle OF ITS OWN. The result was the grey ◌ we asked
         for, followed by a second, orange one carrying the matra.
         One span, one cluster, one circle - and the colouring is done by matraHL, which clips the
         below-baseline band and so paints the matra while leaving the placeholder alone. That is
         also what the note asks for: "highlight only matra not any other letter". */
      const chip = matraGlyph(d.matra || "");
      const p2 = document.createElement("div"); p2.className = "mb-panel mb-p2 mb-hidden";
      p2.innerHTML =
        '<div class="mb-eq"><div class="mb-eq-line">' +
          '<span class="mb-cons ink-glyph">' + (d.consonant || "") + "</span>" +
          '<span class="mb-op">+</span>' +
          '<span class="mb-m mb-slot"></span>' +
          '<span class="mb-op">=</span>' +
          '<span class="mb-syl ink-glyph"></span>' +
        "</div></div>";
      row.appendChild(p2);

      const a2 = document.createElement("div");
      a2.className = "mb-arrow mb-panel mb-hidden"; a2.textContent = "→";
      row.appendChild(a2);

      /* --- panel 3: the finished word + its picture ------------------------------------- */
      const p3 = document.createElement("div"); p3.className = "mb-panel mb-p3 mb-hidden";
      p3.innerHTML = '<div class="mb-word"><span class="mb-result ink-glyph">' +
                       (d.result_word || "") + "</span></div>" +
                     '<div class="mb-pic">' +
                       imgOrEmoji(d.result_img, d.result_emoji, "mb-img", "mb-emoji") + "</div>";
      row.appendChild(p3);

      host.appendChild(row);

      const consEl = p1.querySelector('.mb-c[data-ch="' + (d.consonant || "") + '"]');
      const slot   = p2.querySelector(".mb-slot");
      const sylEl  = p2.querySelector(".mb-syl");
      const resEl  = p3.querySelector(".mb-result");
      const show   = (el)=>{ el.classList.remove("mb-hidden"); el.classList.remove("mb-in");
                             void el.offsetWidth; el.classList.add("mb-in"); };

      state.ownsAudio = true; state.demoRunning = true;
      if(typeof setSwMood === "function") setSwMood("teach");
      setNavActive(false);
      state.replayAudio = null;

      /* PAINT THE SETTLED STATE AT MOUNT TOO. Live, panels 2 and 3 are `mb-hidden` until the
         chain reveals them, so the child never sees the highlight early. But the review capture
         strips the staging classes and freezes before any audio runs, so a highlight applied
         only in a callback photographs missing — which is how the round-3b deck shipped «पुल»
         with no orange ु while the running game coloured it. matraHL is idempotent. */
      matraHLSoon(resEl, d.matra, { glow:true });

      let finished = false;
      const finish = ()=>{
        if(finished) return; finished = true;
        state.demoRunning = false;
        [p1, a1, p2, a2, p3].forEach(e => e.classList.remove("mb-hidden"));
        if(consEl) consEl.classList.add("lit");
        slot.innerHTML = chip;
        slot.classList.remove("mb-slot-wait"); slot.classList.add("mb-slot-in");
        sylEl.textContent = d.syllable || "";
        matraHLSoon(sylEl, d.matra, { glow:true });
        matraHLSoon(resEl, d.matra, { glow:true });
        state.replayAudio = ()=> sayAll(
          [A(slide,"base"), A(slide,"onset"), A(slide,"result"), A(slide,"sounds")].filter(Boolean), ()=>{});
        $("navBtn").onclick = ()=> completeSlide(true);
        setNavActive(true);
      };

      /* Each step waits for the PREVIOUS CLIP TO END and then holds a short beat — the note asks
         for "a short pause between each sound so the child can hear how the sound changes". */
      const steps = [
        // 1 · «आइए, देखें कि छोटी उ की मात्रा लगने से शब्द की आवाज़ कैसे बदलती है।»
        (next)=> say(A(slide, "prompt"), ()=> setTimeout(next, 420)),
        // 2 · «यह शब्द देखिए — पल।»
        /* [r18] पल AND ITS PICTURE arrive first, and only then the line that names them.
           They were on screen from mount, so «आइए, देखें कि …» played over a screen with
           nothing left to reveal — the same fault as page 3, and why that line read as absent. */
        (next)=>{ show(p1); sfxPopSoft();
                  setTimeout(()=> say(A(slide, "base"), ()=> setTimeout(next, 520)), 260); },
        // 3 · the consonant lights inside the base word ("Highlight प")
        (next)=>{ if(consEl) consEl.classList.add("lit"); setTimeout(next, 620); },
        /* 4 · the matra flies to its place BELOW the consonant and hands over to the slot.
           It is parked over the slot's MEASURED centre first and the keyframes then describe
           only the travel, so it lands where the slot actually is. offsetLeft/offsetTop, never
           getBoundingClientRect: the stage carries a --scale transform, so rects come back in
           screen px while style.left is written in CSS px. */
        (next)=>{
          show(a1); show(p2);
          const eq = p2.querySelector(".mb-eq");
          /* fill the slot NOW but hold it invisible, so the equation's layout is already final
             when the flier is parked — otherwise the slot grows as it fills and the matra lands
             a few px off the mark it was aimed at */
          slot.innerHTML = chip;
          slot.classList.add("mb-slot-wait");
          const fly = document.createElement("span");
          fly.className = "mb-fly"; fly.innerHTML = chip;
          eq.appendChild(fly);
          requestAnimationFrame(()=>{
            fly.style.left = (slot.offsetLeft + (slot.offsetWidth  - fly.offsetWidth)  / 2) + "px";
            fly.style.top  = (slot.offsetTop  + (slot.offsetHeight - fly.offsetHeight) / 2) + "px";
            /* ु and ू hang UNDER the consonant, so they arrive from below — the note's own
               words. A side entry is for the spacing matras the sibling teaches. */
            const down = (d.travel || "down") === "down";
            fly.style.setProperty("--mb-fx", down ? "0px"
              : (RIGHT_SPACING_MATRAS.has(d.matra) ? "118px" : "-118px"));
            fly.style.setProperty("--mb-fy", down ? "96px" : "-38px");
            fly.classList.add("mb-fly-go");
            sfxPopSoft();                    // note: "a soft pop when ु appears"
          });
          setTimeout(()=>{                   // cross-fade: the slot fades up as the flier fades out
            slot.classList.remove("mb-slot-wait");
            slot.classList.add("mb-slot-in");
            fly.classList.add("mb-fly-done");
            setTimeout(()=> fly.remove(), 300);
            say(A(slide, "matra_name"), ()=> setTimeout(next, 300));
          }, 760);
        },
        /* 5 · प becomes पु. A bare textContent swap made the old glyph vanish and the new one
           appear between two frames; it dissolves up now, and the equation gives a small nod so
           the eye follows the change. */
        (next)=>{
          /* [r18] प BECOMES पु ON THE WORDS THAT SAY SO — the clip starts first and the
             syllable forms at «बनता», instead of being written and then described. */
          const eq = p2.querySelector(".mb-eq");
          const _formSyl = ()=>{
            sylEl.textContent = d.syllable || "";
            sylEl.classList.remove("mb-syl-in"); void sylEl.offsetWidth; sylEl.classList.add("mb-syl-in");
            matraHLSoon(sylEl, d.matra, { glow:true });
            if(eq){ eq.classList.remove("mb-settle"); void eq.offsetWidth; eq.classList.add("mb-settle"); }
          };
          const _t1 = setTimeout(()=>{
            if(CARD.slides[state.idx] !== slide || myGen !== _voGen) return;
            _formSyl();
            sfxSparkle();                    // note: "a light chime when प changes to पु"
          }, Math.max(0, d.syl_ms || 340));
          say(A(slide, "onset"), ()=>{ clearTimeout(_t1);
            if(CARD.slides[state.idx] !== slide || myGen !== _voGen) return;
            _formSyl();                      // never leave the equation half written
            setTimeout(next, 560); });
        },
        // 6 · ल joins, the finished word and its bridge picture arrive
        /* [r18] ल JOINS ON «जुड़ने», inside its own line — the finished word and its picture
           used to arrive a whole step BEFORE the sentence that announces them. */
        (next)=>{
          const _t2 = setTimeout(()=>{
            if(CARD.slides[state.idx] !== slide || myGen !== _voGen) return;
            show(a2); show(p3);
            if(typeof sfxCorrect === "function") sfxCorrect();   // "a small success sound"
            matraHLSoon(resEl, d.matra, { glow:true, pulse:true });
          }, Math.max(0, d.join_ms || 320));
          say(A(slide, "result"), ()=>{ clearTimeout(_t2);
            if(CARD.slides[state.idx] !== slide || myGen !== _voGen) return;
            [a2, p3].forEach(e => e.classList.remove("mb-hidden"));
            matraHLSoon(resEl, d.matra, { glow:true });
            setTimeout(next, 420); });
        },
        /* 7 · the matra is highlighted inside the finished word while that word is spoken —
           «अब 'ल' जुड़ने पर 'पुल' बनता है।» The note: "In पुल, highlight the ु मात्रा again so
           the child clearly notices where the matra is placed." */

        /* 8 · the three sounds contrasted — «प। पु। पुल।» One clip, because three clips back to
           back lose the deliberate pause the note asks for. */
        (next)=>{ const src = A(slide, "sounds");
                  if(!src){ next(); return; }
                  const eq = p2.querySelector(".mb-eq");
                  /* EACH SOUND LIFTS THE THING IT IS. «प» -> the consonant in पल, «पु» -> the
                     equation's syllable, «पुल» -> the finished word. `sound_ms` is measured at
                     build time from the SILENCE BETWEEN THE SOUNDS in this very clip, so the
                     three cues follow a re-record instead of drifting off it. With no cues
                     (an older card, or a clip that would not segment) the equation glows once,
                     as it used to - a weaker beat, never a wrong one. */
                  const cues = d.sound_ms, marks = [consEl, sylEl, resEl];
                  const timers = [];
                  if(cues && cues.length === 3){
                    cues.forEach((ms, i)=>{
                      const el = marks[i];
                      if(!el) return;
                      timers.push(setTimeout(()=>{
                        if(CARD.slides[state.idx] !== slide || myGen !== _voGen) return;
                        marks.forEach(m => m && m.classList.remove("mb-now"));
                        void el.offsetWidth; el.classList.add("mb-now");
                      }, Math.max(0, ms)));
                    });
                  } else if(eq){ eq.classList.add("mb-say"); }
                  say(src, ()=>{ timers.forEach(clearTimeout);
                                 marks.forEach(m => m && m.classList.remove("mb-now"));
                                 if(eq) eq.classList.remove("mb-say");
                                 setTimeout(next, 300); }); }
      ];

      let si = 0;
      const myGen = _voGen;
      const run = ()=>{
        if(CARD.slides[state.idx] !== slide) return;   // navigated away -> abort
        if(myGen !== _voGen) return;                   // a newer mount owns the audio now
        if(si >= steps.length){ finish(); return; }
        steps[si++](run);
      };
      setTimeout(run, 380);
      /* FAIL-SAFE: आगे never stays dead if a clip blocks or is missing */
      setTimeout(()=>{ if(CARD.slides[state.idx] === slide) finish(); }, 46000);
    }
  };

  /* ================================================================ 5 · MEET_PAIR */
  /* «गुड़» then «धनुष» — two example words, one at a time, ported from the sibling's page 3
     (MEET_EXAMPLES). Yasir: "page3 of my previous file is exactly same as page3 of my current
     file (just element, images changes rest animation, its flow it same)."

     THE ORDER WAS INVERTED BEFORE THIS. The note's sequence is: word appears · image appears ·
     the matra is highlighted — and only around that does the line play. The previous build spoke
     the whole line FIRST and revealed the picture and the highlight on its callback, so the child
     heard «इसमें ग पर छोटी उ की मात्रा लगी है» while nothing on screen had changed yet, and the
     mark lit up after the sentence naming it had finished. Now it is the sibling's staging:
        word + pop → 520ms → picture fades in + pop → 380ms → matra lights + chime, THEN the line.

     The «इस शब्द की मात्रा — ◌ु» callout is gone. It was already display:none from an earlier
     round (the mark is highlighted inside the word now, so the callout was saying twice what the
     word shows once), and the guiding hand that used to point at it went with it — it was
     pointing at an invisible element, and the sibling's page 3 has no hand either.

     data: { examples:[{word, matra, img, emoji, audio_line, matra_audio}] } */
  SlideModules.MEET_PAIR = {
    mount(host, slide){
      const d = slide.data || {};
      const exs = d.examples || [];
      newVoEpoch();
      if(d.no_heading){ const _st = document.getElementById("stage"); if(_st) _st.classList.add("no-band"); }

      /* [r14] THE SIBLING'S OWN MARKUP, not a look-alike. `.meet-col / .meet-stage /
         .meet-letter-box / .meet-pic-box / .pic-img` are SHARED-ENGINE classes and their CSS is
         byte-identical in both builds - so rendering into them reproduces the sibling's page 3
         exactly: 120px navy word in a 300-420x340 cream card, a 320x340 picture card beside it,
         80px apart. The previous `.mp-card` markup was this lesson's own invention and measured
         80px/146px against the sibling's 120px/219px, which is what Yasir was seeing. */
      const col = document.createElement("div"); col.className = "meet-col mex-col";
      const wrap = document.createElement("div"); wrap.className = "meet-stage";
      col.appendChild(wrap);
      host.appendChild(col);

      state.ownsAudio = true; state.demoRunning = true;
      if(typeof setSwMood === "function") setSwMood("teach");
      setNavActive(false);
      state.replayAudio = null;

      /* one example, staged: the word is there, the picture is held back a beat */
      const render = (ex)=>{
        wrap.innerHTML =
          '<div class="meet-letter-box">' +
            '<span class="glyph ink-glyph mp-word" style="font-size:120px">' + ex.word + "</span>" +
          "</div>" +
          '<div class="meet-pic-box mex-pic mp-wait">' +
            imgOrEmoji(ex.img, ex.emoji, "pic-img", "pic-emoji") + "</div>";
        return { card: wrap.querySelector(".meet-letter-box"),
                 word: wrap.querySelector(".mp-word"),
                 pic:  wrap.querySelector(".mex-pic") };
      };

      const myGen = _voGen;
      let i = 0, finished = false;
      const finish = ()=>{
        if(finished) return; finished = true;
        state.demoRunning = false;
        state.replayAudio = ()=> sayAll(
          [A(slide, "prompt")].concat(exs.map(e => clip(e.audio_line))).filter(Boolean), ()=>{});
        $("navBtn").onclick = ()=> completeSlide(true);
        setNavActive(true);
      };

      const runOne = (after)=>{
        const ex = exs[i];
        if(!ex){ after(); return; }
        const { card, word, pic } = render(ex);

        /* [r15] THE VOICE DRIVES THE PICTURE AND THE GLOW, not a pair of fixed delays.
           Before this the word, the picture and the mark all arrived inside ~950ms and THEN the
           3.4s line played over a screen that had already finished moving - measured: pop at
           7060ms, picture at 7588ms, glow and clip together at 8012ms. Nothing on screen
           corresponded to what was being said, which is what "animation must sync with VO" is
           about. The line's three clauses each own their beat now:
               «गुड़,»                -> the word (already up; the clip opens by naming it)
               «बोलकर देखिए।»         -> the picture arrives
               «इसमें ग पर … लगी है।»  -> the mark lights
           `pic_ms` and `matra_ms` are measured off each clip at BUILD time, so they follow a
           re-record rather than drifting away from it. The old fixed delays remain as fallbacks
           for a card that predates them. */
        const alive = ()=> CARD.slides[state.idx] === slide && myGen === _voGen;
        const timers = [];

        /* 1 · the word arrives */
        card.classList.remove("mp-in"); void card.offsetWidth; card.classList.add("mp-in");
        sfxPopSoft();                         // note: "soft pop sound when word/image appears"

        /* 2 · a short beat, then the line starts and carries the rest */
        timers.push(setTimeout(()=>{
          if(!alive()) return;
          timers.push(setTimeout(()=>{        // 3 · «बोलकर देखिए।» -> the picture
            if(!alive()) return;
            pic.classList.remove("mp-wait");
            sfxPopSoft();
          }, Math.max(0, ex.pic_ms || 520)));
          timers.push(setTimeout(()=>{        // 4 · «इसमें … मात्रा लगी है।» -> the mark
            if(!alive()) return;
            pic.classList.remove("mp-wait");   // never strand it if the cue overran the clip
            matraHLSoon(word, ex.matra, { glow:true, pulse:true });
            sfxSparkle();                     // note: "soft highlight chime when matra glows"
          }, Math.max(0, ex.matra_ms || 900)));
          say(clip(ex.audio_line), ()=>{
            timers.forEach(clearTimeout);
            if(!alive()) return;
            /* whatever the cues did, the example ends fully shown */
            pic.classList.remove("mp-wait");
            matraHLSoon(word, ex.matra, { glow:true });
            word.classList.remove("mh-pulse");
            sayOpt(clip(ex.matra_audio), ()=> setTimeout(after, 520));
          });
        }, 260));
      };

      const step = ()=>{
        if(CARD.slides[state.idx] !== slide) return;   // navigated away -> abort
        if(myGen !== _voGen) return;                   // a newer mount owns the audio
        if(i >= exs.length){ finish(); return; }
        runOne(()=>{ i++; step(); });
      };

      /* [r16] THE STAGE STAYS EMPTY WHILE THE OPENING LINE PLAYS. It used to paint example 1
         at mount so a frozen capture would never catch a blank slide - but that put गुड़ on
         screen at 48ms, while «आइए, छोटी उ की मात्रा वाले कुछ शब्द देखें।» was still
         being spoken. The line then had no beat of its own: nothing happened while it played and
         the word was already there when it finished, which is why it read as missing.
         The note's order is explicit - the VO plays, THEN गुड़ appears. The capture is safe
         without the early paint: that harness stubs play() to 15ms, so the chain has rendered the
         first example long before the shot is taken. */

      // «आइए, छोटी उ की मात्रा वाले कुछ शब्द देखें।» then the examples, one by one
      say(A(slide, "prompt"), ()=> setTimeout(step, 320));
      /* FAIL-SAFE: आगे never stays dead if a clip blocks or is missing */
      setTimeout(()=>{ if(CARD.slides[state.idx] === slide) finish(); }, 42000);
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
      newVoEpoch();          /* any chain still running from a previous mount is now stale */
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
      newVoEpoch();          /* any chain still running from a previous mount is now stale */
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

      /* WITHIN EACH PAIR THE TWO GLYPHS ARRIVE SEPARATELY. The SME's animation note is explicit:
         "First उ appears, then ु appears beside it with a soft glow. After that, both can fade
         slightly / dim softly. Then ऊ appears, and ू appears beside it." Until now both glyphs
         were painted together and only the PAIR sequenced, so the one thing the screen exists to
         teach — that this letter owns this mark — was never actually shown happening.

         SETTLED BY DEFAULT, held back live. The hold class is named `mi-seq-hidden` on purpose:
         this bundle's capture settler strips anything ending in `seq-hidden`, so a frozen review
         capture still photographs the finished screen instead of two empty coaches. */
      const parts = train.coaches.map(c => ({
        letter: c.body.querySelector(".mi-letter"),
        arrow:  c.body.querySelector(".mi-arrow"),
        matra:  c.body.querySelector(".mi-matra")
      }));
      const reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion:reduce)").matches);
      const showAll = ()=> parts.forEach(pt => [pt.letter, pt.arrow, pt.matra]
        .forEach(e => e && e.classList.remove("mi-seq-hidden")));
      if(!reduced) parts.forEach(pt => [pt.letter, pt.arrow, pt.matra]
        .forEach(e => e && e.classList.add("mi-seq-hidden")));

      const done = ()=>{
        state.demoRunning = false;
        pairs.forEach(p => p.classList.remove("is-dim"));
        showAll();                       /* nothing may be left invisible once the beat is over */
        state.replayAudio = ()=> sayAll(d.pairs.map(p => clip(p.audio)), ()=>{});
        $("navBtn").onclick = ()=> completeSlide(true);
        setNavActive(true);
      };
      let i = 0;
      const step = ()=>{
        if(i >= pairs.length){ done(); return; }
        const k = i++;
        const pt = parts[k];
        /* "Keep only one pair active at a time" · "Each active pair should light up when its VO
           plays" — the pair before this one dims rather than disappearing. */
        pairs.forEach((p, n) => p.classList.toggle("is-dim", n !== k));
        pairs[k].classList.add("is-on");
        /* the letter lands with «यह है उ», … */
        if(pt.letter){ pt.letter.classList.remove("mi-seq-hidden"); pt.letter.classList.add("mi-pop"); }
        /* … and the matra beside it a beat later, on «इसकी मात्रा है — ु», with the soft glow and
           the chime the note asks for. 1500ms is roughly where that half of the line starts in a
           ~4s clip; it is a beat, not a claim of lip-sync. */
        setTimeout(()=>{
          if(!pt.matra || !pt.matra.isConnected) return;
          if(pt.arrow){ pt.arrow.classList.remove("mi-seq-hidden"); pt.arrow.classList.add("mi-pop"); }
          pt.matra.classList.remove("mi-seq-hidden");
          pt.matra.classList.add("mi-pop", "mi-glow");
          sfxPopSoft();                  /* SME: "a soft pop / chime when each MATRA symbol appears" */
        }, 1500);
        say(clip(d.pairs[k].audio), ()=> setTimeout(step, 320));
      };
      /* `instruction` is optional in round 3 — the SME's VO list for this screen is the intro
         line and then the two pair lines, nothing between them. */
      train.whenParked(()=> say(A(slide, "prompt"), ()=> sayOpt(A(slide, "instruction"), step)));
      /* never strand the slide, and never leave a glyph hidden if the chain stalls */
      setTimeout(()=>{ if(state.demoRunning) done(); else showAll(); }, 30000);
    }
  };


  /* ================================================================ 12 · MATRA_PAIRS */
  /* PORTED FROM HI02H11_L02_S01, which built this exact screen for आ/इ/ई. The SME's page-1 note
     is the same note in both decks, and the sibling's reading of it is the one to match:

       "First उ appears, THEN ु appears beside it with a soft glow."
       "After that, both can fade slightly / dim softly. Then ऊ appears, and ू appears beside it."
       "Use a simple pop / fade animation." · "Do not add extra decorative elements."

     So NOTHING is on screen at mount; a pair arrives only when its turn comes; inside a pair the
     LETTER lands first and the matra follows beside it; and a pair already taught stays FADED
     rather than being restored to full — the note never asks for that.

     NO CARD, NO BOGIE, NO HEADING. The sibling's own comment records why the card chrome went:
     it was "exactly the 'extra decorative element' the note rules out". The train belongs to the
     screens that need coaches to sort into; page 1 is two glyphs and a relationship between them.

     NO `.ink-glyph` ON THESE SPANS, deliberately, and this is the sibling's measurement: the
     engine's centerInkGlyph() squares up the ink BOUNDING BOX, which translated the letter ~2.5px
     but the matra ~13.3px, so the two never shared a baseline. Plain baseline alignment puts the
     letter and its dotted circle on one line. */
  SlideModules.MATRA_PAIRS = {
    mount(host, slide){
      newVoEpoch();
      const d = slide.data || {};
      const pairs = d.pairs || [];
      /* the SME asks for no heading on this screen; the band is hidden per-slide rather than
         globally, so an ACCIDENTALLY empty heading anywhere else still fails the build */
      if(d.no_heading){ const st = document.getElementById("stage");
        if(st){ st.classList.add("no-band");
                /* r7: this screen is two cards and a lot of air, so it centres on the
                   MAIN BOX rather than on the content box the nav-button clearance
                   leaves behind. Scoped to a class this module owns and newVoEpoch
                   drops, so no other screen loses that clearance. */
                st.classList.add("mp-center"); } }

      const row = document.createElement("div"); row.className = "mp-row";
      const els = pairs.map(p => {
        const el = document.createElement("div"); el.className = "mp-pair";
        el.innerHTML = '<span class="mp-letter">' + p.letter + "</span>" +
                       '<span class="mp-arrow">\u2192</span>' +
                       '<span class="mp-matra">' + matraGlyph(p.matra) + "</span>";
        row.appendChild(el);
        return el;
      });
      host.appendChild(row);

      /* "Keep the Next button disabled during the sequence. Activate it only after both pairs
         have been shown and spoken." */
      state.ownsAudio = true; state.demoRunning = true;
      if(typeof setSwMood === "function") setSwMood("teach");
      setNavActive(false);
      $("navBtn").onclick = ()=> completeSlide(true);

      let i = 0, finished = false;
      /* the deck's END STATE is the last pair still lit and the earlier one faded slightly */
      const finish = ()=>{
        if(finished) return; finished = true;
        state.demoRunning = false;
        els.forEach((e, k) => {
          e.classList.toggle("active", k === els.length - 1);
          e.classList.toggle("shown",  k !== els.length - 1);
          e.querySelectorAll(".mp-arrow, .mp-matra").forEach(x => x.classList.add("mp-in"));
          /* the glow belongs to the pair that is still lit; a faded pair must not keep it */
          const mm = e.querySelector(".mp-matra");
          if(mm) mm.classList.toggle("mp-hl", k === els.length - 1);
        });
        setNavActive(true);
      };

      const step = ()=>{
        if(CARD.slides[state.idx] !== slide) return;      // navigated away -> drop the chain
        if(i >= els.length){ finish(); return; }
        const k = i, el = els[k], p = pairs[k]; i++;
        /* a pair already taught fades; the one arriving lights up */
        els.forEach(e => { if(e !== el && e.classList.contains("active")){
          e.classList.remove("active"); e.classList.add("shown"); } });

        /* 1 · the LETTER arrives on its own */
        el.classList.add("active");
        const arrow = el.querySelector(".mp-arrow"), m = el.querySelector(".mp-matra");

        /* 2 · then the matra lands beside it with the soft glow and a subtle chime */
        setTimeout(()=>{
          if(CARD.slides[state.idx] !== slide) return;
          arrow.classList.add("mp-in");
          m.classList.remove("mp-in"); void m.offsetWidth; m.classList.add("mp-in");
          sfxPopSoft();                                    // kept subtle so the VO stays clear
          /* 3 · the pair is lit, so now its line plays — "light up when its VO plays" */
          say(clip(p.audio), ()=> setTimeout(step, 560));
          /* 4 · AND THE MATRA LIGHTS UP ON THE WORDS THAT NAME IT. The line is «यह है उ। इसकी
             मात्रा है — ु।»: the first half names the LETTER, and lighting the matra there would
             point at the wrong mark while the right one is being spoken. `cue_ms` is where
             «इसकी» starts, measured off the clip itself at build time, so the two clips (4.13s
             and 3.85s) each get their own moment rather than sharing a guess. */
          const cue = Math.max(0, p.cue_ms || 1300);
          setTimeout(()=>{
            if(CARD.slides[state.idx] !== slide) return;   // navigated away mid-line
            if(!el.classList.contains("active")) return;   // a later pair already took the light
            m.classList.add("mp-hl");
          }, cue);
        }, 480);
      };

      state.replayAudio = ()=> sayAll(
        [A(slide, "prompt")].concat(pairs.map(p => clip(p.audio))).filter(Boolean), ()=>{});
      say(A(slide, "prompt"), ()=> setTimeout(step, 350));
      /* FAIL-SAFE: आगे never stays dead if a clip blocks or is missing */
      setTimeout(()=>{ if(CARD.slides[state.idx] === slide) finish(); }, 30000);
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
      newVoEpoch();          /* any chain still running from a previous mount is now stale */
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
      newVoEpoch();          /* any chain still running from a previous mount is now stale */
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
                const bl = train.coaches[at].body.querySelector(".wb-blank");
                /* [r25] the hand carries the letter to the blank it fills. Only when there IS a
                   blank for it: a distractor completes nothing, so there the cart is glowed and
                   the hand withheld, exactly as before. */
                train.nudgeTo(at, (want >= 0 ? tile : null), slide, (want >= 0 ? bl : null));
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
      train.whenParked(()=> say(A(slide, "prompt"), ()=>{}));
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
      newVoEpoch();          /* any chain still running from a previous mount is now stale */
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

    /* r7: THE GREETING WAITS FOR THE TRAIN. It used to start at boot, i.e. under a 3.4s arrival
       with a whistle, a chug bed and two sparkles over it — the same clash this bundle fixed on
       all seven activity screens, still live on the one screen every child sees first.
       `ltReady()` is the single release point, and the backstop below fires it even if the
       arrival never completes, because a cover that never speaks is worse than one that speaks
       over itself. */
    window.__ltReady = false;
    window.__ltWaiters = [];
    function ltReady(){
      if(window.__ltReady) return;
      window.__ltReady = true;
      const q = window.__ltWaiters; window.__ltWaiters = [];
      q.forEach(fn => { try{ fn(); }catch(e){} });
    }
    window.landingTrainReady = (fn)=>{ if(window.__ltReady) fn(); else window.__ltWaiters.push(fn); };
    setTimeout(ltReady, 7000);        /* never leave the cover silent on a stalled arrival */

    const tc = TrainChrome.mount(el, {
      coaches: ms.length,
      coach_label: ms.map(()=> null),
      /* `lt-pending` holds each matra invisible until the train has parked — the SME asks for
         them "one by one" AFTER the arrival, so they land on a coach that is standing still */
      /* r7: «उ (ु)» — the letter with its matra in brackets, the same form the G4 bins use,
         so the cover names the pair exactly as the sorting screens later will. */
      coach_body: ms.map((m, i) => ({ html: '<span class="lt-matra lt-pending">' +
        ((hero.letters && hero.letters[i]) ? hero.letters[i] + ' <span class="lt-br">(' +
          matraGlyph(m) + ')</span>' : matraGlyph(m)) + "</span>" })),
      drop_zone: false,
      /* the sibling's landing train is 634px wide for a locomotive and THREE coaches, i.e. a
         per-part scale of 634/2155 = 0.294. Matching that scale rather than a width budget is
         what makes the two covers read as the same train: 0.294 * the 592px ink band = 174. */
      maxH: 174,
      on_enter: ()=>{
        const last = ms.length - 1;
        [...el.querySelectorAll(".lt-matra")].forEach((sp, i)=> setTimeout(()=>{
          sp.classList.remove("lt-pending"); sp.classList.add("lt-pop");
          sfxSparkle();                       // SME: "a light sparkle/pop SFX when each matra appears"
          /* r7: the greeting waits for THIS — the last matra has popped and its sparkle has
             sounded, so the arrival is genuinely over and nothing is left to talk over. The pop
             animation is 420ms; the clip starts once it has landed rather than on top of it. */
          if(i === last) setTimeout(ltReady, 460);
        }, 220 + i * 520));
      }
    });
    /* NEVER LEAVE THE COACHES EMPTY. The matras are revealed from on_enter, which fires when the
       train parks 3.4s in — so anything that looks at this screen earlier (a review capture, a
       slow first paint, a stalled arrival) sees two blank coaches, which is exactly what the
       round-3b review deck shipped. This is the backstop: by 5s the matras are up regardless of
       whether the arrival ever completed. */
    setTimeout(()=> [...el.querySelectorAll(".lt-matra.lt-pending")].forEach(sp =>
      sp.classList.remove("lt-pending")), 5000);
    el.classList.add("show");          // boot() only adds this for hero kinds it knows
    /* THE SIBLING'S COVER HAS NO RAIL. On the activity screens the track is the line the train
       arrives along and it reads as railway; on the cover it cut the card in half under a train
       that is really a title illustration. Marked here rather than hidden globally, because the
       activity screens still want it. */
    (tc.shell || el).classList.add("lt-cover");
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


/* ==========================================================================================
   [r5] FLN ANIMATION KIT — ported from HI02H11_L02_S01's install
   github.com/ananya-goswami/fln-animation-toolkit · Recipe 1 (start screen stars, drift) ·
   Recipe 2 (tap to burst). Classic script only, per the kit's R3. Every entry point is wrapped
   so a throw here can never strand the boot loader (R4), and every effect checks the
   reduced-motion guard as well as the CSS kill-switch (R5).
   This is the "animation in the stars and bubble" Yasir found missing on the cover.
   ========================================================================================== */

/* ===== FLN ANIMATION KIT: core BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion = window.FLNMotion || {};
  M.still = function(){
    try{ return document.documentElement.classList.contains("no-anim") ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); }
    catch(_){ return false; }
  };
  M.scale = function(){
    try{ return parseFloat(getComputedStyle(document.documentElement)
      .getPropertyValue("--scale")) || 1; }catch(_){ return 1; }
  };
  M.guard = function(fn){
    try{ fn(); }catch(e){ try{ console.warn("[animation-kit]", e && e.message); }catch(_){} }
  };
  var _actx = null;
  M.audio = function(){
    try{
      var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
      _actx = _actx || new AC();
      if(_actx.state === "suspended") _actx.resume();
      return _actx;
    }catch(_){ return null; }
  };
  M.ready = function(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  };
})();
/* ===== FLN ANIMATION KIT: core END ===== */

/* ===== FLN ANIMATION KIT: sky-drift BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;

  function build(o){
    var sky = typeof o.container === "string" ? document.querySelector(o.container) : o.container;
    if(!sky) return null;
    sky.textContent = "";
    var maxSize = 0, frag = document.createDocumentFragment();

    o.layers.forEach(function(L, li){
      for(var i = 0; i < o.lanes; i++){
        var a = ((360 / o.lanes) * i + L.rot) * Math.PI / 180;
        var cos = Math.cos(a), sin = Math.sin(a);
        var size = +((o.size[0] + Math.random() * (o.size[1] - o.size[0])) * L.scale).toFixed(2);
        if(size > maxSize) maxSize = size;
        var dur = +(o.dur[0] + Math.random() * (o.dur[1] - o.dur[0])).toFixed(1);
        var el = document.createElement("i");
        el.className = o.shapes[(i + li) % o.shapes.length];
        el.style.cssText =
          "--s:"  + size + "vmax;" +
          "--x1:" + (o.r0 * cos).toFixed(2) + "vmax;--y1:" + (o.r0 * sin).toFixed(2) + "vmax;" +
          "--x2:" + (o.r1 * cos).toFixed(2) + "vmax;--y2:" + (o.r1 * sin).toFixed(2) + "vmax;" +
          "--t:"  + dur + "s;" +
          "--d:-" + (Math.random() * dur).toFixed(1) + "s;" +     // negative = de-sync
          "--g:"  + (o.glow[0] + Math.random() * (o.glow[1] - o.glow[0])).toFixed(1) + "s;" +
          "--gd:-" + (Math.random() * 4).toFixed(1) + "s;" +
          "--o:"  + (o.opacity[0] + Math.random() * (o.opacity[1] - o.opacity[0])).toFixed(2) + ";";
        frag.appendChild(el);
      }
    });
    sky.appendChild(frag);

    // collision proof: lane arc at the tightest radius must be >= 1.5x the largest element
    var arc = (2 * Math.PI * o.r0) / o.lanes, ok = arc >= maxSize * 1.5;
    if(!ok && o.warn !== false){
      console.warn("[animation-kit] sky lanes too tight: arc " + arc.toFixed(2) +
        "vmax vs element " + maxSize.toFixed(2) + "vmax. Reduce lanes or size.");
    }
    return { arc:arc, maxSize:maxSize, safe:ok, count:sky.children.length };
  }

  M.sky = {
    defaults: {
      container:".sg-sky", lanes:29,
      layers:[{rot:0,scale:1},{rot:6.2,scale:0.62},{rot:-6.2,scale:0.55}],
      r0:22, r1:72, size:[0.8,2.6], dur:[18,34], glow:[3.0,4.8],
      opacity:[0.62,0.92], shapes:["s1","s2","s3","s4","s5"], warn:true
    },
    init: function(opts){
      var o = Object.assign({}, this.defaults, opts || {}), res = null;
      M.guard(function(){ res = build(o); });
      return res;
    }
  };
  M.ready(function(){ M.guard(function(){ if(!window.__skyManual) M.sky.init(); }); });
})();
/* ===== FLN ANIMATION KIT: sky-drift END ===== */

/* ===== FLN ANIMATION KIT: sky-burst BEGIN ===== */
(function(){ "use strict";
  var M = window.FLNMotion;

  function boom(o){                      // sine thud + noise tail + square crackles
    var actx = M.audio(); if(!actx) return;
    try{
      var t = actx.currentTime, out = actx.createGain();
      out.gain.value = o.volume; out.connect(actx.destination);

      var tg = actx.createGain();
      tg.gain.setValueAtTime(0.9, t);
      tg.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
      tg.connect(out);
      var osc = actx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.16);
      osc.connect(tg); osc.start(t); osc.stop(t + 0.18);

      var n = actx.sampleRate * 0.45;
      var buf = actx.createBuffer(1, n, actx.sampleRate), d = buf.getChannelData(0);
      for(var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6);
      var src = actx.createBufferSource(); src.buffer = buf;

      for(var c = 0; c < o.crackles; c++){
        var cg = actx.createGain(), ct = t + 0.10 + Math.random() * 0.30;
        cg.gain.setValueAtTime(0.0001, ct);
        cg.gain.exponentialRampToValueAtTime(0.18, ct + 0.006);
        cg.gain.exponentialRampToValueAtTime(0.0001, ct + 0.07);
        cg.connect(out);
        var co = actx.createOscillator();
        co.type = "square";
        co.frequency.setValueAtTime(1500 + Math.random() * 2200, ct);
        co.connect(cg); co.start(ct); co.stop(ct + 0.08);
      }
      var bp = actx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 3400; bp.Q.value = 0.8;
      var ng = actx.createGain();
      ng.gain.setValueAtTime(0.0001, t);
      ng.gain.exponentialRampToValueAtTime(0.5, t + 0.03);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      src.connect(bp); bp.connect(ng); ng.connect(out); src.start(t + 0.02);
    }catch(_){}
  }

  function pop(el, r, o){
    el.classList.add("popped");
    // respawn on the next FLIGHT lap — the glow cycle is much shorter, so filter by name
    el.addEventListener("animationiteration", function back(e){
      if(e.animationName !== "sgFly") return;
      el.classList.remove("popped");
      el.removeEventListener("animationiteration", back);
    });

    var kind = "k-dot", cls = el.classList;
    for(var ci = 0; ci < cls.length; ci++){ if(o.kind[cls[ci]]) kind = o.kind[cls[ci]]; }

    var bs = Math.max(11, r.width);
    var b = document.createElement("div");
    b.className = "sg-burst " + kind;
    b.style.left = (r.left + r.width / 2) + "px";
    b.style.top  = (r.top  + r.height / 2) + "px";
    b.style.setProperty("--bs", bs + "px");
    b.appendChild(document.createElement("div")).className = "fl";

    var k = 0;
    for(var g = 0; g < o.rings.length; g++){
      var R = o.rings[g], off = Math.random() * Math.PI * 2;
      for(var i = 0; i < R.n; i++, k++){
        var a = off + i / R.n * Math.PI * 2;
        var dist = bs * R.rad * (0.78 + Math.random() * 0.44);
        var p = document.createElement("i");
        p.style.cssText =
          "--ps:"  + (bs * R.size * (0.8 + Math.random() * 0.5)).toFixed(1) + "px;" +
          "--dx:"  + (Math.cos(a) * dist).toFixed(1) + "px;" +
          "--dy:"  + (Math.sin(a) * dist).toFixed(1) + "px;" +
          "--gy:"  + (dist * o.gravity).toFixed(1) + "px;" +
          "--sd:"  + (R.dur + Math.random() * 0.22).toFixed(2) + "s;" +
          "--sdl:" + (Math.random() * 0.06).toFixed(3) + "s;" +
          "color:" + o.hues[k % o.hues.length];
        b.appendChild(p);
      }
    }
    document.body.appendChild(b);
    if(o.sound) boom(o);
    setTimeout(function(){ b.remove(); }, o.life);
  }

  M.skyBurst = {
    defaults: {
      container:".sg-sky", when:["is-start","is-end"],
      rings:[{n:9,rad:3.1,size:.58,dur:.80},{n:7,rad:1.8,size:.78,dur:.62}],
      hues:["#FCB717","#3B7DD8","#21A74A","#E5484D","#7048D6","#F1781D"],
      kind:{s1:"k-star",s2:"k-star",s3:"k-spark",s4:"k-dot",s5:"k-dot"},
      gravity:0.42, pad:12, padRatio:0.7, minAlpha:0.08, life:1200,
      sound:true, volume:0.22, crackles:4
    },
    init: function(opts){
      var o = Object.assign({}, this.defaults, opts || {});
      M.guard(function(){
        var sky = typeof o.container === "string"
          ? document.querySelector(o.container) : o.container;
        if(!sky) return;
        // capture phase: .sg-sky is pointer-events:none, so hit-test by rect (R6)
        document.addEventListener("pointerdown", function(e){
          if(M.still()) return;
          if(!o.when.some(function(c){ return document.body.classList.contains(c); })) return;
          /* INTERACTIVE_TAPS_ARE_NOT_OURS. This handler claims the tap with preventDefault(),
             which kills the CLICK that would have followed — so a star drifting over शुरू करें
             made the button silently ignore the press. Worse, the mask that hides stars behind
             the centre card is visual only: those stars still have a box and a non-zero computed
             opacity, so the kit's minAlpha test cannot tell they are invisible, and the play
             button sits right inside that masked area. A control's tap is never ours to take. */
          if(e.target && e.target.closest &&
             e.target.closest("button,a,input,select,textarea,[role=button],[onclick]")) return;
          var els = sky.querySelectorAll("i:not(.popped)");
          for(var i = 0; i < els.length; i++){
            var el = els[i], r = el.getBoundingClientRect();
            if(r.width < 2) continue;
            var pad = Math.max(o.pad, r.width * o.padRatio);   // ~4px targets need slack
            if(e.clientX < r.left - pad || e.clientX > r.right  + pad ||
               e.clientY < r.top  - pad || e.clientY > r.bottom + pad) continue;
            if(parseFloat(getComputedStyle(el).opacity) < o.minAlpha) continue;
            // claim the tap, or it also fires the button under the star
            e.stopPropagation(); e.preventDefault();
            var op = Object.assign({}, o);
            if(typeof isMuted !== "undefined" && isMuted) op.sound = false;   // honour the dev mute
            pop(el, r, op);
            return;
          }
        }, true);
      });
    }
  };
  M.ready(function(){ M.guard(function(){ M.skyBurst.init(); }); });
})();
/* ===== FLN ANIMATION KIT: sky-burst END ===== */
