import assert from "node:assert/strict";
import test from "node:test";
import {
  attributeError,
  canReceivePush,
  canSeeMessage,
  estimateReach,
  matchesAll,
  matchesAttribute,
  meetsGoal,
  parseBehavior,
  projectGoal,
  seedBehavior,
  segmentError,
  starterSegments,
  userPath,
  type Behavior,
  type SegmentRule,
} from "./behavior.ts";

const people = ["usr_19f2", "usr_20aa", "usr_18c0", "usr_22e1", "usr_17b4", "usr_21d8", "usr_16a2", "usr_23f0", "usr_15e7", "usr_24c3", "usr_19aa", "usr_25b1"].map(
  (id) => seedBehavior(id) as Behavior,
);

function count(rule: SegmentRule, channel: "push" | "inapp" = "push", layout: "lock" | "banner" | "modal" | "primer" = "lock") {
  return people.filter((person) => matchesAll(person, [rule]) && canSeeMessage(person, channel, layout)).length;
}

test("permission and push delivery follow the authorization states", () => {
  assert.equal(canReceivePush("allowed"), true);
  assert.equal(canReceivePush("provisional"), true);
  assert.equal(canReceivePush("ephemeral"), true);
  assert.equal(canReceivePush("denied"), false);
  assert.equal(canReceivePush("not_asked"), false);
  assert.equal(count({ behavior: "permission", value: "denied" }), 0);
  assert.equal(count({ behavior: "permission", value: "denied" }, "inapp", "banner"), 1);
  assert.equal(count({ behavior: "permission", value: "not_asked" }, "inapp", "primer"), 1);
  assert.equal(count({ behavior: "permission", value: "allowed" }, "inapp", "primer"), 0);
});

test("a segment is the intersection of behavior rules", () => {
  const rules: SegmentRule[] = [
    { behavior: "permission", value: "allowed" },
    { behavior: "days_since_open", op: "at_least", value: 7 },
  ];
  const matched = people.filter((person) => matchesAll(person, rules));
  assert.equal(matched.length, 1);
  assert.equal(matched[0]?.daysSinceOpen, 8);
  assert.equal(matchesAll(people[9]!, [{ behavior: "days_since_open", op: "at_least", value: 0 }]), false);
  assert.equal(matchesAll(people[2]!, [{ behavior: "opened", op: "at_most", value: 0 }]), true);
});

test("segment drafts reject empty, duplicate, and out of range rules", () => {
  assert.match(segmentError({ name: "A", rules: [{ behavior: "opened", op: "at_least", value: 1 }] }) ?? "", /2–40/);
  assert.match(segmentError({ name: "Opened", rules: [] }) ?? "", /1 to 4/);
  assert.match(
    segmentError({
      name: "Opened",
      rules: [
        { behavior: "opened", op: "at_least", value: 1 },
        { behavior: "opened", op: "at_most", value: 3 },
      ],
    }) ?? "",
    /once/,
  );
  assert.match(segmentError({ name: "Opened", rules: [{ behavior: "opened", op: "at_least", value: 1.5 }] }) ?? "", /rule/);
  assert.match(segmentError({ name: "Opened", rules: [{ behavior: "days_since_open", op: "at_least", value: 400 }] }) ?? "", /rule/);
  assert.equal(segmentError({ name: "Opened this week", rules: starterSegments()[0]!.rules }), null);
});

test("goal completions stay inside the delivered count and ignore a denied open", () => {
  const denied: Behavior = { permission: "denied", opened: 4, dismissed: 0, sessions: 0, purchases: 0, daysSinceOpen: 3, returnedNextDay: false };
  assert.equal(meetsGoal(denied, "opened"), false);
  assert.equal(projectGoal([denied], "opened", 10), 0);
  assert.equal(projectGoal(people, "opened", 0), 0);
  const opened = projectGoal(people.filter((person) => canReceivePush(person.permission)), "opened", 100);
  assert.ok(opened > 0 && opened <= 100);
  assert.equal(projectGoal(people.map(() => people[0]!), "purchases", 9), 9);
});

test("estimated reach scales the known sample and never drops a real match", () => {
  assert.equal(estimateReach(136, 12, 0), 0);
  assert.equal(estimateReach(136, 12, 6), 68);
  assert.equal(estimateReach(4, 12, 6), 6);
});

test("a user path is the steps they have already done", () => {
  const opened = seedBehavior("usr_19f2") as Behavior;
  const waiting = seedBehavior("usr_24c3") as Behavior;
  const path = userPath(opened);
  assert.deepEqual(path.map((step) => step.done), [true, true, true, true, true]);
  assert.deepEqual(userPath(waiting).map((step) => step.done), [false, false, false, false, false]);
});

test("app events and iOS permission are separate attributes", () => {
  const opened = seedBehavior("usr_19f2") as Behavior;
  const waiting = seedBehavior("usr_24c3") as Behavior;
  const quiet = seedBehavior("usr_22e1") as Behavior;
  assert.equal(matchesAttribute(opened, "purchase"), true);
  assert.equal(matchesAttribute(opened, "first_open"), true);
  assert.equal(matchesAttribute(opened, "notification_open"), true);
  assert.equal(matchesAttribute(waiting, "first_open"), false);
  assert.equal(matchesAttribute(waiting, "not_determined"), true);
  assert.equal(matchesAttribute(waiting, "notification_receive"), false);
  assert.equal(matchesAttribute(quiet, "provisional"), true);
  assert.equal(matchesAttribute(quiet, "authorized"), false);
  assert.match(attributeError(["authorized", "denied"]) ?? "", /one notification permission/);
  assert.equal(attributeError(["purchase", "session_start"]), null);
});

test("missing behavior falls back to the seeded person or the device status", () => {
  assert.equal(parseBehavior("", "unregistered", "usr_24c3").permission, "not_asked");
  assert.equal(parseBehavior("", "active", "usr_22e1").permission, "provisional");
  assert.equal(parseBehavior("", "active", "usr_unknown").permission, "allowed");
  assert.equal(parseBehavior("{", "unregistered").permission, "not_asked");
});
