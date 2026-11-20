# GIA welcome video — production media

Place the **original user-supplied** `GIA_MOHW_Social_Support_QR_Fixed.mp4` here on the protected redesign branch.

Exact expected browser URL:
`assets/media/GIA_MOHW_Social_Support_QR_Fixed.mp4`

The welcome page already includes a native `<video>` player that points to that precise file. It does **not** reproduce the video using thumbnails and it does **not** display a fake generated video. Until a real file exists at this path, a GIA portrait and factual explanation are displayed.

### Upload checklist
1. Use the MP4 supplied in the conversation without generating a different GIA video.
2. Open the media folder on the development branch and upload the MP4 with the exact filename above.
3. Confirm the GitHub file size agrees with the uploaded original (approximately 9.5 MB).
4. Verify the MP4 plays without Google Drive permissions or another external login.
5. Use accessible captions derived from the **verified actual spoken script**, not a guessed transcript. Add `gia-welcome.en.vtt` only after transcription/approval.
6. Test playback on iPhone Safari, Android Chrome and a desktop browser. Do not alter the original image assets, GIA functionality or 43-page manual.
7. Keep the PR as draft until the player, all images and referral functions pass stakeholder review.

Do not use private Drive embed links, short-lived Canva URLs or ChatGPT sandbox links as a production media source.
