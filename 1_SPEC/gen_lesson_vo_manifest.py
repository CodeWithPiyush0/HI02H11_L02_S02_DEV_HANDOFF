# -*- coding: utf-8 -*-
"""VO manifest for the LESSON - every page except the runner game's own voice (that one has its
own manifest: gen_runner_vo_manifest.py). The lesson's instruction on the game page, vo_mg_prompt,
IS here: it is the lesson's clip, not the game's.

Built from the lesson's card.json (every audio id and every place a page uses it) and the files on
disk (duration, whether it exists), so it always describes the build as it is.

Run:  PYTHONUTF8=1 python 1_SPEC/gen_lesson_vo_manifest.py
  ->  1_SPEC/lesson_vo_manifest.xlsx
"""
import io, os, re, json, subprocess, collections
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(HERE, "3_CURRENT_BUILD")
AUD = os.path.join(BUILD, "assets", "Audio")
OUT = os.path.join(HERE, "1_SPEC", "lesson_vo_manifest.xlsx")
VOLIST = os.path.join(HERE, "1_SPEC", "VO_RECORDING_LIST.md")

card = json.load(io.open(os.path.join(BUILD, "card.json"), encoding="utf-8"))
slides = card["slides"]
declared = card["assets"]["audio"]
text = dict(card["assets"].get("audio_text") or {})

# the three round transitions are shared kit recordings; their spoken lines, as recorded
KIT_TEXT = {"vo_pt_tutorial": "ध्यान से देखिए और मेरे साथ जानिए। चलिए, शुरू करें!",
            "vo_pt_guided": "बहुत बढ़िया! अब हम साथ मिलकर शुरू करते हैं। चलिए, साथ में करें!",
            "vo_pt_practice": "वाह! अब आपकी बारी।"}
for k, v in KIT_TEXT.items():
    text.setdefault(k, v)

# clips the builder flags for a human listen (truncation-prone shapes)
ear = set()
if os.path.exists(VOLIST):
    md = io.open(VOLIST, encoding="utf-8").read()
    if "EAR-CHECK" in md:
        blk = md.split("EAR-CHECK", 1)[1].split("## All clips", 1)[0]
        ear = set(re.findall(r"- `(vo_\w+)`", blk))

TYPE_NAME = {"MATRA_PAIRS": "Meet the pair", "MATRA_BUILD": "Build the word", "MEET_PAIR": "Word examples",
             "TRAIN_TAP": "Tap the coach", "TRAIN_SORT": "Sort into coaches", "WORD_BUILD": "Complete the word",
             "SENTENCE_COMPLETE": "Complete the sentence", "MINI_GAME": "Runner game", "CELEBRATION": "Celebration"}
ROLE = {"prompt": "page instruction - plays as the page opens",
        "hint1": "hint after the 1st wrong try", "hint2": "hint after the 2nd wrong try",
        "hint3": "hint after the 3rd wrong try (names the answer)", "correct": "correct answer",
        "outro": "closing line", "base": "the base word", "onset": "the letter takes the matra",
        "matra_name": "names the matra", "result": "the new word", "sounds": "sounds the word out"}
FIELD = {("MATRA_PAIRS", "pairs", "audio"): "letter and its matra",
         ("MEET_PAIR", "examples", "audio_line"): "example line",
         ("TRAIN_TAP", "coaches", "audio"): "coach word, said as the coaches appear",
         ("TRAIN_SORT", "bins", "audio"): "coach label, read out",
         ("TRAIN_SORT", "cards", "audio"): "card name, said as the card appears / is tapped",
         ("TRAIN_SORT", "cards", "correct_audio"): "correct - this card",
         ("TRAIN_SORT", "cards", "hint2_audio"): "hint after the 2nd wrong try - this card",
         ("TRAIN_SORT", "cards", "hint3_audio"): "hint after the 3rd wrong try - this card",
         ("WORD_BUILD", "options", "audio"): "letter tile",
         ("WORD_BUILD", "slots", "name_audio"): "picture name",
         ("WORD_BUILD", "slots", "correct_audio"): "correct - this coach",
         ("WORD_BUILD", "slots", "hint3_audio"): "hint after the 3rd wrong try - this coach",
         ("SENTENCE_COMPLETE", "options", "audio"): "option word",
         ("SENTENCE_COMPLETE", "options", "sentence_audio"): "the sentence read with this option"}


def item_name(o):
    for k in ("word", "letter", "label", "text", "t"):
        if isinstance(o.get(k), str) and o[k]:
            return o[k]
    return ""


uses = collections.defaultdict(list)          # id -> [(page, sort-order, description)]
roles = collections.defaultdict(set)


