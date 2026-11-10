# Citi World Privileges Offers Package

A standalone, static Citi World Privileges offers page with Singapore and Hong Kong country/language selection, built from the Singapore published offer content and the supplied maintenance page assets. The trailing metadata fields were re-aligned against the source workbook where comma-split cells had shifted values; split quoted Offer Sub Type and Offer Tag Name fragments are joined with spaces. It uses plain HTML, CSS and vanilla JavaScript and works by opening `index.html` directly from a local folder. It does not fetch JSON, use a server, or depend on external CDNs.

## Country and language selector

- The Citi header has a country dropdown with a local SG/HK flag and a language dropdown.
- Singapore offers are currently available in English (EN) only; the language selector therefore only offers EN for Singapore.
- Hong Kong English (EN) offers are included from the supplied HK workbook. Hong Kong Traditional Chinese (CN) offers are included and exposed in the language selector. Singapore offers are never shown as if they were Hong Kong offers.
- The HK Traditional Chinese dataset is loaded from `data/offers-hk-cn.js` as `window.HK_OFFERS_CN`; the HK language selector exposes Traditional Chinese.
- The same approved footer is displayed for both Singapore and Hong Kong, as requested. Confirm with the market/legal owners that the shared registration text and footer destinations are approved for both markets before production deployment.

## Open the page

1. Extract the ZIP while preserving its folder structure.
2. Open `offers-package/index.html` (or `index.html` inside the extracted `offers-package` folder) by double-clicking it.
3. Use the horizontal category strip below the Citi header to filter by offer type. “All Offers” shows all offers; the selected filter is stored in the URL hash for bookmarking. Search filters merchant name and offer name within the selected category. Offer cards show the image, merchant, offer name, validity and tags. Select “View Offer” to open the accessible offer-detail popup, including the same image banner, description, validity and Terms & Conditions. The list uses lazy loading: 9 offers appear initially and another batch of 6 loads as you scroll, up to 15 offers per page (loaded in batches of 9 and 6). Numbered pagination remains available after the current page has loaded. Category labels use local SVG icons in the filter strip, cards and detail popup.

## Package structure

- `index.html` — page shell, reused Citi header markup, navigation host, offers region, and reused footer markup/links.
- `css/styles.css` — responsive offers UI plus Citi maintenance-page header gradient/logo styling.
- `css/footer.css` — copied from the supplied maintenance page's footer stylesheet.
- `js/app.js` — category-strip filters, hash routing, search, paginated card rendering (15 offers per page, 9 initially and 6 on scroll), validity/status labels, and accessible offer-detail dialog with T&C expansion.
- `data/offers.js` — all 447 retained Singapore offer records as a JavaScript array assigned to `window.OFFERS_DATA`.
- `data/offers-hk-en.js` — all 428 reconstructed Hong Kong English offer records (`window.HK_OFFERS_EN`).
- `data/offers-hk-cn.js` — 427 Hong Kong Traditional Chinese offer records (`window.HK_OFFERS_CN`).
- `assets/` — images from the maintenance-page ZIP, Citi logo, footer/store badges, local SG/HK flag SVGs, and local category SVG icons for All Offers, Dining, Travel, Shopping, Fuels, Weddings, Hotels and Lifestyle.

## Data fields

Each object in `window.OFFERS_DATA` contains: `offerNumber`, `merchantId`, `merchantName`, `validity`, `validFrom`, `validTo`, `offerType`, `offerSubType`, `offerTagName`, `offerName`, `location`, `name`, `offerImage`, `offerDescriptions`, and `offerTermsAndConditions`.

`validity` retains the source text, while `validFrom` and `validTo` are normalized to `YYYY-MM-DD` for reliable date display and expiry calculation. Descriptions and T&Cs are arrays. Optional `offerDescriptionBlocks` structures render explicitly numbered benefits as semantic ordered lists. Text is inserted through DOM `textContent`, not interpreted as HTML.

