# DEV HANDOFF — HI02H11_L02_S02 (भाग 1) · «मात्राओं की रेल», उ / ऊ

**Skill:** उ, ऊ मात्रा वाले शब्द पढ़ता है। शब्दों में आने वाली मात्रा पहचानता है।
*(Hindi_content progression.xlsx, row 56 — **Part 1 of a two-part row**; Part 2 is ए / ऐ)*

## How to read this document

**The module specification lives in the sibling handoff, not here.**
[`../HI02H11_L02_S01/DEV_HANDOFF_HI02H11_L02_S01.md`](../HI02H11_L02_S01/DEV_HANDOFF_HI02H11_L02_S01.md)
is the canonical spec for `TRAIN_CHROME`, the 3-attempt ladder, `MATRA_BUILD`, `MATRA_FILL`,
`TRAIN_TAP`, `TRAIN_SORT`, `POEM_SEARCH` and the guide actor. The SME's recommendations that
define them are recorded verbatim in
[`../HI02H11_L02_S01/_SME_RECOMMENDATIONS.md`](../HI02H11_L02_S01/_SME_RECOMMENDATIONS.md).

**This lesson uses those same modules with different content.** Duplicating the module spec per
lesson would guarantee the two drift apart, so this file contains only:

1. what is **different** for उ / ऊ — and one of the differences is serious (§2),
2. the **content** for each screen,
3. the poem, already audited.

The engine requests are **already filed** under session `sme-lxd-matra-train`; this lesson is
added to the existing ones rather than filing duplicates.

---

## 1. Screen map — identical structure, two matras instead of three

The sibling has 17 screens for 3 matras. This has **13 for 2**, because the per-matra screens drop
from three to two. Every module is the same.

| # | screen | module | same as sibling? |
|---|---|---|---|
| 0 | landing — ◌ु ◌ू on the train | `TRAIN_CHROME` + `concept_strip` | yes, 2 tiles not 3 |
| 1 | the two matras named | `INTRO` | yes, 2 pairs |
| 2 | **पल → प + ु = पु → पुल** | `MATRA_BUILD` | yes |
| 3 | examples: पुल, गुड़ | `MEET_LETTER` + `examples[]` | yes |
| 4 | **फल → फ + ू = फू → फूल** | `MATRA_BUILD` | yes |
| 5 | examples: फूल, दूध | `MEET_LETTER` + `examples[]` | yes |
| 6 | tap the ु coach | `TRAIN_TAP` | yes |
| 7 | tap the ू coach | `TRAIN_TAP` | yes |
| 8 | word cards → matra coaches | `TRAIN_SORT` | yes, 2 coaches |
| 9 | matra cards → word coaches | `TRAIN_SORT` reversed | yes, 2 coaches |
| 10 | fill the blank | `MATRA_FILL` | yes |
| 11 | pictures only → matra coaches | `TRAIN_SORT` + `hide_labels` | yes, 2 coaches |
| 12 | «मात्रा खोजो» poem hunt | `POEM_SEARCH` | yes, **2 rounds not 3** |
| 13 | celebration | `CELEBRATION` | yes |

**`TRAIN_CHROME` must therefore support 2 coaches as well as 3.** The sibling's spec already says
`coaches: 2..4`; this lesson is the reason the lower bound is real rather than theoretical.

---

## 2. 🔴 The one serious difference: **neither** matra can be highlighted inside a word

The sibling gets the red in-word highlight on 2 of its 3 matras. **This lesson gets it on 0 of 2**,
and no card change can fix it.

`ु` and `ू` are **below-base** marks: they hang underneath their consonant and occupy the *same
horizontal columns* as it. `_matraClipCols` colours "the ink columns after the consonant", so on
these matras it colours **the next letter**.

Measured — both forced into `RIGHT_SPACING_MATRAS` and rendered, glyph box only:

| word | result |
|---|---|
| **पुल** (ु) | 11,342 red px at 27–50% of the word — **the red lands on the ल** |
| **फूल** (ू) | 450 px, a 13-px sliver — **effectively no highlight** |
| नाक (ा) *control* | 6,704 px, correctly on the ा |
| तीर (ी) *control* | 8,944 px, correctly on the ी |

So both matras take the `◌<matra>` callout path, and the demo hand points at the callout and
speaks the matra. **`guard_engine` in the builder refuses to build if anyone adds `ु` or `ू`** to
the set — the failure is silent and looks like an improvement, so it needs a hard stop.

### What this changes for the dev queue

The **cluster-aware matra highlight** request (`20260916-224551-hi02h11-l02-s01-8`) was filed as
"highest leverage, not blocking". For this lesson it is **the difference between the core visual
working and not working at all**, and it gets worse down the row:

