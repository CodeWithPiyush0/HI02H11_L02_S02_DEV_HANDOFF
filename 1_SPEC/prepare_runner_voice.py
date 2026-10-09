# -*- coding: utf-8 -*-
"""The runner game's voice from recorded WAVs: trim, level, encode.

Source : 1_SPEC/game_art_src/runner_voice/source_wav/<id>.wav   (one per clip, named by Audio ID)
Output : 3_CURRENT_BUILD/assets/MatraRunner/voice/<id>.ogg

Per clip:
  trim   - dead air off both ends (below -45 dBFS), keeping 30 ms before the voice and 90 ms
           after it, so a word starts the moment the game asks for it
  level  - to -16 LUFS integrated, the lesson's VO level; a look-ahead peak limiter
           at -3 dBFS catches the odd sharp consonant, so one peak cannot keep a whole word quiet
  encode - Ogg Vorbis, mono, 24 kHz, q4 (the format the game has always used)

Run:  PYTHONUTF8=1 python 1_SPEC/prepare_runner_voice.py
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "1_SPEC", "game_art_src", "runner_voice", "source_wav")
OUT = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "MatraRunner", "voice")
TARGET, PEAK_MAX = -16.0, -3.0   # -3, not -1: Vorbis overshoots sharp consonants by up to 1.5 dB
TRIM = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.09,areverse")


def ff(args):
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats"] + args, capture_output=True, text=True).stderr


def measure(path, pre=""):
    # padded with silence: a clip under 0.4 s is shorter than one loudness block and would read
    # as -70 LUFS; the meter's gate ignores the silence, so the padding does not change the value
    af = (pre + "," if pre else "") + "apad=pad_dur=1,ebur128=peak=sample,volumedetect"
    e = ff(["-i", path, "-af", af, "-f", "null", "-"])
    lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", e)[-1])
    peak = float(re.findall(r"max_volume: (-?[\d.]+) dB", e)[-1])
    return lufs, peak


def main():
    wavs = sorted(f for f in os.listdir(SRC) if f.lower().endswith(".wav"))
    # [r112] `prepare_runner_voice.py tut_jump hit ...` prepares ONLY those clips, so adding a line
    # does not re-encode every recording the game already ships
    only = set(sys.argv[1:])
    if only:
        wavs = [f for f in wavs if os.path.splitext(f)[0] in only]
    if not wavs:
        sys.exit("no WAVs in " + SRC)
    for f in wavs:
        cid = os.path.splitext(f)[0]
        src = os.path.join(SRC, f)
        lufs, peak = measure(src, TRIM)
        gain = TARGET - lufs
        gain = min(gain, PEAK_MAX - peak + 6.0)    # at most 6 dB of limiting on any clip
        dst = os.path.join(OUT, cid + ".ogg")
        ff(["-y", "-i", src, "-af", "%s,volume=%.2fdB,alimiter=limit=%.4f:attack=2:release=40:level=disabled" % (TRIM, gain, 10 ** (PEAK_MAX / 20)),
            "-ac", "1", "-ar", "24000", "-c:a", "libvorbis", "-q:a", "4", dst])
        l2, p2 = measure(dst)
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                  "-of", "csv=p=0", dst], capture_output=True, text=True).stdout)
        print("  %-11s %5.2f s   %6.1f -> %6.1f LUFS   peak %5.1f dBFS" % (cid, d, lufs, l2, p2))
    print("  %d clips written to %s" % (len(wavs), OUT))


if __name__ == "__main__":
    main()
