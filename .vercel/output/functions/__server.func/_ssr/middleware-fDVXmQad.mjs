import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/middleware-fDVXmQad.js
var MAU_CAP = 1e4;
var TAGS = [
	"orders",
	"lapsing",
	"vip",
	"new"
];
var BASE_REACH = {
	android: {
		orders: 2140,
		lapsing: 960,
		vip: 410,
		new: 1170
	},
	ios: {
		orders: 1088,
		lapsing: 520,
		vip: 302,
		new: 514
	}
};
var TAG_LABEL = {
	orders: "Orders",
	lapsing: "Lapsing",
	vip: "VIP",
	new: "New"
};
function mauCap(plan) {
	if (plan === "advance") return 1e5;
	if (plan === "free") return 500;
	return MAU_CAP;
}
var FREE_REACH = {
	android: {
		orders: 48,
		lapsing: 16,
		vip: 6,
		new: 22
	},
	ios: {
		orders: 20,
		lapsing: 8,
		vip: 4,
		new: 12
	}
};
var SAMPLE_DISH = "data:image/svg+xml," + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"640\" height=\"360\"><rect width=\"640\" height=\"360\" fill=\"#1e2a32\"/><text x=\"40\" y=\"200\" fill=\"#f6f5f2\" font-size=\"48\" font-family=\"Georgia,serif\">Weekend thali</text></svg>");
function tagLabel(tag) {
	return TAG_LABEL[tag];
}
function audienceLabel(audience) {
	if (audience.kind === "all") return "All devices";
	if (audience.kind === "platform") return audience.platform === "android" ? "Android" : "iOS";
	return TAG_LABEL[audience.tag];
}
function audienceSize(reach, audience) {
	const platforms = audience.kind === "platform" ? [audience.platform] : ["android", "ios"];
	const tags = audience.kind === "tag" ? [audience.tag] : [...TAGS];
	let total = 0;
	for (const platform of platforms) for (const tag of tags) total += reach[platform][tag];
	return total;
}
function projectDelivery(targeted, salt) {
	if (targeted <= 0) return {
		targeted: 0,
		delivered: 0,
		failed: 0,
		clicked: 0
	};
	const failRate = .016 + salt % 9 / 2e3;
	const failed = Math.min(targeted, Math.max(1, Math.round(targeted * failRate)));
	const delivered = Math.max(0, targeted - failed);
	const clickRate = .07 + salt % 6 / 200;
	return {
		targeted,
		delivered,
		failed,
		clicked: Math.round(delivered * clickRate)
	};
}
function saltFrom(title) {
	let n = 0;
	for (let i = 0; i < title.length; i++) n = (n + title.charCodeAt(i) * (i + 1)) % 997;
	return n;
}
function hoursAgo(hours) {
	return (/* @__PURE__ */ new Date(Date.now() - hours * 36e5)).toISOString();
}
function daysAgo(days, hour = 11) {
	const d = /* @__PURE__ */ new Date();
	d.setHours(hour, 12, 0, 0);
	d.setDate(d.getDate() - days);
	return d.toISOString();
}
function seedSubscribers() {
	return [
		{
			id: "d1",
			name: "Aisha Khan",
			userId: "usr_19f2",
			platform: "android",
			city: "Mumbai",
			tag: "orders",
			lastSeen: hoursAgo(1),
			status: "active"
		},
		{
			id: "d2",
			name: "Rohan Mehta",
			userId: "usr_20aa",
			platform: "ios",
			city: "Mumbai",
			tag: "vip",
			lastSeen: hoursAgo(3),
			status: "active"
		},
		{
			id: "d3",
			name: "Neha Iyer",
			userId: "usr_18c0",
			platform: "android",
			city: "Pune",
			tag: "lapsing",
			lastSeen: hoursAgo(26),
			status: "active"
		},
		{
			id: "d4",
			name: "Vikram Shah",
			userId: "usr_22e1",
			platform: "ios",
			city: "Bengaluru",
			tag: "orders",
			lastSeen: hoursAgo(5),
			status: "active"
		},
		{
			id: "d5",
			name: "Sara D'Souza",
			userId: "usr_17b4",
			platform: "android",
			city: "Delhi",
			tag: "new",
			lastSeen: hoursAgo(8),
			status: "active"
		},
		{
			id: "d6",
			name: "Imran Qureshi",
			userId: "usr_21d8",
			platform: "android",
			city: "Hyderabad",
			tag: "orders",
			lastSeen: hoursAgo(14),
			status: "active"
		},
		{
			id: "d7",
			name: "Meera Nair",
			userId: "usr_16a2",
			platform: "ios",
			city: "Mumbai",
			tag: "lapsing",
			lastSeen: hoursAgo(50),
			status: "active"
		},
		{
			id: "d8",
			name: "Arjun Kapoor",
			userId: "usr_23f0",
			platform: "android",
			city: "Jaipur",
			tag: "vip",
			lastSeen: hoursAgo(6),
			status: "active"
		},
		{
			id: "d9",
			name: "Priya Menon",
			userId: "usr_15e7",
			platform: "ios",
			city: "Bengaluru",
			tag: "new",
			lastSeen: hoursAgo(2),
			status: "active"
		},
		{
			id: "d10",
			name: "Kabir Anand",
			userId: "usr_24c3",
			platform: "android",
			city: "Delhi",
			tag: "lapsing",
			lastSeen: hoursAgo(30),
			status: "unregistered"
		},
		{
			id: "d11",
			name: "Tara Joshi",
			userId: "usr_19aa",
			platform: "ios",
			city: "Pune",
			tag: "orders",
			lastSeen: hoursAgo(9),
			status: "active"
		},
		{
			id: "d12",
			name: "Dev Patel",
			userId: "usr_25b1",
			platform: "android",
			city: "Mumbai",
			tag: "new",
			lastSeen: hoursAgo(4),
			status: "active"
		}
	];
}
function seedCampaigns() {
	return [
		{
			id: "c1",
			title: "Rider is 4 minutes away",
			body: "Ananya has your Metro Bites order and is turning onto your street.",
			link: "metrobites://order/4821",
			audience: {
				kind: "tag",
				tag: "orders"
			},
			createdAt: daysAgo(1, 19),
			...projectDelivery(3228, 40),
			seed: true
		},
		{
			id: "c2",
			title: "Weekend thali is back",
			body: "Saturday lunch thali is live in Mumbai and Pune until 3pm.",
			link: "",
			image: SAMPLE_DISH,
			audience: { kind: "all" },
			createdAt: daysAgo(3, 10),
			...projectDelivery(7104, 12),
			seed: true
		},
		{
			id: "c3",
			title: "We kept your usual",
			body: "₹80 off the bowl you ordered last month. Today only.",
			link: "metrobites://offer/winback",
			audience: {
				kind: "tag",
				tag: "lapsing"
			},
			createdAt: daysAgo(6, 18),
			...projectDelivery(1480, 7),
			seed: true
		},
		{
			id: "c4",
			title: "VIP window opens at 7",
			body: "Early access to the Andheri kitchen before the dinner rush.",
			link: "",
			audience: {
				kind: "tag",
				tag: "vip"
			},
			createdAt: daysAgo(9, 16),
			...projectDelivery(712, 3),
			seed: true
		},
		{
			id: "c5",
			title: "Welcome, here's ₹50",
			body: "Use it on your first Metro Bites order. Expires Sunday.",
			link: "metrobites://welcome",
			audience: {
				kind: "platform",
				platform: "android"
			},
			createdAt: daysAgo(12, 12),
			...projectDelivery(4680, 21),
			seed: true
		}
	];
}
/** Delivered volume already reflected in the chart, excluding sends made in this session. */
var HISTORY = [
	420,
	880,
	610,
	1540,
	390,
	970,
	1280,
	760,
	2104,
	540,
	860,
	1430,
	690,
	540
];
function chartSeries(campaigns) {
	const start = /* @__PURE__ */ new Date();
	start.setHours(0, 0, 0, 0);
	return HISTORY.map((base, index) => {
		const day = new Date(start);
		day.setDate(start.getDate() - (HISTORY.length - 1 - index));
		const extra = campaigns.filter((c) => !c.seed && new Date(c.createdAt).toDateString() === day.toDateString()).reduce((sum, c) => sum + c.delivered, 0);
		return {
			label: day.toLocaleDateString("en-IN", {
				day: "numeric",
				month: "short"
			}),
			sent: base + extra
		};
	});
}
function isAudience(value) {
	if (!value || typeof value !== "object") return false;
	const v = value;
	if (v.kind === "all") return true;
	if (v.kind === "platform") return v.platform === "android" || v.platform === "ios";
	if (v.kind === "tag") return TAGS.includes(v.tag);
	return false;
}
var STEPS = [
	"Start",
	"Who",
	"What",
	"When",
	"Publish"
];
function isChannel(value) {
	return value === "push" || value === "inapp";
}
function isQualification(value) {
	return value === "past" || value === "live" || value === "external";
}
function isLayout(value) {
	return value === "lock" || value === "banner" || value === "modal" || value === "primer";
}
function inQuietHours(date) {
	const hour = date.getHours();
	return hour >= 21 || hour < 9;
}
function matches(device, audience) {
	if (audience.kind === "platform" && device.platform !== audience.platform) return false;
	if (audience.kind === "tag" && device.tag !== audience.tag) return false;
	return true;
}
function tokenCounts(devices, audience) {
	const matched = devices.filter((device) => matches(device, audience));
	const withToken = (platform) => matched.filter((device) => device.platform === platform && device.status === "active" && Boolean(device.pushToken?.trim())).length;
	return {
		android: withToken("android"),
		ios: withToken("ios"),
		waiting: matched.filter((device) => device.status === "unregistered").length
	};
}
function reviewCampaign(input) {
	const draft = input.draft;
	const now = input.now ?? /* @__PURE__ */ new Date();
	const tokens = tokenCounts(input.devices, draft.audience);
	const pushReach = audienceSize(input.reach, draft.audience);
	const targeted = draft.channel === "inapp" && draft.layout === "primer" ? tokens.waiting : pushReach;
	const error = campaignError(draft, input.plan, targeted);
	const quiet = draft.quietHours && inQuietHours(now);
	let state = "sent";
	if (!error) {
		if (draft.qualification !== "past") state = "armed";
		else if (draft.delivery === "later") state = "scheduled";
		else if (draft.channel === "push" && quiet) state = "queued";
	}
	const stats = state === "sent" && !error ? projectDelivery(targeted, saltFrom(draft.title)) : {
		targeted,
		delivered: 0,
		failed: 0,
		clicked: 0
	};
	return {
		error,
		targeted,
		tokens,
		state,
		stats,
		quiet
	};
}
function campaignError(draft, plan, targeted) {
	if (!draft.title.trim() || draft.title.trim().length > 65) return "Title is required, up to 65 characters.";
	if (!draft.body.trim() || draft.body.trim().length > 180) return "Message is required, up to 180 characters.";
	if (draft.video.trim() && plan !== "advance") return "Video is included on Advance.";
	if (draft.channel === "push" && draft.layout !== "lock") return "Push uses the lock screen.";
	if (draft.channel === "inapp" && draft.layout === "lock") return "Choose a banner, a modal, or a permission primer.";
	if (draft.layout === "primer" && draft.video.trim()) return "A permission primer is text and a button.";
	if (draft.layout === "primer" && !draft.button.trim()) return "The primer needs a button, such as Allow.";
	if (draft.qualification !== "past" && draft.delivery === "later") return "A live or external trigger sends when the action happens, not on a clock.";
	if (draft.channel === "inapp" && (draft.delaySeconds < 0 || draft.delaySeconds > 1200)) return "In-app delay is 0 to 1,200 seconds.";
	if (draft.channel === "push" && (draft.ttlHours < 1 || draft.ttlHours > 72)) return "Push stays available for 1 to 72 hours.";
	if (targeted <= 0 && draft.layout === "primer") return "No device is waiting for notification permission.";
	if (targeted <= 0) return "No reachable devices in that audience.";
	return null;
}
function readProcess(raw) {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (!isChannel(parsed.channel) || !isLayout(parsed.layout) || !parsed.state) return null;
		return {
			channel: parsed.channel,
			qualification: isQualification(parsed.qualification) ? parsed.qualification : "past",
			layout: parsed.layout,
			delivery: parsed.delivery === "later" ? "later" : "now",
			ttlHours: Number(parsed.ttlHours) || 24,
			delaySeconds: Number(parsed.delaySeconds) || 0,
			quietHours: Boolean(parsed.quietHours),
			button: typeof parsed.button === "string" ? parsed.button : "",
			goal: typeof parsed.goal === "string" ? parsed.goal : "",
			state: parsed.state
		};
	} catch {
		return null;
	}
}
function stateLabel(state) {
	if (state === "queued") return "Queued until quiet hours end";
	if (state === "scheduled") return "Scheduled";
	if (state === "armed") return "Waiting for the trigger";
	return "Sent";
}
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-CVqXY6bk.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-DuXOWRqF.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
//#endregion
export { seedSubscribers as _, audienceLabel as a, tokenCounts as b, chartSeries as c, isLayout as d, isQualification as f, seedCampaigns as g, reviewCampaign as h, TAGS as i, isAudience as l, readProcess as m, FREE_REACH as n, audienceSize as o, mauCap as p, STEPS as r, authMiddleware as s, BASE_REACH as t, isChannel as u, stateLabel as v, tagLabel as y };
