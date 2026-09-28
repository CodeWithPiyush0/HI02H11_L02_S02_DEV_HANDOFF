# HI02H11_L02_S02 (भाग 1 — उ / ऊ) · «मात्राओं की रेल» — VO recording list (ROUND 3)

126 clips. Shown text == spoken text; record exactly this.

**Register is आप** — the SME asked for it twice, in as many words. Round 2 was तुम, so most of this list is a re-record, not a new line. `guard_register` in the builder fails the build if a तुम form survives anywhere.

**Only re-record what changed.** The builder deletes exactly the clips whose text moved this round, so `gen_tts.py` (which skips ids that already have a file) regenerates precisely those and leaves every unchanged take alone. Never `--force` the whole card: generated audio is non-deterministic, so re-running an unchanged clip returns a different take — a change the SME never asked for.

## ⚠️ EAR-CHECK — 4 clips a human must listen to before delivery

The TTS model truncates a clip when an **em-dash precedes a short final word** (measured on this lesson: em-dash 0.73–1.05 s vs comma 1.53–2.21 s for the same words), and it does the same to a line built from several short danda-separated pieces. The SME's round-3 MEET_PAIR lines and the new sound-differentiation clips are written in exactly those shapes. Their wording ships as written — rewriting a reviewer's Hindi to dodge a synthesis bug is the worse failure — so the clips are flagged instead. **Truncation is invisible to an existence check and to a file-size check.** `_verify_assets.py` compares each clip against peers of similar text length and is the only thing that catches it. Run it, then listen to every id below.

- `vo_pair_u` — यह है उ। इसकी मात्रा है — ु।
- `vo_pair_uu` — यह है ऊ। इसकी मात्रा है — ू।
- `vo_sounds_phool` — फ। फू। फूल।
- `vo_sounds_pul` — प। पु। पुल।

## All clips

