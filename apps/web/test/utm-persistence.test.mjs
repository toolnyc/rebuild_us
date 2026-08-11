import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

// Runs the actual shipped script (src/scripts/utm-persistence.js, inlined raw
// into BaseLayout) in a vm sandbox with a mocked window, so tests exercise the
// exact code that ships to the browser.

const source = readFileSync(new URL("../src/scripts/utm-persistence.js", import.meta.url), "utf8");

function runScript({ search = "", pathname = "/", hash = "", stored = null, storageThrows = false } = {}) {
  const store = new Map();
  if (stored !== null) store.set("rebuild_utm", stored);
  const replaceStateCalls = [];
  const sandbox = {
    URLSearchParams,
    window: {
      location: { search, pathname, hash },
      history: {
        replaceState: (...args) => replaceStateCalls.push(args),
      },
      sessionStorage: {
        getItem: (key) => {
          if (storageThrows) throw new Error("denied");
          return store.has(key) ? store.get(key) : null;
        },
        setItem: (key, value) => {
          if (storageThrows) throw new Error("denied");
          store.set(key, String(value));
        },
      },
    },
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  return { store, replaceStateCalls };
}

const FULL_SET = {
  utm_source: "socials",
  utm_medium: "media",
  utm_campaign: "txfloods",
  utm_content: "join",
  utm_term: "flood",
};

test("URL with all five UTMs stores the set and does not rewrite the URL", () => {
  const { store, replaceStateCalls } = runScript({
    search: "?utm_source=socials&utm_medium=media&utm_campaign=txfloods&utm_content=join&utm_term=flood",
  });
  assert.deepEqual(JSON.parse(store.get("rebuild_utm")), FULL_SET);
  assert.equal(replaceStateCalls.length, 0);
});

test("URL with a partial UTM set stores exactly that set", () => {
  const { store, replaceStateCalls } = runScript({ search: "?utm_source=socials&utm_campaign=txfloods" });
  assert.deepEqual(JSON.parse(store.get("rebuild_utm")), {
    utm_source: "socials",
    utm_campaign: "txfloods",
  });
  assert.equal(replaceStateCalls.length, 0);
});

test("URL params overwrite a previously stored set (URL wins, last touch)", () => {
  const { store } = runScript({
    search: "?utm_campaign=new",
    stored: JSON.stringify(FULL_SET),
  });
  assert.deepEqual(JSON.parse(store.get("rebuild_utm")), { utm_campaign: "new" });
});

test("empty UTM values in the URL are ignored", () => {
  const { store, replaceStateCalls } = runScript({ search: "?utm_source=&utm_medium=" });
  assert.equal(store.has("rebuild_utm"), false);
  assert.equal(replaceStateCalls.length, 0);
});

test("no URL UTMs + stored set restores them, preserving existing params and hash", () => {
  const { replaceStateCalls } = runScript({
    search: "?fundraiseupLivemode=no",
    pathname: "/resources",
    hash: "#guides",
    stored: JSON.stringify(FULL_SET),
  });
  assert.equal(replaceStateCalls.length, 1);
  const url = replaceStateCalls[0][2];
  assert.ok(url.startsWith("/resources?"), url);
  assert.ok(url.endsWith("#guides"), url);
  const params = new URLSearchParams(url.slice("/resources".length, -"#guides".length));
  assert.equal(params.get("fundraiseupLivemode"), "no");
  for (const [key, value] of Object.entries(FULL_SET)) {
    assert.equal(params.get(key), value);
  }
});

test("restore on the homepage produces a clean root URL", () => {
  const { replaceStateCalls } = runScript({
    pathname: "/",
    stored: JSON.stringify({ utm_source: "socials" }),
  });
  assert.equal(replaceStateCalls[0][2], "/?utm_source=socials");
});

test("no URL UTMs + no stored set is a no-op", () => {
  const { store, replaceStateCalls } = runScript({ search: "?foo=bar" });
  assert.equal(store.has("rebuild_utm"), false);
  assert.equal(replaceStateCalls.length, 0);
});

test("malformed stored JSON is ignored without throwing", () => {
  const { replaceStateCalls } = runScript({ stored: "{not json" });
  assert.equal(replaceStateCalls.length, 0);
});

test("stored sets with unknown or empty keys are filtered to the five UTM keys", () => {
  const { replaceStateCalls } = runScript({
    pathname: "/resources",
    stored: JSON.stringify({ utm_source: "socials", utm_source_evil: "x", ref: "y", utm_term: "", nested: { a: 1 } }),
  });
  assert.equal(replaceStateCalls.length, 1);
  assert.equal(replaceStateCalls[0][2], "/resources?utm_source=socials");
});

test("stored set containing only invalid keys is a no-op", () => {
  const { replaceStateCalls } = runScript({ stored: JSON.stringify({ ref: "y", utm_term: "" }) });
  assert.equal(replaceStateCalls.length, 0);
});

test("storage failure on write does not crash and does not rewrite the URL", () => {
  const { replaceStateCalls } = runScript({ search: "?utm_source=socials", storageThrows: true });
  assert.equal(replaceStateCalls.length, 0);
});

test("storage failure on read does not crash and skips restore", () => {
  const { replaceStateCalls } = runScript({ pathname: "/resources", storageThrows: true });
  assert.equal(replaceStateCalls.length, 0);
});

test("non-UTM marketing params (ref, fbclid, gclid) are neither stored nor restored", () => {
  const storedRun = runScript({ search: "?ref=instagram&fbclid=abc123" });
  assert.equal(storedRun.store.has("rebuild_utm"), false);
  assert.equal(storedRun.replaceStateCalls.length, 0);
});
