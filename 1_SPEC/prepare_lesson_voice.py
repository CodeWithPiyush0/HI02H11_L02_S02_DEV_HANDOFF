# -*- coding: utf-8 -*-
"""The lesson's voice from recorded WAVs: trim, level, write.

Source : 1_SPEC/game_art_src/lesson_voice/source_wav/<id>.wav   (one per clip, named by Audio ID)
Output : 3_CURRENT_BUILD/assets/Audio/<id>.ogg
Backup : 1_SPEC/game_art_src/lesson_voice/gemini_backup/  (the TTS takes these replaced)

Per clip:
  trim   - dead air off both ends (below -45 dBFS), keeping 30 ms before the voice and 120 ms
           after it, so a line starts the moment the page asks for it
  level  - to -16 LUFS integrated, the lesson's VO level; a look-ahead peak limiter at -1 dBFS
           catches the odd sharp consonant, so one peak cannot keep a whole line quiet
  write  - 16-bit PCM WAV, mono, 24 kHz, under the .ogg name the lesson has always used. Browsers
           read the content, not the extension; and the builder measures the page cues (page 1's
           highlight, pages 2 / 4 sound steps, pages 3 / 5 picture + matra moments) by reading these
           files as WAV, so they must stay WAV.

Run:  PYTHONUTF8=1 python 1_SPEC/prepare_lesson_voice.py   then rebuild
"""
import os, re, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "1_SPEC", "game_art_src", "lesson_voice", "source_wav")
OUT = os.path.join(HERE, "3_CURRENT_BUILD", "assets", "Audio")
TARGET, PEAK_MAX = -16.0, -1.0
TRIM = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,"
        "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse")


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
    if not wavs:
        sys.exit("no WAVs in " + SRC)
    for f in wavs:
        cid = os.path.splitext(f)[0]
        src = os.path.join(SRC, f)
        lufs, peak = measure(src, TRIM)
        gain = TARGET - lufs
        gain = min(gain, PEAK_MAX - peak + 6.0)    # at most 6 dB of limiting on any clip
        dst = os.path.join(OUT, cid + ".ogg")
        ff(["-y", "-i", src, "-af", "%s,volume=%.2fdB,alimiter=limit=%.4f:attack=2:release=40:level=disabled"
            % (TRIM, gain, 10 ** (PEAK_MAX / 20)),
            "-ac", "1", "-ar", "24000", "-c:a", "pcm_s16le", "-f", "wav", dst])
        l2, p2 = measure(dst)
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                  "-of", "csv=p=0", dst], capture_output=True, text=True).stdout)
        print("  %-20s %5.2f s   %6.1f -> %6.1f LUFS   peak %5.1f dBFS" % (cid, d, lufs, l2, p2))
    print("  %d clips written to %s" % (len(wavs), OUT))


if __name__ == "__main__":
    main()
