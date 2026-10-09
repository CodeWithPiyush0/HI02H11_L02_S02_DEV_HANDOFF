# -*- coding: utf-8 -*-
"""VO manifest for the runner game (page 17, «मात्रा रनर») only - not the rest of the lesson.

Reads the lines and both word pools straight from the game's source, so the manifest always says
what the game can actually speak, and measures every clip in the voice folder.

Run:  PYTHONUTF8=1 python 1_SPEC/gen_runner_vo_manifest.py
  ->  1_SPEC/game_art_src/runner_voice/runner_vo_manifest.xlsx
"""
import io, os, re, json, subprocess
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "1_SPEC", "matra_runner_src", "index.html")
VOICE = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "MatraRunner", "voice")
OUT = os.path.join(HERE, "1_SPEC", "game_art_src", "runner_voice", "runner_vo_manifest.xlsx")
FOLDER = "3_CURRENT_BUILD/assets/MatraRunner/voice/"

src = io.open(SRC, encoding="utf-8").read()

# ---- what the game can say, from its own source ----------------------------------------------
lines_block = src[src.index("const LINES"):]
lines_block = lines_block[:lines_block.index("};")]
LINES = dict(re.findall(r'^\s*(\w+)\s*:\s*"([^"]*)"', lines_block, re.M))


def pool(name):
    blk = src[src.index("const %s = [" % name):]
    blk = blk[:blk.index("]];") + 2]
    return re.findall(r'\["([^"]+)","([^"]+)"\]', blk)


POOL_U, POOL_UU = pool("POOL_U"), pool("POOL_UU")

# ---- where each line plays (the game's own flow, r77-r79) ------------------------------------
LINE_INFO = {
    # [r112] the temple-run tutorial and the obstacle bump - TTS placeholders (Leda) until recorded
    "tut_lane":   ("Tutorial",    "First time only, after the lesson's instruction: the run stops in front of a "
                                  "stone block, a hand shows the left/right swipe. TTS PLACEHOLDER - record."),
    "tut_jump":   ("Tutorial",    "Tutorial step 2: the run stops in front of a log, a hand shows the swipe up. "
                                  "TTS PLACEHOLDER - record."),
    "tut_slide":  ("Tutorial",    "Tutorial step 3: the run stops in front of a low barrier, a hand shows the "
                                  "swipe down. TTS PLACEHOLDER - record."),
    "tut_go":     ("Tutorial",    "End of the tutorial, before the level 1 goal. TTS PLACEHOLDER - record."),
    "hit":        ("Feedback",    "Swifty runs into an obstacle (a heart is lost). TTS PLACEHOLDER - record."),
    "goal_uu":    ("Instruction", "Level 1 start, after the lesson's own instruction has finished. "
                                  "Also the 2nd line of the level transition when the next level is ऊ."),
    "goal_u":     ("Instruction", "2nd line of the level 1 → level 2 transition (screen blurred), "
                                  "right after «वाह! …»."),
    "level_next": ("Transition",  "End of a level: screen blurs, level-up chime, then this line, "
                                  "followed by the next level's goal."),
    "right":      ("Feedback",    "Child runs into the orb with the correct word."),
    "wrong":      ("Feedback",    "Child runs into the orb with the wrong word. The pair then comes back."),
    "correct_is": ("Feedback",    "NOT PLAYED since r115 - a wrong orb now says only «फिर से देखिए।»; the "
                                  "words are read when the pair comes back."),
    "retry":      ("Feedback",    "All three hearts lost (wrong words and/or obstacles): after Swifty's fall, screen blurred, "
                                  "then the level restarts."),
    "win":        ("Transition",  "Last level finished: screen blurred, then the lesson moves on. New line (no portals "
                                  "any more) - TTS PLACEHOLDER - record; the old take is in runner_voice/replaced/."),
    "level_up":   ("Feedback",    "NOT PLAYED - left over from the draft that showed a level card."),
}
ORDER = ["tut_lane", "tut_jump", "tut_slide", "tut_go", "goal_uu", "goal_u", "level_next", "right", "wrong",
         "correct_is", "hit", "retry", "win", "level_up"]
WORD_WHEN = ("r115: NOT spoken before the pair is caught. When a pair comes back after ONE mistake, both its "
             "words are read (left, then right); after TWO mistakes only the right word. (Was: target word: spoken once as its pair of word orbs comes near - only the word to catch, "
             "never both portals' words. Also said after «सही शब्द है» when the child misses it.")


def duration(path):
    try:
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                              "-of", "default=nw=1:nk=1", path], capture_output=True, text=True).stdout
        return round(float(out.strip()), 2)
    except Exception:
        return None


