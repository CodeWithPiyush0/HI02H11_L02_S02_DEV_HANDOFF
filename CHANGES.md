# CHANGES — HI02H11_L02_S02 «मात्राओं की रेल» (उ / ऊ) · rounds 3–13

> Rounds 4–13 are **not** from the review deck — they are direct asks to bring this
> lesson into line with its sibling `HI02H11_L02_S01`. They live in their own sections at
> the end; the deck contract above them is unchanged.

**Contract and scorecard, in one document.** Every discrete ask in
`HI02H11_L02_S02_SME_Review.pptx` is a row below, quoted verbatim from the deck, with what it cost
and the evidence that it is in the built game. Nothing outside this list was changed — see
**Changed beyond the deck** at the end, which is the mechanical proof of that.

**Status:** ✅ DONE · ⚑ FLAGGED-BACK (asked, decided or awaiting a decision) · ⏳ PENDING ·
N/C (deck page asked for nothing).

**Proof tags** — what each one means, so the column can stay short:

| tag | means |
|---|---|
| `card` | present in `3_CURRENT_BUILD/card.json`, and confirmed by the card diff against the round-2 snapshot |
| `render` | visible in the named capture in `3_CURRENT_BUILD/_review_shots/` |
| `driven` | exercised in a real browser, wrong → wrong → right, with the outcome read back from the DOM |
| `guard` | enforced by a builder guard that **fails the build** if it regresses |
| `engine` | implemented in `4_ENGINE/train_modules.js` / `train_styles.css` |
| `vo` | the clip is recorded (Gemini TTS, voice **Leda**) and passed the duration checks |
| `art` | the picture is generated, keyed (or deliberately not), and checked on screen at the size the child sees it |
| `sfx` | a real recorded sound file, brought over from the sibling lesson `HI02H11_L02_S01` |

**Baseline match:** confirmed. 13 of the deck's 16 embedded screenshots are byte-identical to
`5_CURRENT_BUILD_SCREENSHOTS/` (round 2); the other three are the SME's mockups. The deck reviews
exactly the build that was in `3_CURRENT_BUILD/`.

**Deck page mapping.** The SME typed each recommendation into the speaker notes of the slide
*preceding* the screenshot it annotates. Resolved once, here, against the deck's original page
order — every row below is keyed to the **screen**, never to a live slide index:

| deck slide (notes) | screenshot on the next slide | screen |
|---|---|---|
| 1 | Page 1 `01_landing.png` + painted-train mockup | Landing |
| 2 | Page 2 `02_MATRA_INTRO.png` | 1 · MATRA_INTRO |
| 3 | Page 3 `03_MATRA_BUILD.png` | 2 · MATRA_BUILD पल→पुल |
| 4 | Page 4 `04_MEET_PAIR.png` | 3 · MEET_PAIR |
| 5 | Page 5 `05_MATRA_BUILD.png` | 4 · MATRA_BUILD फल→फूल |
| 6 | Page 6 `06_MEET_PAIR.png` | 5 · MEET_PAIR |
| — | **Pages 7, 8 carry no slide and no note** | **deleted** |
| 7 | Page 9 `09_TRAIN_TAP.png` | 6 · TRAIN_TAP उ |
| 8 | Page 10 `10_TRAIN_TAP.png` | 7 · TRAIN_TAP ऊ |
| 9 | Page 11 `11_TRAIN_TAP.png` | 8 · TRAIN_TAP mixed |
| 10 | Page 12 `12_TRAIN_SORT.png` | 9 · TRAIN_SORT word |
| 11 | Page 13 `13_TRAIN_SORT.png` | 10 · TRAIN_SORT matra |
| 12 | Page 14 + word-build mockup | 11 · WORD_BUILD |
| 13 | Page 15 `15_TRAIN_SORT.png` | 12 · TRAIN_SORT picture |
| 14 | Page 16 + sentence mockup | 13 · SENTENCE_COMPLETE ① |
| 15, 16, 17 | sentence mockup ×3 | 14, 15, 16 · SENTENCE_COMPLETE ②③④ |
| 18 | (empty) | N/C |
| 19 | "First उ appears, then ु appears beside it with a soft glow. After that, both can fade slightly / dim softly. Then ऊ appears, and ू appears beside it." | ✅ | **Implemented as written.** Previously both glyphs were painted together and only the PAIR sequenced, so the one thing this screen teaches — that this letter owns this mark — was never shown happening. The matra lands 1.5s into its own VO line, with the glow |

---

## Landing (deck slide 1)

| # | change (verbatim from the deck) | status | proof |
|---|---|---|---|
| 1 | "Remove all extra text that is not required." | ✅ | `render` 01 — title, two bogies, शुरू करें. Nothing else; the cell `label`s are aria-only and were never painted |
| 2 | "Keep the screen clean and minimal." | ✅ | `render` 01 |
| 3 | "Show only two matra boxes/cards: 1st box: ु · 2nd box: ू" | ✅ | `card` `landing_hero.matras` = `ु`, `ू`, in that order, **bare** — an orphan combining mark makes the font draw its own dotted placeholder, which is exactly the «ु» the note writes |
| 4 | "Keep the existing mascot and overall UI/UX style unchanged." | ✅ | `render` 01 — mascot, chrome and start card untouched |
| 5 | "The matras can be shown inside two train bogies/cards so that the lesson visually continues as a 'मात्राओं की रेल' journey." | ✅ `art` | **PAINTED**, ported from the sibling lesson — the same artwork the mockup draws, cropped from three coaches to two. `render` 01 |
| 6 | "bring the train onto the screen with a smooth right-to-left animation." | ✅ | `engine` — a 3.4 s roll-in on a curve tuned to read as pulling into a platform, with the 36 sprite frames driven off the **same easing** so the wheels wind down exactly as the loco stops |
| 7 | "The two matra boxes/bogies can appear one by one with a soft pop/fade animation. First show ु, followed by ू." | ✅ | `engine` `ltPop`, 520 ms apart, ु first, and only **after the train has parked** so they land on a coach that is standing still |
| 8 | "Add a soft train arrival / whistle SFX when the train enters." | ✅ `sfx` | **real recordings** now — `sfx_train_move` on the roll-in, `sfx_whistle` on arrival. Round 3 first synthesised these with the engine's `_tone()`, which is a two-note beep, not a train |
| 9 | "Add a light sparkle/pop SFX when each matra appears." | ✅ | `engine` `sfxSparkle()` per bogie, chained to the reveal |
| 10 | VO: "हेलो दोस्त! मैं हूँ स्विफ्टी। आज हम मात्राओं के बारे में जानेंगे।" | ✅ `vo` | `card` `vo_landing`, their spelling (स्विफ्टी, जानेंगे) |
| 11 | "After this VO, the two matras ु, ू can appear one by one on screen." | ✅ | `engine` — the reveal is chained to the travel ending, not to a second timer that could drift out of step with it |

## Screen 1 · MATRA_INTRO (deck slide 2)

| # | change | status | proof |
|---|---|---|---|
| 12 | VO: "आज हम छोटी उ और बड़ी ऊ की मात्रा वाले शब्द पढ़ेंगे।" | ✅ `vo` | `card` `vo_t1_prompt`; also the on-screen heading (shown == spoken) |
| 13 | pair VO: "यह है उ। इसकी मात्रा है — ु।" / "यह है ऊ। इसकी मात्रा है — ू।" | ✅ `vo` | `card` `vo_pair_u` / `vo_pair_uu` — **new clips**, replacing round 2's bare «छोटी उ की मात्रा». ⚠️ EAR-CHECK, see Q6 |
| 14 | "Remove the current extra heading text from the top, if needed" | ✅ | `render` 02 — one line, and it is the VO line. The band itself stays: removing it is what caused round-2 defect #1, and `guard_prompts` now fails the build on an empty heading |
| 15 | "Show the letter and its corresponding matra symbol as a pair, one by one. Keep only one pair active at a time." | ✅ | `engine` — and the two glyphs now arrive **separately within** each pair, which is the part that was missing: उ lands, then ु beside it. Traced live: pair 1 at 10.85s / 12.35s, pair 2 at 15.38s / 16.89s |
| 16 | "Each active pair should light up/highlight when its VO plays." | ✅ | `engine` `.mi-pair.is-on .mi-car` amber ring |
| 17 | "Sequence should be: उ → ु · ऊ → ू" | ✅ | `card` `data.pairs` in that order; `render` 02 |
| 18 | "keep the train-theme continuity by showing each pair inside a train-style card / bogie / box." | ✅ | `engine` `.mi-train` — each pair is now a coach behind the locomotive, on the track; `render` 02 |
| 19 | "First उ appears, then ु appears beside it with a soft glow. After that, both can fade slightly / dim softly. Then ऊ appears, and ू appears beside it." | ✅ | `engine` — step chain toggles `is-on` / `is-dim` per pair |
| 20 | "Do not add extra decorative elements." | ✅ | `render` 02 — locomotive, two coaches, track. Nothing else |
| 21 | "Add a soft pop / chime when each matra symbol appears." | ✅ | `engine` — the chime now fires **when the matra lands**, not when the pair starts. "Use a simple pop / fade animation" is `miPop`, 380ms |
| 22 | "Keep the Next button disabled during the sequence. Activate it only after both pairs have been shown and spoken." | ✅ | `engine` `setNavActive(false)` at mount, `done()` after the last pair |

## Screen 2 · MATRA_BUILD पल → पुल (deck slide 3)

