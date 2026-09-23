# Change request — round 3 · HI02H11_L02_S02 «मात्राओं की रेल» (उ / ऊ)

**This is my engineering reading of the SME's round-3 notes, not their words.** Their words are in
[`_SME_RECOMMENDATIONS_ROUND3.md`](_SME_RECOMMENDATIONS_ROUND3.md), verbatim and unedited. Where
the two disagree, **the verbatim file wins** and this file is the bug.

> ### Status, stated plainly
> **The build shipped in `3_CURRENT_BUILD/` is ROUND 2. Nothing in this document is implemented.**
> The round-2 lesson runs, passes its receipt and is a valid thing to look at — it is simply not
> what the round-3 notes describe. Do not read a green receipt as "done".

---

## 1 · The size of the ask, in one table

| | round 2 (built) | round 3 (asked for) |
|---|---|---|
| Screens | 17 (landing + 16) | **18** (landing + 17) |
| Teach screens | 7 | 5 |
| Test screens | 8 | 11 |
| Screens **deleted** | — | **2** (CONTRAST_PAIR, 3rd MEET_PAIR) |
| Screens **replaced** | — | **1** (POEM_SEARCH → SENTENCE_COMPLETE) |
| Screens **new** | — | **3** (SENTENCE_COMPLETE ×3) |
| New engine module | — | **1** (`SENTENCE_COMPLETE`) |
| Module rewritten | — | **1** (`MATRA_FILL` → letter-level) |
| New art | — | **≥6** (see §6) |
| VO clips to re-record | — | **~60 of 71** (register change, §5) |

Two of the three open questions from round 2 are now answered, by deletion:

- **Screen 6 (फुल ≠ फूल)** — my substitution. **Removed.**
- **The poem** — mine, not theirs. **Removed**, replaced by four sentence-completion screens.
- **The hand on practice screens** — *still unanswered.* The notes ask for the hand nudge on the
  2nd wrong attempt on every test screen, including the new ones. The engine's `[28f]` ruling
  (Yasir, 2026-07-28) forbids it outside tutorial/guided. **This conflict is unresolved and now
  touches more screens than before.** See §7.

---

## 2 · The new screen order

`⟳` changed · `✚` new · `✖` deleted · `=` unchanged in structure

| # | screen | type | state |
|---|---|---|---|
| — | Landing | `concept_strip` | ⟳ matras go **inside train bogies**; painted train (§4) |
| 1 | परिचय | `MATRA_INTRO` | ⟳ VO reworded; pairs inside train-style cards |
| 2 | पल → पुल | `MATRA_BUILD` | ⟳ VO reworded (§5a) |
| 3 | गुड़ · धनुष | `MEET_PAIR` | ⟳ **both words changed** (was पुल · गुड़) |
| 4 | फल → फूल | `MATRA_BUILD` | ⟳ VO reworded |
| 5 | दूध · कबूतर | `MEET_PAIR` | ⟳ **both words changed** (was फूल · दूध) |
| — | ~~फुल ≠ फूल~~ | `CONTRAST_PAIR` | ✖ **deleted** |
| — | ~~सूरज · मुकुट~~ | `MEET_PAIR` | ✖ **deleted** |
| 6 | उ tap | `TRAIN_TAP` | = coaches पुल · दूध · सूरज → **पुल** |
| 7 | ऊ tap | `TRAIN_TAP` | = coaches गुड़ · मुकुट · फूल → **फूल** |
| 8 | mixed tap | `TRAIN_TAP` | = coaches तरबूज · सुई · कबूतर → **सुई** |
| 9 | शब्द → बोगी | `TRAIN_SORT` (word) | ⟳ labels become **उ / ऊ only** |
| 10 | मात्रा → बोगी | `TRAIN_SORT` (matra) | ⟳ coach labels become **उ / ऊ**, not पुल / फूल |
| 11 | शब्द पूरा | **`WORD_BUILD`** | ⟳ **rewritten** — letter-level, not matra-level (§3) |
| 12 | सिर्फ़ चित्र | `TRAIN_SORT` (picture) | ⟳ labels become **उ / ऊ only** |
| 13 | वाक्य पूरा | **`SENTENCE_COMPLETE`** | ✚ **new module** (§3) |
| 14 | वाक्य पूरा | `SENTENCE_COMPLETE` | ✚ new |
| 15 | वाक्य पूरा | `SENTENCE_COMPLETE` | ✚ new |
| 16 | वाक्य पूरा | `SENTENCE_COMPLETE` | ✚ new |
| 17 | CELEBRATION | `CELEBRATION` | = |

