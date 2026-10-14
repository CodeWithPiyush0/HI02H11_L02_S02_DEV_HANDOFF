# -*- coding: utf-8 -*-
"""[r134] Re-cut five of the lesson's HUMAN recordings instead of re-voicing them (the source WAVs in
1_SPEC/game_art_src/lesson_voice/source_wav/; the originals are kept in source_wav_pre_r134/).

  vo_landing        «हेलो दोस्त! मैं हूँ स्विफ्टी।» (its first two phrases) + the whole of page 1's
                    «आज हम छोटी उ और बड़ी ऊ की मात्रा वाले शब्द पढ़ेंगे।» (vo_t1_prompt) - same speaker
  vo_meet_<word>    «गुड़, | बोलकर देखिए। | इसमें ग पर … लगी है।»  ->  word + matra sentence + «बोलकर देखिए।»
  vo_g4_h2_<word>   only its first sentence: «आलू में बड़ी ऊ की मात्रा है।» (the «अब यही मात्रा ऊपर
                    डिब्बों पर खोजिए …» sentence is cut)

Phrases are found by their pauses (runs of sound separated by >= 220 ms of quiet), cuts are made in the
middle of a pause with 8 ms fades, and the join gaps copy the speaker's own pauses. Idempotent: it
always works from the backed-up originals. Then run prepare_lesson_voice.py and rebuild.
"""
import array, os, shutil, subprocess, wave

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "1_SPEC", "game_art_src", "lesson_voice", "source_wav")
BAK = os.path.join(HERE, "1_SPEC", "game_art_src", "lesson_voice", "source_wav_pre_r134")
SR = 24000


def load(name):
    p = os.path.join(BAK, name + ".wav")
    if not os.path.isfile(p):                         # first run: back the original up
        os.makedirs(BAK, exist_ok=True)
        shutil.copy2(os.path.join(SRC, name + ".wav"), p)
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
                       capture_output=True, check=True)
    a = array.array("h"); a.frombytes(r.stdout); return a


def runs(a, quiet=0.22, rel=0.06):
    hop = int(SR * 0.01); peak = max(abs(v) for v in a)
    loud = [max(abs(v) for v in a[i:i + hop]) > peak * rel for i in range(0, len(a) - hop, hop)]
    out, i, minq = [], 0, int(quiet / 0.01)
    while i < len(loud):
        if loud[i]:
            j, q, last = i, 0, i
            while j < len(loud) and q < minq:
                j += 1
                if j < len(loud) and loud[j]: q, last = 0, j
                else: q += 1
            out.append((i * hop, (last + 1) * hop)); i = j
        else:
            i += 1
    return out


def piece(a, s, e):
    s, e = max(0, int(s)), min(len(a), int(e))
    seg = array.array("h", a[s:e]); f = int(SR * 0.008)
    for k in range(min(f, len(seg))):
        g = k / f; seg[k] = int(seg[k] * g); seg[-1 - k] = int(seg[-1 - k] * g)
    return seg


def silence(ms):
    return array.array("h", [0]) * int(SR * ms / 1000)


def save(name, a):
    with wave.open(os.path.join(SRC, name + ".wav"), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(a.tobytes())
    print("  %-18s %.2f s" % (name, len(a) / SR))


def main():
    pad = int(SR * 0.12)
    # ---- the cover: «हेलो दोस्त! मैं हूँ स्विफ्टी।» + page 1's line
    L, T = load("vo_landing"), load("vo_t1_prompt")
    rl, rt = runs(L), runs(T)
    assert len(rl) == 3 and len(rt) == 3, (rl, rt)
    gap = (rl[2][0] - rl[1][1])                        # her own pause before the 3rd phrase
    out = piece(L, 0, rl[1][1] + pad) + silence(max(0, gap / SR * 1000 - 240)) + piece(T, rt[0][0] - pad, len(T))
    save("vo_landing", out)

    # ---- pages 3 / 5: word, matra sentence, then «बोलकर देखिए।»
    for w in ("gud", "dhanush", "doodh", "kabootar"):
        n = "vo_meet_" + w
        a = load(n); r = runs(a)
        assert len(r) >= 3, (n, r)
        A, B, C0, C1 = r[0], r[1], r[2][0], r[-1][1]
        g1 = (B[0] - A[1]) / SR * 1000                  # her pause after the word
        g2 = (C0 - B[1]) / SR * 1000                    # her pause between the two sentences
        out = (piece(a, 0, A[1] + pad) + silence(max(60, g1 - 240)) +
               piece(a, C0 - pad, C1 + pad) + silence(max(120, g2 - 240)) +
               piece(a, B[0] - pad, B[1] + int(SR * 0.25)))
        save(n, out)

    # ---- page 11, rung 2: the first sentence only (it ends at the first pause of 400 ms or more)
    for w in ("aaloo", "sui", "gud", "sooraj"):
        n = "vo_g4_h2_" + w
        a = load(n); r = runs(a)
        k = next(i for i in range(len(r) - 1) if (r[i + 1][0] - r[i][1]) >= SR * 0.40)
        # cut just before «अब», not just after the detected end: the closing «है» is spoken softly and
        # reads as quiet, so an end-based cut clipped it (verified by transcription); the voice prep
        # trims the silence that is left
        save(n, piece(a, 0, r[k + 1][0] - int(SR * 0.12)))


if __name__ == "__main__":
    main()