| # | change | status | proof |
|---|---|---|---|
| 23 | prompt VO: "आइए, देखें कि छोटी उ की मात्रा लगने से शब्द की आवाज़ कैसे बदलती है।" | ✅ `vo` | `card` `vo_t2_prompt`; also the heading |
| 24 | base VO: "यह शब्द देखिए — पल।" | ✅ `vo` | `card` `vo_base_pal` — **new id**, so round 2's «यह शब्द है, पल।» cannot linger on disk. ⚠️ **Punctuation only:** the SME's em-dash after the leading word is a COMMA in the recording script. No word changed; measured, see Q6 |
| 25 | onset VO: "प के साथ छोटी उ की मात्रा लगाने पर 'पु' बनता है।" — the note explicitly rejects "प में उ की मात्रा लगी, बना पु।"; round 2 shipped "प के **नीचे** …" | ✅ `vo` | `card` `vo_onset_pul`, now «प के **साथ** …» |
| 26 | result VO: "अब 'ल' जुड़ने पर 'पुल' बनता है।" | ✅ `vo` | `card` `vo_result_pul` — new rung; round 2 spoke only the bare word here |
| 27 | "First show पल clearly on the left side. In the centre, show the transformation: प + ु = पु" | ✅ | `render` 03 |
| 28 | "Highlight only the ु मात्रा in red when it is introduced." | ✅ | `render` 03 — the ु under प is red; `engine` `matraHL()` 2-D clip |
| 29 | "After that, show the final word: पुल … highlight the ु मात्रा again" | ✅ | `render` 03 — पुल with a red ु |
| 30 | "Show a simple and clear bridge image below or beside पुल." | ✅ | `render` 03 |
| 31 | "Keep the screen clean and minimal. Do not add unnecessary explanatory text." | ✅ | `card` — the three round-2 panel captions are now `null`; `render` 03 shows exactly the note's own "On Screen" list and nothing more |
| 32 | staging: पल → highlight प → ु pops below प → ल slides in → bridge image, synced to VO | ✅ | `engine` — each step gated on the previous **clip ending**, never a timer |
| 33 | Sound differentiation: प · पु · पुल with a short pause between each | ✅ `vo` | `card` `vo_sounds_pul` = «प। पु। पुल।» — a **new rung**, spoken after the word is built. ⚠️ EAR-CHECK |
| 34 | SFX: pop on ु · chime on प→पु · success on पुल | ✅ | `engine` `sfxTap` / `sfxCorrect` on those beats |
| 35 | "Keep the Next button disabled while the complete transformation is playing." | ✅ | `engine` `state.demoRunning`, released in `done()` |

## Screen 3 · MEET_PAIR गुड़ / धनुष (deck slide 4)

| # | change | status | proof |
|---|---|---|---|
| 36 | prompt VO: "आइए, छोटी उ की मात्रा वाले कुछ शब्द देखें।" | ✅ `vo` | `card` `vo_t3_prompt`; also the heading |
| 37 | **words change to गुड़ and धनुष** (round 2 ships पुल · गुड़) | ✅ | `card` `T3.data.examples`; `render` 04 |
| 38 | गुड़ line: "गुड़ — बोलकर देखिए। इसमें ग पर छोटी उ की मात्रा लगी है।" | ✅ `vo` | `card` `vo_meet_gud`, 3.37 s. ⚠️ **Punctuation only:** the SME's em-dash after the leading word is a COMMA in the recording script. No word changed; measured, see Q6 |
| 39 | धनुष line: "धनुष — बोलकर देखिए। इसमें न पर छोटी उ की मात्रा लगी है।" | ✅ `vo` | `card` `vo_meet_dhanush`, 3.57 s. ⚠️ **Punctuation only:** the SME's em-dash after the leading word is a COMMA in the recording script. No word changed; measured, see Q6 |
| 40 | "First show गुड़ with the jaggery image." | ✅ | `card` `obj_gud` |
| 41 | "show the second example धनुष with a bow image" — **new art `obj_dhanush`** | ✅ `art` | generated, keyed, one connected silhouette; `render` 04 |
| 42 | "Highlight only the ु matra" in both words | ✅ | `render` 04 — the ु on नु is red, and only that |
| 43 | "Word should appear first, then image should appear." | ✅ | `engine` `.mp-pic` revealed on the line ending |
| 44 | "Keep Next button disabled during the explanation." | ✅ | `engine` `state.demoRunning` |

## Screen 4 · MATRA_BUILD फल → फूल (deck slide 5)

| # | change | status | proof |
|---|---|---|---|
| 45 | prompt VO: "आइए, देखें कि बड़ी ऊ की मात्रा लगने से शब्द की आवाज़ कैसे बदलती है।" | ✅ `vo` | `card` `vo_t4_prompt` |
| 46 | base VO: "यह शब्द देखिए — फल।" | ✅ `vo` | `card` `vo_base_phal`, 2.49 s. ⚠️ **Punctuation only:** the SME's em-dash after the leading word is a COMMA in the recording script. No word changed; measured, see Q6 |
| 47 | onset VO: "फ के साथ बड़ी ऊ की मात्रा लगाने पर 'फू' बनता है।" | ✅ `vo` | `card` `vo_onset_phool` |
| 48 | result VO: "अब 'ल' जुड़ने पर 'फूल' बनता है।" | ✅ `vo` | `card` `vo_result_phool` |
| 49 | "Show the flower image only after the final word appears." | ✅ | `engine` — panel 3 revealed on the onset clip ending |
| 50 | Sound differentiation: फ · फू · फूल | ✅ `vo` | `card` `vo_sounds_phool`. ⚠️ EAR-CHECK |
| 51 | remaining staging / highlight / SFX / Next gating, as screen 2 | ✅ | `render` 05; same module path as rows 27–35 |

## Screen 5 · MEET_PAIR दूध / कबूतर (deck slide 6)

| # | change | status | proof |
|---|---|---|---|
| 52 | prompt VO: "आइए, बड़ी ऊ की मात्रा वाले कुछ शब्द देखें।" | ✅ `vo` | `card` `vo_t5_prompt` |
| 53 | **words change to दूध and कबूतर** (round 2 ships फूल · दूध) | ✅ | `card` `T5.data.examples`; `render` 06 |
| 54 | दूध line: "दूध — बोलकर देखिए। इसमें द पर बड़ी ऊ की मात्रा लगी है।" | ✅ `vo` | `card` `vo_meet_doodh`. ⚠️ **Punctuation only:** the SME's em-dash after the leading word is a COMMA in the recording script. No word changed; measured, see Q6 |
| 55 | कबूतर line: "कबूतर — बोलकर देखिए। इसमें ब पर बड़ी ऊ की मात्रा लगी है।" | ✅ `vo` | `card` `vo_meet_kabootar`. ⚠️ **Punctuation only:** the SME's em-dash after the leading word is a COMMA in the recording script. No word changed; measured, see Q6 |
| 56 | milk image, pigeon image; highlight only the ू in each | ✅ | `card` `obj_doodh` / `obj_kabootar`; `render` 06 |
| 57 | word-then-image order, glow on the matra, SFX, Next gating | ✅ | same module path as rows 43–44 |

## Deleted screens

| # | change | status | proof |
|---|---|---|---|
| 58 | **Delete page 7 · CONTRAST_PAIR (फुल ≠ फूल)** — the deck carries no slide and no note for it | ✅ | card diff: slide `T6` removed; `guard_flow` pins the new 17-slide order |
| 59 | **Delete page 8 · MEET_PAIR (सूरज · मुकुट)** — same | ✅ | card diff: slide `T7` removed |

## Screen 6 · TRAIN_TAP छोटी उ (deck slide 7)

| # | change | status | proof |
|---|---|---|---|
| 60 | heading: "छोटी उ की मात्रा वाले शब्द पर टैप कीजिए।" | ✅ | `card` `G1.prompt_hi`; `render` 07 |
| 61 | "Train comes through animation from right to left… **After the train stops**, the three coaches पुल, दूध, सूरज appear clearly." | ✅ | `engine` — the painted train pulls in over 3.4 s and the coach WORDS are held back until it parks, then fade in 180 ms apart. They were previously painted from the start, which is not what the note asks for |
| 62 | "Do not add any additional instruction text in the play area." | ✅ | `render` 07 — heading band only |
| 63 | "Do not highlight the matra before the child answers" | ✅ | `driven` — 0 `.mh-ov` overlays until the correct tap |
| 64 | prompt VO: "जिस डिब्बे में छोटी उ की मात्रा वाला शब्द है, उस डिब्बे पर टैप कीजिए।" | ✅ `vo` | `card` `vo_tap_prompt_u` — one recording, shared with screen 8 |
| 65 | correct पुल → confetti, coach glow, ु highlighted after the answer, VO "शाबाश! पुल शब्द में छोटी उ की मात्रा है।" | ✅ `vo` | `driven` — matraHL=1 on the win; `card` `vo_g1_correct` |
| 66 | wrong 1 → wiggle, **no hand**, VO "फिर से सोचिए। छोटी उ की मात्रा वाला शब्द कौन-सा है?" | ✅ `vo` | `driven` — `miss1 vo=[vo_tap_hint1_u] hand=0` |
| 67 | wrong 2 → wiggle, VO "ध्यान से देखिए और …", **hand nudge on the पुल coach** | ✅ `vo` | `driven` — `miss2 vo=[vo_tap_hint2_u] hand=1` |
| 68 | 3rd-attempt correct → confetti, highlight, Next active, **no additional VO** | ✅ | `driven` — `win vo=[] nav=True` |
| 69 | SFX: whistle on entry · tap on selection · shake on wrong · chime on correct | ✅ `sfx` | `engine` — the entry whistle is now the sibling's real `sfx_train_arrive` on every train screen, not a synthesised tone |
| 70 | "Keep the Next button disabled initially." | ✅ | `driven` — nav opens only on the win |

## Screen 7 · TRAIN_TAP बड़ी ऊ (deck slide 8)

| # | change | status | proof |
|---|---|---|---|
| 71 | heading: "बड़ी ऊ की मात्रा वाले शब्द पर टैप कीजिए।" | ✅ | `card` `G2.prompt_hi` |
| 72 | coaches गुड़, मुकुट, फूल → correct **फूल** | ✅ | `card` `G2.data` |
| 73 | prompt VO: "जिस डिब्बे में बड़ी ऊ की मात्रा वाला शब्द है, …" | ✅ `vo` | `card` `vo_tap_prompt_uu` |
| 74 | correct VO: "शाबाश! फूल शब्द में बड़ी ऊ की मात्रा है।" | ✅ `vo` | `card` `vo_g2_correct` |
| 75 | hint1: "फिर से सोचिए। बड़ी ऊ की मात्रा वाला शब्द कौन-सा है?" | ✅ `vo` | `driven` — `miss1 vo=[vo_tap_hint1_uu] hand=0` |
| 76 | hint2: "ध्यान से देखिए और …" + hand on the फूल coach | ✅ `vo` | `driven` — `miss2 vo=[vo_tap_hint2_uu] hand=1` |
| 77 | rest of the ladder / SFX / Next gating as screen 6 | ✅ | `driven` — `win vo=[] matraHL=1 nav=True` |

## Screen 8 · TRAIN_TAP mixed (deck slide 9)

| # | change | status | proof |
|---|---|---|---|
| 78 | heading: "छोटी उ की मात्रा वाले शब्द पर टैप कीजिए।" | ✅ | `card` `G3.prompt_hi` |
| 79 | coaches तरबूज, सुई, कबूतर → correct **सुई** | ✅ | `card` `G3.data` |
| 80 | prompt VO (छोटी उ wording) | ✅ `vo` | `card` — the **same** `vo_tap_prompt_u` as screen 6, recorded once |
| 81 | correct VO: "शाबाश! सुई शब्द में छोटी उ की मात्रा है।" | ✅ `vo` | `card` `vo_g3_correct` |
| 82 | hint1 / hint2 as screen 6 + hand on the सुई coach | ✅ `vo` | `driven` — `hand=0` then `hand=1` |
| 83 | rest of the ladder / SFX / Next gating | ✅ | `driven` — `win vo=[] matraHL=1 nav=True` |

