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
