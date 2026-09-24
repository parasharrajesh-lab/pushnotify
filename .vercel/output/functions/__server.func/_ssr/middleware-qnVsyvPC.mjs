import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/middleware-qnVsyvPC.js
var PERMISSIONS = [
	"not_asked",
	"denied",
	"allowed",
	"provisional",
	"ephemeral"
];
var GOAL_METRICS = [
	"opened",
	"returned_next_day",
	"sessions",
	"purchases"
];
var NUMERIC_BEHAVIORS = [
	"opened",
	"dismissed",
	"sessions",
	"purchases",
	"days_since_open"
];
var PERMISSION_LABEL = {
	not_asked: "Not asked",
	denied: "Denied",
	allowed: "Allowed",
	provisional: "Provisional",
	ephemeral: "Ephemeral"
};
var GOAL_LABEL = {
	opened: "Opened the notification",
	returned_next_day: "Returned the next day",
	sessions: "Started a session",
	purchases: "Made a purchase"
};
var BEHAVIOR_LABEL = {
	permission: "Permission",
	opened: "Notification opened",
	dismissed: "Notification dismissed",
	returned_next_day: "Returned the next day",
	sessions: "Sessions",
	purchases: "Purchases",
	days_since_open: "Days since last open"
};
function permissionLabel(value) {
	return PERMISSION_LABEL[value];
}
function goalLabel(metric) {
	return GOAL_LABEL[metric];
}
function behaviorLabel(behavior) {
	return BEHAVIOR_LABEL[behavior];
}
function isPermission(value) {
	return typeof value === "string" && PERMISSIONS.includes(value);
}
function isGoalMetric(value) {
	return typeof value === "string" && GOAL_METRICS.includes(value);
}
function isNumericBehavior(value) {
	return typeof value === "string" && NUMERIC_BEHAVIORS.includes(value);
}
function canReceivePush(permission) {
	return permission === "allowed" || permission === "provisional" || permission === "ephemeral";
}
function defaultBehavior(status) {
	if (status === "unregistered") return {
		permission: "not_asked",
		opened: 0,
		dismissed: 0,
		sessions: 0,
		purchases: 0,
		daysSinceOpen: null,
		returnedNextDay: false
	};
	return {
		permission: "allowed",
		opened: 0,
		dismissed: 0,
		sessions: 1,
		purchases: 0,
		daysSinceOpen: 1,
		returnedNextDay: false
	};
}
function connectedBehavior() {
	return {
		permission: "allowed",
		opened: 0,
		dismissed: 0,
		sessions: 0,
		purchases: 0,
		daysSinceOpen: 0,
		returnedNextDay: false
	};
}
var SEED = {
	usr_19f2: {
		permission: "allowed",
		opened: 4,
		dismissed: 0,
		sessions: 6,
		purchases: 2,
		daysSinceOpen: 0,
		returnedNextDay: true
	},
	usr_20aa: {
		permission: "allowed",
		opened: 2,
		dismissed: 1,
		sessions: 3,
		purchases: 1,
		daysSinceOpen: 0,
		returnedNextDay: true
	},
	usr_18c0: {
		permission: "allowed",
		opened: 0,
		dismissed: 2,
		sessions: 0,
		purchases: 0,
		daysSinceOpen: 8,
		returnedNextDay: false
	},
	usr_22e1: {
		permission: "provisional",
		opened: 1,
		dismissed: 0,
		sessions: 2,
		purchases: 0,
		daysSinceOpen: 1,
		returnedNextDay: false
	},
	usr_17b4: {
		permission: "allowed",
		opened: 1,
		dismissed: 0,
		sessions: 4,
		purchases: 0,
		daysSinceOpen: 0,
		returnedNextDay: true
	},
	usr_21d8: {
		permission: "allowed",
		opened: 3,
		dismissed: 1,
		sessions: 5,
		purchases: 1,
		daysSinceOpen: 0,
		returnedNextDay: true
	},
	usr_16a2: {
		permission: "denied",
		opened: 0,
		dismissed: 0,
		sessions: 0,
		purchases: 0,
		daysSinceOpen: 20,
		returnedNextDay: false
	},
	usr_23f0: {
		permission: "allowed",
		opened: 5,
		dismissed: 0,
		sessions: 7,
		purchases: 3,
		daysSinceOpen: 0,
		returnedNextDay: true
	},
	usr_15e7: {
		permission: "ephemeral",
		opened: 0,
		dismissed: 0,
		sessions: 1,
		purchases: 0,
		daysSinceOpen: 0,
		returnedNextDay: false
	},
	usr_24c3: {
		permission: "not_asked",
		opened: 0,
		dismissed: 0,
		sessions: 0,
		purchases: 0,
		daysSinceOpen: null,
		returnedNextDay: false
	},
	usr_19aa: {
		permission: "allowed",
		opened: 2,
		dismissed: 0,
		sessions: 2,
		purchases: 1,
		daysSinceOpen: 1,
		returnedNextDay: true
	},
	usr_25b1: {
		permission: "allowed",
		opened: 0,
		dismissed: 1,
		sessions: 1,
		purchases: 0,
		daysSinceOpen: 2,
		returnedNextDay: false
	}
};
function seedBehavior(userId) {
	return SEED[userId] ?? null;
}
function starterSegments() {
	return [{
		name: "Opened this week",
		rules: [{
			behavior: "opened",
			op: "at_least",
			value: 1
		}]
	}, {
		name: "Away for a week",
		rules: [{
			behavior: "days_since_open",
			op: "at_least",
			value: 7
		}]
	}];
}
function parseBehavior(raw, status, userId = "") {
	const seeded = raw.trim() ? null : seedBehavior(userId);
	if (seeded) return seeded;
	if (!raw.trim()) return defaultBehavior(status);
	try {
		const parsed = JSON.parse(raw);
		if (!isPermission(parsed.permission)) return defaultBehavior(status);
		return {
			permission: parsed.permission,
			opened: count(parsed.opened, 500),
			dismissed: count(parsed.dismissed, 500),
			sessions: count(parsed.sessions, 500),
			purchases: count(parsed.purchases, 500),
			daysSinceOpen: parsed.daysSinceOpen == null ? null : count(parsed.daysSinceOpen, 365),
			returnedNextDay: Boolean(parsed.returnedNextDay)
		};
	} catch {
		return defaultBehavior(status);
	}
}
function count(value, max) {
	const n = Math.round(Number(value));
	if (!Number.isFinite(n) || n < 0) return 0;
	return Math.min(max, n);
}
function isSegmentRule(value) {
	if (!value || typeof value !== "object") return false;
	const rule = value;
	if (rule.behavior === "permission") return isPermission(rule.value);
	if (rule.behavior === "returned_next_day") return typeof rule.value === "boolean";
	if (!isNumericBehavior(rule.behavior)) return false;
	if (rule.op !== "at_least" && rule.op !== "at_most") return false;
	return Number.isInteger(rule.value) && rule.value >= 0 && rule.value <= capFor(rule.behavior);
}
function capFor(behavior) {
	return behavior === "days_since_open" ? 365 : 500;
}
function segmentError(draft) {
	const name = draft.name.trim();
	if (name.length < 2 || name.length > 40) return "Name should be 2–40 characters.";
	if (!Array.isArray(draft.rules) || draft.rules.length < 1 || draft.rules.length > 4) return "Use 1 to 4 behaviors.";
	const seen = /* @__PURE__ */ new Set();
	for (const rule of draft.rules) {
		if (!isSegmentRule(rule)) return "Check the behavior rule.";
		if (seen.has(rule.behavior)) return "Use each behavior once.";
		seen.add(rule.behavior);
	}
	return null;
}
function matchesRule(behavior, rule) {
	if (rule.behavior === "permission") return behavior.permission === rule.value;
	if (rule.behavior === "returned_next_day") return behavior.returnedNextDay === rule.value;
	const amount = rule.behavior === "days_since_open" ? behavior.daysSinceOpen : behavior[rule.behavior];
	if (amount == null) return false;
	return rule.op === "at_least" ? amount >= rule.value : amount <= rule.value;
}
function matchesAll(behavior, rules) {
	return rules.every((rule) => matchesRule(behavior, rule));
}
function canSeeMessage(behavior, channel, layout) {
	if (layout === "primer") return behavior.permission === "not_asked";
	if (channel === "push") return canReceivePush(behavior.permission);
	return true;
}
function estimateReach(total, known, eligible) {
	if (total <= 0 || known <= 0 || eligible <= 0) return 0;
	return Math.max(eligible, Math.round(total * eligible / known));
}
function meetsGoal(behavior, metric) {
	if (metric === "opened") return canReceivePush(behavior.permission) && behavior.opened >= 1;
	if (metric === "returned_next_day") return behavior.returnedNextDay;
	if (metric === "sessions") return behavior.sessions >= 1;
	return behavior.purchases >= 1;
}
function projectGoal(people, metric, delivered) {
	if (delivered <= 0 || people.length === 0) return 0;
	const hits = people.filter((person) => meetsGoal(person, metric)).length;
	return Math.min(delivered, Math.round(delivered * hits / people.length));
}
function describeRule(rule) {
	if (rule.behavior === "permission") return `Permission is ${permissionLabel(rule.value).toLowerCase()}`;
	if (rule.behavior === "returned_next_day") return rule.value ? "Returned the next day" : "Did not return the next day";
	const op = rule.op === "at_least" ? "at least" : "at most";
	const window = rule.behavior === "purchases" ? " in 30 days" : rule.behavior === "days_since_open" ? "" : " in 7 days";
	return `${behaviorLabel(rule.behavior)} ${op} ${rule.value}${window}`;
}
function behaviorSummary(behavior) {
	const days = behavior.daysSinceOpen == null ? "never opened" : `${behavior.daysSinceOpen}d since open`;
	return `${permissionLabel(behavior.permission)} · ${behavior.opened} opens · ${behavior.sessions} sessions · ${behavior.purchases} purchases · ${days}`;
}
var APP_EVENTS = [
	"session_start",
	"first_open",
	"screen_view",
	"notification_receive",
	"notification_open",
	"notification_dismiss",
	"purchase"
];
var IOS_EVENTS = [
	"authorized",
	"provisional",
	"ephemeral",
	"denied",
	"not_determined"
];
var ATTRIBUTE_LABEL = {
	session_start: "session_start",
	first_open: "first_open",
	screen_view: "screen_view",
	notification_receive: "notification_receive",
	notification_open: "notification_open",
	notification_dismiss: "notification_dismiss",
	purchase: "purchase",
	authorized: "authorized",
	provisional: "provisional",
	ephemeral: "ephemeral",
	denied: "denied",
	not_determined: "notDetermined"
};
function attributeLabel(attribute) {
	return ATTRIBUTE_LABEL[attribute];
}
function isBehaviorAttribute(value) {
	return typeof value === "string" && value in ATTRIBUTE_LABEL;
}
function attributeError(attributes) {
	if (attributes.length > 4) return "Use up to 4 behavior attributes.";
	if (attributes.filter((item) => IOS_EVENTS.includes(item)).length > 1) return "A device has one notification permission. Pick only one.";
	return null;
}
function matchesAttribute(behavior, attribute) {
	if (attribute === "session_start") return behavior.sessions >= 1;
	if (attribute === "first_open") return behavior.sessions >= 1 && behavior.daysSinceOpen === 0;
	if (attribute === "screen_view") return behavior.sessions >= 1 && behavior.daysSinceOpen !== null;
	if (attribute === "notification_receive") return canReceivePush(behavior.permission);
	if (attribute === "notification_open") return behavior.opened >= 1;
	if (attribute === "notification_dismiss") return behavior.dismissed >= 1;
	if (attribute === "purchase") return behavior.purchases >= 1;
	if (attribute === "authorized") return behavior.permission === "allowed";
	if (attribute === "provisional") return behavior.permission === "provisional";
	if (attribute === "ephemeral") return behavior.permission === "ephemeral";
	if (attribute === "denied") return behavior.permission === "denied";
	return behavior.permission === "not_asked";
}
function matchesAttributes(behavior, attributes) {
	return attributes.every((attribute) => matchesAttribute(behavior, attribute));
}
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
	if (audience.kind === "segment") return "Segment";
	return TAG_LABEL[audience.tag];
}
function audienceSize(reach, audience) {
	if (audience.kind === "segment") return 0;
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
	].map((row) => ({
		...row,
		behavior: seedBehavior(row.userId) ?? {
			permission: row.status === "unregistered" ? "not_asked" : "allowed",
			opened: 0,
			dismissed: 0,
			sessions: 0,
			purchases: 0,
			daysSinceOpen: row.status === "unregistered" ? null : 0,
			returnedNextDay: false
		}
	}));
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
	if (v.kind === "segment") return typeof v.segmentId === "string" && v.segmentId.trim().length > 0 && v.segmentId.length <= 80;
	return false;
}
var STEPS = [
	"Start",
	"Who",
	"What",
	"When",
	"Publish"
];
var INDIA = "Asia/Kolkata";
function isChannel(value) {
	return value === "push" || value === "inapp";
}
function isQualification(value) {
	return value === "past" || value === "live" || value === "external";
}
function isLayout(value) {
	return value === "lock" || value === "banner" || value === "modal" || value === "primer";
}
function isFrequency(value) {
	return value === "once" || value === "session" || value === "daily" || value === "weekly";
}
function indiaHour(date) {
	return Number(new Intl.DateTimeFormat("en-GB", {
		timeZone: INDIA,
		hour: "2-digit",
		hourCycle: "h23"
	}).format(date));
}
function inQuietHours(date) {
	const hour = indiaHour(date);
	return hour >= 21 || hour < 9;
}
function parseInstant(value) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const date = new Date(trimmed);
	if (Number.isNaN(date.getTime())) return null;
	return date;
}
function istDate(year, month, day, hour, minute) {
	return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0));
}
function istInputToIso(value) {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
	if (!match) return "";
	const date = istDate(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5]));
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString();
}
function isoToIstInput(iso) {
	const date = parseInstant(iso);
	if (!date) return "";
	const map = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
		timeZone: INDIA,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23"
	}).formatToParts(date).map((part) => [part.type, part.value]));
	return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}