## Screen 9 · TRAIN_SORT word → matra coach (deck slide 10)

| # | change | status | proof |
|---|---|---|---|
| 84 | heading: "हर शब्द को उसकी सही मात्रा वाले डिब्बे में डालिए।" | ✅ | `card` `G4.prompt_hi` |
| 85 | coach labels become **उ (ु)** and **ऊ (ू)**; "Do not write छोटी or बड़ी on screen." | ✅ | `card` `G4.data.bins` — was «छोटी उ ◌ु» / «बड़ी ऊ ◌ू»; DOM read back `["उ (ु)","ऊ (ू)"]` |
| 86 | four draggable word cards: आलू · सूरज · सुई · गुड़ | ✅ | `card` `G4.data.cards` |
| 87 | prompt VO: "हर शब्द को उसकी सही मात्रा वाले डिब्बे में डालिए।" | ✅ `vo` | `card` `vo_g4_prompt` |
| 88 | "Each word card can also play its word VO when tapped or dragged" | ✅ | `engine` `tile.onclick` → the card's `vo_name_*` |
| 89 | mapping सुई→उ · गुड़→उ · आलू→ऊ · सूरज→ऊ; "More than one word can be placed inside each coach" | ✅ | `driven` — all four placed, `snap=4`, and the two cards sit **side by side on the coach's painted panel** (`multi`); `render` 10 |
| 90 | per-card correct VO: "शाबाश! 'सुई' शब्द में उ की मात्रा है।" ×4 (उ / ऊ, no छोटी / बड़ी) | ✅ `vo` | `card` `vo_ok_sui` / `vo_ok_gud` / `vo_ok_aaloo` / `vo_ok_sooraj`; `engine` plays `card.correct_audio` |
| 91 | wrong 1 → shake, card returns, **no hand**, VO "फिर से सुनिए और सही मात्रा पहचानिए।" | ✅ `vo` | `driven` — `miss1 vo=[vo_sort_hint_listen] hand=0` |
| 92 | wrong 2 → VO "ध्यान से देखिए, इस शब्द में कौन-सी मात्रा है?" + hand + soft pulse on the correct coach | ✅ `vo` | `driven` — `miss2 vo=[vo_g4_hint2] hand=1` |
| 93 | 3rd-attempt correct → sparkle, **no VO**, card locks | ✅ | `driven` — `win vo=[]`, card `.snapped` |
| 94 | completion → both coaches glow, whistle/steam, Next active, **no completion VO** | ✅ | `driven` — `finish=true nav=true`; the slide-level `correct` clip is gone from the card |
| 95 | "While dragging, the selected card should slightly enlarge." + coach highlight on approach | ✅ | `engine` — `scale(1.08)` while dragging, `.dd-zone.hover` ring |
| 96 | SFX set; Next disabled until all four placed | ✅ | `driven` |

## Screen 10 · TRAIN_SORT matra → letter coach (deck slide 11)

| # | change | status | proof |
|---|---|---|---|
| 97 | "Remove the current words पुल and फूल from above the coaches. Replace them with only the letters: उ · ऊ" | ✅ | `card` `G5.data.bins` — was `["पुल","फूल"]`; DOM read back `["उ","ऊ"]`; `render` 11 |
| 98 | "Do not show the matra symbols in the coach labels." | ✅ | `render` 11 — bare उ / ऊ |
| 99 | heading: "सही मात्रा को सही डिब्बे में डालिए।" | ✅ | `card` `G5.prompt_hi`; `render` 11 |
| 100 | two draggable matra cards ु and ू | ✅ | `card` `G5.data.cards` |
| 101 | prompt VO: "सही मात्रा को उसके सही डिब्बे में डालिए।" | ✅ `vo` | `card` `vo_g5_prompt` |
| 102 | per-card correct VO: "शाबाश! यह उ की मात्रा है।" / "… ऊ …" | ✅ `vo` | `card` `vo_ok_matra_u` / `vo_ok_matra_uu` |
| 103 | wrong 1 VO: "फिर से देखिए और सही मात्रा पहचानिए।" | ✅ `vo` | `driven` — `miss1 vo=[vo_g5_hint1] hand=0` |
| 104 | wrong 2 VO: "ध्यान से देखिए, यह किसकी मात्रा है?" + hand + pulse | ✅ `vo` | `driven` — `miss2 vo=[vo_g5_hint2] hand=1` |
| 105 | "Only one matra card can be placed inside each coach." | ✅ | `engine` `data.single` → the coach body takes `.filled`, which `makeDraggable` already hit-tests; a second drop springs back instead of counting as wrong |
| 106 | completion glow / whistle / Next; 3rd-try silent | ✅ | `driven` — `snap=2 finish=true nav=true`, `win vo=[]` |

## Screen 11 · WORD_BUILD — rewrite of MATRA_FILL (deck slide 12)

| # | change | status | proof |
|---|---|---|---|
| 107 | **Rewritten mechanic:** drag a whole अक्षर, not a matra. "Keep only the last letter visible inside each coach: _ल · _ल · _ई" — the blank now sits **first** | ✅ | `engine` new `SlideModules.WORD_BUILD`; `card` `P1.type` MATRA_FILL → WORD_BUILD; `render` 12 |
| 108 | pictures above each coach: bridge → पुल · flower → फूल · needle → सुई | ✅ | `render` 12 |
| 109 | draggable options: पु · फू · सु | ✅ | `card` `P1.data.options`; `render` 12 |
| 110 | "Add 1–2 distractor options that do not match any picture." | ✅ | `card` — पा; `guard_word_build` fails the build if there are none |
| 111 | "**Remove मी as an option.**" (the mockup draws पु फू सु पा मी) | ✅ | `guard_word_build` **fails the build** if मी ever returns; `render` 12 shows four cards |
| 112 | "Do not show complete words before the child answers." | ✅ | `render` 12 — only `_ल`, `_ल`, `_ई` |
| 113 | intro VO: "चित्र देखकर सही अक्षर से शब्द पूरा कीजिए।" | ✅ `vo` | `card` `vo_p1_prompt` |
| 114 | tapping an option plays it: "पु" / "फू" / "सु" | ✅ `vo` | `card` `vo_ak_pul` / `vo_ak_phool` / `vo_ak_sui`; `driven` — the tile's clip fires on pick |
| 115 | correct VO: "शाबाश! पुल बन गया।" · "… फूल बन गया।" · "**शाबाश! सुई बन गई।**" | ✅ `vo` | `card` `vo_wb_pul` / `vo_wb_phool` / `vo_wb_sui` — the feminine **बन गई** is preserved |
| 116 | wrong 1 → shake, option returns, **no hand**, VO "फिर से सोचिए और चित्र को ध्यान से देखिए।" | ✅ `vo` | `driven` — `miss1 vo=[vo_p1_hint1] hand=0` |
| 117 | wrong 2 → VO "ध्यान से देखिए, कौन-सा अक्षर लगाने से शब्द पूरा होगा?" + hand on the correct blank + pulse | ⚑ `vo` | `driven` — `miss2 vo=[vo_p1_hint2] nudge={blank:1, coach:1}`. The **pulse and glow land on the correct blank**; the HAND is withheld because this is a practice screen — ruling `[28f]`, decided 2026-09-23. See Q3 |
| 118 | 3rd-attempt correct → snap, word completes, confetti, **no VO** | ✅ | `driven` — `win vo=[]`, word `पुल` built |
| 119 | completion → three coaches glow, whistle/steam, Next, **no completion VO** | ✅ | `driven` — all three words built (`पुल`,`फूल`,`सुई`), `finish=true nav=true`, 3 matra overlays |
| 120 | animation order: train enters → picture cards → incomplete words → options slide up | ✅ | `engine` `tr-lblseq` (260 ms+) → `tr-bodyseq` (900 ms+) → `wb-trayin` (1500 ms) |
| 121 | SFX set | ✅ | `engine` |

## Screen 12 · TRAIN_SORT pictures only (deck slide 13)

| # | change | status | proof |
|---|---|---|---|
| 122 | coach labels become **उ** and **ऊ** only — "Do not show छोटी / बड़ी, ु / ू, or the picture names on screen." | ✅ | `card` `P2.data.bins`; DOM read back `["उ","ऊ"]` |
| 123 | bottom shows pictures only, no word text | ✅ | `engine` — the `picture` kind renders no `.tr-cardlbl`; `render` 13 |
| 124 | picture set मुकुट→उ · पुल→उ · तरबूज→ऊ · कबूतर→ऊ | ✅ | `card` `P2.data.cards` |
| 125 | intro VO: "चित्र को सुनिए और उसे सही मात्रा वाली बोगी में डालिए।" | ✅ `vo` | `card` `vo_p2_prompt` |
| 126 | tapping/dragging a picture plays only its name | ✅ | `driven` — `vo_name_tarbooj` on pick |
| 127 | per-card correct VO: "शाबाश! मुकुट में उ की मात्रा है।" ×4 | ✅ `vo` | `card` `vo_okp_mukut` / `vo_okp_pul` / `vo_okp_tarbooj` / `vo_okp_kabootar` |
| 128 | wrong 1 VO: "फिर से सुनिए और सही मात्रा पहचानिए।" | ✅ `vo` | `driven` — `miss1 vo=[vo_sort_hint_listen] hand=0`; one recording shared with screen 9 |
| 129 | wrong 2 VO: "शब्द को ध्यान से सुनिए।" + hand nudge / soft pulse on the correct coach | ⚑ `vo` | `driven` — `miss2 vo=[vo_p2_hint2]`, coach glow present. Practice screen: hand withheld under `[28f]`. See Q3 |
| 130 | "Coach labels उ and ऊ appear one by one." | ✅ | `engine` `tr-lblseq`, 340 ms apart |
| 131 | 3rd-try silent · completion glow / whistle / Next gating | ✅ | `driven` — `win vo=[]`, `snap=4 finish=true nav=true` |

## Screens 13–16 · SENTENCE_COMPLETE — new module ×4 (deck slides 14–17)

