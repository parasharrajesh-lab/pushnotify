import { createServerFn } from "@tanstack/react-start";
import {
  isPlan,
  isRole,
  RIGHTS,
  type AccountPayload,
  type BusinessListRow,
  type BusinessSlice,
  type ConnectKind,
  type ConnectionRow,
  type ConnectTarget,
  type Grants,
  type MemberRow,
  type PlanId,
  type Role,
  type SeatRow,
} from "@/lib/account-types";
import { checkPushToken, invitesAllowed, periodLabel, quoteUsage, sendsAllowed } from "@/lib/billing";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql, type Sql } from "@/lib/db";
import { DEMO_SKYDO_SECRET, DEMO_STRIPE_SECRET } from "@/lib/owner-access";
import {
  audienceSize,
  BASE_REACH,
  FREE_REACH,
  isAudience,
  projectDelivery,
  saltFrom,
  seedCampaigns,
  seedSubscribers,
  TAGS,
  type Audience,
  type Campaign,
  type Platform,
  type Reach,
  type Subscriber,
  type Tag,
} from "@/lib/push";

type Member = { business_id: string; role: string };

function iso(value: unknown) {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function asReach(raw: string): Reach {
  try {
    const parsed = JSON.parse(raw) as Reach;
    if (typeof parsed?.android?.orders === "number" && typeof parsed?.ios?.vip === "number") return parsed;
  } catch {
    /* seed shape */
  }
  return structuredClone(BASE_REACH);
}

function cloneReach(reach: Reach): Reach {
  return { android: { ...reach.android }, ios: { ...reach.ios } };
}

function cleanName(value: string, label: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 80) throw new Error(`${label} should be 2–80 characters.`);
  return name;
}

function cleanEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) throw new Error("Enter a valid email.");
  return email;
}

function cleanLink(value: string) {
  const link = value.trim();
  if (!link) return "";
  if (link.length > 500 || /^(javascript|data|vbscript):/i.test(link)) throw new Error("That deep link is not allowed.");
  return link;
}

function cleanImage(value: string) {
  const image = value.trim();
  if (!image) return "";
  if (image.startsWith("data:image/")) {
    if (!/^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(image) || image.length > 180_000) {
      throw new Error("Use a PNG, JPEG, WEBP, or GIF under 120 KB.");
    }
    return image;
  }
  let url: URL;
  try {
    url = new URL(image);
  } catch {
    throw new Error("Image must be an https link or a small upload.");
  }
  if (url.protocol !== "https:") throw new Error("Image links must use https.");
  return url.toString();
}

function cleanVideo(value: string) {
  const video = value.trim();
  if (!video) return "";
  let url: URL;
  try {
    url = new URL(video);
  } catch {
    throw new Error("Video must be an https link.");
  }
  if (url.protocol !== "https:") throw new Error("Video links must use https.");
  if (url.toString().length > 500) throw new Error("That video link is too long.");
  return url.toString();
}

async function userRow(sql: Sql, userId: string) {
  const rows = await sql<{ id: string; email: string; name: string }>`
    select id, email, name from "user" where id = ${userId} limit 1
  `;
  const row = rows[0];
  if (!row) throw new Error("Account not found.");
  return { ...row, email: row.email.toLowerCase() };
}

async function membership(sql: Sql, userId: string) {
  const rows = await sql<Member>`select business_id, role from memberships where user_id = ${userId} limit 1`;
  return rows[0] ?? null;
}

async function isAdmin(sql: Sql, userId: string) {
  const rows = await sql<{ user_id: string }>`select user_id from platform_admins where user_id = ${userId} limit 1`;
  return rows.length > 0;
}

function isPreviewViewer(email: string) {
  return email.endsWith("@viewer.grok.invalid");
}

async function ensureAdmin(sql: Sql, userId: string) {
  const user = await sql<{ id: string; email: string }>`select id, email from "user" where id = ${userId} limit 1`;
  const me = user[0];
  if (!me || isPreviewViewer(me.email)) return;
  const rows = await sql<{ user_id: string; email: string | null }>`
    select p.user_id, u.email
    from platform_admins p
    left join "user" u on u.id = p.user_id
  `;
  const real = rows.some((row) => row.email && !isPreviewViewer(row.email));
  if (real) return;
  await sql`delete from platform_admins`;
  await sql`insert into platform_admins (user_id) values (${userId})`;
}

