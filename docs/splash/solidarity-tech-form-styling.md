# Solidarity Tech Form Styling Reference

Inventory of every styleable element on the two Solidarity Tech forms embedded on the splash page, so the styling CSS can be written when the live forms are final. This catalogues **how** to target each element (mechanism + selectors), not what visual treatment to apply. Owner: Pete (see `build-plan.md`, "Ownership & dependencies").

## How styling is applied

Styling is done **on the Solidarity Tech side**, not from our Astro app. The embeds are cross-origin iframes; our CSS cannot reach inside them and there is no theme URL parameter.

CSS is injected via **Page Settings → Head HTML** (per-page) or **Website → Settings → Site-wide HTML Head Content** (all pages), as a `<style>` block. Site-wide holds selectors shared by both forms; per-page holds form-specific rules. Docs: <https://www.solidarity.tech/docs/custom-code>.

Both forms are Bootstrap 3-based, so ST's framework rules may need `!important` to override. Selectors below are confirmed from the live DOM of `act.rebuild.us/founding-member` and `act.rebuild.us/join-form`. **Re-verify against the final published forms** — class names can shift if Paul changes field config.

### Two hard limits (cannot be styled with CSS)

- **Stripe card fields** (card number, CVC, expiry) render in a cross-origin Stripe iframe. Only the `.payment-card-container` wrapper is reachable.
- **hCaptcha widget** renders in a cross-origin frame. Not themeable.

---

## Shared elements (both forms)

Put these in the site-wide Head HTML so both forms inherit them.

| Element | Selector(s) | Notes |
| --- | --- | --- |
| Page wrapper | `body`, `.page-wrapper` | Outermost containers |
| Page title | `.page-header .title`, `.action-page-form-title` | Main headline |
| Subtitle / intro copy | `.page-header .subtitle` | |
| Field labels | `.control-label` | Also `.control-label.normal` variant |
| Text inputs / email / tel / select / textarea | `.form-control` | Bootstrap input class |
| Input focus state | `.form-control:focus` | |
| Field wrapper | `.form-group`, `.input-component`, `.user-input-component` | Controls spacing between fields |
| Inline validation error | `.help-block.with-errors`, `.with-errors` | |
| Field hint | `.form-hint` | Helper text under field |
| Primary / submit button | `.btn-primary`, `.submit`, `.btn-lg` | Composed as `btn btn-primary submit btn-lg` |
| Secondary / outline button | `.btn-gray-outline`, `.btn.outline` | Also used by share buttons |
| Disclaimer block | `.action-page-form-disclaimer` | TCPA / consent fine print |
| Links (Privacy, Terms, in-content) | `.action-page-form-disclaimer a`, `.page-wrapper a:not(.btn):not(.navbar-brand):not(.round-tab)` | Link styling is not inherited; target explicitly |
| Navbar (if shown) | `.navbar`, `.navbar-brand`, `.navbar-default` | Or use "Hide Navbar" in Page Settings |
| Footer + ST branding | `.solidarity-tech-branding`, `.icon-solidarity-tech` | "Made in Solidarity Tech" mark |
| Radio inputs (raw) | `.radio-inline-input` | Can be hidden to target the wrapping label instead |

### Share overlay / social buttons (both forms)

Shown on the post-submission share overlay. All are `a.btn.btn-gray-outline ... .share-link`.

| Item | Selector |
| --- | --- |
| Facebook | `.btn-facebook.fb_share_button.share-link` |
| Twitter/X | `.btn-gray-outline.twitter.share-link` |
| Bluesky | `.btn-gray-outline.bluesky.share-link` |
| Email | `.btn-gray-outline.email.share-link` |
| WhatsApp | `.btn-gray-outline.whatsapp.share-link` |
| Copy link | `.copy-link`, `.copy-link-input`, `.copy-success`, `.copy-begin` |
| Share overlay container | `.sharing_overlay`, `.overlay_text` |

---

## Form 1 — Founding Member (`/founding-member`)

Donation page. 3-step stepper: **Amount → Details → Payment**. Stripe + hCaptcha. Multilingual (EN/ES toggle).

### Stepper / progress tracker

| Item | Selector | Notes |
| --- | --- | --- |
| Stepper container | `.stepper`, `.multipage`, `.multipage_subform-component` | |
| Step tab bubble | `.stepper .round-tab` | Numbered 1/2/3 circles |
| Active/selected step | `.stepper .active .round-tab`, `.stepper .selected .round-tab` | Current-step state |
| Step label text | `.step-label` | "Amount" / "Details" / "Payment" |
| Step nav tabs | `.nav-tabs`, `.nav-justified`, `.tab-content`, `.tab-pane`, `.stepper-pane` | |
| Mobile stepper | `.mobile-stepper`, `.mobile-round-tab-container`, `.mobile-tracker-labels`, `.mobile-tracker-labels.active_header` | Separate mobile markup |
| Persistent amount tab | `a.persistant` | Shows chosen amount in tab title via Liquid |

### Step 1 — Amount