## Update existing offers

1. Open `data/offers.js` in a text editor.
2. Find the offer object by `merchantId` or `offerNumber`.
3. Update the relevant fields. Keep `validity` in the source-style form (for example, `01-Jul-26 To 31-Dec-26`) and keep `validFrom` / `validTo` in ISO form (for example, `2026-07-01` / `2026-12-31`).
4. Add or remove individual description and T&C paragraphs inside `offerDescriptions` and `offerTermsAndConditions` arrays. Use normal JavaScript string quoting; do not paste HTML tags expecting them to render.
5. Save the file and reopen or refresh `index.html`.

## Add an offer or a new Offer Type

- Copy an existing offer object in `data/offers.js`, paste it as a new array item, and update every field. Do not reuse an `offerNumber`; the number identifies the card's DOM elements.
- Set `offerType` to the exact category string required. The horizontal filter strip is generated dynamically from distinct `offerType` values. No code change is needed to add a category; the new category will appear as a filter button and receive a URL hash automatically. The current package retains the exact source Offer Type label `Weddings` rather than renaming it to `Wedding`; change the data value only if the business confirms that normalization.
- Add real offer-image files to `assets/` only if supplied. Offer images are loaded from `https://www.citiworldprivileges.com/data/images/offer_images/272x195/` followed directly by the source `offerImage` filename, with no whitespace added. The page uses lazy loading and shows a small fallback message if an image filename is missing or the remote image cannot be loaded. Because these images are hosted remotely, an internet connection is required to display them; all other page functionality works from `file://` without a server.

## Typography and offer-title styling

- The page-wide primary font stack is `"citi-text-regular", Arial, Helvetica, sans-serif` (`--ff-primary`).
- The prominent merchant heading in each offer card and the popup uses `--fs-24`, `--color-primary` (`#255BE3`), `--fw-700`, `--ff-secondary` (`"citi-display-regular", Arial, Helvetica, sans-serif`), and `--space-8` below the title. The offer name is shown directly beneath the merchant heading as the offer summary.
- The supplied maintenance ZIP contains references to a legacy Interstate font, but no actual font files were included. It also does not include the requested Citi Text or Citi Display font files. The CSS uses the requested font-family names with local system fallbacks; the exact Citi fonts will only render when those licensed fonts are installed or supplied in the package. No CDN or external font request has been added.

## Source-data quality notes (V20.2)

- Singapore offer content in this release is based on the active revisions in the raw-feedback Word document. Tracked insertions and move-to content are included; tracked deletions, move-from content, and manually struck-through text are excluded.
- The package contains **447 Singapore offers**. Ten offers were removed under explicit reviewer comments. Offer 348 is absent from the Word document and has been omitted from this build pending confirmation from the content owner.
- Offer validity values matched for all 457 offers present in both the Word document and V20.1; the baseline values are retained.
- Offer Type, Offer Sub Type, Offer Tag Name, Location and contact metadata were retained from V20.1 where the Word table's columns were shifted or merged and could not be read reliably.
- Existing V20.1 image mappings were retained when the Word document omitted image placeholders. Offer 141 has no image filename in either source and uses the existing image-unavailable fallback.
- The source includes duplicated benefit text in T&Cs as well as descriptions (notably Offers 93 and 457). These were retained to avoid silently deleting source text and are called out in `QC_CHANGELOG.md` for business review.
- The exact category label `Weddings` remains as supplied in the dataset; it has not been normalized to `Wedding`.

The merchant image is rendered on both the offer card and offer-detail popup. Offer `Name` metadata remains in the data but is not displayed on cards.

## V6 visual refinements

- The category filter is separated from the Citi gradient header with a top gap, side gutters, and rounded corners on all four sides.
- Popup Terms & Conditions use one consistent native bullet list with improved marker alignment, line height, and spacing.
- For display only, leading clause/list numbers and standalone number-marker rows from extracted T&C text are removed so the popup does not show a bullet plus a second numbering system. Decimal values such as `20.88%` are not treated as list numbering. The `data/offers.js` source data is not modified.


