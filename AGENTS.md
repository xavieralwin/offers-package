# Antigravity Agent Guidelines — Citi World Privileges Offers Package

This document serves as the Standard Operating Procedure (SOP) for any AI agent working on this repository. Follow these exact procedures whenever the user asks to add, edit, or remove offers.

---

## 1. Quick Decision: Target Dataset

* **Singapore offers**:
  * Edit **`data/offers.js`** (`window.OFFERS_DATA`) **only**.
  * Never modify `data/offers-hk-en.js` or `data/offers-hk-cn.js` for Singapore offers (even if Chinese text is mentioned in the form).
* **Hong Kong offers**:
  * Edit **both** **`data/offers-hk-en.js`** (`window.HK_OFFERS_EN`) **and** **`data/offers-hk-cn.js`** (`window.HK_OFFERS_CN`).
  * In `data/offers-hk-cn.js`, retain English `merchantName` (standard HK catalog convention) and set Chinese text in `offerName`, `offerDescriptions`, `offerDescriptionBlocks`, and `offerTermsAndConditions`.

---

## 2. Workflow: Adding a New Offer

When the user pastes a raw offer submission (or uploads a screenshot of the form), execute the following steps in sequence:

### Step 1: Sequential Offer Number
* Scan the target dataset for the highest existing `offerNumber`.
* Assign `offerNumber = highestExistingOfferNumber + 1`.
* **Rule**: Never renumber, shift, or reuse existing `offerNumber`s.

### Step 2: Merchant ID & Anchor ID
* If `Merchant ID` is blank in the business submission — or if an existing merchant receives a new campaign needing its own banner/URL:
  * Generate a random **6-digit** integer (`100000`–`999999`) that does **not** overlap with any existing `merchantId` across:
    1. `data/offers.js`
    2. `data/offers-hk-en.js`
    3. `data/offers-hk-cn.js`
    4. Both sheets of `merchant-id-register.xlsx` (`Generated Merchant IDs` and `Pre-existing Merchant IDs`)
* **`anchorId`**:
  * Singapore: `sg-img-<merchantId>`
  * Hong Kong: `hk-img-<merchantId>`
* **`offerImage`**: `offer_merc_image_<merchantId>.jpg` (production base URL: `https://www.citiworldprivileges.com/data/images/offer_images/272x195/`).
* **Direct URL**:
  * Singapore: `https://www.citiworldprivileges.com/?country=SG&language=EN&offer=sg-img-<merchantId>#all-offers`
  * Hong Kong EN: `https://www.citiworldprivileges.com/?country=HK&language=EN&offer=hk-img-<merchantId>#all-offers`
  * Hong Kong CN: `https://www.citiworldprivileges.com/?country=HK&language=CN&offer=hk-img-<merchantId>#all-offers`

### Step 3: Format Offer Data Fields
* **`validity` / `validFrom` / `validTo`**:
  * `validity`: `DD-Mon-YY To DD-Mon-YY` (e.g., `01-Dec-26 To 31-Dec-26`).
  * `validFrom`: ISO format `YYYY-MM-DD` (e.g., `2026-12-01`).
  * `validTo`: ISO format `YYYY-MM-DD` (e.g., `2026-12-31`).
  * If date fields are blank in the form, extract the exact start and end dates from the first clause of the Terms & Conditions.
* **`offerType` & `offerSubType`**:
  * Use exact Title Case categories (e.g., `Travel` / `Tours & Experiences`, `Dining` / `Japanese`, `Shopping` / `Online Shopping`).
* **`offerTagName`**: Use `"NULL"` if no tag is specified in the form.
* **`offerDescriptions`**:
  * Clean array of strings.
  * If there are sections or multi-tier promotions, use headings ending with `:` (e.g. `"Mega 12.12 Sale:"`) and provide semantic `offerDescriptionBlocks`.
  * Standalone `"Terms & Condition Apply"` or `"Terms and Conditions apply."` lines are automatically rendered as standalone modal disclaimers.
* **`offerTermsAndConditions`**:
  * Split into individual clauses (one clause per array element).
  * Strip leading bullet characters (`-`, `•`, `*`) because the UI renders bullets natively.
  * **Critical**: Escape all inner double quotes with backslashes (`\"`).

### Step 4: Append to Dataset File
Append the new offer object cleanly right before the closing bracket `]` of `data/offers.js` (or HK files).

