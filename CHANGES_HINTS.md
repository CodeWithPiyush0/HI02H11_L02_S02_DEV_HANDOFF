# CHANGES — Hint Logic (Review -1)

Source: **“Hindi Matra Train Activity (उ / ऊ): Hint Logic”**, Google Doc `13WqhpliETy…`,
read 2026-09-28. A verbatim copy is kept at [`1_SPEC/HINT_LOGIC_REVIEW1.md`](1_SPEC/HINT_LOGIC_REVIEW1.md).

This is the contract for the round **and** the scorecard it was checked against — the same
document on purpose. It does not supersede `CHANGES.md` (round 3); it sits on top of it, and
where the two disagree **this file wins**, because it is the later SME document.

**Status: 30 rows implemented and proved · 0 pending · 8 flagged for the SME · 2 VO clashes found and fixed.**

---

## Slide map

The doc numbers its own eleven screens. They are the eleven **test** screens of the build, in
order, and the word sets match item for item — nothing had to be interpreted to line them up.

| doc | build | module | correct answer |
|---|---|---|---|
| 1 | `G1` | TRAIN_TAP | पुल |
| 2 | `G2` | TRAIN_TAP | फूल |
| 3 | `G3` | TRAIN_TAP | सुई |
| 4 | `G4` | TRAIN_SORT · word | सुई, गुड़ → उ · सूरज, आलू → ऊ |
| 5 | `G5` | TRAIN_SORT · matra | ु → उ · ू → ऊ |
| 6 | `P1` | WORD_BUILD | पु→\_ल · फू→\_ल · सु→\_ई · पा = distractor |
| 7 | `P2` | TRAIN_SORT · picture | मुकुट, पुल → उ · कबूतर, तरबूज → ऊ |
| 8 | `P3` | SENTENCE_COMPLETE | खुश |
| 9 | `P4` | SENTENCE_COMPLETE | सुबह |
| 10 | `P5` | SENTENCE_COMPLETE | फूल |
| 11 | `P6` | SENTENCE_COMPLETE | तरबूज |

---

## What the three rungs now are

The shipped ladder was two rungs of the same kind — a sentence, then the same sentence with a
hand on the answer. Review-1 makes them three different **kinds** of help, and that, not the
extra clip, is the substance of this round:

| rung | kind | what happens |
|---|---|---|
| 1 | refocus | the wrong thing shakes, one line is spoken. **Nothing is marked and no hand appears.** |
| 2 | demonstrate | the screen *shows* — words read out with their matras lit, coach labels read with their marks conjured beside them, picture names read with their blanks blinking, the sentence read three times over with each option standing in the blank. Still no hand. |
| 3 | guide | the answer is named, it glows, the hand goes to it, and **everything else stops accepting the item.** |

---

## Common rules

| # | change | evidence |
|---|---|---|
| C1 | Hint 1 after the 1st wrong, Hint 2 after the 2nd, **Hint 3 after the 3rd** | ✅ driven wrong→wrong→wrong on all 11 screens: rung 1 emits no `hint_shown`, rung 2 emits level 2, rung 3 emits level 3, every screen |
| C2 | On drag screens the attempt count is **per item** and resets for the next | ✅ measured on `G4`: after one card was walked to rung 3, the next card played `vo_g4_h1` with no `hint_shown` and no lock |
| C3 | Nothing is tappable or draggable while any VO is playing | ✅ **three gaps found and closed** — (i) the tap coaches computed `pointer-events:auto` under `body.vo-lock`, held only by their own JS check; now named in the CSS gate (6 screens × every grabbable element = `none`, 0 leaks). (ii) the gaps *between* the clips of a rung-2 chain left the screen live. (iii) the tap coaches were live before their prompt had spoken. See **Two VO clashes** below |
| C4 | **After Hint 3 only the correct answer can be selected or placed** | ✅ measured on `G4`: a 4th drop on the wrong coach does not land, does not increment `state.attempts` (3→3) and emits nothing, while the right coach still accepts it. Tap screens retire both wrong coaches; sentence screens lock both wrong words |

## Screens 1–3 · `G1` `G2` `G3` — TRAIN_TAP

| # | change | evidence |
|---|---|---|
| 1a | Hint 1 VO → “फिर से पढ़िए। जिस शब्द में {छोटी उ/बड़ी ऊ} की मात्रा आ रही है, उस पर टैप कीजिए।” | ✅ `vo_tap_h1_u` · `vo_tap_h1_uu` |
| 1b | Hint 1 UI: soft shake on the wrong coach, **no** correct-answer highlight | ✅ rung 1 shows `is-out=0 hand=0 nudge=0` on all three |
| 1c | Hint 2 UI: read the three words **one by one**, glowing each word’s own matra | ✅ three name clips in order + `.is-read` + `.mh-ov`; मुकुट’s **two** ु are both marked (the ink mask covers every occurrence) |
| 1d | Hint 2 VO → “जिस शब्द में {…} की मात्रा है, उस पर टैप कीजिए।” | ✅ `vo_tap_h2_u` · `vo_tap_h2_uu` |
| 1e | Hint 3 UI: soft glow + hand on the correct coach; **the other two lock** | ✅ `is-out=2`, `nudge=1`, `hand=1` — see `_review_shots/hints/G1_rung3.png` |
| 1f | Hint 3 VO → “देखिए, ‘पुल’ में छोटी ‘उ’ की मात्रा है। ‘पुल’ पर टैप कीजिए।” | ✅ `vo_g1_h3` · `vo_g2_h3` · `vo_g3_h3` |

## Screen 4 · `G4` — TRAIN_SORT (word → matra coach)

| # | change | evidence |
|---|---|---|
| 4a | Hint 1 VO → “फिर से पढ़िए। शब्द में कौन-सी मात्रा है, देखिए और उसे उसी मात्रा वाले डिब्बे में डालिए।” | ✅ `vo_g4_h1` |
| 4b | Hint 1 UI: the mis-dropped **card** shakes on its way home | ✅ `.tr-cshake` — the coach already shook; makeDraggable clears the card’s transform before the module is called, so the card had no gesture at all |
| 4c | Hint 2 UI: read the mis-dropped word + glow its matra, then read **both** coach labels उ · ऊ | ✅ word clip + `.mh-ov`, then `vo_letter_u` + `vo_letter_uu` with `.tr-lblread` |
| 4d | Hint 2 VO, per word (4 clips) | ✅ `vo_g4_h2_{aaloo,sooraj,sui,gud}` |
| 4e | Hint 3 UI: glow the right coach, hand drags card→coach, **the other coach locks** | ✅ `hand=1`, `.is-nudge`, card bound to bin 1 |
| 4f | Hint 3 VO, per word (4 clips) | ✅ `vo_g4_h3_{aaloo,sooraj,sui,gud}` |

## Screen 5 · `G5` — TRAIN_SORT (matra → letter coach)

| # | change | evidence |
|---|---|---|
| 5a | Hint 1 VO → “फिर से देखिए। मात्रा को ध्यान से देखिए और उसे सही डिब्बे में डालिए।” | ✅ `vo_g5_h1` |
| 5b | Hint 2 UI: read उ then ऊ, and beside each **show and glow its matra** for a beat | ✅ `.tr-lblmatra.in` — see `_review_shots/hints/G5_rung2.png`, ◌ू lit beside ऊ |
| 5c | Hint 2 VO → “‘उ’ की मात्रा ‘ु’ है और ‘ऊ’ की मात्रा ‘ू’ है। …” | ✅ `vo_g5_h2` — **but see F6** |
| 5d | Hint 3: glow + drag-hand, other coach locks, per-matra VO | ✅ `vo_g5_h3_u` · `vo_g5_h3_uu` |

## Screen 6 · `P1` — WORD_BUILD

| # | change | evidence |
|---|---|---|
| 6a | Hint 1 VO → “फिर से देखिए। चित्र का नाम सोचिए और …” | ✅ `vo_p1_h1` |
| 6b | Hint 2 UI: read the three picture names in turn; the picture glows and **its blank blinks** | ✅ `.wb-read` + `.wb-blink` with `vo_name_{pul,phool,sui}` in order; a coach already filled is skipped |
| 6c | Hint 2 VO → “नाम ध्यान से सुनिए। …” | ✅ `vo_p1_h2` |
| 6d | Hint 3: glow the right blank, hand drags letter→blank, **the letter goes nowhere else** | ✅ `.wb-pulse` + `hand=1` + `vo_p1_h3_{pul,phool,sui}` |
| 6e | The **पा** distractor: at Hint 3 nudge the correct letter for the **next empty** blank | ✅ dropped पा three times → **पु** is called out, blank 0 pulses, the hand travels पु→blank 0, VO `vo_p1_h3_pul`. See `_review_shots/hints/` and the note below |

## Screen 7 · `P2` — TRAIN_SORT (picture → matra bogie)

| # | change | evidence |
|---|---|---|
| 7a | Hint 1 VO → “फिर से सुनिए। चित्र का नाम ध्यान से सुनिए और …” | ✅ `vo_p2_h1` |
| 7b | Hint 2 UI: say the picture’s name, **briefly show the word under it** and glow its matra | ✅ `.tr-revealword.in` + `.mh-ov`, removed again when the rung ends — **see F3** |
| 7c | Hint 2 VO, per picture (4 clips) | ✅ `vo_p2_h2_{mukut,pul,tarbooj,kabootar}` |
| 7d | Hint 3: glow the right bogie, drag-hand, other bogie locks | ✅ `vo_p2_h3_{…}` + `hand=1` + `.is-nudge` |

## Screens 8–11 · `P3`–`P6` — SENTENCE_COMPLETE

| # | change | evidence |
|---|---|---|
| 8a | Hint 1 VO, per screen — each asks its own question of the picture | ✅ `vo_p3_h1` … `vo_p6_h1` |
| 8b | Hint 2 UI: put **each** of the three words in the blank in turn and read the whole sentence | ✅ `.sc-blank.sc-try` + `.sc-opt.sc-trying` + `vo_pN_try_*` ×3 per screen (12 clips) |
| 8c | Hint 2 UI: soft glow on the named part of the scene | ✅ placed from fractions of the **artwork** and mapped through `object-fit:cover` in JS. Measured: P4 carries **two** regions (the sunrise and the clock), as the doc asks. See `_review_shots/hints/P*_rung2.png` — **and F8** |
| 8d | Hint 2 VO → “जो वाक्य सही लग रहा है, वही शब्द चुनिए।” | ✅ `vo_sc_h2`, shared |
| 8e | Hint 3: glow + hand on the right word, **other two lock** | ✅ `.sc-locked` + `hand=1` + `vo_pN_h3` |