async function createBusiness(
  sql: Sql,
  opts: {
    name: string;
    plan: PlanId;
    ownerId: string;
    createdBy: string;
    kind?: "self" | "enterprise";
    billing?: "recorded" | "pay_per_use";
    onboarded?: boolean;
  },
) {
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
  for (const device of seedSubscribers()) {
    await sql`
      insert into subscribers (id, business_id, name, external_user_id, platform, city, tag, status, last_seen)
      values (
        ${crypto.randomUUID()}, ${id}, ${device.name}, ${device.userId}, ${device.platform},
        ${device.city}, ${device.tag}, ${device.status}, ${device.lastSeen}
      )
    `;
  }
  for (const campaign of seedCampaigns()) {
    await sql`
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
  }
  return id;
}

async function claimPending(sql: Sql, userId: string, email: string) {
  if (await membership(sql, userId)) return;
  const seats = await sql<{ id: string; business_name: string; plan: string; kind: string }>`
    select id, business_name, plan, kind from business_seats where email = ${email} limit 1
  `;
  const seat = seats[0];
  if (seat && isPlan(seat.plan)) {
    const enterprise = seat.kind === "enterprise";
    await createBusiness(sql, {
      name: seat.business_name,
      plan: seat.plan,
      ownerId: userId,
      createdBy: userId,
      kind: enterprise ? "enterprise" : "self",
      billing: enterprise ? "pay_per_use" : "recorded",
      onboarded: !enterprise,
    });
    await sql`delete from business_seats where id = ${seat.id}`;
    await sql`delete from team_invites where email = ${email}`;
    return;
  }
  const invites = await sql<{ id: string; business_id: string; role: string }>`
    select id, business_id, role from team_invites where email = ${email} limit 1
  `;
  const invite = invites[0];
  if (invite && isRole(invite.role)) {
    await sql`
      insert into memberships (id, business_id, user_id, role)
      values (${crypto.randomUUID()}, ${invite.business_id}, ${userId}, ${invite.role})
    `;
    await sql`delete from team_invites where id = ${invite.id}`;
  }
}

async function slice(sql: Sql, businessId: string): Promise<BusinessSlice | null> {
  const businesses = await sql<{
    id: string;
    name: string;
    logo: string;
    plan: string;
    mau: number;
    reach: string;
    over_cap: boolean;
    grant_sdk: boolean;
    grant_webhook: boolean;
    grant_test: boolean;
    kind: string;
    billing: string;
    onboarded: boolean;
    billing_state: string;
  }>`
    select id, name, logo, plan, mau, reach, over_cap, grant_sdk, grant_webhook, grant_test, kind, billing, onboarded, billing_state
    from businesses where id = ${businessId} limit 1
  `;
  const business = businesses[0];
  if (!business || !isPlan(business.plan)) return null;
  const deviceRows = await sql<{
    id: string;
    name: string;
    external_user_id: string;
    platform: string;
    city: string;
    tag: string;
    status: string;
    last_seen: unknown;
    push_token: string;
  }>`
    select id, name, external_user_id, platform, city, tag, status, last_seen, push_token
    from subscribers where business_id = ${businessId}
    order by last_seen desc
  `;
  const campaignRows = await sql<{
    id: string;
    title: string;
    body: string;
    link: string;
    image_url: string;
    video_url: string;
    audience: string;
    targeted: number;
    delivered: number;
    failed: number;
    clicked: number;
    seed: boolean;
    is_test: boolean;
    test_label: string;
    created_at: unknown;
  }>`
    select id, title, body, link, image_url, video_url, audience, targeted, delivered, failed, clicked, seed, is_test, test_label, created_at
    from campaigns where business_id = ${businessId}
    order by created_at desc
  `;
  const subscribers: Subscriber[] = deviceRows.map((row) => ({
    id: row.id,
    name: row.name,
    userId: row.external_user_id,
    platform: row.platform === "ios" ? "ios" : "android",
    city: row.city,
    tag: (TAGS as readonly string[]).includes(row.tag) ? (row.tag as Tag) : "orders",
    status: row.status === "unregistered" ? "unregistered" : "active",
    lastSeen: iso(row.last_seen),
    pushToken: row.push_token,
  }));
  const campaigns: Campaign[] = campaignRows.map((row) => {
    let audience: Audience = { kind: "all" };
    try {
      const parsed: unknown = JSON.parse(row.audience);
      if (isAudience(parsed)) audience = parsed;
    } catch {
      /* keep all */
    }
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
    };
  });
  const linkRows = await sql<{
    id: string;
    kind: string;
    target: string;
    name: string;
    endpoint: string;
    app_key: string;
  }>`
    select id, kind, target, name, endpoint, app_key from connections
    where business_id = ${businessId}
    order by created_at desc
  `;
  const connections: ConnectionRow[] = linkRows
    .filter((row) => (row.kind === "sdk" || row.kind === "webhook") && (row.target === "android" || row.target === "ios" || row.target === "web"))
    .map((row) => ({
      id: row.id,
      kind: row.kind as ConnectKind,
      target: row.target as ConnectTarget,
      name: row.name,
      endpoint: row.endpoint,
      appKey: row.app_key,
    }));
  const grants: Grants = {
    sdk: Boolean(business.grant_sdk),
    webhook: Boolean(business.grant_webhook),
    test: Boolean(business.grant_test),
  };
  const invoiceRows = await sql<{
    id: string;
    period_label: string;
    plan: string;
    mau: number;
    included_mau: number;
    base_paise: number;
    overage_paise: number;
    total_paise: number;
    status: string;
  }>`
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
      plan: row.plan as PlanId,
      mau: row.mau,
      includedMau: row.included_mau,
      basePaise: row.base_paise,
      overagePaise: row.overage_paise,
      totalPaise: row.total_paise,
      status: row.status,
    })),
  };
}

