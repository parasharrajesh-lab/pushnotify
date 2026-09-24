import assert from "node:assert/strict";
import test from "node:test";
import { accountEmailError, hashResetCode, hashesMatch, newPasswordError, normalizeAccountEmail } from "./password-reset.ts";

test("email and password rules", () => {
  assert.equal(normalizeAccountEmail("  A@B.Co "), "a@b.co");
  assert.equal(accountEmailError("not-an-email"), "Enter a valid email.");
  assert.equal(accountEmailError("a@b.co"), null);
  assert.equal(newPasswordError("short", "short"), "Use at least 8 characters.");
  assert.equal(newPasswordError("long-enough", "different"), "Those passwords do not match.");
  assert.equal(newPasswordError("long-enough", "long-enough"), null);
});

test("reset code hash is stable and compared in full", async () => {
  const hash = await hashResetCode("a@b.co", "abcd2345");
  assert.equal(hash, await hashResetCode(" A@B.co ", "ABCD2345"));
  assert.equal(hashesMatch(hash, hash), true);
  assert.equal(hashesMatch(hash, hash.slice(0, -1) + (hash.endsWith("0") ? "1" : "0")), false);
  assert.equal(hashesMatch("abc", "ab"), false);
});