---

## Flagged — decisions taken, for the SME to overturn if they disagree

| # | | |
|---|---|---|
| **F1** | **The hand moves from rung 2 to rung 3.** The shipped ladder puts the hand on the 2nd wrong (round-3 deck: “Hint VO should play. Show hand nudge on the correct answer.”). This doc makes rung 2 a demonstration and gives the hand to rung 3. | doc wins — it is the later document |
| **F2** | **The hand on practice screens.** Ruling [28f] (Yasir 2026-07-28, re-confirmed 2026-09-23) allows the hand in tutorial and guided and **never in practice**. Doc screens 6–11 are all practice and all ask for a Hint-3 hand. | **implemented per the doc.** [28f] is not edited — it is enforced at `pointNudgeAt`, the single choke point, and `withHand3()` widens the phase set around that one synchronous call. Set `scaffold_rules.hand_on_hint3` to `false` and [28f] applies exactly as before, with the glow carrying rung 3 alone |
| **F3** | **The word on the picture round.** The round-3 deck: on `P2` “the word should not be displayed at any point.” This doc’s Hint 2 shows it briefly under the picture. | doc wins; shown only for that one beat, then removed |
| **F4** | **Retiring the last-tapped coach.** [r20] (Yasir: “disable only the cart on which we tap on last”) was written when the 2nd wrong was the **last** rung. Under the new ladder it greyed out one of the three words rung 2 is about to read aloud — measured on `G2`: गुड़ sat at `grayscale(.5) opacity(.45)` while its own clip played. | **moved to rung 3**, where the doc asks for it anyway and asks for all of it. r20’s concern — that the child must still have a choice — is what rungs 1 and 2 now protect: nothing is taken away until the answer is being named outright |
| **F5** | **“Correct on the 3rd attempt → no praise VO.”** With a third rung a child can now reach a 4th attempt. | unchanged: any item missed twice or more is still won silently |
| **F6** | **`vo_g5_h2` contains two bare combining marks.** The doc writes “‘उ’ की मात्रा ‘ु’ है और ‘ऊ’ की मात्रा ‘ू’ है” — and a synthesiser has nothing to say for a mark with no consonant under it, so the clip may read as the same sentence twice. | shipped **as written** (this build does not rewrite the SME’s Hindi to dodge a TTS limit) and flagged instead. The **visual** half of that rung shows ु beside उ and ू beside ऊ and carries the distinction on its own. ⚑ wants an ear |
| **F7** | **The order the three sentences are read in.** The doc lists them in a different order on each of the four screens (correct last on 8 and 11, first on 9 and 10). The options are shuffled per run. | read **left to right as they stand on screen** — the only order the child can follow |
| **F8** | **The scene glow is a ring, not added light.** The first cut used `mix-blend-mode:screen`; measured, it moved the panel by under 2 grey levels, because all four regions are already bright — a sunrise, a white clock face, a lit cheek, a bed of yellow flowers. | redrawn as a soft amber ring with a wash inside it. Measured after: 11–12 grey levels inside the ring against 1.7–5 over the panel |

---

## Two VO clashes, found by measuring

