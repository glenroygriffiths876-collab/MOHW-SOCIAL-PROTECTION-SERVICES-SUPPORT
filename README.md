# Social Protection Services Support Guide — Jamaica

A responsive, static website concept for navigating a social protection guide. The current public preview contains the complete interface structure and an interactive Jamaica parish map, but no programme or contact records.

## Why the content is empty

The source guide was shared as a confidential draft. This repository is public, so no guide text, unpublished programme details, contact details, or source document have been added. Populate `data/services.json` only after the content owner approves public release or the repository is made private.

## Run locally

Serve the repository root with any static web server, then open `index.html`. The map and service data are loaded from local paths; a web server is recommended instead of opening the file directly.

## Content model

Add only agency-approved records to `data/services.json`. Each record should include a source URL, `verifiedOn` date and `verificationStatus`. Only records with `verificationStatus: "verified"` should appear as available service listings or contribute to parish-map counts. An empty result means no verified record is loaded; it does not mean the service is unavailable.

## Map attribution

The map image follows the asset used by the HSTU-SI repository: Jamaica parish-boundary location map from Wikimedia Commons, attributed to NordNordWest, CC BY-SA 3.0 DE. Preserve the attribution and licence when the asset is displayed.

## Deployment

The site is a static root-level `index.html` with relative data paths and can be hosted with GitHub Pages after Pages is enabled for the repository. This preview does not include a backend, account system, eligibility decisions, or collection of personal information.
