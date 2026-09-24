import assert from "node:assert/strict";
import test from "node:test";
import { campaignAnalytics, campaignSnapshot, percent } from "./campaign-analytics.ts";
import type { Campaign } from "./push.ts";

function campaign(over: Partial<Campaign> = {}): Campaign {
  return {
    id: "c",
    title: "Order",
    body: "Ready",
    link: "app://order",
    audience: { kind: "all" },
    createdAt: "2026-09-24T09:00:00.000Z",
    targeted: 100,
    delivered: 90,
    failed: 10,
    clicked: 9,
    seed: false,
    ...over,
  };
}

test("push and in-app are tracked apart, and unsent or test rows do not move the rates", () => {
  const report = campaignAnalytics([
    campaign({ channel: "push", delivered: 80, failed: 20, clicked: 8 }),
    campaign({ id: "in", channel: "inapp", layout: "modal", targeted: 50, delivered: 50, failed: 0, clicked: 25, goalHits: 10 }),
    campaign({ id: "later", deliveryState: "scheduled", targeted: 400, delivered: 400, failed: 0, clicked: 400 }),
    campaign({ id: "test", isTest: true, targeted: 1, delivered: 1, failed: 0, clicked: 1 }),
    campaign({ id: "primer", channel: "inapp", layout: "primer", targeted: 4, delivered: 4, failed: 0, clicked: 2 }),
  ]);
  assert.equal(report.push.sent, 1);
  assert.equal(report.push.delivered, 80);
  assert.equal(report.push.clickRate, 0.1);
  assert.equal(report.inapp.sent, 2);
  assert.equal(report.inapp.delivered, 54);
  assert.equal(report.inapp.clicked, 27);
  assert.equal(report.all.delivered, 134);
  assert.equal(report.all.waiting, 1);
  assert.equal(report.waiting.scheduled, 1);
  assert.equal(report.tests, 1);
  assert.equal(report.layouts.modal.clicked, 25);
  assert.equal(report.layouts.primer.delivered, 4);
  assert.equal(report.all.goalHits, 10);
});

test("clicks and goal hits cannot exceed what was delivered", () => {
  const row = campaignSnapshot(campaign({ delivered: 10, failed: 90, clicked: 40, goalHits: 80, channel: "inapp" }));
  assert.equal(row.clicked, 10);
  assert.equal(row.goalHits, 10);
  assert.equal(row.failed, 90);
  const empty = campaignAnalytics([campaign({ targeted: 0, delivered: 5, failed: 5, clicked: 5 })]);
  assert.equal(empty.all.deliveryRate, 0);
  assert.equal(empty.all.clickRate, 0);
  assert.equal(percent(0.126), "13%");
});

test("a campaign with no channel is a sent push", () => {
  const row = campaignSnapshot(campaign());
  assert.equal(row.channel, "push");
  assert.equal(row.layout, "lock");
  assert.equal(row.state, "sent");
});