| lesson | matras | in-word today | needs the cluster fix |
|---|---|---|---|
| L02_S01 | ा ि ी | 2 of 3 | 1 of 3 |
| **L02_S02 भाग 1** | **ु ू** | **0 of 2** | **2 of 2** |
| L02_S02 भाग 2 | े ै | 0 of 2 | 2 of 2 |
| L02_S03+ | ो ौ, ं ँ … | 0 | all |

`ा` and `ी` are the *only* two matras the current method can ever handle. **Every remaining lesson
in this LO needs the cluster fix**, so it stops being one game's nice-to-have and becomes the
gating item for the rest of the learning objective.

The fix is the same one already described in the sibling's §5: shape the word into per-cluster
spans and recolour the matra's cluster, instead of clipping pixel columns.

---

## 3. Content for each screen

Word bank — **every word carries exactly one target matra**, and the build fails if that breaks.
This rule rebuilt the bank from scratch: the Grade 1 उ/ऊ lesson uses कुत्ता, गुलाब, मूली, कुर्सी,
जूता, भालू, चूहा, मुर्गा, गुड़िया, and **every one of those carries two matras**. Fine for G1
("which of these two sounds?"), unusable here ("which matra does this word have?").

| matra | words | art |
|---|---|---|
| `ु` | पुल, गुड़, सुई, मुकुट | all 4 exist in this bundle |
| `ू` | फूल, दूध, सूरज, तरबूज, कबूतर, आलू | all 6 exist in this bundle |
| `ु` (no picture) | सुबह | deliberately not illustrated — see below |

**सुबह has no picture on purpose.** It is one of the row's two named teach examples, but a sunrise
at 104 px is indistinguishable from **सूरज**, which is also in the bank — the same collision that
moved सिर → हिरण in the sibling. It appears only image-free.

### Screens 2 and 4 — `MATRA_BUILD`, and the curriculum asked for exactly this

The row's suggested interaction is «मात्रा-जोड़ बिल्डर (चरण 2) … **मिलते-जुलते जोड़े (फूल/फल)**
विपर्यय राउंड में». Both transformations are real minimal pairs, which is rare and worth using:

```
पल  →  प + ु = पु  →  पुल      (पल = moment,  पुल = bridge)
फल  →  फ + ू = फू  →  फूल      (फल = fruit,   फूल = flower)  ← the row's own example pair
```

VO per the sibling's `MATRA_BUILD` staging contract:

| step | screen 2 | screen 4 |
|---|---|---|
| prompt | आइए, देखें कि छोटी उ की मात्रा लगने से शब्द की आवाज़ कैसे बदलती है। | आइए, देखें कि बड़ी ऊ की मात्रा लगने से शब्द की आवाज़ कैसे बदलती है। |
| base | यह शब्द है, पल। | यह शब्द है, फल। |
| onset | प के नीचे छोटी उ की मात्रा लगाने पर, पु बनता है। | फ के नीचे बड़ी ऊ की मात्रा लगाने पर, फू बनता है। |
| explain | अब पल में छोटी उ की मात्रा लगाने पर, पुल बनता है। | अब फल में बड़ी ऊ की मात्रा लगाने पर, फूल बनता है। |

⚠️ **The matra travels DOWN here, not sideways.** The sibling's spec says the `ि` must visibly
move to the *left* of its consonant so the child notices its written position. For `ु` and `ू` the
equivalent is that the mark drops **below** the consonant — and since step 6's in-word highlight is
impossible (§2), this travel is carrying more of the teaching load than it does in the sibling.
Worth making it deliberate and slow.

⚠️ **The `onset` clip is the TTS risk.** «पु» and «फू» are two-character syllables. Bare aksharas
hard-refuse (`HTTP 400` on क/न/द/त) and carriers are unreliable per letter. Budget human recording.

### Screens 6–7 — `TRAIN_TAP`

| screen | coaches | correct | VO |
|---|---|---|---|
| 6 | पुल · दूध · सूरज | **पुल** | जिस डिब्बे में छोटी उ की मात्रा वाला शब्द है, उस डिब्बे पर टैप करो। |
| 7 | गुड़ · मुकुट · फूल | **फूल** | जिस डिब्बे में बड़ी ऊ की मात्रा वाला शब्द है, उस डिब्बे पर टैप करो। |

Note these coach sets are authored **per screen** — on the sibling all three `TRAIN_TAP` screens
shared one mockup and two of the three correct-answer VOs named a word that was not on any coach.
Not repeated here.

### Screens 8, 9, 11 — `TRAIN_SORT`, two coaches

| screen | coach labels | cards |
|---|---|---|
| 8 | छोटी उ (ु) · बड़ी ऊ (ू) | word cards: गुड़, सुई \| सूरज, आलू |
| 9 | **the words** पुल · फूल | matra cards: ु, ू |
| 11 | छोटी उ (ु) · बड़ी ऊ (ू) | **pictures only** (`hide_labels: true`): मुकुट, सुई \| तरबूज, कबूतर |

