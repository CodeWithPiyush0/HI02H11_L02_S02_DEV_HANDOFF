# HI02H11_L02_S02 — «मात्राओं की रेल» (उ / ऊ) · developer handoff

**Skill:** उ, ऊ मात्रा वाले शब्द पढ़ता है। शब्दों में आने वाली मात्रा पहचानता है।
*(Grade 2 Hindi FLN — Hindi_content progression.xlsx, row 56, भाग 1)*

This folder is self-contained. You do **not** need the wider SwiftPAL factory to read it, to run
the game, or to rebuild it.

---

## Status — ROUND 3 IS BUILT

`3_CURRENT_BUILD/` is now **round 3**: every change in the SME's deck of 2026-09-22 is
implemented. What is *not* done is the asset generation that round 3 created work for.

| | state |
|---|---|
| Card + engine changes | **done** — 18 screens; every row of the change checklist implemented or explicitly flagged |
| Mechanics | **driven and verified**, wrong → wrong → right, on all 11 test screens |
| Voice-over | **61 of 80 clips pending** — they need a Gemini TTS run; until then those beats are silent |
| Art | **7 of 17 pictures pending** — they render as the emoji fallback until generated |
| Asset receipt | **2 FAIL** — both are the above, quoted verbatim in `CHANGES.md` |

**The one thing to read first is [`CHANGES.md`](CHANGES.md)** — every ask in the deck as a numbered
row, with its status and the evidence for it. It is the contract this round was built against and
the scorecard it was checked against; they are the same document on purpose.

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

## Finishing round 3 — the two jobs left

Both need a Gemini API key, which the build machine did not have.

```bash
# 1. VOICE-OVER — 61 clips. gen_tts SKIPS ids that already have a file, and the builder has
#    already deleted exactly the stale ones, so this regenerates precisely what changed.
#    Never --force the whole card: a re-run of an unchanged clip returns a DIFFERENT take.
python <skill>/scripts/gen_tts.py 3_CURRENT_BUILD/card.json --ext ogg --voice <the shipped voice>

# 2. ART — 7 pictures. `1_SPEC/_art_manifest.json` carries the prompts; its `pending` block is the
#    list. The four scn_* SCENES must NOT go through the magenta chroma key — 1_SPEC/ART_BRIEF.md
python <skill>/scripts/gen_objects.py 3_CURRENT_BUILD/assets/Images --manifest <pending objects>

# then, always:
PYTHONUTF8=1 python 1_SPEC/build_skill_HI02H11_L02_S02.py        # picks the new assets up by itself
cd 3_CURRENT_BUILD && PYTHONUTF8=1 python ../1_SPEC/_verify_assets.py
```

`_verify_assets.py` is the **only** check that catches a truncated voice clip. The TTS model cuts a
clip short when an em-dash precedes a short final word (0.73–1.05 s against a 1.53–2.21 s peer
median), and the truncation is invisible to existence and file-size checks. **Four round-3 lines
are written in exactly that shape and they are the SME's own wording** — see the EAR-CHECK list at
the top of `1_SPEC/VO_RECORDING_LIST.md`, and `CHANGES.md` for the open question about them.

---

## Five things that will cost you a day if you do not know them

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