async function accountFor(sql: Sql, userId: string): Promise<AccountPayload> {
  const user = await userRow(sql, userId);
  const admin = await isAdmin(sql, userId);
  const member = await membership(sql, userId);
  const role = member && isRole(member.role) ? member.role : null;
  const business = member ? await slice(sql, member.business_id) : null;
  let members: MemberRow[] = [];
  if (business && role && RIGHTS[role].includes("team")) {
    const people = await sql<{ id: string; role: string; email: string; name: string }>`
      select m.id, m.role, u.email, u.name
      from memberships m
      join "user" u on u.id = m.user_id
      where m.business_id = ${business.id}
      order by m.created_at
    `;
    const invites = await sql<{ id: string; email: string; role: string }>`
      select id, email, role from team_invites where business_id = ${business.id} order by created_at
    `;
    members = [
      ...people.filter((row) => isRole(row.role)).map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name,
        role: row.role as Role,
        pending: false,
      })),
      ...invites.filter((row) => isRole(row.role)).map((row) => ({
        id: row.id,
        email: row.email,
        name: "Invited",
        role: row.role as Role,
        pending: true,
      })),
    ];
  }
  let businesses: BusinessListRow[] = [];
  let seats: SeatRow[] = [];
  let invoices: AccountPayload["invoices"] = [];
  let paymentEvents: AccountPayload["paymentEvents"] = [];
  let webhookSecrets: AccountPayload["webhookSecrets"] = { stripe: "", skydo: "" };
  if (admin) {
    const rows = await sql<{
      id: string;
      name: string;
      plan: string;
      logo: string;
      owner_email: string | null;
      grant_sdk: boolean;
      grant_webhook: boolean;
      grant_test: boolean;
      kind: string;
      billing: string;
      onboarded: boolean;
      mau: number;
      billing_state: string;
    }>`
      select b.id, b.name, b.plan, b.logo, b.grant_sdk, b.grant_webhook, b.grant_test, b.kind, b.billing, b.onboarded, b.mau, b.billing_state,
        (select u.email from memberships m join "user" u on u.id = m.user_id
          where m.business_id = b.id and m.role = 'owner' limit 1) as owner_email
      from businesses b
      order by b.created_at desc
    `;
    businesses = rows.filter((row) => isPlan(row.plan)).map((row) => ({
      id: row.id,
      name: row.name,
      plan: row.plan as PlanId,
      ownerEmail: row.owner_email ?? "",
      logo: row.logo,
      grants: {
        sdk: Boolean(row.grant_sdk),
        webhook: Boolean(row.grant_webhook),
        test: Boolean(row.grant_test),
      },
      kind: row.kind === "enterprise" ? "enterprise" : "self",
      billing: row.billing === "pay_per_use" ? "pay_per_use" : "recorded",
      billingState: row.billing_state === "past_due" ? "past_due" : "active",
      onboarded: Boolean(row.onboarded),
      mau: row.mau,
    }));
    const waiting = await sql<{ id: string; business_name: string; email: string; plan: string; kind: string }>`
      select id, business_name, email, plan, kind from business_seats order by created_at desc
    `;
    seats = waiting.filter((row) => isPlan(row.plan)).map((row) => ({
      id: row.id,
      businessName: row.business_name,
      email: row.email,
      plan: row.plan as PlanId,
      waiting: true,
      kind: row.kind === "enterprise" ? "enterprise" : "self",
    }));
    const billed = await sql<{
      id: string;
      business_id: string;
      business_name: string;
      period_label: string;
      plan: string;
      mau: number;
      included_mau: number;
      base_paise: number;
      overage_paise: number;
      total_paise: number;
      status: string;
    }>`
      select i.id, i.business_id, b.name as business_name, i.period_label, i.plan, i.mau,
        i.included_mau, i.base_paise, i.overage_paise, i.total_paise, i.status
      from invoices i
      join businesses b on b.id = i.business_id
      order by i.created_at desc
    `;
    invoices = billed.filter((row) => isPlan(row.plan)).map((row) => ({
      id: row.id,
      businessId: row.business_id,
      businessName: row.business_name,
      periodLabel: row.period_label,
      plan: row.plan as PlanId,
      mau: row.mau,
      includedMau: row.included_mau,
      basePaise: row.base_paise,
      overagePaise: row.overage_paise,
      totalPaise: row.total_paise,
      status: row.status,
    }));
    await sql`
      insert into platform_settings (id, stripe_secret, skydo_secret)
      values ('default', ${DEMO_STRIPE_SECRET}, ${DEMO_SKYDO_SECRET})
      on conflict (id) do nothing
    `;
    const secrets = await sql<{ stripe_secret: string; skydo_secret: string }>`
      select stripe_secret, skydo_secret from platform_settings where id = 'default' limit 1
    `;
    webhookSecrets = {
      stripe: secrets[0]?.stripe_secret ?? DEMO_STRIPE_SECRET,
      skydo: secrets[0]?.skydo_secret ?? DEMO_SKYDO_SECRET,
    };
    const events = await sql<{
      id: string;
      provider: string;
      event_type: string;
      email: string;
      plan: string;
      amount_paise: number;
      status: string;
      detail: string;
    }>`
      select id, provider, event_type, email, plan, amount_paise, status, detail
      from payment_events
      order by created_at desc
      limit 20
    `;
    paymentEvents = events.map((row) => ({
      id: row.id,
      provider: row.provider,
      eventType: row.event_type,
      email: row.email,
      plan: row.plan,
      amountPaise: row.amount_paise,
      status: row.status,
      detail: row.detail,
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
    webhookSecrets,
  };
}

async function requireRight(sql: Sql, userId: string, right: string) {
  const member = await membership(sql, userId);
  if (!member || !isRole(member.role) || !RIGHTS[member.role].includes(right)) {
    throw new Error("You do not have this right.");
  }
  return { businessId: member.business_id, role: member.role };
}

async function requireAnyRight(sql: Sql, userId: string, rights: string[]) {
  const member = await membership(sql, userId);
  const role = member && isRole(member.role) ? member.role : null;
  if (!member || !role || !rights.some((right) => RIGHTS[role].includes(right))) {
    throw new Error("You do not have this right.");
  }
  return { businessId: member.business_id, role };
}

export const loadAccount = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<AccountPayload> => {
    const sql = await getSql();
    await ensureAdmin(sql, context.userId);
    const user = await userRow(sql, context.userId);
    await claimPending(sql, context.userId, user.email);
    return accountFor(sql, context.userId);
  });

export const completeRegistration = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { businessName: string; plan: PlanId }) => {
    if (!input || !isPlan(input.plan)) throw new Error("Choose Free, Basic, or Advance.");
    return { businessName: cleanName(input.businessName ?? "", "Business name"), plan: input.plan };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    await ensureAdmin(sql, context.userId);
    const user = await userRow(sql, context.userId);
    await claimPending(sql, context.userId, user.email);
    if (!(await membership(sql, context.userId))) {
      await createBusiness(sql, {
        name: data.businessName,
        plan: data.plan,
        ownerId: context.userId,
        createdBy: context.userId,
      });
    }
    return accountFor(sql, context.userId);
  });

