# HI02H11_L02_S02 — «मात्राओं की रेल» (उ / ऊ) · developer handoff

**Skill:** उ, ऊ मात्रा वाले शब्द पढ़ता है। शब्दों में आने वाली मात्रा पहचानता है।
*(Grade 2 Hindi FLN — Hindi_content progression.xlsx, row 56, भाग 1)*

This folder is self-contained. You do **not** need the wider SwiftPAL factory to read it, to run
the game, or to rebuild it.

---

## Status — ROUND 3 IS COMPLETE

`3_CURRENT_BUILD/` is round 3, built and fully assetted: every change in the SME's deck of
2026-09-22 is implemented, all 17 pictures are drawn and all 80 voice clips are recorded.

| | state |
|---|---|
| Card + engine changes | **done** — 18 screens; of 155 checklist rows: **150 ✅**, 3 flagged for the SME, 2 N/C, 0 pending |
| Mechanics | **driven and verified**, wrong → wrong → right, on all 11 test screens |
| Voice-over | **80/80 recorded** (Gemini TTS, voice Leda) — see Q8, which wants a human ear |
| Art | **17/17** — 13 keyed cut-outs and 4 full-bleed scenes |
| Landing train | **painted**, ported from the sibling lesson and cropped from three coaches to two |
| Asset receipt | **0 FAIL · 1 WARN** (the WARN is a standing risk, not a defect — Q6) |

**The one thing to read first is [`CHANGES.md`](CHANGES.md)** — every ask in the deck as a numbered
row, with its status and the evidence for it. It is the contract this round was built against and
the scorecard it was checked against; they are the same document on purpose.

**Five things still want the SME**, all in that file's Open questions: the WORD_BUILD distractor
(Q2), the hand on practice screens (Q3), the register split with the sibling (Q5), a punctuation
change forced by measurement (Q6), screen 14's first-person praise line (Q7), and the voice (Q8).

---

## Read in this order

1. **[`CHANGES.md`](CHANGES.md)** — the row-by-row contract and scorecard, plus the open questions.
2. **`1_SPEC/_SME_RECOMMENDATIONS_ROUND3.md`** — the SME's 17 screen recommendations **verbatim**,
   unedited. Where this and the engineering reading disagree, **this file wins**.
3. **`1_SPEC/CHANGE_REQUEST_ROUND3.md`** — the engineering reading of those notes. Written before
   the build; §7 (the guiding hand) has since been **decided** — see `CHANGES.md`.
4. **`2_MOCKUPS/`** — the SME's round-3 visual design. Three images, one of which
   (`slide15_sentence_complete_ALL_FOUR.png`) is the design for four separate screens.
5. **`3_CURRENT_BUILD/`** — open `HI02H11_L02_S02.html` over HTTP and play it. `_review_shots/`
   holds a capture of every screen if you would rather not run it.
6. **`4_ENGINE/CHANGES.md`** — what was added to the engine and, more usefully, the five engine
   behaviours that will bite you if you do not know them.

---

## What is in here

| folder | what it is |
|---|---|
| `1_SPEC/` | the round-3 change request, the verbatim recommendations, the builder, the VO list, the art brief and the asset verifier |
| `2_MOCKUPS/` | the SME's round-3 mockups, extracted from the deck |
| `3_CURRENT_BUILD/` | **the round-3 lesson** — HTML, `card.json`, assets, and `_review_shots/` |
| `4_ENGINE/` | the per-game engine copy this lesson is pinned to, its unmodified baseline, the module sources, and a written record of every change so each one is diffable |
| `5_CURRENT_BUILD_SCREENSHOTS/` | the **round-2** captures, kept as the before-picture |
| `HI02H11_L02_S02_SME_Review.pptx` | the source deck. The recommendations live in its **speaker notes** |

---

## Running it

It must be served over HTTP — opening the file directly will fail on `fetch`/audio.

```bash
cd 3_CURRENT_BUILD && python -m http.server 8901
```

Then open <http://localhost:8901/HI02H11_L02_S02.html>. Everything is relative to
`3_CURRENT_BUILD/`; nothing reaches outside the folder.

---

## Rebuilding

Data-only. There is no per-game JavaScript to write by hand:

```
1_SPEC/build_skill_HI02H11_L02_S02.py  ->  card.json  ->  injected into 4_ENGINE/lesson_template.html
                                                       ->  3_CURRENT_BUILD/HI02H11_L02_S02.html
```