Preset amounts are **radio inputs wrapped in labels** (`.donation-amount-label` wraps `input.radio-inline-input`). The raw radio can be hidden and the label targeted directly.

| Item | Selector | Notes |
| --- | --- | --- |
| Amount component | `.donation_amount-component`, `.donation_amount` | Wrapper |
| Preset label container | `.donation-amount-label-container` | Grid cell (`col-*-*`) |
| Preset label | `.donation-amount-label` (`.control-label.normal.donation-amount-label`) | Wraps `<input type=radio .radio-inline-input>`, values $1/$5/$10/$25/other |
| Preset selected state | `.donation-amount-label.selected`, `.donation-amount-label:has(input:checked)` | JS adds `.selected`; `:has` covers native `:checked` |
| "Other" amount input | `input[name="donation_amount_other"]`, `.donation_amount_other` | Custom amount field |
| "Choose an amount" heading | `.control-label` | Carries an inline `style`; needs `!important` to override |
| Recurring component | `.donation_recurring-component`, `.donation_recurring` | "Make it monthly!" |
| Recurring option label | `.donation-recurring-label` | Yes / No, wraps radio |
| Recurring selected state | `.donation-recurring-label.selected`, `.donation-recurring-label:has(input:checked)` | |
| Recurring options wrap | `.donation-recurring-options-container` | |

### Step 2 — Details

Standard fields via `.form-control` / `.control-label` (email with "did you mean?", full name, phone). Plus custom questions:

| Item | Selector | Notes |
| --- | --- | --- |
| Email "did you mean?" suggestion | `#email_suggestions_container` (`.hidden` until shown) | Typo-correction UI |
| Survivor question (radios) | `.radios-component`, `.radio-inline-input` | Yes/No |
| Welcome-call question (radios) | `.radios-component`, `.radio-inline-input` | Date options |

### Step 3 — Payment

| Item | Selector | Notes |
| --- | --- | --- |
| Zip code | `.form-control` | |
| Payment card component | `.payment_card-component`, `.payment-card-container` | **Wrapper only** — card inputs are in Stripe iframe |
| Payment card label | `.payment-card-label` | |
| Fee-cover option | (inspect on live form) | "Amplify your impact… cover the processing fee" checkbox |
| Submit button | `.submit-button-container .submit`, `.btn-primary.btn-lg` | |
| hCaptcha | (cross-origin iframe) | **Not styleable** |

### Navigation buttons

| Item | Selector |
| --- | --- |
| Continue / next step | `.next-step` (`.next-step.btn.btn-lg.btn-primary.ml-10`) |
| Go-to-form CTA | `.go_to_form.btn.btn-primary` |
| Mobile fixed CTA bar | `.fixed_bottom_action_button` |

### Language toggle (EN | ES)

| Item | Selector |
| --- | --- |
| Toggle container | `.ap-language-toggle` |
| Current language | `.ap-language-toggle__current` |
| Language link | `.ap-language-toggle__link` |
| Separator | `.ap-language-toggle__sep` |

---

## Form 2 — Get Involved / Join (`/join-form`)

Single-step signup: Full Name, Email, Phone, SMS opt-in (Yes/No). No payment.

| Item | Selector | Notes |
| --- | --- | --- |
| Field wrapper | `.input-component.form-group.user-input-component` | |
| Full name | `input#full_name.form-control` | `name="full_name"`, pattern-validated |
| Email | `input#email.form-control` | `name="email"` |
| Email "did you mean?" | `#email_suggestions_container` (`.hidden`) | Same typo-correction UI as Form 1 |
| Phone (visible) | `input#pretty_phone_number.form-control` | `type=tel`; `data-home-country=["US","PR","CA"]` |
| Phone (hidden store) | `input#phone_number` | Do not style |
| Country / dial-code selector | **runtime-rendered** (flag + "+1" dropdown) | Not in static HTML — inspect the live rendered DOM to get its classes |
| Phone hint / error | `.form-hint`, `.help-block.with-errors` | |
| SMS consent fieldset | `#sms_permission`, `.pb-fieldset`, `legend.sr-only` | |
| SMS consent label | `.consent-label` (`.normal.display-inline-block.consent-label`, `.normal.ml-10...`) | The agree-to-texts copy |
| SMS Yes/No radios | `input[name="sms_permission"].radio-inline-input` | Required |
| Submit | `.btn-primary.submit.btn-lg` | "Submit" |
| Disclaimer (TCPA) | `.action-page-form-disclaimer` | Privacy Policy + Terms links |

---

## Open TODOs before writing final CSS

- [ ] Re-inspect both forms after Paul finalizes field config; confirm class names haven't changed.
- [ ] Capture the **phone country-code dropdown** classes from the live rendered DOM (JS-injected, absent from static HTML).
- [ ] Confirm the **fee-cover checkbox** selector on Step 3 of Form 1.
- [ ] Decide Navbar/footer visibility (Page Settings "Hide Navbar" / "Hide footer") vs. CSS.
- [ ] Verify Spanish (`?locale=es`) rendering still works once styling is applied.