```json
    {
      "offerNumber": 482,
      "merchantId": "383233",
      "merchantName": "Klook",
      "validity": "01-Dec-26 To 31-Dec-26",
      "validFrom": "2026-12-01",
      "validTo": "2026-12-31",
      "offerType": "Travel",
      "offerSubType": "Tours & Experiences",
      "offerTagName": "NULL",
      "offerName": "Mega 12.12 Sale",
      "location": "Singapore",
      "name": "Dylan Xie",
      "offerImage": "offer_merc_image_383233.jpg",
      "offerDescriptions": [ ... ],
      "offerTermsAndConditions": [ ... ],
      "anchorId": "sg-img-383233"
    }
```

### Step 5: Append to `merchant-id-register.xlsx`
Append a new row to the **`Generated Merchant IDs`** sheet with all 17 columns in exact order:

| Column # | Column Name | Format / Value |
| :--- | :--- | :--- |
| 1 | `Merchant ID` | 6-digit string |
| 2 | `ID Assignment` | `'Random (Non-overlapping)'` |
| 3 | `Offer Number` | integer |
| 4 | `Country` | `'Singapore'` or `'Hong Kong'` |
| 5 | `Merchant Name` | Exact brand name |
| 6 | `Offer Name` | Headline copy |
| 7 | `Category` | e.g. `'Travel'` |
| 8 | `Category Sub` | e.g. `'Tours & Experiences'` |
| 9 | `Valid From` | `'YYYY-MM-DD'` |
| 10 | `Valid To` | `'YYYY-MM-DD'` |
| 11 | `Validity` | `'DD-Mon-YY To DD-Mon-YY'` |
| 12 | `Requested By` | Requester name |
| 13 | `Offer Banner Image` | `'offer_merc_image_<merchantId>.jpg'` |
| 14 | `Anchor ID` | `'sg-img-<merchantId>'` or `'hk-img-<merchantId>'` |
| 15 | `Direct URL` | Full deep link URL |
| 16 | `Added Date` | Today's date (`'YYYY-MM-DD'`) |
| 17 | `Notes` | Specific market & campaign notes |

> **IMPORTANT POWERSHELL RULE:**
> Always write a temporary Python script file in `scratch/*.py` to update Excel. **Never** pass currency strings like `S$5` or `S$60` inside `python -c "..."` on Windows PowerShell, because PowerShell evaluates `$5` or `$60` as empty variables and strips them.

### Step 6: Append to `images.txt`
Append the production image URL on a new line at the bottom of `images.txt`:
```text
https://www.citiworldprivileges.com/data/images/offer_images/272x195/offer_merc_image_<merchantId>.jpg
```

### Step 7: Verification Checks
Execute in one command:
```powershell
node --check data/offers.js; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
```
Confirm:
1. JavaScript syntax is valid.
2. `offerNumber`, `merchantId`, and `anchorId` are unique.
3. Row is added to `merchant-id-register.xlsx` with intact `S$` currency symbols.
4. Line is added to `images.txt`.

---

## 3. Workflow: Editing an Existing Offer

When the user asks to edit an offer:
1. Locate the offer by `offerNumber`, `merchantId`, or `merchantName`.
2. If Hong Kong: update both `data/offers-hk-en.js` and `data/offers-hk-cn.js`.
3. Update the corresponding row in `merchant-id-register.xlsx` (e.g. `Offer Name`).
4. Run `node --check` to verify syntax.

---

## 4. Platform Start Date & Expiry Logic

* **Live (`www.citiworldprivileges.com`)**:
  * Unstarted offers (`validFrom > today`) are automatically **hidden** from the public grid, category counts, and search results until their start date arrives.
  * Expired offers (`validTo < today`) are automatically **hidden**.
  * At midnight, the internal timer (`scheduleExpiryRefresh`) publishes starting offers and removes expired offers with no redeployment required.
  * Direct links (`?offer=<anchorId>`) can still preview unstarted offers with the **`Upcoming`** (`即將推出`) status badge.
* **Staging (`stagingv3.citiworldprivileges.com` / `localhost`)**:
  * Unstarted offers remain **visible** in the grid with the **`Upcoming`** status badge so QA can test them in advance.
  * Append `?env=live` to simulate live-mode behavior on Staging or Localhost.
