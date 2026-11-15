# Social Protection Services Support Guide — Jamaica

A responsive website that turns the Social Protection Services Support Guide into one searchable, interactive resource.

## Main navigation

- About This Guide (combined with the home experience)
- Referral Procedures
- Decision Guide
- Find Services: one unified directory for programmes, support categories, agency contacts, parish browsing, service profiles, official links, and Google Maps searches

## Find Services

- Search by service, need, agency, category, and contact details
- Browse all 14 parishes with the Jamaica map and parish selector
- Open a complete profile with guide-listed support, intended group, steps, documents, relevant agency contacts, official link, and Google Maps search
- View agency contact listings that are not linked to a specific programme
- Official logo images are shown where a suitable source is available; initials are used when one is unavailable

## Content and verification

The guide content is transcribed from the supplied November 2026 booklet. Programme details and contacts should be confirmed with the responsible agency. Parish selection is a search aid and does not confirm a local office or service availability. The map does not plot verified facility coordinates.

## Source references

- HSTU repository map and parish interaction pattern: https://github.com/glenroygriffiths876-collab/HSTU-SI/
- Jamaica map base: NordNordWest / Wikimedia Commons, CC BY-SA 3.0 DE
- NHF logo: https://www.nhf.org.jm/
- HEART/NSTA logo: https://apply.heart-nta.org/
- NHT and CPFSA logo references: Jamaica Information Service (jis.gov.jm)
- MLSS social profile logo: https://x.com/JamaicaMlss

## Local preview

Open index.html through a static HTTP server so the content JSON loads correctly.


## GIA — guided social support assistant (version 3, November 2026)

The floating **Ask GIA** assistant can guide a worker or caregiver from a short description of need to a relevant programme, agency or situation-based referral route. It supports multi-need prioritisation, common follow-up questions, agency contacts, document checklists, and worker-reviewed WhatsApp information containing an agency name, phone recipient, parish and Google Maps link/search.

- **Referral preparation:** Recipients are entered by the worker. GIA opens WhatsApp prefilled; users still review and send messages themselves. It cannot send messages automatically.
- **Document provenance:** Lists from the booklet are clearly separated from additional documents entered by the referring worker. Neither should be treated as live-confirmed requirements.
- **Location:** A worker can supply a Maps link; otherwise GIA provides a Google Maps search, not a verified office pin or current opening hours.
- **Safety:** Urgent language shows an emergency-first panel, which complements rather than replaces facility policies and professional judgement.
- **Follow-up:** GIA composes copyable or printable draft notes; there is no server-side case record, authentication, automated reminder, or backend referral tracking.
- **Intelligence:** GIA is a rule-guided conversational tool based on the guide content, **not** a live generative AI service and not a programme eligibility assessor.

Future operational development would require validated parish-level destination coordinates, secure authorised case management and a maintained programme-content verification process.

### Directory-to-GIA integration (v3.1)

Every unified-directory service profile has a **Prepare referral with GIA** action. GIA also recognises direct requests for named programmes and can open a custom-destination referral from free text mentioning a hospital, clinic or office. A typed recipient number is used only to construct the user-reviewed WhatsApp click-to-chat URL.

Regression checks should cover direct programme questions (PATH/NHF/NIS), multi-need focus, document guidance, follow-up context, urgent safety, safe/unsafe Maps links, recipient consent, custom document provenance, and referral deep links.


## GIA 4.0: practical case-navigation improvements (15 November 2026)

- **Barriers to referral:** concise advice and agency-call questions for missing or expired documents, inability to travel, unaffordable costs, unsuccessful contact, unavailable services and communication/accessibility needs; the assistant does not guarantee an alternative or offer approval.
- **Multiple needs:** a worker can prioritise one need or prepare a draft multi-need support roadmap, with possible programme starting points and clear uncertainty.
- **Optional voice dictation:** if the browser exposes speech recognition, pressing the microphone transcribes a question without submitting it automatically. Users review the transcript; the browser's speech provider may handle audio. Do not dictate private details.
- **WhatsApp audiences:** client/caregiver visit instructions by default, or a separate general agency enquiry template that does not include client-identifying or clinical information.
- **Privacy:** draft worker action plans use broad needs rather than copying raw free-text client descriptions. Referral messages remain user-reviewed and sent only inside WhatsApp.
- **Testing:** GitHub Actions runs an expanded smoke suite for contextual follow-ups, multiple-need planning, barriers, safety routing, WhatsApp preparation, document source labels, and Maps link validation.

GIA remains a rule-guided, browser-based assistant and does not access a private patient database or provide live generative AI responses, programme eligibility decisions, confirmed office hours, or automatically sent communications. The parish selector is context; it does not confirm local office locations.
