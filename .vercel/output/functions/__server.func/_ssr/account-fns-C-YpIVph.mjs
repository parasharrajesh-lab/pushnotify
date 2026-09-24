import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { S as sendsAllowed, a as RIGHTS, b as quoteUsage, g as isRole, h as isPlan, l as checkPushToken, m as invitesAllowed, n as DEMO_STRIPE_SECRET, p as getSql, t as DEMO_SKYDO_SECRET, v as periodLabel } from "./owner-access-D4e8lj_h.mjs";
import { A as isFrequency, B as parseInstant, D as isAudience, E as imageFileError, G as seedSubscribers, H as readProcess, K as segmentError, M as isLayout, N as isQualification, O as isBehaviorAttribute, P as isSegmentRule, U as reviewCampaign, W as seedCampaigns, _ as connectedBehavior, j as isGoalMetric, k as isChannel, l as TAGS, n as BASE_REACH, p as authMiddleware, q as starterSegments, r as FREE_REACH, u as attributeError, w as goalLabel, z as parseBehavior } from "./middleware-qnVsyvPC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-fns-C-YpIVph.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function iso(value) {
	if (value instanceof Date) return value.toISOString();
	return String(value);
}
function asReach(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed?.android?.orders === "number" && typeof parsed?.ios?.vip === "number") return parsed;
	} catch {}
	return structuredClone(BASE_REACH);
}
function cloneReach(reach) {
	return {
		android: { ...reach.android },
		ios: { ...reach.ios }
	};
}
function cleanName(value, label) {
	const name = value.trim().replace(/\s+/g, " ");
	if (name.length < 2 || name.length > 80) throw new Error(`${label} should be 2–80 characters.`);
	return name;
}
function cleanEmail(value) {
	const email = value.trim().toLowerCase();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) throw new Error("Enter a valid email.");
	return email;
}
function cleanLink(value) {
	const link = value.trim();
	if (!link) return "";
	if (link.length > 500 || /^(javascript|data|vbscript):/i.test(link)) throw new Error("That deep link is not allowed.");
	return link;
}
function cleanImage(value) {
	const image = value.trim();
	const problem = imageFileError(image);
	if (problem) throw new Error(problem);
	return image;
}
function cleanVideo(value) {
	const video = value.trim();
	if (!video) return "";
	let url;
	try {
		url = new URL(video);
	} catch {
		throw new Error("Video must be an https link.");
	}
	if (url.protocol !== "https:") throw new Error("Video links must use https.");
	if (url.toString().length > 500) throw new Error("That video link is too long.");
	return url.toString();
}
function cleanDraft(input) {
	if (!input || !isChannel(input.channel) || !isQualification(input.qualification) || !isLayout(input.layout)) throw new Error("Choose a push or an in-app campaign.");
	if (!isAudience(input.audience)) throw new Error("Choose an audience.");
	if (input.delivery !== "now" && input.delivery !== "later") throw new Error("Choose when to send.");
	if (!isFrequency(input.frequency)) throw new Error("Choose a frequency.");
	if (!isGoalMetric(input.goalMetric)) throw new Error("Choose a goal.");
	const ttlHours = Math.round(Number(input.ttlHours));
	const delaySeconds = Math.round(Number(input.delaySeconds));
	const frequencyCap = Math.round(Number(input.frequencyCap));
	if (!Number.isFinite(ttlHours) || !Number.isFinite(delaySeconds) || !Number.isFinite(frequencyCap)) throw new Error("Check the delivery window.");
	const scheduleAt = cleanInstant(input.scheduleAt, "Start");
	const endsAt = cleanInstant(input.endsAt, "End");
	return {
		channel: input.channel,
		qualification: input.qualification,
		layout: input.channel === "push" ? "lock" : input.layout,
		audience: input.audience,
		title: (input.title ?? "").trim(),
		body: (input.body ?? "").trim(),
		link: cleanLink(input.link ?? ""),
		image: cleanImage(input.image ?? ""),
		video: cleanVideo(input.video ?? ""),
		button: (input.button ?? "").trim().slice(0, 24),
		ctaLink: cleanLink(input.ctaLink ?? ""),
		delivery: input.delivery,
		scheduleAt,
		endsAt,
		ttlHours,
		delaySeconds,
		quietHours: Boolean(input.quietHours),
		frequency: input.frequency,
		frequencyCap,
		goal: goalLabel(input.goalMetric),
		goalMetric: input.goalMetric,
		attributes: cleanAttributes(input.attributes)
	};
}
function cleanAttributes(value) {
	if (!value || value.length === 0) return [];
	const next = [];
	for (const item of value) {
		if (!isBehaviorAttribute(item)) throw new Error("That behavior attribute is not recognized.");
		if (!next.includes(item)) next.push(item);
	}
	const problem = attributeError(next);
	if (problem) throw new Error(problem);
	return next;
}
function cleanInstant(value, label) {
	const raw = (value ?? "").trim();
	if (!raw) return "";
	const date = parseInstant(raw);
	if (!date) throw new Error(`${label} is not a valid date.`);
	return date.toISOString();
}
function campaignProcess(raw) {
	const parsed = readProcess(raw);
	if (!parsed) return {};
	return {
		channel: parsed.channel,
		layout: parsed.layout,
		deliveryState: parsed.state,
		qualification: parsed.qualification,
		button: parsed.button,
		ctaLink: parsed.ctaLink,
		scheduleAt: parsed.scheduleAt,
		endsAt: parsed.endsAt,
		frequency: parsed.frequency,
		frequencyCap: parsed.frequencyCap,
		goalMetric: parsed.goalMetric,
		goalHits: parsed.goalHits,
		attributes: parsed.attributes
	};
}
async function userRow(sql, userId) {
	const row = (await sql`
    select id, email, name from "user" where id = ${userId} limit 1
  `)[0];
	if (!row) throw new Error("Account not found.");
	return {
		...row,
		email: row.email.toLowerCase()
	};
}
async function membership(sql, userId) {
	return (await sql`select business_id, role from memberships where user_id = ${userId} limit 1`)[0] ?? null;
}
async function isAdmin(sql, userId) {
	return (await sql`select user_id from platform_admins where user_id = ${userId} limit 1`).length > 0;
}
function isPreviewViewer(email) {
	return email.endsWith("@viewer.grok.invalid");
}
async function ensureAdmin(sql, userId) {
	const me = (await sql`select id, email from "user" where id = ${userId} limit 1`)[0];
	if (!me || isPreviewViewer(me.email)) return;
	if ((await sql`
    select p.user_id, u.email
    from platform_admins p
    left join "user" u on u.id = p.user_id
  `).some((row) => row.email && !isPreviewViewer(row.email))) return;
	await sql`delete from platform_admins`;
	await sql`insert into platform_admins (user_id) values (${userId})`;
}
async function createBusiness(sql, opts) {
	const id = crypto.randomUUID();
	const kind = opts.kind ?? "self";
	const billing = opts.billing ?? (kind === "enterprise" ? "pay_per_use" : "recorded");
	const onboarded = opts.onboarded ?? kind !== "enterprise";
	const starter = opts.plan === "free" ? FREE_REACH : BASE_REACH;
	const mau = opts.plan === "free" ? 136 : 6420;
	await sql`
    insert into businesses (id, name, logo, plan, mau, reach, over_cap, created_by, kind, billing, onboarded, billing_state)
    values (${id}, ${opts.name}, '', ${opts.plan}, ${mau}, ${JSON.stringify(starter)}, false, ${opts.createdBy}, ${kind}, ${billing}, ${onboarded}, 'active')
  `;
	await sql`
    insert into memberships (id, business_id, user_id, role)
    values (${crypto.randomUUID()}, ${id}, ${opts.ownerId}, 'owner')
  `;
	for (const device of seedSubscribers()) await sql`
      insert into subscribers (id, business_id, name, external_user_id, platform, city, tag, status, last_seen, behavior)
      values (
        ${crypto.randomUUID()}, ${id}, ${device.name}, ${device.userId}, ${device.platform},
        ${device.city}, ${device.tag}, ${device.status}, ${device.lastSeen}, ${JSON.stringify(device.behavior)}
      )
    `;
	for (const campaign of seedCampaigns()) await sql`
      insert into campaigns (
        id, business_id, title, body, link, image_url, video_url, audience,
        targeted, delivered, failed, clicked, seed, created_at
      ) values (
        ${crypto.randomUUID()}, ${id}, ${campaign.title}, ${campaign.body}, ${campaign.link},
        ${campaign.image ?? ""}, ${campaign.video ?? ""}, ${JSON.stringify(campaign.audience)},
        ${campaign.targeted}, ${campaign.delivered}, ${campaign.failed}, ${campaign.clicked},
        ${campaign.seed}, ${campaign.createdAt}
      )
    `;
	return id;
}
async function claimPending(sql, userId, email) {
	if (await membership(sql, userId)) return;
	const seat = (await sql`
    select id, business_name, plan, kind from business_seats where email = ${email} limit 1
  `)[0];
	if (seat && isPlan(seat.plan)) {
		const enterprise = seat.kind === "enterprise";
		await createBusiness(sql, {
			name: seat.business_name,
			plan: seat.plan,
			ownerId: userId,
			createdBy: userId,
			kind: enterprise ? "enterprise" : "self",
			billing: enterprise ? "pay_per_use" : "recorded",
			onboarded: !enterprise
		});
		await sql`delete from business_seats where id = ${seat.id}`;
		await sql`delete from team_invites where email = ${email}`;
		return;
	}
	const invite = (await sql`
    select id, business_id, role from team_invites where email = ${email} limit 1
  `)[0];
	if (invite && isRole(invite.role)) {
		await sql`
      insert into memberships (id, business_id, user_id, role)
      values (${crypto.randomUUID()}, ${invite.business_id}, ${userId}, ${invite.role})
    `;
		await sql`delete from team_invites where id = ${invite.id}`;
	}
}
async function ensureSegments(sql, businessId) {
	if ((await sql`select id from segments where business_id = ${businessId} limit 1`).length > 0) return;
	for (const starter of starterSegments()) await sql`
      insert into segments (id, business_id, name, rules)
      values (${crypto.randomUUID()}, ${businessId}, ${starter.name}, ${JSON.stringify(starter.rules)})
    `;
}
async function loadSegments(sql, businessId) {
	return (await sql`
    select id, name, rules, updated_at from segments where business_id = ${businessId} order by name
  `).flatMap((row) => {
		const rules = readRules(row.rules);
		if (rules.length === 0) return [];
		return [{
			id: row.id,
			name: row.name,
			rules,
			updatedAt: iso(row.updated_at)
		}];
	});
}
function readRules(raw) {
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed) || !parsed.every(isSegmentRule)) return [];
		return parsed;
	} catch {
		return [];
	}
}
async function slice(sql, businessId) {
	const business = (await sql`
    select id, name, logo, plan, mau, reach, over_cap, grant_sdk, grant_webhook, grant_test, kind, billing, onboarded, billing_state
    from businesses where id = ${businessId} limit 1
  `)[0];
	if (!business || !isPlan(business.plan)) return null;
	await ensureSegments(sql, businessId);
	const deviceRows = await sql`
    select id, name, external_user_id, platform, city, tag, status, last_seen, push_token, behavior
    from subscribers where business_id = ${businessId}
    order by last_seen desc
  `;
	const campaignRows = await sql`
    select id, title, body, link, image_url, video_url, audience, targeted, delivered, failed, clicked, seed, is_test, test_label, process, created_at
    from campaigns where business_id = ${businessId}
    order by created_at desc
  `;
	const subscribers = deviceRows.map((row) => ({
		id: row.id,
		name: row.name,
		userId: row.external_user_id,
		platform: row.platform === "ios" ? "ios" : "android",
		city: row.city,
		tag: TAGS.includes(row.tag) ? row.tag : "orders",
		status: row.status === "unregistered" ? "unregistered" : "active",
		lastSeen: iso(row.last_seen),
		pushToken: row.push_token,
		behavior: parseBehavior(row.behavior, row.status === "unregistered" ? "unregistered" : "active", row.external_user_id)
	}));
	const campaigns = campaignRows.map((row) => {
		let audience = { kind: "all" };
		try {
			const parsed = JSON.parse(row.audience);
			if (isAudience(parsed)) audience = parsed;
		} catch {}
		return {
			id: row.id,
			title: row.title,
			body: row.body,
			link: row.link,
			image: row.image_url,
			video: row.video_url,
			audience,
			createdAt: iso(row.created_at),
			targeted: row.targeted,
			delivered: row.delivered,
			failed: row.failed,
			clicked: row.clicked,
			seed: row.seed,
			isTest: Boolean(row.is_test),
			testLabel: row.test_label,
			...campaignProcess(row.process)
		};
	});
	const connections = (await sql`
    select id, kind, target, name, endpoint, app_key from connections
    where business_id = ${businessId}
    order by created_at desc
  `).filter((row) => (row.kind === "sdk" || row.kind === "webhook") && (row.target === "android" || row.target === "ios" || row.target === "web")).map((row) => ({
		id: row.id,
		kind: row.kind,
		target: row.target,
		name: row.name,
		endpoint: row.endpoint,
		appKey: row.app_key
	}));
	const grants = {
		sdk: Boolean(business.grant_sdk),
		webhook: Boolean(business.grant_webhook),
		test: Boolean(business.grant_test)
	};
	const invoiceRows = await sql`
    select id, period_label, plan, mau, included_mau, base_paise, overage_paise, total_paise, status
    from invoices where business_id = ${businessId}
    order by created_at desc
  `;
	const kind = business.kind === "enterprise" ? "enterprise" : "self";
	const billing = business.billing === "pay_per_use" ? "pay_per_use" : "recorded";
	return {
		id: business.id,
		name: business.name,
		logo: business.logo,
		plan: business.plan,
		mau: business.mau,
		overCap: business.over_cap,
		reach: asReach(business.reach),
		subscribers,
		campaigns,
		segments: await loadSegments(sql, businessId),
		grants,
		connections,
		kind,
		billing,
		billingState: business.billing_state === "past_due" ? "past_due" : "active",
		onboarded: Boolean(business.onboarded),
		invoices: invoiceRows.filter((row) => isPlan(row.plan)).map((row) => ({
			id: row.id,
			businessId,
			businessName: business.name,
			periodLabel: row.period_label,
			plan: row.plan,
			mau: row.mau,
			includedMau: row.included_mau,
			basePaise: row.base_paise,
			overagePaise: row.overage_paise,
			totalPaise: row.total_paise,
			status: row.status
		}))
	};
}
async function accountFor(sql, userId) {
	const user = await userRow(sql, userId);
	const admin = await isAdmin(sql, userId);
	const member = await membership(sql, userId);
	const role = member && isRole(member.role) ? member.role : null;
	const business = member ? await slice(sql, member.business_id) : null;
	let members = [];
	if (business && role && RIGHTS[role].includes("team")) {
		const people = await sql`
      select m.id, m.role, u.email, u.name
      from memberships m
      join "user" u on u.id = m.user_id
      where m.business_id = ${business.id}
      order by m.created_at
    `;
		const invites = await sql`
      select id, email, role from team_invites where business_id = ${business.id} order by created_at
    `;
		members = [...people.filter((row) => isRole(row.role)).map((row) => ({
			id: row.id,
			email: row.email,
			name: row.name,
			role: row.role,
			pending: false
		})), ...invites.filter((row) => isRole(row.role)).map((row) => ({
			id: row.id,
			email: row.email,
			name: "Invited",
			role: row.role,
			pending: true
		}))];
	}
	let businesses = [];
	let seats = [];
	let invoices = [];
	let paymentEvents = [];
	let webhookSecrets = {
		stripe: "",
		skydo: ""
	};
	if (admin) {
		businesses = (await sql`
      select b.id, b.name, b.plan, b.logo, b.grant_sdk, b.grant_webhook, b.grant_test, b.kind, b.billing, b.onboarded, b.mau, b.billing_state,
        (select u.email from memberships m join "user" u on u.id = m.user_id
          where m.business_id = b.id and m.role = 'owner' limit 1) as owner_email
      from businesses b
      order by b.created_at desc
    `).filter((row) => isPlan(row.plan)).map((row) => ({
			id: row.id,
			name: row.name,
			plan: row.plan,
			ownerEmail: row.owner_email ?? "",
			logo: row.logo,
			grants: {
				sdk: Boolean(row.grant_sdk),
				webhook: Boolean(row.grant_webhook),
				test: Boolean(row.grant_test)
			},
			kind: row.kind === "enterprise" ? "enterprise" : "self",
			billing: row.billing === "pay_per_use" ? "pay_per_use" : "recorded",
			billingState: row.billing_state === "past_due" ? "past_due" : "active",
			onboarded: Boolean(row.onboarded),
			mau: row.mau
		}));
		seats = (await sql`
      select id, business_name, email, plan, kind from business_seats order by created_at desc
    `).filter((row) => isPlan(row.plan)).map((row) => ({
			id: row.id,
			businessName: row.business_name,
			email: row.email,
			plan: row.plan,
			waiting: true,
			kind: row.kind === "enterprise" ? "enterprise" : "self"
		}));
		invoices = (await sql`
      select i.id, i.business_id, b.name as business_name, i.period_label, i.plan, i.mau,
        i.included_mau, i.base_paise, i.overage_paise, i.total_paise, i.status
      from invoices i
      join businesses b on b.id = i.business_id
      order by i.created_at desc
    `).filter((row) => isPlan(row.plan)).map((row) => ({
			id: row.id,
			businessId: row.business_id,
			businessName: row.business_name,
			periodLabel: row.period_label,
			plan: row.plan,
			mau: row.mau,
			includedMau: row.included_mau,
			basePaise: row.base_paise,
			overagePaise: row.overage_paise,
			totalPaise: row.total_paise,
			status: row.status
		}));
		await sql`
      insert into platform_settings (id, stripe_secret, skydo_secret)
      values ('default', ${DEMO_STRIPE_SECRET}, ${DEMO_SKYDO_SECRET})
      on conflict (id) do nothing
    `;
		const secrets = await sql`
      select stripe_secret, skydo_secret from platform_settings where id = 'default' limit 1
    `;
		webhookSecrets = {
			stripe: secrets[0]?.stripe_secret ?? "whsec_nock_demo_stripe",
			skydo: secrets[0]?.skydo_secret ?? "skydo_nock_demo"
		};
		paymentEvents = (await sql`
      select id, provider, event_type, email, plan, amount_paise, status, detail
      from payment_events
      order by created_at desc
      limit 20
    `).map((row) => ({
			id: row.id,
			provider: row.provider,
			eventType: row.event_type,
			email: row.email,
			plan: row.plan,
			amountPaise: row.amount_paise,
			status: row.status,
			detail: row.detail
		}));
	}
	return {
		isSystemAdmin: admin,
		email: user.email,
		name: user.name,
		role,
		members,
		seats,
		businesses,
		business,
		invoices,
		paymentEvents,
		webhookSecrets
	};
}
async function requireRight(sql, userId, right) {
	const member = await membership(sql, userId);
	if (!member || !isRole(member.role) || !RIGHTS[member.role].includes(right)) throw new Error("You do not have this right.");
	return {
		businessId: member.business_id,
		role: member.role
	};
}
async function requireAnyRight(sql, userId, rights) {
	const member = await membership(sql, userId);
	const role = member && isRole(member.role) ? member.role : null;
	if (!member || !role || !rights.some((right) => RIGHTS[role].includes(right))) throw new Error("You do not have this right.");
	return {
		businessId: member.business_id,
		role
	};
}
var loadAccount_createServerFn_handler = createServerRpc({
	id: "e338c5da8d4e59407e7f8ca5f8237db98428d53f198e62a3e3d64b81d87a1be4",
	name: "loadAccount",
	filename: "src/lib/account-fns.ts"
}, (opts) => loadAccount.__executeServer(opts));
var loadAccount = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadAccount_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	await ensureAdmin(sql, context.userId);
	const user = await userRow(sql, context.userId);
	await claimPending(sql, context.userId, user.email);
	return accountFor(sql, context.userId);
});
var completeRegistration_createServerFn_handler = createServerRpc({
	id: "be598046bfd5c09c1fb60919bedf47340bd2acc12bf3c5cc2bd2592ce35f442c",
	name: "completeRegistration",
	filename: "src/lib/account-fns.ts"
}, (opts) => completeRegistration.__executeServer(opts));
var completeRegistration = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input || !isPlan(input.plan)) throw new Error("Choose Free, Basic, or Advance.");
	return {
		businessName: cleanName(input.businessName ?? "", "Business name"),
		plan: input.plan
	};
}).handler(completeRegistration_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	await ensureAdmin(sql, context.userId);
	const user = await userRow(sql, context.userId);
	await claimPending(sql, context.userId, user.email);
	if (!await membership(sql, context.userId)) await createBusiness(sql, {
		name: data.businessName,
		plan: data.plan,
		ownerId: context.userId,
		createdBy: context.userId
	});
	return accountFor(sql, context.userId);
});
var sendPush_createServerFn_handler = createServerRpc({
	id: "189de9d168ac3b924cb0e8f126fb4903cf128e4d5e6dd17aa8a92c52c0891f61",
	name: "sendPush",
	filename: "src/lib/account-fns.ts"
}, (opts) => sendPush.__executeServer(opts));
var sendPush = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => cleanDraft(input)).handler(sendPush_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const current = await slice(sql, (await requireRight(sql, context.userId, "send")).businessId);
	if (!current) throw new Error("Workspace missing.");
	const reviewed = reviewCampaign({
		draft: data,
		reach: current.reach,
		devices: current.subscribers.map((device) => ({
			platform: device.platform,
			tag: device.tag,
			status: device.status,
			pushToken: device.pushToken,
			behavior: device.behavior
		})),
		segments: current.segments,
		plan: current.plan
	});
	if (reviewed.error) throw new Error(reviewed.error);
	const blocked = sendsAllowed({
		plan: current.plan,
		mau: current.mau,
		overCap: current.overCap,
		kind: current.kind,
		onboarded: current.onboarded,
		video: Boolean(data.video),
		billingState: current.billingState
	});
	if (blocked) throw new Error(blocked);
	const id = crypto.randomUUID();
	const process = JSON.stringify({
		channel: data.channel,
		qualification: data.qualification,
		layout: data.layout,
		delivery: data.delivery,
		ttlHours: data.ttlHours,
		delaySeconds: data.delaySeconds,
		quietHours: data.quietHours,
		button: data.button,
		ctaLink: data.ctaLink,
		scheduleAt: data.scheduleAt,
		endsAt: data.endsAt,
		frequency: data.frequency,
		frequencyCap: data.frequencyCap,
		goal: data.goal,
		goalMetric: data.goalMetric,
		goalHits: reviewed.goalHits,
		attributes: data.attributes,
		state: reviewed.state
	});
	await sql`
      insert into campaigns (
        id, business_id, title, body, link, image_url, video_url, audience,
        targeted, delivered, failed, clicked, seed, process
      ) values (
        ${id}, ${current.id}, ${data.title}, ${data.body}, ${data.link}, ${data.image}, ${data.video},
        ${JSON.stringify(data.audience)}, ${reviewed.stats.targeted}, ${reviewed.stats.delivered},
        ${reviewed.stats.failed}, ${reviewed.stats.clicked}, false, ${process}
      )
    `;
	return accountFor(sql, context.userId);
});
var saveSegment_createServerFn_handler = createServerRpc({
	id: "62f5dc1f092f45c87b3265e464106a7f18432dfd1be6d5bd4c7c1e3c24a9da96",
	name: "saveSegment",
	filename: "src/lib/account-fns.ts"
}, (opts) => saveSegment.__executeServer(opts));
var saveSegment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const problem = segmentError(input ?? {
		name: "",
		rules: []
	});
	if (problem) throw new Error(problem);
	return {
		id: (input.id ?? "").trim(),
		name: input.name.trim(),
		rules: input.rules
	};
}).handler(saveSegment_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const current = await slice(sql, (await requireRight(sql, context.userId, "send")).businessId);
	if (!current) throw new Error("Workspace missing.");
	if (current.segments.some((item) => item.name.toLowerCase() === data.name.toLowerCase() && item.id !== data.id)) throw new Error("A segment already uses that name.");
	const rules = JSON.stringify(data.rules);
	if (data.id) {
		if (!current.segments.some((item) => item.id === data.id)) throw new Error("That segment is not on this workspace.");
		await sql`
        update segments set name = ${data.name}, rules = ${rules}, updated_at = ${(/* @__PURE__ */ new Date()).toISOString()}
        where id = ${data.id} and business_id = ${current.id}
      `;
	} else {
		if (current.segments.length >= 20) throw new Error("A workspace can keep 20 segments.");
		await sql`
        insert into segments (id, business_id, name, rules)
        values (${crypto.randomUUID()}, ${current.id}, ${data.name}, ${rules})
      `;
	}
	return accountFor(sql, context.userId);
});
var addDevice_createServerFn_handler = createServerRpc({
	id: "29d9819c5ef26103ba0f2166991269e5094bd0794a7a693c48810c06527bd393",
	name: "addDevice",
	filename: "src/lib/account-fns.ts"
}, (opts) => addDevice.__executeServer(opts));
var addDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (input?.platform !== "android" && input?.platform !== "ios") throw new Error("Choose Android or iOS.");
	if (!TAGS.includes(input?.tag)) throw new Error("Choose a tag.");
	return {
		name: cleanName(input.name ?? "", "Name"),
		userId: cleanName(input.userId ?? "", "User id"),
		platform: input.platform,
		city: cleanName(input.city || "Mumbai", "City"),
		tag: input.tag
	};
}).handler(addDevice_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const current = await slice(sql, (await requireRight(sql, context.userId, "devices_edit")).businessId);
	if (!current) throw new Error("Workspace missing.");
	const reach = cloneReach(current.reach);
	reach[data.platform][data.tag] += 1;
	await sql`
      insert into subscribers (id, business_id, name, external_user_id, platform, city, tag, status, last_seen, behavior)
      values (${crypto.randomUUID()}, ${current.id}, ${data.name}, ${data.userId}, ${data.platform}, ${data.city}, ${data.tag}, 'active', ${(/* @__PURE__ */ new Date()).toISOString()}, ${JSON.stringify(connectedBehavior())})
    `;
	await sql`
      update businesses set mau = ${current.mau + 1}, reach = ${JSON.stringify(reach)} where id = ${current.id}
    `;
	return accountFor(sql, context.userId);
});
var dropDevice_createServerFn_handler = createServerRpc({
	id: "4e41039d82fa094af5c7e846dfa80a46b758fbc525983fa6c1450a0e45ff0681",
	name: "dropDevice",
	filename: "src/lib/account-fns.ts"
}, (opts) => dropDevice.__executeServer(opts));
var dropDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = (id ?? "").trim();
	if (!value) throw new Error("Missing device.");
	return value;
}).handler(dropDevice_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	const current = await slice(sql, (await requireRight(sql, context.userId, "devices_edit")).businessId);
	if (!current) throw new Error("Workspace missing.");
	const device = current.subscribers.find((item) => item.id === id && item.status === "active");
	if (!device) throw new Error("That token is already dropped.");
	const reach = cloneReach(current.reach);
	reach[device.platform][device.tag] = Math.max(0, reach[device.platform][device.tag] - 1);
	await sql`
      update subscribers set status = 'unregistered', behavior = ${JSON.stringify({
		...device.behavior,
		permission: "denied"
	})}
      where id = ${id} and business_id = ${current.id}
    `;
	await sql`
      update businesses set mau = ${Math.max(0, current.mau - 1)}, reach = ${JSON.stringify(reach)} where id = ${current.id}
    `;
	return accountFor(sql, context.userId);
});
var setCapPreview_createServerFn_handler = createServerRpc({
	id: "f5394ea229d65620f5bebd9c39e368177dc27e9985caa99356338ea24bb68988",
	name: "setCapPreview",
	filename: "src/lib/account-fns.ts"
}, (opts) => setCapPreview.__executeServer(opts));
var setCapPreview = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((on) => Boolean(on)).handler(setCapPreview_createServerFn_handler, async ({ context, data: on }) => {
	const sql = await getSql();
	await sql`update businesses set over_cap = ${on} where id = ${(await requireRight(sql, context.userId, "plan")).businessId}`;
	return accountFor(sql, context.userId);
});
var resetWorkspace_createServerFn_handler = createServerRpc({
	id: "df7c190e9e1c60745bd9adaad36f69eb5a9fe0091a6f993d9ace1c25aa1c5c13",
	name: "resetWorkspace",
	filename: "src/lib/account-fns.ts"
}, (opts) => resetWorkspace.__executeServer(opts));
var resetWorkspace = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(resetWorkspace_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const member = await requireRight(sql, context.userId, "plan_edit");
	await sql`delete from subscribers where business_id = ${member.businessId}`;
	await sql`delete from campaigns where business_id = ${member.businessId}`;
	for (const device of seedSubscribers()) await sql`
        insert into subscribers (id, business_id, name, external_user_id, platform, city, tag, status, last_seen, behavior)
        values (
          ${crypto.randomUUID()}, ${member.businessId}, ${device.name}, ${device.userId}, ${device.platform},
          ${device.city}, ${device.tag}, ${device.status}, ${device.lastSeen}, ${JSON.stringify(device.behavior)}
        )
      `;
	for (const campaign of seedCampaigns()) await sql`
        insert into campaigns (
          id, business_id, title, body, link, image_url, video_url, audience,
          targeted, delivered, failed, clicked, seed, created_at
        ) values (
          ${crypto.randomUUID()}, ${member.businessId}, ${campaign.title}, ${campaign.body}, ${campaign.link},
          ${campaign.image ?? ""}, ${campaign.video ?? ""}, ${JSON.stringify(campaign.audience)},
          ${campaign.targeted}, ${campaign.delivered}, ${campaign.failed}, ${campaign.clicked},
          ${campaign.seed}, ${campaign.createdAt}
        )
      `;
	await sql`
      update businesses set mau = 6420, reach = ${JSON.stringify(BASE_REACH)}, over_cap = false
      where id = ${member.businessId}
    `;
	return accountFor(sql, context.userId);
});
var updateBrand_createServerFn_handler = createServerRpc({
	id: "bed11b0809ed8a9c990a705979144d05fdec89c865b8ad950ca9e7a6b83237ae",
	name: "updateBrand",
	filename: "src/lib/account-fns.ts"
}, (opts) => updateBrand.__executeServer(opts));
var updateBrand = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	name: cleanName(input?.name ?? "", "Business name"),
	logo: cleanImage(input?.logo ?? "")
})).handler(updateBrand_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const member = await requireRight(sql, context.userId, "brand");
	await sql`update businesses set name = ${data.name}, logo = ${data.logo} where id = ${member.businessId}`;
	return accountFor(sql, context.userId);
});
var setOwnPlan_createServerFn_handler = createServerRpc({
	id: "f3a1292298fa23440492ab4c82d59b02fe7df817d2bae528a6d7e23edd66abeb",
	name: "setOwnPlan",
	filename: "src/lib/account-fns.ts"
}, (opts) => setOwnPlan.__executeServer(opts));
var setOwnPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((plan) => {
	if (!isPlan(plan)) throw new Error("Choose Free, Basic, or Advance.");
	return plan;
}).handler(setOwnPlan_createServerFn_handler, async ({ context, data: plan }) => {
	const sql = await getSql();
	await sql`update businesses set plan = ${plan}, over_cap = false where id = ${(await requireRight(sql, context.userId, "plan_edit")).businessId}`;
	return accountFor(sql, context.userId);
});
var inviteMember_createServerFn_handler = createServerRpc({
	id: "66079c67d0af64eb5ec7a4ba89656e49571ba71c3fbf129f8898779e507fc80c",
	name: "inviteMember",
	filename: "src/lib/account-fns.ts"
}, (opts) => inviteMember.__executeServer(opts));
var inviteMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isRole(input?.role)) throw new Error("Choose a role.");
	return {
		email: cleanEmail(input.email ?? ""),
		role: input.role
	};
}).handler(inviteMember_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const member = await requireRight(sql, context.userId, "team");
	const workspace = await slice(sql, member.businessId);
	const blockedInvite = invitesAllowed(workspace?.plan ?? "free");
	if (blockedInvite) throw new Error(blockedInvite);
	if ((await sql`
      select u.id from "user" u
      join memberships m on m.user_id = u.id
      where lower(u.email) = ${data.email}
      limit 1
    `).length > 0) throw new Error("That person already belongs to a workspace.");
	const known = await sql`select id from "user" where lower(email) = ${data.email} limit 1`;
	if (known[0]) await sql`
        insert into memberships (id, business_id, user_id, role)
        values (${crypto.randomUUID()}, ${member.businessId}, ${known[0].id}, ${data.role})
      `;
	else await sql`
        insert into team_invites (id, business_id, email, role)
        values (${crypto.randomUUID()}, ${member.businessId}, ${data.email}, ${data.role})
        on conflict (business_id, email) do update set role = ${data.role}
      `;
	return accountFor(sql, context.userId);
});
var setMemberRole_createServerFn_handler = createServerRpc({
	id: "00de172fcf2d7e88374caa90a4646f98caaab2cd4392b6ade25ef766a550efa6",
	name: "setMemberRole",
	filename: "src/lib/account-fns.ts"
}, (opts) => setMemberRole.__executeServer(opts));
var setMemberRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isRole(input?.role)) throw new Error("Choose a role.");
	const id = (input?.id ?? "").trim();
	if (!id) throw new Error("Missing member.");
	return {
		id,
		role: input.role
	};
}).handler(setMemberRole_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const member = await requireRight(sql, context.userId, "team");
	const owners = await sql`
      select id from memberships where business_id = ${member.businessId} and role = 'owner'
    `;
	const target = await sql`
      select id, role, user_id from memberships where id = ${data.id} and business_id = ${member.businessId} limit 1
    `;
	if (!target[0]) throw new Error("Member not found.");
	if (target[0].role === "owner" && data.role !== "owner" && owners.length < 2) throw new Error("Keep at least one owner.");
	await sql`update memberships set role = ${data.role} where id = ${data.id} and business_id = ${member.businessId}`;
	return accountFor(sql, context.userId);
});
var removeMember_createServerFn_handler = createServerRpc({
	id: "7b086128cb6642a772c2c34083e89c1b44849b15de5fa972d254da13be0202a7",
	name: "removeMember",
	filename: "src/lib/account-fns.ts"
}, (opts) => removeMember.__executeServer(opts));
var removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = (id ?? "").trim();
	if (!value) throw new Error("Missing member.");
	return value;
}).handler(removeMember_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	const member = await requireRight(sql, context.userId, "team");
	if ((await sql`
      select id from team_invites where id = ${id} and business_id = ${member.businessId} limit 1
    `)[0]) {
		await sql`delete from team_invites where id = ${id} and business_id = ${member.businessId}`;
		return accountFor(sql, context.userId);
	}
	const target = await sql`
      select role from memberships where id = ${id} and business_id = ${member.businessId} limit 1
    `;
	if (!target[0]) throw new Error("Member not found.");
	if (target[0].role === "owner") {
		if ((await sql`
        select id from memberships where business_id = ${member.businessId} and role = 'owner'
      `).length < 2) throw new Error("Keep at least one owner.");
	}
	await sql`delete from memberships where id = ${id} and business_id = ${member.businessId}`;
	return accountFor(sql, context.userId);
});
var addBusinessUser_createServerFn_handler = createServerRpc({
	id: "fd31a23d1feee2ab103a0b8ac5deb1a6dbd3c208813fc9f743bee45a2fb44e21",
	name: "addBusinessUser",
	filename: "src/lib/account-fns.ts"
}, (opts) => addBusinessUser.__executeServer(opts));
var addBusinessUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
	return {
		businessName: cleanName(input.businessName ?? "", "Business name"),
		email: cleanEmail(input.email ?? ""),
		plan: input.plan
	};
}).handler(addBusinessUser_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!await isAdmin(sql, context.userId)) throw new Error("System rights are required.");
	if ((await sql`
      select m.id from memberships m
      join "user" u on u.id = m.user_id
      where lower(u.email) = ${data.email}
      limit 1
    `).length > 0) throw new Error("That email already has a workspace.");
	const known = await sql`select id from "user" where lower(email) = ${data.email} limit 1`;
	if (known[0]) await createBusiness(sql, {
		name: data.businessName,
		plan: data.plan,
		ownerId: known[0].id,
		createdBy: context.userId
	});
	else await sql`
        insert into business_seats (id, business_name, email, plan, created_by)
        values (${crypto.randomUUID()}, ${data.businessName}, ${data.email}, ${data.plan}, ${context.userId})
        on conflict (email) do update set business_name = ${data.businessName}, plan = ${data.plan}
      `;
	return accountFor(sql, context.userId);
});
var setBusinessPlan_createServerFn_handler = createServerRpc({
	id: "08843f162bf4afa2aeb1dd78b86e6ea264e613fdf2621bf1cf305672b4cdd42e",
	name: "setBusinessPlan",
	filename: "src/lib/account-fns.ts"
}, (opts) => setBusinessPlan.__executeServer(opts));
var setBusinessPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
	const id = (input?.id ?? "").trim();
	if (!id) throw new Error("Missing business.");
	return {
		id,
		plan: input.plan
	};
}).handler(setBusinessPlan_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!await isAdmin(sql, context.userId)) throw new Error("System rights are required.");
	await sql`update businesses set plan = ${data.plan} where id = ${data.id}`;
	return accountFor(sql, context.userId);
});
var TARGETS = [
	"android",
	"ios",
	"web"
];
function isTarget(value) {
	return TARGETS.includes(value);
}
function appKey() {
	return `nock_${(crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "").slice(0, 24)}`;
}
var setBusinessGrants_createServerFn_handler = createServerRpc({
	id: "ad9d0a7140bcfe9543b54f4cd1a5f4b28f641264872484121429e6dfa6eb3476",
	name: "setBusinessGrants",
	filename: "src/lib/account-fns.ts"
}, (opts) => setBusinessGrants.__executeServer(opts));
var setBusinessGrants = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = (input?.id ?? "").trim();
	if (!id) throw new Error("Missing business.");
	return {
		id,
		sdk: Boolean(input.sdk),
		webhook: Boolean(input.webhook),
		test: Boolean(input.test)
	};
}).handler(setBusinessGrants_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!await isAdmin(sql, context.userId)) throw new Error("System rights are required.");
	await sql`
      update businesses set grant_sdk = ${data.sdk}, grant_webhook = ${data.webhook}, grant_test = ${data.test}
      where id = ${data.id}
    `;
	return accountFor(sql, context.userId);
});
var addConnection_createServerFn_handler = createServerRpc({
	id: "9e73be6c65be06dfccee246ca4c0c4aeb65774348560f66b0270e7a0caa2b90a",
	name: "addConnection",
	filename: "src/lib/account-fns.ts"
}, (opts) => addConnection.__executeServer(opts));
var addConnection = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (input?.kind !== "sdk" && input?.kind !== "webhook") throw new Error("Choose an SDK or a webhook.");
	if (!isTarget(input?.target ?? "")) throw new Error("Choose Android, iOS, or a website.");
	const name = (input.name ?? "").trim().replace(/\s+/g, " ");
	if (name.length < 2 || name.length > 60) throw new Error("Name the app in 2–60 characters.");
	const endpoint = (input.endpoint ?? "").trim();
	if (input.kind === "webhook") {
		let url;
		try {
			url = new URL(endpoint);
		} catch {
			throw new Error("Webhook must be an https link.");
		}
		if (url.protocol !== "https:" || url.toString().length > 500) throw new Error("Webhook must be an https link.");
		return {
			kind: input.kind,
			target: input.target,
			name,
			endpoint: url.toString()
		};
	}
	if (endpoint && (endpoint.length > 160 || /^(javascript|data):/i.test(endpoint))) throw new Error("That app id is not allowed.");
	return {
		kind: input.kind,
		target: input.target,
		name,
		endpoint
	};
}).handler(addConnection_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const current = await slice(sql, (await requireRight(sql, context.userId, "connect")).businessId);
	if (!current) throw new Error("Workspace missing.");
	if (data.kind === "sdk" && !current.grants.sdk) throw new Error("The system admin has not granted SDK access.");
	if (data.kind === "webhook" && !current.grants.webhook) throw new Error("The system admin has not granted webhook access.");
	const key = data.kind === "sdk" ? appKey() : "";
	await sql`
      insert into connections (id, business_id, kind, target, name, endpoint, app_key)
      values (${crypto.randomUUID()}, ${current.id}, ${data.kind}, ${data.target}, ${data.name}, ${data.endpoint}, ${key})
    `;
	return accountFor(sql, context.userId);
});
var removeConnection_createServerFn_handler = createServerRpc({
	id: "025263a4398f7686ad1a3b9438c5581b7e64691e1c44ade746fbee6265ccef87",
	name: "removeConnection",
	filename: "src/lib/account-fns.ts"
}, (opts) => removeConnection.__executeServer(opts));
var removeConnection = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = (id ?? "").trim();
	if (!value) throw new Error("Missing connection.");
	return value;
}).handler(removeConnection_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	await sql`delete from connections where id = ${id} and business_id = ${(await requireRight(sql, context.userId, "connect")).businessId}`;
	return accountFor(sql, context.userId);
});
var runTest_createServerFn_handler = createServerRpc({
	id: "39f5411c550fe32045b3f0523f8d78d7b937333f12ae4cad8f2f8a4e0f86d89a",
	name: "runTest",
	filename: "src/lib/account-fns.ts"
}, (opts) => runTest.__executeServer(opts));
var runTest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const connectionId = (input?.connectionId ?? "").trim();
	const title = (input?.title ?? "").trim();
	const body = (input?.body ?? "").trim();
	const link = (input?.link ?? "").trim();
	const button = (input?.button ?? "").trim().slice(0, 24);
	const ctaLink = (input?.ctaLink ?? "").trim();
	if (!connectionId) throw new Error("Choose a connection.");
	if (!title || title.length > 65) throw new Error("Title is required, up to 65 characters.");
	if (!body || body.length > 180) throw new Error("Message is required, up to 180 characters.");
	if (link.length > 500 || /^(javascript|data|vbscript):/i.test(link)) throw new Error("That deep link is not allowed.");
	if (ctaLink.length > 500 || /^(javascript|data|vbscript):/i.test(ctaLink)) throw new Error("That deep link is not allowed.");
	if (button && !ctaLink && !link) throw new Error("The button needs a deep link.");
	return {
		connectionId,
		title,
		body,
		link,
		button,
		ctaLink
	};
}).handler(runTest_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const current = await slice(sql, (await requireRight(sql, context.userId, "test")).businessId);
	if (!current) throw new Error("Workspace missing.");
	if (!current.grants.test) throw new Error("The system admin has not granted test runs.");
	const connection = current.connections.find((item) => item.id === data.connectionId);
	if (!connection) throw new Error("That connection is not on this workspace.");
	const targetLabel = connection.target === "android" ? "Android" : connection.target === "ios" ? "iOS" : "Website";
	const audience = connection.target === "web" ? { kind: "all" } : {
		kind: "platform",
		platform: connection.target
	};
	const process = JSON.stringify({
		channel: "push",
		qualification: "past",
		layout: "lock",
		delivery: "now",
		ttlHours: 1,
		delaySeconds: 0,
		quietHours: false,
		button: data.button,
		ctaLink: data.ctaLink,
		scheduleAt: "",
		endsAt: "",
		frequency: "once",
		frequencyCap: 1,
		goal: "Test",
		state: "sent"
	});
	await sql`
      insert into campaigns (
        id, business_id, title, body, link, image_url, video_url, audience,
        targeted, delivered, failed, clicked, seed, is_test, test_label, process
      ) values (
        ${crypto.randomUUID()}, ${current.id}, ${data.title}, ${data.body}, ${data.link}, '', '',
        ${JSON.stringify(audience)}, 1, 1, 0, 0, false, true, ${`${targetLabel} · ${connection.name}`}, ${process}
      )
    `;
	return accountFor(sql, context.userId);
});
var registerEnterprise_createServerFn_handler = createServerRpc({
	id: "03c65a8338c966a9dd33e50f367f6a8656c6138fb44217a609865aee6301ad85",
	name: "registerEnterprise",
	filename: "src/lib/account-fns.ts"
}, (opts) => registerEnterprise.__executeServer(opts));
var registerEnterprise = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
	return {
		businessName: cleanName(input.businessName ?? "", "Business name"),
		contact: cleanName(input.contact ?? "", "Contact name"),
		email: cleanEmail(input.email ?? ""),
		plan: input.plan
	};
}).handler(registerEnterprise_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	if (!await isAdmin(sql, context.userId)) throw new Error("System rights are required.");
	if ((await sql`
      select m.id from memberships m
      join "user" u on u.id = m.user_id
      where lower(u.email) = ${data.email}
      limit 1
    `).length > 0) throw new Error("That email already has a workspace.");
	const known = await sql`select id from "user" where lower(email) = ${data.email} limit 1`;
	if (known[0]) await createBusiness(sql, {
		name: data.businessName,
		plan: data.plan,
		ownerId: known[0].id,
		createdBy: context.userId,
		kind: "enterprise",
		billing: "pay_per_use",
		onboarded: false
	});
	else await sql`
        insert into business_seats (id, business_name, email, plan, created_by, kind)
        values (${crypto.randomUUID()}, ${data.businessName}, ${data.email}, ${data.plan}, ${context.userId}, 'enterprise')
        on conflict (email) do update set business_name = ${data.businessName}, plan = ${data.plan}, kind = 'enterprise'
      `;
	return accountFor(sql, context.userId);
});
var acceptEnterprise_createServerFn_handler = createServerRpc({
	id: "e5552f434efd11b3617fca09925282a35e007b5a90625715605904f001a128dc",
	name: "acceptEnterprise",
	filename: "src/lib/account-fns.ts"
}, (opts) => acceptEnterprise.__executeServer(opts));
var acceptEnterprise = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(acceptEnterprise_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const current = await slice(sql, (await requireRight(sql, context.userId, "plan_edit")).businessId);
	if (!current || current.kind !== "enterprise") throw new Error("This workspace is not an enterprise.");
	await sql`update businesses set onboarded = true where id = ${current.id}`;
	return accountFor(sql, context.userId);
});
var issueInvoice_createServerFn_handler = createServerRpc({
	id: "46dce5ca3933ba564633676eb60cf4ffab102aaef92482ff8a97017d798ea755",
	name: "issueInvoice",
	filename: "src/lib/account-fns.ts"
}, (opts) => issueInvoice.__executeServer(opts));
var issueInvoice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = (id ?? "").trim();
	if (!value) throw new Error("Missing business.");
	return value;
}).handler(issueInvoice_createServerFn_handler, async ({ context, data: id }) => {
	const sql = await getSql();
	if (!await isAdmin(sql, context.userId)) throw new Error("System rights are required.");
	const current = await slice(sql, id);
	if (!current || current.kind !== "enterprise") throw new Error("Only an onboarded enterprise can be billed.");
	if (!current.onboarded) throw new Error("The enterprise has not accepted pay-per-use yet.");
	const quote = quoteUsage(current.plan, current.mau);
	const label = periodLabel();
	if ((await sql`
      select id from invoices where business_id = ${current.id} and period_label = ${label} limit 1
    `)[0]) throw new Error(`${label} is already billed.`);
	await sql`
      insert into invoices (
        id, business_id, period_label, plan, mau, included_mau, base_paise, overage_paise, total_paise, status
      ) values (
        ${crypto.randomUUID()}, ${current.id}, ${label}, ${current.plan}, ${quote.mau}, ${quote.includedMau},
        ${quote.basePaise}, ${quote.overagePaise}, ${quote.totalPaise}, 'issued'
      )
    `;
	return accountFor(sql, context.userId);
});
var connectToken_createServerFn_handler = createServerRpc({
	id: "6cd9b078c6b114a7009caec8b27ab039e9317d436d6c6215eaa4c86e40be4e85",
	name: "connectToken",
	filename: "src/lib/account-fns.ts"
}, (opts) => connectToken.__executeServer(opts));
var connectToken = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (input?.platform !== "android" && input?.platform !== "ios") throw new Error("Choose Android or iOS.");
	const problem = checkPushToken(input.platform, input?.token ?? "");
	if (problem) throw new Error(problem);
	const token = input.token.trim();
	const fallback = input.platform === "android" ? "Android token" : "iOS token";
	const name = (input.name ?? "").trim() ? cleanName(input.name, "Device name") : fallback;
	return {
		platform: input.platform,
		token,
		name
	};
}).handler(connectToken_createServerFn_handler, async ({ context, data }) => {
	const sql = await getSql();
	const current = await slice(sql, (await requireAnyRight(sql, context.userId, ["connect", "devices_edit"])).businessId);
	if (!current) throw new Error("Workspace missing.");
	if (current.kind === "enterprise" && !current.onboarded) throw new Error("Finish enterprise onboarding before connecting a token.");
	if (current.subscribers.some((item) => item.status === "active" && item.pushToken === data.token)) throw new Error("That messaging token is already connected.");
	const reach = cloneReach(current.reach);
	reach[data.platform].orders += 1;
	const userId = `tok_${data.token.slice(-8).toLowerCase()}`;
	await sql`
      insert into subscribers (id, business_id, name, external_user_id, platform, city, tag, status, last_seen, push_token, behavior)
      values (
        ${crypto.randomUUID()}, ${current.id}, ${data.name}, ${userId}, ${data.platform},
        'Connected', 'orders', 'active', ${(/* @__PURE__ */ new Date()).toISOString()}, ${data.token}, ${JSON.stringify(connectedBehavior())}
      )
    `;
	await sql`
      update businesses set mau = ${current.mau + 1}, reach = ${JSON.stringify(reach)} where id = ${current.id}
    `;
	return accountFor(sql, context.userId);
});
//#endregion
export { acceptEnterprise_createServerFn_handler, addBusinessUser_createServerFn_handler, addConnection_createServerFn_handler, addDevice_createServerFn_handler, completeRegistration_createServerFn_handler, connectToken_createServerFn_handler, dropDevice_createServerFn_handler, inviteMember_createServerFn_handler, issueInvoice_createServerFn_handler, loadAccount_createServerFn_handler, registerEnterprise_createServerFn_handler, removeConnection_createServerFn_handler, removeMember_createServerFn_handler, resetWorkspace_createServerFn_handler, runTest_createServerFn_handler, saveSegment_createServerFn_handler, sendPush_createServerFn_handler, setBusinessGrants_createServerFn_handler, setBusinessPlan_createServerFn_handler, setCapPreview_createServerFn_handler, setMemberRole_createServerFn_handler, setOwnPlan_createServerFn_handler, updateBrand_createServerFn_handler };