| # | change | status | proof |
|---|---|---|---|
| 132 | **New module `SENTENCE_COMPLETE`.** Page 16's POEM_SEARCH is **replaced** by it; three further instances are **new screens**. | ✅ | `engine` new `SlideModules.SENTENCE_COMPLETE`; card diff: `P3.type` POEM_SEARCH → SENTENCE_COMPLETE, `P4`/`P5`/`P6` added |
| 133 | layout per the mockup: heading band · scene picture one side · sentence with a dashed blank the other · three picture option cards below · आगे at the bottom | ✅ | `render` 14–17 |
| 134 | heading on all four: "सही शब्द चुनकर वाक्य पूरा कीजिए।" | ✅ | `card` `prompt_hi` on P3–P6 |
| 135 | instruction VO on all four: "चित्र देखकर सही शब्द चुनकर वाक्य पूरा कीजिए।" | ✅ `vo` | `card` `vo_sc_prompt` — **one** recording for all four |
| 136 | "When an option is tapped, play the word VO" | ✅ `vo` | `driven` — every tap logged its option's `vo_name_*` before the judgement |
| 137 | "Do not highlight the correct option before the child answers." | ✅ | `render` 14–17 — three identical cards; `driven` — no `.sc-nudge` until miss 2 |
| 138 | correct → "The option card snaps into the blank space", sentence completes, sparkle/confetti, soft glow | ✅ | `driven` — blank read back as `खुश` / `सुबह` / `फूल` / `तरबूज` |
| 139 | wrong 1 → shake, option returns, **no hand**, VO "फिर से सोचिए। कौन-सा शब्द वाक्य को पूरा करेगा?" | ✅ `vo` | `driven` — `miss1 vo=[…,vo_sc_hint1] glow=0` on all four |
| 140 | wrong 2 → shake, VO "चित्र को ध्यान से देखिए और सही शब्द चुनिए।" + hand on the correct option + soft pulse | ⚑ `vo` | `driven` — `miss2 vo=[…,vo_sc_hint2] glow=1 hand=False` on all four. Glow yes, hand withheld: practice, `[28f]`. See Q3 |
| 141 | 3rd-attempt correct → snaps, completes, sparkle, **no additional VO** | ✅ | `driven` — the win logged only the option's own word clip, never `vo_pN_correct` |
| 142 | Next active after correct; no completion VO | ✅ | `driven` — `nav=True` on all four |
| 143 | animation: picture first → sentence box with the blank → options fade in one by one; "the word smoothly **moves** into the blank space" | ✅ | `engine` `.sc-enter` stagger, and the chosen word now **travels**: a fixed-position clone animates from the option card into the blank (FLIP, so the sentence does not reflow mid-flight). It previously just appeared |
| 144 | SFX: pop on appear · tap on selection · shake on wrong · chime on correct | ✅ | `engine` |
| 145 | ① "सीमा आज बहुत ______ है।" · **खुश** · खुश · फूल · तरबूज · "शाबाश! सीमा आज बहुत खुश है।" | ✅ `vo` | `card` `P3`; `render` 14 |
| 146 | ② "मैं ______ जल्दी उठता हूँ।" · **सुबह** · सुबह · दूध · मुकुट · "शाबाश! मैंने सही शब्द चुनकर वाक्य पूरा किया।" | ✅ `vo` | `card` `P4`; `render` 15. The first-person praise line is the SME's own and is **not** normalised — see Q7 |
| 147 | ③ "बगीचे में सुंदर ______ खिले हैं।" · **फूल** · फूल · तरबूज · सुबह · "शाबाश! बगीचे में सुंदर फूल खिले हैं।" | ✅ `vo` | `card` `P5`; `render` 16 |
| 148 | ④ "मीठा______ खाना अच्छा लगता है।" · **तरबूज** · तरबूज · फूल · खुश · "शाबाश! मीठा तरबूज खाना अच्छा लगता है।" | ✅ `vo` | `card` `P6`; `render` 17. **The note's sentence ships, not the mockup's** — decided, see Q1 |
| 149 | new art for the option cards: `obj_khush`, `obj_subah` (सुबह was word-only in round 2) | ✅ `art` | generated and checked at the 66 px option-card size. `obj_subah` needed a second pass — see Observations |
| 150 | new scene art ×4: `scn_seema_khush`, `scn_subah_uthna`, `scn_bageecha`, `scn_tarbooj_khana` | ✅ `art` | generated full-bleed and **not** keyed; `render` 14–17. Compressed 5.2 MB → 1.1 MB, checked for banding |

## Screen 17 · CELEBRATION (deck slide 19) · Deck slide 18

| # | change | status | proof |
|---|---|---|---|
| 151 | **N/C — the deck carries no recommendation on this page.** Left exactly as round 2 shipped it. | N/C | deck slide 19 has a title only, no speaker note |
| 152 | **N/C — deck slide 18 carries the sentence mockup and no note** (its recommendation is row 148, per the mapping table). | N/C | — |

## Cross-cutting

| # | change | status | proof |
|---|---|---|---|
| 153 | **Register flips तुम → आप across the whole lesson.** "Use respectful language throughout: सुनिए, पहचानिए, डालिए." · "Maintain respectful language: 'सोचिए, देखिए, चुनिए' instead of 'सोचो, देखो, चुनो'." | ✅ `vo` | `guard_register` **fails the build** on any of 14 तुम forms in any clip, heading or phase title. 61 of 80 clips are re-records |
| 154 | Every on-screen heading follows the same register flip. | ✅ | `guard_register` covers `prompt_hi` and `phase_transition_title` too — «अब तुम्हारी बारी।» → «अब आपकी बारी।», «चलो» → «चलिए» |
| 155 | "Keep the existing train UI/UX style unchanged" (repeated on the rewritten screens). | ✅ | **ONE train now runs the whole lesson** — the sibling's painted artwork, sliced per coach, on the landing, MATRA_INTRO, all three tap screens, all three sorts and WORD_BUILD. Round 3 first had a painted cover and a drawn everything-else |

---

## Receipt — quoted verbatim

`1_SPEC/_verify_assets.py`, run against the built bundle:

```
0 FAIL   1 WARN
  WARN  short lines carry an em-dash (the truncation trigger) but measured NORMAL against their
        peers — EAR-CHECK, and re-check after any re-record: ['vo_pair_u', 'vo_pair_uu']
```

Other sections: `clips 92/92 present (80 recorded + 12 inherited)` · `images 17/17 present` ·
`every slide speaks a prompt: YES` · `all referenced ids declared: YES` · `orphaned recordings: 0` ·
`44 clips had a peer group of 3+; 0 flagged as truncated` ·
`corpus rate 0.098 s/char; 76 clips checked against it; 0 flagged` ·
`13 cut-outs must be keyed; 4 scenes must NOT be` · `every image has an emoji fallback: YES`.

The one WARN is the two MATRA_INTRO pair lines, which keep the SME's em-dash because they
**measured fine** (4.13 s and 3.85 s). They are a standing risk rather than a defect — see Q6.

Render + interaction, from a real browser:

```
17/17 slides mount · 17/17 headings present · 0 non-audio console errors
0 overflow beyond the stage and 0 word-over-picture overlaps, on all 17 slides
11/11 test screens driven wrong -> wrong -> right, all matching the deck's ladder
landing train: sprite 479x182, 2 coaches, both matras placed, 7 smoke puffs, rail 1077x20
```

**TWO CHECKS WERE ADDED TO `_verify_assets.py`, AND ONE OF THEM CAUGHT A REAL DEFECT THE OTHER
COULD NOT.** The existing truncation test groups clips by text length and flags any clip under 55%
of its group median. All four MEET_PAIR lines are 54–56 characters, so they formed a peer group
**among themselves** — and every one of them was truncated, so the median was truncated too and
nothing looked like an outlier. It reported a clean sweep over a screen where the child would have
heard one word and silence. The new seconds-per-character test compares against the whole corpus
instead and flagged all four immediately. Peer comparison misses a failure that hits a whole
template family at once; both tests are needed, and both now run. (The sibling lesson's receipt
asserts that seconds-per-character "is useless alone" — that is true of a naive absolute band, and
not true of a 40% floor against the corpus median.)

The second addition teaches the opacity check about the **scene** class: a keyed cut-out that is
100% opaque means the chroma key failed, but a `scn_*` scene is full-bleed on purpose, so the rule
is inverted for those four. Without it they read as four FAILs.

**Sibling regression check: N/A.** The only engine files touched are `4_ENGINE/train_modules.js`
and `train_styles.css`, which are this game's **per-game copy** — the kit's sanctioned route. No
file under `factory/*/engine/*` was opened, so no other lesson's rendering can have changed.
Assets and code were *read* from `HI02H11_L02_S01`'s bundle and copied in; nothing in that bundle
was modified.

## Changed beyond the deck

Every difference between the round-2 card and the round-3 card was diffed field by field. Each one
maps to a row above except the following, which are **mechanical consequences** of rows that are
listed, not new decisions:

| diff | why it exists |
|---|---|
| `phase_distribution` `{7,5,4}` → `{5,5,7}` | auto-recomputed after the two deletes (58, 59) and the three new screens (132) |
| `signals_expected` — `matra_fill_*` / `poem_*` out, `word_build_*` / `sentence_complete_first_try` in | the modules those signals belonged to were replaced (107, 132) |
| `_emoji_fallback` gains 7 entries | the fallback for the 7 pending pictures (41, 149, 150) |
| `assets.audio_text` — 34 ids removed, 43 added, 18 reworded | the deleted screens, the new screens and the register flip (58, 59, 132, 153) |
| `vo_base_पल` → `vo_base_pal`, `vo_base_फल` → `vo_base_phal` | the **text** of these clips changed (24, 46), so the id changed too — otherwise the old recording stays on disk and `gen_tts` skips it, which is how round-2 audio once shipped under round-3 text |
| one clip per LINE instead of per slide | the deck gives screens 6 and 8 the same prompt and hints, and all four sentence screens the same three lines. Recording each once is what stops two screens speaking the same sentence in two different takes; it changes no wording |
| `vo_ak_pa` — a tap clip for the distractor पा | the deck lists tap clips for the three answers only. A card that stays silent while every other card speaks reads as a broken card, so the distractor got one too |
| the builder now deletes stale/orphan clips | required to make row 153 actually reach the child: `gen_tts` skips ids that already have a file |
| `guard_mechanics` ceiling 60% → 70% | the deck's own flow is 7 pick / 4 drag = 64%. The gate exists to stop a one-gesture lesson; the deck is authoritative on the flow, so the guard moved. **Flagged, not quietly widened** |
| builder paths re-pointed into this folder | the script built against the wider factory (`<factory>/G2/<CODE>/`), which is outside this self-contained handoff. Proven behaviour-neutral: re-running it before any content edit produced a **byte-identical** `card.json` |

