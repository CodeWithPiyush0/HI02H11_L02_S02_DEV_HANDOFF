# CHANGES — HI02H11_L02_S02 «मात्राओं की रेल» (उ / ऊ) · round 3

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
| 19 | Page 17 `17_CELEBRATION.png` | 17 · CELEBRATION — no note |

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
| 15 | "Show the letter and its corresponding matra symbol as a pair, one by one. Keep only one pair active at a time." | ✅ | `engine` MATRA_INTRO step chain (`is-dim` on all but the active pair) |
| 16 | "Each active pair should light up/highlight when its VO plays." | ✅ | `engine` `.mi-pair.is-on .mi-car` amber ring |
| 17 | "Sequence should be: उ → ु · ऊ → ू" | ✅ | `card` `data.pairs` in that order; `render` 02 |
| 18 | "keep the train-theme continuity by showing each pair inside a train-style card / bogie / box." | ✅ | `engine` `.mi-train` — each pair is now a coach behind the locomotive, on the track; `render` 02 |
| 19 | "First उ appears, then ु appears beside it with a soft glow. After that, both can fade slightly / dim softly. Then ऊ appears, and ू appears beside it." | ✅ | `engine` — step chain toggles `is-on` / `is-dim` per pair |
| 20 | "Do not add extra decorative elements." | ✅ | `render` 02 — locomotive, two coaches, track. Nothing else |
| 21 | "Add a soft pop / chime when each matra symbol appears." | ✅ | `engine` `sfxPopSoft()` per pair |
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