export const sendPush = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; body: string; link: string; image: string; video: string; audience: Audience }) => {
    const title = (input?.title ?? "").trim();
    const body = (input?.body ?? "").trim();
    if (!title || title.length > 65) throw new Error("Title is required, up to 65 characters.");
    if (!body || body.length > 180) throw new Error("Message is required, up to 180 characters.");
    if (!isAudience(input?.audience)) throw new Error("Choose an audience.");
    return {
      title,
      body,
      link: cleanLink(input.link ?? ""),
      image: cleanImage(input.image ?? ""),
      video: cleanVideo(input.video ?? ""),
      audience: input.audience,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "send");
    const current = await slice(sql, member.businessId);
    if (!current) throw new Error("Workspace missing.");
    const blocked = sendsAllowed({
      plan: current.plan,
      mau: current.mau,
      overCap: current.overCap,
      kind: current.kind,
      onboarded: current.onboarded,
      video: Boolean(data.video),
      billingState: current.billingState,
    });
    if (blocked) throw new Error(blocked);
    const targeted = audienceSize(current.reach, data.audience);
    if (targeted <= 0) throw new Error("No reachable devices in that audience.");
    const stats = projectDelivery(targeted, saltFrom(data.title));
    const id = crypto.randomUUID();
    await sql`
      insert into campaigns (
        id, business_id, title, body, link, image_url, video_url, audience,
        targeted, delivered, failed, clicked, seed
      ) values (
        ${id}, ${current.id}, ${data.title}, ${data.body}, ${data.link}, ${data.image}, ${data.video},
        ${JSON.stringify(data.audience)}, ${stats.targeted}, ${stats.delivered}, ${stats.failed}, ${stats.clicked}, false
      )
    `;
    return accountFor(sql, context.userId);
  });

