/*!
 * UTM persistence for Solidarity Tech attribution.
 * See docs/utm-pass-through-spec.md for the full research and rationale.
 *
 * Inlined parser-blocking in BaseLayout <head> BEFORE act.rebuild.us/embed/v1.js,
 * so ST's hostUtmParams() sees restored UTMs in window.location.search on every
 * page, including pages the visitor navigates to after landing.
 *
 * Behavior:
 * - If any utm_* param is present in the URL, that exact set is stored (URL
 *   always wins; last touch within the session) and nothing else happens —
 *   ST reads the URL directly.
 * - If no utm_* param is present but a stored set exists, the stored set is
 *   re-attached to the URL via history.replaceState (preserving existing
 *   params and hash) before the ST embed script runs.
 *
 * Storage is sessionStorage with a MAX_AGE_MS time-to-live. sessionStorage
 * alone is not a real session boundary: Firefox and Chrome restore it when
 * the user restores their browser session, which leaked days-old test UTMs
 * into later direct visits (observed in production 2026-08-12). The TTL keeps
 * attribution to a genuine same-day browsing session; stored sets older than
 * the TTL — and pre-TTL sets with no timestamp — are discarded on read.
 *
 * All failures are swallowed — attribution must never break the page.
 *
 * Tested in test/utm-persistence.test.mjs (runs this file in a vm sandbox).
 */
(function () {
  "use strict";

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var STORE_KEY = "rebuild_utm";
  // 12 hours: covers a real same-day visit chain, kills next-day leaks from
  // restored browser sessions.
  var MAX_AGE_MS = 12 * 60 * 60 * 1000;

  function dropStored() {
    try {
      window.sessionStorage.removeItem(STORE_KEY);
    } catch (e) {
      /* noop */
    }
  }

  function readStore() {
    try {
      var raw = window.sessionStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || typeof data !== "object") return null;
      // Require a fresh timestamp. Legacy sets (flat utm map, no timestamp)
      // predate the TTL and are treated as expired.
      if (typeof data.t !== "number" || Date.now() - data.t > MAX_AGE_MS) {
        dropStored();
        return null;
      }
      var utm = data.utm;
      if (!utm || typeof utm !== "object") return null;
      var clean = {};
      var has = false;
      for (var i = 0; i < UTM_KEYS.length; i++) {
        var key = UTM_KEYS[i];
        if (typeof utm[key] === "string" && utm[key]) {
          clean[key] = utm[key];
          has = true;
        }
      }
      return has ? clean : null;
    } catch (e) {
      return null;
    }
  }

  // Stores the URL's UTM set. Returns true when the URL carried any UTMs.
  function writeStoreFromUrl(params) {
    var out = {};
    var has = false;
    for (var i = 0; i < UTM_KEYS.length; i++) {
      var value = params.get(UTM_KEYS[i]);
      if (value) {
        out[UTM_KEYS[i]] = value;
        has = true;
      }
    }
    if (!has) return false;
    try {
      window.sessionStorage.setItem(STORE_KEY, JSON.stringify({ t: Date.now(), utm: out }));
    } catch (e) {
      /* storage unavailable; this page's attribution still works */
    }
    return true;
  }

  try {
    var params = new URLSearchParams(window.location.search);
    if (writeStoreFromUrl(params)) return;

    var stored = readStore();
    if (!stored) return;

    var restored = new URLSearchParams(window.location.search);
    var added = false;
    for (var j = 0; j < UTM_KEYS.length; j++) {
      var k = UTM_KEYS[j];
      if (stored[k] && !restored.get(k)) {
        restored.set(k, stored[k]);
        added = true;
      }
    }
    if (!added) return;

    var search = restored.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (search ? "?" + search : "") + window.location.hash
    );
  } catch (e) {
    /* attribution must never break the page */
  }
})();