def add(cid, page, order, desc, role):
    uses[cid].append((page, order, desc)); roles[cid].add(role)


# the card-level clips: the start screen and the three transitions
add(card.get("landing_audio"), 0, 0, "Start screen - Swifty's greeting", "start")
pin = (card.get("gate") or {}).get("at") or {}
first_of = {}
for i, s in enumerate(slides):
    first_of.setdefault(s["phase"], i + 1)
for ph, cid in (card.get("phase_transition_audio") or {}).items():
    rnd = {"practice": "round3"}.get(ph, ph)
    at = next((i + 1 for i, s in enumerate(slides) if s["id"] == pin.get(rnd)), None) or first_of.get(ph)
    title = {"tutorial": "«चलिए, शुरू करें!»", "guided": "«चलिए, साथ में करें!»",
             "practice": "«अब आपकी बारी!»"}.get(ph, ph)
    add(cid, at, -1, "Transition %s - Swifty, before page %d" % (title, at), "transition")

for i, s in enumerate(slides):
    page, T = i + 1, s["type"]
    demo = bool((s.get("data") or {}).get("demo"))
    for k, cid in (s.get("audio") or {}).items():
        if cid in declared:
            desc = ROLE.get(k, k)
            if T == "MINI_GAME" and k == "prompt":
                desc = "page instruction - the lesson speaks it as the game page opens"
            add(cid, page, 0 if k == "prompt" else 5, desc, k)
    d = s.get("data") or {}
    for grp, items in d.items():
        if isinstance(items, dict) and grp == "phonemes":
            for m, cid in items.items():
                if cid in declared:
                    add(cid, page, 2, "the matra's sound (%s)" % m, "phoneme")
        if not isinstance(items, list):
            continue
        for it in items:
            if not isinstance(it, dict):
                continue
            for f, cid in it.items():
                if isinstance(cid, str) and cid in declared:
                    desc = FIELD.get((T, grp, f), "%s.%s" % (grp, f))
                    if demo and f == "correct_audio":
                        desc = "explains the move, after the hand drops the card"
                    elif demo and f == "audio":
                        desc = "card name, said as it appears and again as the hand picks it up"
                    nm = item_name(it)
                    add(cid, page, 3, desc + (" (%s)" % nm if nm else ""), f)


def category(cid):
    r = roles[cid]
    if "start" in r: return "Start screen"
    if "transition" in r: return "Transition"
    if cid == "vo_cel_prompt": return "Celebration"
    if r & {"hint1", "hint2", "hint3", "hint2_audio", "hint3_audio"}: return "Hint"
    if r & {"correct", "correct_audio"}: return "Feedback"
    if "prompt" in r: return "Instruction"
    if r & {"audio", "name_audio", "phoneme", "onset", "base", "result", "matra_name"}: return "Word / sound"
    return "Explanation"


def duration(path):
    try:
        o = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "default=nw=1:nk=1", path], capture_output=True, text=True).stdout
        return round(float(o.strip()), 2)
    except Exception:
        return None


def page_label(p):
    if p == 0: return "Start"
    s = slides[p - 1]
    return "%d" % p


vo_ids = [c for c in declared if c.startswith("vo_")]
rows = []
for cid in vo_ids:
    u = sorted(uses.get(cid, []))
    path = os.path.join(BUILD, declared[cid])
    dur = duration(path) if os.path.exists(path) else None
    if dur is None: status = "MISSING - record"
    elif not u: status = "Recorded - not played in this lesson"
    elif cid in ear: status = "Recorded - EAR-CHECK"
    else: status = "Recorded"
    if cid in KIT_TEXT: status += " (shared kit clip)"
    pages = sorted({p for p, _, _ in u})
    where = "; ".join("%s: %s" % ("Start" if p == 0 else "p%d" % p, dsc) for p, _, dsc in u) or \
            "only as a fallback wrong-answer line - no page uses it now"
    rows.append(dict(id=cid, file=os.path.basename(declared[cid]), text=text.get(cid, ""),
                     pages=", ".join(page_label(p) for p in pages), first=(pages[0] if pages else 999,
                     min((o for _, o, _ in u), default=9)), cat=category(cid) if u else "Unused",
                     where=where, dur=dur, status=status))
rows.sort(key=lambda r: (r["first"], r["id"]))

# ---- workbook --------------------------------------------------------------------------------
thin = Side(style="thin", color="C9CED6"); box = Border(left=thin, right=thin, top=thin, bottom=thin)
hfill = PatternFill("solid", fgColor="1F4E79"); DEV = "Nirmala UI"
FILL = {"Start screen": "EDE7F6", "Transition": "EEE8FB", "Instruction": "E8F1FB", "Hint": "FDF1E4",
        "Feedback": "EAF6EC", "Word / sound": "FFF8DC", "Explanation": "F3F7FB", "Celebration": "FCE8F1",
        "Unused": "F2F2F2"}


