# QA-listen checklist (needs human ears)

Machine QA (11 Jun 2026, `ffmpeg volumedetect` over all 45 processed files): zero flags — clean decode, plausible durations, uniform loudness (~-19 dB mean), no clipping, no silent openings. What remains is *identity and taste*, which only a listener can judge. Record outcomes inline below; when all three are settled, mark the progress row done.

## 1. Iran — verify identity + quality

The recording comes from the archive's `Removed/` folder (`Iran (2000).mp3`). The anthem ("Sorud-e Melli", adopted 1990) hasn't changed, so it *should* be correct — confirm and judge quality.

- Listen: https://wc26minigames.com/audio/ir.mp3 (50 s)
- Reference: https://en.wikipedia.org/wiki/National_anthem_of_the_Islamic_Republic_of_Iran (page has an audio sample)
- ☐ Same melody as the reference? ☐ Quality acceptable?

## 2. Paraguay — verify identity + quality

Also from `Removed/` (`Paraguay (2000).mp3`). "Paraguayos, República o Muerte" — unchanged since recording.

- Listen: https://wc26minigames.com/audio/py.mp3 (3 min 15 — it's a long anthem; that's normal)
- Reference: https://en.wikipedia.org/wiki/Paraguayos,_Rep%C3%BAblica_o_Muerte
- ☐ Same melody? ☐ Quality acceptable?

## 3. DR Congo — identify which Congo

`Current/Congo.mp3` exists in the archive but is unlabeled as to *which* Congo. If it is "Debout Congolais" (DR Congo), we can give the 46th nation real audio; if it's "La Congolaise" (Republic of the Congo — not qualified), we leave DR Congo audio-less.

- Listen: https://archive.org/download/us-navy-band-national-anthems-public-domain/Current/Congo.mp3
- Reference A (what we want): https://en.wikipedia.org/wiki/Debout_Congolais
- Reference B (the wrong Congo): https://en.wikipedia.org/wiki/La_Congolaise
- ☐ Matches Debout Congolais → tell the agent to wire it up (sets the `audio` field, regenerates offsets/audio, and updates the parity test with a documented divergence — POOL grows to 46, which shifts future daily scheduling, so decide before many matches have passed)
- ☐ Matches La Congolaise / unsure → leave as-is

## 4. Bonus: borderline soft openings

Qatar (`/audio/qa.mp3`) and Jordan (`/audio/jo.mp3`) open quietly (~-37 dB first second — soft intro, not silence). Play each and judge whether the 1-second first clip is audible enough on a phone speaker; if not, the agent can nudge their start offsets.

- ☐ Qatar OK? ☐ Jordan OK?