The house rule is that two clips never sound at once, and nothing in the bundle enforces it —
every clip exists, is the right length, and plays. Running the overlap instrument over the **hint**
chains (the shipped one only walks each screen's arrival) found two:

**A demonstration is a chain, and its gaps unlock the screen.** Between the clips of a rung-2
chain `isPlaying` is false, so `body.vo-lock` comes off and the screen is live again for a few
hundred milliseconds at a time. A child who acts in one of those gaps starts rung 3 on top of the
rest of rung 2. Measured on `P2`: `vo_p2_h2_kabootar` and `vo_p2_h3_kabootar` overlapped by
**3.9 seconds**. **Mine** — the old ladder's rungs were single clips with no gaps to fall into.
A demonstration now holds the screen for its whole length: `state.revealing` (which `makeDraggable`
already honours, so a drag cannot even start) plus a `hintBusy` flag on every tap path, cleared
together when the chain ends and reset by `newVoEpoch()` on every mount.

**The tap carts were live before the question was asked.** On `G1`–`G3` the coaches are tappable
from the moment they mount, but the prompt is not spoken until the train finishes arriving. Tap in
that window — while the words are still held at `opacity:0` — and the hint plays to a child who has
not been asked anything yet, and then the prompt starts on top of it. Measured: **2.5–3.2 s** of
two voices on all three. **Pre-existing**, nothing to do with this round, but it is in the code
this round edits. The carts now arm in the same tick the prompt starts.

Re-measured after both: **0 clashes** across all eleven screens' hint chains, and 0 across the
entry chains (`_verify_vo_overlap.py`, unchanged).

---

## Voice-over

**58 new clips**, Gemini TTS, voice **Leda**, `--ext ogg`. The builder deleted the 13 clips whose
text this round changed or whose id is gone, so exactly what moved was re-recorded and every
unchanged take was left alone.

`_verify_assets.py`: **0 FAIL · 1 WARN** (the WARN is the standing `vo_pair_*` em-dash risk from
round 3, not new). Two clips were re-recorded after the first pass measured them short —
`vo_p3_h3` (1.01 s → 3.25 s) and `vo_g1_h3` (2.25 s → 4.13 s, against siblings at 3.89 s and
4.29 s).

⚑ **EAR-CHECK** — eight clips came back on a fallback voice or through a style wrapper, so their
timbre may not match Leda: `vo_g4_h3_sooraj` (Kore), `vo_p2_h2_tarbooj` (Aoede), and
`vo_g5_h3_u`, `vo_p2_h2_mukut`, `vo_p2_h2_pul`, `vo_p2_h2_kabootar`, `vo_letter_u`,
`vo_letter_uu` (wrapped/Despina). The two `vo_letter_*` clips are single letters — “उ” and “ऊ” —
which the model refused outright on the primary voice; `vo_letter_uu` took three attempts.

---

## How this was checked

Not by reading the diff. Three harnesses, all in the session scratchpad:

- **`drive_ladder.py`** — mounts each of the eleven test screens, gets it wrong three times, and
  records the clips spoken in order, the `hint_shown` levels emitted, and every hint state that
  appeared *at any point* (sampled on a 40 ms timer, because a rung-2 state lives exactly as long
  as the clip it accompanies and is gone before an after-the-fact query can run).
- **`verify_extras.py`** — the four things a straight run cannot reach: the per-item reset, the
  post-rung-3 lock (including that refusing is **not** counted as another attempt), the VO gate,
  and the पा distractor path.
- **`glowpx.py`** — shoots the scene panel with the glow up and again with it removed and reports
  the mean absolute difference inside each region against the rest of the panel. This is what
  caught F8; the ring passed where the blend had not.
- **`happy.py`** — the path that matters most, and the one a hint round is most likely to break:
  answer **correctly, first time**, on all eleven screens. Three of the four modules had a lock
  check added ahead of their judgement this round, so this proves a child who is simply right
  still finishes. All eleven fire their own first-try signal; the eight drag and sentence screens
  go on to `slide_completed`, and the three tap screens unlock आगे and wait for it, which is what
  `finishSlide` has always done.

Three harness faults were found and fixed before any of the above could be trusted, and each one
had been reading as an engine fault: a synthetic tap that fired the decision **twice** on the
sentence screens; `idle()` reading `window.state` when `state` is a top-level `let` and so lives
in the global *lexical* environment, not on `window`; and treating “nothing is playing” as “the
screen is ready”, which let the harness act while the train was still sliding in — on `P1` the
drop landed on the **correct** blank and the first “wrong” attempt was a win.


---

# r65 — eight notes, 2026-09-28 (afternoon)

| # | ask | what was done | evidence |
|---|---|---|---|
| 1 | inverted commas on the letter in the tap-screen headings (pages 6–8) | `छोटी “उ” की मात्रा …` / `बड़ी “ऊ” की मात्रा …` — on screen only; the recordings say the same words, so no clip moved | heading read back from the DOM |
| 2 | **the matra highlight is misaligned**, in coaches and on option cards alike | Your diagnosis was exact. [r13] cut a mask on a *canvas* (its own font string, its own hinting) and laid it over the page's glyph — two renderers, two shapes. The mask is retired; the overlay is now the page's **own text drawn again in orange**, clipped to the band under the baseline of the cluster carrying the mark, so it cannot be out of register with itself. A second fault sat underneath: the 100 px strut that measured the baseline **wrapped to a second line** inside a 22 px-wide card label, so on every snapped card the orange landed a full line off. Zero-width strut now. | measured: coach word पुल — orange bbox `1007..1026 × 379..391` on navy mark `1008..1025 × 380..391`, **0 navy px left** under the baseline; card label सूरज (snapped, scaled) — exact, see `r65_align_card_zoom.png` |
| 3 | no `sfx_train_arrive` anywhere | the call in `buildTrain` is gone and so is its helper; the file stays on disk in `COPY_AUDIO` | 0 occurrences in the served page; never in any play log |
| 4 | page 10's shown matra is red; make it the highlight orange | `.tr-lblmatra` → `var(--matra-hi)` | computed `rgb(255,138,0)` |
| 5 | page 12: the lent word falls out of the option box | the picture lifts 15 px while the word is lent and the word sits inside the card's foot; both return when the beat ends | word box `623..652` inside card `548..660`, below the picture's foot |
| 6 | pages 13–16: drag-and-drop only; a tap must not answer | a tap now only **speaks** the word (the SME's "when an option is tapped, play the word VO"); the judgement lives in the drop handler alone | tapping the correct word on P3 and P6: not answered, not locked, only `vo_name_*` played |
| 7 | the new seeking-and-speaking Swifty on the transition, synced to VO | the GIF (9.7 MB, 1500², bird in 58 % of the frame) is cropped to the bird and re-encoded as **animated WebP, 2.86 MB** — a transparent sprite cannot frame-difference as GIF (the re-encode came out *larger*); source kept in `1_SPEC/game_art_src/gate/`. Frame-timed: she rises, peeks, rises again, and her mouth first moves at **3.82 s**; the gate now holds the VO until then (`CARD.gate.talk_at_ms`). The engine's own slide-up is off for her (the rise is in the art) and the height clamp applies to the bird, not an empty square. Additive: a card without `CARD.gate` gets the stock bird and timing | measured VO start **3 825 ms** after the gate opened; `r65_gate_1_seek / 2_peek / 3_speak.png` |
| 8 | the new play button | `play_btn.svg` replaces the pill, `play_btn_disabled.svg` while the greeting is still speaking; the earned idle pulse is kept; the pill's 186 px min-width removed so the disc is a true 116 px circle | computed: 116×116, correct SVG in both states, no `::after` glyph |

**Harnesses** (`drive_ladder.py`, `happy.py`, `overlap_hints.py`) now *drag* on screens 13–16, because tapping no longer answers there.


## r66 — the gate lag

Yasir: "slight delay in playing swifty gif and its VO in transition screen". Measured at a
tablet-like 8 Mbit/s: the bird was still downloading when the child pressed play, so the gate
opened on an empty frame, she appeared **4.7 s late**, and the VO then played **~3 s before her
mouth moved** (its clock ran from the gate opening, not from her). Three fixes:
the art is fetched at high priority **as soon as the card is parsed** (not after every other
asset); it is re-encoded at 440 px tall (**2.86 MB → 1.54 MB** — it renders at ≤ 290 CSS px); and
the talk clock starts **when the image has loaded**, with a 4 s cap after which the line plays at
once. Re-measured twice on the same link: bird ready at the instant the gate opens, VO
**3 822 / 3 829 ms** after it — on her first mouth movement.


## r67 — a still side painting for the runner: tried and REVERTED

Tried: one static jungle painting down both sides (Temple Run framing), a road a third broader,
the scrolling grass and streaming roadside objects removed, the camera held still. Yasir: "it
looks like the character is running on the treadmill" — with nothing beside the road moving, the
eye has no second speed to measure the run against, so the paving slides under Swifty while the
world holds still. Reverted: the game source is restored from commit `3473794`, the painting is
out of the bundle (kept as `1_SPEC/game_art_src/side/bg_side_keyed.webp`), and the runner is back
to the committed frame. r66 (the gate fix) is kept.

Found on the way: `4_ENGINE/inject_train.py` left the padding of its previous injection behind on
every run, so each rebuild added blank lines to the engine. It now removes the block together
with its padding; three consecutive injects leave the engine byte-identical.


## r68 — the valley bridge

Yasir supplied a valley video (only the waterfalls move) and a painting of the bridge.

**Background:** the video, drawn into the canvas every frame, muted, looping. Re-cut by
`1_SPEC/prepare_bridge.py`: audio dropped, the last second cross-faded into the first so the 9 s
loop has no seam (1.8 grey levels, i.e. compression noise), **4.7 MB -> 1.5 MB**. Its sun is pinned
to the game's vanishing point (measured: centre 0.525 of the width, horizon 0.40 of the height),
so the bridge runs into the sun. A poster frame shows until the video can play, and the video is
paused with the music when the lesson leaves the screen. Verified playing: with the world frozen,
the waterfall's pixels still change.

**The bridge is built, not pasted.** Drawn as a still, his painting would be r67's treadmill again;
scrolled as a floor, its upright posts grow ~2x too fast on the way in. So it is the style
reference for three parts (`1_SPEC/gen_bridge_parts.py`): a top-down slab tile (mirrored down so its
rows meet), one post, and one parapet section (keyed, cropped to its solid rows, mirrored across so
its ends meet). The game lays the deck in perspective as the road was, draws the parapet's inner
face in thin upright slices clipped to its exact outline, and stands the posts at a steady beat
along both edges - the posts streaming past are what says "travelling". The camera sway stays: the
valley is at infinity and does not shift, the bridge does. Deck is 1.22 lane-widths either side
(was 1.08) - a little broader, with room between the portals and the walls.

The grass, scattered trees/bushes/pillars, hedge and railing are off while the bridge is on; with
the bridge files absent the game is what it was. Frame cost: overdraw **2.28x** (committed game
6.38x), 271 draw calls. Full playthrough reaches the level card.

Also fixed: `embed_matra_runner.py` wrote its outputs with Windows line endings, so every rebuild
showed ~14,000 changed lines in `train_modules.js` / `train_styles.css`. It writes LF now.
Sources (video, bridge painting, generated candidates) are in `1_SPEC/game_art_src/bridge/`, not the bundle.


## r69 — the parapet redrawn; pillars removed

Yasir: "remove the pillars and why this railing looks distorted and low quality".

- **Pillars off** (`SHOW_POSTS = false`; the code stays). The wall's blocks and carved panels scroll
  past along both edges at the deck's speed, which is the near motion the posts were carrying.
- **Why it stepped:** the wall's inner face was drawn in upright slices scaled straight up and down,
  so inside each slice every stone course was LEVEL while on the face it slopes to the vanishing
  point - a staircase. Each slice is now sheared by an affine transform to the face's mid-height
  slope, so a course leaves one slice where the next picks it up (leftover under a pixel at 5 px
  slices). Composed with the current transform, so the walls still shake with the frame.
- **Why it was soft:** the texture had been shrunk to 240 px and the nearest wall is ~500 device px
  tall. It ships at its painted height (3168x384) now, with two pre-shrunk copies so the far wall
  does not shimmer (canvas has no mipmaps).
- **Blue hairline at the wall's foot:** deck and wall both had soft clip edges on the same line, so
  the lake showed through. The deck now runs 3 % under the wall.
- **The deck, same class of fault:** it was rendered at CSS resolution and stretched 2x on a 2x
  screen, with 4-row bands that drew each diagonal slab joint as a staircase. Device resolution,
  1-row bands now. (A variable-name collision in `bands()` was caught by the fill measurement on
  the way: the new scale parameter shared the name of the tile-wrap offset.)

Cost per frame: sprite overdraw 2.03x, fill overdraw 1.81x. Full playthrough reaches the level card.


## r70 — new background music

Yasir: "generate a better bgm for the game just like subway surfer, kid friendly and not dull".

An **original** piece in that spirit (nothing taken from Subway Surfers, which is copyrighted),
composed and rendered in code by `1_SPEC/gen_bgm.py`: 112 BPM, C major over C-G-Am-F; punchy kick,
clap on 2 and 4, busy hats and shaker, a bouncing octave bass and off-beat chord stabs pumped by the
kick, a bright singable pulse lead with a dotted-eighth echo, bells answering it. 32 bars (68.6 s)
in four sections - groove + tune, hook, a breakdown that builds back up, everything - ending on a
drum fill into bar 1. Rendered twice end to end and the second pass kept, so the file is circular
to the sample; the browser decodes it to exactly 68.571 s, i.e. no encoder padding and no gap.
Measured: RMS -14.3 dBFS, crest 13.3 dB, 0 clipped samples, the breakdown 4 dB down. 978 KB (Vorbis).

It plays through the existing music bus, looped on the audio clock (an `<audio loop>` leaves a gap
at the wrap), so it still fades up, ducks under every spoken word (bus 0.28 -> 0.07) and stops
with the lesson. Until the file decodes, or if it ever fails, the old synthesised bed plays, so the
game is never silent. Verified in the browser: decoded, stereo, playing, ducked under the opening
instruction and up to full level after it.


## r71 — Yasir's music at 60 %, ducking under every voice and effect, cartoon hit/fall

**The music.** His `game_bgm1.mp3` is 11 min 15 s and 11.6 MB - two pieces joined by a gap at 1:34 -
mastered loud (-12.6 LUFS) with peaks over full scale. A level lasts a couple of minutes and a
file that long cannot loop cleanly, so the game plays a **seamless loop cut from it**
(`1_SPEC/prepare_bgm_loop.py`): tempo measured at ~94 BPM, and out of every start and whole-bar
length in the steady stretch 1:40-3:52 the pair whose seam sounds most alike was taken -
**1:52.1 -> 3:44.5, exactly 44 bars (112.3 s)**, 0.966 similarity, aligned to the sample and joined
with a 0.4 s equal-power crossfade. **1.87 MB** instead of 11.6. His mastering is untouched; the
60 % is a gain in the game. The full file is in `1_SPEC/game_art_src/bgm/`.

**Levels, from one controller.** Every source claims the duck under its own name, so one ending
cannot lift the music while another is still going: someone speaking -> 0.15 (a quarter of 0.6);
a sound effect -> 0.30 for its length; neither -> 0.60. Speech covers the game's own voice lines
AND the lesson's instruction that opens the game - which was never ducked before. That one is
watched off the engine's own "a clip is playing" flag every frame, not off a timer: measured, the
instruction can start seconds after the game mounts, and a timer had already released the duck.
Measured in the browser: 0.15 for the whole of the instruction (vo-lock on 11.5-15.2 s), back to
0.6 after it, 0.15 under the voice lines after each hit, 0.30 through the fall's effects.

**Hit and fall.** Every wrong-portal hit gets a cartoon **bonk** (a hollow wooden knock). The fall
that ends a run adds a **slide whistle** falling 2.5 octaves while she tumbles and a **boing** as she
lands on her seat, timed to the fall sheet; her "try again" line now waits 1.35 s for them instead
of being talked over. All synthesised in WebAudio - no files.


## r72 — music to 80 %

Yasir: "60% isn't enough make it 80%". Bus level 0.60 -> **0.80**; the ducks keep their proportions: a quarter under speech (0.20), half under an effect (0.40). Peak headroom at 80 %: -2.9 dBFS after the master gain.


## r73 — cover title image, smoke off the title, speaker disabled during VO, new feedback sounds

- **Cover title:** `title.png` (trimmed to its ink, 1200x341) replaces the text title; original kept
  in `1_SPEC/game_art_src/cover/`.
- **Smoke:** the steam rose 0.62 of the train's height - on the cover, straight into the title.
  On the cover only it now rises 0.38 of that with slightly smaller puffs, and the title sits above
  the train (z 6). Measured over 40 samples of the arrival: 0 visible puffs over the title.
- **Speaker buttons** (header chip, tutorial-card chip, cover chip): no pointer events and dimmed
  (opacity .45, greyed) while any clip plays, driven off the engine's `vo-lock`; back to normal the
  moment it ends. Measured on the cover and on a lesson screen, during and after VO.
- **Feedback sounds:** the lesson never played its sfx_correct/sfx_wrong files - right and wrong
  answers went through two synthesised tones. Yasir's `correct.mp3` / `incorrect.mp3` replace them on
  every screen (7 + 7 call sites in the train module set) and in the runner (decoded buffers through
  the effects bus, so they duck the music). Levelled first: correct was -8 LUFS with peaks over full
  scale and incorrect -14.2, so both are now -15 LUFS (`sfx_fb_correct.ogg`, `sfx_fb_incorrect.ogg`,
  declared in the card so they preload). The synthesised tones stay as the fallback. Verified: a
  wrong tap plays sfx_fb_incorrect, the right one sfx_fb_correct; the runner fetches both.


## r74 — text title back, cover train lifted

Yasir: remove the title image and bring back the original text; move the train a little up.
The image injection is gone and the text title is back (the image is kept in
`1_SPEC/game_art_src/cover/`). The cover train is lifted 22 px (`position:relative`, so nothing
else on the cover moves). The title stays layered above the train, and because the chimney is
now closer to it the plume is shorter again (0.26 of its activity-screen rise).


## r75 — cover steam out of the chimney's mouth

Measured with the plume frozen: the puffs were born 6 px down inside the yellow chimney cap and,
with the short rise, sat on it like a blob. On the cover they now start at the rim (7 px higher),
climb a little further (0.36 of the activity-screen rise) and lean 14 px back-left - away from the
title, which begins just right of the chimney. The faintest top puffs reach the empty lower-left
corner of the title's layout box but stay clear of the letters, and the title is layered above them.


## r76 — the runner speaks in the lesson's voice

Yasir: the runner's TTS "does not feel good and appealing" - generate Indian Hindi TTS.

**Why it sounded robotic:** none of the runner's 54 lines (8 game lines + 46 words) had ever been
recorded. Every one fell through to the device's built-in speech synthesiser.

**Recorded:** all 54 with Gemini TTS in **Leda**, the lesson's own narrator, so the game sounds like
the rest of the lesson. The first pass put 13 clips on fallback voices (Kore / Despina) and refused
one (मधु) - a game that changes narrator word to word sounds broken - so those were re-taken in
Leda only, with small punctuation variants, until each landed (मधु on the 6th try). Then every clip
had its dead air trimmed (16.6 s in total), was levelled to the lesson's VO loudness (-16 LUFS) and
encoded mono Vorbis: 54 files, 512 KB, in `assets/MatraRunner/voice/`. No take is truncated
(fastest 0.060 s/char against the lesson's 0.069 norm). Recording card kept in
`1_SPEC/game_art_src/runner_voice/runner_voice_card.json` - `gen_tts.py <card> --voice Leda --ext ogg`.

**Register:** the game's lines were तुम-form (चुनो / देखो / कोशिश करो). The SME's round-3 rule is आप
throughout, and the lesson build fails any clip with a तुम form - these only escaped because they had
never been recorded. They are recorded, and shown, as चुनिए / देखिए / कीजिए.

**The player, fixed twice over:** it created each clip on first use and gave up after 700 ms,
falling back to device speech and marking the word missing for good (five words did in one run);
warming 54 `<audio>` elements instead did not work either (the browser fetched 33). The clips are
now decoded into memory at boot and played through the game's audio engine, like the music and
effects. A line cut short can no longer start the next one on top of a new line. Verified in two
full runs: 54/54 fetched, **0 device-speech fallbacks**, no console errors.

## r77 — menu jumps go quiet, no first-draft flash, no panels in the game, one word spoken

**1. Skipping pages with the menu.** Nothing on the jump path stopped sound: the page left behind
kept talking (up to 3.4 s into the next page), the cover greeting ran on over page 1, and the
train's chug / whistle carried over. Now arriving on any page stops the engine's voice and every
train sound still playing (`mountSlide` → `stopAudio()` + `__stopLessonSfx()`; train sounds are
tracked while they play). A jump also cancels a phase transition in flight, which would otherwise
mount the page it was heading for on top of the chosen one. The normal flow is unchanged.
Also: the engine's 7 s "idle" reminder replayed the game page's instruction over the running game
(the child steers with keys/swipes the engine never sees) — the game page is now excluded, like
the celebration. Verified with real playback over 3 jump runs: zero clips from a page left behind.

**2. The first-draft game on entry.** On a first visit the runner drew its code-only fallback
(night sky, flat road, placeholder tiger) for ~0.8 s while its art downloaded. A curtain in the
valley's colours now covers the game until the first frame's art is in (capped at 3.5 s), then
fades; and 10 s after the lesson opens, the game's art, music and video are fetched quietly into
the cache so on a normal run the curtain barely shows. Cold load (cache off): curtain only, then
the real bridge — no first-draft frame.

**3. No instruction panels.** At the end of a level the screen blurs and dims and only the voice
plays: «वाह! अब इस लेवल को पार कीजिए।» + the next goal, then the next level starts. The fall
and the end of the game veil the same way; no card is shown anywhere (the win screen element is
kept, hidden, because the lesson listens for it to move on). New clip `level_next.ogg`.

**4. The voice.** Goals are now «छोटी उ की मात्रा वाले शब्द पकड़िए।» / «बड़ी ऊ की मात्रा वाले शब्द
पकड़िए।» (re-recorded in Leda, -16 LUFS). At each pair of portals only the TARGET word — the one to
catch — is spoken. The first goal waits for the lesson's own instruction to finish instead of
speaking over it.

## r78 — the game's voice plays, every target word is heard, one portal colour, wider spacing

**Why no VO played.** Two causes. (a) Opened as a file (double-clicked, `file://`), the browser
refuses `fetch()` of local files, and the game loaded its voice, music and feedback sounds only
that way: the voice fell to the device's TTS, which has no Hindi voice on Windows (silence), the
music to the synthesised bed, the feedback to synthesised tones. They now play through `<audio>`
elements there, as the lesson's own voice always has. The music keeps its 80 % level and its duck
under voice/effects (its volume follows the music bus). (b) Even on a server, each target word was
spoken while the previous pair was still ahead, and passing that pair stopped the voice for its
feedback - cutting the word off. From the second pair on, no word was heard.

**Now:** the word to catch is spoken only for the next pair, after the previous pair's feedback.
If it has not been heard to the end by the time its pair is two-thirds of the way in, the run
eases to a fifth of its speed until it has (at most 7 s). Verified, file:// and http, 9 pairs
each including two wrong answers: every word heard, 4.0-5.4 s before its pair arrived.

**Portals:** both the same (the golden variant is no longer used); only the words differ.

**Spacing:** pairs are 1.05 of the road apart instead of 0.52 - about 6.5 s from one pair to the
next. A level no longer makes one spare pair at its end. After the veil, the next level's first
pair starts nearer, so its word follows the goal by about two to three seconds.

## r79 — the level transition's voice gets the stage; the target word plays at the portal

**The transition.** «वाह! अब इस लेवल को पार कीजिए।» started in the same instant as the level-up
chime, while the last «शाबाश!» was being cut off, and the music rose in the gap between the two
lines. Now: «शाबाश!» is heard out, then the screen veils and the chime plays, and a second later
the two lines are spoken with the music held down (0.18) for the whole transition.

**The target word** is spoken as its pair comes near (0.62 of the road - about 3.5 s before it
arrives, the word ending ~3.3 s before), only after 0.7 s of quiet, and never over the lesson's
voice. After a wrong answer the feedback ends on the missed pair's right word («सही शब्द है
सूरज»); the next target used to follow within 0.3 s - two words back to back - and now waits
1.5 s of quiet (measured 1.7-1.8 s). If its word is late the run slows until it has been heard.
After the transition, level 2's first pair starts nearer so its word follows the goal sooner.
Verified in a visible Chrome with real clicks and key presses (normal autoplay rules), opened as a
file and from a server: every line played, no refused play, 8/8 target words heard 3.0-3.7 s
before their pair.

## r80 — why the voice worked here and not in manual testing; the game's sounds cache-busted

**Cause.** Manual testing is on the Vercel deployment (hi-02-h11-l02-s02-dev-handoff.vercel.app),
which deploys from GitHub - and r77-r79 were never committed. Checked on 2026-09-29: the live
page is the r76 build (speaks both portal words, no level transition line), `level_next.ogg` is
404, and `goal_u.ogg` is the old take (22 KB against 26 KB here).

**Second trap.** vercel.json serves `/assets/` as `immutable` for a year. The lesson's own clips
carry `?v=<hash of the audio folder>` (r17) so a re-recording reaches the browser; the game's did
not, so even after a deploy a browser that had the old goal_u / goal_uu would keep them. The game's
voice clips, music and feedback sounds now carry `?v=` too, stamped by the build from their content
(`__MR_AUDIO_V_STAMP__`).

**To go live:** commit and push r77-r80, including the new `level_next.ogg`.

## r81 — the runner game speaks with the new recorded VO

The 55 WAVs supplied in `assets/MatraRunner/voice/voiceovers/` (one per clip, same Audio IDs) now
replace the Gemini TTS takes. As delivered they carried ~0.5 s of silence at each end and ranged
from -14 to -23.5 LUFS, so `1_SPEC/prepare_runner_voice.py` trims the dead air (30 ms kept before
the voice, 90 ms after), levels each clip to -16 LUFS behind a -3 dBFS peak limiter (Vorbis
overshoots sharp consonants), and encodes mono Vorbis 24 kHz. Result: -17.8 to -15.6 LUFS, highest
peak -1.3 dBFS, 55/55. The runner audio stamp moved (ac8f414d709c -> 4a03b8fa4403), so browsers
fetch the new takes. Played through: every line and target word plays; words end ~3 s before their
pair. Sources copied to `1_SPEC/game_art_src/runner_voice/source_wav/`; the previous takes kept in
`runner_voice/takes_gemini_leda_r79/`; the `voiceovers/` folder is excluded from the deploy.

## r82 — the celebration button of HI02H11_L01_S01; the transition Swifty trimmed

**Celebration button.** Matched to github.com/khugshalharshvardhan/HI02H11_L01_S01 (r5n there):
`#endBtn` is the arrow alone, with «आगे बढ़ें» kept as its `aria-label`. Everything else about it
(yellow pill, white 4.5 px border, shadows, 52 px arrow, position) was already identical. Measured
side by side at 1382x850: both **133.6 x 88 px at (620, 485)**, text empty, `::after` "→" 52 px.

**Transition Swifty.** She used to rise, peek, blink and glance around for 1.4 s, rise again and pause
half a second before her first word at 3.82 s. The blink-and-look-around (frames 20-35) is cut - frame
19 and frame 35 are the same picture, so the seek runs straight into the rise with no jump - and the
pause before she speaks is 150 ms instead of 490. 84 -> 68 frames, 9.7 -> 7.9 s, 1.3 MB.
`assets/UI/swifty_gate_seek.webp` (a new name: the deployment caches assets/ as immutable, so the
old name would keep serving the long version), `CARD.gate.talk_at_ms` 3820 -> **1960**. Measured: the
transition VO starts **1 962 ms** after the gate opens (was 3 825), on her speaking frames.
`assets/UI/swifty_gate.webp` is no longer used.

## r83 — matra highlight reaches the whole ू; a watch-only sort page; fresh shuffles; the third gate moved

**1. The ू highlight (कबूतर, दूध).** The orange band below the baseline reached a fixed 18 % past
the consonant; ू under ब and द curls further, so its right-hand end stayed navy (330 px of navy
measured on दूध). Each cluster's mark is now drawn off-screen with and without the matra in the
element's own font at 4x, and the band reaches the mark's real left/right edges (+1.5 px). Only the
extent comes from the canvas - the orange is still the page's own text. The widened part starts
4 % of the font size lower, so the neighbours' one-pixel dip under the baseline (त's bowl) is not
caught. Measured: दूध, कबूतर, पुल, गुड़, फूल and the demo's पुल/फूल - 0 navy px left, 0 stray orange.

**2. Page 9 is new: a watch-only copy of the sort screen** (old page 9 is now page 10). Same
coaches, two cards - पुल and फूल (not two of page 9's own words, which would hand the child half
its answers). The cards are read out, then a hand lands on each card (its name again), carries it
into its coach and lets go; the drop is the real one, then «पुल में छोटी उ की मात्रा है, इसलिए पुल उ
वाले डिब्बे में गया।» / the फूल line, and «अब आप भी ऐसे ही करके देखिए।». The cards cannot be
touched; the page finishes and moves on by itself (≈29 s). `TRAIN_SORT data.demo`; new clips
`vo_g4d_prompt / _pul / _phool / _end` (Gemini Leda, -16 LUFS).

**3. Options shuffle on every visit - and never repeat the last visit's order.** They already
shuffled, but a fair shuffle repeats by chance (every other visit on a two-card screen). Each
screen now remembers its last deal for the session. 6 visits x 12 option pages: 0 back-to-back
repeats.

**4. «अब आपकी बारी!» plays after page 17, just before the runner game**, not before page 12
(the first practice page). `CARD.gate.at = {"round3": "MG1"}` pins a round's gate to a slide - the
practice pages keep their phase, so their hint and hand rules are unchanged. Checked: page 5 -> 6
«चलिए, साथ में करें!», page 11 -> 12 no transition, page 17 -> 18 «अब आपकी बारी!».

## r84 — sounds for the play button and the next arrow

Yasir's `swiftpal_sfx_3_play_button.wav` / `swiftpal_sfx_4_next_button.wav` are now
`assets/Audio/sfx_play_button.ogg` / `sfx_next_button.ogg` (Vorbis, levels as supplied: -24 / -28.6
LUFS, the same level as the existing tap sound). The WAVs moved to `1_SPEC/game_art_src/sfx/`.
`CARD.ui_sfx` names them; declared in COPY_AUDIO.
- **Play** (landing `#sgBtn`): once per start, after the double-tap guard.
- **Next** (`#navBtn` and the celebration's `#endBtn`): a listener on the button itself, since
  every mechanic re-assigns `navBtn.onclick`. It answers a real press only - a disabled arrow is
  silent, and pages that advance by themselves (auto-advance calls onclick() directly) are silent.
Verified with real clicks, as a file and over http: play double-clicked -> 1 sound; next arrow ->
sound and the page moves on; disabled arrow -> nothing; page 9 moving itself on -> nothing;
celebration arrow -> sound.

## r85 — the lip-synced Swiftie on the celebration screen (celebration_kit/)

Followed `celebration_kit/README.md`. The line already starts with «शाबाश!» (`vo_cel_prompt`:
«शाबाश! आज हमने सीखा, …»), so no wording changed.
- **Sheets** `cel_shabaash / cel_talk / cel_idle.webp` and `cel_meta.json` used unchanged; the build
  copies the sheets into `assets/UI/celebration/` (byte-identical check) on every build.
- **Track** measured by the kit's `make_lipsync.py` from `vo_cel_prompt.ogg` on every build (7 971 ms,
  318 steps), so a re-recorded VO re-syncs. Meta + track ride on the card as `CARD.end_anim`.
- **Player** `swiftie_celebration.js/.css` injected after the engine with the README's wrapper of
  `SlideModules.CELEBRATION.mount` - the engine file is not edited. The stock `.end-mascot` is hidden
  and a 300-wide host takes its place at the stock mascot's own height (357.72 px, not the kit's 358 -
  0.28 px was a screen pixel of arrow at 1920x1080). Arrow: identical to 0.01 px at 4 window sizes.
