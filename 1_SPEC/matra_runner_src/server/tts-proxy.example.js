/**
 * tts-proxy.example.js — बनाओ-एक-बार स्क्रिप्ट (batch), ब्राउज़र के लिए नहीं।
 *
 * क्यों: API key कभी भी index.html में मत डालिए। खेल का HTML हर बच्चे के ब्राउज़र
 * में खुलता है, और key वहीं से पढ़ी जा सकती है। इसलिए आवाज़ यहाँ, अपने कंप्यूटर पर,
 * एक बार बनाइए और सिर्फ़ .mp3 फ़ाइलें खेल के साथ भेजिए।
 *
 * चलाने का तरीका:
 *   1) इस फ़ोल्डर में:  cp .env.example .env   और .env में अपनी key भरिए
 *   2) node tts-proxy.example.js
 *   3) बनी हुई फ़ाइलें ../assets/audio/ में चली जाएँगी
 *
 * ध्यान: .env को कभी git में commit मत कीजिए।
 */

const fs = require("fs");
const path = require("path");

// --- सेटिंग ---------------------------------------------------------------
const API_KEY = process.env.GEMINI_API_KEY;        // .env से आता है, कोड में कभी नहीं
const MODEL   = process.env.TTS_MODEL || "PUT_TTS_MODEL_HERE";
const VOICE   = process.env.TTS_VOICE || "PUT_VOICE_NAME_HERE";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const OUT_DIR = path.join(__dirname, "..", "assets", "audio");
const MANIFEST = path.join(OUT_DIR, "manifest.json");

// मॉडल और आवाज़ के नाम समय के साथ बदलते हैं — चलाने से पहले Google AI की
// ताज़ा TTS डॉक्युमेंटेशन में नाम देख लीजिए और ऊपर .env में भर दीजिए।

if (!API_KEY) {
  console.error("GEMINI_API_KEY नहीं मिली। .env बनाइए (देखिए .env.example)।");
  process.exit(1);
}

const wait = ms => new Promise(r => setTimeout(r, ms));

async function synthesise(text) {
  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } }
      }
    })
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const data = await res.json();
  const part = (data.candidates?.[0]?.content?.parts || []).find(p => p.inlineData);
  if (!part) throw new Error("जवाब में ऑडियो नहीं मिला");
  return Buffer.from(part.inlineData.data, "base64");
}

(async () => {
  const items = JSON.parse(fs.readFileSync(MANIFEST, "utf8")).items;
  let made = 0, skipped = 0;

  for (const it of items) {
    const out = path.join(OUT_DIR, it.file);
    if (fs.existsSync(out)) { skipped++; continue; }          // दोबारा नहीं बनाता
    try {
      const audio = await synthesise(it.text);
      fs.writeFileSync(out, audio);
      made++;
      console.log(`✓ ${it.file}  ${it.text}`);
      await wait(400);                                        // rate limit का ध्यान
    } catch (e) {
      console.error(`✗ ${it.file}  ${e.message}`);
    }
  }
  console.log(`\nबनीं: ${made}, पहले से थीं: ${skipped}, कुल: ${items.length}`);
  console.log("कई TTS API WAV भेजते हैं। तब फ़ाइलें .wav होंगी — ffmpeg से mp3 बना लीजिए:");
  console.log("  for f in *.wav; do ffmpeg -i \"$f\" \"${f%.wav}.mp3\"; done");
})();