| clip id | spoken text |
|---|---|
| `vo_ak_pa` | पा |
| `vo_ak_phool` | फू |
| `vo_ak_pul` | पु |
| `vo_ak_sui` | सु |
| `vo_base_pal` | यह शब्द देखिए, पल। |
| `vo_base_phal` | यह शब्द देखिए, फल। |
| `vo_cel_prompt` | शाबाश! आज हमने सीखा, छोटी उ और बड़ी ऊ की मात्रा पहचानना, और मात्रा वाले शब्द पढ़ना। |
| `vo_g1_correct` | शाबाश! पुल शब्द में छोटी उ की मात्रा है। |
| `vo_g1_h3` | देखिए, पुल में छोटी उ की मात्रा है। पुल पर टैप कीजिए। |
| `vo_g2_correct` | शाबाश! फूल शब्द में बड़ी ऊ की मात्रा है। |
| `vo_g2_h3` | देखिए, फूल में बड़ी ऊ की मात्रा है। फूल पर टैप कीजिए। |
| `vo_g3_correct` | शाबाश! सुई शब्द में छोटी उ की मात्रा है। |
| `vo_g3_h3` | देखिए, सुई में छोटी उ की मात्रा है। सुई पर टैप कीजिए। |
| `vo_g4_h1` | फिर से पढ़िए। शब्द में कौन-सी मात्रा है, देखिए और उसे उसी मात्रा वाले डिब्बे में डालिए। |
| `vo_g4_h2_aaloo` | आलू में बड़ी ऊ की मात्रा है। अब यही मात्रा ऊपर डिब्बों पर खोजिए और शब्द वहीं डालिए। |
| `vo_g4_h2_gud` | गुड़ में छोटी उ की मात्रा है। अब यही मात्रा ऊपर डिब्बों पर खोजिए और शब्द वहीं डालिए। |
| `vo_g4_h2_sooraj` | सूरज में बड़ी ऊ की मात्रा है। अब यही मात्रा ऊपर डिब्बों पर खोजिए और शब्द वहीं डालिए। |
| `vo_g4_h2_sui` | सुई में छोटी उ की मात्रा है। अब यही मात्रा ऊपर डिब्बों पर खोजिए और शब्द वहीं डालिए। |
| `vo_g4_h3_aaloo` | आलू को बड़ी ऊ की मात्रा वाले डिब्बे में डालिए। |
| `vo_g4_h3_gud` | गुड़ को छोटी उ की मात्रा वाले डिब्बे में डालिए। |
| `vo_g4_h3_sooraj` | सूरज को बड़ी ऊ की मात्रा वाले डिब्बे में डालिए। |
| `vo_g4_h3_sui` | सुई को छोटी उ की मात्रा वाले डिब्बे में डालिए। |
| `vo_g4_prompt` | हर शब्द को उसकी सही मात्रा वाले डिब्बे में डालिए। |
| `vo_g5_h1` | फिर से देखिए। मात्रा को ध्यान से देखिए और उसे सही डिब्बे में डालिए। |
| `vo_g5_h2` | उ की मात्रा ु है और ऊ की मात्रा ू है। अब मात्रा को सही डिब्बे में डालिए। |
| `vo_g5_h3_u` | छोटी उ की मात्रा को उ वाले डिब्बे में डालिए. |
| `vo_g5_h3_uu` | बड़ी ऊ की मात्रा को ऊ वाले डिब्बे में डालिए. |
| `vo_g5_prompt` | सही मात्रा को उसके सही डिब्बे में डालिए। |
| `vo_landing` | हेलो दोस्त! मैं हूँ स्विफ्टी। आज हम मात्राओं के बारे में जानेंगे। |
| `vo_letter_u` | उ |
| `vo_letter_uu` | ऊ |
| `vo_matra_u` | छोटी उ की मात्रा |
| `vo_matra_uu` | बड़ी ऊ की मात्रा |
| `vo_meet_dhanush` | धनुष, बोलकर देखिए। इसमें न पर छोटी उ की मात्रा लगी है। |
| `vo_meet_doodh` | दूध, बोलकर देखिए। इसमें द पर बड़ी ऊ की मात्रा लगी है। |
| `vo_meet_gud` | गुड़, बोलकर देखिए। इसमें ग पर छोटी उ की मात्रा लगी है। |
| `vo_meet_kabootar` | कबूतर, बोलकर देखिए। इसमें ब पर बड़ी ऊ की मात्रा लगी है। |
| `vo_mg_prompt` | अब एक खेल! ऊपर दी गई मात्रा वाले शब्द के द्वार से निकलिए। |
| `vo_name_aaloo` | आलू |
| `vo_name_doodh` | दूध |
| `vo_name_gud` | गुड़ |
| `vo_name_kabootar` | कबूतर |
| `vo_name_khush` | खुश |
| `vo_name_mukut` | मुकुट |
| `vo_name_phool` | फूल |
| `vo_name_pul` | पुल |
| `vo_name_sooraj` | सूरज |
| `vo_name_subah` | सुबह |
| `vo_name_sui` | सुई |
| `vo_name_tarbooj` | तरबूज |
| `vo_ok_aaloo` | शाबाश! आलू शब्द में ऊ की मात्रा है। |
| `vo_ok_gud` | शाबाश! गुड़ शब्द में उ की मात्रा है। |
| `vo_ok_matra_u` | शाबाश! यह उ की मात्रा है। |
| `vo_ok_matra_uu` | शाबाश! यह ऊ की मात्रा है। |
| `vo_ok_sooraj` | शाबाश! सूरज शब्द में ऊ की मात्रा है। |
| `vo_ok_sui` | शाबाश! सुई शब्द में उ की मात्रा है। |
| `vo_okp_kabootar` | शाबाश! कबूतर में ऊ की मात्रा है। |
| `vo_okp_mukut` | शाबाश! मुकुट में उ की मात्रा है। |
| `vo_okp_pul` | शाबाश! पुल में उ की मात्रा है। |
| `vo_okp_tarbooj` | शाबाश! तरबूज में ऊ की मात्रा है। |
| `vo_onset_phool` | फ के साथ बड़ी ऊ की मात्रा लगाने पर फू बनता है। |
| `vo_onset_pul` | प के साथ छोटी उ की मात्रा लगाने पर पु बनता है। |
| `vo_p1_h1` | फिर से देखिए। चित्र का नाम सोचिए और देखिए शब्द पूरा करने के लिए कौन-सा अक्षर लगेगा। |
| `vo_p1_h2` | नाम ध्यान से सुनिए। जिस शब्द की शुरुआत इस अक्षर से होती है, उसी डिब्बे में इसे डालिए। |
| `vo_p1_h3_any` | जो अक्षर चमक रहा है, उसे उसी डिब्बे में डालिए। |
| `vo_p1_h3_phool` | फू को फूल वाले डिब्बे में डालिए। फू, ल… फूल। |
| `vo_p1_h3_pul` | पु को पुल वाले डिब्बे में डालिए। पु, ल… पुल। |
| `vo_p1_h3_sui` | सु को सुई वाले डिब्बे में डालिए। सु, ई… सुई। |
| `vo_p1_prompt` | चित्र देखकर सही अक्षर से शब्द पूरा कीजिए। |
| `vo_p2_h1` | फिर से सुनिए। चित्र का नाम ध्यान से सुनिए और देखिए उसमें कौन-सी मात्रा है। |
| `vo_p2_h2_kabootar` | कबूतर में बड़ी ऊ की मात्रा है। अब इसे सही मात्रा वाली बोगी में डालिए। |
| `vo_p2_h2_mukut` | मुकुट में छोटी उ की मात्रा है। अब इसे सही मात्रा वाली बोगी में डालिए। |
| `vo_p2_h2_pul` | पुल में छोटी उ की मात्रा है। अब इसे सही मात्रा वाली बोगी में डालिए। |
| `vo_p2_h2_tarbooj` | तरबूज में बड़ी ऊ की मात्रा है। अब इसे सही मात्रा वाली बोगी में डालिए। |
| `vo_p2_h3_kabootar` | कबूतर को बड़ी ऊ की मात्रा वाली बोगी में डालिए। |
| `vo_p2_h3_mukut` | मुकुट को छोटी उ की मात्रा वाली बोगी में डालिए। |
| `vo_p2_h3_pul` | पुल को छोटी उ की मात्रा वाली बोगी में डालिए। |
| `vo_p2_h3_tarbooj` | तरबूज को बड़ी ऊ की मात्रा वाली बोगी में डालिए। |
| `vo_p2_prompt` | चित्र को सुनिए और उसे सही मात्रा वाली बोगी में डालिए। |
| `vo_p3_correct` | शाबाश! सीमा आज बहुत खुश है। |
| `vo_p3_h1` | फिर से पढ़िए। चित्र देखिए, सीमा कैसी दिख रही है? सही शब्द चुनकर वाक्य पूरा कीजिए। |
| `vo_p3_h3` | सीमा आज बहुत खुश है। खुश चुनिए। |
| `vo_p3_try_khush` | सीमा आज बहुत खुश है। |
| `vo_p3_try_phool` | सीमा आज बहुत फूल है। |
| `vo_p3_try_tarbooj` | सीमा आज बहुत तरबूज है। |
| `vo_p4_correct` | शाबाश! मैंने सही शब्द चुनकर वाक्य पूरा किया। |
| `vo_p4_h1` | फिर से पढ़िए। चित्र देखिए, बच्चा कब उठ रहा है? सही शब्द चुनकर वाक्य पूरा कीजिए। |
| `vo_p4_h3` | मैं सुबह जल्दी उठता हूँ। सुबह चुनिए। |
| `vo_p4_try_doodh` | मैं दूध जल्दी उठता हूँ। |
| `vo_p4_try_mukut` | मैं मुकुट जल्दी उठता हूँ। |
| `vo_p4_try_subah` | मैं सुबह जल्दी उठता हूँ। |
| `vo_p5_correct` | शाबाश! बगीचे में सुंदर फूल खिले हैं। |
| `vo_p5_h1` | फिर से पढ़िए। चित्र देखिए, बगीचे में क्या खिले हैं? सही शब्द चुनकर वाक्य पूरा कीजिए। |
| `vo_p5_h3` | बगीचे में सुंदर फूल खिले हैं। फूल चुनिए। |
| `vo_p5_try_phool` | बगीचे में सुंदर फूल खिले हैं। |
| `vo_p5_try_subah` | बगीचे में सुंदर सुबह खिले हैं। |
| `vo_p5_try_tarbooj` | बगीचे में सुंदर तरबूज खिले हैं। |
| `vo_p6_correct` | शाबाश! मीठा तरबूज खाना अच्छा लगता है। |
| `vo_p6_h1` | फिर से पढ़िए। चित्र देखिए, बच्चा क्या खा रहा है? सही शब्द चुनकर वाक्य पूरा कीजिए। |
| `vo_p6_h3` | मीठा तरबूज खाना अच्छा लगता है। तरबूज चुनिए। |
| `vo_p6_try_khush` | मीठा खुश खाना अच्छा लगता है। |
| `vo_p6_try_phool` | मीठा फूल खाना अच्छा लगता है। |
| `vo_p6_try_tarbooj` | मीठा तरबूज खाना अच्छा लगता है। |
| `vo_pair_u` | यह है उ। इसकी मात्रा है — ु। |
| `vo_pair_uu` | यह है ऊ। इसकी मात्रा है — ू। |
| `vo_result_phool` | अब ल जुड़ने पर फूल बनता है। |
| `vo_result_pul` | अब ल जुड़ने पर पुल बनता है। |
| `vo_sc_h2` | जो वाक्य सही लग रहा है, वही शब्द चुनिए। |
| `vo_sc_prompt` | चित्र देखकर सही शब्द चुनकर वाक्य पूरा कीजिए। |
| `vo_sounds_phool` | फ। फू। फूल। |
| `vo_sounds_pul` | प। पु। पुल। |
| `vo_t1_prompt` | आज हम छोटी उ और बड़ी ऊ की मात्रा वाले शब्द पढ़ेंगे। |
| `vo_t2_prompt` | आइए, देखें कि छोटी उ की मात्रा लगने से शब्द की आवाज़ कैसे बदलती है। |
| `vo_t3_prompt` | आइए, छोटी उ की मात्रा वाले कुछ शब्द देखें। |
| `vo_t4_prompt` | आइए, देखें कि बड़ी ऊ की मात्रा लगने से शब्द की आवाज़ कैसे बदलती है। |
| `vo_t5_prompt` | आइए, बड़ी ऊ की मात्रा वाले कुछ शब्द देखें। |
| `vo_tap_h1_u` | फिर से पढ़िए। जिस शब्द में छोटी उ की मात्रा आ रही है, उस पर टैप कीजिए। |
| `vo_tap_h1_uu` | फिर से पढ़िए। जिस शब्द में बड़ी ऊ की मात्रा आ रही है, उस पर टैप कीजिए। |
| `vo_tap_h2_u` | जिस शब्द में छोटी उ की मात्रा है, उस पर टैप कीजिए। |
| `vo_tap_h2_uu` | जिस शब्द में बड़ी ऊ की मात्रा है, उस पर टैप कीजिए। |
| `vo_tap_prompt_u` | जिस डिब्बे में छोटी उ की मात्रा वाला शब्द है, उस डिब्बे पर टैप कीजिए। |
| `vo_tap_prompt_uu` | जिस डिब्बे में बड़ी ऊ की मात्रा वाला शब्द है, उस डिब्बे पर टैप कीजिए। |
| `vo_try_again` | एक बार फिर सुनिए। |
| `vo_wb_phool` | शाबाश! फूल बन गया। |
| `vo_wb_pul` | शाबाश! पुल बन गया। |
| `vo_wb_sui` | शाबाश! सुई बन गई। |

## Copied, do NOT record

- `vo_pt_tutorial`
- `vo_pt_guided`
- `vo_pt_practice`
- `sfx_celebrate`
- `sfx_correct`
- `sfx_wrong`
- `sfx_tap`
- `sfx_pop`
- `sfx_train_arrive`
- `sfx_train_move`
- `sfx_whistle`