- **Clock.** Passed as the kit's `audio` (paused / ended / currentTime): how long the clip has really
  been audible - the Web Audio source's start + the context's output latency when served, the
  element's `playing` event timestamp when opened as a file. The celebration mounts in a burst of
  work and the page stalls 150-330 ms as the clip starts (the stock screen does too); an
  `isSounding` flag is only seen after the stall and put the lip-sync 170-1 470 ms late as a file.
- **Warm-up.** The three sheets (~2 MB) are fetched 12 s after the lesson loads, so on a first visit
  they are cached before the last page (throttled 4 Mbit/s test: ready well before the jump).

Measured with the real audio, logging `.swc-sprite` data-sheet / data-f / data-t: talk-phase mouth =
track at t+16 ms in 98.3-100 % of samples per run (final build: 100 / 100 / 100 % served, 100 / 99.7 %
as a file); every miss is a sample whose t+16 lands exactly on a 25 ms step boundary (data-t is
rounded to whole ms), none away from a syllable edge; 0 open-mouth frames after the VO in every run.

## r86 — the cover title on a cloud (Yasir's mockup)

Only the title changed. «मात्राओं की रेल» stays live text, now 84 px (was 60) in a brighter bold blue
with a darker edge under it, on a cloud cut out of Yasir's mockup (`1_SPEC/extract_title_cloud.py`:
the words removed by harmonic fill, the cloud keyed off the sky with a smooth anti-aliased edge, the
smoke tail to the mockup's chimney trimmed along the two lobes' own circles) ->
`assets/UI/title_cloud.webp` (10 KB); source and mockup kept in `1_SPEC/game_art_src/cover/`.
The title's box keeps its 66 px height and both the words and the cloud move with `top` / absolute
positioning, so the train, Swifty, the speaker, the play button and every sound are where and what
they were (measured: same boxes to the pixel). The cloud floats over the card's top edge. The
chimney puffs already pass behind the title layer, so they now climb into the cloud's underside and
vanish in it (rise 0.36 -> 0.62 of the train's height, puffs 0.8 -> 1.15 size).

## r87 — the cover card holds the title cloud

Yasir: "the title is getting out of the main area - increase this area slightly so that it adjusts in
the box". The cover card grows 80 px at the top (456 -> 536) and its content is pushed down by the
same 80 px, so the cloud now sits inside the frame and the title, train, Swifty, speaker and play
button keep their places relative to each other and to the frame; the card stays centred on the
screen, so the whole group sits ~40 px lower. The frame is now CSS drawn to the measurements of
`start_card.webp` (9 px white border as an inset shadow, 44 px corners, white fill at 166/255) - a
stretched image would squash its corners and a nine-slice left a seam. Checked at 1024x700 and
1382x850; the play button still starts the lesson with its sound.

## r88 — the title cloud is the train's own smoke, in CSS, and forms in sequence

Yasir: "the train smoke and the smoke on which the text is written do not look the same"; the cover
should go "train arrives with smoke -> the smoke gets bigger -> the text is written on it",
smoothly, and "do not use an image for the cloud/smoke - make it using CSS".
- The image cloud (r86) is gone (`title_cloud.webp` and its extraction script removed). The cloud is
  now thirteen puffs drawn with the chimney puff's own radial gradient (white highlight, blue-grey
  body, soft rim) round a soft body, plus a white core behind the words so the overlaps blend into
  one cloud. Same colours, same blur as `.train-steam`.
