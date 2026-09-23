# HI02H11_L02_S02 (भाग 1 — उ / ऊ) — build receipt

**उ, ऊ मात्रा वाले शब्द पढ़ता है। शब्दों में आने वाली मात्रा पहचानता है।**
Curriculum sheet row 56, **Part 1 of a two-part row** (Part 2 is ए / ऐ). Built 2026-09-21.

## What shipped

| | |
|---|---|
| slides | **20** — tutorial 5, guided 6, practice 9 |
| engine | `2026.08.04b-r4-unified`, per-game `engine_local/` copy, **byte-identical to the sibling's** |
| illustrations | **10/10**, every one eyeballed at full size |
| voice clips | **86** = 78 recorded + 8 copied chrome/phase-gate |
| asset receipt | **0 FAIL / 0 WARN** |
| runtime | **96/96 declared assets return 200**, fetched from the live page |
| mechanic gate | 14 test slides — drag 6 (43%), pick 8 (57%), ceiling 60% |
| claims check | **25/25** statements in the review notes verified against `card.json` by script |
| review deck | `HI02H11_L02_S02_SME_Review.pptx` — 21 pages + title + overview |

## Everything the curriculum row asks for, and where it is

The row lines up with the design unusually well, so all of it is used rather than paraphrased.

| row says | where it is |
|---|---|
| teach examples **सुबह, फूल** | फूल on page 5 (teach), सुबह on page 14 (image-free read) |
| misconception «**'फूल' को 'फुल' पढ़ता है**» | page 7 options: फूल · **फुल** · फल |
| «मिलते-जुलते जोड़े (**फूल/फल**) विपर्यय राउंड में» | the same page — फल is the third option |
| «ह्रस्व उ और दीर्घ ऊ की ध्वनि उलट देता है» | every pick slide offers the SWAP as a distractor |
| «मात्रा-जोड़ बिल्डर (चरण 2)» | specified as `MATRA_BUILD` in the dev handoff (engine work) |

## Verified live, not just built

- **The misconception slide works end to end.** Instrumented `play()` on G1 (फूल) and tapped
  through: options rendered `फल / फुल / फूल` (shuffled), first wrong → `vo_again_phool`
  («फिर से सुनो, फूल।»), second wrong → `vo_sound_phool`
  («फू-ल। 'फू' में कौन-सी मात्रा सुनाई दे रही है?») with terminal help and the wrong option
  `crossed faded`, then correct → `vo_yes_phool`.
- **96/96 assets fetch 200** from the served page.
- **The callout clears आगे on all four teach slides** — checked on every capture.

## 🔴 The finding that matters most: neither matra can be highlighted in-word

`ु` and `ू` are below-base marks sharing their consonant's columns, so the engine's pixel-column
highlight colours the *next letter*. Measured by forcing it on:

| word | result |
|---|---|
| **पुल** (ु) | 11,342 red px at 27–50% of the word — **on the ल** |
| **फूल** (ू) | 450 px, a 13-px sliver |
| नाक (ा) / तीर (ी) *controls* | 6,704 / 8,944 px, both correct |

Both matras therefore use the `◌<matra>` callout. The builder **hard-fails** if anyone adds them
to the set, because the failure is silent and looks like the feature working.

**Consequence for the LO:** `ा` and `ी` are the only two matras the current method can handle.
This lesson is 0 of 2, Part 2 (े ै) will be 0 of 2, and so on. The cluster-aware highlight request
now carries reports from both games and is the gating item for the rest of this learning
objective, not a nice-to-have.

## Four art failures caught and fixed

All four pass a naive check — the file exists, is the right size, and is wrong.

1. **`obj_gud` and `obj_kabootar` came back as solid WHITE blocks** — 82% and 83% opaque, which an
   opacity check passes, but only **one colour bucket**. The colour-spread check caught them. This
   is the `obj_sapna` white-subject failure: jaggery rendered pale, a pigeon is grey-white. Fixed
   by forcing saturated colour and explicitly banning white panels and borders.
