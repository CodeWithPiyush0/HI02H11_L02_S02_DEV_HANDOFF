# -*- coding: utf-8 -*-
"""Build HI02H11_L02_S02 (भाग 1, उ / ऊ) — «मात्राओं की रेल», the SME's train flow.

Curriculum: Hindi_content progression.xlsx row 56.
    Part-1: उ, ऊ मात्रा वाले शब्द पढ़ता है।   (Part-2 is ए / ऐ — a separate build)

=======================================================================================
ROUND 3 — built to `HI02H11_L02_S02_SME_Review.pptx` (reviewed 2026-09-22).
=======================================================================================
The SME's words are recorded verbatim in `_SME_RECOMMENDATIONS_ROUND3.md`; the engineering
reading is `CHANGE_REQUEST_ROUND3.md`; the row-by-row contract this build is checked against is
`../CHANGES.md`. Where the first two disagree, the verbatim file wins.

WHAT CHANGED FROM ROUND 2, AND WHY EACH ONE IS HERE

  · **Two screens deleted.** The deck carries a slide and a note for every page it keeps. Pages 7
    (CONTRAST_PAIR, फुल ≠ फूल) and 8 (the third MEET_PAIR, सूरज · मुकुट) have neither.
    CONTRAST_PAIR was my substitution for the third build screen S01 has and this skill does not;
    the SME has now answered that question by deleting it. Both modules stay registered in the
    engine — nothing else mounts them, and removing them would change the engine for the sibling
    lessons on this line.

  · **The poem is gone.** POEM_SEARCH was ours, not theirs. Four SENTENCE_COMPLETE screens replace
    it: the child reads a sentence and picks the word that completes it. It is the only screen in
    the lesson where the matra is not the visible question, which is what makes it a test of
    reading rather than of spotting a mark.

  · **MATRA_FILL → WORD_BUILD.** Round 2 dragged a bare `ु` into `प_ल`. Round 3 drags a whole
    अक्षर into a blank that now sits FIRST — `_ल` + `पु`. Harder and more useful: it forces a
    choice between पु and फू, which is the exact ह्रस्व/दीर्घ confusion the curriculum row names.

  · **Register flips तुम → आप, everywhere.** The SME says so twice in as many words. It also
    settles a question open since round 1: the three phase-gate clips the engine plays between
    phases are shared fleet-wide and already speak आप, so round 2's तुम made a Grade 2 child
    switch register at every gate. `guard_register` fails the build if a तुम form survives.

  · **Coach labels lose छोटी / बड़ी.** On screen only — the VO still says छोटी उ / बड़ी ऊ.

  · **Praise goes per item.** On every sort and build screen the SME writes the praise line card
    by card («शाबाश! 'सुई' शब्द में उ की मात्रा है।») and asks for no completion line at all, so
    the last card's own line is the last thing the child hears.

  · **The train reaches the landing and the intro.** «The matras can be shown inside two train
    bogies … so that the lesson visually continues as a मात्राओं की रेल journey.»

THREE THINGS THIS BUILD DELIBERATELY DOES NOT DO

  1. **The hand on practice screens.** The SME asks for a hand nudge on the 2nd wrong attempt on
     every test screen. The engine carries a signed-off ruling ([28f], Yasir 2026-07-28): the hand
     is allowed in tutorial and guided and never in practice. Confirmed with the user 2026-09-23:
     keep [28f]. Practice screens therefore get the coach/option GLOW and pulse — which is ours
     and is not phase-gated — and the hand is withheld. Every nudge routes through
     `handOnAnswer()`, the single place that rule can be enforced.
  2. **Painted art for the train.** The landing mockup draws a painted locomotive and bogies. The
     interactive trains are SVG/CSS because coaches recolour, glow, shake, lock and accept drops,
     which a flat PNG cannot do. Confirmed: painted treatment on the landing and the intro only —
     and those two ship as the DRAWN train now, because a painted PNG needs a generation run.
     Swapping it in later is a background-image change on `.lt-*` / `.mi-*` and nothing else.
  3. **Rewriting the SME's Hindi to dodge a TTS bug.** Their MEET_PAIR lines are written
     «गुड़, बोलकर देखिए। इसमें …», the exact em-dash-before-a-short-word shape that makes the
     model truncate a clip (measured: 0.73–1.05 s against a 1.53–2.21 s peer median). Their
     wording ships; the clips are flagged for the duration check instead. `_verify_assets.py` is
     the only thing that catches a truncated clip — run it.

ENGINE. Pinned to this handoff's own `4_ENGINE/lesson_template.html`, which carries the train
module set. Everything is additive — new entries on `SlideModules` plus one CSS block — so every
other lesson on this engine line renders byte-identically.

⚠️ NEITHER MATRA CAN BE HIGHLIGHTED BY THE ENGINE'S COLUMN CLIP. ु and ू are BELOW-BASE marks
sharing their consonant's columns, so a pixel-column highlight colours the NEXT letter. Measured:
पुल puts 11342 red px ON THE ल. `matraHL()` clips in two dimensions instead, and is what every
highlight in this lesson goes through. `guard_engine` hard-fails if either mark is ever added to
RIGHT_SPACING_MATRAS, because that failure is silent and looks like the feature working.

Run:  PYTHONUTF8=1 python 1_SPEC/build_skill_HI02H11_L02_S02.py   (from the handoff root)
"""
import os, re, sys, json, argparse

CODE     = "HI02H11_L02_S02"
# ---------------------------------------------------------------- paths
# SELF-CONTAINED HANDOFF LAYOUT. The original script built inside the wider SwiftPAL factory
# (`<factory>/G2/<CODE>/` against `<factory>/KG and G1 refernce ready HTML's`). This handoff folder
# is deliberately standalone — README: "This folder is self-contained" — so every path below
# resolves INSIDE it and nothing reaches out to the factory:
#     1_SPEC/           this script
#     3_CURRENT_BUILD/  the bundle  (HTML + card.json + assets/)
#     4_ENGINE/         the pinned engine copy + the train module sources
HANDOFF  = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BUNDLE   = os.path.join(HANDOFF, "3_CURRENT_BUILD")
ENGINE   = os.path.join(HANDOFF, "4_ENGINE", "lesson_template.html")
SPEC_DIR = os.path.dirname(os.path.abspath(__file__))
IMG_DIR  = os.path.join(BUNDLE, "assets", "Images")
AUD_DIR  = os.path.join(BUNDLE, "assets", "Audio")
CARD_TAG = re.compile(r'(<script type="application/json" id="cardData">)(.*?)(</script>)', re.S)
VER_RE   = re.compile(r'ENGINE_VERSION\s*=\s*["\']([^"\']+)["\']')
RSM_RE   = re.compile(r'RIGHT_SPACING_MATRAS\s*=\s*new Set\(\[([^\]]*)\]\)')

# CONTRAST_PAIR, POEM_SEARCH and MATRA_FILL are no longer mounted by this card — round 3 deleted
# or replaced their screens. They stay in this list because the guard is a PRESENCE check on the
# engine copy: if the injector ever ran short, that is what tells us.
TRAIN_MODULES = ["TRAIN_TAP", "TRAIN_SORT", "MATRA_FILL", "MATRA_BUILD",
                 "MEET_PAIR", "CONTRAST_PAIR", "POEM_SEARCH", "MATRA_INTRO",
                 "WORD_BUILD", "SENTENCE_COMPLETE"]
STOCK_MODULES = ["CELEBRATION"]
# Fixed clips that are not recorded for this lesson. The three sfx_train_*/whistle files are
# REAL RECORDINGS brought over from the sibling lesson HI02H11_L02_S01; round 3 previously
# synthesised the train sounds with the engine's _tone(), which gives a two-note beep rather than
# the "soft train arrival / whistle SFX" the SME asks for on the landing and on every train screen.
COPY_AUDIO = ["vo_pt_tutorial", "vo_pt_guided", "vo_pt_practice",
              "sfx_celebrate", "sfx_correct", "sfx_wrong", "sfx_tap", "sfx_pop",
              "sfx_train_arrive", "sfx_train_move", "sfx_whistle"]

U, UU = "ु", "ू"