- The sequence (CSS transitions on transform / opacity / mask, started from the train's arrival):
  the train parks -> every puff of the cloud leaves the chimney, nearest first, and swells into its
  place (~1.4 s) -> the title is written left to right behind a soft-edged mask (1.25 s) -> the
  greeting starts (it now waits for the matras AND the title; the 7 s backstop still stands).
  Recorded with Chrome's screencast: puffs leave the chimney ~0.4 s after the train parks, the cloud
  is complete ~1 s later, the words are written over the next ~0.7 s.
- Reduced motion: the finished cover at once. Backstop: the title is there by 9 s regardless.
- Unchanged: the train and its arrival, the steam, the matra pops and sounds, Swifty, the speaker,
  the play button, the card (r87) - same positions to the pixel.

## r91 — the cloud is built out of the chimney's smoke; title tops; the train arrives inside the card

Yasir: "all the smoke should come from the chimney and on that smoke the title will be written -
currently the train smokes and then another cloud appears"; "the text gets cut from the top"; "the
train should be inside the main rectangular box".
- **A stream from the chimney.** The puffs now leave the chimney one after another (135 ms apart,
  nearest place first), each at the size of an ordinary steam puff: up out of the stack, then
  across, swelling into its place - the cloud piles up out of the train's smoke (~2.8 s). Its soft
  inside thickens as the puffs gather. Still one start and one end for every piece (compositor-run,
  no per-frame repaint). Then the title is written; then the greeting.
- **Title tops.** The writing's mask had 12 px above an 84 px title on a 66 px line, so the matras
  and the bindu of «ओं» / «रे» were cut. 48 px now (40 below).
- **Inside the card.** The train slides in from 86 % of its width to the right, past the card's
  edge; for the arrival it is clipped to the inside of the card's frame and the clip comes off once
  it has parked. Measured at the first frame: rail to x 1286, card edge 1200, train cut at the
  inner border. Swifty and the speaker (which overlap the corner on purpose) are not clipped.
Measured: no slow frames while the cloud forms and the title is written (3 runs); the only long
task is the one that starts the animation, before anything moves.

## r92 — the cloud collects from the moving train; the title on an arch

Yasir: "as the train moves ahead the smoke will start collecting, and on it the title will appear;
also make the title text a little curved" (match the mockup).
- **Collected on the move.** The cloud starts with the train's run. The train comes in from the
  right and its chimney passes under the cloud, so each puff leaves the chimney as the chimney
  passes under the puff's place (the arrival curve, cubic-bezier(.40,.20,.45,1) over 3.4 s, is
  evaluated to know where the chimney is at every moment), rises out of the stack trailing a little
  behind the train, and settles: the cloud fills in right to left behind the train and is complete
  as it parks. Three puffs then join the parked chimney to the cloud's underside, as on the mockup.
  Then the matras pop, the title is written, Swifty greets. The train sets off 0.6 s after the
  loading screen clears, once the cover is fully showing.