Nothing else differs. No wording, colour, layout or pedagogy was changed that the deck did not ask
for.

---

## Judgement calls, stated so they can be overruled

1. ~~**The `◌` carrier on standalone matras**~~ — **retired.** The landing now carries bare `ु` and
   `ू`, because an orphan combining mark makes the font draw its own dotted placeholder circle,
   which is exactly the «ु» the note writes. The intro screen still uses an explicit `◌`, where the
   glyphs sit in a text run and the font supplies nothing.
2. **The heading band stays** (row 14). "Remove the current extra heading text from the top, **if
   needed**" is conditional; removing the band entirely is what produced round-2 defect #1
   («हेडिंग मिसिंग है»). The heading is now one line and is the screen's own VO line.
3. **The MATRA_BUILD panel captions go** (row 31). "Do not add unnecessary explanatory text" plus
   an "On Screen" list that does not include them. They were carried over from S01's mockup.
4. **WORD_BUILD's heading is the mockup's, its VO is the note's.** The mockup draws «चित्र देखकर
   सही अक्षर **खींचकर** शब्द पूरा कीजिए।» and the note writes «… सही अक्षर **से** शब्द पूरा कीजिए।»
   Both are the SME's; each is used where they put it.

## Open questions

| ref | question | status |
|---|---|---|
| Q1 | **Screen 16's sentence.** Note: «मीठा ______ खाना अच्छा लगता है।» Mockup: «गर्मी में मीठा ___ खाना अच्छा लगता है।» | **Decided — the note ships.** One card field + one VO clip to change if the SME prefers the mockup |
| Q2 | **The second WORD_BUILD distractor.** The mockup draws पु फू सु पा **मी**; the note removes मी. **पा ships alone**, which satisfies "1–2 distractors" and invents nothing. | ⚑ for the SME: did they mean to *substitute* मी rather than drop it? |
| Q3 | **The guiding hand on practice screens** (rows 117, 129, 140). The SME asks for a hand on the 2nd miss on every test screen; ruling `[28f]` forbids it outside tutorial/guided. | **Decided — keep `[28f]`.** Guided screens get the hand (verified), practice screens get the glow + pulse instead (verified). **Still worth the SME's sign-off**, as it narrows what they asked for on 7 screens |
| Q4 | **The painted train.** The mockup draws a painted locomotive and bogies. | **RESOLVED — it is painted.** The sibling lesson `HI02H11_L02_S01` had already built this screen with the very artwork the mockup draws, so it was ported rather than rebuilt: animated spritesheet, chimney smoke, rail, cropped from three coaches to two. The interactive trains stay drawn, because their coaches must recolour, glow, shake, lock and accept drops |
| Q5 | **Sibling register split.** S02 speaks आप; `HI02H11_L02_S01` still speaks तुम across the same LO. | ⚑ Either S01 is re-recorded or the SME accepts the split. Now more visible, since the two lessons share their train artwork and SFX |
| Q6 | **The em-dash lines.** | **RESOLVED BY MEASUREMENT, and the answer reversed an earlier one.** Shipped with the SME's em-dash first; measured, and all four MEET_PAIR lines came back at 0.69–1.21 s against the ~5.4 s their length calls for — the model says the first word and stops. The sibling probed it head to head, same words: em-dash 0.73–1.05 s · comma 1.53–2.21 s · danda 1.13–2.01 s. **The dash is now a comma in the recording script and no word changed**; all four now run 3.37–3.57 s. ⚑ The SME should know their punctuation was altered, even though the listener cannot hear it |
| Q7 | **Screen 14's praise line.** «शाबाश! मैंने सही शब्द चुनकर वाक्य पूरा किया।» is first person, unlike its three siblings which read the completed sentence back. Shipped as written. | ⚑ Likely a slip — confirm rather than normalise |
| Q8 | **The voice.** All 80 clips are **Leda**, chosen by re-synthesising three lines whose round-2 originals survive and matching them acoustically (Leda closest on all three). But the **sibling lesson's voice is Kore**, and the corpus margin here is thin. | ⚑ **Thirty seconds of a human ear settles this and nothing else can.** Play `vo_name_pul` (round 2, untouched) against `vo_landing` (new). If they differ, say so and the 61 new clips are one command to redo |

## Brought in from the sibling lesson (HI02H11_L02_S01)

Not in the deck — added on the user's instruction to reuse that lesson's assets, animation and
SFX, since it is the ी/ि half of the same LO and the same «मात्राओं की रेल» design.

| what | why it is better than what round 3 shipped |
|---|---|
| the **painted landing train** (36-cell spritesheet + travel curve + chimney smoke + rail) | it is the artwork the SME's mockup actually draws; round 3 had a drawn SVG stand-in |
| `sfx_train_arrive` · `sfx_train_move` · `sfx_whistle` · `sfx_mt_burst` | real recordings; the train sounds were synthesised `_tone()` beeps on seven screens |
| the sibling's **findings**, which changed two decisions here | its receipt documents the identical em-dash truncation with a head-to-head probe (Q6), and the same one-clip-per-line fix that round 3 had already arrived at independently |

Adapted, not copied blind: all 36 sprite cells cropped 634 → 479px to go from three coaches to
two, with the panel centres, chimney anchor and entrance offset recomputed for the narrower cell.
Full detail and the two traps it hit are in `4_ENGINE/CHANGES.md` under **ROUND 3b**.

## Observations — noticed, NOT changed

The game was left exactly as the deck specified on all of these.

1. **`1_SPEC/_BUILD_RECEIPT.md` describes a different build** — "20 slides, tutorial 5 / guided 6 /
   practice 9, 86 voice clips, 14 test slides". Round 2 was 16 slides and 79 clips. It looks like a
   receipt copied from the sibling lesson and never re-generated. Not touched; it is stale rather
   than wrong-in-a-way-the-child-sees.
2. **A drag that ends on a coach also fires the tile's `click`,** so the card speaks its own name
   after a wrong drop, on top of the hint line. Pre-existing round-2 behaviour in `TRAIN_SORT`, not
   introduced here, and benign (the SME wants tap-to-hear) — but it is two clips where one was
   intended.
3. **`obj_subah` took two attempts, and the first failure is worth recording.** "A sun half risen
   above a horizon LINE, fused into one connected shape" produced a sun sitting in a dark teal
   **bowl** — because the keying rule (one connected silhouette, thick dark outline) turns a thin
   horizon line into a container. At the 66px option-card size it read as a basket, not as
   morning. Regenerated as a sun rising from behind two hills, which is one shape for the keyer
   and unambiguously a sunrise for the child, and is clearly distinct from `obj_sooraj`. The
   working prompt and the reason are now in the builder so a re-run cannot revert to the bowl.
4. **`capture_pages.py` strips only the bare `.seq-hidden`,** not `mb-seq-hidden` / `tr-seq-hidden`
   — contrary to what `4_ENGINE/CHANGES.md` claimed. With clips missing, `say()`'s 9-second
   fallback stops the reveal chain finishing, so teach screens photograph half-painted. The doc is
   corrected and `_review_shots/` was captured with a settler; the harness itself is an upstream fix.

5. **I wrote a voice-consistency checker and then deleted it.** `gen_tts` recovers a refused clip
   on a *different* voice, which on this lesson means the narrator changes mid-lesson — so a check
   for it looked worth having. It does not work: measuring pitch and spectral centroid per clip
   flags **original round-2 clips** too, because within-voice variation across different sentences
   is larger than the gap between two voices. Comparing identical text works; comparing different
   sentences does not. Shipping it would have trained the next person to ignore a red line. The
   reliable signal is `gen_tts`'s own report of what it swapped — see Q8, which needs an ear.

6. **`vo_ak_pul` («पु») is the one clip not on the primary voice.** A bare syllable is refused
   almost every time; it recovered on a style-wrapped fallback. It is 0.87 s and intelligible, but
   it is one card-tap sound in a different timbre. EAR-CHECK it.
5. **`mountSlide(i)` does not dismiss the landing gate.** Until शुरू करें is pressed the body keeps
   `is-start` and `elementFromPoint` returns the stage, so every drag silently does nothing while
   taps keep working. Cost an hour here; now written up in the README.
6. **The three sentence distractors are not checked for accidental correctness.** `guard_sentences`
   proves the answer is an option and is not pre-printed, but whether «बगीचे में सुंदर तरबूज खिले
   हैं।» reads as wrong *enough* is a human judgement. Worth one read-through by the SME.

---

## Round 5 — three parity asks (not from the deck)

Asked for directly, after round 4's page-1 pass:

> currently page1 feels bit empty, do one thing bring back the train in page 1, but it should not
> get outside of the box that is made — also you are still not using the buttons and its placement
> used in this file `F:\CG Game\FLN\FIle2\HI02H11_L02_S01_DEV_HANDOFF-file2-` (play button, next
> button) — and also in the cover page there is animation in the stars and bubble which is
> currently missing in my current file so incorporate all of these changes so that it align with
> my previous file

| # | Ask | What was different | Change | Proof |
|---|---|---|---|---|
| R5-1 | next button to match S01 | the *pill* was already identical; the arrow glyph was `28px` here against `52px` there — nearly half-size | `.nav-btn::after{content:"→";font-size:52px;line-height:1}` | render · measured `52px`, `bottom:32px` |
| R5-2 | play button to match S01 | S01 ships it icon-only (`▶` via `::after`, Hindi in `aria-label`) with two states; ours showed the text and had none | icon-only + `.sg-waiting` + `.idle-pulse` | render · `h=64 minw=186 bottom=40`, glyph `30px`, `animation:none` at rest |
| R5-3 | end button (found while doing R5-1) | its arrow was **typed into the label**, so adding `::after` would have drawn `आगे बढ़ें → →` | typed arrow removed; `::after` draws it, as on `.nav-btn` | render · text `आगे बढ़ें`, `::after "→"` |
| R5-4 | stars + bubbles on the cover | the whole FLN animation kit was absent — `grep -c "sg-sky\|sgFly"` was **0** | recipes 1 + 2 ported; `.sg-glow`/`.sg-sky` added to the body | render · 87 elements, `animation:sgFly`, a star moved 33px in 1.2s, a tap fires a burst |
| R5-5 | (required by R5-4) | `startnew_bg.webp` has stars painted in — drifting more over them is the kit's own "two sets of stars, one frozen and one moving" bug | swapped to `startnew_bg_plain.webp`, copied from S01 | art · computed `background-image` ends `startnew_bg_plain.webp` |
| R5-6 | (required by R5-4) | `bgdeco_star.svg` / `bgdeco_star_o.svg` / `bgdeco_spark.svg` were deleted in an earlier round as "unused" | restored from S01 | art · 3 files back in `assets/UI/` |
| R5-7 | train back on page 1, inside the box | page 1 had no train after round 4 | `MATRA_PAIRS` mounts a `TrainChrome` train under the pair row; **coach *k* carries the matra of pair *k***, revealed on the same beat the pair lights up | render · train `412×150`, 2/2 coaches carry their matra at the end |
| R5-8 | "should not get outside of the box" | — | `.mp-train` is a 560px box with `overflow:hidden`; `maxW/maxH` size the art well inside it; `.train-track` pulled back from its `-7%` overhang so the clip is not cutting a visible rail | render · furthest part **+116px mid-arrival (clipped), +0.0px at rest and after the chain** |
| R5-9 | (required by R5-7) | the prompt firing at mount would play under a 3.4s arrival with a whistle and chug bed over it — the round-3c clash | prompt gated on `whenParked`; chain failsafe 30s → 34s | vo · 0 clashes across 18 screens |