## V7 category strip and image interaction

- The category filter strip shrink-wraps its category controls on desktop to reduce empty space at both ends. On mobile it becomes a viewport-width, horizontally scrollable strip with padded edges.
- The first category label is now **All Offers** and its canonical URL hash is `#all-offers`; existing `#highlights` bookmarks continue to show all offers.
- Offer card images are keyboard-accessible links that open the same offer-detail dialog as the View Offer button.
- Images zoom in slowly when an offer card is hovered or keyboard-focused. The animation is disabled for visitors who enable reduced motion.


## Source field reconstruction update (V8)

The offer content data has been rebuilt from the source workbook using the supplied apostrophe-boundary continuation rule. Offer descriptions and Terms & Conditions are now read from their own logical fields rather than treating each physical Excel column as a separate field. Metadata values (including Offer Type, Offer Sub Type, Offer Tag Name, location, and name) use the same reconstructed source row. The V7 layout, filters, popup, pagination, image links, and animations are unchanged.


## Country and language UI update (V9)

- Added a responsive country selector on the right side of the Citi header, with local SVG flags for Singapore and Hong Kong.
- Added a language dropdown: Both Singapore and Hong Kong currently expose EN only; HK CN is work in progress.
- Singapore EN and Hong Kong EN load separate country datasets. Hong Kong CN remains in a pending-data state until its dataset is supplied; SG offers are not reused as HK content.
- The page heading, search, status labels, modal labels, pagination controls and pending-data state have English and Hong Kong Traditional Chinese UI copy.


## Hong Kong English data update (V10)

- Added 428 Hong Kong English offers using the same 27 source headers and apostrophe-boundary continuation reconstruction as the Singapore source.
- Offer image filenames use the shared Citi image base path at render time. The source row for Moments Together Causeway Bay has no image filename, so the page uses the existing unavailable-image fallback.
- For HK descriptions that contain an introduction followed by numbered benefits, `offerDescriptionBlocks` renders the introduction as a paragraph and the benefits as an ordered list. Other offer descriptions keep the existing single-text or bullet-list behaviour.
- V20.2 subsequently refreshes the Singapore offer content from the raw-feedback Word document. Hong Kong EN and CN data remain as included in V20.


## Page heading, category SVGs and lazy-load behavior (V11)

- Main heading is **Citi World Privileges**, bold, using the primary Citi text font stack; the English subtitle is “Explore offers available from participating merchants.”
- Local category SVG icons appear before category names in the filter strip, offer cards and offer-detail popup. Icons use a consistent navy outline treatment inspired by the supplied travel, dining and shopping references; the strip inverts them to white for contrast.
- Offers are initially rendered in a batch of 9 and 6 more are appended on scroll, up to 15 offers on each page. Pagination appears after the second batch is loaded.


## Latest UI updates (V12)

- Added the supplied Citi World Privileges desktop hero banner below the header, with the page title and subtitle overlaid.
- Placed the rounded category filter strip overlapping the bottom of the hero banner.
- Kept the language selector on EN only for both Singapore and Hong Kong. Hong Kong CN remains work in progress.
- Added the provided Singapore SEO title, description, keywords, Open Graph and Twitter metadata; metadata is updated for the selected market while the page is open.
- Applied minimum 10px side gutters to the offer listing and tightened offer-card and modal image dimensions.
- Pagination now contains 15 offers per page: 9 shown initially and 6 more appended on scroll before page navigation appears.


## V14 hero carousel and popup image restoration