- **The arch.** The three words are three inline blocks: the middle one highest, the outer ones
  lower and tilted outwards (±5.5°). Each word stays one piece of text - bending letters one by one
  would break the Hindi joins and the headline.
- Measured: the remaining long frames during the train's run (130-350 ms in total on this machine,
  CPU 73 % busy with other programs) are the train's own wheel drawing - page 6's identical train
  shows the same - not the cloud or the title. A trial of holding the lesson's background warm-ups
  until after the cover showed no gain and was taken back out of the engine.

## r93 — the cloud arched like the title; the title bent along a true arc

Yasir: "can't we make the cloud curve too - it does not feel curved from the bottom; also make the
text curve as in the reference image".
- **The cloud.** Every piece of it - the bumps along the top, the soft inside (now five overlapping
  ovals and three white cores along the curve, since one straight bar cannot bend) and the
  underside - is laid on one arch: the ends sit 40 px lower than the middle. The column from the
  chimney joins the arched underside.
- **The title.** On the mockup the headline is one smooth curve. The words are now cut into
  grapheme clusters - whole aksharas: «मा» «त्रा» «ओं» «की» «रे» «ल» - and each is lifted and tilted
  to a true arc (ends 20 px lower, each piece at the curve's slope), so no conjunct or matra is split
  and the headline runs as one arch. If a browser's segmenter would split a conjunct (an older ICU:
  a piece ending in a virama) it falls back to whole words. Laid out again once the font is in and
  just before the words are written.
- The sequence is unchanged: the cloud collects behind the moving train, the matras pop, the title
  is written, Swifty greets. No console errors.

## r94 — the title a little lower on its cloud

Yasir: "move the title text slightly down - part of the text is getting out of the cloud". The words
are 10 px lower (`#sgTitle` top -36 -> -26 px) and the cloud 10 px higher inside the title's box
(`--tcl-top` -46 -> -56 px), so the cloud, the train and everything else stay exactly where they were
and only the words move. Measured at 1382x850: words 158..238 px, cloud 100..285 px.

## r95 — the title another 8 px lower

Yasir: "move the text a little more down". Words top -26 -> -18 px, cloud `--tcl-top` -56 -> -64 px,
so again only the words move. Measured at 1382x850: words 165..245 px, cloud 100..285 px.

## r96 — used cards leave no box; no छोटी/बड़ी on screen; no leftover star

Yasir: "the dragged element's dashed border should be removed and the next element will move";
"wherever it's written बड़ी __ / छोटी __ remove बड़ी/छोटी - only in the VO"; "from page 14 to 17 a
small star remains after the drop - remove it".
- **The row closes up.** `closeGap()` folds the slot a used card leaves - width and the row's gap
  to nothing over 320 ms - so the cards after it slide across. Sort trays (pages 9, 10, 11, 13: the
  dashed shadow box is gone and folds away), page 12 (the dimmed letter tile now leaves), pages 14-17
  (the emptied option folds away). Measured with real drags: page 10 the three cards slid 60 px
  left; page 12 the remaining three letters slid 61 px; page 14 the two other options closed up.
- **On-screen text.** Pages 6-8 headings now read «“उ” की मात्रा वाले शब्द पर टैप कीजिए।» /
  «“ऊ” …»; the runner game's level names, its wrong-answer pop and its fall tip read «उ ( ु )» /
  «ऊ ( ू )». The VO is unchanged (no clip re-recorded; all 145 audio files kept). A scan of every
  page's visible text: no छोटी/बड़ी anywhere.
- **The star.** The ✨ placed over the chosen option on pages 14-17 is gone; its sparkle sound stays.
  Measured: 0 stars during the 1.6 s after a correct drop.

## r97 — page 1 letters stay lit; the next arrow pulses; pages 12-14

- **Page 1.** Both pairs (उ → ु, ऊ → ू) stay lit: the first no longer fades to 42 % when the second
  arrives, and at the end both are lit with their matra glowing. Measured: both active, letter
  opacity 1, during the second pair's line and after it.
- **The next arrow pulses** whenever it is live (`.nav-btn.active:not(:disabled)`, scale 1 -> 1.09,
  1.3 s loop, centred). A disabled arrow does not pulse; reduced motion: no pulse. Measured on page
  1: scale 1.00 -> 1.09 -> 1.00; page 2 during its VO: disabled, no animation.
- **Page 12** heading «चित्र देखकर सही अक्षर से शब्द पूरा कीजिए।» (the VO already said this).
- **Page 13** heading and VO «चित्र को सुनिए और उसे सही मात्रा वाले डिब्बे में डालिए।»; `vo_p2_prompt`
  re-recorded (Gemini Leda, -16 LUFS, 3.84 s). Only the instruction changed - the per-card rung-2
  lines still say «बोगी».