def sheet(ws, title, sub, head, widths, data, dev_cols=(), wrap_cols=(), center=(), fill_of=None, red=None):
    ws.append([title]); ws["A1"].font = Font(bold=True, size=14, color="1F4E79")
    ws.append([sub]); ws["A2"].font = Font(italic=True, size=10, color="555555")
    ws.append([]); ws.append(head)
    for c in range(1, len(head) + 1):
        cell = ws.cell(row=4, column=c)
        cell.font = Font(bold=True, color="FFFFFF"); cell.fill = hfill; cell.border = box
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
    for vals, meta in data:
        ws.append(vals); r = ws.max_row
        for c in range(1, len(head) + 1):
            cell = ws.cell(row=r, column=c); cell.border = box
            if fill_of: cell.fill = PatternFill("solid", fgColor=fill_of(meta))
            cell.alignment = Alignment(vertical="center", wrap_text=(c in wrap_cols),
                                       horizontal="center" if c in center else "left")
            if c in dev_cols: cell.font = Font(name=DEV, size=12 if c == dev_cols[0] else 10,
                                               bold=(c == dev_cols[0]))
        if red and red(meta):
            ws.cell(row=r, column=len(head)).font = Font(bold=True, color="B03A2E")
    for c, w in enumerate(widths, 1):
        ws.column_dimensions[get_column_letter(c)].width = w
    ws.freeze_panes = "C5"
    ws.auto_filter.ref = "A4:%s%d" % (get_column_letter(len(head)), ws.max_row)


wb = Workbook()
ws = wb.active; ws.title = "VO Manifest"
n_ok = sum(1 for r in rows if r["status"].startswith("Recorded"))
sheet(ws, "मात्राओं की रेल (HI02H11_L02_S02) - lesson voice-over manifest",
      "Every page except the runner game's own voice (see runner_vo_manifest.xlsx). Folder: "
      "3_CURRENT_BUILD/assets/Audio/  ·  Gemini TTS, voice Leda  ·  -16 LUFS  ·  %d clips, %d recorded  ·  "
      "see 'Recording spec'" % (len(rows), n_ok),
      ["S.No", "Audio ID", "File name", "Hindi script (spoken exactly)", "Category", "Page(s)",
       "Where / when it plays", "Duration (s)", "Status"],
      [6, 20, 22, 46, 14, 9, 66, 11, 30],
      [([i, r["id"], r["file"], r["text"], r["cat"], r["pages"], r["where"], r["dur"], r["status"]], r)
       for i, r in enumerate(rows, 1)],
      dev_cols=(4, 7), wrap_cols=(4, 7), center=(1, 6, 8), fill_of=lambda r: FILL.get(r["cat"], "FFFFFF"),
      red=lambda r: not r["status"].startswith("Recorded") or "EAR-CHECK" in r["status"] or "not played" in r["status"])

# ---- sound effects ---------------------------------------------------------------------------
SFX = {"sfx_play_button": ("Play button on the start screen", "Start"),
       "sfx_next_button": ("Next arrow, and the arrow on the celebration screen (real presses only)", "all"),
       "sfx_fb_correct": ("Correct answer, on every activity page", "6-17"),
       "sfx_fb_incorrect": ("Wrong answer, on every activity page", "6-17"),
       "sfx_train_move": ("The train's chug as it arrives / leaves, on every train page", "train pages"),
       "sfx_whistle": ("The train's whistle, on every train page", "train pages"),
       "sfx_celebrate": ("Celebration screen", "19"),
       "sfx_train_arrive": ("NOT PLAYED - removed from the lesson on request (r65); file kept", ""),
       "sfx_correct": ("NOT PLAYED - replaced by sfx_fb_correct", ""),
       "sfx_wrong": ("NOT PLAYED - replaced by sfx_fb_incorrect", ""),
       "sfx_tap": ("NOT PLAYED - the tap is a synthesised tone", ""),
       "sfx_pop": ("NOT PLAYED - the drop is a synthesised tone", "")}
sf = []
for cid in sorted(c for c in declared if c.startswith("sfx_")):
    what, pages = SFX.get(cid, ("", ""))
    path = os.path.join(BUILD, declared[cid])
    dur = duration(path) if os.path.exists(path) else None
    st = "MISSING" if dur is None else ("On disk - not played" if what.startswith("NOT") else "In use")
    sf.append(([cid, os.path.basename(declared[cid]), what, pages, dur, st], st))
