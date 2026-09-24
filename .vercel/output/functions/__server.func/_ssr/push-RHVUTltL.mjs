import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/push-RHVUTltL.js
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
	const { requireUserId } = await import("./verify.server-CMSLKtPT.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
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
//#endregion
export { audienceSize as a, isAudience as c, saltFrom as d, seedCampaigns as f, audienceLabel as i, mauCap as l, tagLabel as m, FREE_REACH as n, authMiddleware as o, seedSubscribers as p, TAGS as r, chartSeries as s, BASE_REACH as t, projectDelivery as u };
