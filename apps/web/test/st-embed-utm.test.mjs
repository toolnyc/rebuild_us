import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

// Runs the actual shipped script (src/scripts/st-embed-utm.js, inlined raw
// into BaseLayout) in a vm sandbox with a mocked window/document, so tests
// exercise the exact code that ships to the browser.

const source = readFileSync(new URL("../src/scripts/st-embed-utm.js", import.meta.url), "utf8");

const EMBED_SRC = "https://act.rebuild.us/web/embed";
const EMBED_ORIGIN = "https://act.rebuild.us";

function makeIframe({ src = EMBED_SRC, embed = true, throwsOnSend = false } = {}) {
  const iframe = {
    tagName: "IFRAME",
    sent: [],
    hasAttribute: (name) => (name === "data-st-embed" ? embed : false),
    getAttribute: (name) => (name === "src" ? src : null),
    contentWindow: {
      postMessage: (...args) => {
        if (throwsOnSend) throw new Error("denied");
        iframe.sent.push(args);
      },
    },
  };
  return iframe;
}

// Minimal anchor mock: browsers resolve protocol/host from href; Node's URL
// gives the same result for the absolute srcs our embeds use.
function makeAnchor() {
  const anchor = { protocol: "", host: "" };
  Object.defineProperty(anchor, "href", {
    set(value) {
      try {
        const url = new URL(value);
        anchor.protocol = url.protocol;
        anchor.host = url.host;
      } catch {
        anchor.protocol = "";
        anchor.host = "";
      }
    },
  });
  return anchor;
}

// Objects created inside the vm context carry the vm realm's prototype, which
// deepStrictEqual rejects — normalize through JSON before comparing.
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

function runScript({ search = "", href = "https://survivors.rebuild.us/resources", iframes = [] } = {}) {
  const listeners = { load: [], message: [] };
  const sandbox = {
    URLSearchParams,
    URL,
    window: {
      location: { search, href },
      addEventListener: (type, fn, capture) => listeners[type].push({ fn, capture }),
    },
    document: {
      createElement: () => makeAnchor(),
      querySelectorAll: (selector) => (selector === "iframe[data-st-embed]" ? iframes : []),
    },
  };
  sandbox.window.document = sandbox.document;
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);

  return {
    listeners,
    fireLoad: (target) => listeners.load.forEach(({ fn }) => fn({ target })),
    fireMessage: (event) => listeners.message.forEach(({ fn }) => fn(event)),
  };
}

test("registers a capture-phase load listener and a message listener", () => {
  const { listeners } = runScript();
  assert.equal(listeners.load.length, 1);
  assert.equal(listeners.load[0].capture, true);
  assert.equal(listeners.message.length, 1);
});

test("iframe load sends st:embed:context with URL utms to the iframe origin", () => {
  const iframe = makeIframe();
  const { fireLoad } = runScript({
    search: "?utm_source=socials&utm_medium=media&utm_campaign=txfloods&utm_content=join&utm_term=flood",
    href: "https://survivors.rebuild.us/resources?utm_source=socials",
    iframes: [iframe],
  });
  fireLoad(iframe);
  assert.equal(iframe.sent.length, 1);
  const [payload, origin] = iframe.sent[0];
  assert.equal(origin, EMBED_ORIGIN);
  assert.equal(payload.type, "st:embed:context");
  assert.equal(payload.v, 1);
  assert.deepEqual(plain(payload.utm), {
    utm_source: "socials",
    utm_medium: "media",
    utm_campaign: "txfloods",
    utm_content: "join",
    utm_term: "flood",
  });
  assert.equal(payload.hostUrl, "https://survivors.rebuild.us/resources?utm_source=socials");
});

test("hostUrl drops the hash", () => {
  const iframe = makeIframe();
  const { fireLoad } = runScript({
    search: "",
    href: "https://survivors.rebuild.us/resources#guides",
    iframes: [iframe],
  });
  fireLoad(iframe);
  assert.equal(iframe.sent[0][0].hostUrl, "https://survivors.rebuild.us/resources");
});