sf.sort(key=lambda x: (x[1] != "In use", x[0][0]))
sheet(wb.create_sheet("Sound effects"), "Sound effects (copied / supplied - not recorded)",
      "The runner game's own music and effects are not listed here.",
      ["Audio ID", "File name", "What it is / where it plays", "Page(s)", "Duration (s)", "Status"],
      [22, 24, 70, 12, 11, 22], [([None] if False else v, st) for v, st in sf], wrap_cols=(3,), center=(4, 5),
      fill_of=lambda st: "EAF6EC" if st == "In use" else "F2F2F2", red=lambda st: st != "In use")

# ---- page order ------------------------------------------------------------------------------
po = []
po.append((["Start", "-", "Start screen", "-", "", ", ".join(c for c in [card.get("landing_audio")] if c)], "s"))
for i, s in enumerate(slides):
    p = i + 1
    clips = sorted({cid for cid, us in uses.items() for pg, _, _ in us if pg == p and cid.startswith("vo_")
                    and cid not in KIT_TEXT})
    gate = [cid for cid in KIT_TEXT if any(pg == p for pg, o, _ in uses.get(cid, []) if o == -1)]
    if gate:
        po.append((["-", "-", "Transition", "-", "", gate[0]], "t"))
    label = TYPE_NAME.get(s["type"], s["type"]) + (" (watch only)" if (s.get("data") or {}).get("demo") else "")
    po.append(([p, s["id"], label, s["phase"], s.get("prompt_hi", ""), ", ".join(clips)], "p"))
sheet(wb.create_sheet("Page order"), "Page order - what each page says",
      "Transitions are shown where they play.",
      ["Page", "Slide ID", "Screen", "Round", "Heading on screen", "Clips on this page"],
      [7, 9, 26, 11, 50, 90], po, dev_cols=(5,), wrap_cols=(5, 6), center=(1, 2, 4),
      fill_of=lambda k: {"t": "EEE8FB", "s": "EDE7F6"}.get(k, "FFFFFF"))

# ---- recording spec --------------------------------------------------------------------------
sp = wb.create_sheet("Recording spec")
cnt = collections.Counter(r["cat"] for r in rows)
spec = [("मात्राओं की रेल - recording spec", None), ("", None),
        ("Scope", "The whole lesson (start screen, 19 pages, transitions, celebration) except the runner "
                  "game's own voice, which has its own manifest (runner_vo_manifest.xlsx). The lesson's "
                  "instruction on the game page (vo_mg_prompt) is in this one."),
        ("Clips", "%d voice clips: " % len(rows) + ", ".join("%s %d" % (k, v) for k, v in sorted(cnt.items()))),
        ("Folder", "3_CURRENT_BUILD/assets/Audio/<Audio ID>.ogg - the file name is the Audio ID; the lesson "
                   "finds clips by it"),
        ("Voice", "Gemini TTS, voice Leda - one narrator for every clip. The three transition lines are "
                  "shared kit recordings."),
        ("Format", "24 kHz mono; leading/trailing silence trimmed; -16 LUFS"),
        ("Register", "आप form throughout - the build fails if a तुम form appears in any clip."),
        ("Script", "Record exactly the text in column D; the same text is shown on screen where a line is shown."),
        ("EAR-CHECK", "%d clips are in shapes the TTS tends to cut short (an em-dash before a short last word, "
                      "several short danda-separated pieces) - listen to each: %s" % (len(ear), ", ".join(sorted(ear)))),
        ("Re-recording", "Keep the same file name. The build stamps the lesson's audio with a content hash, so "
                         "a new take reaches browsers after the next deploy."),
        ("Regenerate", "PYTHONUTF8=1 python 1_SPEC/gen_lesson_vo_manifest.py")]
for a, b in spec:
    sp.append([a, b] if b is not None else [a]); r = sp.max_row
    sp.cell(row=r, column=1).font = Font(bold=True, size=14 if r == 1 else 11, color="1F4E79" if b is None else "000000")
    if b is not None:
        sp.cell(row=r, column=2).font = Font(name=DEV, size=11)
        sp.cell(row=r, column=2).alignment = Alignment(wrap_text=True, vertical="top")
        sp.cell(row=r, column=1).alignment = Alignment(vertical="top")
sp.column_dimensions["A"].width = 16; sp.column_dimensions["B"].width = 120

wb.save(OUT)
print("  wrote", OUT)
print("  %d VO clips (%d recorded, %d missing, %d ear-check, %d not played) + %d sound effects | %s"
      % (len(rows), n_ok, sum(1 for r in rows if r["status"].startswith("MISSING")),
         sum(1 for r in rows if "EAR-CHECK" in r["status"]), sum(1 for r in rows if "not played" in r["status"]),
         len(sf), dict(cnt)))