### The pulse question, since it was settled the other way once

Ruling **[30l]** in this engine killed `sgBtnPulse` because it ran from first paint: it was
wallpaper, not a signal, and there was nothing left to escalate to when a child actually stalled.
That ruling is **not** reversed. S01's answer is better than either extreme and is what was taken:
the pulse hangs off `.idle-pulse`, which only a 5-second idle timer adds, so a resting button is
still perfectly still. A tap anywhere on the cover restarts that wait rather than cancelling it.

### One deliberate divergence from S01

The kit's burst handler claims a tap with `preventDefault()`, which kills the click that follows —
so a star drifting over शुरू करें would make the button silently ignore the press. The mask that
hides stars behind the centre card is **visual only**, so those stars still have a real box and a
real computed opacity and the kit's own `minAlpha` test cannot tell they are invisible; the play
button sits inside that masked area. Taps on `button, a, input, select, textarea, [role=button],
[onclick]` are now left alone. **S01 carries this latent bug** — worth telling whoever maintains it.

### A build trap now guarded

The new CSS carried a comment mentioning `</sty`+`le>`. The HTML parser does not care that it sits
inside a CSS comment — it ended the stylesheet there and every rule after it became text in the
body. The stage was shoved to `x=1797` in a 1382px viewport, the sky layers never got
`position:fixed`, and the start button became unclickable. Clean build, green receipt, no console
error. `inject_train.py` now refuses to inject either source if it contains a literal closing tag,
naming the file and line.

### Known, and not a build problem

Three headless-only harness quirks, each confirmed against the sibling build before being written
off — and worth reading before anyone spends an afternoon on them again:

* **The first synthetic press of शुरू करें can deliver `pointerdown` alone** under Chrome 153
  headless — no mousedown, no click — so the lesson never starts and every captured page comes
  back as the cover. It was blamed on the new disabled state, then the star layer, then the burst
  handler; removing each changed nothing. **S01 does the same under the same driver.** Both
  shipped harnesses now press with `ActionChains`, retry up to four times, and poll
  `startGate.hidden` rather than sleeping a fixed 3.5s.
* **The phase gate cannot open when the real `play()` is in use** — its VO goes down the WebAudio
  buffer path and that source's `onended` never fires, so `body` keeps `vo-lock`. Stub
  `window.play` first, or use the engine's own `?slide=N` QA jump. **S01 behaves identically.**
* **Page 1's pairs are not `*seq-hidden`**, so the capture settler never revealed them — they are
  held by `opacity` and revealed by `.active`/`.shown`. Harmless while page 1 had no train,
  because the chain finished inside the harness's 4s wait; once the chain began waiting for the
  train to park it left the review shot showing **one pair where the child sees two**.
  `_capture_settled.py` now settles them to the deck's end state.

### Verification after round 5