rows = []
for k in ORDER + [k for k in LINES if k not in ORDER]:
    cat, when = LINE_INFO.get(k, ("Line", ""))
    rows.append(dict(id=k, text=LINES[k], cat=cat, matra="", when=when,
                     used=(k not in ("level_up", "correct_is"))))
for label, matra, words in (("Word - छोटी उ", "छोटी उ ( ु )", POOL_U),
                            ("Word - बड़ी ऊ", "बड़ी ऊ ( ू )", POOL_UU)):
    for hi, rid in words:
        rows.append(dict(id=rid, text=hi, cat=label, matra=matra, when=WORD_WHEN, used=True))

# [r115] the swapped-matra twins of the last two pairs of each level (फूल -> फुल): read aloud with the
# right word when that pair comes back after a first mistake. TTS placeholders - to be recorded.
U_, UU_ = "ु", "ू"
for label, tgt, oth, words in (("Twin - छोटी उ word, ू", U_, UU_, POOL_U), ("Twin - बड़ी ऊ word, ु", UU_, U_, POOL_UU)):
    for hi, rid in words:
        if tgt in hi and oth not in hi:
            rows.append(dict(id=rid + "_x", text=hi.replace(tgt, oth, 1), cat="Twin (wrong option)",
                             matra="the other matra", when="The WRONG option of a minimal pair (one matra swapped, «%s» -> «%s»). "
                             "Read only when that pair comes back after a first mistake. TTS PLACEHOLDER - record." % (hi, hi.replace(tgt, oth, 1)),
                             used=True))

for r in rows:
    p = os.path.join(VOICE, r["id"] + ".ogg")
    r["file"] = r["id"] + ".ogg"
    r["dur"] = duration(p) if os.path.exists(p) else None
    r["status"] = ("MISSING - record" if r["dur"] is None
                   else ("Recorded - not used in the game" if not r["used"] else "Recorded"))

# ---- the workbook -----------------------------------------------------------------------------
wb = Workbook()
ws = wb.active; ws.title = "VO Manifest"
HEAD = ["S.No", "Audio ID", "File name", "Hindi script (spoken exactly)", "Category", "Matra",
        "When it plays in the game", "Duration (s)", "Status"]
WID = [6, 13, 16, 40, 16, 13, 70, 11, 26]
thin = Side(style="thin", color="C9CED6")
box = Border(left=thin, right=thin, top=thin, bottom=thin)
hfill = PatternFill("solid", fgColor="1F4E79")
fills = {"Instruction": "E8F1FB", "Transition": "EEE8FB", "Feedback": "FDF1E4",
         "Word - छोटी उ": "EAF6EC", "Word - बड़ी ऊ": "FFF8DC", "Tutorial": "E6F4F1",
         "Twin (wrong option)": "F4ECF7"}
DEV = "Nirmala UI"          # ships with Windows and shapes Devanagari correctly

ws.append(["मात्रा रनर (page 17) - voice-over manifest  ·  HI02H11_L02_S02"])
ws["A1"].font = Font(bold=True, size=14, color="1F4E79")
ws.append(["Game voice only. Folder: " + FOLDER + "   ·   "
           "recorded VO, levelled to -16 LUFS, mono Vorbis .ogg, 24 kHz   ·   see the 'Recording spec' sheet"])
ws["A2"].font = Font(italic=True, size=10, color="555555")
ws.append([])
ws.append(HEAD)
for c in range(1, len(HEAD) + 1):
    cell = ws.cell(row=4, column=c)
    cell.font = Font(bold=True, color="FFFFFF"); cell.fill = hfill; cell.border = box
    cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
for i, r in enumerate(rows, 1):
    ws.append([i, r["id"], r["file"], r["text"], r["cat"], r["matra"], r["when"], r["dur"], r["status"]])
    rr = ws.max_row
    for c in range(1, len(HEAD) + 1):
        cell = ws.cell(row=rr, column=c)
        cell.border = box
        cell.fill = PatternFill("solid", fgColor=fills.get(r["cat"], "FFFFFF"))
        cell.alignment = Alignment(vertical="center", wrap_text=(c in (4, 7)),
                                   horizontal="center" if c in (1, 8) else "left")
    ws.cell(row=rr, column=4).font = Font(name=DEV, size=13, bold=True)
    ws.cell(row=rr, column=6).font = Font(name=DEV, size=11)
    ws.cell(row=rr, column=7).font = Font(name=DEV, size=10)
    if not r["used"] or r["dur"] is None:
        ws.cell(row=rr, column=9).font = Font(bold=True, color="B03A2E")
