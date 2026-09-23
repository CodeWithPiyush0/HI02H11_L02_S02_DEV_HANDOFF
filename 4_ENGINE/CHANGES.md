# engine_local — HI02H11_L02_S02 (भाग 1 — उ / ऊ) · «मात्राओं की रेल»

Per-game engine copy. Baseline preserved as `_baseline_08.04b.html`, so every edit is diffable.

| | |
|---|---|
| Base engine | **2026.08.04b-r4-unified** |
| Copied from | `G2/HI02H11_L02_S01/engine_local/lesson_template.html` |
| Inherited changes | 3, unmodified (see the sibling's CHANGES.md) |
| **New here** | **the train module set** — 7 modules + the shell + a 3-attempt ladder |

## Why the modules live here and not in a dev ticket

The SME's «मात्राओं की रेल» design needs mechanics the shared engine does not have. The kit's
documented route for a per-game engine change is this folder, and it already held three. So the
modules were built here rather than waiting on the queue. Everything is **additive**: new entries
on `SlideModules` plus one CSS block, injected between marked fences. **No existing module,
helper or style is modified**, so every other lesson on this engine line renders byte-identically.

Rebuild with `scratchpad/inject_train.py`, which is idempotent — it strips the previous block
before re-inserting, so iterating never stacks two definitions. **Do not hand-edit the monolith.**

⚠️ **After changing the modules you MUST re-run the builder.** The served file is
`HI02H11_L02_S02.html`, which is generated from this template; patching the template alone leaves
the game running the old code. This cost one full debug cycle — three screens looked unfixed
because the HTML had not been regenerated.

## What was added

| module | what it does | screens |
|---|---|---|
| *(shell)* | locomotive + N coaches + track, right-to-left entry, 7 coach states | all train screens |
| `TRAIN_TAP` | tap the coach whose word carries the matra | 8, 9, 10 |
| `TRAIN_SORT` | drag cards into coaches — three kinds: `word`, `matra` (reverse), `picture` (labels hidden) | 11, 12, 14 |
| `MATRA_FILL` | a word with a blank; drag the matra in, the word completes | 13 |
| `MATRA_BUILD` | staged transformation: base → consonant → matra travels in → syllable → word | 2, 4 |
| `MEET_PAIR` | two example words, one at a time, each with its matra called out | 3, 5, 7 |
| `CONTRAST_PAIR` | a minimal pair taught head to head (फुल ≠ फूल) | 6 |
| `POEM_SEARCH` | poem card, draggable magnifying glass, N sequential target rounds | 15 |

Plus the **3-attempt ladder** (wrong 1 = hint VO, no hand · wrong 2 = hint VO + hand on the correct
coach · 3rd-try correct = confetti but silent), implemented inside these modules rather than by
changing the shared scaffold, so the blast radius stays in this game.

## Four engine facts this code is built around

Each one cost a debug cycle here or on the sibling. Do not undo them.

1. **`capture_pages.py` injects `*{animation:none!important;transition:none!important}`.** Anything
   that exists only inside an `@keyframes` is invisible in the review deck. Every element is
   therefore authored in its **settled** state and the entry motion is an added class. Kill the
   animation and you get the finished slide.
2. **Staged reveals must use the engine's `seq-hidden` naming.** The capture harness strips
   `/\S*seq-hidden/g` before shooting. A bespoke hidden class is invisible to it — which is exactly
   why the build screens first photographed as panel 1 only and both sort trays photographed
   empty. The classes are now `mb-seq-hidden` and `tr-seq-hidden`.
3. **Content that appears from an audio callback must also be painted synchronously.** `MEET_PAIR`
   built every example inside a `play()` callback, so a frozen capture caught an empty card and
   three teach pages shipped blank in the first deck. It now paints example 1 at mount.
4. **`makeDraggable(tile, onDrop)` hit-tests `.dd-zone`** and calls `onDrop(zone, tile)`. Coaches
   that accept a drop carry `.dd-zone`; tap-only coaches must not, or a stray drag highlights them.

## The guiding hand: an older ruling wins over the SME's note

The SME asks for the hand nudge on the 2nd wrong attempt on **every** test screen. The engine
carries a signed-off ruling ([28f], Yasir 2026-07-28): the hand is allowed in **tutorial and
guided**, and **never in practice** — "regardless of whatever name we save it by". Its own comment
says a new mechanic must call `handOnAnswer()` rather than `pointNudgeAt()`, because ~25 direct
callers once bypassed the gate and a hand appeared in round 3.

I wrote the modules against `pointNudgeAt()` first, which bypassed it. **Fixed**: every nudge now
goes through `handOnAnswer(el, slide)`. Net effect — guided screens get the hand as the SME asked;
practice screens get the coach **glow** but no hand. The glow is ours and is not phase-gated, so a
practice slide still escalates visually. Flagged to the SME rather than silently overriding either
ruling.

## Two engine behaviours worked around, both worth fixing upstream

- **The heading band does not collapse when `prompt_hi` is empty.** The SME asks for VO-only
  instruction on every test screen, so those slides ship `prompt_hi: ""` — and the engine still laid
  out the band, leaving a bare blue pill across the top of nine screens. Worked around with
  `.header-row:has(#promptText:empty){display:none}`. Belongs in the engine.
- **`concept_strip` landings never receive the glow class** — carried over from the sibling; this
  bundle still ships its own scoped rule.

## `ु` and `ू` must never be added to `RIGHT_SPACING_MATRAS`

They are **below-base** marks sharing their consonant's columns, so `_matraClipCols` colours the
**next letter**. Measured, forced on and rendered:

| word | red px | where |
|---|---|---|
| **पुल** (ु) | 11,342 | **27–50% of the word — on the ल** ❌ |
| **फूल** (ू) | 450 | a 13-px sliver ❌ |
| नाक (ा) / तीर (ी) *controls* | 6,704 / 8,944 | correct ✅ |

`guard_engine` in the builder **hard-fails** if either is added, because the failure is silent and
looks like the feature working. `ा` and `ी` are the only two matras the pixel-column method can
ever handle, so every remaining lesson in this LO needs glyph-cluster highlighting — filed, now
carrying reports from both matra lessons.

## Still upstream, deliberately not hacked in here

The train shell, the 3-attempt ladder and these seven modules are all worth having fleet-wide. They
are filed as engine requests under session `sme-lxd-matra-train` and should be **promoted from this
copy into the shared engine** rather than reimplemented — the code here is the reference
implementation, and it has been exercised end to end.

---

# ROUND 2 — the SME's review of the built HTML (2026-09-21)

Their words: the heading box above the train screens was missing, things were overlapping in many
places, and **a large part of their comments had not been implemented**. All three were correct.
This round fixes them and adds one module. Everything is still additive.

## What was wrong, and what actually caused it

Each of these passed every automated check. The bundle scored **0 FAIL / 0 WARN with all four
defects on screen**, which is the point worth remembering: nothing here was findable without
rendering the page and measuring it.

| # | Symptom | Real cause | Fix |
|---|---|---|---|
| 1 | Mascot sat at the top beside **nothing** on 14 of 16 screens | `prompt_hi: ""` everywhere plus `.header-row:has(#promptText:empty){display:none}` — my misreading of "No instruction text on screen" | every screen carries its heading; `guard_prompts` now **fails the build** on an empty one |
| 2 | `प` and `ल` spilled out of the coach and hit the next coach | the blank carries `.dd-zone`, and the engine sizes **every** drop zone `width:150px`, which beat `min-width:44px`. Measured: `.tr-fill` 216px inside a 172px body | `.tr-body .tr-blank.dd-zone{width:auto;min-width:54px}` |
| 3 | The result word printed **through** its picture | `centerInkGlyph()` translateYs each `.ink-glyph` to centre its ink **in its parent**; the parent was the whole tall panel. Measured: `translateY(61.97px)` | `.ink-box` — a parent that hugs the word, with 12px side padding so the engine's ink-fit does not shrink it |
| 4 | Coach labels touched the coach roofs | the label itself contains a matra (`छोटी उ ◌ु`), which descends | `--hi-lh: 1.45` everywhere + coach gap 12px |

## The in-word matra highlight — now possible

The single most repeated note in the SME's deck is *"Highlight only the matra in the word"*, and
round 1 shipped without it on the grounds that it could not be done for `ु`/`ू`. That was true of
**the engine's method**, not of the problem.

`RIGHT_SPACING_MATRAS` + `_matraClipCols` clip a vertical **pixel column** range. `ा` and `ी` own
an advance to the right of the consonant, so a column isolates them. `ु` and `ू` have **zero
advance** — they hang under the consonant and share its columns — so a column clip selects the
consonant and whatever follows. Forced on and measured: **पुल → 11,342 red px on the ल**.

`matraHL()` clips in **two dimensions**:

1. `Intl.Segmenter('hi')` splits the word into grapheme clusters, so `पुल → ["पु","ल"]` and the
   mark is never separated from its base.
2. A `Range` rect gives that cluster's exact x-range.
3. Intersect with the band **below the baseline**, found with a zero-size inline-block strut.

Nothing else in these words descends, so the intersection is the mark and only the mark. Verified
at 150px on `पुल`, `फूल` and `मुकुट` — the last correctly reddens **both** of its `ु` marks.

Two things to preserve if this is ever touched:

- **The overlay's text is in `data-w`, painted by `.mh-ov::before`, NOT a text node.**
  `centerInkGlyph()` measures with `textContent`, which concatenates descendants — a text-node
  overlay makes `पुल` measure as `पुलपुल` and the engine then shrinks the real word to fit a
  doubled ink box.
- **`matraHLSoon()` retries across ~10 frames and again after `document.fonts.ready`.** A single
  rAF retry was not enough: a MEET_PAIR word came back with zero overlays and **no error**, which
  is exactly the silent-failure shape this lesson keeps producing.

The function already handles right-spacing matras (it measures the cluster with and without the
mark and switches mode when the advance grows), so `ा`/`ी` work too. भाग 2 (ए/ऐ) needs a third
mode for above-base marks; the branch point is marked.

**`ु`/`ू` must still never be added to `RIGHT_SPACING_MATRAS`** — `guard_engine` still hard-fails
on it. `matraHL` replaces that path here, it does not rehabilitate it.

## MATRA_INTRO — the eighth module

The SME's screen 1 asks for *"the letter and its corresponding matra symbol as a pair, one by
one … आ → ा"*. The stock `INTRO` draws a row of bare symbols, so the built screen showed `◌ु ◌ू`
with no vowels beside them — the child was never told which sound each mark carries. `MATRA_INTRO`
shows `उ → ◌ु` and `ऊ → ◌ू`, one pair lit at a time while its VO plays, the rest dimmed, आगे
locked until both are done. Painted settled, so a frozen capture shows the whole screen.

## Also implemented from the deck, previously missing

- **The POEM_SEARCH ghost**, in full: entry flight round the lens → dim to a corner · idle drift
  toward the poem · happy bounce + sparkle on a hit · thinking face on a first miss, no hand ·
  drift to a real target and pulse on a second miss (this is the hint) · fly-across with sparkles
  at round end · centre spin + lens glow at the finish. Plus round dots, so a child can see how
  many words remain without adding instruction text.
- **MATRA_BUILD panel captions** from `slide05_image5.png` — «यह शब्द देखिए — पल», the equation's
  own one-liner, «पल से बना पुल» — and the base picture slot.
- **MEET_PAIR shows the word first, the picture a beat later**, per *"Word should appear first,
  then image should appear"*. `.mp-pic` starts transparent and is revealed on the clip.
- **SFX**: train arrival whistle on entry and on completion, a pop as each matra lands, a sparkle
  on each highlight. Synthesised with the engine's own `_tone()`, so no new files ship.

## Capture-harness rule, restated because it bit again

Anything revealed from a `play()` callback must **also be painted at mount**, or the review deck
photographs it missing. This round that meant the matra highlights on MATRA_BUILD and
CONTRAST_PAIR: live, those panels are `mb-seq-hidden` so the child never sees the red mark early,
but the capture strips `seq-hidden` and freezes before any audio, so a highlight applied only in
the callback was invisible in the deck. `matraHL` is idempotent, so painting at mount and again in
the chain is safe.

## How this round was verified

Driven, not just rendered:

- tap ladder walked on a TRAIN_TAP screen — **no** nudge and **no** hand on miss 1, coach glow
  **and** hand on miss 2, silent confetti on a third-try win;
- all three words dragged into place on MATRA_FILL including a deliberate wrong drop (returns the
  card, counts the attempt), completed words keep their matra marked;
- both POEM_SEARCH rounds played to completion — 3 then 6 hits, dots reset between rounds, ghost
  and lens finish states fire, nav opens;
- all 16 slides mounted in sequence: **zero JS errors**, 16/16 headings present;
- 0 FAIL / 0 WARN, 79/79 clips, 10/10 images, every referenced asset 200.

`assets/UI/hint.png` and `hint_active.png` resolve to 404 if fetched, but `#hintImg` does not exist
in this engine build so the guarded branch never runs and the browser never requests them. Present
in the sibling bundle too; inherited from the shared engine, not introduced here.

## A silent 404 found while packaging the handoff

`MEET_PAIR` played its example lines with `say(ex.audio_line)`, where `ex.audio_line` is the bare
clip **id** `"vo_meet_pul"` — not a path. The browser therefore requested `/vo_meet_pul`, got a 404,
and **the child heard nothing on the line that teaches the word**, on all three example screens.
`MATRA_INTRO` had the same bug on its pair names.

It survived every check we have:

- the clip **exists** on disk, so `_verify_assets.py` passed;
- the preloader fetches by id and builds the path correctly, so the asset sweep saw a **200**;
- `say()`'s 9-second fallback timer fires when a clip fails, so the chain still advanced, the
  slide still completed and no JS error was raised.

It was visible only in the browser's own network log, read while checking the packaged copy.

**Fix:** `clip(idOrPath)` normalises a bare id to `assets/Audio/<id>.<ext>`, and `say()` now runs
every source through it. A caller can pass either form and cannot reintroduce this. The six call
sites that previously built the path by hand now use `clip()` too, so there is one way to do it.

**Lesson for the checklist:** "the asset exists and serves 200" and "the module requests the right
URL" are different claims. Only the second one is what the child hears. Read the network log.


---

# ROUND 3 — the SME's review of the round-2 build (deck of 2026-09-22)

Their deck deletes two screens, replaces a third, adds three, rewrites one module, asks for one
that did not exist, and flips the register of the whole lesson. Everything below is still
**additive**: two new `SlideModules` entries, edits confined to this bundle's own modules, and one
appended CSS block. `MATRA_FILL`, `CONTRAST_PAIR` and `POEM_SEARCH` are left **registered and
untouched** even though nothing mounts them any more — removing them would change the engine for
every other lesson on this line, which is the one thing this folder must never do.

## Two new modules

| module | what it does | replaces |
|---|---|---|
| `WORD_BUILD` | picture above each coach, `_ल` inside it, drag a whole **अक्षर** into a blank that sits **first** | `MATRA_FILL` (which dragged a bare matra into `प_ल`) |
| `SENTENCE_COMPLETE` | scene illustration one side, a sentence with a dashed blank the other, three picture option cards below | `POEM_SEARCH` — and three more instances beside it |

`WORD_BUILD` judges a drop by **reconstructing the word** (`akshar + slot.tail === slot.word`)
rather than by an index. That is what makes a distractor match nothing by construction, and it is
why the two `…ल` coaches can never both accept the same tile. `guard_word_build` in the builder
proves both properties every build.

`SENTENCE_COMPLETE` treats a tap as **both the read and the choice**: the option's word VO plays
first and the answer is judged when that clip ends, so a child who cannot decode खुश can still
hear it and decide. Wrong taps shake and return — they do **not** lock — because the SME specifies
the 3-attempt ladder here as on every other test screen.

## Changes to existing modules

- **`TRAIN_SORT`** — praise is now **per card** (`card.correct_audio`) and the slide-level
  completion line is gone, which is what the SME asked for card by card; `data.single` limits a
  coach to one card (the matra round); coach labels fade in one by one (`tr-lblseq`).
- **`MATRA_INTRO`** — each pair now rides in a **train bogie** behind the locomotive, on the same
  track the test screens use, for the "मात्राओं की रेल journey" continuity the deck asks for.
- **`MATRA_BUILD`** — `explain` is gone (its content moved into the reworded `result` line) and a
  new `sounds` rung speaks the SME's **sound-differentiation** beat, प · पु · पुल, as ONE clip so
  the deliberate pauses survive.
- **`MEET_PAIR`** — the separate matra call-out clip is optional now; round 3 folds it into the
  example line itself.
- **The landing** — `dressLandingTrain()` re-dresses the SHARED engine's concept strip as a
  locomotive + bogies + track, **after** boot has painted it, gated on `landing_hero.train`. The
  shared engine is not touched, and a card without that flag renders exactly as before.
- **`sayOpt()`** — a helper for the rungs the SME deliberately SILENCES (the 3rd-attempt win, the
  sort completion line). Handing `play()` a null source instead would sit out say()'s 9-second
  fallback timer, turning "no praise" into "nine seconds of nothing".

## The guiding hand — the older ruling still wins, now confirmed

The SME again asks for a hand nudge on the 2nd wrong attempt on **every** test screen, and round 3
makes that 11 screens including all four new ones. Ruling `[28f]` (Yasir, 2026-07-28) allows the
hand in tutorial and guided and forbids it in practice. **Confirmed with the user on 2026-09-23:
keep `[28f]`.** So practice screens get the option/coach **glow** and pulse — which is ours and is
not phase-gated — and the hand is withheld. Every nudge in both new modules routes through
`handOnAnswer()`, which is the only place the rule can be enforced. Verified by driving: the hand
appears on the three TRAIN_TAP screens (guided) and does not appear on the four sentence screens
or on WORD_BUILD (practice), while the glow appears on all of them.

## ⚠️ CORRECTION to fact 1 above: what `capture_pages.py` actually strips

Fact 1 in the round-1 section says the capture harness strips `/\S*seq-hidden/g`. **It does not.**
The shipped script removes only the exact class `.seq-hidden`:

```js
document.querySelectorAll('.seq-hidden').forEach(function(e){ e.classList.remove('seq-hidden'); });
```

`mb-seq-hidden` and `tr-seq-hidden` survive it. Round 2's deck looked complete anyway because
every clip existed, so the audio-driven reveal chain finished inside the harness's wait and the
classes were removed by the modules themselves. Round 3 has 61 clips still unrecorded, `say()`
falls back to a **9-second timer per clip**, and the chain cannot finish — so MATRA_BUILD
photographed as panel 1 alone and MEET_PAIR as an empty card.

That is a **capture artefact, not a render bug** — the same screens are complete when driven. But
it means the review deck cannot be trusted while any clip is missing. Until the harness is fixed
upstream, capture with a settler that strips **every** `*seq-hidden` variant and re-applies the
settled classes; `_review_shots/` in this bundle was produced that way.

---

# ROUND 3b — the painted train, ported from the sibling lesson

The SME's landing mockup draws a **painted** locomotive with the matras inside its bogies. Round 3
shipped a drawn SVG stand-in on the grounds that painted art needed a generation run. That was the
wrong call for a reason nobody had checked: **the sibling lesson `HI02H11_L02_S01` had already
built exactly this screen and shipped it.**

## What came across, and what was changed

| | |
|---|---|
| ported verbatim | the `matra_train` landing: 6×6 spritesheet, travel curve, chimney smoke, ink-centred matras, the rail, and every measurement comment |
| adapted | **three coaches → two.** All 36 cells cropped 634 → 479px |
| adapted | panel centres 41.17% / 64.27% of 634 → **54.49% / 85.07%** of 479; chimney 8.4% → **11.12%** |
| adapted | entrance `translateX(136%)` → **168%** — that percentage is of the wrap's own width |
| replaced | the synthesised `_tone()` train sounds → the sibling's **real recordings** |

**Why the cells are cropped rather than the third coach simply left empty.** The note says "Show
only two matra boxes/cards". A third, empty coach reads as a lesson that lost its third matra.
The cut is at x=479, which is inside the coach-2/3 coupling (its ink-height minimum is at
x=476–480) and clear of the pink coach, whose first painted column across **all 36 frames** is
x=481. Cutting at 484 — which looked right on a single frame — left a pink sliver visible on the
landing.

## Two traps this port hit, both worth knowing

1. **The extracted CSS began mid-comment.** Lifting a line range out of the sibling's engine
   started the block inside a comment, so it opened with orphaned prose and a stray `*/`. The CSS
   parser read that as a bad selector and ate the rules after it — `.lt-clip` and `.lt-track`
   never applied, the clip stayed 478px wide instead of 1080, and **the rail rendered with height
   0**. Nothing errored; the train simply had no track under it. When lifting a block out of
   another file, cut on a rule boundary, not on a line number.
2. **`sfxWhistle` is shared.** `buildTrain()` calls it on every train screen, so repointing it at
   a real file changes seven screens, not just the landing. That is wanted here — the SME asks for
   the arrival sound on all of them — but it is the kind of edit that looks local and is not.

## The SFX are real recordings now

`sfx_train_arrive`, `sfx_train_move`, `sfx_whistle` and `sfx_mt_burst` are the sibling's own files.
`sfxFile()` plays them and falls back to the old `_tone()` synthesis if one is ever missing, so a
stripped bundle still makes a sound rather than going quiet.

## Which train is painted, and which is not

Only the **landing**. The in-slide trains on TRAIN_TAP / TRAIN_SORT / WORD_BUILD stay drawn,
because their coaches have to recolour per screen, glow, shake, lock and accept drops — none of
which a flat sprite can do. MATRA_INTRO also stays drawn: its coach body carries a whole
«उ → ◌ु» pair, which does not fit the painted coach's matra panel. This is the (a) option from the
round-3 change request §4, now with real art where the mockup actually shows it.

## ROUND 3b, second pass — the port was only half done

The first pass repainted the LANDING and left `buildTrain()` drawing an SVG train on the seven
activity screens. That is precisely the defect the sibling's `[r7]` note describes, reintroduced:
a painted cover and a drawn everything-else.

`TrainChrome` is now ported in full and `buildTrain()` is a thin adapter over it, so TRAIN_TAP,
TRAIN_SORT, WORD_BUILD, MATRA_INTRO **and** the landing all mount the same train. Two
compatibility details keep seven modules working unchanged: `.coach-body` also carries the old
`.tr-body` class and `data-idx` (makeDraggable hit-tests it), and `coaches[i].body` is the
`.coach-face` — the painted cream panel — because that is where content belongs.

Slicing also retired the cropped two-coach sprite sheet: a two-coach train is parts 0..2 of the
three-coach artwork and part 3 is simply never drawn.

### Three things this second pass found and fixed

1. **Sorted cards were appended to the coach BODY, not its panel.** `zone.closest(".tr-body")`
   returns the body — correct as a drop target, wrong as a parent — so two cards landed at the
   body's top-left and spilled out of the coach. They go to `.coach-face` now, and a snapped card
   is sized to fit two across a 162px panel.
2. **The coach words appeared with the train.** The note says "After the train stops, the three
   coaches पुल, दूध, सूरज appear clearly" — so the words are held on `tt-hold` and revealed from
   `on_enter`, 180 ms apart.
3. **The geometry sweep reported 8 of 17 slides overflowing, and every one was a false alarm.**
   It measured 0.9 s after mount while the train takes 3.4 s to pull in, so it was catching the
   train mid-arrival, outside the stage, which is where a train arriving from the right is meant
   to be. With the settle raised past the travel: 0 of 17. Any harness that measures this lesson
   must wait out `TRAIN_TRAVEL_MS`.

---

# ROUND 3c — VO clashes, and the cover matched to the sibling properly

## The clash, measured rather than guessed

Nothing in this bundle checks the house rule "never overlap two VO clips", and it is invisible to
every other test: each clip exists, is the right length and plays. So `play()` was instrumented
with the clips' REAL durations, every interval recorded, and any pair overlapping by more than
120 ms reported. Two causes came out, and one of them was mine:

1. **The prompt talked over the arriving train.** Every train module fired its prompt VO at mount,
   while the train spent 3.4 s pulling in under a whistle and a chug bed — on all seven train
   screens. The SME's ordering is explicit: "Train comes through animation from right to left.
   Train stops at the centre of the screen." and only then "VO: जिस डिब्बे में …".
   **Fixed:** `buildTrain()` exposes `whenParked(fn)`, fed by TrainChrome's `on_enter`, and every
   train module now gates its opening prompt on it. (The sibling does the same thing through
   `state.promptGate`, which *this* engine sets but never reads — it has no such hook.)

2. **A stale chain could speak over the next screen.** Every module drives a chain of clips that
   call each other's callbacks, and a chain has no idea the screen under it has changed. Measured:
   two concurrent MATRA_INTRO mounts put `vo_pair_u` on top of *itself* for 2.1 s.
   **Fixed:** `newVoEpoch()` at the top of every mount, and `say()` drops any callback whose epoch
   has moved on. One chain at a time, ever — a re-mount, a replay or a fast आगे can no longer
   produce two voices.

**A caution about the measurement itself.** The first run reported 9 clashes and *most were the
harness's own fault*: it re-mounted slide 0 (which the start button had already mounted, so two
copies of the module ran), and it allowed 14 s per slide when the longest teach chain runs ~24 s,
so one screen's tail landed on the next. Both were fixed in the harness before drawing any
conclusion. A test that creates the defect it reports is worse than no test.

## The cover, actually matched this time

Three concrete differences from the sibling's cover remained after round 3b:

| | was | now |
|---|---|---|
| scale | `maxH 220` → k=0.372, a chunky train crowding the card | `maxH 174`, i.e. the sibling's own per-part scale of 634/2155 = 0.294 |
| rail | a track ran under the cover train | **no rail** — the sibling's cover has none. The track belongs to the activity screens, where the train arrives along it; on the cover it cut the card in half |
| matras | **the coaches photographed EMPTY** | they are revealed from `on_enter` at 3.4 s, so anything looking earlier saw two blank coaches — which is what the round-3b review deck shipped. A 5 s backstop now reveals them regardless, and the capture waits out the arrival |

The tray cards were also matched to the sibling's `.tt-card` (paler border, flatter shadow, roomier
padding) and the activity trains raised to `maxH 270` — the sibling uses 300 and carries no heading
band, which this lesson does.
