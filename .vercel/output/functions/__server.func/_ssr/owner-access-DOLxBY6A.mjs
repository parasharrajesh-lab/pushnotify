//#region node_modules/.nitro/vite/services/ssr/assets/owner-access-DOLxBY6A.js
var ROLES = [
	"owner",
	"developer",
	"marketer",
	"analyst",
	"viewer"
];
var ROLE_LABEL = {
	owner: "Owner",
	developer: "Developer",
	marketer: "Marketer",
	analyst: "Analyst",
	viewer: "Viewer"
};
var RIGHTS = {
	owner: [
		"send",
		"devices",
		"devices_edit",
		"activity",
		"plan",
		"plan_edit",
		"team",
		"brand",
		"connect",
		"test"
	],
	developer: [
		"connect",
		"test",
		"activity",
		"devices"
	],
	marketer: [
		"send",
		"devices",
		"devices_edit",
		"activity"
	],
	analyst: [
		"devices",
		"activity",
		"plan"
	],
	viewer: ["activity"]
};
var RIGHT_ROWS = [
	{
		id: "send",
		label: "Send push, image, video, deep link"
	},
	{
		id: "devices",
		label: "View devices"
	},
	{
		id: "devices_edit",
		label: "Register and drop tokens"
	},
	{
		id: "activity",
		label: "Delivery log"
	},
	{
		id: "plan",
		label: "MAU and subscription"
	},
	{
		id: "plan_edit",
		label: "Change plan"
	},
	{
		id: "team",
		label: "Invite the team and set roles"
	},
	{
		id: "brand",
		label: "Update name and logo"
	},
	{
		id: "connect",
		label: "Add an SDK or webhook"
	},
	{
		id: "test",
		label: "Run a test push"
	}
];
function isRole(value) {
	return ROLES.includes(value);
}
function isPlan(value) {
	return value === "free" || value === "basic" || value === "advance";
}
function planLabel(plan) {
	if (plan === "advance") return "Advance";
	if (plan === "free") return "Free";
	return "Basic";
}
function nextPlan(plan) {
	if (plan === "free") return "basic";
	if (plan === "basic") return "advance";
	return "free";
}
var EMPTY_GRANTS = {
	sdk: false,
	webhook: false,
	test: false
};
var PLAN_RATES = {
	free: {
		name: "Free",
		basePaise: 0,
		includedMau: 500,
		overagePaise: 0
	},
	basic: {
		name: "Basic",
		basePaise: 499900,
		includedMau: 1e4,
		overagePaise: 80
	},
	advance: {
		name: "Advance",
		basePaise: 2499900,
		includedMau: 1e5,
		overagePaise: 40
	}
};
function quoteUsage(plan, mau) {
	const rate = PLAN_RATES[plan];
	const used = Math.max(0, Math.floor(mau));
	const extra = plan === "free" ? 0 : Math.max(0, used - rate.includedMau);
	const overagePaise = extra * rate.overagePaise;
	return {
		plan,
		mau: used,
		includedMau: rate.includedMau,
		extra,
		basePaise: rate.basePaise,
		overagePaise,
		totalPaise: rate.basePaise + overagePaise
	};
}
function formatInr(paise) {
	const rupees = paise / 100;
	const whole = Number.isInteger(rupees);
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: whole ? 0 : 2,
		minimumFractionDigits: whole ? 0 : 2
	}).format(rupees);
}
function periodLabel(date = /* @__PURE__ */ new Date()) {
	return date.toLocaleDateString("en-IN", {
		month: "short",
		year: "numeric"
	});
}
function checkPushToken(platform, token) {
	const value = token.trim();
	if (platform === "ios") {
		if (!/^[0-9a-fA-F]{64}$/.test(value)) return "An iOS token is 64 hexadecimal characters.";
		return null;
	}
	if (value.length < 80 || value.length > 4096 || !/^[A-Za-z0-9_:\-]+$/.test(value) || !value.includes(":")) return "An Android token is an FCM registration string with a colon.";
	return null;
}
function invitesAllowed(plan) {
	if (plan === "free") return "Team invites start on Basic.";
	return null;
}
function sendsAllowed(input) {
	if (input.kind === "enterprise" && !input.onboarded) return "Finish enterprise onboarding before sending.";
	if (input.billingState === "past_due") return "Payment failed. Sends stay paused until Stripe or Skydo settles.";
	if (input.video && input.plan !== "advance") return "Video is included on Advance.";
	const cap = PLAN_RATES[input.plan].includedMau;
	if (input.overCap || input.mau >= cap) return "This plan's MAU cap is full. Sends are paused.";
	return null;
}
function runLogicChecks() {
	const basicFull = quoteUsage("basic", 1e4);
	const basicOver = quoteUsage("basic", 10001);
	const advanceFull = quoteUsage("advance", 1e5);
	const advanceOver = quoteUsage("advance", 100500);
	const ios = "ab".repeat(32);
	const android = `cDemo:APA91b${"A".repeat(80)}`;
	const checks = [
		{
			name: "Basic inside the cap",
			pass: basicFull.extra === 0 && basicFull.totalPaise === PLAN_RATES.basic.basePaise,
			detail: "10,000 MAU bills only the ₹4,999 base."
		},
		{
			name: "Basic pay per use",
			pass: basicOver.extra === 1 && basicOver.overagePaise === 80,
			detail: "Each MAU past 10,000 adds ₹0.80."
		},
		{
			name: "Advance inside the cap",
			pass: advanceFull.extra === 0 && advanceFull.totalPaise === PLAN_RATES.advance.basePaise,
			detail: "100,000 MAU bills only the ₹24,999 base."
		},
		{
			name: "Advance pay per use",
			pass: advanceOver.extra === 500 && advanceOver.overagePaise === 2e4,
			detail: "500 extra MAU on Advance is ₹200."
		},
		{
			name: "Enterprise uses the plan rate",
			pass: quoteUsage("advance", 100500).totalPaise === PLAN_RATES.advance.basePaise + 2e4,
			detail: "There is no third price. Enterprise follows Basic or Advance."
		},
		{
			name: "iOS token",
			pass: checkPushToken("ios", ios) === null && checkPushToken("ios", ios.slice(1)) !== null,
			detail: "APNs tokens are 64 hex characters."
		},
		{
			name: "Android token",
			pass: checkPushToken("android", android) === null && checkPushToken("android", "short") !== null,
			detail: "FCM tokens are long and include a colon."
		},
		{
			name: "Enterprise must onboard",
			pass: sendsAllowed({
				plan: "basic",
				mau: 10,
				overCap: false,
				kind: "enterprise",
				onboarded: false,
				video: false
			}) !== null,
			detail: "Sends stay closed until the enterprise accepts pay-per-use."
		},
		{
			name: "Cap pauses sends",
			pass: sendsAllowed({
				plan: "basic",
				mau: 1e4,
				overCap: false,
				kind: "self",
				onboarded: true,
				video: false
			}) !== null,
			detail: "A full MAU cap blocks the next broadcast."
		},
		{
			name: "Video is Advance only",
			pass: sendsAllowed({
				plan: "basic",
				mau: 10,
				overCap: false,
				kind: "self",
				onboarded: true,
				video: true
			}) !== null && sendsAllowed({
				plan: "advance",
				mau: 10,
				overCap: false,
				kind: "self",
				onboarded: true,
				video: true
			}) === null,
			detail: "Basic rejects a video payload."
		},
		{
			name: "Owner and developer rights",
			pass: RIGHTS.owner.includes("plan_edit") && RIGHTS.developer.includes("connect") && !RIGHTS.developer.includes("team"),
			detail: "The owner manages the plan. A developer can connect, not invite."
		},
		{
			name: "Viewer cannot send",
			pass: !RIGHTS.viewer.includes("send") && RIGHTS.marketer.includes("send"),
			detail: "A viewer reads activity. A marketer can send."
		},
		{
			name: "Free cap",
			pass: sendsAllowed({
				plan: "free",
				mau: 120,
				overCap: false,
				kind: "self",
				onboarded: true,
				video: false
			}) === null && sendsAllowed({
				plan: "free",
				mau: 500,
				overCap: false,
				kind: "self",
				onboarded: true,
				video: false
			}) !== null,
			detail: "Free includes 500 MAU. The next send pauses at the cap. There is no overage charge."
		},
		{
			name: "Free price",
			pass: quoteUsage("free", 500).totalPaise === 0 && quoteUsage("free", 800).overagePaise === 0,
			detail: "Free stays at ₹0 even past the cap."
		},
		{
			name: "Free cannot send video or invite",
			pass: sendsAllowed({
				plan: "free",
				mau: 10,
				overCap: false,
				kind: "self",
				onboarded: true,
				video: true
			}) !== null && invitesAllowed("free") !== null && invitesAllowed("basic") === null,
			detail: "Video stays on Advance. Team invites start on Basic."
		},
		{
			name: "Failed payment pauses sends",
			pass: sendsAllowed({
				plan: "basic",
				mau: 10,
				overCap: false,
				kind: "self",
				onboarded: true,
				video: false,
				billingState: "past_due"
			}) !== null,
			detail: "A failed Stripe or Skydo payment pauses sends until the next settled payment."
		}
	];
	if ([
		"owner",
		"developer",
		"marketer",
		"analyst",
		"viewer"
	].some((role) => RIGHTS[role].includes("send") && role === "viewer")) checks.push({
		name: "Viewer send leak",
		pass: false,
		detail: "Viewer gained send."
	});
	return checks;
}
var _0001_auth_default = "-- Better Auth schema (identity + sessions for \"Sign in with Grok\").\n--\n-- Generated by the Better Auth CLI for its Postgres adapter — DO NOT EDIT by\n-- hand. `@/lib/auth/server` runs Better Auth against these tables when\n-- DATABASE_URL is set. The columns are camelCase and MUST stay double-quoted so\n-- Postgres preserves the case Better Auth queries by.\n--\n-- Migrations in this folder are the single source of truth for your schema. They\n-- apply to Neon during the Vercel build (`npm run build`) and to the local\n-- PGLite fallback automatically on startup, so dev matches production. Applied\n-- files are recorded by name in `_migrations` and NEVER run again.\n--\n-- Put YOUR app's schema in NEW ordered files (0002_*.sql, 0003_*.sql, …), never\n-- in this one. For app tables, prefer snake_case and give per-user tables a\n-- `user_id TEXT NOT NULL` column (TEXT, not UUID — the preview dev user id is\n-- the string 'dev-user'), then scope every query to the authenticated user\n-- server-side (see the `neon` + `auth` skills and src/lib/auth/verify.server.ts).\n\ncreate table if not exists \"user\" (\n  \"id\" text not null primary key,\n  \"name\" text not null,\n  \"email\" text not null unique,\n  \"emailVerified\" boolean not null,\n  \"image\" text,\n  \"createdAt\" timestamptz default CURRENT_TIMESTAMP not null,\n  \"updatedAt\" timestamptz default CURRENT_TIMESTAMP not null\n);\n\ncreate table if not exists \"session\" (\n  \"id\" text not null primary key,\n  \"expiresAt\" timestamptz not null,\n  \"token\" text not null unique,\n  \"createdAt\" timestamptz default CURRENT_TIMESTAMP not null,\n  \"updatedAt\" timestamptz not null,\n  \"ipAddress\" text,\n  \"userAgent\" text,\n  \"userId\" text not null references \"user\" (\"id\") on delete cascade\n);\n\ncreate table if not exists \"account\" (\n  \"id\" text not null primary key,\n  \"accountId\" text not null,\n  \"providerId\" text not null,\n  \"userId\" text not null references \"user\" (\"id\") on delete cascade,\n  \"accessToken\" text,\n  \"refreshToken\" text,\n  \"idToken\" text,\n  \"accessTokenExpiresAt\" timestamptz,\n  \"refreshTokenExpiresAt\" timestamptz,\n  \"scope\" text,\n  \"password\" text,\n  \"createdAt\" timestamptz default CURRENT_TIMESTAMP not null,\n  \"updatedAt\" timestamptz not null\n);\n\ncreate table if not exists \"verification\" (\n  \"id\" text not null primary key,\n  \"identifier\" text not null,\n  \"value\" text not null,\n  \"expiresAt\" timestamptz not null,\n  \"createdAt\" timestamptz default CURRENT_TIMESTAMP not null,\n  \"updatedAt\" timestamptz default CURRENT_TIMESTAMP not null\n);\n\ncreate index if not exists \"session_userId_idx\" on \"session\" (\"userId\");\ncreate index if not exists \"account_userId_idx\" on \"account\" (\"userId\");\ncreate index if not exists \"verification_identifier_idx\" on \"verification\" (\"identifier\");\n";
var _0002_business_default = "create table if not exists businesses (\n  id text primary key,\n  name text not null,\n  logo text not null default '',\n  plan text not null,\n  mau integer not null default 6420,\n  reach text not null,\n  over_cap boolean not null default false,\n  created_by text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists memberships (\n  id text primary key,\n  business_id text not null references businesses (id) on delete cascade,\n  user_id text not null unique,\n  role text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists platform_admins (\n  user_id text primary key\n);\n\ncreate table if not exists team_invites (\n  id text primary key,\n  business_id text not null references businesses (id) on delete cascade,\n  email text not null,\n  role text not null,\n  created_at timestamptz not null default now(),\n  unique (business_id, email)\n);\n\ncreate table if not exists business_seats (\n  id text primary key,\n  business_name text not null,\n  email text not null unique,\n  plan text not null,\n  created_by text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists campaigns (\n  id text primary key,\n  business_id text not null references businesses (id) on delete cascade,\n  title text not null,\n  body text not null,\n  link text not null default '',\n  image_url text not null default '',\n  video_url text not null default '',\n  audience text not null,\n  targeted integer not null,\n  delivered integer not null,\n  failed integer not null,\n  clicked integer not null,\n  seed boolean not null default false,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists subscribers (\n  id text primary key,\n  business_id text not null references businesses (id) on delete cascade,\n  name text not null,\n  external_user_id text not null,\n  platform text not null,\n  city text not null,\n  tag text not null,\n  status text not null,\n  last_seen timestamptz not null default now()\n);\n\ncreate index if not exists campaigns_business_idx on campaigns (business_id);\ncreate index if not exists subscribers_business_idx on subscribers (business_id);\ncreate index if not exists memberships_business_idx on memberships (business_id);\n";
var _0003_connect_default = "alter table businesses add column if not exists grant_sdk boolean not null default false;\nalter table businesses add column if not exists grant_webhook boolean not null default false;\nalter table businesses add column if not exists grant_test boolean not null default false;\n\nalter table campaigns add column if not exists is_test boolean not null default false;\nalter table campaigns add column if not exists test_label text not null default '';\n\ncreate table if not exists connections (\n  id text primary key,\n  business_id text not null references businesses (id) on delete cascade,\n  kind text not null,\n  target text not null,\n  name text not null,\n  endpoint text not null default '',\n  app_key text not null default '',\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists connections_business_idx on connections (business_id);\n";
var _0004_billing_default = "alter table businesses add column if not exists kind text not null default 'self';\nalter table businesses add column if not exists billing text not null default 'recorded';\nalter table businesses add column if not exists onboarded boolean not null default true;\n\nalter table business_seats add column if not exists kind text not null default 'self';\n\nalter table subscribers add column if not exists push_token text not null default '';\n\ncreate table if not exists invoices (\n  id text primary key,\n  business_id text not null references businesses (id) on delete cascade,\n  period_label text not null,\n  plan text not null,\n  mau integer not null,\n  included_mau integer not null,\n  base_paise integer not null,\n  overage_paise integer not null,\n  total_paise integer not null,\n  status text not null default 'issued',\n  created_at timestamptz not null default now(),\n  unique (business_id, period_label)\n);\n\ncreate index if not exists invoices_business_idx on invoices (business_id);\n";
var _0005_payments_default = "alter table businesses add column if not exists billing_state text not null default 'active';\n\ncreate table if not exists platform_settings (\n  id text primary key,\n  stripe_secret text not null,\n  skydo_secret text not null\n);\n\ncreate table if not exists payment_events (\n  id text primary key,\n  provider text not null,\n  event_id text not null,\n  event_type text not null,\n  email text not null default '',\n  plan text not null default '',\n  amount_paise integer not null default 0,\n  status text not null,\n  detail text not null default '',\n  created_at timestamptz not null default now(),\n  unique (provider, event_id)\n);\n";
var _0006_password_reset_default = "create table if not exists password_resets (\n  id text primary key,\n  user_id text not null,\n  email text not null,\n  code_hash text not null,\n  attempts integer not null default 0,\n  expires_at timestamptz not null,\n  used_at timestamptz,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists password_resets_email_idx on password_resets (email);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.n);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0001_auth.sql": _0001_auth_default,
			"/migrations/0002_business.sql": _0002_business_default,
			"/migrations/0003_connect.sql": _0003_connect_default,
			"/migrations/0004_billing.sql": _0004_billing_default,
			"/migrations/0005_payments.sql": _0005_payments_default,
			"/migrations/0006_password_reset.sql": _0006_password_reset_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* The shared PGLite instance (preview only), with `migrations/*.sql` applied.
* Lets Better Auth persist to the SAME embedded DB as app data in preview (via a
* Kysely dialect). Throws when `DATABASE_URL` is set (that path uses Neon).
*/
async function getPglite() {
	if (dbSource !== "pglite") throw new Error("getPglite() is only available on the PGLite fallback (no DATABASE_URL)");
	await getSql();
	const pg = await globalRef.__pgliteInstance__;
	if (!pg) throw new Error("PGLite instance failed to initialize");
	return pg;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var DEMO_STRIPE_SECRET = "whsec_nock_demo_stripe";
var DEMO_SKYDO_SECRET = "skydo_nock_demo";
//#endregion
export { sendsAllowed as S, nextPlan as _, RIGHTS as a, quoteUsage as b, ROLE_LABEL as c, formatInr as d, getPglite as f, isRole as g, isPlan as h, PLAN_RATES as i, checkPushToken as l, invitesAllowed as m, DEMO_STRIPE_SECRET as n, RIGHT_ROWS as o, getSql as p, EMPTY_GRANTS as r, ROLES as s, DEMO_SKYDO_SECRET as t, ensureDbReady as u, periodLabel as v, runLogicChecks as x, planLabel as y };