for c, w in enumerate(WID, 1):
    ws.column_dimensions[get_column_letter(c)].width = w
ws.freeze_panes = "C5"
ws.auto_filter.ref = "A4:%s%d" % (get_column_letter(len(HEAD)), ws.max_row)

# ---- the recording spec, and what plays when -------------------------------------------------
sp = wb.create_sheet("Recording spec")
n_u, n_uu = len(POOL_U), len(POOL_UU)
n_lines = len(LINES)
spec = [
    ("मात्रा रनर - recording spec", None),
    ("", None),
    ("Scope", "The runner game on page 17 only. The rest of the lesson has its own VO in assets/Audio/."),
    ("Clips", "%d in total: %d lines (%d used, 1 unused) + %d words with छोटी उ + %d words with बड़ी ऊ"
              % (n_lines + n_u + n_uu, n_lines, n_lines - 1, n_u, n_uu)),
    ("Folder", FOLDER + "<Audio ID>.ogg  - the file name is the Audio ID; the game finds clips by it"),
    ("Voice", "Recorded VO supplied 2026-09-29 (sources: 1_SPEC/game_art_src/runner_voice/source_wav/). "
              "Keep ONE narrator for every clip. Previous Gemini TTS (Leda) takes are kept in "
              "runner_voice/takes_gemini_leda_r79/."),
    ("Format", "Deliver WAV (mono, 24 kHz or higher), named <Audio ID>.wav. "
               "1_SPEC/prepare_runner_voice.py then trims the silence, levels to -16 LUFS (the lesson's "
               "VO level, peaks limited at -3 dBFS) and encodes Ogg Vorbis mono 24 kHz for the game."),
    ("Register", "आप form throughout (पकड़िए / देखिए / कीजिए) - never तुम."),
    ("Words", "Say each word on its own, plainly, as a word - no carrier sentence, no question tone. "
              "Keep the matra's length true: छोटी उ short (पुल, गुड़), बड़ी ऊ long (फूल, दूध) - "
              "but do not stretch it for effect."),
    ("Re-recording", "Keep the same file name. The build stamps the game's audio with a content hash "
                     "(?v=...), so a new take reaches browsers after the next deploy."),
    ("", None),
    ("What plays when", None),
    ("1. Game page opens", "The lesson says its own instruction (NOT in this manifest - lesson clip "
                           "assets/Audio/vo_mg_prompt.ogg): «अब एक खेल! ऊपर दी गई मात्रा वाले शब्द के "
                           "द्वार से निकलिए।»"),
    ("2. Tutorial (first time)", "tut_lane, tut_jump, tut_slide - each as the run stops in front of its "
                                 "obstacle - then tut_go"),
    ("3. Level 1 goal", "goal_uu - «%s»" % LINES.get("goal_uu", "")),
    ("4. Each pair of word orbs", "Nothing - the child reads the words (r115)."),
    ("5. Correct orb", "right - «%s»" % LINES.get("right", "")),
    ("6. Wrong orb", "wrong - «%s»; the pair comes back: after 1 mistake both words are read, after 2 the right word"
                        % LINES.get("wrong", "")),
    ("7. Obstacle hit", "hit - «%s»" % LINES.get("hit", "")),
    ("8. Level ends", "Screen blurs, chime, then level_next + next goal - «%s» «%s»"
                      % (LINES.get("level_next", ""), LINES.get("goal_u", ""))),
    ("9. All hearts lost", "retry - «%s», then the level restarts" % LINES.get("retry", "")),
    ("10. Game finished", "win - «%s»" % LINES.get("win", "")),
]
for a, b in spec:
    sp.append([a, b] if b is not None else [a])
    r = sp.max_row
    sp.cell(row=r, column=1).font = Font(bold=True, size=14 if r == 1 else 11,
                                         color="1F4E79" if b is None else "000000")
    if b is not None:
        sp.cell(row=r, column=2).font = Font(name=DEV, size=11)
        sp.cell(row=r, column=2).alignment = Alignment(wrap_text=True, vertical="top")
        sp.cell(row=r, column=1).alignment = Alignment(vertical="top")
sp.column_dimensions["A"].width = 24
sp.column_dimensions["B"].width = 110

os.makedirs(os.path.dirname(OUT), exist_ok=True)
wb.save(OUT)
missing = [r["id"] for r in rows if r["dur"] is None]
print("  wrote %s" % OUT)
print("  %d clips: %d lines + %d छोटी उ words + %d बड़ी ऊ words | missing: %s | unused: level_up"
      % (len(rows), n_lines, n_u, n_uu, missing or "none"))