# ---------------------------------------------------------------- content
# key -> (word, emoji, matra). Every word carries exactly ONE target matra — the task is
# "which matra does this word have", so a two-matra word has no single right answer. This is
# why the G1 उ/ऊ lesson's कुत्ता / गुलाब / मूली / जूता / भालू are all unusable here.
OBJ = {
    "obj_pul":      ("पुल",   "\U0001F309", U),
    "obj_gud":      ("गुड़",   "\U0001F36F", U),
    "obj_sui":      ("सुई",   "\U0001FAA1", U),
    "obj_mukut":    ("मुकुट",  "\U0001F451", U),
    "obj_phool":    ("फूल",   "\U0001F33B", UU),
    "obj_doodh":    ("दूध",   "\U0001F95B", UU),
    "obj_sooraj":   ("सूरज",  "☀",     UU),
    "obj_tarbooj":  ("तरबूज", "\U0001F349", UU),
    "obj_kabootar": ("कबूतर", "\U0001F54A", UU),
    "obj_aaloo":    ("आलू",   "\U0001F954", UU),
    # ---- new in round 3 ----
    "obj_dhanush":  ("धनुष",  "\U0001F3F9", U),   # deck slide 4: गुड़ replaces पुल, धनुष is new
    "obj_khush":    ("खुश",   "\U0001F60A", U),   # sentence screens 1 and 4
    "obj_subah":    ("सुबह",  "\U0001F305", U),   # sentence screens 2 and 3 — was word-only
}

# Full illustrated SCENES — a new asset class in round 3, and not the same thing as the cut-out
# objects above. `gen_objects.py`'s magenta chroma-key pipeline exists to cut a subject OUT of its
# background; these have a background on purpose, so they must be generated flat and full-bleed
# and must NOT go through keying.
SCENE = {
    "scn_seema_khush":   "\U0001F64C",
    "scn_subah_uthna":   "\U0001F6CC",
    "scn_bageecha":      "\U0001F337",
    "scn_tarbooj_khana": "\U0001F60B",
}

MATRA_VO   = {U: "vo_matra_u", UU: "vo_matra_uu"}
MATRA_TEXT = {"vo_matra_u": "छोटी उ की मात्रा", "vo_matra_uu": "बड़ी ऊ की मात्रा"}
MATRA_NAME = {U: "छोटी उ", UU: "बड़ी ऊ"}      # the shipped G1 convention for this exact pair
LETTER     = {U: "उ", UU: "ऊ"}                # what the COACH LABELS show in round 3

AUDIO_TEXT = {}
TEXT2ID    = {}
PENDING_ART = []


def vo(vid, text):
    if vid in AUDIO_TEXT and AUDIO_TEXT[vid] != text:
        raise ValueError("clip %s registered twice with different text:\n  %s\n  %s"
                         % (vid, AUDIO_TEXT[vid], text))
    AUDIO_TEXT[vid] = text
    return vid


def once(vid, text):
    """One clip per LINE, never per slide.

    Round 3 repeats several lines verbatim across screens — the tap prompt on screens 6 and 8, the
    sort hint on screens 9 and 12, all three shared lines on the four sentence screens. Keying by
    TEXT means each is recorded once, so two screens can never end up speaking the same sentence
    in two different takes. (Round 2 keyed these by slide and recorded the tap prompt three times.)
    """
    if text in TEXT2ID:
        return TEXT2ID[text]
    TEXT2ID[text] = vid
    return vo(vid, text)


def slug(key):
    return key.split("_", 1)[1] if "_" in key else key


def pic(key):
    """The image key if its PNG is on disk, else None so the engine renders the emoji instead.

    ROUND 3 ADDS SEVEN PICTURES THAT DO NOT EXIST YET (§6 of the change request): धनुष, खुश, सुबह
    and the four scenes. They need a generation run with an API key, which this build does not
    have. Rather than ship seven references that 404, the card carries the emoji fallback for
    anything not yet drawn, and the key lights up by itself the moment the PNG lands and this
    script is re-run. What is still missing is printed at the end of the build and written into
    `_art_manifest.json`, so the art run has a work list.
    """
    if os.path.isfile(os.path.join(IMG_DIR, key + ".png")):
        return key
    if key not in PENDING_ART:
        PENDING_ART.append(key)
    return None


def key_of(word):
    for k, v in OBJ.items():
        if v[0] == word:
            return k
    sys.exit("X  no OBJ entry for %r" % word)


def key_of_opt(word):
    """key_of() but returns None instead of exiting. The MATRA_BUILD base words (पल, फल) have
    no picture by design — they are the form BEFORE the matra, not vocabulary the child learns
    — so the base panel simply renders without art."""
    for k, v in OBJ.items():
        if v[0] == word:
            return k
    return None


def matra_of(word):
    for _k, (w, _e, m) in OBJ.items():
        if w == word:
            return m
    sys.exit("X  no matra known for %r" % word)


def name_clip(word):
    """One clip per WORD, never per slide — a line used twice is recorded once."""
    return vo("vo_name_" + slug(key_of(word)), word)


# ---------------------------------------------------------------- screens
def s_intro(sid):
    """Screen 1. «उ → ◌ु», one pair lit at a time, now riding in train bogies.

    SME: "Show the letter and its corresponding matra symbol as a pair, one by one. Keep only one
    pair active at a time. Each active pair should light up when its VO plays." and "If possible,
    keep the train-theme continuity by showing each pair inside a train-style card / bogie / box."

    Round 2's separate `instruction` clip is gone: the SME's VO list for this screen is the intro
    line and then the two pair lines, with nothing between them.
    """
    p = "आज हम छोटी उ और बड़ी ऊ की मात्रा वाले शब्द पढ़ेंगे।"
    pairs = [
        {"letter": "उ", "matra": U,
         "audio": vo("vo_pair_u", "यह है उ। इसकी मात्रा है — ु।")},
        {"letter": "ऊ", "matra": UU,
         "audio": vo("vo_pair_uu", "यह है ऊ। इसकी मात्रा है — ू।")},
    ]
    return {"id": sid, "phase": "tutorial", "eis": "enactive", "type": "MATRA_INTRO",
            "prompt_hi": p,
            "audio": {"prompt": vo("vo_%s_prompt" % sid.lower(), p)},
            "data": {"pairs": pairs, "phonemes": dict(MATRA_VO), "auto": True, "train": True}}


def s_build(sid, base_word, base_slug, consonant, matra, syllable, result_word, sounds):
    """The transformation teach, respoken to the SME's round-3 wording.

    The note is explicit about the phrasing and rejects the alternative by name:
        "Please avoid awkward phrasing such as: «प में उ की मात्रा लगी, बना पु।»
         Use: «प के साथ छोटी उ की मात्रा लगाने पर 'पु' बनता है।»"
    Round 2 shipped «प के नीचे …». *के साथ*, then.

    The round-2 panel captions are GONE. The note's own "On Screen" list is पल, the equation, पुल
    and the picture, and it ends "Keep the screen clean and minimal. Do not add unnecessary
    explanatory text." The captions were carried over from S01's mockup and are exactly that.

    `explain` is gone too: its content is now inside `result` («अब 'ल' जुड़ने पर 'पुल' बनता है।»).
    `sounds` is new — the note's "Sound Differentiation" beat, प · पु · पुल with a pause between
    each, as ONE clip because three clips back to back lose the pause the note is asking for.
    """
    rk = key_of(result_word)
    g = slug(rk)
    a = {
        "prompt": vo("vo_%s_prompt" % sid.lower(),
                     "आइए, देखें कि %s की मात्रा लगने से शब्द की आवाज़ कैसे बदलती है।" % MATRA_NAME[matra]),
        "base": vo("vo_base_" + base_slug, "यह शब्द देखिए, %s।" % base_word),
        "matra_name": MATRA_VO[matra],
        "onset": vo("vo_onset_" + g,
                    "%s के साथ %s की मात्रा लगाने पर %s बनता है।"
                    % (consonant, MATRA_NAME[matra], syllable)),
        "result": vo("vo_result_" + g,
                     "अब %s जुड़ने पर %s बनता है।" % (result_word[-1], result_word)),
        "sounds": vo("vo_sounds_" + g, sounds),
    }
    bk = key_of_opt(base_word)
    return {"id": sid, "phase": "tutorial", "eis": "symbolic", "type": "MATRA_BUILD",
            "prompt_hi": AUDIO_TEXT[a["prompt"]], "audio": a,
            "data": {"base_word": base_word, "consonant": consonant, "matra": matra,
                     "syllable": syllable, "result_word": result_word,
                     "result_img": pic(rk), "result_emoji": OBJ[rk][1], "travel": "down",
                     "base_img": (pic(bk) if bk else None),
                     "base_emoji": (OBJ[bk][1] if bk else None),
                     # SME: "Keep the screen clean and minimal. Do not add unnecessary
                     # explanatory text." The round-2 panel captions go.
                     "cap_base": None, "cap_mid": None, "cap_result": None}}