**Phase split changes.** Round 2 was `{tutorial 7, guided 5, practice 4}`. Round 3 is
`{tutorial 5, guided 5, practice 7}` if the four sentence screens are practice. **The SME has not
been asked to confirm that split** — it changes which screens the engine allows a guiding hand on,
which is exactly the unresolved conflict in §7. Confirm before building.

---

## 3 · The two modules that need code

### 3a · `SENTENCE_COMPLETE` — new module, four instances

Mockup: `2_MOCKUPS/slide15_sentence_complete_ALL_FOUR.png` (one image, four variants).

Layout, from the mockup: heading band at the top; a **large scene illustration on the left**; the
sentence with a dashed blank on the right; **three picture option cards** under the sentence, each
carrying a picture **and** its word; आगे at the bottom.

```
data: {
  scene_img: "scn_seema_khush",
  sentence_pre:  "सीमा आज बहुत ",
  sentence_post: " है।",
  answer: "खुश",
  options: [ {word:"खुश", img:"obj_khush", audio:"vo_name_khush"},
             {word:"फूल", img:"obj_phool", audio:"vo_name_phool"},
             {word:"तरबूज", img:"obj_tarbooj", audio:"vo_name_tarbooj"} ]
}
```

The four sentences, and their options in the order the mockup draws them:

| # | sentence | answer | options (mockup order) |
|---|---|---|---|
| 13 | सीमा आज बहुत ___ है। | **खुश** | खुश · फूल · तरबूज |
| 14 | मैं ___ जल्दी उठता हूँ। | **सुबह** | सुबह · दूध · मुकुट |
| 15 | बगीचे में सुंदर ___ खिले हैं। | **फूल** | फूल · तरबूज · सुबह |
| 16 | मीठा ___ खाना अच्छा लगता है। | **तरबूज** | तरबूज · फूल · खुश |

> ⚠️ **Discrepancy to resolve with the SME — screen 16.** The speaker note writes the sentence as
> «मीठा ______ खाना अच्छा लगता है।» but **the mockup image draws «गर्मी में मीठा ___ खाना अच्छा
> लगता है।»** Two different sentences. The note is the source of truth by our own rule, but the
> mockup is what they drew — **ask, do not pick.**

Behaviour (identical across all four, from the notes):

- tapping an option plays that word's VO — this is how the child reads the option;
- correct → the card **snaps into the blank**, the sentence completes, sparkle + soft glow, VO
  «शाबाश! <the completed sentence>»;
- wrong 1 → shake, card returns, **no hand**, VO «फिर से सोचिए। कौन-सा शब्द वाक्य को पूरा करेगा?»;
- wrong 2 → shake, card returns, VO «चित्र को ध्यान से देखिए और सही शब्द चुनिए।», **hand nudge on
  the correct option** + soft pulse — *subject to §7*;
- 3rd-try correct → snaps, completes, sparkle, **no VO**;
- आगे locked until correct.

> Note the correct-answer VO for screen 14 is written as «शाबाश! मैंने सही शब्द चुनकर वाक्य पूरा
> किया।» — first person, unlike the other three which read the completed sentence back. Likely a
> slip; **confirm rather than normalising it.**

### 3b · `MATRA_FILL` → `WORD_BUILD` — rewritten, not tweaked

