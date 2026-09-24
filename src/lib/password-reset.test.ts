import assert from "node:assert/strict";
import test from "node:test";
import {
  accountEmailError,
  hashResetCode,
  hashesMatch,
  isExistingAccountError,
  newPasswordError,
  normalizeAccountEmail,
  resetStartMessage,
  signInFailureMessage,
  signUpConflictMessage,
} from "./password-reset.ts";

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

test("an existing email is never told to register, and a missing email is never told it exists", () => {
  assert.equal(resetStartMessage("missing"), "No account uses that email. Register a workspace.");
  assert.equal(resetStartMessage("password"), null);
  assert.equal(resetStartMessage("social"), null);
  assert.match(resetStartMessage("owner") ?? "", /system owner/i);
  assert.doesNotMatch(resetStartMessage("owner") ?? "", /register a workspace/i);

  assert.match(signInFailureMessage("missing"), /Register a workspace/);
  assert.match(signInFailureMessage("password"), /Forgot password/);
  assert.doesNotMatch(signInFailureMessage("password"), /No account/);
  assert.match(signInFailureMessage("social"), /Forgot password/);

  assert.match(signUpConflictMessage("password"), /already registered/);
  assert.match(signUpConflictMessage("password"), /Forgot password/);
  assert.doesNotMatch(signUpConflictMessage("password"), /another email/i);
  assert.match(signUpConflictMessage("owner"), /System owner sign in/);
  assert.equal(isExistingAccountError("User already exists. Use another email."), true);
  assert.equal(isExistingAccountError("Invalid email or password"), false);
});