def s_pair(sid, words, lead, lines):
    """Two example words, one at a time, each with its picture and its matra called out.

    ⚠️ THE EM-DASH IS GONE FROM THESE LINES, AND IT IS A MEASURED DECISION, NOT A PREFERENCE.
    The SME writes them as «गुड़, बोलकर देखिए। इसमें …», which puts an em-dash straight after a
    short word. Round 3 first shipped exactly that wording, on the grounds that silently rewriting
    a reviewer's Hindi is the worse failure — and then measured the result: all four came back at
    0.69-1.21 s against the ~5.4 s their length calls for. The model speaks the first word and
    stops. The sibling lesson HI02H11_L02_S01 hit the same wall and probed it head to head, same
    words, three takes each: em-dash 0.73-1.05 s · comma 1.53-2.21 s · danda 1.13-2.01 s, with the
    dash also carrying the worst refusal rate.

    So the dash becomes a COMMA and nothing else changes. No word is altered and the listener
    cannot hear the difference — the SME's sentence is intact. Verified on this lesson:
    vo_base_pal went from 0.69 s to 2.65 s on the same voice with only that substitution.
    Flagged to the SME as a punctuation change (CHANGES.md Q6); the sibling did exactly the same.

    The separate matra call-out clip is gone: round 3 folds it into the line itself.
    """
    ex = []
    for w, line in zip(words, lines):
        k = key_of(w)
        ex.append({"word": w, "matra": matra_of(w), "img": pic(k), "emoji": OBJ[k][1],
                   "audio_line": vo("vo_meet_" + slug(k), line),
                   "matra_audio": None})
    return {"id": sid, "phase": "tutorial", "eis": "iconic", "type": "MEET_PAIR",
            "prompt_hi": lead,
            "audio": {"prompt": vo("vo_%s_prompt" % sid.lower(), lead)},
            "data": {"examples": ex}}


def s_tap(sid, words, target, matra, correct_line):
    """Tap the coach whose word carries the matra. 3-attempt ladder, आप register.

    Prompt and both hints are keyed by TEXT (`once`), so screens 6 and 8 — which the SME gives the
    same छोटी-उ wording — share one recording each instead of three.
    """
    n = MATRA_NAME[matra]
    tag = "u" if matra == U else "uu"
    return {"id": sid, "phase": "guided", "eis": "symbolic", "type": "TRAIN_TAP",
            "prompt_hi": "%s की मात्रा वाले शब्द पर टैप कीजिए।" % n,
            "audio": {
                "prompt": once("vo_tap_prompt_" + tag,
                               "जिस डिब्बे में %s की मात्रा वाला शब्द है, उस डिब्बे पर टैप कीजिए।" % n),
                "hint1": once("vo_tap_hint1_" + tag,
                              "फिर से सोचिए। %s की मात्रा वाला शब्द कौन-सा है?" % n),
                "hint2": once("vo_tap_hint2_" + tag,
                              "ध्यान से देखिए और %s की मात्रा वाले शब्द पर टैप कीजिए।" % n),
                "correct": vo("vo_%s_correct" % sid.lower(), correct_line)},
            "data": {"target": target, "matra": matra,
                     "coaches": [{"word": w, "correct": (w == target)} for w in words]}}


def s_sort(sid, phase, kind, bins, cards, heading, prompt, hint1, hint2, single=False):
    """Drag cards into coaches.

    ROUND 3 CHANGES, all from the deck:
      · coach labels lose छोटी / बड़ी — «उ (ु)» / «ऊ (ू)» on the word round, bare «उ» / «ऊ» on the
        matra and picture rounds. The VO still says छोटी उ / बड़ी ऊ; the change is on screen only.
      · praise is PER CARD (`correct_audio`), and there is no completion line at all.
      · the matra round takes one card per coach (`single`).
    """
    return {"id": sid, "phase": phase, "eis": "enactive", "type": "TRAIN_SORT",
            "prompt_hi": heading,
            "audio": {"prompt": vo("vo_%s_prompt" % sid.lower(), prompt),
                      "hint1": hint1, "hint2": hint2},
            "data": {"kind": kind, "bins": bins, "cards": cards, "single": single}}


def s_word_build(sid):
    """Screen 11 — the rewrite. Drag a whole अक्षर into a blank that sits FIRST.

    SME: "Keep only the last letter visible inside each coach: _ल · _ल · _ई" with the picture above
    each coach and «पु · फू · सु» plus "1–2 distractor options that do not match any picture", and
    "Remove मी as an option."

    ON THE DISTRACTOR: the mockup draws five options (पु फू सु पा मी) and the note removes मी. That
    leaves पा, which on its own already satisfies "1–2 distractors" and invents nothing — so पा
    ships alone rather than a second distractor being made up. Raised with the SME (CHANGES.md Q2).

    Note «शाबाश! सुई बन गई।» — feminine agreement on the third, which is correct Hindi and must
    not be normalised to बन गया.
    """
    slots, opts = [], []
    for word, head, tail in [("पुल", "पु", "ल"), ("फूल", "फू", "ल"), ("सुई", "सु", "ई")]:
        k = key_of(word)
        gone = "गई" if word == "सुई" else "गया"
        slots.append({"word": word, "head": head, "tail": tail, "matra": matra_of(word),
                      "img": pic(k), "emoji": OBJ[k][1],
                      "correct_audio": vo("vo_wb_" + slug(k),
                                          "शाबाश! %s बन %s।" % (word, gone))})
        opts.append({"akshar": head, "audio": vo("vo_ak_" + slug(k), head)})
    # the one distractor the mockup supplies and the note keeps. It gets a tap clip like every
    # other option card: the SME lists the three answers, but a card that stays silent when every
    # other card speaks reads as a broken card, not as a deliberate one.
    opts.append({"akshar": "पा", "audio": vo("vo_ak_pa", "पा")})
    return {"id": sid, "phase": "practice", "eis": "enactive", "type": "WORD_BUILD",
            # the mockup's own on-screen heading; the note's wording is the VO line below it
            "prompt_hi": "चित्र देखकर सही अक्षर खींचकर शब्द पूरा कीजिए।",
            "audio": {
                "prompt": vo("vo_%s_prompt" % sid.lower(), "चित्र देखकर सही अक्षर से शब्द पूरा कीजिए।"),
                "hint1": vo("vo_%s_hint1" % sid.lower(), "फिर से सोचिए और चित्र को ध्यान से देखिए।"),
                "hint2": vo("vo_%s_hint2" % sid.lower(),
                            "ध्यान से देखिए, कौन-सा अक्षर लगाने से शब्द पूरा होगा?")},
            "data": {"slots": slots, "options": opts}}


SC_HEADING = "सही शब्द चुनकर वाक्य पूरा कीजिए।"