2. **`obj_kabootar` then came back 100% opaque** — the opposite failure: the magenta background
   survived the key, so it would have rendered as a box around the bird. Fixed by demanding a pure
   flat magenta background edge to edge.
3. **`obj_kabootar` third attempt had no eye** and its head merged into its body. Regenerated with
   the head, eye and beak called out explicitly.
4. **`obj_aaloo` read as a peanut**, then came back blank, then correct. Two joined tubers is
   peanut-shaped at tile size; a single plump oval reads as a potato.

Also fixed: `_rules` in the art manifest was generated as an image, because `gen_objects` treats
every key as an item. Moved to `_ART_RULES.md`.

## Two clip problems caught

- **Three clips were truncated** — present, valid, correctly sized, cut off half way:
  `vo_again_subah` (1.13s vs a 2.17s peer median), `vo_again_kabootar` (1.17 vs 2.53),
  `vo_prompt_read_no_pic` (1.77 vs 3.77). Caught by peer comparison; refilled.
- **`vo_t1_instruction` was 13.33s** and duplicated the build beats that T2 and T4 already speak.
  Cut to the principle alone. Same over-long-intro mistake as the sibling, caught by the same
  duration check.

**Two clips are on a fallback voice** (Aoede): `vo_name_aaloo` and `vo_prompt_mastery_snd`. Four
more needed a trailing danda but stayed on Kore. Note `vo_prompt_mastery_snd` needed the same
fallback on the sibling — it is that sentence, not this lesson.

## Design decisions worth knowing

- **The word bank was rebuilt from scratch.** The Grade 1 उ/ऊ lesson uses कुत्ता, गुलाब, मूली,
  कुर्सी, जूता, भालू, चूहा, मुर्गा, गुड़िया — all of which carry **two** matras. Fine for G1
  ("which of these two sounds?"), unusable for a skill that asks *which matra a word has*. All 11
  words here carry exactly one, and `guard_single_matra` fails the build otherwise.
- **सुबह is deliberately not illustrated** — a sunrise at 104px is indistinguishable from सूरज,
  which is also in the bank. It appears only on the image-free page, which is where an abstract
  word belongs. Same class of decision as सिर → हिरण in the sibling.
- **Two distractors are real words** (फल, पल). Deliberate: that is what makes them true minimal
  pairs, which the row explicitly asks for. Flagged to the SME rather than assumed.
- **Five teach slides, not four** — with only two matras there is room for two worked examples
  each, which the row's ट्यूटोरियल line asks for.

## Open for the SME

1. **Real-word distractors** — फल and पल. Keep as minimal pairs, or swap for non-words?
2. **सुबह unillustrated** — accept, or illustrate it and give it a teach slide?
3. **The greeting wording** — «स्विफ्टी» and «सीखेंगे» here vs «swiftee» and «जानेगें» in the
   sibling. One ruling settles both. (Related and still open: «बड़ी आ» in the sibling is
   non-standard; «छोटी उ / बड़ी ऊ» here is correct and matches shipped G1.)
4. **Register at the phase gates** — lesson is tum, the three shared gate clips are aap.
5. **The poem for the train version is mine, not yours** — drafted and audited so its target list
   is complete by construction, but it needs your approval or your replacement.
6. **Part 2 (ए / ऐ)** — not built. Say the word and it follows this one.

## Open for the dev team

Same queue as the sibling, session `sme-lxd-matra-train`. This lesson adds no new requests; it
raises the priority of one:

- **cluster-aware matra highlight** (`…-l02-s01-8`) — now carrying reports from **both** games,
  and gating the rest of LO HI02H11_L02 rather than improving one lesson.

`TRAIN_CHROME` must support **2 coaches** as well as 3 — this lesson is why the spec's `2..4`
lower bound is real.