- Singapore uses a four-slide promotional hero carousel with the supplied campaign headlines and subtitles; no CTA buttons are displayed. Accessible previous/next controls and slide indicators are included, the carousel pauses on pointer hover/focus, and autoplay is disabled for reduced-motion preferences.
- The four image URLs supplied for the carousel were identical (`https://www.citiworldprivileges.com/data/images/hpg_banners/8_SG_en.jpg`), so the same source image is used on all four slides until distinct campaign paths are provided.
- Singapore and Hong Kong use their respective four-slide English hero carousels. HK hero artwork and copy are mapped to 13_HK_en (Dining), 9_HK_en (Citi World Privileges), 14_HK_en (Notebook Ownership Program), and 11_HK_en (Reimagine Journeys with Citi).
- Restored the prior V12 popup image sizing: image column up to 390px and image max-height 230px on desktop, with responsive mobile handling.


## V15 hero and popup updates

- Uses the supplied 5_SG_en, 6_SG_en, 7_SG_en and 8_SG_en campaign banners for Shopping, Travel, Dining and Weddings.
- Automatic slide interval is 3 seconds; manual controls and reduced-motion support remain.
- Hero height is reduced by approximately 40% from V14, with mobile-specific sizing.
- Offer content uses a centred maximum-width container with at least 48px desktop side gutters and 16px mobile gutters.
- Popup image sizing/layout is restored to the V10 pattern (272:195 image ratio, full column width, two equal desktop columns, and a 1080px maximum dialog width).


## V16 Update: carousel and UAT security review

- Hero height increased by 20% relative to V15 on desktop and mobile.
- Automatic hero rotation now loops every 2 seconds and has a visible Pause/Play control. Pointer hover no longer suspends autoplay; a reduced-motion preference starts the carousel paused until the user chooses Play.
- Added defensive handling for malformed URL hashes and `rel="noopener noreferrer"` on links opened in new tabs.
- See `UAT_SECURITY_REVIEW.md` for code-level checks and the server-side headers and release checks required for UAT.


## V17 Update: category navigation and image-aware carousel text

- Clicking a category filter now scrolls the selected category strip to the top of the viewport with a small offset, keeping the filtered offers immediately below it.
- Hero autoplay now advances every 3 seconds and loops continuously; the Pause/Play control has been removed.
- The hero height is increased by approximately 10% compared with V16, with a corresponding mobile adjustment.
- Hero heading and subtitle remain hidden until the active banner image has loaded, then slide up with a brief, staggered animation. If a banner image fails to load, a dark gradient fallback keeps the text readable.
- SG and HK use separate four-slide hero carousels with market-specific banner artwork and copy.


## V18: Direct offer links and expiry management

- Each offer record now includes an `anchorId` used by external campaign links. IDs use the market prefix and stable source image identifier where available; offers without an image use a deterministic merchant/offer/date fallback.
- Direct link format (production root deployment): `https://www.citiworldprivileges.com/?country=SG&language=EN&offer=sg-img-354788#all-offers` (replace the market and anchor ID for each offer). HK links use `country=HK` and an `hk-...` anchor ID.
- Opening an offer from a card updates the address bar with the deep-link query. Closing the dialog removes only the `offer` query parameter while preserving the selected market and category hash.
- On initial load, a valid `country` query parameter selects SG or HK and a valid `offer` parameter opens the matching dialog. Unknown or malformed IDs are ignored safely.
- Offers whose `validTo` date is earlier than the browser's current local date are hidden from the main listing, search results, category filters, counts and pagination. Records remain in the source data. Missing/invalid end dates are kept visible pending source correction. A direct link to an expired offer still opens its details with the existing Expired badge, which supports historical campaign links without placing expired offers in regular browsing lists.
- The URL scheme assumes deployment at `https://www.citiworldprivileges.com/` as specified in the page's existing canonical metadata. If UAT is hosted on a different path/domain, use that base URL for UAT links and replace the production base when publishing.
- An Excel register is delivered separately with SG EN and HK EN rows, anchor IDs, URLs and paste-ready HTML anchor markup.

## External APIs, libraries and UAT security

