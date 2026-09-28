# -*- coding: utf-8 -*-
"""Compose and render the runner's background music: an ORIGINAL upbeat loop.

Yasir asked for music "just like Subway Surfers, kid friendly, not dull". Subway Surfers' theme
is someone else's copyrighted work, so nothing here borrows from it - this is a new piece in the
same spirit: a bouncy, bright, mid-tempo groove (112 BPM), punchy drums with a clap on 2 and 4,
a bouncing octave bass, off-beat chord stabs pumped by the kick, and a catchy, singable lead on
top. C major throughout, over the brightest common progression there is (C - G - Am - F).

FORM, 32 bars (68.6 s), so a level does not hear the same eight bars on repeat:
    A  bars  1-8   the groove and the main tune
    B  bars  9-16  the hook: higher, busier hats, bells answering the lead
    C  bars 17-24  a breakdown (no kick, a pad and bells) that builds back up with a riser
    D  bars 25-32  everything, the hook again, and a drum fill that runs straight into bar 1

SEAMLESS LOOP. The piece is rendered twice end to end and the SECOND pass is kept. Everything that
rings over the barline at the end of the loop (reverb, delay, the crash) is then already present
at the start of the kept copy, exactly as it would be when the loop wraps - so the file is
circular to the sample and loops without a click.

Run:  python 1_SPEC/gen_bgm.py      -> 3_CURRENT_BUILD/assets/MatraRunner/bgm_run.ogg (+ a .wav proof)
"""
import os, subprocess, wave
import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "MatraRunner", "bgm_run.ogg")
# the 16-bit master is only a step on the way to the .ogg - 12 MB that nothing ships - so it is
# written to the temp folder, not into the repo (set BGM_KEEP_WAV=1 to keep it for listening)
import tempfile
PROOF = os.path.join(tempfile.gettempdir(), "bgm_run_master.wav")

SR = 44100
BPM = 112
BEAT = 60.0 / BPM
S16 = BEAT / 4
BAR = BEAT * 4
BARS = 32
LOOP = BAR * BARS
rng = np.random.default_rng(7)          # fixed seed: the same file every time


def mf(m):
    return 440.0 * 2 ** ((m - 69) / 12.0)


NOTE = {}
for o in range(1, 8):
    for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]):
        NOTE["%s%d" % (n, o)] = 12 * (o + 1) + i


# ---------------------------------------------------------------- building blocks
def env_adsr(n, a, d, s, r_start, r):
    """a/d/r in seconds, s level; r_start = when the release begins (s)."""
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), s + (1 - s) * np.exp(-(t - a) / max(d, 1e-4)))
    rel = np.clip((t - r_start) / max(r, 1e-4), 0, 1)
    return e * (1 - rel) ** 2


def phase_of(freq, n, vib=0.0, vib_rate=5.5, vib_delay=0.09):
    t = np.arange(n) / SR
    depth = vib * np.clip((t - vib_delay) / 0.15, 0, 1)
    f = freq * (1 + depth * np.sin(2 * np.pi * vib_rate * t))
    return 2 * np.pi * np.cumsum(f) / SR


def additive(ph, f0, amp_of_k, top=15000):
    """band-limited: harmonics only up to `top` Hz, so high notes do not alias"""
    kmax = max(1, int(top / f0))
    out = np.zeros_like(ph)
    for k in range(1, kmax + 1):
        a = amp_of_k(k)
        if a:
            out += a * np.sin(k * ph)
    return out


def saw(ph, f0):
    return additive(ph, f0, lambda k: 1.0 / k) * (2 / np.pi)


def pulse(ph, f0, duty):
    return additive(ph, f0, lambda k: (2 / (k * np.pi)) * np.sin(np.pi * k * duty)) * 1.4


