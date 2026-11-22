// node --test assets/js/
const test = require("node:test");
const assert = require("node:assert");
const { audit } = require("./notch-audit.js");
const P = (name, c) => ({ name, counts: c });

test("zero chores", () => {
  const r = audit([P("A", {}), P("B", {})]);
  assert.equal(r.kind, "empty"); assert.equal(r.fairness, null); assert.equal(r.rows[0].share, 0);
});
test("one person", () => {
  const r = audit([P("A", { dishes: 3 })]);
  assert.equal(r.kind, "solo"); assert.equal(r.fairness, 100); assert.equal(r.rows[0].share, 1);
});
test("ties", () => {
  const r = audit([P("A", { dishes: 2 }), P("B", { dishes: 2 })]);
  assert.equal(r.kind, "tie"); assert.equal(r.fairness, 100); assert.deepEqual(r.top, ["A", "B"]);
  const r2 = audit([P("A", { dishes: 4 }), P("B", { dishes: 4 }), P("C", { dishes: 1 })]);
  assert.deepEqual(r2.top, ["A", "B"]); assert.deepEqual(r2.least, ["C"]);
});
test("lopsided two", () => {
  const r = audit([P("A", { bathroom: 5 }), P("B", {})]);
  assert.equal(r.kind, "lopsided"); assert.equal(r.fairness, 0); assert.deepEqual(r.least, ["B"]);
});
test("five people, shares sum to 1, negatives ignored", () => {
  const r = audit(["A", "B", "C", "D", "E"].map((n, i) => P(n, { dishes: i, floors: -3 })));
  assert.equal(r.n, 5);
  assert.ok(Math.abs(r.rows.reduce((s, x) => s + x.share, 0) - 1) < 1e-9);
  assert.equal(r.rows[0].name, "E"); assert.deepEqual(r.least, ["A"]);
  assert.ok(r.fairness > 0 && r.fairness < 100);
});