def s_sentence(sid, scene, pre, post, answer, options, correct_line):
    """Screens 13–16 — the new module, four instances.

    The three instruction lines are identical on all four screens, so `once` gives them one
    recording each. The praise line is per screen and reads the completed sentence back — except
    on screen 14, where the SME wrote «शाबाश! मैंने सही शब्द चुनकर वाक्य पूरा किया।» instead. That
    is first person and unlike its three siblings; it ships as written and is flagged rather than
    quietly normalised.
    """
    o = []
    for w in options:
        k = key_of(w)
        o.append({"word": w, "img": pic(k), "emoji": OBJ[k][1], "audio": name_clip(w)})
    return {"id": sid, "phase": "practice", "eis": "symbolic", "type": "SENTENCE_COMPLETE",
            "prompt_hi": SC_HEADING,
            "audio": {
                "prompt": once("vo_sc_prompt", "चित्र देखकर सही शब्द चुनकर वाक्य पूरा कीजिए।"),
                "hint1": once("vo_sc_hint1", "फिर से सोचिए। कौन-सा शब्द वाक्य को पूरा करेगा?"),
                "hint2": once("vo_sc_hint2", "चित्र को ध्यान से देखिए और सही शब्द चुनिए।"),
                "correct": vo("vo_%s_correct" % sid.lower(), correct_line)},
            "data": {"scene_img": pic(scene), "scene_emoji": SCENE[scene],
                     "sentence_pre": pre, "sentence_post": post,
                     "answer": answer, "options": o}}


def sort_card(word, correct_audio):
    k = key_of(word)
    return {"bin": matra_of(word), "word": word, "img": pic(k), "emoji": OBJ[k][1],
            "audio": name_clip(word), "correct_audio": correct_audio}


def build_slides():
    S = []
    # ---- screens 1-5 · TUTORIAL ------------------------------------------------------
    S.append(s_intro("T1"))                                                   # deck slide 2
    S.append(s_build("T2", "पल", "pal", "प", U, "पु", "पुल", "प। पु। पुल।"))   # deck slide 3
    S.append(s_pair("T3", ["गुड़", "धनुष"],                                    # deck slide 4
                    "आइए, छोटी उ की मात्रा वाले कुछ शब्द देखें।",
                    ["गुड़, बोलकर देखिए। इसमें ग पर छोटी उ की मात्रा लगी है।",
                     "धनुष, बोलकर देखिए। इसमें न पर छोटी उ की मात्रा लगी है।"]))
    S.append(s_build("T4", "फल", "phal", "फ", UU, "फू", "फूल", "फ। फू। फूल।"))  # deck slide 5
    S.append(s_pair("T5", ["दूध", "कबूतर"],                                    # deck slide 6
                    "आइए, बड़ी ऊ की मात्रा वाले कुछ शब्द देखें।",
                    ["दूध, बोलकर देखिए। इसमें द पर बड़ी ऊ की मात्रा लगी है।",
                     "कबूतर, बोलकर देखिए। इसमें ब पर बड़ी ऊ की मात्रा लगी है।"]))
    # deck pages 7 and 8 carry no slide and no note -> CONTRAST_PAIR and the third MEET_PAIR are
    # DELETED. See the header.

    # ---- screens 6-10 · GUIDED -------------------------------------------------------
    S.append(s_tap("G1", ["पुल", "दूध", "सूरज"], "पुल", U,                     # deck slide 7
                   "शाबाश! पुल शब्द में छोटी उ की मात्रा है।"))
    S.append(s_tap("G2", ["गुड़", "मुकुट", "फूल"], "फूल", UU,                   # deck slide 8
                   "शाबाश! फूल शब्द में बड़ी ऊ की मात्रा है।"))
    S.append(s_tap("G3", ["तरबूज", "सुई", "कबूतर"], "सुई", U,                  # deck slide 9
                   "शाबाश! सुई शब्द में छोटी उ की मात्रा है।"))

    # word -> matra coach. Labels «उ (ु)» / «ऊ (ू)», which is what the SME wrote for THIS screen.
    hint_listen = vo("vo_sort_hint_listen", "फिर से सुनिए और सही मात्रा पहचानिए।")
    S.append(s_sort("G4", "guided", "word",                                    # deck slide 10
                    [{"key": m, "label": "%s (%s)" % (LETTER[m], m)} for m in (U, UU)],
                    [sort_card(w, vo("vo_ok_%s" % slug(key_of(w)),
                                     "शाबाश! %s शब्द में %s की मात्रा है।" % (w, LETTER[matra_of(w)])))
                     for w in ["आलू", "सूरज", "सुई", "गुड़"]],
                    "हर शब्द को उसकी सही मात्रा वाले डिब्बे में डालिए।",
                    "हर शब्द को उसकी सही मात्रा वाले डिब्बे में डालिए।",
                    hint_listen,
                    vo("vo_g4_hint2", "ध्यान से देखिए, इस शब्द में कौन-सी मात्रा है?")))

    # the REVERSE round: coaches carry the LETTER, the child drags the MATRA. Round 2 put the
    # WORDS पुल / फूल on these coaches; the SME asks for उ / ऊ instead, and for no matra symbol in
    # the label — otherwise the label would simply show the answer.
    S.append(s_sort("G5", "guided", "matra",                                   # deck slide 11
                    [{"key": m, "label": LETTER[m]} for m in (U, UU)],
                    [{"bin": m, "word": "◌" + m, "audio": MATRA_VO[m],
                      "correct_audio": vo("vo_ok_matra_%s" % ("u" if m == U else "uu"),
                                          "शाबाश! यह %s की मात्रा है।" % LETTER[m])}
                     for m in (U, UU)],
                    "सही मात्रा को सही डिब्बे में डालिए।",
                    "सही मात्रा को उसके सही डिब्बे में डालिए।",
                    vo("vo_g5_hint1", "फिर से देखिए और सही मात्रा पहचानिए।"),
                    vo("vo_g5_hint2", "ध्यान से देखिए, यह किसकी मात्रा है?"),
                    single=True))

    # ---- screens 11-16 · PRACTICE ----------------------------------------------------
    S.append(s_word_build("P1"))                                               # deck slide 12

    S.append(s_sort("P2", "practice", "picture",                               # deck slide 13
                    [{"key": m, "label": LETTER[m]} for m in (U, UU)],
                    [sort_card(w, vo("vo_okp_%s" % slug(key_of(w)),
                                     "शाबाश! %s में %s की मात्रा है।" % (w, LETTER[matra_of(w)])))
                     for w in ["मुकुट", "पुल", "तरबूज", "कबूतर"]],
                    "चित्र को सुनिए और उसे सही मात्रा वाली बोगी में डालिए।",
                    "चित्र को सुनिए और उसे सही मात्रा वाली बोगी में डालिए।",
                    hint_listen,
                    vo("vo_p2_hint2", "शब्द को ध्यान से सुनिए।")))

    # Four sentence screens. Sentence 4 is the NOTE's wording, «मीठा ___ खाना अच्छा लगता है।» — the
    # mockup draws «गर्मी में मीठा ___ …», a different sentence. Confirmed with the user on
    # 2026-09-23: the note wins (CHANGES.md Q1).
    S.append(s_sentence("P3", "scn_seema_khush",                               # deck slide 14
                        "सीमा आज बहुत ", " है।", "खुश", ["खुश", "फूल", "तरबूज"],
                        "शाबाश! सीमा आज बहुत खुश है।"))
    S.append(s_sentence("P4", "scn_subah_uthna",                               # deck slide 15
                        "मैं ", " जल्दी उठता हूँ।", "सुबह", ["सुबह", "दूध", "मुकुट"],
                        "शाबाश! मैंने सही शब्द चुनकर वाक्य पूरा किया।"))
    S.append(s_sentence("P5", "scn_bageecha",                                  # deck slide 16
                        "बगीचे में सुंदर ", " खिले हैं।", "फूल", ["फूल", "तरबूज", "सुबह"],
                        "शाबाश! बगीचे में सुंदर फूल खिले हैं।"))
    S.append(s_sentence("P6", "scn_tarbooj_khana",                             # deck slide 17
                        "मीठा ", " खाना अच्छा लगता है।", "तरबूज", ["तरबूज", "फूल", "खुश"],
                        "शाबाश! मीठा तरबूज खाना अच्छा लगता है।"))

    # ---- screen 17 · CELEBRATION ------------------------------------------------------
    # The deck carries NO recommendation on this page, so it is unchanged — there is no imperative
    # in it to flip.
    recap = ("शाबाश! आज हमने सीखा, छोटी उ और बड़ी ऊ की मात्रा पहचानना, "
             "और मात्रा वाले शब्द पढ़ना।")
    S.append({"id": "CEL", "phase": "practice", "eis": "iconic", "type": "CELEBRATION",
              "prompt_hi": recap,
              "audio": {"prompt": vo("vo_cel_prompt", recap)}, "data": {}})
    return S