There are no third-party JavaScript/CSS libraries, CDNs or API calls in this package. See `EXTERNAL_DEPENDENCIES.md` for all known image origins and outbound user-navigation links. See `UAT_SECURITY_REVIEW.md` for source-level XSS/URL handling checks and required server-side headers. The source review is not a substitute for the institution's approved VA/SAST/DAST and UAT security testing.


## V19 updates (30 October 2026)

- Added HK-specific hero slides: 13_HK_en (Enjoy Everyday Dining Deals), 9_HK_en (Citi World Privileges), 14_HK_en (Notebook Ownership Program), and 11_HK_en (Reimagine Journeys with Citi). SG campaign banners remain unchanged.
- Popup validity now displays a single `Offer Valid till: [end date]` line; the start date and validity range are not repeated in the dialog. Offer cards retain their existing listing date treatment.
- Clicking the Citi logo returns to the All Offers view for the currently selected country (SG or HK), preserving the selected market in the URL.
- Removed the generic source-document disclaimer from the page for both markets.
- The same footer markup is displayed in both SG and HK contexts. Confirm that the footer registration details and links are approved for both markets before production.


## V20: Hong Kong Traditional Chinese offers

- Enabled the Hong Kong Traditional Chinese (`CN`) language option. Singapore continues to offer English (`EN`) only; Hong Kong offers English (`EN`) and Traditional Chinese (`CN`).
- Added 427 published Hong Kong Traditional Chinese offer records from the supplied workbook. One English offer was not present in the CN workbook: Offer ID `353453`, Merchant ID `172494` (Moments Together Causeway Bay, 5% Off). This record is intentionally omitted from CN, as confirmed by the content owner.
- Each CN record is matched to its HK English source record by Offer ID. Merchant ID/name, validity start/end, image filename, Offer Type, Offer Sub Type, Offer Tag Name, location, contact name and deep-link anchor are inherited from the matching English record. Chinese Offer Name, Offer Description and Terms & Conditions come from the CN workbook.
- The HK CN workbook uses HTML markup inside text cells. Its content is converted to safe text and structured paragraph/bullet/numbered-list blocks before being stored in the package. The browser renders offer-supplied values through DOM text nodes; source HTML is not inserted into the page.
- HK CN category labels, search controls, offer details labels, date presentation and country/language controls use Traditional Chinese text. The page sets the document language to `zh-HK` for this view and applies Traditional Chinese font fallbacks.
- Added a Traditional Chinese four-slide HK hero carousel using the supplied wording for dining, Citi World Privileges, the Notebook Ownership Program and travel. The unsupported Mid-Autumn banner was not included because no corresponding banner image was supplied.
- Singapore EN (458 records) and Hong Kong EN (428 records) datasets are unchanged from V19. The missing CN offer remains omitted; the CN dataset contains 427 offers.


## V20.2: Singapore content refresh from raw feedback

- The Singapore dataset was refreshed using the active text from the Word document `CWP_SG_Published_Offers_Formatted_v7_27102026_raw_feedback.docx` (insertions retained; tracked deletions and manually struck-through text excluded).
- 10 offers with explicit reviewer comments to remove were removed: 100, 409, 418, 422, 423, 426, 427, 429, 435 and 437.
- Offer 348 is absent from the latest Word source and is therefore not included in this release; confirm separately whether this omission is intentional.
- Offer description blocks with explicit numbered benefits use semantic ordered lists in the modal.
- The HK EN and HK CN datasets, site layout, visual styling, hero carousel, and other interactions are retained from V20.1.


## Image storage mapping for the new VM

- Offer images and hero banners continue to use the existing public CWP image URL paths under `https://www.citiworldprivileges.com/data/images/`.
- For the new VM deployment, infrastructure must expose the mounted CWP image storage through the same public URL paths (or update the image base paths in `js/app.js`, `js/hero-carousel.js` and the CSS after the final web path is confirmed). The package does not assume a filesystem mount path.