```bash
PYTHONUTF8=1 python 1_SPEC/build_skill_HI02H11_L02_S02.py       # from the handoff root
```

The builder runs **ten named guards** that fail the build rather than shipping a defect, including
`guard_prompts` (round 2 shipped 14 screens with an empty heading and every other check passed),
`guard_register` (a single surviving तुम form fails the build), `guard_sentences` and
`guard_word_build`.

It also **prunes stale audio**: it compares the previous `card.json`'s `audio_text` against the new
one and deletes exactly the clips whose text changed or whose id is gone. That is what stops
`gen_tts.py` — which skips ids that already have a file — from leaving round-2 audio under round-3
text, a defect this lesson has already shipped once.

Per-game engine changes live in `4_ENGINE/`. **Never edit `factory/*/engine/*` — that is shared by
every lesson.** Never hand-edit the compiled HTML; it is generated.

> **After changing anything in `4_ENGINE/`, re-run `inject_train.py` AND then the builder.** The
> served file is generated from the template, so patching the template alone leaves the game
> running the old code. This cost a full debug cycle once already.

---

## Regenerating assets

Both need a Gemini key. `3_CURRENT_BUILD/.env` holds one and is **git-ignored**; `.env.example`
documents the variable names. The generators read the PROCESS environment, not the file:

```bash
cd 3_CURRENT_BUILD && set -a && . ./.env && set +a && export GEMINI_KEY="$GKEY"

# VOICE-OVER. gen_tts SKIPS ids that already have a file, and the builder deletes exactly the
# clips whose TEXT changed — so this re-records precisely what moved and nothing else.
# Never --force the whole card: a re-run of an unchanged clip returns a DIFFERENT take.
python <skill>/scripts/gen_tts.py card.json --voice Leda --ext ogg

# ART. `1_SPEC/_art_manifest.json` carries every prompt; `pending` is empty while all 17 exist.
# The four scn_* SCENES must NOT go through the magenta chroma key — see 1_SPEC/ART_BRIEF.md.
python <skill>/scripts/gen_objects.py assets/Images --manifest <the objects you want>

# then, always:
cd .. && PYTHONUTF8=1 python 1_SPEC/build_skill_HI02H11_L02_S02.py
cd 3_CURRENT_BUILD && PYTHONUTF8=1 python ../1_SPEC/_verify_assets.py
```

### Checking that no two clips ever sound at once

The house rule is that VO never overlaps, and nothing in the engine enforces it — each clip
exists, is the right length and plays, so every other check passes while the child hears two
voices. `1_SPEC/_verify_vo_overlap.py` instruments `play()` with the clips' real durations and
flags any pair overlapping by more than 120 ms:

```bash
PYTHONUTF8=1 python 1_SPEC/_verify_vo_overlap.py     http://localhost:8901/HI02H11_L02_S02.html 3_CURRENT_BUILD/card.json out.txt
```

Current: **0 clashes across all 18 screens.** Read the header comment before trusting a red run —
the harness can manufacture clashes of its own in two specific ways.

**Serve with a THREADED server when two browsers are running.** `python -m http.server` is
single-threaded, so a second headless browser starves the first and assets come back
`ERR_CONNECTION_REFUSED` — which reads exactly like a missing-asset bug and is not one.

### The two truncation checks, and why there are two

`_verify_assets.py` is the only thing that catches a **truncated** voice clip — one that exists, is
valid, is the right size, and stops after the first word. It now runs two independent tests:

1. **peer comparison** — group clips by text length, flag any under 55% of its group median;
2. **corpus rate** — flag any clip under 40% of the duration its character count predicts.

Test 1 alone reported a clean sweep over four clips that were all truncated: the four MEET_PAIR
lines are 54–56 characters, so they were each other's only peers, and when every member of a group
fails, the median fails with it. Test 2 caught them at once. **Keep both.**

## ⚠️ Before this ships: the bundle is 3x the delivery cap

`3_CURRENT_BUILD/` is **31 MB**. The cap is ~10 MB, and this has not been optimised — deliberately,
because the optimise step rewrites every asset and is better done once, after the SME has signed
off, than repeatedly during review.

