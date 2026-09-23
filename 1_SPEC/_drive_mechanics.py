# -*- coding: utf-8 -*-
"""Drive every mechanic (wrong -> wrong -> right) and capture the SETTLED state of each screen.

Two things this does that capture_pages.py cannot right now:
  · it strips EVERY `*seq-hidden` variant (`mb-seq-hidden`, `tr-seq-hidden`), not just the bare
    `.seq-hidden` the shipped harness removes, so a staged teach screen photographs finished;
  · it stubs `play()` so a missing clip returns instantly instead of sitting out say()'s 9-second
    fallback — with 61 clips still to record, an un-stubbed run never reaches the end of a chain.
"""
import io, json, sys, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.action_chains import ActionChains

URL, OUT, SHOTS = sys.argv[1], sys.argv[2], sys.argv[3]

STUB = """
window.__log = [];
(function(){
  const o = window.play;
  window.play = function(src, onEnd){ window.__log.push(String(src)); if(onEnd) setTimeout(onEnd, 20); };
  window.__origPlay = o;
})();
try{ document.documentElement.style.setProperty('--scale','1'); }catch(e){}
const st=document.createElement('style'); st.id='__cap';
st.textContent='*{animation:none !important;transition:none !important;caret-color:transparent !important;}';
document.head.appendChild(st);
"""

SETTLE = """
document.querySelectorAll('[class]').forEach(function(e){
  [...e.classList].forEach(function(c){ if(/seq-hidden$/.test(c)) e.classList.remove(c); });
});
document.querySelectorAll('.mb-panel,.mb-arrow,.mb-cons,.mb-matra,.mb-syl,.cp-side,.cp-vs')
  .forEach(function(e){ e.classList.add('mb-in'); });
document.querySelectorAll('.mp-card,.mp-pic,.mp-callout').forEach(function(e){ e.classList.add('mp-in'); });
document.querySelectorAll('.mi-pair').forEach(function(e){ e.classList.remove('is-dim'); });
"""

CLICK = """
const el = arguments[0];
const r = el.getBoundingClientRect();
const x = r.left + r.width/2, y = r.top + r.height/2;
['mousedown','mouseup','click'].forEach(function(t){
  el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y}));
});
"""

def drag(tile, zone):
    """A REAL pointer drag through the CDP input pipeline.

    Synthetic MouseEvents are not enough here: makeDraggable resolves its drop target with
    document.elementFromPoint, so the drag has to move an actual cursor, not just fire events at
    coordinates."""
    ActionChains(d).click_and_hold(tile).pause(0.15).move_to_element(zone).pause(0.15)         .move_by_offset(1, 1).pause(0.1).release().perform()

o = Options()
for a in ("--headless=new", "--window-size=1400,900", "--force-device-scale-factor=2",
          "--autoplay-policy=no-user-gesture-required", "--mute-audio", "--hide-scrollbars"):
    o.add_argument(a)
o.set_capability("goog:loggingPrefs", {"browser": "ALL"})
d = webdriver.Chrome(options=o)
d.set_window_size(1400, 900)
d.get(URL)
time.sleep(2.5)
d.execute_script(STUB)
# START THROUGH THE REAL GATE. mountSlide() can jump to any slide, but until शुरू करें is pressed
# the body keeps `is-start` and the stage is not interactive: getBoundingClientRect still returns
# sensible numbers while elementFromPoint returns the stage itself, so makeDraggable never finds
# its .dd-zone and every drag silently does nothing. Taps look fine throughout, because a tap is
# dispatched on the element and never hit-tests — which is exactly what made this read as a
# drag-only bug in the module rather than a harness one.
d.find_element("id", "sgBtn").click()
time.sleep(4.0)
d.execute_script(STUB)          # re-stub: the gate reloads state

rep = []


def note(s):
    rep.append(s)
    print(s)


def shot(name):
    d.execute_script(SETTLE)
    time.sleep(0.25)
    d.save_screenshot("%s/%s" % (SHOTS, name))


def mount(i):
    d.execute_script("mountSlide(arguments[0]);", i)
    time.sleep(1.2)
    d.execute_script("window.__log=[];")


def el(sel, n=0):
    e = d.find_elements("css selector", sel)
    return e[n] if len(e) > n else None


def logs():
    return d.execute_script("return window.__log.slice();")