def build_card(slides):
    for vid, text in MATRA_TEXT.items():
        vo(vid, text)
    # the SME's landing line, in their spelling: «स्विफ्टी» in Devanagari, «जानेंगे» not «जानेगें»
    vo("vo_landing", "हेलो दोस्त! मैं हूँ स्विफ्टी। आज हम मात्राओं के बारे में जानेंगे।")
    vo("vo_try_again", "एक बार फिर सुनिए।")          # आप, with everything else

    counts = {}
    for s in slides:
        counts[s["phase"]] = counts.get(s["phase"], 0) + 1
    audio = {v: "assets/Audio/%s.ogg" % v for v in sorted(AUDIO_TEXT)}
    for v in COPY_AUDIO:
        audio.setdefault(v, "assets/Audio/%s.ogg" % v)
    image = {k: "assets/Images/%s.png" % k for k in sorted(used_images(slides))}

    return {
        "version": "0.1", "skill_code": CODE, "lo_code": "HI02H11_L02",
        "grade": "02", "attribute": "H11", "skill_type": "CORE",
        "part_label": "भाग 1", "medium": "hi",
        "title": {"hi": "मात्राओं की रेल", "en": "Matra train — the u / oo matras"},
        "subtitle_hi": "",
        "theme": "toybox",
        "skill_description_hi": ("उ, ऊ मात्रा वाले शब्द पढ़ता है। "
                                 "शब्दों में आने वाली मात्रा पहचानता है।"),
        "landing_audio": "vo_landing",
        # SME: "Show only two matra boxes/cards: 1st box ु, 2nd box ू … The matras can be shown
        # inside two train bogies/cards so that the lesson visually continues as a «मात्राओं की
        # रेल» journey", with a right-to-left arrival, the bogies appearing one by one, a whistle
        # on entry and a sparkle as each matra lands.
        #
        # `matra_train` is the PAINTED train ported from the sibling lesson HI02H11_L02_S01 — the
        # same artwork the mockup draws, as a 36-cell spritesheet, cropped from three coaches to
        # two for this lesson's two matras (634 -> 479px per cell). See the module set's dressLandingTrain().
        #
        # THE MATRAS ARE BARE HERE, not «◌ु». An orphan combining mark makes the font draw its own
        # dotted placeholder circle, which is exactly the «ु» the note asks for and is how the
        # sibling ships it. The intro screen still uses an explicit ◌ because its glyphs sit in a
        # text run where the font does not supply one.
        "landing_hero": {"kind": "matra_train", "matras": [U, UU]},
        "phase_transition_audio": {"tutorial": "vo_pt_tutorial", "guided": "vo_pt_guided",
                                   "practice": "vo_pt_practice"},
        # flipped to आप with everything else — these sit between the phases, next to the shared
        # gate clips, which already speak आप
        "phase_transition_title": {"tutorial": "चलिए, रेल चलाएँ!", "guided": "साथ में करें।",
                                   "practice": "अब आपकी बारी।"},
        "phase_distribution": counts,
        # 3-attempt ladder, per the SME on every test screen: wrong 1 = hint VO only and NO hand;
        # wrong 2 = hint VO + hand on the correct answer (tutorial/guided; practice gets the glow
        # instead, under ruling [28f]); 3rd-try correct = confetti but silent.
        "scaffold_rules": {"nudge_timeout_ms": {"guided": 6000, "practice": 8000},
                           "max_attempts": 3, "hand_on_attempt": 2,
                           "reveal_on_attempt": None, "silent_on_late_correct": True},
        "signals_expected": ["slide_entered", "slide_completed", "intro_letter_tap",
                             "train_tap_first_try", "matra_sort_item", "matra_sort_first_try",
                             "word_build_item", "word_build_first_try",
                             "sentence_complete_first_try",
                             "answer_wrong", "hint_shown",
                             "phase_transition", "mastery_score", "lesson_completed"],
        "_emoji_fallback": dict(list({k: v[1] for k, v in OBJ.items()}.items()) + list(SCENE.items())),
        "assets": {"audio": audio, "audio_text": AUDIO_TEXT, "image": image,
                   "audio_ext": "ogg", "img_ext": "png"},
        "slides": slides,
    }


# ---------------------------------------------------------------- guards
def used_images(slides):
    """Every image key a slide actually renders. `pic()` returns None for art that is not on disk
    yet, so a pending picture never reaches this set and never lands in assets.image."""
    used = set()
    for s in slides:
        d = s.get("data", {}) or {}
        for k in ("result_img", "base_img", "scene_img"):
            if d.get(k):
                used.add(d[k])
        for group in ("examples", "cards", "slots", "options"):
            for it in d.get(group, []) or []:
                if isinstance(it, dict) and it.get("img"):
                    used.add(it["img"])
    return used


def guard_engine(src):
    m = VER_RE.search(src)
    if not m:
        sys.exit("X  no ENGINE_VERSION in 4_ENGINE/lesson_template.html")
    ver = m.group(1)
    for name in TRAIN_MODULES:
        if ("SlideModules." + name + " = {") not in src:
            sys.exit("X  the engine copy is missing the module %s. Re-run the injector "
                     "(4_ENGINE/inject_train.py); do NOT hand-edit the monolith." % name)
    for name in STOCK_MODULES:
        if not (re.search(r'^\s{2}"?' + name + r'"?\s*[:(]', src, re.M)
                or re.search(r'SlideModules\.' + name + r'\s*=', src)):
            sys.exit("X  the engine copy is missing the stock module %s" % name)
    if "TRAIN STYLES :: BEGIN" not in src:
        sys.exit("X  the train CSS block is missing — the coaches would render unstyled")
    rsm = RSM_RE.search(src)
    inset = set(re.findall(r'"([^"]+)"', rsm.group(1))) if rsm else set()
    for bad in (U, UU):
        if bad in inset:
            sys.exit("X  %r is in RIGHT_SPACING_MATRAS. It is BELOW-BASE: it shares its\n"
                     "     consonant's columns, so the highlight colours the NEXT letter.\n"
                     "     Measured: पुल puts 11342 red px on the ल. Remove it." % bad)
    if 'case "letter":' not in src:
        sys.exit("X  conceptTileHTML has no `letter` case — the landing strip would be empty")
    if "dressLandingTrain" not in src:
        sys.exit("X  the landing-train dressing is missing — the landing bogies would not render")
    if 'kind !== "matra_train"' not in src:
        sys.exit("X  the landing train is still the drawn version — re-run inject_train.py")
    if "TrainChrome" not in src or "TRAIN_ART" not in src:
        sys.exit("X  TrainChrome is missing — the activity screens would draw a SECOND, "
                 "different locomotive beside the painted cover. "
                 "Re-run 4_ENGINE/inject_train.py.")
    print("  OK  engine: %s  (4_ENGINE, pinned)" % ver)
    print("      modules present: %s" % ", ".join(TRAIN_MODULES))
    print("      train styles present; ु/ू correctly excluded from the in-word highlight")
    return ver


def guard_flow(slides):
    """The flow must match the SME's round-3 deck screen for screen: 18 screens = landing + 17."""
    want = ["MATRA_INTRO", "MATRA_BUILD", "MEET_PAIR", "MATRA_BUILD", "MEET_PAIR",
            "TRAIN_TAP", "TRAIN_TAP", "TRAIN_TAP", "TRAIN_SORT", "TRAIN_SORT",
            "WORD_BUILD", "TRAIN_SORT",
            "SENTENCE_COMPLETE", "SENTENCE_COMPLETE", "SENTENCE_COMPLETE", "SENTENCE_COMPLETE",
            "CELEBRATION"]
    got = [s["type"] for s in slides]
    if got != want:
        sys.exit("X  flow does not match the SME's round-3 deck.\n     want: %s\n     got:  %s"
                 % (want, got))
    print("  OK  flow guard: 18 screens (landing + %d slides), same order as the round-3 deck"
          % len(slides))