- **Page 14** picture: Yasir's cheerful boy (`scn_khush_boy.png`, his sticker placed full height on a
  soft sky-to-cream 800x600 backdrop to fit the scene frame); the rung-2 glow is on his face. The
  original file moved to `1_SPEC/game_art_src/scenes/`. `scn_seema_khush.png` is no longer used.
  The sentence still names सीमा (a girl's name) - left as it is, pending Yasir's call.

## r98 — the cover's play button appears when the greeting ends, and pulses

Yasir: "the play button will only enable once the VO is finished; once it is finished the play button
appears and it should have a pulse effect, without any glow".
- Not on screen at all (no grey disc) until the greeting has finished; then it pops in (0.45 s) and
  pulses while it waits - a plain scale 1 -> 1.09, no ring or glow (the soft shadow is part of the
  button art). `.sg-btn.lt-play-shown`, set the first time the button becomes ready. A later replay
  of the greeting from the speaker greys it out while it plays, as before; it does not vanish.
- Engine (this lesson's copy): the cover's 12 s "never strand the child" timer enabled the button in
  the MIDDLE of the greeting, which with this cover's longer opening still speaks at 12 s. It now
  waits while a clip is sounding (re-checks each second, 25 s cap).
- A watcher bug caught in testing and fixed before shipping: classList.add() rewrites the class
  attribute even when the class is present, so adding it from inside its own MutationObserver looped
  until the tab crashed. It now adds once and disconnects.
Measured (2 runs): greeting 8.6 -> 13.2 s, button first visible 13.25 s / 13.38 s, 0 visible frames
before the greeting ended; scale 1.000 .. 1.090; tapping it starts the lesson; no console errors.

## r99 — the play button disabled during the greeting; background music for the lesson

- **Play button.** Yasir: "you removed the play button - it should be disabled, and once the VO is
  completed it will enable". r98 hid it until the greeting ended; it is back on screen from the
  start as the grey disabled disc, turns live when the greeting ends and pulses (scale only, no
  glow) while it waits. The r98 fix to the 12 s timer stays.
- **Background music.** Yasir's "Standard Background Music 2.mp3" (4:00, -16 LUFS) -> `bgm_lesson.ogg`
  (Vorbis q3, 2.4 MB; the mp3 kept in `1_SPEC/game_art_src/bgm/`). One looping <audio> element (a
  decoded 4-minute buffer would be ~90 MB on a tablet), volume steered every frame: 0.68 at rest,
  0.32 under a sound effect (train chug/whistle, right/wrong, button sounds, celebration - the train's
  <audio> effects are tracked, the engine's buffer effects via a wrapper of `playSfx`), 0.16 under any
  voice-over (`isPlaying`); down in ~0.12 s, back up in ~0.6 s. Faded out and paused on the runner
  game's page (it has its own music), back after it. Starts on the cover if the browser allows sound
  there, otherwise on the first touch.
Measured: cover - button visible and disabled for the whole greeting, then live and pulsing; music
0.16 under the greeting, up to 0.68 between; pages 1+ - 0.16 under VO; game page 0 and paused; back
on page 17 - playing, 0.66 at rest. No console errors.
Note: iPad Safari ignores an <audio> element's volume, so there the music would not duck.

## r100 — page 14: the right picture changed; music starts with the play button

- **Page 14.** r97 replaced the wrong picture: Yasir's "image of boy" is the «खुश» answer card's picture
  (`obj_khush`), not the scene (सीमा). The scene is सीमा again (`scn_seema_khush`, its face glow
  restored - and it matches the sentence «सीमा आज बहुत खुश है।» again); `scn_khush_boy.png` removed.
  The «खुश» card now shows Yasir's boy (cut out, 504x575, the old card's height). The same card
  picture is used on page 17's «खुश» option, which changes with it. Previous card picture kept as
  `1_SPEC/game_art_src/scenes/obj_khush_previous.png`.
- **Music.** Yasir: "the bg music should only play when we click on the play button". It starts with
  the play button's tap and nothing else - not on the cover, not on another touch. Measured: no
  music on the cover after the greeting or after a tap on the card; playing after the play tap
  (0.16 under page 1's VO).

## r101 — runner game: a wrong answer brings the same question back

Yasir: "in the matra runner game, for an incorrect answer don't switch to the next question, show the
same question again". A wrong portal still costs a heart and plays «फिर से देखिए। सही शब्द है …»;
then the next pair of portals carries the SAME two words (`repeatQuestion`), their sides dealt again so
the child reads rather than just switching lanes, and its target word is spoken as it comes near.
Only a right answer finishes a question - counts towards the level's 6 and fills a progress dot.
Three wrong in a level still ends in the fall and a restart of that level.
Measured (in-page pilot, pairs 1 and 3 answered wrong): बन्दूक wrong -> बन्दूक again -> right;
अंगूर wrong -> अंगूर again -> right; questions done 0,0,1,1,2,3,4,5 -> level 2 after the 6th right
answer; hearts 3 -> 2 -> 1 (+1 at the level change). No console errors.
The standalone copy in Downloads (Matra_Runner_Game) was not updated.

## r102 — runner game: no slow-down after a mistake

Yasir: "after making a mistake the character slows down for a fraction of a second - we don't need to
slow it down". It was r78's wait: the long wrong-answer feedback («फिर से देखिए। सही शब्द है …») made
the next word late, and the run eased to a fifth of its speed until that word had been heard. Removed -
the run keeps its speed always. Since r101 the next pair repeats the word the feedback has just said,
so nothing is lost; the beat before that word after a mistake is 600 ms (was 1500) so it still lands
early. Measured: 3 s after each of two wrong answers the run is at 100 % of full pace; no slow stretch
anywhere (the only dips are single frames of timing noise, as before); every target word, repeats
included, was heard before its pair arrived.

## r103 — eight changes

1. **Cover:** no disabled play button - it is not on screen until the greeting has finished (nor
   while a replay of it plays); then it pops in and pulses. Measured: 0 visible samples during the
   greeting, visible after.
2. **Transitions:** the text appears when Swiftee says it. `CARD.gate.title_cue_ms` = where the phrase
   starts in each kit clip (tutorial «चलिए, शुरू करें!» 4030 ms, guided «चलिए, साथ में करें!» 3970,
   practice «अब आपकी बारी!» 1260 - silencedetect); the engine holds `#phaseGateTitle` hidden until
   then and pops it in. Measured: VO start -> text +4.16 s on the first transition.
3. **Pages 3 and 5:** the picture (`.meet-pic-box.mex-pic .pic-img`) 220 -> 270 px.
4. **Pages 9 and 10 are one train:** the demo hands its train on (`keep_train_next`): no departure
   after the demo, no arrival and no slide-in on page 10 - the same train stands there, the heading
   changes and the four cards come into the tray. Measured: page 10 mounted parked, not entering,
   no slide-in, no departure seen.
5. **Page 10, rung 2:** every option still in the tray is read aloud, one by one, its matra
   highlighted while it is read; then the card's own rung-2 line. (The coach labels are no longer
   read at this rung.) Measured: सुई, आलू, गुड़, सूरज, then vo_g4_h2_sui.
6. **Page 13, rung 2:** every picture still in the tray shows its word under it while its name is
   read, one by one, no matra highlight; then the card's rung-2 line. Measured: कबूतर, मुकुट, तरबूज,
   पुल, 0 highlights.
7. **Page 15:** the correct line «शाबाश! सही शब्द चुनकर वाक्य पूरा किया।» («मैंने» removed);
   `vo_p4_correct` re-recorded (Leda, -16 LUFS).
8. **Bigger drop area on the train screens:** the engine's drop test (`_zoneAt`) lets a zone catch
   from a bigger area; every coach on the sort screens (pages 9, 10, 11, 13) and every blank on page
   12 now catches a drop anywhere on its whole coach - roof label, body, wheels - plus 26 px around
   it. Measured: a card dropped on the coach's roof label (y 157-209, the coach body starts at 215)
   was placed. The sentence pages (14-17) are not train coaches and are unchanged.

## r104 — the transition text types itself, in sync with Swiftee

Yasir: "in transition screens the text will appear with a typewriter animation, one letter at a time,
in sync". The phrase types in one akshara at a time («च» «लि» «ए» «,» «शु» «रू» «क» «रें» «!») over
exactly the time Swiftee takes to say it - `CARD.gate.title_dur_ms` (tutorial 1230, guided 1300,
practice 850 ms, measured), starting at `title_cue_ms`. Aksharas, not code points, so a matra never
shows without its letter; every akshara holds its place from the start (only its opacity changes),
so the line does not slide as it grows. The cue now counts from the moment the clip is actually
sounding, not from the play() call (the guided clip took 380 ms to start and the text ran early).
Measured, 2 runs: first akshara 6-26 ms after the phrase starts, last one ~120 ms before it ends,
on all three transitions.

## r105 — transition text centred, transition VO without delay, the standard celebration line

- **Centred.** r103/r104's `pg-title-wait` / `pg-typing` transforms replaced the title's own
  translateX(-50%), so the text started at the screen's centre line instead of being centred on it.
  Both keep it now. Measured on all three transitions: text centre = screen centre (682 of 1364).
- **No VO delay.** `CARD.gate.talk_at_ms` 1960 -> 0: the transition line starts as the gate opens
  (measured 23-135 ms after it opens). The typewriter still follows the phrase (cue from the clip's
  real start). Note: the bird's own speaking frames start ~2 s into its animation, so for the first
  two seconds she is still rising while the line plays.
- **Celebration line** «बहुत बढ़िया, दोस्त! तुमने कमाल कर दिया!» (standard end-screen dialogue).
  `vo_cel_prompt` re-recorded (Leda, -16 LUFS, 2.94 s); the build re-measured the lip-sync track
  (117 steps) - the jump is fitted to «बहुत बढ़िया, दोस्त!» (0.2-1.08 s, then a 0.3 s pause). Its
  «तुम» is the standard line's own wording, allowed by name in the register guard (REGISTER_ALLOW).
  Measured: mouth = track 100 % in 2 runs, 0 open-mouth frames after the line.

## r106 — Swiftee rises first, then speaks; on the celebration she jumps first, then speaks

Yasir: "in all the transition Swifty gifs, first she should seek from the bottom, then start speaking,
so the VO should start when she starts speaking; and on the last celebration screen Swifty jumps and
celebrates, then starts speaking - the VO should only play when she starts speaking". (Reverses r105's
"no delay in the VO".)
- **Transitions.** `CARD.gate.talk_at_ms` 0 -> 1960 again: the line starts on the bird's first speaking
  frame, after she has risen. The typewriter still counts from the clip's real start. Measured, 2 runs:
  the VO starts 1973-1989 ms after the gate opens on all three transitions, and the aksharas still type
  over the phrase (first one 10-20 ms after it starts).
- **Celebration.** The line is no longer played on arrival (`state.ownsAudio`). The kit's own शाबाश
  sheet (its standing frames + its jump frames, 30 frames, ~1.35 s) plays first with only the
  celebration sound; then the line starts and the kit's player takes over: its track is arranged so it
  lands the jump over the clip's lead-in and lip-syncs the whole line on the talk sheet (kit files
  unchanged; only the wrapper in the build script changed). Measured, 3+ runs: jump frames 0.31-1.45 s,
  the line starts at 1.44-1.45 s; mouth = track 100 % on the kit's clock, kit clock = clip clock within
  one display frame; sheets shabaash -> talk -> idle; 0 open-mouth frames after the line; arrow button
  unchanged (124x82 at the same place); no console errors.

## r107 — Swiftee's beak moves with every transition line; the play button sounds on the press

- **Lip-synced transitions.** Yasir: "when «चलिए शुरू करें» plays Swifty stays static, no mouth movement -
  same on transitions 2 and 3". The gate art is a fixed animation: its talking part opened the beak 7
  times whatever the clip said, then blinked and held a still frame for 1.2 s - exactly where the
  on-screen phrase is spoken (6.0-7.2 s into the gate). Now she still rises on the animation, and from
  her first speaking frame (1.96 s) she is drawn from `assets/UI/swifty_gate_talk.webp` - a sheet of
  the same art's own frames 37-67 (836 KB), built from swifty_gate_seek.webp by the build script - on
  a canvas in the animation's exact place. The beak opens on each syllable of that transition's own
  clip (track measured on every build by celebration_kit/make_lipsync.py, as it ships;
  `CARD.gate.talk` / `CARD.gate.lips`), a different open beak each syllable with the closed beak the
  art draws beside it; she blinks in pauses; the beak shuts when the line ends. The sheet is decoded
  and drawn once during the landing so the switch is never late. Measured, 2 runs x 3 transitions:
  beak = track 98.8-100 % (frame-accurate), one opening per syllable (15 / 19 / 5), the beak moves all
  through «चलिए, शुरू करें!» / «चलिए, साथ में करें!» / «अब आपकी बारी!», 0 open-beak frames before or after
  the line, bird box identical before/after the switch (561.8, 488.6, 240.3 x 209.4), no errors.
- **Play button sound.** A click fires when the finger lifts (measured 136-149 ms after the press),
  so the sound came late. It now plays on the press (pointerdown); the click still starts the lesson
  and does not play it twice; a keyboard press still sounds on the click. Measured: sound starts
  1 ms after the press (was 143 ms), once.

## r108 — the transition text types while the words are spoken, and always completes

Yasir: "in the first transition «चलिए, शुरू करें» VO plays but its text could not be completed (not in
sync with the VO)". The r104 typewriter spread the letters evenly over the phrase on timers of its
own: «शु» typed in the 0.3 s pause after «चलिए,», and nothing tied the end of the text to the end of
the voice. Now:
- the build measures where each phrase is actually voiced in its clip (25 ms RMS above -42 dBFS,
  gaps under 150 ms bridged) -> `CARD.gate.title_voice_ms`: tutorial «चलिए,» 4025-4400 + «शुरू करें!»
  4700-5275, guided 3975-4325 + 4650-5275, practice 1250-2125 ms;
- the letters are placed only inside those stretches (punctuation comes with the letter before it),
  read every frame on the clip's own clock (`_voiceClock`, now shared with the beak's lip-sync);
- when the clip ends, anything not yet shown appears at once, so the line is always complete.
Measured from the cover's play button (served and opened as a file) and on all three transitions:
«चलिए,» types 4042-4389 ms, nothing in the pause, «शुरू करें!» 4744-5223 ms; the full line is on screen
0.38-0.46 s before the clip ends; guided and practice likewise inside their voiced stretches; beak =
track 99.1-99.4 %; no errors.

## r109 — the recorded voice-over is in

Yasir added recorded VOs for every lesson clip (131 WAVs, named by Audio ID - the manifest's
recording list, transition lines included). Now:
- **Sources** moved out of the build (they would have shipped 26 MB twice) to
  `1_SPEC/game_art_src/lesson_voice/source_wav/`; the TTS takes they replace are kept in
  `1_SPEC/game_art_src/lesson_voice/gemini_backup/` (133 files, with the two unplayed clips).
- **`1_SPEC/prepare_lesson_voice.py`** (new) trims each clip (30 ms kept before the voice, 120 ms
  after - the recordings had ~0.3 s at each end), levels it to -16 LUFS with a -1 dBFS limiter and
  writes it as 16-bit PCM WAV, 24 kHz mono, under the lesson's `.ogg` names (the builder reads the
  cues from these files as WAV). Measured: all 131 at -16.5 to -15.8 LUFS, peaks <= -1.0 dBFS.
- **Cues** re-measured by the build from the new files: page 1 highlight (1403 / 1336 ms), pages 2 / 4
  sound steps (now all three of प। पु। पुल। / फ। फू। फूल। resolve), pages 3 / 5 picture + matra
  moments, both lip-sync tracks (celebration 2954 ms; the three transitions), the audio cache stamp.
