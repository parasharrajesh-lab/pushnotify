import assert from "node:assert/strict";
import test from "node:test";
import { checkPushToken, quoteUsage, runLogicChecks, sendsAllowed } from "./billing.ts";

test("every business and system rule passes", () => {
  const checks = runLogicChecks();
  const failed = checks.filter((item) => !item.pass);
  assert.deepEqual(failed, []);
  assert.ok(checks.length >= 16);
});

test("a self-serve workspace inside the cap can send", () => {
  assert.equal(sendsAllowed({ plan: "basic", mau: 6420, overCap: false, kind: "self", onboarded: true, video: false }), null);
});

test("rejected tokens stay rejected", () => {
  assert.ok(checkPushToken("ios", "zz".repeat(32)));
  assert.ok(checkPushToken("android", `onlyletters${"a".repeat(90)}`));
});

test("negative usage does not create a credit", () => {
  const quote = quoteUsage("basic", -5);
  assert.equal(quote.mau, 0);
  assert.equal(quote.totalPaise, 499_900);
});