export const addDevice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; userId: string; platform: Platform; city: string; tag: Tag }) => {
    if (input?.platform !== "android" && input?.platform !== "ios") throw new Error("Choose Android or iOS.");
    if (!(TAGS as readonly string[]).includes(input?.tag)) throw new Error("Choose a tag.");
    return {
      name: cleanName(input.name ?? "", "Name"),
      userId: cleanName(input.userId ?? "", "User id"),
      platform: input.platform,
      city: cleanName(input.city || "Mumbai", "City"),
      tag: input.tag,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "devices_edit");
    const current = await slice(sql, member.businessId);
    if (!current) throw new Error("Workspace missing.");
    const reach = cloneReach(current.reach);
    reach[data.platform][data.tag] += 1;
    await sql`
      insert into subscribers (id, business_id, name, external_user_id, platform, city, tag, status, last_seen)
      values (${crypto.randomUUID()}, ${current.id}, ${data.name}, ${data.userId}, ${data.platform}, ${data.city}, ${data.tag}, 'active', ${new Date().toISOString()})
    `;
    await sql`
      update businesses set mau = ${current.mau + 1}, reach = ${JSON.stringify(reach)} where id = ${current.id}
    `;
    return accountFor(sql, context.userId);
  });

export const dropDevice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => {
    const value = (id ?? "").trim();
    if (!value) throw new Error("Missing device.");
    return value;
  })
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "devices_edit");
    const current = await slice(sql, member.businessId);
    if (!current) throw new Error("Workspace missing.");
    const device = current.subscribers.find((item) => item.id === id && item.status === "active");
    if (!device) throw new Error("That token is already dropped.");
    const reach = cloneReach(current.reach);
    reach[device.platform][device.tag] = Math.max(0, reach[device.platform][device.tag] - 1);
    await sql`
      update subscribers set status = 'unregistered'
      where id = ${id} and business_id = ${current.id}
    `;
    await sql`
      update businesses set mau = ${Math.max(0, current.mau - 1)}, reach = ${JSON.stringify(reach)} where id = ${current.id}
    `;
    return accountFor(sql, context.userId);
  });

export const setCapPreview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((on: boolean) => Boolean(on))
  .handler(async ({ context, data: on }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "plan");
    await sql`update businesses set over_cap = ${on} where id = ${member.businessId}`;
    return accountFor(sql, context.userId);
  });