Mockup: `2_MOCKUPS/slide13_word_build.png`.

This is **no longer a matra drag**. Round 2 dragged `ु` into `प_ल`. Round 3 drags a whole
**अक्षर** — the consonant-plus-matra cluster — into a blank that now sits **first**:

| coach shows | picture above | correct option |
|---|---|---|
| `_ल` | bridge | **पु** |
| `_ल` | flower | **फू** |
| `_ई` | needle | **सु** |

Options are `पु · फू · सु` **plus 1–2 distractors**. The mockup draws five (`पु फू सु पा मी`) but
the note says **"Remove मी as an option"**, so ship `पा` and one other distractor that matches no
picture. **Ask which** — do not invent one; `मी` was almost certainly carried over from the आ/इ/ई
deck, where it belonged.

Correct-answer VO: «शाबाश! पुल बन गया।» · «शाबाश! फूल बन गया।» · **«शाबाश! सुई बन गई।»** — note
the gender agreement on the third; it is correct Hindi and must not be normalised to *बन गया*.

Also from the note: *"Do not show complete words before the child answers."* The round-2 build
already satisfies this; keep it true after the rewrite.

---

## 4 · The train becomes art, not CSS

The landing mockup (`2_MOCKUPS/slide02_landing_painted_train.png`) shows a **painted locomotive and
bogies**, with the two matras sitting inside the bogies. The notes ask for the same train treatment
on the MATRA_INTRO pairs.

This reverses the round-2 decision and it is not free. The round-2 train is SVG/CSS **because the
coaches have to recolour per screen, glow, shake, lock and accept drops** — a flat PNG does none of
that. Two ways to honour the mockup:

- **(a) Landing and INTRO only.** Those two screens are decorative — no drops, no states — so a
  painted PNG works there, and the interactive screens keep the drawable train. Cheapest, and the
  child sees the painted train first, which is where it matters most.
- **(b) Everywhere.** Needs a 9-slice or layered treatment: painted frame as a background image,
  live drop area and state rings drawn on top. Real work, and every state has to be re-tuned.

**Recommend (a), confirm with the SME.** They have not been told the trade-off.

---

## 5 · Language changes — these touch almost every clip

### 5a · MATRA_BUILD phrasing is explicitly corrected

The note says, in as many words:

> *Please avoid awkward phrasing such as: "प में उ की मात्रा लगी, बना पु।" Use: "प के साथ छोटी उ
> की मात्रा लगाने पर 'पु' बनता है।"*

The round-2 build says **«प के नीचे छोटी उ की मात्रा लगाने पर, पु बनता है।»** — *के नीचे*, not
*के साथ*. Change it. The full corrected set:

| role | round 3 line |
|---|---|
| base | «यह शब्द देखिए — पल।» |
| onset | «प के साथ छोटी उ की मात्रा लगाने पर 'पु' बनता है।» |
| result | «अब 'ल' जुड़ने पर 'पुल' बनता है।» |

Same shape for फल → फ + ू = फू → फूल.

### 5b · REGISTER FLIPS FROM तुम TO आप — this is the expensive one

Every imperative in the round-3 notes is the **आप** form: कीजिए · सोचिए · देखिए · डालिए · सुनिए ·
पहचानिए · चुनिए. The note says so explicitly, twice:

> *"Use respectful language throughout: सुनिए, पहचानिए, डालिए."*
> *"Maintain respectful language: 'सोचिए, देखिए, चुनिए' instead of 'सोचो, देखो, चुनो'."*

**The round-2 build is entirely तुम** (करो · सोचो · देखो · डालो). So this is not a handful of
lines — it is **every prompt, every hint1, every hint2 and several correct-answer clips**, roughly
**60 of the 71 recorded clips**, plus every on-screen heading.

Two knock-on effects, both of which need saying out loud:

