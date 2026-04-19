# Workbench Sound Pack

This folder is reserved for the workbench-only UI sound pack.

Required one-shot assets:

- `tab-tap.wav`
- `sheet-open.wav`
- `sheet-close.wav`
- `slider-threshold.wav`
- `slider-confirm.wav`
- `success-resolve.wav`

Export spec:

- format: `wav`
- sample rate: `44.1kHz` or `48kHz`
- channels: `mono`
- bit depth: `16-bit` or `24-bit PCM`
- trim all dead air
- peak around `-3dB`
- no limiter pumping, no long tails, no obvious reverb

Length targets:

- tab / sheet cues: `40ms` to `120ms`
- slider threshold: `60ms` to `140ms`
- slider confirm: `120ms` to `220ms`
- success resolve: `180ms` to `360ms`

Tone rules:

- premium and calm, not arcade
- tactile, not musical
- quiet enough to sit under haptics
- avoid sci-fi zaps, coin sounds, UI beeps, risers

After assets are approved, wire them in
`components/dev/workbench/soundCatalog.ts`.
