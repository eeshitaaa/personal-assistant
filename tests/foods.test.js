import test from "node:test";
import assert from "node:assert/strict";
import handler from "../api/foods.js";
import process from "node:process";
function response() {
  return {
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
test("food endpoint validates config, inputs and provider results without exposing key", async () => {
  const previous = process.env.USDA_API_KEY,
    originalFetch = globalThis.fetch;
  try {
    delete process.env.USDA_API_KEY;
    let r = response();
    await handler({ method: "GET", query: {} }, r);
    assert.equal(r.code, 200);
    assert.deepEqual(r.body, { configured: false });
    r = response();
    await handler({ method: "GET", query: { q: "rice" } }, r);
    assert.equal(r.code, 503);
    r = response();
    await handler({ method: "POST", query: {} }, r);
    assert.equal(r.code, 405);
    process.env.USDA_API_KEY = "test-only-key";
    r = response();
    await handler({ method: "GET", query: { q: "x" } }, r);
    assert.equal(r.code, 400);
    globalThis.fetch = async (url, options) => {
      assert.equal(new URL(url).hostname, "api.nal.usda.gov");
      assert.equal(JSON.parse(options.body).query, "rice");
      return {
        ok: true,
        json: async () => ({
          foods: [
            {
              fdcId: 123,
              description: "Rice",
              dataType: "Foundation",
              foodNutrients: [
                { nutrientId: 1008, value: 130 },
                { nutrientId: 1003, value: 2.7 },
              ],
            },
          ],
        }),
      };
    };
    r = response();
    await handler({ method: "GET", query: { q: "rice" } }, r);
    assert.equal(r.code, 200);
    assert.equal(r.body.foods[0].nutrients.calories, 130);
    assert.equal(r.body.foods[0].nutrients.iron, null);
    assert(!JSON.stringify(r.body).includes("test-only-key"));
    assert.match(r.headers["Cache-Control"], /s-maxage=3600/);
    globalThis.fetch = async () => ({ ok: false, status: 429 });
    r = response();
    await handler({ method: "GET", query: { q: "rice" } }, r);
    assert.equal(r.code, 429);
    globalThis.fetch = async () => {
      throw new Error("provider failure with secret");
    };
    r = response();
    await handler({ method: "GET", query: { q: "rice" } }, r);
    assert.equal(r.code, 502);
    assert(!JSON.stringify(r.body).includes("secret"));
  } finally {
    globalThis.fetch = originalFetch;
    if (previous === undefined) delete process.env.USDA_API_KEY;
    else process.env.USDA_API_KEY = previous;
  }
});
