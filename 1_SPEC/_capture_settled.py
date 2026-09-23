# -*- coding: utf-8 -*-
"""Capture every screen in its INITIAL state, with staged reveals settled.

capture_pages.py strips only the bare `.seq-hidden`; this lesson's modules use `mb-seq-hidden` and
`tr-seq-hidden`, and with 61 clips still unrecorded the audio-driven reveal chain cannot finish
inside the harness's wait (say() falls back to a 9-second timer per clip). Both together mean the
teach screens photograph half-painted. This strips every *seq-hidden variant and applies the
settled classes, so each page is shot as the child sees it once the screen has finished arriving —
and before anything has been answered.
"""
import sys, time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

URL, SHOTS = sys.argv[1], sys.argv[2]
FREEZE = ("window.play=function(s,e){ if(e) setTimeout(e,15); };"
          "var s=document.createElement('style');s.id='__cap';"
          "s.textContent='*{animation:none !important;transition:none !important;"
          "caret-color:transparent !important;}';document.head.appendChild(s);")
SETTLE = """
document.querySelectorAll('[class]').forEach(function(e){
  [...e.classList].forEach(function(c){ if(/seq-hidden$/.test(c)) e.classList.remove(c); });
});
document.querySelectorAll('.mb-panel,.mb-arrow,.mb-cons,.mb-matra,.mb-syl').forEach(function(e){ e.classList.add('mb-in'); });
document.querySelectorAll('.mp-card,.mp-pic,.mp-callout').forEach(function(e){ e.classList.add('mp-in'); });
document.querySelectorAll('.mi-pair').forEach(function(e){ e.classList.remove('is-dim'); });
"""
o = Options()
for a in ("--headless=new", "--window-size=1400,900", "--force-device-scale-factor=2",
          "--autoplay-policy=no-user-gesture-required", "--mute-audio", "--hide-scrollbars"):
    o.add_argument(a)
d = webdriver.Chrome(options=o)
d.set_window_size(1400, 900)
d.get(URL); time.sleep(2.5)
d.execute_script(FREEZE); time.sleep(0.4)
d.save_screenshot("%s/01_landing.png" % SHOTS); print("  shot 01_landing.png")
d.find_element("id", "sgBtn").click(); time.sleep(3.5)
d.execute_script(FREEZE)
n = d.execute_script("return CARD.slides.length")
for i in range(n):
    d.execute_script("mountSlide(arguments[0]);", i); time.sleep(4.0)   # the train takes 3.4s to pull in and park
    d.execute_script(SETTLE); time.sleep(0.35)
    t = d.execute_script("return CARD.slides[arguments[0]].type;", i)
    name = "%02d_%s.png" % (i + 2, t)
    d.save_screenshot("%s/%s" % (SHOTS, name)); print("  shot", name)
d.quit()
print("done — %d pages" % (n + 1))