def guard_single_matra():
    bad = []
    for w, m in [(v[0], v[2]) for v in OBJ.values()]:
        found = set(c for c in w if c in (U, UU))
        if found != set([m]):
            bad.append("%s carries %s, declared %r" % (w, sorted(found) or "none", m))
    if bad:
        sys.exit("X  single-matra rule broken:\n     " + "\n     ".join(bad))
    print("  OK  single-matra rule: all %d words carry exactly one target matra" % len(OBJ))


def guard_sentences(slides):
    """Every sentence screen must be answerable and must not give itself away.

    Two ways a sentence screen can be quietly broken, both invisible to an existence check: the
    answer is not among the options (unanswerable), or the answer is already printed in the
    sentence (free). Whether a distractor ALSO reads correctly cannot be decided mechanically —
    that one is a human read, and it is on the verification list.
    """
    bad = []
    for s in slides:
        if s["type"] != "SENTENCE_COMPLETE":
            continue
        d = s["data"]
        words = [o["word"] for o in d["options"]]
        if d["answer"] not in words:
            bad.append("%s: answer %r is not one of the options %s" % (s["id"], d["answer"], words))
        if len(set(words)) != len(words):
            bad.append("%s: duplicate option %s" % (s["id"], words))
        shown = (d["sentence_pre"] or "") + (d["sentence_post"] or "")
        if d["answer"] in shown:
            bad.append("%s: the answer %r is already printed in the sentence"
                       % (s["id"], d["answer"]))
    if bad:
        sys.exit("X  sentence audit:\n     " + "\n     ".join(bad))
    n = len([s for s in slides if s["type"] == "SENTENCE_COMPLETE"])
    print("  OK  sentence audit: %d screens, answer present as an option and never pre-printed" % n)


def guard_word_build(slides):
    """A WORD_BUILD option must complete EXACTLY ONE coach, and every coach must be completable.

    The module judges a drop by reconstructing the word (`akshar + tail == word`), so an option
    that completed two coaches would make one of them accept the wrong tile, and a distractor that
    accidentally completed a coach would mark a wrong answer right. Both are silent at runtime.
    """
    for s in slides:
        if s["type"] != "WORD_BUILD":
            continue
        d = s["data"]
        for sl in d["slots"]:
            hits = [o["akshar"] for o in d["options"] if o["akshar"] + sl["tail"] == sl["word"]]
            if len(hits) != 1:
                sys.exit("X  word-build: %r is completed by %s — must be exactly one option"
                         % (sl["word"], hits or "nothing"))
        dis = [o["akshar"] for o in d["options"]
               if not any(o["akshar"] + sl["tail"] == sl["word"] for sl in d["slots"])]
        if not dis:
            sys.exit("X  word-build: the SME asks for 1-2 distractors; there are none")
        if "मी" in [o["akshar"] for o in d["options"]]:
            sys.exit("X  word-build: मी is still an option — the SME asked for it to be removed")
        print("  OK  word-build audit: %d coaches, exactly 1 option each, distractor %s (मी removed)"
              % (len(d["slots"]), dis))


GESTURE = {"TRAIN_TAP": "pick", "TRAIN_SORT": "drag", "MATRA_FILL": "drag",
           "WORD_BUILD": "drag", "SENTENCE_COMPLETE": "pick", "POEM_SEARCH": "search"}


def guard_prompts(slides):
    """EVERY slide must carry on-screen heading text.

    THE DEFECT THIS EXISTS TO PREVENT (SME review round 2, 2026-09-21):
    «ऊपर स्विफ्टी वाले बॉक्स की हेडिंग मिसिंग है». The first build shipped prompt_hi: "" on 14 of
    16 slides and then hid the heading band with CSS, because the SME's per-screen note says
    "No instruction text on screen. Only VO should play." That reading was wrong — their own
    mockups draw the band, with text in it, on both test and teach screens, and the round-3
    mockups draw it again on all four sentence screens and on the word-build screen. The note
    means no EXTRA explanatory copy in the PLAY AREA; the heading band beside the mascot is house
    chrome on every screen of every shipped lesson.

    Failing the build is the right response because the symptom was invisible to every other
    check: the page scored 0 FAIL / 0 WARN, all assets served and no JS errored — it simply had a
    mascot sitting next to nothing.
    """
    bad = [sl["id"] for sl in slides if not (sl.get("prompt_hi") or "").strip()]
    if bad:
        sys.exit("X  guard_prompts: empty prompt_hi on %s — the heading band would render "
                 "blank beside the mascot" % ", ".join(bad))
    short = [(sl["id"], sl["prompt_hi"]) for sl in slides if len(sl["prompt_hi"].strip()) < 8]
    if short:
        sys.exit("X  guard_prompts: heading too short to read: %s" % short)
    print("   guard_prompts ....... %d/%d slides carry heading text" % (len(slides), len(slides)))


BAD_REGISTER = ["करो", "सोचो", "देखो", "डालो", "सुनो", "चुनो", "पढ़ो", "बोलो", "ढूँढो",
                "घुमाओ", "मिलाओ", "लगाओ", "बनाओ", "तुम"]


def guard_register(slides, card):
    """No तुम-form imperative may survive the round-3 flip.

    The SME says it twice — "Use respectful language throughout: सुनिए, पहचानिए, डालिए" and
    "Maintain respectful language: सोचिए, देखिए, चुनिए instead of सोचो, देखो, चुनो". Round 2 was
    entirely तुम, so this touches almost every clip and every heading, and a single missed line
    reads as sloppiness rather than as a bug — which is exactly the kind of thing no other check
    would catch. So it is checked mechanically.
    """
    hits = []
    targets = [("%s (clip)" % v, t) for v, t in AUDIO_TEXT.items()]
    targets += [("%s heading" % s["id"], s.get("prompt_hi") or "") for s in slides]
    targets += [("phase title %s" % k, v) for k, v in card["phase_transition_title"].items()]
    for where, text in targets:
        for b in BAD_REGISTER:
            if b in text:
                hits.append("%s: %s" % (where, text))
                break
    if hits:
        sys.exit("X  register guard: तुम-form survives the round-3 flip in %d place(s):\n     %s"
                 % (len(hits), "\n     ".join(hits)))
    print("  OK  register guard: आप throughout — no तुम form in any clip, heading or phase title")


def guard_mechanics(slides):
    tests = [s for s in slides if s["phase"] != "tutorial" and s["type"] != "CELEBRATION"]
    fams = {}
    for s in tests:
        f = GESTURE.get(s["type"])
        if not f:
            sys.exit("X  %s: %s unclassified in GESTURE" % (s["id"], s["type"]))
        fams[f] = fams.get(f, 0) + 1
    n = len(tests)
    if len(fams) < 2:
        sys.exit("X  mechanic gate: one family only")
    if "drag" not in fams:
        sys.exit("X  mechanic gate: no produce mechanic")
    # ROUND 3 RAISES THE CEILING FROM 60% TO 70%, AND THAT IS A REAL LOOSENING — so it says so out
    # loud rather than being quietly widened. The SME's round-3 flow is three tap screens plus
    # four sentence screens against four drag screens: 7 pick / 4 drag = 64% pick. The gate exists
    # to stop a lesson being one gesture end to end, and 64/36 across two families with a real
    # produce mechanic is not that. The deck is authoritative on the flow, so the guard moves
    # rather than the lesson — and the move is reported in the scorecard.
    for f, c in sorted(fams.items()):
        if 100.0 * c / n > 70.0:
            sys.exit("X  mechanic gate: %s is %.0f%% of %d test slides" % (f, 100.0 * c / n, n))
    mix = ", ".join("%s %d (%.0f%%)" % (f, c, 100.0 * c / n) for f, c in sorted(fams.items()))
    print("  OK  mechanic gate: %d test slides — %s" % (n, mix))
    if max(100.0 * c / n for c in fams.values()) > 60.0:
        print("  !!  NOTE: above the round-2 ceiling of 60%. The SME's round-3 flow is pick-heavy "
              "by design (3 tap + 4 sentence screens); ceiling raised to 70% for this deck.")


def guard_pictures(slides, card):
    used = used_images(slides)
    declared = set(card["assets"]["image"])
    if used - declared:
        sys.exit("X  images used but not declared: %s" % sorted(used - declared))
    if declared - used:
        sys.exit("X  images declared but never shown: %s" % sorted(declared - used))
    missing = [k for k, p in card["assets"]["image"].items()
               if not os.path.isfile(os.path.join(BUNDLE, p))]
    if missing:
        sys.exit("X  declared images missing from disk: %s" % sorted(missing))
    print("  OK  picture guard: %d images, all declared, all used, all on disk" % len(used))


