# 0005 - Capture-then-pay split: Solidarity Tech → Fundraise Up

- Status: Accepted
- Date: 2026-07-15

## Context

The founding-member flow originally used a single Solidarity Tech iframe embed. Donate.rebuild.us (an Action Network-hosted page) was the separate donation destination, linked from the nav "GIVE" button.

The organization needed a proper donation capture flow: first record the supporter in the CRM (ST), then process payment (FU), with the lead secured even if the donor abandons payment. Both steps should feel like one flow.

## Decision

Split the founding-member section into a two-step sequence:

1. Solidarity Tech iframe captures the supporter (name, email, opt-ins).
2. On `st:embed:submitted` (a bubbling DOM event fired by the ST embed script after successful submission), call `FundraiseUp.openCheckout(campaignId, { supporter })` to open the FU Checkout Modal — prefilled with whatever field data the ST event carries.

The ST embed URL has no `?breakout=true` — the redirect-based handoff approach was rejected because a ST page-level redirect navigates away before the FU modal can open, making the two mechanisms mutually exclusive.

If the `st:embed:submitted` event fires with no usable field data, FU opens with no prefill. The ST lead record is already secured at that point, so a slightly worse prefill experience is acceptable.

The old `donate.rebuild.us` GIVE link and its `showGive` siteSettings flag are removed from the codebase entirely.

## Consequences

- Lead capture is guaranteed regardless of whether the donor completes payment.
- The FU Checkout Modal appears inline on the splash page with no page navigation.
- The implementation has no redirect fallback; the sole handoff path is the DOM event.
- `siteSettings.fundraiseUpCampaignId` makes the campaign ID editor-configurable without a code deploy.
