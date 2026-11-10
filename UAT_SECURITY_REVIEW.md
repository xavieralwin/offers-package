# UAT Security Review — Citi World Privileges Offers Package

## Scope

This is a source-level review of the static HTML/CSS/vanilla-JavaScript package. It is not a penetration test, DAST report, dependency audit of the hosting platform, or a security certification. The package has no server-side application code, database, authentication flow, or third-party JavaScript CDN.

## Code-level checks applied

- Offer strings are rendered through DOM creation and `textContent`; the application does not use `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, or `new Function` to render offer-supplied content.
- Merchant image paths are restricted to a basename allowlist (`A-Z`, `a-z`, digits, dot, underscore and hyphen) and joined to the fixed Citi image host. Arbitrary `javascript:` or external URLs are rejected as image filenames.
- Category SVG filenames are selected from a fixed allowlist. Offer type/name/description/T&C values are displayed as text, not parsed as markup.
- Malformed percent-encoded URL hashes are handled without throwing, and only known category hash values are matched.
- Links with `target="_blank"` use `rel="noopener noreferrer"` to avoid opener/tabnabbing risks.
- The hero carousel rotates on a stable 3-second interval, wraps from the final slide to the first, has manual previous/next/dot controls, and respects reduced-motion preferences. Banner text is only revealed after the relevant image loads.
- No iframe elements or dynamic frame/script creation are present in this package.
- No remote JavaScript libraries or build-time framework dependencies are used. The hero and merchant images are fetched from `https://www.citiworldprivileges.com`.

## Result and remaining deployment controls

No obvious DOM-based XSS sink was identified in the reviewed app code. That does **not** prove the website is free from all vulnerabilities. The supplied offer datasets should still be treated as untrusted content, and the deployed UAT site must be tested with the organisation's approved SAST/DAST, web security scanner, and manual test cases.

Clickjacking/cross-frame protection cannot be guaranteed by client-side HTML/JavaScript alone. Configure the following HTTP response headers at the UAT web server, reverse proxy, CDN, or equivalent. Adapt syntax to the actual host and approved enterprise policy:

- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https://www.citiworldprivileges.com; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests`
- `X-Frame-Options: DENY` (legacy defense in depth when the application is not intended to be framed; align with `frame-ancestors`).
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` only after confirming the UAT host and all covered subdomains are HTTPS-only; do not enable `includeSubDomains` blindly.

`frame-ancestors` is only effective as an HTTP response header; placing it in a CSP meta element is not a substitute. Do not deploy with a permissive `unsafe-inline` or `unsafe-eval` policy unless the security team has explicitly assessed and approved the need. The provided application uses external local JS/CSS files and should not require those exceptions.

## UAT release checklist

1. Serve the extracted `offers-package` directory over HTTPS on the approved UAT host; do not use `file://` as the deployment test.
2. Apply and verify the approved response headers above using the enterprise's standard header/CSP review process.
3. Confirm that all four SG and all four HK banner images and the offer-image origin are approved and reachable from UAT. The site requires Internet/network access to load these remote images.
4. Test SG EN and HK EN switching, HK CN WIP behaviour, category filters, hash bookmarks including malformed hashes, search, 15-item pagination with 9+6 lazy loading, popup keyboard/escape/close behaviour, and the automatic 3-second carousel loop.
5. Run the organisation-approved SAST/DAST and vulnerability scanning against the deployed UAT URL; review CSP violations and browser console/network errors.
6. Verify clickjacking defenses by confirming the page cannot be embedded by an unauthorised origin, and obtain security/QA sign-off before production.

## Deployment boundary

This package is prepared for UAT validation. It has not been deployed to a UAT environment from this workspace, and no server-side headers, firewall, TLS settings, CDN rules, or CI/CD configuration can be verified from the static files alone.


## V18 checks: direct links and automatic expiry

- Direct offer links use `URLSearchParams` and an allowlist of accepted country values (`SG`, `HK`) and offer-anchor syntax (`[a-z0-9-]`). The lookup matches the anchor ID against records already loaded for the selected market; URL values are never interpreted as code or selectors.
- The offer dialog is built with `createElement`, `textContent`, and DOM nodes. Merchant/offer strings and the new anchor ID are not injected as HTML. The anchor ID is validated before it is written to the URL.
- Market selection is retained in query parameters for refresh/deep-link behavior. On dialog close, only the optional `offer` parameter is removed; the market and category are preserved.
- Expired records are filtered at render time using the ISO `validTo` value and local browser date. The source data is not deleted or mutated by expiry handling. Invalid/missing date values fail open (remain visible) and should be corrected in the source feed.
- This package makes no `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, dynamic import, or remote JavaScript-library requests. It uses local JavaScript/CSS/JSON-like JavaScript data arrays only. Remote resources are banner and offer images from `www.citiworldprivileges.com`; outbound links point to the Citi home/terms/privacy pages and Google Play/App Store.
- These are source-level controls, not a certified Vulnerability Assessment (VA) result. Before UAT sign-off, run the bank's required SAST/DAST/VA tools against the deployed HTTPS URL, verify CSP and anti-framing response headers at the host/reverse proxy, and review the resulting reports. Recommended controls from this document's original deployment section still apply.


## V19 regression points

- Verify the SG and HK hero carousel image/text mapping and 3-second auto-loop independently.
- Verify the shared footer appears for both SG and HK; confirm its registration text, app links and legal destinations are approved for both markets before production.
- Verify the Citi logo returns to All Offers for the currently selected country and removes any direct-offer query parameter.
- Verify popup shows only `Offer Valid till: [end date]` and does not show the start date/range.
- Verify the generic source-document disclaimer is absent in SG and HK.


## V20: Hong Kong Traditional Chinese data handling

- Added a packaged Traditional Chinese offer-data array for Hong Kong. The dataset contains 427 records; each record is paired to a published HK English record by exact Offer ID before inheriting the English metadata fields.
- The Chinese workbook contains HTML fragments in text fields. Those fragments are parsed during data preparation into plain text and structured list blocks. The packaged CN data contains no raw HTML tags in Offer Name, Offer Description, or Terms & Conditions fields.
- The application renders CN offer text and list items through `textContent` and created DOM nodes. It does not treat the supplied Chinese content as executable markup.
- The language selector exposes CN only when Hong Kong is selected. Country/language values are constrained to known values; the existing offer-anchor validation remains in place.
- Traditional Chinese font families are configured as local/system fallbacks. No remote font provider or external JavaScript/CSS library was introduced.
- Regression checks confirmed 427 unique CN offer anchors and exact matching of inherited merchant, validity, image, category, subcategory, tag, location and contact values for all 427 supplied CN offers. SG and HK EN data files remain byte-for-byte unchanged from V19.

This is still a source-level review. It does not certify the deployed application as VA-compliant. Apply and verify the host response headers and complete the organisation's approved SAST/DAST/VA and manual security tests against the actual UAT deployment before approval.
