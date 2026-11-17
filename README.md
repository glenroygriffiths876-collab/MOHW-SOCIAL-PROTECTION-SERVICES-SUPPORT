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


## GIA 5 — geometric design, parish-aware and role-specific guidance

**Theme:** GIA uses the site's existing navy background and geometric SVG (assets/geometry-bg.svg) with cyan, magenta, gold and high-contrast readable cards. The legacy dark-green assistant palette is overridden.

**Onboarding:** GIA distinguishes individuals/caregivers and healthcare/social-service professionals. It adapts service explanations, action plans, referral guidance and follow-up. Only the non-case role and parish preferences are retained for the current browser session. Client details, phone numbers, free-text needs, records and messages are not stored there.

**Parish directory:** data/gia-parishes.json includes all 14 Jamaican parishes, their health regions, officially listed MLSS/NIS parish offices and NHT branches/service centres, plus an illustrative NHF Drug Serv facility per parish. The relevant official listings were checked on November 15, 2026.

- MLSS/NIS: https://www.mlss.gov.jm/parish-offices/
- NHT offices: https://www-1.nht.gov.jm/index.php/contact
- NHF Drug Serv: https://www.nhf.org.jm/drug-serv/
- NHF providers: https://www.nhf.org.jm/providers/
- HEART parish offices: https://www.heart-nsta.org/contact/
- HEART programmes: https://programmes.heart-nsta.org/
- Health regions: https://www.moh.gov.jm/about-us/

**Routing distinctions:** An MLSS office listed as an NIS parish office is not automatically a verified PATH point of intake; clients must confirm the appropriate PATH route. A Drug Serv facility is not evidence that all NHF benefits can be accessed there. Officially published addresses do not guarantee live opening hours or verified GPS pins.

**Other destinations:** For hospitals, clinics, police stations, poor relief and other agencies not locally verified, GIA names the parish and relevant health region where applicable, provides official directory links and labels Google Maps queries as searches rather than verified destinations.

**Parish and message safety:** Destination parish is required for a prepared WhatsApp travel message. Switching parishes clears a previously selected office from a different parish. Client visit directions cannot treat a bare national agency name as an exact local address. A worker reviews and sends the generated message within WhatsApp; GIA does not transmit it automatically.

**Integration:** The main directory parish selection is passed to GIA. A service profile can open GIA with that programme preselected. Local office data is precached for offline access.

**Limits:** GIA remains a deterministic, guide-grounded assistant. It is not a live generative AI service, eligibility assessor, secure clinical record, automated reminder system or live appointment/office-hours verification service.


### Updated parish-health department reference points

The local guidance also incorporates a parish health department listing for each parish. For Kingston and St. Andrew, the listed KSA health department covers both parishes. Health department addresses and phone contacts are from the official MOHW or relevant regional authority directory, as referenced per entry in data/gia-parishes.json. These are enquiry and routing contacts, not proof that a particular clinic, social-work service, or appointment is available there.

- MOHW parish health department contact listing: https://www.moh.gov.jm/contact-us/
- WRHA local facility listings: https://www.wrha.gov.jm/health-facilities/hanover/ and equivalent parish pages
- SRHA contacts: https://srha.gov.jm/contact.php
- NERHA health departments: https://www.nerha.gov.jm/health-centres

For the website version, the asset URLs are revisioned and the service-worker cache is incremented to prevent an installed PWA from indefinitely displaying an older GIA colour palette or local directory. Actual on-device caching can still require reopening the app or refreshing once.


## Phase II — accessible reading and simplified design

The additive phase2 stylesheet reduces background noise while preserving existing illustrations, navigation, and GIA. The welcome card uses the existing illustrated virtual guide and on-demand browser speech with a written transcript. Accessibility preferences are local only; no user identity or case data is retained. PDF reading extracts the current page or continues through the document; image-only pages require an approved accessible text alternative. The browser speech engine and PDF.js availability vary by device. Jamaican Sign Language media must be supplied and professionally validated; no signing avatar is asserted to translate JSL. The optional media settings and canonical production share address live in assets/phase2-config.js. User-provided video must have captions and a transcript. The fallback canonical address is the current deployment directory. For formal Ministry deployment, configure the approved HTTPS URL and verify printed QR codes, guide content, referral workflow, accessibility and device behaviour. The existing guide remains a working draft, not an approved eligibility or referral system. No private client or meeting data should enter source control.

Visual revision 22 changes the home page to a white canvas, flat navigation and four immediate action tiles. It keeps the existing directory, referral flow, booklet and illustrations. The visible header release marker and versioned stylesheet distinguish the updated design from stale copies. The service worker revalidates same-origin requests when online.

### Refined navigation (revision 23)
The original geometry is restored in bounded title banners and faint accents, while functional surfaces remain plain. Home narrative and duplicate chapter tiles are consolidated; referral steps have a concise action and caution plus expandable source wording. Urgent safety appears before referrals. Decision and directory remove repetitive panels; full service profile details remain available. The complete manual remains unchanged. Manual links open the reader rather than claiming unverified page numbers.
