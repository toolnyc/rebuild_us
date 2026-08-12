/*!
 * Reliable UTM delivery to Solidarity Tech embeds.
 * See docs/utm-pass-through-spec.md for the full research and rationale.
 *
 * Inlined parser-blocking in BaseLayout <head>, after utm-persistence.js (so
 * window.location.search already reflects any restored UTMs) and before
 * act.rebuild.us/embed/v1.js.
 *
 * Why this exists: v1.js only forwards UTMs by postMessaging st:embed:context
 * from a `load` listener it attaches at DOMContentLoaded or later (it loads
 * async). If the iframe finishes loading first — warm cache, slow script
 * download — the event is missed and the form submits with NO UTM inputs.
 * Reproduced against production 2026-08-12 by delaying v1.js: the Web Basic
 * embed received zero UTM inputs.
 *
 * This script closes the race by sending the same st:embed:context message
 * ourselves, on two independent hooks registered before any iframe is parsed:
 *
 * 1. Capture-phase window `load` listener — `load` does not bubble, but
 *    capture-phase listeners on window see it for every subresource, so no
 *    iframe load can be missed, whenever it fires.
 * 2. `st:embed:loaded` messages from the child — the embed announces itself
 *    when its own JS boots (verified on production), which also covers the
 *    case where the child's message listener attaches after its load event.
 *
 * The child handler is idempotent (it skips inputs a form already has), so
 * duplicate sends from these hooks and from v1.js are harmless. Payload shape
 * mirrors v1.js exactly, including `ref` in the forwarded key set for parity
 * (persistence still stores/restores only the five utm_* keys).
 *
 * All failures are swallowed — attribution must never break the page.
 *
 * Tested in test/st-embed-utm.test.mjs (runs this file in a vm sandbox).
 */
(function () {
  "use strict";

  // Same key set v1.js forwards (its UTM_KEYS includes ref).
  var FORWARD_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref"];
  var MESSAGE_CONTEXT = "st:embed:context";
  var MESSAGE_LOADED = "st:embed:loaded";

  function originOf(url) {
    try {
      var a = document.createElement("a");
      a.href = url;
      if (!a.protocol || !a.host) return null;
      return a.protocol + "//" + a.host;
    } catch (e) {
      return null;
    }
  }

  // Reads the params to forward from the current page URL. Runs at send time,
  // after utm-persistence.js has already restored any stored set into the URL.
  function hostUtmParams() {
    var out = {};
    try {
      var params = new URLSearchParams(window.location.search);
      for (var i = 0; i < FORWARD_KEYS.length; i++) {
        var value = params.get(FORWARD_KEYS[i]);
        if (value) out[FORWARD_KEYS[i]] = value;
      }
    } catch (e) {
      /* noop */
    }
    return out;
  }

  function sendContext(iframe) {
    try {
      var src = iframe.getAttribute("src");
      if (!src) return;
      var origin = originOf(src);
      if (!origin || !iframe.contentWindow) return;
      iframe.contentWindow.postMessage(
        {
          type: MESSAGE_CONTEXT,
          v: 1,
          utm: hostUtmParams(),
          hostUrl: window.location.href.split("#")[0],
        },
        origin
      );
    } catch (e) {
      /* noop */
    }
  }

  function isEmbedIframe(el) {
    return !!(
      el &&
      el.tagName &&
      String(el.tagName).toUpperCase() === "IFRAME" &&
      typeof el.hasAttribute === "function" &&
      el.hasAttribute("data-st-embed")
    );
  }

  function onLoadCapture(event) {
    try {
      if (isEmbedIframe(event.target)) sendContext(event.target);
    } catch (e) {
      /* noop */
    }
  }

  function onMessage(event) {
    try {
      var data = event.data;
      if (!data || typeof data !== "object" || data.type !== MESSAGE_LOADED) return;
      var iframes = document.querySelectorAll("iframe[data-st-embed]");
      for (var i = 0; i < iframes.length; i++) {
        var iframe = iframes[i];
        if (iframe.contentWindow !== event.source) continue;
        // Match on origin as well as the window handle before trusting the
        // message, same as v1.js's findInstance.
        var src = iframe.getAttribute("src");
        var origin = src ? originOf(src) : null;
        if (origin && event.origin === origin) sendContext(iframe);
        return;
      }
    } catch (e) {
      /* noop */
    }
  }

  try {
    window.addEventListener("load", onLoadCapture, true);
    window.addEventListener("message", onMessage);
  } catch (e) {
    /* attribution must never break the page */
  }
})();