export const resetWorkspace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "plan_edit");
    await sql`delete from subscribers where business_id = ${member.businessId}`;
    await sql`delete from campaigns where business_id = ${member.businessId}`;
    for (const device of seedSubscribers()) {
      await sql`
        insert into subscribers (id, business_id, name, external_user_id, platform, city, tag, status, last_seen)
        values (
          ${crypto.randomUUID()}, ${member.businessId}, ${device.name}, ${device.userId}, ${device.platform},
          ${device.city}, ${device.tag}, ${device.status}, ${device.lastSeen}
        )
      `;
    }
    for (const campaign of seedCampaigns()) {
      await sql`
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
    }
    await sql`
      update businesses set mau = 6420, reach = ${JSON.stringify(BASE_REACH)}, over_cap = false
      where id = ${member.businessId}
    `;
    return accountFor(sql, context.userId);
  });

export const updateBrand = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { name: string; logo: string }) => ({
    name: cleanName(input?.name ?? "", "Business name"),
    logo: cleanImage(input?.logo ?? ""),
  }))
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "brand");
    await sql`update businesses set name = ${data.name}, logo = ${data.logo} where id = ${member.businessId}`;
    return accountFor(sql, context.userId);
  });

export const setOwnPlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((plan: PlanId) => {
    if (!isPlan(plan)) throw new Error("Choose Free, Basic, or Advance.");
    return plan;
  })
  .handler(async ({ context, data: plan }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "plan_edit");
    await sql`update businesses set plan = ${plan}, over_cap = false where id = ${member.businessId}`;
    return accountFor(sql, context.userId);
  });

export const inviteMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { email: string; role: Role }) => {
    if (!isRole(input?.role)) throw new Error("Choose a role.");
    return { email: cleanEmail(input.email ?? ""), role: input.role };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "team");
    const workspace = await slice(sql, member.businessId);
    const blockedInvite = invitesAllowed(workspace?.plan ?? "free");
    if (blockedInvite) throw new Error(blockedInvite);
    const existing = await sql<{ id: string }>`
      select u.id from "user" u
      join memberships m on m.user_id = u.id
      where lower(u.email) = ${data.email}
      limit 1
    `;
    if (existing.length > 0) throw new Error("That person already belongs to a workspace.");
    const known = await sql<{ id: string }>`select id from "user" where lower(email) = ${data.email} limit 1`;
    if (known[0]) {
      await sql`
        insert into memberships (id, business_id, user_id, role)
        values (${crypto.randomUUID()}, ${member.businessId}, ${known[0].id}, ${data.role})
      `;
    } else {
      await sql`
        insert into team_invites (id, business_id, email, role)
        values (${crypto.randomUUID()}, ${member.businessId}, ${data.email}, ${data.role})
        on conflict (business_id, email) do update set role = ${data.role}
      `;
    }
    return accountFor(sql, context.userId);
  });

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; role: Role }) => {
    if (!isRole(input?.role)) throw new Error("Choose a role.");
    const id = (input?.id ?? "").trim();
    if (!id) throw new Error("Missing member.");
    return { id, role: input.role };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "team");
    const owners = await sql<{ id: string }>`
      select id from memberships where business_id = ${member.businessId} and role = 'owner'
    `;
    const target = await sql<{ id: string; role: string; user_id: string }>`
      select id, role, user_id from memberships where id = ${data.id} and business_id = ${member.businessId} limit 1
    `;
    if (!target[0]) throw new Error("Member not found.");
    if (target[0].role === "owner" && data.role !== "owner" && owners.length < 2) {
      throw new Error("Keep at least one owner.");
    }
    await sql`update memberships set role = ${data.role} where id = ${data.id} and business_id = ${member.businessId}`;
    return accountFor(sql, context.userId);
  });

export const removeMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => {
    const value = (id ?? "").trim();
    if (!value) throw new Error("Missing member.");
    return value;
  })
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "team");
    const invite = await sql<{ id: string }>`
      select id from team_invites where id = ${id} and business_id = ${member.businessId} limit 1
    `;
    if (invite[0]) {
      await sql`delete from team_invites where id = ${id} and business_id = ${member.businessId}`;
      return accountFor(sql, context.userId);
    }
    const target = await sql<{ role: string }>`
      select role from memberships where id = ${id} and business_id = ${member.businessId} limit 1
    `;
    if (!target[0]) throw new Error("Member not found.");
    if (target[0].role === "owner") {
      const owners = await sql<{ id: string }>`
        select id from memberships where business_id = ${member.businessId} and role = 'owner'
      `;
      if (owners.length < 2) throw new Error("Keep at least one owner.");
    }
    await sql`delete from memberships where id = ${id} and business_id = ${member.businessId}`;
    return accountFor(sql, context.userId);
  });

export const addBusinessUser = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { businessName: string; email: string; plan: PlanId }) => {
    if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
    return {
      businessName: cleanName(input.businessName ?? "", "Business name"),
      email: cleanEmail(input.email ?? ""),
      plan: input.plan,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await isAdmin(sql, context.userId))) throw new Error("System rights are required.");
    const taken = await sql<{ id: string }>`
      select m.id from memberships m
      join "user" u on u.id = m.user_id
      where lower(u.email) = ${data.email}
      limit 1
    `;
    if (taken.length > 0) throw new Error("That email already has a workspace.");
    const known = await sql<{ id: string }>`select id from "user" where lower(email) = ${data.email} limit 1`;
    if (known[0]) {
      await createBusiness(sql, {
        name: data.businessName,
        plan: data.plan,
        ownerId: known[0].id,
        createdBy: context.userId,
      });
    } else {
      await sql`
        insert into business_seats (id, business_name, email, plan, created_by)
        values (${crypto.randomUUID()}, ${data.businessName}, ${data.email}, ${data.plan}, ${context.userId})
        on conflict (email) do update set business_name = ${data.businessName}, plan = ${data.plan}
      `;
    }
    return accountFor(sql, context.userId);
  });

export const setBusinessPlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; plan: PlanId }) => {
    if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
    const id = (input?.id ?? "").trim();
    if (!id) throw new Error("Missing business.");
    return { id, plan: input.plan };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await isAdmin(sql, context.userId))) throw new Error("System rights are required.");
    await sql`update businesses set plan = ${data.plan} where id = ${data.id}`;
    return accountFor(sql, context.userId);
  });

const TARGETS = ["android", "ios", "web"] as const;

function isTarget(value: string): value is ConnectTarget {
  return (TARGETS as readonly string[]).includes(value);
}

function appKey() {
  const raw = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
  return `nock_${raw.slice(0, 24)}`;
}

export const setBusinessGrants = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; sdk: boolean; webhook: boolean; test: boolean }) => {
    const id = (input?.id ?? "").trim();
    if (!id) throw new Error("Missing business.");
    return { id, sdk: Boolean(input.sdk), webhook: Boolean(input.webhook), test: Boolean(input.test) };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await isAdmin(sql, context.userId))) throw new Error("System rights are required.");
    await sql`
      update businesses set grant_sdk = ${data.sdk}, grant_webhook = ${data.webhook}, grant_test = ${data.test}
      where id = ${data.id}
    `;
    return accountFor(sql, context.userId);
  });

export const addConnection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: ConnectKind; target: ConnectTarget; name: string; endpoint: string }) => {
    if (input?.kind !== "sdk" && input?.kind !== "webhook") throw new Error("Choose an SDK or a webhook.");
    if (!isTarget(input?.target ?? "")) throw new Error("Choose Android, iOS, or a website.");
    const name = (input.name ?? "").trim().replace(/\s+/g, " ");
    if (name.length < 2 || name.length > 60) throw new Error("Name the app in 2–60 characters.");
    const endpoint = (input.endpoint ?? "").trim();
    if (input.kind === "webhook") {
      let url: URL;
      try {
        url = new URL(endpoint);
      } catch {
        throw new Error("Webhook must be an https link.");
      }
      if (url.protocol !== "https:" || url.toString().length > 500) throw new Error("Webhook must be an https link.");
      return { kind: input.kind, target: input.target, name, endpoint: url.toString() };
    }
    if (endpoint && (endpoint.length > 160 || /^(javascript|data):/i.test(endpoint))) {
      throw new Error("That app id is not allowed.");
    }
    return { kind: input.kind, target: input.target, name, endpoint };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "connect");
    const current = await slice(sql, member.businessId);
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

export const removeConnection = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => {
    const value = (id ?? "").trim();
    if (!value) throw new Error("Missing connection.");
    return value;
  })
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "connect");
    await sql`delete from connections where id = ${id} and business_id = ${member.businessId}`;
    return accountFor(sql, context.userId);
  });

export const runTest = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { connectionId: string; title: string; body: string; link: string }) => {
    const connectionId = (input?.connectionId ?? "").trim();
    const title = (input?.title ?? "").trim();
    const body = (input?.body ?? "").trim();
    const link = (input?.link ?? "").trim();
    if (!connectionId) throw new Error("Choose a connection.");
    if (!title || title.length > 65) throw new Error("Title is required, up to 65 characters.");
    if (!body || body.length > 180) throw new Error("Message is required, up to 180 characters.");
    if (link.length > 500 || /^(javascript|data|vbscript):/i.test(link)) throw new Error("That deep link is not allowed.");
    return { connectionId, title, body, link };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "test");
    const current = await slice(sql, member.businessId);
    if (!current) throw new Error("Workspace missing.");
    if (!current.grants.test) throw new Error("The system admin has not granted test runs.");
    const connection = current.connections.find((item) => item.id === data.connectionId);
    if (!connection) throw new Error("That connection is not on this workspace.");
    const targetLabel = connection.target === "android" ? "Android" : connection.target === "ios" ? "iOS" : "Website";
    const audience =
      connection.target === "web"
        ? { kind: "all" as const }
        : { kind: "platform" as const, platform: connection.target };
    await sql`
      insert into campaigns (
        id, business_id, title, body, link, image_url, video_url, audience,
        targeted, delivered, failed, clicked, seed, is_test, test_label
      ) values (
        ${crypto.randomUUID()}, ${current.id}, ${data.title}, ${data.body}, ${data.link}, '', '',
        ${JSON.stringify(audience)}, 1, 1, 0, 0, false, true, ${`${targetLabel} · ${connection.name}`}
      )
    `;
    return accountFor(sql, context.userId);
  });

export const registerEnterprise = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { businessName: string; contact: string; email: string; plan: PlanId }) => {
    if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
    return {
      businessName: cleanName(input.businessName ?? "", "Business name"),
      contact: cleanName(input.contact ?? "", "Contact name"),
      email: cleanEmail(input.email ?? ""),
      plan: input.plan,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (!(await isAdmin(sql, context.userId))) throw new Error("System rights are required.");
    const taken = await sql<{ id: string }>`
      select m.id from memberships m
      join "user" u on u.id = m.user_id
      where lower(u.email) = ${data.email}
      limit 1
    `;
    if (taken.length > 0) throw new Error("That email already has a workspace.");
    const known = await sql<{ id: string }>`select id from "user" where lower(email) = ${data.email} limit 1`;
    if (known[0]) {
      await createBusiness(sql, {
        name: data.businessName,
        plan: data.plan,
        ownerId: known[0].id,
        createdBy: context.userId,
        kind: "enterprise",
        billing: "pay_per_use",
        onboarded: false,
      });
    } else {
      await sql`
        insert into business_seats (id, business_name, email, plan, created_by, kind)
        values (${crypto.randomUUID()}, ${data.businessName}, ${data.email}, ${data.plan}, ${context.userId}, 'enterprise')
        on conflict (email) do update set business_name = ${data.businessName}, plan = ${data.plan}, kind = 'enterprise'
      `;
    }
    return accountFor(sql, context.userId);
  });

export const acceptEnterprise = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const member = await requireRight(sql, context.userId, "plan_edit");
    const current = await slice(sql, member.businessId);
    if (!current || current.kind !== "enterprise") throw new Error("This workspace is not an enterprise.");
    await sql`update businesses set onboarded = true where id = ${current.id}`;
    return accountFor(sql, context.userId);
  });

export const issueInvoice = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: string) => {
    const value = (id ?? "").trim();
    if (!value) throw new Error("Missing business.");
    return value;
  })
  .handler(async ({ context, data: id }) => {
    const sql = await getSql();
    if (!(await isAdmin(sql, context.userId))) throw new Error("System rights are required.");
    const current = await slice(sql, id);
    if (!current || current.kind !== "enterprise") throw new Error("Only an onboarded enterprise can be billed.");
    if (!current.onboarded) throw new Error("The enterprise has not accepted pay-per-use yet.");
    const quote = quoteUsage(current.plan, current.mau);
    const label = periodLabel();
    const existing = await sql<{ id: string }>`
      select id from invoices where business_id = ${current.id} and period_label = ${label} limit 1
    `;
    if (existing[0]) throw new Error(`${label} is already billed.`);
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

export const connectToken = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { platform: Platform; token: string; name: string }) => {
    if (input?.platform !== "android" && input?.platform !== "ios") throw new Error("Choose Android or iOS.");
    const problem = checkPushToken(input.platform, input?.token ?? "");
    if (problem) throw new Error(problem);
    const token = input.token.trim();
    const fallback = input.platform === "android" ? "Android token" : "iOS token";
    const name = (input.name ?? "").trim() ? cleanName(input.name, "Device name") : fallback;
    return { platform: input.platform, token, name };
  })
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const member = await requireAnyRight(sql, context.userId, ["connect", "devices_edit"]);
    const current = await slice(sql, member.businessId);
    if (!current) throw new Error("Workspace missing.");
    if (current.kind === "enterprise" && !current.onboarded) throw new Error("Finish enterprise onboarding before connecting a token.");
    const duplicate = current.subscribers.some((item) => item.status === "active" && item.pushToken === data.token);
    if (duplicate) throw new Error("That messaging token is already connected.");
    const reach = cloneReach(current.reach);
    reach[data.platform].orders += 1;
    const userId = `tok_${data.token.slice(-8).toLowerCase()}`;
    await sql`
      insert into subscribers (id, business_id, name, external_user_id, platform, city, tag, status, last_seen, push_token)
      values (
        ${crypto.randomUUID()}, ${current.id}, ${data.name}, ${userId}, ${data.platform},
        'Connected', 'orders', 'active', ${new Date().toISOString()}, ${data.token}
      )
    `;
    await sql`
      update businesses set mau = ${current.mau + 1}, reach = ${JSON.stringify(reach)} where id = ${current.id}
    `;
    return accountFor(sql, context.userId);
  });


