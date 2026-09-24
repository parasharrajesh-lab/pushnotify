import type { Campaign } from "./push.ts";

export type TrackChannel = "push" | "inapp";
export type TrackLayout = "lock" | "banner" | "modal" | "primer";
export type TrackState = "sent" | "queued" | "scheduled" | "armed";

export type CampaignSnapshot = {
  id: string;
  title: string;
  createdAt: string;
  channel: TrackChannel;
  layout: TrackLayout;
  state: TrackState;
  isTest: boolean;
  targeted: number;
  delivered: number;
  failed: number;
  clicked: number;
  goalHits: number;
};

export type ChannelRollup = {
  campaigns: number;
  sent: number;
  waiting: number;
  targeted: number;
  delivered: number;
  failed: number;
  clicked: number;
  goalHits: number;
  deliveryRate: number;
  failRate: number;
  clickRate: number;
  goalRate: number;
};

function count(value: number | undefined) {
  if (!Number.isFinite(value) || (value ?? 0) < 0) return 0;
  return Math.floor(value ?? 0);
}

function rate(part: number, whole: number) {
  if (whole <= 0) return 0;
  return Math.min(1, part / whole);
}

export function campaignSnapshot(campaign: Campaign): CampaignSnapshot {
  const channel: TrackChannel = campaign.channel === "inapp" ? "inapp" : "push";
  const layout: TrackLayout =
    channel === "push" ? "lock" : campaign.layout === "modal" || campaign.layout === "primer" ? campaign.layout : "banner";
  const state: TrackState =
    campaign.deliveryState === "queued" || campaign.deliveryState === "scheduled" || campaign.deliveryState === "armed"
      ? campaign.deliveryState
      : "sent";
  const targeted = count(campaign.targeted);
  const delivered = Math.min(targeted, count(campaign.delivered));
  const failed = Math.min(Math.max(0, targeted - delivered), count(campaign.failed));
  const clicked = Math.min(delivered, count(campaign.clicked));
  const goalHits = Math.min(delivered, count(campaign.goalHits));
  return {
    id: campaign.id,
    title: campaign.title,
    createdAt: campaign.createdAt,
    channel,
    layout,
    state,
    isTest: Boolean(campaign.isTest),
    targeted,
    delivered,
    failed,
    clicked,
    goalHits,
  };
}

export function rollup(rows: CampaignSnapshot[]): ChannelRollup {
  const sentRows = rows.filter((row) => row.state === "sent");
  const targeted = sentRows.reduce((sum, row) => sum + row.targeted, 0);
  const delivered = sentRows.reduce((sum, row) => sum + row.delivered, 0);
  const failed = sentRows.reduce((sum, row) => sum + row.failed, 0);
  const clicked = sentRows.reduce((sum, row) => sum + row.clicked, 0);
  const goalHits = sentRows.reduce((sum, row) => sum + row.goalHits, 0);
  return {
    campaigns: rows.length,
    sent: sentRows.length,
    waiting: rows.length - sentRows.length,
    targeted,
    delivered,
    failed,
    clicked,
    goalHits,
    deliveryRate: rate(delivered, targeted),
    failRate: rate(failed, targeted),
    clickRate: rate(clicked, delivered),
    goalRate: rate(goalHits, delivered),
  };
}

export function campaignAnalytics(campaigns: Campaign[]) {
  const rows = campaigns.map(campaignSnapshot);
  const broadcasts = rows.filter((row) => !row.isTest);
  const push = broadcasts.filter((row) => row.channel === "push");
  const inapp = broadcasts.filter((row) => row.channel === "inapp");
  return {
    rows,
    all: rollup(broadcasts),
    push: rollup(push),
    inapp: rollup(inapp),
    tests: rows.filter((row) => row.isTest).length,
    layouts: {
      banner: rollup(inapp.filter((row) => row.layout === "banner")),
      modal: rollup(inapp.filter((row) => row.layout === "modal")),
      primer: rollup(inapp.filter((row) => row.layout === "primer")),
    },
    waiting: {
      queued: broadcasts.filter((row) => row.state === "queued").length,
      scheduled: broadcasts.filter((row) => row.state === "scheduled").length,
      armed: broadcasts.filter((row) => row.state === "armed").length,
    },
  };
}

export function percent(rate: number) {
  return `${Math.round(rate * 100)}%`;
}
