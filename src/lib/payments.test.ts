import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  decideSkydo,
  decideStripe,
  hmacSha256Hex,
  planFromAmount,
  stripeSignatureHeader,
  verifySkydoSignature,
  verifyStripeSignature,
} from "./payments.ts";

test("hmac matches node", () => {
  assert.equal(hmacSha256Hex("key", "The quick brown fox jumps over the lazy dog"), createHmac("sha256", "key").update("The quick brown fox jumps over the lazy dog").digest("hex"));
});

test("stripe signature rejects tampering and old timestamps", () => {
  const raw = JSON.stringify({ id: "evt_1", type: "invoice.paid" });
  const header = stripeSignatureHeader(raw, "whsec_test", 1_700_000_000);
  assert.equal(verifyStripeSignature(raw, header, "whsec_test", 1_700_000_000_000), null);
  assert.ok(verifyStripeSignature(`${raw} `, header, "whsec_test", 1_700_000_000_000));
  assert.ok(verifyStripeSignature(raw, header, "whsec_test", 1_700_000_000_000 + 301_000));
});

test("skydo signature rejects a bad header", () => {
  const raw = '{"id":"sky_1"}';
  const header = hmacSha256Hex("skydo_nock_demo", raw);
  assert.equal(verifySkydoSignature(raw, header, "skydo_nock_demo"), null);
  assert.ok(verifySkydoSignature(raw, header.replace("a", "b"), "skydo_nock_demo"));
});

test("amounts map onto the three plans", () => {
  assert.equal(planFromAmount(4999, "INR"), "basic");
  assert.equal(planFromAmount(499900, "inr"), "basic");
  assert.equal(planFromAmount(24999, "INR"), "advance");
  assert.equal(planFromAmount(59, "usd"), "basic");
  assert.equal(planFromAmount(29900, "USD"), "advance");
  assert.equal(planFromAmount(12, "INR"), null);
});

test("stripe deletion moves the workspace to free", () => {
  const decision = decideStripe({
    id: "evt_del",
    type: "customer.subscription.deleted",
    data: { object: { customer_email: "ops@nock.test" } },
  });
  assert.equal("plan" in decision && decision.plan, "free");
});

test("skydo failure does not change the plan", () => {
  const decision = decideSkydo({ id: "sky_f", event: "payment.failed", payer_email: "ops@nock.test", amount: 4999, currency: "INR" });
  assert.ok("plan" in decision);
  if ("plan" in decision) {
    assert.equal(decision.plan, null);
    assert.equal(decision.billingState, "past_due");
  }
});

test("skydo settlement of basic is 499900 paise", () => {
  const decision = decideSkydo({ id: "sky_ok", event: "payment.settled", payer_email: "ops@nock.test", amount: 4999, currency: "INR" });
  assert.ok("plan" in decision);
  if ("plan" in decision) {
    assert.equal(decision.plan, "basic");
    assert.equal(decision.amountPaise, 499900);
    assert.equal(decision.billingState, "active");
  }
});