test("ref is forwarded for parity with v1.js; other params are not", () => {
  const iframe = makeIframe();
  const { fireLoad } = runScript({
    search: "?ref=instagram&fbclid=abc&utm_source=socials",
    iframes: [iframe],
  });
  fireLoad(iframe);
  assert.deepEqual(plain(iframe.sent[0][0].utm), { ref: "instagram", utm_source: "socials" });
});

test("with no marketing params an empty utm map is sent (v1.js parity)", () => {
  const iframe = makeIframe();
  const { fireLoad } = runScript({ search: "?foo=bar", iframes: [iframe] });
  fireLoad(iframe);
  assert.deepEqual(plain(iframe.sent[0][0].utm), {});
});

test("load events for non-embed iframes and non-iframe targets are ignored", () => {
  const plainIframe = makeIframe({ embed: false });
  const { fireLoad } = runScript({ search: "?utm_source=socials", iframes: [plainIframe] });
  fireLoad(plainIframe);
  fireLoad({ tagName: "IMG" });
  fireLoad({});
  assert.equal(plainIframe.sent.length, 0);
});

test("iframe without a src attribute is ignored", () => {
  const iframe = makeIframe({ src: null });
  const { fireLoad } = runScript({ search: "?utm_source=socials", iframes: [iframe] });
  fireLoad(iframe);
  assert.equal(iframe.sent.length, 0);
});

test("st:embed:loaded from a registered embed triggers a send", () => {
  const iframe = makeIframe();
  const { fireMessage } = runScript({ search: "?utm_source=socials", iframes: [iframe] });
  fireMessage({ data: { type: "st:embed:loaded" }, origin: EMBED_ORIGIN, source: iframe.contentWindow });
  assert.equal(iframe.sent.length, 1);
  assert.equal(iframe.sent[0][0].type, "st:embed:context");
});

test("st:embed:loaded from the wrong origin is not trusted", () => {
  const iframe = makeIframe();
  const { fireMessage } = runScript({ search: "?utm_source=socials", iframes: [iframe] });
  fireMessage({ data: { type: "st:embed:loaded" }, origin: "https://evil.example", source: iframe.contentWindow });
  assert.equal(iframe.sent.length, 0);
});

test("st:embed:loaded from an unknown window is ignored", () => {
  const iframe = makeIframe();
  const { fireMessage } = runScript({ search: "?utm_source=socials", iframes: [iframe] });
  fireMessage({ data: { type: "st:embed:loaded" }, origin: EMBED_ORIGIN, source: {} });
  assert.equal(iframe.sent.length, 0);
});

test("unrelated messages are ignored", () => {
  const iframe = makeIframe();
  const { fireMessage } = runScript({ search: "?utm_source=socials", iframes: [iframe] });
  fireMessage({ data: { type: "st:embed:resize", height: 500 }, origin: EMBED_ORIGIN, source: iframe.contentWindow });
  fireMessage({ data: null, origin: EMBED_ORIGIN, source: iframe.contentWindow });
  fireMessage({ data: "st:embed:loaded", origin: EMBED_ORIGIN, source: iframe.contentWindow });
  assert.equal(iframe.sent.length, 0);
});

test("both hooks fire for one iframe without error (child dedupes)", () => {
  const iframe = makeIframe();
  const { fireLoad, fireMessage } = runScript({ search: "?utm_source=socials", iframes: [iframe] });
  fireLoad(iframe);
  fireMessage({ data: { type: "st:embed:loaded" }, origin: EMBED_ORIGIN, source: iframe.contentWindow });
  assert.equal(iframe.sent.length, 2);
});

test("a throwing postMessage does not crash the handler", () => {
  const iframe = makeIframe({ throwsOnSend: true });
  const { fireLoad } = runScript({ search: "?utm_source=socials", iframes: [iframe] });
  fireLoad(iframe); // must not throw
  assert.equal(iframe.sent.length, 0);
});