1. **It settles a question that was open for two rounds.** The three phase-gate clips the engine
   plays between phases are shared fleet-wide and already speak **आप**. Round 2's तुम meant a
   Grade 2 child switched register at every gate. Going आप **removes that inconsistency** — this
   change is an improvement, not just a preference.
2. **The sibling lesson `HI02H11_L02_S01` is still तुम.** If S02 ships आप, the two halves of the
   same LO disagree. **Either S01 is re-recorded too, or the SME accepts the split.** Ask.

### 5c · Landing VO changed

Round 2: «नमस्ते दोस्त! मैं हूँ स्विफ्टी। आज हम मात्राओं की रेल में छोटी उ और बड़ी ऊ की मात्रा
सीखेंगे।»
Round 3: **«हेलो दोस्त! मैं हूँ स्विफ्टी। आज हम मात्राओं के बारे में जानेंगे।»**

This also settles the round-1/2 open item: the SME writes **«स्विफ्टी»** in Devanagari (not
"swiftee") and **«जानेंगे»** (not "जानेगें"). Use their spelling.

### 5d · Coach labels lose छोटी / बड़ी

On all three sort screens the labels become **just `उ` and `ऊ`**:

> *"Do not write छोटी or बड़ी on screen." · "Do not show the matra symbols in the coach labels."*
> *"Coach labels should show only उ and ऊ."*

Round 2 ships «छोटी उ ◌ु» / «बड़ी ऊ ◌ू». Note the **VO still says छोटी उ / बड़ी ऊ** — the change is
on screen only. Screen 10 changes further: its coaches currently carry the *words* पुल / फूल and
must carry the *letters* उ / ऊ, with the matra cards `ु` / `ू` dragged onto them.

---

## 6 · New assets

### Art

| key | what | used by | note |
|---|---|---|---|
| `obj_dhanush` | a bow (धनुष) | screen 3 | **new word**, replaces पुल on that screen |
| `obj_khush` | a happy child's face | screens 13, 16 | option card |
| `obj_subah` | sunrise | screens 14, 15 | **सुबह finally needs a picture** — it was word-only in round 2 |
| `scn_seema_khush` | scene: girl celebrating indoors | screen 13 | large scene, new class of asset |
| `scn_subah_uthna` | scene: boy waking, sunrise at window | screen 14 | |
| `scn_bageecha` | scene: garden full of flowers | screen 15 | |
| `scn_tarbooj_khana` | scene: boy eating watermelon | screen 16 | |

The four `scn_*` are a **new asset class** — full illustrated scenes, much larger than the existing
cut-out objects, and they must **not** go through the magenta chroma-key pipeline that
`gen_objects.py` uses (that pipeline exists to cut a subject out of its background; these have a
background on purpose). Generate them as plain full-bleed images.

Art rules that still apply, all of them learned the hard way on this lesson:
one single connected shape for cut-out objects · saturated colour, **never white or pale** (a white
subject keys out and ships blank) · no white panels behind the subject · pure flat magenta to the
very edge for anything that will be keyed.

### Audio

- ~60 re-records for the register flip (§5b);
- 4 × `vo_name_*` for खुश / सुबह / धनुष (+ reuse of existing name clips);
- 4 × sentence-completion correct clips;
- ~8 new prompt/hint pairs for the four new screens.

**The TTS traps on this lesson are documented and still apply:** an em-dash before a short final
word truncates the clip (0.73–1.05s vs 1.53–2.21s for a comma), and `«word, इसमें …»` truncates the
same way — use `«word में …»`. Truncation is **invisible** to existence and file-size checks; only
`_verify_assets.py`'s peer-comparison by text length catches it. Run it.

> ⚠️ The MEET_PAIR lines in the round-3 notes are written as **«गुड़— बोलकरदेखिए।इसमें…»** — an
> em-dash straight after the word, which is the exact pattern that truncates. Record them as
> «गुड़ में छोटी उ की मात्रा लगी है।» or verify each clip's duration against its peers. Do not ship
> the em-dash form on trust.

---

## 7 · The one thing still blocked