def lp(x, fc, order=2):
    sos = signal.butter(order, min(fc, SR * 0.45), "low", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def hp(x, fc, order=2):
    sos = signal.butter(order, fc, "high", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], "band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


# ---------------------------------------------------------------- instruments (mono)
def kick(vel=1.0):
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 44 + 120 * np.exp(-t / 0.035)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    click = lp(rng.standard_normal(n), 3500) * np.exp(-t / 0.004) * 0.35
    return np.tanh(1.6 * (body + click)) * vel


def clap(vel=1.0):
    n = int(0.32 * SR); t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 900, 5200)
    e = np.zeros(n)
    for dt in (0.0, 0.011, 0.022):            # the three hands that make a clap a clap
        e += np.where(t >= dt, np.exp(-(t - dt) / 0.009), 0)
    e += np.where(t >= 0.03, np.exp(-(t - 0.03) / 0.11), 0) * 0.8
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.04) * 0.4
    return (nz * e * 0.55 + body) * vel


def snare(vel=1.0):
    n = int(0.22 * SR); t = np.arange(n) / SR
    nz = bp(rng.standard_normal(n), 1500, 8000) * np.exp(-t / 0.06)
    body = np.sin(2 * np.pi * 210 * t) * np.exp(-t / 0.05)
    return (nz * 0.6 + body * 0.5) * vel


def hat(vel=1.0, open_=False):
    d = 0.16 if open_ else 0.028
    n = int((0.5 if open_ else 0.08) * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500, 3) * np.exp(-t / d) * vel


def shaker(vel=1.0):
    n = int(0.09 * SR); t = np.arange(n) / SR
    e = (t / 0.012).clip(0, 1) * np.exp(-t / 0.035)
    return bp(rng.standard_normal(n), 4500, 11000) * e * vel


def crash(vel=1.0):
    n = int(2.4 * SR); t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 4000, 2) * np.exp(-t / 0.7) * vel


def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR
    nz = rng.standard_normal(n)
    out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):             # a noise band sweeping up, in short steps
        fc = 400 + 7000 * (i / n) ** 2
        out[i:i + seg] = bp(nz[i:i + seg], fc, min(fc * 1.8, 16000), 1)
    return out * (t / dur) ** 2


def bass_note(m, dur, vel=1.0):
    f = mf(m); n = int((dur + 0.08) * SR)
    ph = phase_of(f, n)
    raw = saw(ph, f)
    bright, dark = lp(raw, 1800), lp(raw, 420)
    t = np.arange(n) / SR
    mix = np.exp(-t / 0.07)                 # the filter closing: a pluck, not a drone
    tone = bright * mix + dark * (1 - mix)
    sub = np.sin(ph) * 0.7
    return (tone * 0.6 + sub) * env_adsr(n, 0.004, 0.25, 0.55, dur, 0.06) * vel


def stab(ms, dur=0.2, vel=1.0):
    n = int((dur + 0.25) * SR); out = np.zeros(n)
    for m in ms:
        for det in (-0.08, 0.08):
            f = mf(m) * 2 ** (det / 12)
            out += saw(phase_of(f, n), f)
    out = lp(out / len(ms), 3200)
    return out * env_adsr(n, 0.003, 0.09, 0.25, dur, 0.1) * vel


def pad(ms, dur, vel=1.0):
    n = int((dur + 0.6) * SR); out = np.zeros(n)
    for m in ms:
        for det in (-0.12, 0.0, 0.12):
            f = mf(m) * 2 ** (det / 12)
            out += saw(phase_of(f, n), f)
    out = lp(out / (len(ms) * 3), 1400)
    return out * env_adsr(n, 0.35, 0.8, 0.8, dur, 0.5) * vel


def lead_note(m, dur, vel=1.0):
    """a bright pulse lead with a little vibrato, and a sine an octave up for sparkle"""
    f = mf(m); n = int((dur + 0.12) * SR)
    ph = phase_of(f, n, vib=0.006)
    tone = pulse(ph, f, 0.28) * 0.7 + saw(ph, f) * 0.3
    tone = lp(tone, 5200)
    tone += np.sin(2 * ph) * 0.18
    return tone * env_adsr(n, 0.006, 0.18, 0.72, dur, 0.07) * vel