Screen 11's words must still be **spoken** on tap — that is what makes it a listening task.
Tray cap is 6 tiles (`.sort-tray` is `flex-wrap:nowrap`); this uses 4.

### Screen 10 — `MATRA_FILL`

```
प _ ल   →  ु      (पुल)
फ _ ल   →  ू      (फूल)
स _ ई   →  ु      (सुई)
```

Options: `ु`, `ू`. VO: «सही मात्रा को सही जगह पर खींचकर डालो और शब्द पूरा करो।»

✅ **Easier to implement than the sibling's version.** The sibling needed a warning that
`blank_after` is an index into the *consonant sequence* because `ि` is a reordering matra drawn
before its consonant. `ु` and `ू` are **not reordering** — they are stored and drawn in the same
order, below the consonant. So for this lesson the blank sits exactly where the string says.
The consonant-index API from the sibling still works and should still be used; it just cannot
catch you out here.

### Screen 12 — `POEM_SEARCH`, **2 rounds**

> **सुबह का सूरज आया।**
> **पुल पर कबूतर गाया।**
> **फूल खिला, गुड़ लाया।**

| round | VO | targets |
|---|---|---|
| 1 | छोटी उ की मात्रा वाले शब्द ढूँढो। | **सुबह, पुल, गुड़** |
| 2 | अब बड़ी ऊ की मात्रा वाले शब्द ढूँढो। | **सूरज, कबूतर, फूल** |

✅ **This target list is COMPLETE BY CONSTRUCTION, and that is deliberate.** The sibling's poem
shipped a list missing four correct answers — a child tapping चमकी for ी would have been marked
wrong, which teaches the opposite of the lesson. So this poem was written to the constraint and
then audited word by word:

| word | in-scope matra | | word | in-scope matra |
|---|---|---|---|---|
| सुबह | **ु** target | | कबूतर | **ू** target |
| का | — (ा, out of scope) | | गाया | — (ा) |
| सूरज | **ू** target | | फूल | **ू** target |
| आया | — (ा) | | खिला | — (ि, ा) |
| पुल | **ु** target | | गुड़ | **ु** target |
| पर | — (none) | | लाया | — (ा) |

Every word containing `ु` or `ू` is a listed target; no word is a target twice; the six
non-targets carry only out-of-scope marks. 3 targets per round, balanced.

⚠️ **This poem is mine, not the SME's** — the sibling's poem came from the SME. It needs their
approval before it is recorded, and they may well want to write their own. If they do, run the
same audit before building: the target list is this module's entire data model.

---

## 4. Everything else is unchanged from the sibling

Applies here exactly as written there; not restated:

- `TRAIN_CHROME` API and the seven coach states — sibling §2.1
- 3-attempt ladder (`hand_on_attempt`, `reveal_on_attempt`, `silent_on_late_correct`) — §2.2
- No on-screen instruction text, VO only — §2.3
- The five new SFX — §2.4
- The guide actor, and the recommendation to use Swiftie rather than a new ghost — §2.5
- `MATRA_BUILD` staging contract, gated on clip-end not timers — §3.1
- `MEET_LETTER` `examples[]` — §3.2
- `hide_labels` on `SORT_GENDER` — §3.4
- TTS constraints: bare aksharas refuse, em-dash truncates, truncation is invisible to naive
  checks — §6
- Register (tum) and the aap phase gates — §7 item 7

---

## 5. What exists today

A complete, playable lesson on the current engine, built the same way as the sibling's:

| | |
|---|---|
| file | `HI02H11_L02_S02.html`, engine `2026.08.04b-r4-unified` |
| slides | 20 — 5 teach / 6 guided / 9 practice |
| assets | 10 illustrations, 86 voice clips |
| receipt | **0 FAIL / 0 WARN** |
| runtime | **96/96 declared assets return 200**; the misconception slide verified firing live |
| review deck | `HI02H11_L02_S02_SME_Review.pptx` — 21 pages + title + overview |

It covers the outcome with the standard stage. The recommendation is the same as for the sibling:
**ship it, and land the train as an update to this card**, rather than holding Grade 2 content
behind ~9 pieces of engine work.

## 6. Part 2 (ए / ऐ) is not built

Row 56 is a two-part skill; this is Part 1, and the card says `part_label: "भाग 1"`. Part 2 is the
same design with a different word bank — and the row already names its misconception
(«'बैठ' को 'बेठ' पढ़ता है») and its minimal pair (बैठ/बेठ), exactly as it did here. `े` and `ै` are
also **not** right-spacing, so Part 2 inherits §2 in full: 0 of 2 in-word, cluster fix required.
Say the word and it follows this one.