- **Transition text** cues re-measured on the recorded transition lines (`title_cue_ms` /
  `title_dur_ms`): «चलिए, शुरू करें!» 3075 + 1150, «चलिए, साथ में करें!» 3575 + 1325, «अब आपकी बारी।»
  925 + 850 ms.
- **Typewriter safety net** (engine): "no voice after 1.5 s -> type anyway" now waits while the clip
  is still loading (`isPlaying`), so a slow clip can no longer make the text run ahead of the voice.
Measured: transitions - beak = track 98.5-99.2 %, one opening per syllable (13 / 19 / 5), every letter
inside its spoken words (e.g. «चलिए,» 3083-3342, «शुरू करें!» 3702-4104 ms), full line before the
clip ends, also from the cover's play button; celebration - jump first, mouth = track 100 %, 0 open
frames after; no errors. Manifest regenerated (durations, voice notes).

## r110 — the lesson's music always starts again when it ends

Yasir: "once the bg music completes, play it again - it should play continuously in a loop". The
music element already had `loop` set, and in Chrome (served and opened as a file) it does loop -
measured at 16x speed: at 4:00 it seeks to 0 and plays on. But a browser can still let a long
streamed track finish when its seek back to the start fails (the local server here reports the file
as not seekable, for one), and then the music just stops. Two safety nets on `__lessonBgm`
(train_modules.js):
- on `ended`, back to 0 and play again;
- if it should be playing (not paused, not on the runner page) but has not moved for 2 s, play
  again - from the top when it is at its end.
Measured: with `loop` switched OFF (a browser whose loop fails), the track ended at 240.02 s and was
playing again from 0 within 5 ms, and on for another full minute; with `loop` on, it loops as before.
The ducking under voice / sounds and the silence on the runner page are unchanged.

## r111 — File5's confetti and File5's play button

Yasir: "from File5 extract the same confetti effect (animation) in this file, and the play button
should be 140x140 px and placed the same as that file - don't change anything else".
- **Confetti.** File5's correct-answer confetti, copied unchanged (verified byte-identical) into
  `4_ENGINE/confetti_mtg.js` / `confetti_mtg.css`: the FLN animation kit's confetti (recipe 7; the kit
  core it needs was already in this engine, byte-identical to File5's), File5's call site - ~100 stars,
  rectangles, lines and squares over the whole window, 1.5x size, the slower fall - and its
  body-level `#fxLayer` (added to lesson_template.html where File5 has it). `inject_train.py` adds the
  two files as File5's does. It replaces the side-cannon `confettiCannon()`; every call site is
  unchanged, and they are all the lesson's correct answers (the runner game does not call it).
  No confetti sound (File5 has none either).
- **Play button.** 116 -> 140 x 140 px, and File5's placement rule `bottom:12px` (File5: "the 140px
  button sat over the cover's track ties: 28 px lower clears them"). The play-button rules are now
  identical to File5's.
Measured side by side with File5: button 140 x 140, bottom 12 px, same place (within the pulse's
1-2 px); a correct answer on page 6 fires one burst of 100 pieces in #fxLayer (fixed, z 5000) in both
files; no console errors.

## r112 — the runner game becomes a temple run: word orbs, obstacles, jump / slide, a tutorial

Yasir's feedback + reference image (golden word orbs on the temple bridge, logs / stones / thorns).
All in `1_SPEC/matra_runner_src/index.html` (then embed -> inject -> build, as always).
- **HUD:** level number, score and word counter removed; the matra chip «ऊ (ू)» / «उ (ु)» alone at the
  top centre, 1.5x; hearts at the top right. Measured: chip centre = stage centre (682 of 1364).
- **Word orbs replace the portals** (`orb.webp`, from the reference): a golden orb with two leaves per
  lane, floating at chest height, the word written on it by the game. Run into the right one: it
  bursts bigger and fades in a shine; a wrong one shakes, dulls and shrinks, and the right one pulses so
  the child sees which it was (never red). Same flow as before: a wrong word costs a heart and the
  question comes back (r101). `portal_ring.webp` is no longer loaded.
- **Obstacles** (Yasir: full Temple Run, and a hit costs a heart): log and thorns - jump (swipe up / ↑);
  a log on two posts - slide under (swipe down / ↓); a carved stone block - go round (left / right).
  One after every pair of orbs, ~2 s after it - after its «शाबाश» and before the next word is spoken,
  so the child is never dodging while listening. Never the same kind twice running. A hit: a heart,
  Swifty's new bump pose, a bonk, «अरे! ध्यान से।»; three hearts gone (words or obstacles) -> she falls
  and the level restarts, as before.
- **Swifty jumps and slides** - new poses (`swifty_jump.webp`, `swifty_slide.webp`, `swifty_bump.webp`)
  generated from her own run frame, in the run art's style; her shadow stays on the ground.
- **Controls:** swipes act as soon as the finger has moved 26 px (up = jump, down = slide, left/right =
  lane); a tap on a half still changes lane; ↑/↓ (W/S) keys; ▲ ▼ buttons beside ◀ ▶ on touch screens.
- **Tutorial** (first time the game opens, after the lesson's instruction): three steps, Temple Run
  style - the run stops in front of a stone block / a log / a low barrier, the lesson's standard hand
  shows the swipe with a big arrow, the line is spoken, and it carries on the moment the child makes the
  move (early moves count; nothing in the tutorial costs a heart). Then «बहुत बढ़िया! अब खेल शुरू करते
  हैं।», the goal, and the first words. Not repeated after a fall.
- **Coins:** 15 -> 25 px radius, higher, brighter glow, turning; the coin sound about 2.5x as loud, a
  two-note ding with a sparkle. They come in a trail of four beside each obstacle. No score is shown.
- **Art** (`gen_ref_art.py` groups `temple` + `char`, prepared by `prepare_runner_art.py <files>`):
  orb, ob_log, ob_thorns, ob_block, ob_beam, swifty_jump, swifty_slide, swifty_bump - ~1.1 MB in all.
- **Voice:** five new lines (TTS placeholders, voice Leda, levelled to -16 LUFS - to be recorded):
  tut_lane «उँगली दाएँ या बाएँ सरकाइए, और रास्ता बदलिए।», tut_jump «उँगली ऊपर सरकाइए, और कूदिए!»,
  tut_slide «उँगली नीचे सरकाइए, और नीचे से फिसलिए!», tut_go «बहुत बढ़िया! अब खेल शुरू करते हैं।»,
  hit «अरे! ध्यान से।». runner_vo_manifest.xlsx regenerated (root + Downloads).
Measured (headless Chrome, keys and real finger drags/taps): tutorial - each step freezes in front of
its obstacle with the right overlay (side / up / down) and continues on the move, lines in order, then
the goal; run - 6/6 words, deliberate hits cost a heart each, jumps / slides / lane changes clear the
rest; 3 hits -> fall, «कोई बात नहीं…», level restarts with 3 hearts and no tutorial; level 2 starts with
the «उ (ु)» chip, orbs, obstacles and coins; no console errors.

## r113 — obstacles pass by, the hanging matra, a speed that grows, minimal pairs, one continuous run

All in `1_SPEC/matra_runner_src/index.html` (embed -> inject -> build).
- **Obstacles no longer disappear.** They run on past Swifty, growing towards the camera, and are drawn
  in front of her once passed, until they leave the bottom of the screen. One she runs into is knocked
  aside towards the parapet (tipping a little) and goes on past the same way.
- **The matra hangs on a rope from the top of the screen** (`#hang`: a twisted rope, a ring, the wooden
  medallion «ऊ (ू)»): it drops in with a bounce and swings gently; between levels it is pulled back up
  and comes down again with the new matra.
- **Speed grows with the child** - one speed for the whole game: starts slow (0.110), +0.009 for each
  word caught, -0.014 for a wrong word or an obstacle hit (eased: down quickly, back up gently),
  between 0.10 and 0.20; a fall starts it slow again. Swifty's stride quickens with it.
- **The last two words of each level are minimal pairs** - the same word twice, one with the other
  matra: फूल / फुल, कूड़ा / कुड़ा, दुकान / दूकान. Only the right word is spoken (the swapped one is only
  shown, so it needs no recording); a wrong pick still names the right word.
- **One run, not separate levels.** When a level ends nothing stops - no blur, no «स्तर» card: the
  chime, the matra goes up, «वाह! अब इस लेवल को पार कीजिए।» + the next goal are spoken while it comes
  down with the new matra, then the next words come; speed and obstacles carry on, and a heart comes
  back as before. A fall in that stretch restarts the NEXT level. The end of the game is unchanged.
Measured (headless Chrome, both levels): chip on its rope at the top centre; speed 0.110 -> 0.150 over
level 1 (one hit took its target 0.119 -> 0.114), carried on to 0.20 by the end of level 2; pairs 5-6
of each level were twins (कूड़ा/कुड़ा, जूता/जुता; चुहिया/चूहिया, दुकान/दूकान); at the level change the
mode stayed "play", the canvas had no blur, the chip went up and came back as «उ (ु)», the next pairs
came; a passed obstacle still on screen at z -0.10; no console errors.

## r114 — smooth legs at every speed; the end-of-game line no longer mentions portals

- **Legs.** Yasir: "when the speed increases, at the start her legs feel jittery or too fast". The run
  frame was floor(G.t x 16 / cycle); with the cycle following the speed (r113), the product of a large
  G.t and a changing rate jumped every frame - the legs skipped and whirled. The phase now ADVANCES each
  frame by dt / cycle (`G.runPh`), so a change of speed changes how fast the legs go but never jumps
  them, and the cycle follows how fast the world is really moving: a slow jog while the run is held at
  the start or stopped in the tutorial, quickening smoothly with the speed (0.78-1.6 s a stride).
  Measured over a whole game (both levels): the leg frame never went backwards and advanced at most
  0.96 of a frame per screen frame (median 0.17 slow / 0.24 / 0.31 fast).
- **The end-of-game line.** «शाबाश, सारे द्वार पार हो गए!» -> «शाबाश! आपने सारे शब्द पकड़ लिए!» (and the
  hidden win card's text). TTS placeholder (Leda, -16 LUFS) until recorded; the old recording is kept in
  `1_SPEC/game_art_src/runner_voice/replaced/win_dwar_par.wav`. runner_vo_manifest.xlsx regenerated
  (root + Downloads). Measured: spoken 1.1 s after the last word, then the win screen, the lesson moves on.