slides = d.execute_script("return CARD.slides.map(s=>({id:s.id,type:s.type,phase:s.phase}));")
shot("01_landing.png")

for i, s in enumerate(slides):
    mount(i)
    t, sid = s["type"], s["id"]

    if t == "TRAIN_TAP":
        coaches = d.find_elements("css selector", ".train-coach")
        right = d.execute_script(
            "return [...document.querySelectorAll('.train-coach')].findIndex("
            "  (c,i)=>CARD.slides[arguments[0]].data.coaches[i].correct);", i)
        wrongs = [c for n, c in enumerate(coaches) if n != right]
        d.execute_script(CLICK, wrongs[0]); time.sleep(0.6)
        a1 = logs(); hand1 = d.execute_script("return document.querySelectorAll('.train-coach.is-nudge').length;")
        d.execute_script("window.__log=[];")
        d.execute_script(CLICK, wrongs[1]); time.sleep(0.8)
        a2 = logs(); hand2 = d.execute_script("return document.querySelectorAll('.train-coach.is-nudge').length;")
        d.execute_script("window.__log=[];")
        d.execute_script(CLICK, coaches[right]); time.sleep(0.9)
        a3 = logs()
        nav = d.execute_script("return !document.getElementById('navBtn').classList.contains('disabled')"
                               " && !document.getElementById('navBtn').disabled;")
        ov = d.execute_script("return document.querySelectorAll('.tr-word .mh-ov').length;")
        note("%-4s %-18s miss1 vo=%s hand=%d | miss2 vo=%s hand=%d | win vo=%s matraHL=%d nav=%s"
             % (sid, t, a1, hand1, a2, hand2, a3, ov, nav))

    elif t == "SENTENCE_COMPLETE":
        ans = d.execute_script("return CARD.slides[arguments[0]].data.answer;", i)
        opts = d.find_elements("css selector", ".sc-opt")
        right = d.execute_script(
            "return [...document.querySelectorAll('.sc-opt')].findIndex(o=>o.dataset.word===arguments[0]);", ans)
        wrongs = [c for n, c in enumerate(opts) if n != right]
        d.execute_script(CLICK, wrongs[0]); time.sleep(0.7)
        a1 = logs(); nudge1 = d.execute_script("return document.querySelectorAll('.sc-opt.sc-nudge').length;")
        d.execute_script("window.__log=[];")
        d.execute_script(CLICK, wrongs[1]); time.sleep(0.9)
        a2 = logs(); nudge2 = d.execute_script("return document.querySelectorAll('.sc-opt.sc-nudge').length;")
        hand = d.execute_script("var n=document.getElementById('nudgeHand');"
                                "return !!(n && n.classList.contains('show'));")
        d.execute_script("window.__log=[];")
        d.execute_script(CLICK, opts[right]); time.sleep(0.9)
        a3 = logs()
        filled = d.execute_script("var b=document.querySelector('.sc-blank');"
                                  "return b ? b.textContent.trim() : null;")
        nav = d.execute_script("return !document.getElementById('navBtn').classList.contains('disabled');")
        note("%-4s %-18s miss1 vo=%s glow=%d | miss2 vo=%s glow=%d hand=%s | win vo=%s blank=%r nav=%s"
             % (sid, t, a1, nudge1, a2, nudge2, hand, a3, filled, nav))

    elif t == "TRAIN_SORT":
        d.execute_script("state.revealing=false;"
                         "document.querySelectorAll('.tr-card').forEach(c=>c.classList.remove('tr-seq-hidden'));")
        tiles = d.find_elements("css selector", ".tr-card")
        bodies = d.find_elements("css selector", ".tr-body")
        bins = d.execute_script("return CARD.slides[arguments[0]].data.bins.map(b=>b.key);", i)
        t0 = tiles[0]
        want = t0.get_attribute("data-bin")
        wrong_i = 0 if bins[0] != want else 1
        drag(t0, bodies[wrong_i]); time.sleep(0.7)
        a1 = logs(); h1 = d.execute_script("return document.querySelectorAll('.train-coach.is-nudge').length;")
        d.execute_script("window.__log=[];")
        drag(t0, bodies[wrong_i]); time.sleep(0.9)
        a2 = logs(); h2 = d.execute_script("return document.querySelectorAll('.train-coach.is-nudge').length;")
        d.execute_script("window.__log=[];")
        ok_i = bins.index(want)
        drag(t0, bodies[ok_i]); time.sleep(0.8)
        a3 = logs()
        snapped = d.execute_script("return document.querySelectorAll('.tr-card.snapped').length;")
        # finish the rest
        for tl in d.find_elements("css selector", ".tr-card:not(.snapped)"):
            wb = tl.get_attribute("data-bin")
            drag(tl, d.find_elements("css selector", ".tr-body")[bins.index(wb)])
            time.sleep(0.5)
        d.execute_script("window.__log=[];"); time.sleep(0.8)
        done = d.execute_script("return {snap:document.querySelectorAll('.tr-card.snapped').length,"
                                "finish:!!document.querySelector('.train-shell.complete'),"
                                "nav:!document.getElementById('navBtn').classList.contains('disabled')};")
        note("%-4s %-18s miss1 vo=%s hand=%d | miss2 vo=%s hand=%d | win vo=%s snapped=%d | all=%s"
             % (sid, t, a1, h1, a2, h2, a3, snapped, json.dumps(done)))

    elif t == "WORD_BUILD":
        tiles = d.find_elements("css selector", ".tr-card")
        # blanks are addressed by data-idx, never by position: a completed coach REPLACES its
        # split form with the whole word, so the .wb-blank list shrinks as the screen is solved.
        def blank(n):
            e = d.find_elements("css selector", ".wb-blank[data-idx='%d']" % n)
            return e[0] if e else None
        slots = d.execute_script("return CARD.slides[arguments[0]].data.slots;", i)
        # the tray is shuffled, so tiles[0] may be the DISTRACTOR — drive a tile that has a home
        t0, ak, home = None, None, None
        for tl in tiles:
            a_ = tl.get_attribute("data-akshar")
            h_ = next((n for n, s2 in enumerate(slots) if a_ + s2["tail"] == s2["word"]), None)
            if h_ is not None:
                t0, ak, home = tl, a_, h_
                break
        bad = next(n for n in range(len(slots)) if n != home)
        drag(t0, blank(bad)); time.sleep(0.7)
        a1 = logs(); h1 = d.execute_script("return document.querySelectorAll('.train-coach.is-nudge').length;")
        d.execute_script("window.__log=[];")
        drag(t0, blank(bad)); time.sleep(0.9)
        a2 = logs()
        h2 = d.execute_script("return {coach:document.querySelectorAll('.train-coach.is-nudge').length,"
                              "blank:document.querySelectorAll('.wb-blank.wb-pulse').length};")
        d.execute_script("window.__log=[];")
        drag(t0, blank(home)); time.sleep(1.0)
        a3 = logs()
        w1 = d.execute_script("return [...document.querySelectorAll('.tr-doneword')].map(e=>e.dataset.mhWord||e.textContent);")
        for tl in d.find_elements("css selector", ".tr-card:not(.snapped)"):
            ak2 = tl.get_attribute("data-akshar")
            hm = next((n for n, s2 in enumerate(slots) if ak2 + s2["tail"] == s2["word"]), None)
            if hm is None:
                continue
            z = blank(hm)
            if z is None:
                continue
            drag(tl, z); time.sleep(0.9)
        time.sleep(1.0)
        fin = d.execute_script("return {words:[...document.querySelectorAll('.tr-doneword')]"
                               ".map(e=>e.dataset.mhWord||e.textContent),"
                               "ov:document.querySelectorAll('.tr-doneword .mh-ov').length,"
                               "finish:!!document.querySelector('.train-shell.complete'),"
                               "nav:!document.getElementById('navBtn').classList.contains('disabled')};")
        note("%-4s %-18s miss1 vo=%s hand=%d | miss2 vo=%s nudge=%s | win vo=%s built=%s | all=%s"
             % (sid, t, a1, h1, a2, json.dumps(h2), a3, w1, json.dumps(fin)))

    else:
        note("%-4s %-18s (teach / celebration — render only)" % (sid, t))

    shot("%02d_%s.png" % (i + 2, t))

sev = [l for l in d.get_log("browser") if l["level"] == "SEVERE"
       and ".ogg" not in l["message"] and "favicon" not in l["message"]]
rep.append("\n--- non-audio SEVERE console entries: %d ---" % len(sev))
for l in sev:
    rep.append("  " + l["message"][:300])
d.quit()
io.open(OUT, "w", encoding="utf-8").write("\n".join(rep))
print("\nwrote", OUT)