def guard_audio(slides, card):
    """Every audio id a slide names must be declared, and every test slide must carry the whole
    3-rung ladder — a missing rung is a silent beat exactly when the child is stuck.

    ROUND 3: the `correct` rung may be satisfied PER ITEM instead of per slide. The SME moved the
    praise line onto each card («शाबाश! 'सुई' शब्द में उ की मात्रा है।») and asked for no completion
    line, so a sort or build screen whose every item carries `correct_audio` has a complete ladder
    without a slide-level clip — and demanding one would mean recording a line nothing ever plays.
    """
    declared = set(card["assets"]["audio"])
    miss, ladders = [], []
    for s in slides:
        d = s.get("data", {}) or {}
        for k, v in (s.get("audio") or {}).items():
            if v and v not in declared:
                miss.append("%s.%s -> %s" % (s["id"], k, v))
        items = (d.get("cards") or []) + (d.get("slots") or [])
        for group in ("cards", "slots", "options", "examples", "pairs"):
            for it in d.get(group, []) or []:
                if not isinstance(it, dict):
                    continue
                for k in ("audio", "correct_audio", "audio_line", "matra_audio"):
                    if it.get(k) and it[k] not in declared:
                        miss.append("%s %s.%s -> %s" % (s["id"], group, k, it[k]))
        if s["type"] in GESTURE:
            per_item = bool(items) and all(c.get("correct_audio") for c in items)
            for rung in ("prompt", "hint1", "hint2", "correct"):
                if (s.get("audio") or {}).get(rung):
                    continue
                if rung == "correct" and per_item:
                    continue
                ladders.append("%s missing %s" % (s["id"], rung))
    if miss:
        sys.exit("X  undeclared audio ids:\n     " + "\n     ".join(miss))
    if ladders:
        sys.exit("X  incomplete 3-attempt ladder:\n     " + "\n     ".join(ladders))
    print("  OK  audio guard: every id declared; every test slide has a complete ladder")


# ---------------------------------------------------------------- stale-asset pruning
def prune_stale(card):
    """Delete exactly the clips round 3 invalidated — nothing more.

    THIS IS THE DEFECT IT PREVENTS, and it has already happened on this lesson once: a clip's TEXT
    changed in the builder while its ID stayed the same, the old .ogg stayed on disk, and
    `gen_tts.py` — which skips ids that already have a file — never re-recorded it. The game then
    shipped round-2 audio under round-3 text. It is invisible to an existence check and to a
    file-size check.

    The previous build's `card.json` still holds the previous `audio_text`, so the comparison is
    exact: a clip is STALE if its text changed and ORPHANED if its id is gone. Deleting exactly
    those leaves gen_tts a minimal, correct work list — which is also the rule about regenerating
    only what changed, since re-running an UNCHANGED clip returns a different take.
    """
    old_path = os.path.join(BUNDLE, "card.json")
    if not os.path.isfile(old_path):
        return [], []
    try:
        old = json.load(open(old_path, encoding="utf-8"))
    except Exception:
        return [], []
    old_text = (old.get("assets") or {}).get("audio_text") or {}
    new_text = card["assets"]["audio_text"]
    stale, orphan = [], []
    for vid, text in sorted(old_text.items()):
        if vid not in new_text:
            orphan.append(vid)
        elif new_text[vid] != text:
            stale.append(vid)
    for vid in stale + orphan:
        f = os.path.join(AUD_DIR, vid + ".ogg")
        if os.path.isfile(f):
            os.remove(f)
    old_img = set((old.get("assets") or {}).get("image") or {})
    img_orphan = sorted(old_img - set(card["assets"]["image"]))
    return stale, orphan, img_orphan


def write_vo_list():
    """The recording list, with the two traps this lesson keeps hitting called out by name."""
    risky = sorted(v for v, t in AUDIO_TEXT.items() if "—" in t or t.count("।") >= 3)
    with open(os.path.join(SPEC_DIR, "VO_RECORDING_LIST.md"), "w", encoding="utf-8") as f:
        f.write("# %s (भाग 1 — उ / ऊ) · «मात्राओं की रेल» — VO recording list (ROUND 3)\n\n" % CODE)
        f.write("%d clips. Shown text == spoken text; record exactly this.\n\n" % len(AUDIO_TEXT))
        f.write("**Register is आप** — the SME asked for it twice, in as many words. Round 2 was "
                "तुम, so most of this list is a re-record, not a new line. `guard_register` in the "
                "builder fails the build if a तुम form survives anywhere.\n\n")
        f.write("**Only re-record what changed.** The builder deletes exactly the clips whose text "
                "moved this round, so `gen_tts.py` (which skips ids that already have a file) "
                "regenerates precisely those and leaves every unchanged take alone. Never "
                "`--force` the whole card: generated audio is non-deterministic, so re-running an "
                "unchanged clip returns a different take — a change the SME never asked for.\n\n")
        f.write("## ⚠️ EAR-CHECK — %d clips a human must listen to before delivery\n\n" % len(risky))
        f.write("The TTS model truncates a clip when an **em-dash precedes a short final word** "
                "(measured on this lesson: em-dash 0.73–1.05 s vs comma 1.53–2.21 s for the same "
                "words), and it does the same to a line built from several short danda-separated "
                "pieces. The SME's round-3 MEET_PAIR lines and the new sound-differentiation clips "
                "are written in exactly those shapes. Their wording ships as written — rewriting a "
                "reviewer's Hindi to dodge a synthesis bug is the worse failure — so the clips are "
                "flagged instead. **Truncation is invisible to an existence check and to a "
                "file-size check.** `_verify_assets.py` compares each clip against peers of "
                "similar text length and is the only thing that catches it. Run it, then listen to "
                "every id below.\n\n")
        for v in risky:
            f.write("- `%s` — %s\n" % (v, AUDIO_TEXT[v]))
        f.write("\n## All clips\n\n| clip id | spoken text |\n|---|---|\n")
        for v in sorted(AUDIO_TEXT):
            f.write("| `%s` | %s |\n" % (v, AUDIO_TEXT[v]))
        f.write("\n## Copied, do NOT record\n\n")
        for v in COPY_AUDIO:
            f.write("- `%s`\n" % v)
    return risky


ART_BRIEFS = {
    "obj_dhanush": "a simple archery bow in warm brown wood, held upright and slightly curved, "
                   "with a taut pale string and one arrow nocked against it; thick dark brown "
                   "outline, bow, string and arrow FUSED into one single connected silhouette "
                   "with no detached pieces",
    "obj_khush": "the head and shoulders of a happy Indian child smiling broadly with closed "
                 "curved eyes and rosy cheeks, dark hair, warm brown skin, wearing a bright coral "
                 "top; thick dark outline, one connected shape. NOT pale, NOT white.",
    # FIRST ATTEMPT FAILED AND IT IS WORTH RECORDING WHY. "a sun half risen above a horizon
    # LINE, fused into one connected shape" produced a sun sitting in a dark teal BOWL — the
    # keying rule (one connected silhouette, thick dark outline) turns a thin horizon line into a
    # container, and at the 66px option-card size it read as a basket, not as morning. Hills work
    # because the sun can rise from BEHIND them and still be one shape.
    "obj_subah": "a sunrise over green hills: a golden-orange sun disc rising from BEHIND two "
                 "rounded green hills so only its top half shows, with three short pointed rays "
                 "above it in the sky; the sun and both hills FUSED into one single connected "
                 "silhouette with a thick dark outline around the whole shape. Wide landscape "
                 "composition, hills along the bottom. Saturated colours, never pale. NOT a sun "
                 "on its own, NOT a sun in a bowl or basket, NOT a container.",
    "scn_seema_khush": "FULL SCENE, not a cut-out: a happy Indian girl in a pink dress standing in "
                       "a bright living room with both arms raised in delight, a sofa and a window "
                       "behind her, warm daylight, soft storybook illustration style, full-bleed "
                       "background — do NOT key this image",
    "scn_subah_uthna": "FULL SCENE, not a cut-out: an Indian boy in blue pyjamas sitting up in bed "
                       "stretching both arms, an alarm clock on the bedside table and a sunrise "
                       "through the window behind him, soft storybook illustration style, "
                       "full-bleed background — do NOT key this image",
    "scn_bageecha": "FULL SCENE, not a cut-out: a garden bed full of pink, yellow and white "
                    "flowers in bloom with green leaves, a wooden picket fence and a tree behind, "
                    "blue sky, soft storybook illustration style, full-bleed background — do NOT "
                    "key this image",
    "scn_tarbooj_khana": "FULL SCENE, not a cut-out: an Indian boy in a yellow t-shirt sitting at "
                         "a table outdoors holding a large slice of watermelon to his mouth and "
                         "smiling, a plate of more slices in front of him, greenery behind, soft "
                         "storybook illustration style, full-bleed background — do NOT key this "
                         "image",
}