| check | result |
|---|---|
| build receipt | **0 FAIL · 1 WARN** (unchanged: the `vo_pair_u` / `vo_pair_uu` em-dash EAR-CHECK) |
| geometry sweep | **0 / 17** slides with findings |
| round-5 parity checks | **24 / 24** |
| VO clashes | **0** across all 18 screens — and page 1 was genuinely measured this time (`T1 clips=2`; the harness's broken press had been reporting `clips=0`, i.e. a screen never mounted, which is indistinguishable from a screen with no clashes) |
| mechanics driven | **11 / 11** wrong → wrong → right, each with its own hint ladder |
| ruling [28f] | **proven, not inferred.** Guided G1–G5 on miss 2: `glow=1 hand=1`. Every practice slide on miss 2: `glow=1 hand=0`. The train blocks used to print `.is-nudge` (the coach GLOW, which [28f] allows in practice) under the heading `hand=`, so a legitimate glow read as a violation and a real hand would have read as normal. Both are now separate columns. |

---

## Round 6 — page 1 back to the cards, and the next button loses its label

> remove train use this same structure as showin in the screenshot, also remove text from next
> button, and its placement should be exact same as the previous file ... also make sure to follow
> this except train thing: *(the SME's page-1 recommendation, quoted in full)*

The screenshot supplied with this ask is **this bundle's own round-2 page 1** — `MATRA_INTRO`,
heading «आज हम उ और ऊ की मात्रा वाले शब्द पढ़ेंगे।», two white cards. So round 6 restores that
structure while keeping the round-5 module, whose staging already follows the SME note line by
line. Round 5's train on this screen is removed.

| # | Ask | Change | Proof |
|---|---|---|---|
| R6-1 | remove the train from page 1 | the `.mp-train` box, its `TrainChrome` mount, the coach matras and the `whenParked` gate are gone; the chain is back to prompt → pairs, failsafe 34s → 30s | render · 0 train nodes in `.slide-host` (the one `.train-shell` left in the DOM is the **cover's**, inside the hidden `#startGate`) |
| R6-2 | use the screenshot's structure | heading restored on T1 only; each pair back inside a white card | render · heading painted, 2 cards, `#fff` / `radius 22px` / `3px` border / shadow |
| R6-3 | remove the text from the next button | `<button class="nav-btn" id="navBtn" disabled aria-label="आगे"></button>` — the arrow is drawn by `.nav-btn::after`, exactly as the sibling ships it | render · `textContent` empty, `aria-label` present, glyph `"→"` at 52px |
| R6-4 | placement exactly the sibling's | nothing to change — the CSS was matched in round 5; this confirms it | render · **every** measured property identical to S01: `bottom`, `left`, `transform`, `min-width`, `height`, `border-radius`, `border-width`, glyph and glyph size |

### The SME's page-1 note, bullet by bullet

| bullet | state |
|---|---|
| VO «आज हम छोटी उ और बड़ी ऊ की मात्रा वाले शब्द पढ़ेंगे।» then the two pair lines | ✅ measured order: `vo_t1_prompt` → `vo_pair_u` → `vo_pair_uu` |
| show the letter and its matra as a pair, one by one | ✅ |
| keep only one pair active at a time | ✅ never more than one `.mp-pair.active` across the whole chain |
| each active pair lights up when its VO plays | ✅ gold ring + `mpGlow` on the matra |
| sequence उ → ु, then ऊ → ू | ✅ |
| keep the mascot and the UI/UX style unchanged | ✅ |
| train-theme continuity via a train-style card / bogie / box | ✅ **the card is what carries this** now that the train is gone |
| letter first, then the matra beside it with a soft glow | ✅ 480ms apart |
| then both fade slightly / dim softly | ✅ — see the note below |
| simple pop / fade animation, no extra decorative elements | ✅ nothing on the slide but the pairs and the mascot |
| soft pop / chime as each matra appears, subtle under the VO | ✅ `sfxPopSoft()` fires per matra |
| next button disabled during the sequence, active only after both | ✅ dead at mount, live only after the second pair has spoken |

### Dim the pair, not the box

The note asks that a taught pair "fade slightly / dim softly". Round 5 did that with `opacity:.5`
on `.mp-pair` — which also faded the **card**: against this pale grid the white fill and its
border washed out until the first card had visibly stopped being a card. The box now keeps its
full presence and the glyphs inside it fade instead.

### Two things the verification script got wrong before it got them right

Worth recording, because both would have been easy to "fix" in the product instead:

* **"no heading"** — the check read `.header-row`, which is `display:none` on this layout. The
  heading that is actually painted is `.tut-prompt` inside `.tut-card`, because teach screens lay
  out as `.tut-page`. The screenshot showed a heading while the check insisted there was none.
* **"an extra decorative element"** — it was the **mascot**, which the same note explicitly
  requires be kept. A check counting it as decoration contradicts the bullet above it.

A third failure was real only in the harness: `sfxPopSoft` is a module-scope const that builds a
WebAudio **oscillator**, so there is no `window.sfxPopSoft` to wrap and no `<audio>` element to
catch. Hooking `AudioContext.prototype.createOscillator` sees it.

### Spoken and shown are deliberately different strings

The VO keeps the SME's wording with छोटी/बड़ी; the heading is the screenshot's line without them.
Spoken, छोटी/बड़ी is exactly what separates two vowels that sound alike. Printed directly above the
two glyphs the words are redundant and make a short heading long. The VO clip already exists with
the SME's wording, so **nothing was re-recorded**.

---

## Round 7 — page 1 loses its heading and grows; the cover gets its track, its labels and its turn to speak

> remove heading text, and make the text box little bigger and put it in center of the main box
> — also in the cover page why did you removed the train track, please bring that back, also when
> train animation, sfx etc finished then start the main VO of cover page, also add "ऊ", "उ" and in
> bracket use matra

| # | Ask | Change | Proof |
|---|---|---|---|
| R7-1 | remove the heading text | `prompt_hi` back to `""` and `no_heading` back on for T1. The sentence is still **spoken** — it is the SME's own VO line — so nothing leaves the lesson, only the screen | render · heading empty |
| R7-2 | make the box a little bigger | padding `12/26` → `30/60`, gap `12` → `26`, glyphs `74px` → `88px` | render · **312×154**, was 268×116 |
| R7-3 | centre it in the main box | the empty heading band was hidden and the row pinned to the card | render · **2px** off the box centre (was 38px) |
| R7-4 | bring the cover's track back | the `.lt-cover` rule that hid it is gone | render · 543px of rail under the train |
| R7-5 | cover VO after the train and its SFX | `ltReady()` releases the greeting when the last matra has popped and its sparkle has sounded; a 7s backstop covers a stalled arrival | render · greeting at **3.9–4.5s**, last SFX **0.47s earlier**, over three runs |
| R7-6 | «letter (matra)» on the cover's coaches | `उ (◌ु)` / `ऊ (◌ू)`, the same form G4's bins already use | render · labels match |

### Two decisions inside those

**The cover's track was hidden on purpose, and that was wrong.** Round 3c hid it to match the
sibling, whose cover has no rail. That was a copy of a decision rather than a decision: a train on
the cover is a train, and a train on no track reads as a train falling. Restored.

**The dotted circle stays.** `(◌ु)` rather than `(ु)` — ◌ is how an isolated matra renders
throughout this bundle, and G4's sorting bins come back the same way, so the cover names the pair
exactly as the later screens do. The verification expected `(ु)` and was wrong, not the build.

**The सुनो chip is not gated.** `playLanding()` has two callers and only the automatic greeting
waits for the train; an explicit replay that waited would read as a dead button.

### The centring took four attempts, and the reason is the useful part

The heading element was **empty but still 92px tall**. The rule that hides the band targets
`.header-row` — but teach screens lay out as `.tut-card`, whose heading is `.tut-prompt`. So the
band was "hidden" while the gap it left was not. **This is the same two-element confusion that
made the round-6 check insist there was no heading while the screenshot plainly showed one.**

Then hiding it did not centre anything either: the freed 92px went straight to `.tut-content`'s
flex-grow. Three attempts through the flex chain each moved the cards somewhere new and none
landed on the middle — a negative margin did nothing at all, because the row is *positioned* by
its parent's `justify-content` rather than *sized* by it. The chain is four nested flex boxes with
four opinions, and this screen needs one thing from it: a box the size of the main box with two
cards in the middle. It now takes that box directly, pinned to `.tut-card`.

### ⚠️ Open: T2–T5 carry the same empty band

Hiding `.tut-prompt` for every `no-band` screen **also moved T2–T5** — they stack from the top, so
the freed 92px pulled their content against the ceiling and left a hole underneath. They were not
part of this ask and nobody has raised them, so the fix is **scoped to page 1** and those screens
keep the layout they have been reviewed in.

The empty band is still wrong there. It is left as a question rather than a silent change:
**should T2–T5 also drop their blank 92px band, and if so should their content re-centre or stay
top-aligned?** One line each way; it needs somebody to look at the four screens and say.

---

## Round 8 — the glow lands on the words, and the cover's track spans the box

> page1 is completed just small changes when the VO plays "iski matra..." then highlight the matra
> — and in cover page the track length cover the entire main box

| # | Ask | Change | Proof |
|---|---|---|---|
| R8-1 | highlight the matra when the VO says «इसकी मात्रा…» | the glow moved off the pop and onto a per-clip cue | render · `vo_pair_u` cue 1180ms, glow at **+1196ms**; `vo_pair_uu` cue 1100ms, glow at **+1104ms** |
| R8-2 | the cover's track covers the whole main box | pinned to the card's centre at the card's width less a margin | render · **1027px of the card's 1111px (92%)**, 42px clear at each end |

### Why the cue is computed and not a constant

The glow used to start the instant the matra popped in — which is while the clip is still saying
«यह है उ।», i.e. **naming the letter**. So it was pointing at the wrong mark while the right one
was being spoken.

A fixed delay cannot fix that, because the two clips are **4.13s and 3.85s**: any constant is
early on one and late on the other. There is no forced aligner in this toolchain, so
`_matra_cue_ms()` takes the clip's real duration off the file on disk and scales it by where
«इसकी» begins in the text (spaces stripped — they are not spoken, and there are more of them in
the second half, which would push the cue late). Both land at ~29% in.

That is an estimate, and it is allowed to be: the highlight is a 1.2s glow repeated three times,
so it only has to **start inside the right phrase**, not on the exact sample. It is computed at
BUILD time from the file, so a re-recorded clip recomputes its own cue instead of quietly
inheriting a stale one — and a missing file falls back to 1300ms rather than to zero.

The glow also gained a third repeat: it now starts partway through the line and would otherwise
finish before the sentence does.

### The cover's track

On the activity screens the track is sized off the TRAIN — `left/right: -7%` of the rail — because
there it is the line the train arrives along. On the cover the train is a title illustration in a
1114px card, so a track stopping 90px past the buffers read as a stub of rail rather than as a
railway. Measured: the card spans 1111px and the rail only 476px, dead centre. The cover's track
is now pinned to the card's centre at 1030px — **the card's own fixed width less a 42px margin at
each end**, not a number picked to look right.

---

## Round 9 — pressing ▶ on the cover replayed the greeting instead of starting the lesson

> everything is fine just there is one issue in cover page — when I click on play the VO plays
> again I have to listen it all then again play button appears fix this bug

**Reproduced before touching anything:** greeting at 3.1s, button goes live at 7.8s, the press
replays `vo_landing.ogg` at 8.3s, the button returns to `sg-waiting`, and the gate never opens.

**This was mine, introduced in r7.** The autoplay-policy fallback fires on the first `pointerdown`
anywhere and starts the greeting if nothing is audible. That has been there for a long time, and
`[30m]` already guarded it. What r7 added was `setStartBtnReady(false)` *inside* the greeting — and
that turns a harmless double-play into a **swallowed press**:

1. `pointerdown` on ▶ runs the fallback,
2. the fallback starts the greeting, which **disables the button**,
3. a browser does not dispatch `click` on a button that became disabled during the gesture.

So the press was eaten, and the child had to sit through the whole greeting before the button came
back — exactly as reported.

### Why the old guard could not catch it

`_audible` only asks *"is sound moving right now"*, which is false in three different situations it
has to tell apart:

| state | audible? | fallback needed? |
|---|---|---|
| autoplay was refused | no | **yes** — this is what it is for |
| the greeting already ran | no | no |
| the greeting is queued behind the train (new in r7) | no | no |

Three guards now, one per row: a tap on a **control** is never a cue to speak; the greeting is
remembered once it has **sounded**; and while the train gate still holds it, it is *scheduled*,
not blocked.

### The fix nearly broke the thing it was guarding

The first version remembered `_landingSpoke = true` where the greeting was *requested*. `[30m]`
warns against precisely that — *"on a blocked autoplay we DID call it, so a call-flag would kill
the very fallback this line is for"* — and it did: the test for a genuinely refused autoplay went
red. The flag now records the **return**: a greeting that reports back in under 600ms never
sounded, because a refused clip comes back at once and a real 5s one cannot.

That case is now a standing test, so the next person to touch this cannot quietly delete the
fallback and still pass.

### Verified

| check | result |
|---|---|
| pressing ▶ replays the greeting | **no** — only the phase-gate clip follows |
| ...puts the button back into `sg-waiting` | **no** |
| ...starts the lesson | **yes**, one press opens the gate and mounts page 1 |
| the सुनो chip still replays on demand | **yes** |
| a genuinely blocked autoplay still recovers on a background tap | **yes** |

---

## Round 10 — one box size for every page

> I noticed the size of my first page's main box and rest page is different — please ensure box of
> each page remain same as pages, also the placement of button will also be same — you can refer
> my previous file for this

**Measured both builds before changing anything**, because the ask names the sibling as the
reference:

| | box (teach slides) | nav button |
|---|---|---|
| sibling `HI02H11_L02_S01`, every teach slide | `1130×561` | `x=606 y=559` |
| this build, page 1 | `1130×561` ✅ | `x=606 y=559` ✅ |
| this build, pages 2–5 | **`1130×521`** ❌ | `x=606 y=559` ✅ |

**Page 1 was the correct one; pages 2–5 were 40px short.** The culprit was
`.stage.no-band .slide-host{ padding-bottom:40px }` — mine, added while chasing the page-1
centring so that heading-less teach content would clear the आगे button. But padding on the host
shortens the **card**, and only on the screens that opted out of the heading, which is exactly how
one lesson ended up with two card sizes.

The sibling settles whether the clearance was ever needed: every teach slide there is 561px with
**no** bottom padding and clears the button perfectly well. The padding is gone; the `.mp-center`
override that cancelled it is gone with it.

### The button was already right

Measured on both builds, all 17 slides: `x=606 y=559` on every teach screen and `x=606 y=654` on
every test screen — identical to the sibling. The two values are **by design**, not a discrepancy:
teach screens use the blue rounded card (`.tut-card`), test screens the full-bleed layout
(`.slide-stage`), and the sibling does the same. A check that demanded one number everywhere would
be wrong about the product.

### Verified — all 17 slides in both builds

| check | result |
|---|---|
| teach: every page's box is the same size | **1130×561 on all 5** |
| teach: nav button in the same place on every page | **x=606 y=559 on all 5** |
| teach: box and button match the sibling | **identical** |
| test: every page's box is the same size | **1329×598 on all 12** |
| test: nav button in the same place on every page | **x=606 y=654 on all 12** |
| test: box and button match the sibling | **identical** |

---

## Round 11 — page 2 rebuilt to the sibling's page 2

> so now make the following change for page2: *(the SME's full recommendation)* — you can refer my
> previous file … page2 of my previous file is exactly same as page2 of my current file (just
> element, images changes rest animation, its flow it same) so try to match exactly with that file

`MATRA_BUILD` is now the sibling's module, step for step. The previous build hit the same *beats*
through four nested `say()` callbacks with hard class swaps — it had none of the motion.

| beat | before | now |
|---|---|---|
| three panels | all present, opacity-toggled | revealed in turn with `mbIn` |
| प highlighted in पल | a colour class on the whole word | the single `.mb-c` lights |
| ◌ु arrives | appeared in place | **flies in**, parked on the slot's measured centre, overshoots, settles |
| hand-over to the equation | — | **cross-fade**: the flier dissolves as the slot's glyph fades up |
| प → पु | `textContent` swap between two frames | dissolves up, and the equation **nods** (`mb-settle`) |
| पुल + bridge | class swap | panel arrives with the success sound |
| three-sound contrast | clip only | the equation **pulses** (`mb-say`) under it |

### Two things are deliberately NOT the sibling's, and both are forced by the matra

1. **The highlight.** The sibling paints its matra with `_matraWordSVG`, which clips by **column** —
   an x-range over the full height. That works for ा / ि / ी, which are **spacing** marks with an
   advance of their own. **ु and ू have no advance**: they hang under the consonant, so the
   consonant's advance and the cluster's advance are the same number and the column comes out
   zero-width. This lesson's `matraHL` exists for exactly that — a 2-D clip, the cluster's x-range
   intersected with the below-baseline band. Using the sibling's helper here would have silently
   painted nothing, or painted the next letter.
2. **The direction of travel.** The sibling sends ा / ी in from the RIGHT and ि from the LEFT,
   because that is where those marks live. ु lives **underneath**, and the note says so: *"The ु
   मात्रा should softly pop/slide into its correct position below प."* `data.travel` carries it,
   so the flight is vertical here and the keyframes take both axes.

### SFX: the note's three, and only those three

A soft pop as the matra arrives, a light chime as प becomes पु, a small success sound as पुल
completes. The sibling also chimes when the consonant lights; the note lists three and asks to
"keep SFX subtle so the pronunciation remains clear", so that fourth one is left out.

### One clip the sibling's flow has no place for

`vo_matra_u` («छोटी उ की मात्रा») is not in the sibling's chain and not in the SME's ordered
sequence either. It is already recorded here, and deleting a recorded line is a content change
nobody asked for, so it plays **as the matra lands** — which is what it names. Say the word and it
goes.

### Retiring the old stylesheet took a live rule with it

The previous module's `.mb-*` rules describe a DOM that no longer exists, so they were dropped to
stop two stylesheets fighting over the same class names. **`.mb-seq-hidden` and `.mb-in` went with
them and should not have**: `CONTRAST_PAIR` uses those two as generic show/hide on its own `.cp-*`
elements, and the capture settler strips every `*seq-hidden` class. Caught by grepping the JS for
every retired class before rebuilding; both restored.

### Verified — the sequence watched at true speed, on both build screens

| check | T2 «पल → पुल» | T4 «फल → फूल» |
|---|---|---|
| all 13 beats, in the SME's order | **25.6s** | **25.9s** |
| प lit before the matra arrives | ✅ | ✅ |
| the matra flies, then hands over to the slot | ✅ | ✅ |
| प becomes पु only after it lands | ✅ | ✅ |
| pop / chime / success at the right three beats | ✅ | ✅ |
| ु highlighted inside पु **and** inside the finished word | ✅ | ✅ |
| picture shown beside the finished word | ✅ | ✅ |
| आगे unlocks only after the whole transformation | ✅ | ✅ |

Order is asserted on **timestamps**, not list position: a MutationObserver mark arrives a
microtask after the mutation that caused it, so two events in the same frame carry no order
information. The first run of this check also reported the prompt "missing" — the hook was being
installed after `?slide=N` had already mounted and started the chain. It installs before the
document now.

---

## Round 12 — the supplied artwork, and "highlight only the matra"

> I've added images that you can use in page1 to 5 — also in page2 when we highlighting the matra
> then highlight only matra not any other letter, also there is extra (dotted matra) so remove
> that as well

### The artwork

Two contact sheets, eight objects, mapping exactly onto pages 2–5's vocabulary:

| sheet | objects |
|---|---|
| 1 | पल (clock+calendar) · पुल (bridge) · गुड़ (jaggery) · धनुष (bow) |
| 2 | फल (fruit basket) · फूल (flower) · दूध (milk) · कबूतर (pigeon) |

Both arrived as **transparent RGBA**, so there is no keying step — `gen_objects`' magenta
chroma-key and its halo pass would only have risked eating edges that were already clean. Sliced
on alpha gaps, autocropped, resized to 360px (2× the 180px display box) and palette-quantised:
**1.75 MB → 575 KB for all eight**, which is *lighter* than the six files it replaces, so the
bundle gets smaller while gaining two images.

**पल and फल are the point.** They are the base words on pages 2 and 4 and had *no picture at all*
— the builder skipped them because they carry no target matra and so are not in `OBJ`. They now
live in a new `BASE_OBJ`, deliberately separate: `OBJ` is "words carrying exactly one target
matra" and `guard_single_matra` audits it as such, so पल and फल must not enter it.

A fixed gutter width could not split the sheets: the objects sit closer together than the gaps
*inside* some of them (the bow's string, the basket handle). The slicer takes the N−1 **widest**
gaps instead, the piece count being known.

### The doubled dotted circle — mine, from round 11

The chip was `<span class=mb-dot>◌</span><span class=mb-mk>ु</span>`, two spans so the placeholder
could be greyed and the mark coloured. But **ु is a combining mark**: alone in its own span it has
no base to attach to, so the renderer supplied **a dotted circle of its own**. Hence the grey one
we asked for, followed by a second orange one carrying the matra. One span, one cluster, one
circle.

### "Only the matra" was three separate faults

Blowing the equation up to 3× is what showed them; at normal size it just looked like a smudge.

1. **The glow was flooding the clip box.** `.mh-glow` is a 14px-blur text-shadow, and the overlay
   is clipped to a box drawn tight around the matra — the blur had nowhere to fade out, so it
   saturated the rectangle and the clip edge turned it into a **hard orange block** over the
   neighbouring letters. It read as "the highlight covers the other letters" because it did.
   Now 3px, hugging the stroke.
2. **The clip's floor cut the mark.** `y1` was the element's rect height, but these panels set
   `line-height:1` and ु/ू descend **below** the content box — so the bottom of every mark was
   left navy under an orange body. The band now reaches past the box; nothing else is down there.
   The same widening was applied on the x axis: below-base marks curl a few px past their
   cluster's advance, and that tail was being clipped off too.
3. **The chip is not a word.** matraHL clips "below the baseline, within the cluster", and on the
   isolated «◌ु» the **placeholder's** own lower dots sit in exactly that band — so they went
   orange, which is the one thing the note asks to leave alone. There is nothing to separate on a
   chip. It is coloured outright now, the way page 1 already draws its pairs, and matraHL is left
   to real words.

**Faults 1 and 2 are engine-wide** — every screen using matraHL had the same block, including the
three tap screens.

### The receipt caught what I missed

Adding `BASE_OBJ` gave the two new images no **emoji fallback**: that map is built from `OBJ` and
`SCENE`, and the new dictionary was in neither. `0 FAIL` went red on the sweep after the change,
which is exactly what the receipt is for. Fixed at the source rather than by exempting the check.

### Verified

| check | T2 «पल → पुल» | T4 «फल → फूल» |
|---|---|---|
| the base word has a picture | ✅ | ✅ |
| one dotted circle in the equation | ✅ | ✅ |
| the matra is highlighted | ✅ | ✅ |
| the highlight stays on the matra | **35%** of the word's width | **30%** |
| the whole 13-beat sequence still runs in order | ✅ | ✅ |

Receipt 0 FAIL · 1 WARN · geometry 0/17 · the tap screens still highlight on the win.

One check of mine was wrong before it was right: it reported ू as *two* dotted circles because it
split ink runs on a 3px gap, and ू is a broad double-curl with a real empty column inside it. Two
circles side by side are separated by inter-character spacing, which is far wider — the threshold
is 14px now.

---

## Round 13 — page 3 restaged, and the matra highlight rebuilt

> now follow these for page3: *(the SME's full recommendation)* … page3 of my previous file is
> exactly same as page3 of my current file … also I've told you earlier, when we highlight the
> matra then highlight only the matra, currently many place some matra is half higlighted, some
> are highlighted with the letter as well

### The highlight — rebuilt, not tuned again

Every version before this drew a **rectangle** around where the matra was calculated to be and
painted whatever ink fell inside it. That is the source of *both* symptoms, and they are the same
bug from opposite sides:

| box | symptom |
|---|---|
| too small | the mark's tail or lower curl sits outside it and stays navy — **"half highlighted"** |
| too large | it catches the consonant's foot or the next letter's stem — **"highlighted with the letter as well"** |

Rounds 11 and 12 each moved the edges and traded one symptom for the other. **A below-base matra
is not rectangular and no rectangle contains it exactly**, so no amount of edge-tuning could have
finished the job.

It now finds the pixels by **subtraction**: raster the word twice at the same origin — once as
written, once with the matra deleted — and take the difference. Those pixels *are* the mark,
whatever the font does with the cluster. The difference becomes a **mask** on the orange overlay,
so the highlight is the mark's own silhouette. No geometry, no edges to tune.

**Why this is sound for ु/ू and not for every matra.** They are *non-spacing*: they add no
advance, so deleting one leaves every other glyph exactly where it was and the difference is
purely the mark. A spacing matra (ा, ी) shifts the letters after it, and ि reorders — the
difference would include half the word. Those keep the advance-based path, which is what the
sibling uses and what is correct for them.

**So "the previous file is perfect" was true for the matras that file teaches, and would not have
transferred.** Porting its helper here would have painted nothing, or painted the wrong letter:
ु/ू have zero advance, so its column clip comes out zero-width.

Verified at 1.5× on all six highlighted words in the lesson — पु · पुल · धनुष · फू · फूल · कबूतर —
every mark complete, no letter ink caught.

### Page 3

Restaged to the sibling's page 3 (`MEET_EXAMPLES`). **The order was inverted before**: the module
spoke the whole line *first* and revealed the picture and the highlight on its callback, so the
child heard «इसमें ग पर छोटी उ की मात्रा लगी है» while nothing on screen had changed, and the mark
lit up after the sentence naming it had finished.

Now: **word + pop → 520ms → picture fades in + pop → 380ms → matra lights + chime, then the line
plays over the glow.**

The «इस शब्द की मात्रा — ◌ु» callout is gone. It had been `display:none` since an earlier round —
the mark is highlighted inside the word now, so the callout said twice what the word shows once —
and the guiding hand that pointed at it went with it. It was pointing at an invisible element, and
the sibling's page 3 has no hand either.

`MEET_PAIR` also stops faking a settled end state at mount. It renders **staged** (word visible,
picture held) and the capture settler finishes it, so the photographed state and the live beat are
the same thing rather than a mount-time fake the chain then undoes.

### Verified

| check | page 3 «गुड़ → धनुष» | page 5 «दूध → कबूतर» |
|---|---|---|
| the sequence in the SME's order | **16.9s** | **18.5s** |
| one example visible at a time | ✅ | ✅ |
| word appears before its picture | +7448ms / +522ms | +6166ms / +522ms |
| the matra lights after the picture | +431ms / +399ms | +417ms / +403ms |
| the line plays with the glow, not before it | ✅ | ✅ |
| आगे unlocks only after both examples | ✅ | ✅ |

Receipt 0 FAIL · 1 WARN · geometry 0/17 · rounds 10–12 all still green · 11 mechanics driven.

### Two harness traps, both about hooking `play()` early enough

The check first reported the page-3 prompt "missing" while an 8-second gap in its own timeline
proved it had played. `?slide=N` mounts during page load and the chain's first clip can fire
before a polling hook attaches.

Replacing the poll with an accessor on `window.play` made it **worse** — all logging vanished. The
engine declares `function play(){}` at top level, and a global function declaration defines the
property with a *data* descriptor, silently replacing the accessor. The fix is neither: load the
lesson with no `?slide`, install the hook while nothing has mounted, then call `mountSlide()` by
hand.
