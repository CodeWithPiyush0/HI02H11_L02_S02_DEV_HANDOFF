# -*- coding: utf-8 -*-
"""Cut a seamless loop out of Yasir's game_bgm1.mp3 for the runner.

The file he supplied is 11 min 15 s and 11.6 MB - two pieces joined by a gap at 1:34, the second
with two much louder passages (from ~3:56 and ~8:02). A level lasts a couple of minutes and an
11-minute file cannot loop cleanly, so the runner plays a LOOP cut from the steady stretch of the
second piece:

  tempo ~94 BPM (spectral-flux autocorrelation), a bar = 2.553 s
  the loop: 1:52.128 -> 3:44.450, exactly 44 bars (112.3 s) - chosen out of every start / whole-bar
  length in 1:40-3:52 as the pair whose 8 s around the seam sound most alike (0.966 similarity on a
  24-band spectral fingerprint), then aligned to the sample by cross-correlating the waveforms
  around the end, and joined with a 0.4 s equal-power crossfade

The level is left exactly as he mastered it - "60 % volume" is applied in the game, as a gain.

Run:  python 1_SPEC/prepare_bgm_loop.py   -> 3_CURRENT_BUILD/assets/MatraRunner/bgm_game.ogg
"""
import os, subprocess
import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "1_SPEC", "game_art_src", "bgm", "game_bgm1.mp3")
OUT = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "MatraRunner", "bgm_game.ogg")
SR = 44100
START, END = 112.128, 224.450
XF = 0.40


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, "<f4").reshape(-1, 2).T.copy()


def main():
    x = decode(SRC)
    s = int(round(START * SR)); e = int(round(END * SR))
    # sample-accurate: slide the end +-25 ms to where the waveform best continues the start
    m = x.mean(0); n = int(0.08 * SR); ref = m[s:s + n]
    best, be = -1e9, e
    for de in range(-int(0.025 * SR), int(0.025 * SR)):
        seg = m[e + de:e + de + n]
        c = float(seg @ ref) / (np.linalg.norm(seg) * np.linalg.norm(ref) + 1e-9)
        if c > best: best, be = c, e + de
    e = be
    xf = int(XF * SR)
    loop = x[:, s:e].copy()
    t = np.linspace(0, np.pi / 2, xf)
    fin, fout = np.sin(t), np.cos(t)          # equal power: no dip in the middle of the seam
    loop[:, :xf] = x[:, s:s + xf] * fin + x[:, e:e + xf] * fout
    wav = os.path.join(os.path.dirname(OUT), "_bgm_loop.wav")
    pcm = np.clip(loop.T, -1, 1)
    import wave
    with wave.open(wav, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((pcm * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-c:a", "libvorbis", "-q:a", "4", OUT], check=True)
    os.remove(wav)
    clipped = int((np.abs(loop) >= 1.0).sum())
    wrap = np.abs(loop[:, -1] - loop[:, 0]).max()
    print("  loop %.3f s (%d bars at 94 BPM), end aligned by %+.1f ms (corr %.3f)"
          % (loop.shape[1] / SR, round((e - s) / SR / (240 / 94)), (be - int(round(END * SR))) / SR * 1000, best))
    print("  samples at/over full scale in the source cut: %d   |   wrap step %.4f" % (clipped, wrap))
    print("  wrote", OUT, "%.0f KB" % (os.path.getsize(OUT) / 1024))


if __name__ == "__main__":
    main()