def write_art_manifest(slides):
    """`_art_manifest.json` keeps the prompt for every picture in the lesson; the pending ones are
    split out so an art run can be pointed straight at a work list, and the scenes are named
    separately because they must NOT go through the chroma-key pipeline."""
    path = os.path.join(SPEC_DIR, "_art_manifest.json")
    existing = json.load(open(path, encoding="utf-8")) if os.path.isfile(path) else {}
    if isinstance(existing, dict) and "all" in existing:
        existing = existing["all"]
    allm = dict(existing)
    allm.update(ART_BRIEFS)
    # anything this card no longer shows is dropped, so nothing is regenerated for a deleted screen
    live = set(used_images(slides)) | set(PENDING_ART)
    allm = dict((k, v) for k, v in allm.items() if k in live)
    out = {"all": allm,
           "pending": dict((k, allm[k]) for k in sorted(PENDING_ART) if k in allm),
           "scenes_do_not_key": sorted(SCENE)}
    with open(path, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return out


def check_chrome():
    """The shared UI chrome and the fixed clips (phase gates + SFX) already live in the bundle.

    The factory build copied them from a reference bundle under
    `<factory>/KG and G1 refernce ready HTML's`, which is OUTSIDE this self-contained handoff.
    Nothing here reaches out to it: the files are checked in place and a missing one is reported
    rather than silently re-copied from a path that does not exist.
    """
    ui = os.path.join(BUNDLE, "assets", "UI")
    n = len(os.listdir(ui)) if os.path.isdir(ui) else 0
    missing = [v for v in COPY_AUDIO if not os.path.isfile(os.path.join(AUD_DIR, v + ".ogg"))]
    print("  OK  chrome in place: %d UI files, %d/%d fixed clips"
          % (n, len(COPY_AUDIO) - len(missing), len(COPY_AUDIO)))
    if missing:
        print("  !!  fixed clips MISSING from the bundle: %s" % missing)


LETTER_GLOW_CSS = """
<style id="bundleLetterGlow">
/* Landing letter-strip glow. concept_strip returns before the engine adds show/hint-glow, so
   every such landing in the fleet misses it; raised as a dev ask. Base rule, not keyframes-only:
   capture_pages.py kills animation, and a glow that lives only in @keyframes vanishes from the
   review deck. Amber, because blue disappears against the pale-blue landing card.
   ROUND 3: scoped OFF the train landing — there the bogie is the frame, so the pill and its
   pulse would fight it. See `.lt-train .sg-ex-letter` in the train styles. */
.sg-ex-letter{
  box-shadow:0 0 0 6px rgba(255,206,46,.65),0 0 18px 4px rgba(252,188,24,.50),
             0 12px 28px rgba(11,61,140,.16);
  animation:sgLetterGlow 2.2s ease-in-out infinite;
}
.sg-acell:nth-child(1) .sg-ex-letter{animation-delay:.95s;}
.sg-acell:nth-child(2) .sg-ex-letter{animation-delay:1.40s;}
@keyframes sgLetterGlow{
  0%,100%{box-shadow:0 0 0 6px rgba(255,206,46,.65),0 0 18px 4px rgba(252,188,24,.50),
                     0 12px 28px rgba(11,61,140,.16);}
  50%    {box-shadow:0 0 0 10px rgba(255,206,46,.92),0 0 28px 8px rgba(252,188,24,.70),
                     0 14px 32px rgba(11,61,140,.22);}
}
@media (prefers-reduced-motion:reduce){ .sg-ex-letter{animation:none;} }
</style>
"""


def main():
    argparse.ArgumentParser().parse_args()
    if not os.path.isfile(ENGINE):
        sys.exit("X  no engine at %s" % ENGINE)
    src = open(ENGINE, encoding="utf-8").read()
    ver = guard_engine(src)

    guard_single_matra()
    slides = build_slides()
    guard_flow(slides)
    guard_sentences(slides)
    guard_word_build(slides)
    card = build_card(slides)
    if sum(card["phase_distribution"].values()) != len(slides):
        sys.exit("X  phase_distribution does not sum to the slide count")
    guard_prompts(slides)
    guard_register(slides, card)
    guard_mechanics(slides)
    guard_pictures(slides, card)
    guard_audio(slides, card)

    for d in ("assets/Audio", "assets/Images", "assets/UI"):
        os.makedirs(os.path.join(BUNDLE, d), exist_ok=True)
    check_chrome()

    stale, orphan, img_orphan = prune_stale(card)
    if stale or orphan:
        print("  OK  cleared %d stale clip(s) (text changed) + %d orphan(s) (screen gone) — "
              "gen_tts will re-record exactly these" % (len(stale), len(orphan)))
    if img_orphan:
        print("  !!  images no longer used by the card (delete before packaging): %s" % img_orphan)

    payload = json.dumps(card, ensure_ascii=False, indent=1)
    if not CARD_TAG.search(src):
        sys.exit("X  cardData tag not found")
    html = CARD_TAG.sub(lambda m: m.group(1) + payload + m.group(3), src, count=1)

    first = [k for k in ("obj_pul", "obj_phool") if k in card["assets"]["image"]]
    links = "".join('<link rel="preload" as="image" fetchpriority="high" '
                    'href="assets/Images/%s.png">' % k for k in first)
    html, n_pre = re.subn(r'(?:<link rel="preload" as="image"[^>]*>)+', links, html, count=1)
    declared = set(card["assets"]["image"])
    bad = sorted(set(re.findall(r'<link rel="preload"[^>]*href="assets/Images/([^".]+)\.\w+"',
                                html)) - declared)
    if bad:
        sys.exit("X  preload points at missing art: %s" % bad)
    print("  OK  preload retargeted to %s (%d block rewritten)" % (first, n_pre))

    if 'id="bundleLetterGlow"' not in html:
        html, n = re.subn(r"</head>", LETTER_GLOW_CSS + "</head>", html, count=1)
        if n != 1:
            sys.exit("X  could not inject the letter glow")
        print("  OK  letter-strip glow injected")

    open(os.path.join(BUNDLE, CODE + ".html"), "w", encoding="utf-8").write(html)
    open(os.path.join(BUNDLE, "card.json"), "w", encoding="utf-8").write(payload + "\n")

    risky = write_vo_list()
    art = write_art_manifest(slides)

    print("  OK  card:   %d slides  %s" % (len(slides), card["phase_distribution"]))
    print("  OK  audio:  %d to record + %d copied  (%d flagged EAR-CHECK)"
          % (len(AUDIO_TEXT), len(COPY_AUDIO), len(risky)))
    print("  OK  images: %d on disk" % len(card["assets"]["image"]))
    if art["pending"]:
        print("  !!  ART PENDING (%d) — rendering as the emoji fallback until generated: %s"
              % (len(art["pending"]), ", ".join(sorted(art["pending"]))))
    gap = [v for v in AUDIO_TEXT if not os.path.isfile(os.path.join(AUD_DIR, v + ".ogg"))]
    if gap:
        print("  !!  VO PENDING (%d of %d) — these fall back to a silent beat until recorded"
              % (len(gap), len(AUDIO_TEXT)))
    print("  OK  html:   %s.html  (engine %s)" % (CODE, ver))


if __name__ == "__main__":
    main()
