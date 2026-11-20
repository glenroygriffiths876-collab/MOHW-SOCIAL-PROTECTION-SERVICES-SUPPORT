# Digital Manual

The approved 43-page PDF is stored as ordered binary parts and reconstructed in the browser. The Digital Manual opens it automatically; download serves the reconstructed original PDF. The source requires no local file selection. No other guide sections are changed.

The welcome screen automatically opens only the bundled guide; no local PDF or Google Drive file picker is provided. A failed source load offers a retry of the same guide. Back to guide returns to the homepage and keeps the loaded document for quick reopening. Optional page-turn audio uses a layered, filtered paper-like swoosh, with directional stereo panning where available; actual playback depends on browser/device audio support.

## Premium visual preview (development branch only, 19 November 2026)

A second, independent preview PDF is built from the **bundled 43-page source PDF**, using the reproducible `scripts/build-premium-manual.py` build workflow. It adds one designed cover and visually frames each complete, unchanged source page with a green/white header and margins. The original source page interiors, photographs, order and embedded text are **not reauthored**. The preview therefore contains **44 pages total** (one design-preview cover plus the original 43 source pages).

The reader shows an **Original / Premium preview** selector above the existing flipbook. Original is the default. Both editions continue to use the same page-turn, accessibility reading, download, and fullscreen controls; selecting either edition reloads just that PDF. A missing preview file gives a retry message, and the user can return to the untouched original. This is a visual framing proof of concept, **not an approved content revision or full interior manual redesign**.

Any true editorial redesign of source pages must be checked against the original text, tables, contacts, and images, with stakeholder sign-off. Changes to source content cannot be inferred from the AI-generated video.
