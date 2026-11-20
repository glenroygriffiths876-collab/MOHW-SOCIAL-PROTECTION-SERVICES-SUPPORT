# MOHW Social Support premium interface refresh

This upgrade is an additive CSS/JS design layer preserving the original data, official MOHW logo, Jamaican imagery, service search, referral guidance, accessible PDF reader, and GIA workflows.

## Gia introduction video

The uploaded 32-second video is not yet present in the GitHub repository. To enable playback for all visitors, add the approved `BEST VERSION MOHW SP VID.mp4` as `assets/gia-introduction.mp4` to this branch/main. The homepage detects the video using a same-origin HEAD request, then reveals the accessible HTML5 player. Until the approved MP4 is uploaded, it displays Gia's original portrait and a working **Ask GIA** button; there is no misleading broken video player. No expiring CDN links are used.

## Safety and operation

The original 43-page manual remains driven by `assets/manual/manifest.json`; its audio, page turn, downloads and controls are not rewritten. Existing programme data and safety guidance remain unchanged. The service worker cache changes version to pick up the new styles. Keyboard focus, reduced motion and mobile layouts are supported. Never use image-only screenshots as replacement for interactive application views.