| | size | what to do |
|---|---|---|
| `assets/Audio` | 13 MB | the clips are raw WAV inside `.ogg` containers (that is what Gemini returns, and Chromium sniffs the content so it plays). Re-encode to **Opus 32k mono** — this is where almost all the saving is |
| `assets/UI` | 6.5 MB | mostly inherited chrome the card never references (dead `sw_lg_*` stills and similar). Delete every `assets/UI` file whose basename does not appear in the built HTML |
| `_review_shots` | 8 MB | **dev-only.** Git-ignored already, and must not go in a child-facing zip |
| `assets/Images` | 2.7 MB | already trimmed — the four scenes were cropped, resized and palette-quantised 5.2 MB → 1.1 MB |

Do it on a **copy**, smoke-test that copy (serve it, sweep every slide, 0 errors) and zip that —
never the working folder. `package_bundle.py --netlify` in the revise skill does the dropping of
dev-only files (`card.json`, `*.xlsx`, `README*`, `CHANGES.md`, `_review_shots/`).

## Seven things that will cost you a day if you do not know them

Each was learned by losing that day. They are in `4_ENGINE/CHANGES.md` in full.

1. **`capture_pages.py` strips only the bare `.seq-hidden`** — not `mb-seq-hidden` or
   `tr-seq-hidden` — **and it freezes all animation**. With any clip missing, `say()` falls back to
   a 9-second timer and the reveal chain never finishes, so teach screens photograph half-painted.
   That is a capture artefact, not a render bug. Capture with a settler that strips every
   `*seq-hidden` variant.
2. **`mountSlide(i)` does not dismiss the landing.** Until शुरू करें is pressed the body keeps
   `is-start`, and `elementFromPoint` — which is how `makeDraggable` finds its drop zone — returns
   the stage instead of the coach. Taps still work, so this reads as a drag-only bug in the module
   when it is nothing of the kind. Click `#sgBtn` first.
3. **`centerInkGlyph()` vertically centres every `.ink-glyph` inside its PARENT.** Put a word in a
   tall column and the engine stamps it downward onto whatever is below — measured at 62px, which
   is how a word ended up printed through its picture. Any word in a column needs `.ink-box`.
4. **`ु` and `ू` can never be coloured by the engine's column-clip highlight.** They are below-base
   marks sharing their consonant's columns, so the clip lands on the *next* letter — `पुल` put
   11,342 red pixels on the `ल`. The working method is a 2-D clip, implemented as `matraHL()`.
   **Adding either matra to `RIGHT_SPACING_MATRAS` hard-fails the build**, because that failure is
   silent and looks like the feature working.
5. **The engine sizes EVERY `.dd-zone` at 150×150**, which beats any `min-width`. A drop zone
   inside a coach must take its width back explicitly or the word spills out of the coach.
6. **A literal closing tag inside a CSS or JS comment truncates the whole element.** The HTML
   parser does not care that it sits inside a `/* */`. One comment in `train_styles.css` mentioning
   the tag it is injected before ended the stylesheet there, and every rule after it became **text
   in the body**: the stage was shoved to `x=1797` in a 1382px viewport, `position:fixed` stopped
   applying to the new sky layers, and the start button became unclickable. **Clean build, green
   receipt, no console error** — the symptom looks nothing like the cause. `inject_train.py` now
   refuses to inject a source containing one and names the file and line.
7. **Under headless Chrome the FIRST synthetic press of शुरू करें can deliver `pointerdown`
   alone** — no mousedown, no click — so the lesson never starts and every captured page comes back
   as the cover. It is not this build: **the sibling lesson does the same under the same driver**,
   and it was wrongly blamed on three innocent things first (the button's disabled state, the star
   layer, the burst handler). Press with `ActionChains`, retry, and **poll `startGate.hidden`**
   rather than sleeping. Separately, the phase gate cannot open at all while the real `play()` is
   in use headless — stub `window.play` first, or use `?slide=N`.

---

## Verifying a change

The receipt is necessary and not sufficient — this lesson has twice scored **0 FAIL / 0 WARN with
visible defects on screen**. So, in addition:

- **render every screen and look at it** (settled, per point 1 above);
- **drive every mechanic** — wrong → wrong → right — rather than only mounting it. The hand must be
  absent on miss 1, present on miss 2 in **guided**, **absent in practice** (ruling `[28f]`), and
  the third-try win must be silent;
- **run `1_SPEC/_verify_assets.py`** for truncated clips;
- **check `.ink-glyph` parents** (point 3).