function suggestStart(now = /* @__PURE__ */ new Date()) {
	const map = Object.fromEntries(new Intl.DateTimeFormat("en-GB", {
		timeZone: INDIA,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).formatToParts(now).map((part) => [part.type, part.value]));
	let cursor = istDate(Number(map.year), Number(map.month), Number(map.day), 10, 0);
	if (cursor.getTime() < now.getTime() + 3e5) cursor = new Date(cursor.getTime() + 864e5);
	return cursor.toISOString();
}
function suggestEnd(startIso) {
	const start = parseInstant(startIso) ?? /* @__PURE__ */ new Date();
	return new Date(start.getTime() + 6048e5).toISOString();
}
function formatSchedule(iso) {
	const date = parseInstant(iso);
	if (!date) return "";
	return `${new Intl.DateTimeFormat("en-IN", {
		timeZone: INDIA,
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true
	}).format(date)} IST`;
}
function badDeepLink(value) {
	const link = value.trim();
	if (!link) return null;
	if (link.length > 500 || /^(javascript|data|vbscript):/i.test(link)) return "That deep link is not allowed.";
	return null;
}
function ctaHref(draft) {
	return (draft.ctaLink ?? "").trim() || (draft.link ?? "").trim();
}
function destinationPath(link) {
	const value = link.trim();
	if (!value) return "";
	try {
		const url = new URL(value);
		return `${url.hostname}${url.pathname.replace(/\/$/, "")}`.replace(/^\/+/, "") || url.protocol.replace(":", "");
	} catch {
		return value.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
	}
}
function imageFileError(image) {
	const value = image.trim();
	if (!value) return null;
	if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(value)) {
		if (value.length > 18e4) return "Use a PNG, JPEG, WEBP, or GIF under 120 KB.";
		return null;
	}
	if (/^data:image\/svg\+xml[,;]/i.test(value)) {
		if (value.length > 2e4 || /<script/i.test(value)) return "That image is not allowed.";
		return null;
	}
	if (value.startsWith("data:")) return "Use a PNG, JPEG, WEBP, or GIF under 120 KB.";
	try {
		const url = new URL(value);
		if (url.protocol !== "https:") return "Image links must use https.";
		if (url.toString().length > 500) return "That image link is too long.";
		return null;
	} catch {
		return "Image must be an https link or a small upload.";
	}
}
function imageError(image, link) {
	if (!image.trim()) return null;
	if (!link.trim()) return "Add a deep link so the image opens on a screen.";
	return imageFileError(image);
}
function frequencyLabel(frequency, cap) {
	if (frequency === "session") return `${cap} per session`;
	if (frequency === "daily") return `${cap} per day`;
	if (frequency === "weekly") return `${cap} per week`;
	return "Once";
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
function frequencyError(draft) {
	if (!isFrequency(draft.frequency)) return "Choose a frequency.";
	const cap = draft.frequencyCap;
	if (!Number.isInteger(cap)) return "Frequency must be a whole number.";
	if (draft.frequency === "once") {
		if (cap !== 1) return "A one-time campaign is delivered once.";
		return null;
	}
	if (draft.frequency === "session") {
		if (draft.channel !== "inapp") return "Per session is for in-app messages.";
		if (cap < 1 || cap > 10) return "Show an in-app message 1 to 10 times per session.";
		return null;
	}
	if (draft.frequency === "daily") {
		if (cap < 1 || cap > 5) return "Daily cap is 1 to 5.";
		return null;
	}
	if (cap < 1 || cap > 10) return "Weekly cap is 1 to 10.";
	return null;
}
function windowError(draft, now) {
	const start = draft.delivery === "later" ? parseInstant(draft.scheduleAt) : now;
	if (draft.delivery === "later") {
		if (!draft.scheduleAt.trim()) return "Pick a date and time.";
		if (!start) return "That date and time is not valid.";
		if (start.getTime() < now.getTime() + 3e5) return "Pick a time at least 5 minutes from now.";
		if (start.getTime() > now.getTime() + 7776e6) return "Schedule within the next 90 days.";
		if (draft.channel === "push" && draft.quietHours && inQuietHours(start)) return "That time is inside quiet hours, 9pm to 9am IST. Pick 9am to 9pm, or turn quiet hours off.";
	}
	if ((draft.frequency === "daily" || draft.frequency === "weekly") && !draft.endsAt.trim()) return "A repeating campaign needs an end date.";
	if (draft.endsAt.trim()) {
		const end = parseInstant(draft.endsAt);
		if (!end || !start) return "That end date is not valid.";
		if (end.getTime() <= start.getTime()) return "The end must be after the start.";
		if (end.getTime() - start.getTime() > 7776e6) return "A campaign can run for up to 90 days.";
	}
	return null;
}
function reviewCampaign(input) {
	const draft = input.draft;
	const now = input.now ?? /* @__PURE__ */ new Date();
	const metric = isGoalMetric(draft.goalMetric) ? draft.goalMetric : "opened";
	const attributes = (draft.attributes ?? []).filter(isBehaviorAttribute);
	const attrProblem = attributeError(attributes);
	let devices = input.devices;
	let pushReach = audienceSize(input.reach, draft.audience);
	let segmentMissing = false;
	if (draft.audience.kind === "segment") {
		const segmentId = draft.audience.segmentId;
		const segment = input.segments?.find((item) => item.id === segmentId);
		if (!segment) segmentMissing = true;
		else {
			devices = input.devices.filter((device) => matchesAll(behaviorOf(device), segment.rules) && canSeeMessage(behaviorOf(device), draft.channel, draft.layout));
			pushReach = estimateReach(audienceSize(input.reach, { kind: "all" }), input.devices.length, devices.length);
		}
	}
	if (!segmentMissing && !attrProblem && attributes.length > 0) {
		const pool = draft.audience.kind === "segment" ? input.devices : input.devices.filter((device) => fitsAudience(device, draft.audience));
		const matched = (draft.audience.kind === "segment" ? devices : pool).filter((device) => matchesAttributes(behaviorOf(device), attributes) && canSeeMessage(behaviorOf(device), draft.channel, draft.layout));
		devices = matched;
		pushReach = estimateReach(draft.audience.kind === "segment" ? audienceSize(input.reach, { kind: "all" }) : audienceSize(input.reach, draft.audience), draft.audience.kind === "segment" ? input.devices.length : pool.length, matched.length);
	}
	const tokens = tokenCounts(devices, draft.audience.kind === "segment" || attributes.length > 0 ? { kind: "all" } : draft.audience);
	const targeted = segmentMissing || attrProblem ? 0 : draft.audience.kind === "segment" || attributes.length > 0 ? pushReach : draft.channel === "inapp" && draft.layout === "primer" ? tokens.waiting : pushReach;
	const error = segmentMissing ? "That segment is not on this workspace." : attrProblem ? attrProblem : campaignError(draft, input.plan, targeted, now);
	const quiet = draft.quietHours && draft.delivery === "now" && draft.channel === "push" && inQuietHours(now);
	let state = "sent";
	if (!error) {
		if (draft.qualification !== "past") state = draft.delivery === "later" ? "scheduled" : "armed";
		else if (draft.delivery === "later") state = "scheduled";
		else if (quiet) state = "queued";
	}
	const stats = state === "sent" && !error ? projectDelivery(targeted, saltFrom(draft.title)) : {
		targeted,
		delivered: 0,
		failed: 0,
		clicked: 0
	};
	const goalPeople = draft.audience.kind === "segment" || attributes.length > 0 ? devices : input.devices.filter((device) => fitsAudience(device, draft.audience) && canSeeMessage(behaviorOf(device), draft.channel, draft.layout));
	const goalHits = state === "sent" && !error ? projectGoal(goalPeople.map(behaviorOf), metric, stats.delivered) : 0;
	return {
		error,
		targeted,
		tokens,
		state,
		stats,
		quiet,
		goalHits
	};
}
function fitsAudience(device, audience) {
	if (audience.kind === "platform") return device.platform === audience.platform;
	if (audience.kind === "tag") return device.tag === audience.tag;
	return true;
}
function behaviorOf(device) {
	return device.behavior ?? parseBehavior("", device.status);
}
function campaignError(draft, plan, targeted, now = /* @__PURE__ */ new Date()) {
	if (!draft.title.trim() || draft.title.trim().length > 65) return "Title is required, up to 65 characters.";
	if (!draft.body.trim() || draft.body.trim().length > 180) return "Message is required, up to 180 characters.";
	if (draft.video.trim() && plan !== "advance") return "Video is included on Advance.";
	if (draft.channel === "push" && draft.layout !== "lock") return "Push uses the lock screen.";
	if (draft.channel === "inapp" && draft.layout === "lock") return "Choose a banner, a modal, or a permission primer.";
	if (draft.layout === "primer" && draft.video.trim()) return "A permission primer is text and a button.";
	const linkBad = badDeepLink(draft.link);
	if (linkBad) return linkBad;
	const ctaBad = badDeepLink(draft.ctaLink);
	if (ctaBad) return ctaBad;
	const picture = imageError(draft.image, draft.link);
	if (picture) return picture;
	if (draft.button.trim().length > 24) return "The button label is up to 24 characters.";
	if (draft.layout === "primer" && !draft.button.trim()) return "The primer needs a button, such as Allow.";
	if (draft.button.trim() && !ctaHref(draft)) return "The button needs a deep link.";
	if (draft.channel === "inapp" && (draft.delaySeconds < 0 || draft.delaySeconds > 1200)) return "In-app delay is 0 to 1,200 seconds.";
	if (draft.channel === "push" && (draft.ttlHours < 1 || draft.ttlHours > 72)) return "Push stays available for 1 to 72 hours.";
	const freq = frequencyError(draft);
	if (freq) return freq;
	const timing = windowError(draft, now);
	if (timing) return timing;
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
			ctaLink: typeof parsed.ctaLink === "string" ? parsed.ctaLink : "",
			scheduleAt: typeof parsed.scheduleAt === "string" ? parsed.scheduleAt : "",
			endsAt: typeof parsed.endsAt === "string" ? parsed.endsAt : "",
			frequency: isFrequency(parsed.frequency) ? parsed.frequency : "once",
			frequencyCap: Number.isInteger(Number(parsed.frequencyCap)) ? Number(parsed.frequencyCap) : 1,
			goal: typeof parsed.goal === "string" ? parsed.goal : "",
			goalMetric: isGoalMetric(parsed.goalMetric) ? parsed.goalMetric : "opened",
			goalHits: Number.isInteger(Number(parsed.goalHits)) ? Number(parsed.goalHits) : 0,
			attributes: Array.isArray(parsed.attributes) ? parsed.attributes.filter(isBehaviorAttribute) : [],
			state: parsed.state
		};
	} catch {
		return null;
	}
}
function stateLabel(state, qualification = "past") {
	if (state === "queued") return "Queued until quiet hours end";
	if (state === "scheduled") return qualification === "past" ? "Scheduled" : "Starts at the chosen time";
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
	const { requireUserId } = await import("./verify.server-DjsZ6Nly.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
//#endregion
export { isFrequency as A, parseInstant as B, frequencyLabel as C, isAudience as D, imageFileError as E, isoToIstInput as F, seedSubscribers as G, readProcess as H, istInputToIso as I, stateLabel as J, segmentError as K, matchesAll as L, isLayout as M, isQualification as N, isBehaviorAttribute as O, isSegmentRule as P, tokenCounts as Q, mauCap as R, formatSchedule as S, imageError as T, reviewCampaign as U, permissionLabel as V, seedCampaigns as W, suggestStart as X, suggestEnd as Y, tagLabel as Z, connectedBehavior as _, IOS_EVENTS as a, describeRule as b, STEPS as c, attributeLabel as d, audienceLabel as f, chartSeries as g, behaviorSummary as h, GOAL_METRICS as i, isGoalMetric as j, isChannel as k, TAGS as l, behaviorLabel as m, BASE_REACH as n, PERMISSIONS as o, authMiddleware as p, starterSegments as q, FREE_REACH as r, SAMPLE_DISH as s, APP_EVENTS as t, attributeError as u, ctaHref as v, goalLabel as w, destinationPath as x, defaultBehavior as y, parseBehavior as z };