def bell(m, dur=0.35, vel=1.0):
    """marimba-ish: a sine with a fast-fading bright partial on the strike"""
    f = mf(m); n = int((dur + 0.4) * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * f * t
    tone = np.sin(ph) * np.exp(-t / 0.35) + 0.5 * np.sin(4 * ph) * np.exp(-t / 0.05) \
         + 0.2 * np.sin(10 * ph) * np.exp(-t / 0.015)
    return tone * (t / 0.002).clip(0, 1) * vel


# ---------------------------------------------------------------- the score
CHORDS = [  # (stab voicing, pad voicing, bass root)
    (["C4", "E4", "G4"], ["C3", "G3", "E4"], "C2"),
    (["B3", "D4", "G4"], ["G2", "D3", "B3"], "G1"),
    (["C4", "E4", "A4"], ["A2", "E3", "C4"], "A1"),
    (["C4", "F4", "A4"], ["F2", "C3", "A3"], "F1"),
]
ARP = [  # chord tones for the bells, per chord, octave 5/6
    ["C5", "E5", "G5", "C6"], ["B4", "D5", "G5", "B5"], ["C5", "E5", "A5", "C6"], ["C5", "F5", "A5", "C6"],
]

MOT_A = ["E5 - G5 E5 . C5 D5 E5", "D5 - B4 D5 . G5 - .", "C5 - E5 A5 . G5 E5 .", "F5 E5 D5 C5 . D5 - ."]
MOT_A2 = ["E5 - G5 E5 . C5 D5 E5", "D5 - B4 D5 . G5 - .", "C5 - E5 A5 . B5 C6 .", "A5 - G5 - E5 - D5 ."]
HOOK = ["G5 G5 . E5 G5 . A5 G5", ". D6 - B5 . G5 - .", "A5 A5 . G5 A5 . C6 A5", ". G5 - F5 E5 . D5 ."]
HOOK2 = ["G5 G5 . E5 G5 . A5 G5", ". D6 - B5 . G5 - .", "A5 A5 . G5 A5 . C6 D6", "E6 - D6 C6 D6 - . ."]
CALM = ["C6 - - - G5 - - -", "B5 - - - D6 - - -", "C6 - - - E6 - - -", "A5 - - - - - . ."]

SECTION = (["A"] * 8) + (["B"] * 8) + (["C"] * 8) + (["D"] * 8)
LEAD_BARS = (MOT_A + MOT_A2 + HOOK + HOOK2 + [None] * 4 + CALM + MOT_A + HOOK2)


def parse_bar(line):
    """8th-note grid; '-' holds the previous note, '.' is a rest -> [(step16, midi, len16)]"""
    toks = line.split(); out = []; cur = None
    for i, tk in enumerate(toks):
        if tk == "-":
            if cur: cur[2] += 2
            continue
        if cur: out.append(tuple(cur)); cur = None
        if tk != ".":
            cur = [i * 2, NOTE[tk], 2]
    if cur: out.append(tuple(cur))
    return out


def render():
    total = int(LOOP * 2 * SR) + SR * 3
    dry = np.zeros((2, total)); pump = np.zeros((2, total)); verb = np.zeros((2, total))
    dly = np.zeros(total)
    kicks = []

    def put(buf, t, x, pan=0.0, gain=1.0):
        i = int(round(t * SR)); j = min(buf.shape[-1], i + len(x))
        if j <= i: return
        l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
        buf[0, i:j] += x[:j - i] * gain * l * 1.414
        buf[1, i:j] += x[:j - i] * gain * r * 1.414

    for rep in range(2):
        for b in range(BARS):
            t0 = (rep * BARS + b) * BAR
            sec = SECTION[b]; ch = CHORDS[b % 4]
            last_of_8 = (b % 8) == 7
            # ---- drums -------------------------------------------------------------
            breakdown = sec == "C" and b < 20
            build = sec == "C" and b >= 20
            if not breakdown:
                kpat = [0, 4, 8, 12] if build else ([0, 7, 8, 11] if sec in "AB" else [0, 7, 8, 11, 14])
                for s in kpat:
                    put(dry, t0 + s * S16, kick(0.95), 0, 0.9); kicks.append(t0 + s * S16)
            for s in (4, 12):
                put(dry, t0 + s * S16, clap(0.9 if not breakdown else 0.55), 0.0, 0.42)
                put(verb, t0 + s * S16, clap(0.6), 0.0, 0.12)
            hat_steps = range(0, 16, 2) if sec in ("A", "C") else range(16)
            for s in hat_steps:
                v = (0.9 if s % 4 == 2 else 0.55) * (0.7 if breakdown else 1)
                put(dry, t0 + s * S16, hat(v), 0.25, 0.11)
            if sec in ("B", "D"):
                for s in (6, 14):
                    put(dry, t0 + s * S16, hat(0.7, True), 0.3, 0.07)
            for s in range(16):
                put(dry, t0 + s * S16, shaker(0.9 if s % 2 else 0.5), -0.35, 0.045)
            if last_of_8 and not breakdown:          # the fill into the next section
                for k, s in enumerate((12, 13, 14, 15)):
                    put(dry, t0 + s * S16, snare(0.5 + 0.15 * k), 0.1, 0.35)
            if b in (0, 8, 24) or (b == 16):
                put(verb, t0, crash(0.9 if b != 16 else 0.5), 0.2, 0.22)
            if b == 22:
                put(dry, t0, riser(BAR * 2), 0.0, 0.10)
            # ---- bass -------------------------------------------------------------
            root = NOTE[ch[2]]
            if breakdown:
                put(pump, t0, bass_note(root, BAR * 0.95, 0.9), 0, 0.34)
            else:
                for s, oct_ in ((0, 0), (2, 0), (4, 12), (6, 0), (8, 0), (10, 12), (12, 7), (14, 12)):
                    put(pump, t0 + s * S16, bass_note(root + oct_, S16 * 1.8, 0.95 if s in (0, 8) else 0.8),
                        0, 0.34)
            # ---- chords -----------------------------------------------------------
            stab_ms = [NOTE[x] for x in ch[0]]
            if sec in ("A", "B", "D") or build:
                for s in (2, 6, 10, 14):
                    put(pump, t0 + s * S16, stab(stab_ms, 0.16, 0.9), -0.2 if s % 4 == 2 else 0.2, 0.16)
                    put(verb, t0 + s * S16, stab(stab_ms, 0.16, 0.9), 0, 0.05)
            if sec == "C" or sec == "D":
                pd = pad([NOTE[x] for x in ch[1]], BAR, 1.0)
                put(pump, t0, pd, 0, 0.13 if sec == "C" else 0.07)
                put(verb, t0, pd, 0, 0.05)
            # ---- bells: answering the lead in B and D, carrying the breakdown in C ------
            if sec in ("B", "C", "D"):
                arp = ARP[b % 4]
                steps = range(16) if sec == "C" else [s for s in range(16) if s % 2 == 1]
                for i, s in enumerate(steps):
                    m = NOTE[arp[i % 4]] + (12 if sec == "D" and i % 8 >= 4 else 0)
                    put(dry, t0 + s * S16, bell(m, 0.3, 0.8), 0.45 if i % 2 else -0.45,
                        0.05 if sec != "C" else 0.07)
                    put(verb, t0 + s * S16, bell(m, 0.3, 0.8), 0, 0.03)
            # ---- lead ---------------------------------------------------------------
            line = LEAD_BARS[b]
            if line:
                calm = sec == "C"
                for s, m, ln in parse_bar(line):
                    x = lead_note(m, ln * S16 * 0.92, 0.9)
                    if calm:
                        x = bell(m, ln * S16, 1.0) * 1.2
                    put(dry, t0 + s * S16, x, 0.0, 0.2)
                    put(verb, t0 + s * S16, x, 0.0, 0.07)
                    i = int(round((t0 + s * S16) * SR)); j = min(total, i + len(x))
                    dly[i:j] += x[:j - i] * 0.2

    # ---- the kick's pump on bass/chords/pad -----------------------------------------------
    tt = np.arange(total) / SR
    side = np.ones(total)
    for k in kicks:
        i = int(k * SR); j = min(total, i + int(0.3 * SR))
        seg = tt[i:j] - k
        side[i:j] = np.minimum(side[i:j], 1 - 0.6 * np.exp(-seg / 0.09))
    pump *= side
    # ---- delay: dotted eighth, ping-pong ----------------------------------------------------
    d = int(BEAT * 0.75 * SR); echo = np.zeros((2, total)); src = dly.copy()
    for k in range(1, 5):
        g = 0.38 ** k
        sh = np.zeros(total); sh[d * k:] = src[:total - d * k]
        echo[(k + 1) % 2] += lp(sh, 4500) * g
    # ---- reverb: a synthetic hall, convolved once ------------------------------------------
    n_ir = int(1.8 * SR); tir = np.arange(n_ir) / SR
    ir = [lp(rng.standard_normal(n_ir), 6000) * np.exp(-tir / 0.45) for _ in range(2)]
    wet = np.stack([signal.fftconvolve(verb[c], ir[c])[:total] for c in range(2)]) * 0.25
    mix = dry + pump + echo + wet
    mix = np.stack([hp(mix[c], 32) for c in range(2)])
    # ---- keep the SECOND pass: circular to the sample ---------------------------------------
    a = int(round(LOOP * SR)); loop = mix[:, a:2 * a]
    # normalise FIRST, then glue: the raw sum peaks several times over full scale, and a tanh
    # applied to that saturated the whole mix into a square wave (measured RMS -5 dBFS, crest 4 dB)
    loop /= np.max(np.abs(loop))
    loop = np.tanh(loop * 1.3) / np.tanh(1.3)            # gentle glue on the peaks only
    loop *= 10 ** (-1.0 / 20) / np.max(np.abs(loop))    # peak at -1 dBFS
    return loop


def main():
    y = render()
    os.makedirs(os.path.dirname(PROOF), exist_ok=True)
    pcm = (np.clip(y.T, -1, 1) * 32767).astype("<i2")
    with wave.open(PROOF, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", PROOF, "-c:a", "libvorbis", "-q:a", "3", OUT],
                   check=True)
    if not os.environ.get("BGM_KEEP_WAV"):
        os.remove(PROOF)
    rms = 20 * np.log10(np.sqrt(np.mean(y ** 2)))
    for name, b0, b1 in (("A", 0, 8), ("B", 8, 16), ("C breakdown", 16, 20), ("C build", 20, 24), ("D", 24, 32)):
        seg = y[:, int(b0 * BAR * SR):int(b1 * BAR * SR)]
        print("    section %-12s RMS %.1f dBFS" % (name, 20 * np.log10(np.sqrt(np.mean(seg ** 2)))))
    print("    crest factor %.1f dB (a mixed track sits around 10-14)" % (-1.0 - rms))
    edge = np.abs(y[:, 0] - y[:, -1]).max()
    print("  %d bars at %d BPM = %.2f s  |  RMS %.1f dBFS  |  loop edge jump %.4f"
          % (BARS, BPM, LOOP, rms, edge))
    print("  wrote", OUT, "%.0f KB" % (os.path.getsize(OUT) / 1024))


if __name__ == "__main__":
    main()
