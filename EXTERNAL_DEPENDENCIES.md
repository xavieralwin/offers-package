# External Dependencies and Network Calls — V18

## Third-party libraries and APIs

- **Third-party JavaScript libraries:** None.
- **Third-party CSS libraries/frameworks:** None.
- **External APIs / data services:** None. The application does not call `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, or other API clients.
- **CDNs or externally hosted fonts:** None.
- **Build-time dependencies:** None. The package uses plain HTML, CSS, and vanilla JavaScript and opens directly from `index.html`.

## Remote resources used at runtime

The page requests promotional images from the same Citi World Privileges host:

- Hero banners: `https://www.citiworldprivileges.com/data/images/hpg_banners/5_SG_en.jpg`, `6_SG_en.jpg`, `7_SG_en.jpg`, and `8_SG_en.jpg`.
- Offer images: `https://www.citiworldprivileges.com/data/images/offer_images/272x195/<validated-image-filename>`.
- A legacy CSS fallback image remains referenced at `https://www.citiworldprivileges.com/images/Banner/hpg_banner_desktop.jpg`.

These are image requests, not API calls. If the image host is unavailable or blocked in UAT, the site's text content can still load but the relevant images will not.

## Outbound links (user navigation only)

The header/footer includes links to the Citi World Privileges site and Citi Singapore pages, plus app-store links on `play.google.com` and `apps.apple.com`. They open only when a user follows the link. Links using a new tab have `rel="noopener noreferrer"`.

## Data and security notes

- Offer data is packaged locally in JavaScript arrays; it is not fetched from a remote API.
- Offer-supplied text is inserted through DOM APIs / `textContent`, not treated as markup.
- Direct-link query values are allowlisted and matched to a loaded market record by an exact anchor ID.
- Merchant image filenames are constrained by the app's safe filename rules and joined to a fixed Citi host.
- Expired offers are filtered from normal listings at render time; records remain in the data and historical direct URLs may still show the offer popup with an Expired badge.
- This inventory is a source-code inspection, not a network capture. Confirm actual requests from the deployed UAT build in browser DevTools/proxy logs as part of release validation.

## V20 Hong Kong Traditional Chinese

- The HK CN dataset is packaged locally in `data/offers-hk-cn.js`; no external translation service or API is called.
- The HK CN hero carousel reuses the four approved HK banner assets on the same Citi image host used for the English market. Chinese text is included locally in `js/hero-carousel.js`.
- The browser uses locally available Traditional Chinese system fonts as fallbacks; there is no Google Fonts or other external font request.