**The guiding hand on practice screens.** Unresolved since round 1, and round 3 makes it bigger.

- The SME asks for a hand nudge on the 2nd wrong attempt on **every** test screen — now 11 of them,
  including all four new sentence screens.
- The engine carries a signed-off ruling (`[28f]`, Yasir, 2026-07-28): the hand is allowed in
  **tutorial and guided** and **never in practice**, *"regardless of whatever name we save it by"*.
  It is enforced in one place, `pointNudgeAt()`, because ~25 call sites once bypassed the gate and
  a hand appeared in round 3 of a practice slide.

Round 2 resolved this by routing every nudge through `handOnAnswer(el, slide)` — so guided screens
get the hand and practice screens get a **glow** instead. That is a real difference in scaffolding
and the SME has not agreed to it.

**Do not resolve this in code.** Either the phase split changes (§2), or `[28f]` is amended, and
both are decisions for the SME and Yasir together.

---

## 8 · Suggested build order

1. **Get the three answers** — the §3a sentence discrepancy, the §3b distractor, and §7. Nothing
   else is blocked by them, but they are cheap to ask and expensive to guess.
2. **Register flip (§5b)** — largest single batch of work, entirely independent, and it improves
   the phase-gate consistency immediately. Do it first so the re-records happen once.
3. **Delete 2 screens, reword 2 MATRA_BUILDs, change 4 MEET_PAIR words, relabel 3 sort screens.**
   Data-only, no new code.
4. **Rewrite `MATRA_FILL` → `WORD_BUILD` (§3b).** Contained, one module.
5. **Build `SENTENCE_COMPLETE` (§3a)** and its 4 instances. The new module.
6. **Art (§6)** — can run in parallel from step 1; the four scenes are the long pole.
7. **Painted train (§4)** once the SME picks (a) or (b).
8. **Re-verify**: `_verify_assets.py` for truncation, a full screen-by-screen render, and a driven
   pass of every mechanic. See §9.

---

## 9 · How to verify, and why the usual checks are not enough

This lesson has now twice passed **0 FAIL / 0 WARN with visible defects on screen**. Round 2's
review found a missing heading on 14 of 16 screens, three separate overlap causes, and a module
that was simply never built — none of it visible to any automated check.

So, in addition to the receipt:

- **Render every screen and look at it.** `capture_pages.py` freezes animation, so anything that
  only exists inside an `@keyframes`, or is revealed by an audio callback, photographs blank. Paint
  staged content at mount as well as in the chain, and use the engine's `seq-hidden` naming so the
  harness knows to reveal it.
- **Drive every mechanic**, do not just mount it: wrong answer → wrong answer → right answer, and
  check the hand/glow appears on the second miss and the third-try win is silent.
- **Run `_verify_assets.py`** — it is the only thing that catches a truncated clip.
- **Check `.ink-glyph` parents.** The engine vertically centres each glyph inside its *parent*; a
  word in a tall column gets stamped downward onto whatever is below it. Any word in a column needs
  the `.ink-box` wrapper. This caused the round-2 word-over-picture overlap.

---

## 10 · What round 2 got right and should not be lost

Carry these forward; they were expensive:

- **The in-word matra highlight works** for `ु` / `ू`, via 2-D clipping (grapheme cluster x-range ∩
  below-baseline band). The engine's column-clip method **cannot** do it and silently colours the
  next letter — `पुल` put 11,342 red pixels on the `ल`. `ु`/`ू` must never be added to
  `RIGHT_SPACING_MATRAS`; the builder hard-fails on it. Full write-up in
  `4_ENGINE/CHANGES.md`.
- **`guard_prompts`** fails the build if any screen ships an empty heading. That defect shipped
  once; it cannot again.
- **The 3-attempt ladder** is built and verified firing exactly as specified.
- **Eight engine modules** in `engine_local/`, all additive — no existing module, helper or style
  is modified, so every other lesson on this engine line renders byte-identically.
