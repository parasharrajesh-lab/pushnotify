import { o as __toESM } from "../_runtime.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { B as require_react, _ as createRootRoute, b as require_jsx_runtime, d as HeadContent, g as createFileRoute, h as lazyRouteComponent, m as Outlet, p as createRouter, u as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { h as isPlan, n as DEMO_STRIPE_SECRET, p as getSql, t as DEMO_SKYDO_SECRET, v as periodLabel } from "./owner-access-DOLxBY6A.mjs";
import { L as string, N as number, P as object, R as union, j as literal } from "../_libs/@better-auth/core+[...].mjs";
import { n as auth, o as hashPassword$1 } from "./server-CCpuExkQ.mjs";
import { n as seedSystemOwner } from "./owner-seed.server-CljaPCh_.mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { createHmac, randomBytes } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DFJDZ9AM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-BwdyMHM4.css";
var APP_NAME = "Nock";
var Route$10 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "Basic mobile push for Android and iOS. Send, see devices, and watch the MAU cap."
			},
			{
				name: "theme-color",
				content: "#f3f2ee"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Newsreader:opsz,wght@6..72,500;6..72,600&display=swap"
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$2 = () => import("./routes-DqNsVXXJ.mjs");
var Route$9 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./admin-BH7omRHW.mjs");
var Route$8 = createFileRoute("/admin")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./login-pntpA6H0.mjs");
var Route$7 = createFileRoute("/login")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var Route$6 = createFileRoute("/api/owner-ready")({ server: { handlers: { POST: async () => {
	await seedSystemOwner();
	return Response.json({ ready: true });
} } } });
var Route$5 = createFileRoute("/api/auth/$")({ server: { handlers: {
	GET: ({ request }) => auth.handler(request),
	POST: ({ request }) => auth.handler(request)
} } });
function normalizeAccountEmail(value) {
	return value.trim().toLowerCase();
}
function accountEmailError(value) {
	const email = normalizeAccountEmail(value);
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) return "Enter a valid email.";
	return null;
}
function newPasswordError(password, confirm) {
	if (password.length < 8) return "Use at least 8 characters.";
	if (password.length > 128) return "Use at most 128 characters.";
	if (password !== confirm) return "Those passwords do not match.";
	return null;
}
async function hashResetCode(email, code) {
	const data = new TextEncoder().encode(`${normalizeAccountEmail(email)}:${code.trim().toUpperCase()}`);
	const buf = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(buf), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function hashesMatch(left, right) {
	if (left.length !== right.length) return false;
	let diff = 0;
	for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
	return diff === 0;
}
function isAccountState(value) {
	return value === "missing" || value === "owner" || value === "password" || value === "social";
}
/** Null means this email can set a new password. */
function resetStartMessage(state) {
	if (state === "missing") return "No account uses that email. Register a workspace.";
	if (state === "owner") return "The system owner password is not changed on this page.";
	return null;
}
function signInFailureMessage(state) {
	if (state === "missing") return "No account uses that email. Register a workspace.";
	if (state === "social") return "This email is registered with Google or X. Set a password with Forgot password, or continue with that provider.";
	if (state === "owner") return "That password does not match. The system owner password is not changed on this page.";
	return "That password does not match. Use Forgot password to set a new one.";
}
function signUpConflictMessage(state) {
	if (state === "owner") return "That email is the system owner. Use System owner sign in.";
	if (state === "social") return "That email is already registered with Google or X. Set a password with Forgot password, or continue with that provider.";
	if (state === "missing") return "No account uses that email. Register a workspace.";
	return "That email is already registered. The password does not match. Use Forgot password to set a new one.";
}
function isExistingAccountError(message) {
	return /already exists/i.test(message);
}
var ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var TTL_MS = 12e5;
function resetCookie(code, maxAge) {
	return `nock_reset=${code ? encodeURIComponent(code) : ""}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}
function readCookie(request) {
	const raw = request.headers.get("cookie") ?? "";
	for (const part of raw.split(";")) {
		const [key, ...rest] = part.trim().split("=");
		if (key === "nock_reset") return decodeURIComponent(rest.join("=")).trim().toUpperCase();
	}
	return "";
}
function json(body, status = 200, setCookie) {
	const headers = new Headers();
	if (setCookie) headers.set("set-cookie", setCookie);
	return Response.json(body, {
		status,
		headers
	});
}
function sameOrigin(request) {
	const site = request.headers.get("sec-fetch-site");
	return !site || site === "same-origin" || site === "none";
}
function newCode() {
	const bytes = randomBytes(8);
	let code = "";
	for (let i = 0; i < bytes.length; i += 1) code += ALPHABET[bytes[i] % 32];
	return code;
}
async function classify(email) {
	const sql = await getSql();
	const user = (await sql`select id from "user" where lower(email) = ${email} limit 1`)[0];
	if (!user) return {
		state: "missing",
		userId: null
	};
	if ((await sql`select user_id from platform_admins where user_id = ${user.id} limit 1`)[0]) return {
		state: "owner",
		userId: user.id
	};
	if ((await sql`
    select password from "account"
    where "userId" = ${user.id} and "providerId" = 'credential'
    limit 1
  `)[0]?.password) return {
		state: "password",
		userId: user.id
	};
	return {
		state: "social",
		userId: user.id
	};
}
async function handlePasswordReset(request) {
	if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
	const body = await request.json().catch(() => null);
	if (!body || body.action !== "start" && body.action !== "finish" && body.action !== "status") return json({ error: "Unknown request." }, 400);
	const emailError = accountEmailError(typeof body.email === "string" ? body.email : "");
	if (emailError) return json({ error: emailError }, 400);
	const email = normalizeAccountEmail(String(body.email));
	if (body.action === "status") return json({ state: (await classify(email)).state });
	if (body.action === "start") return startReset(email);
	return finishReset(request, email, body);
}
async function startReset(email) {
	const sql = await getSql();
	if (((await sql`
    select count(*)::int as n from password_resets
    where email = ${email} and created_at > now() - interval '15 minutes'
  `)[0]?.n ?? 0) >= 5) return json({ error: "Wait a few minutes before requesting another reset." }, 429);
	const found = await classify(email);
	if (!isAccountState(found.state) || found.state === "missing" || found.state === "owner" || !found.userId) return json({
		issued: false,
		reason: found.state === "owner" ? "owner" : "missing"
	}, 200, resetCookie("", 0));
	const code = newCode();
	const codeHash = await hashResetCode(email, code);
	const id = randomBytes(16).toString("hex");
	const expires = new Date(Date.now() + TTL_MS).toISOString();
	await sql`update password_resets set used_at = now() where email = ${email} and used_at is null`;
	await sql`
    insert into password_resets (id, user_id, email, code_hash, expires_at)
    values (${id}, ${found.userId}, ${email}, ${codeHash}, ${expires})
  `;
	return json({
		issued: true,
		reason: found.state
	}, 200, resetCookie(code, 1200));
}
async function finishReset(request, email, body) {
	const password = typeof body.password === "string" ? body.password : "";
	const passwordError = newPasswordError(password, typeof body.confirm === "string" ? body.confirm : "");
	if (passwordError) return json({ error: passwordError }, 400);
	const code = readCookie(request);
	if (!/^[A-Z2-9]{8}$/.test(code)) return json({ error: "Request a new reset, then set the password." }, 400);
	const sql = await getSql();
	const row = (await sql`
    select id, user_id, code_hash, attempts, expires_at
    from password_resets
    where email = ${email} and used_at is null
    order by created_at desc
    limit 1
  `)[0];
	if (!row) return json({ error: "Request a new reset, then set the password." }, 400, resetCookie("", 0));
	const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
	if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
		await sql`update password_resets set used_at = now() where id = ${row.id}`;
		return json({ error: "That reset expired. Request a new one." }, 400, resetCookie("", 0));
	}
	if (!hashesMatch(row.code_hash, await hashResetCode(email, code))) {
		const attempts = row.attempts + 1;
		if (attempts >= 5) await sql`update password_resets set attempts = ${attempts}, used_at = now() where id = ${row.id}`;
		else await sql`update password_resets set attempts = ${attempts} where id = ${row.id}`;
		return json({ error: "That reset is not valid. Request a new one." }, 400);
	}
	const found = await classify(email);
	if (found.state === "owner" || found.state === "missing" || found.userId !== row.user_id) return json({ error: "That reset is not valid. Request a new one." }, 400, resetCookie("", 0));
	const hashed = await hashPassword$1(password);
	if (!(await sql`
    update "account"
    set password = ${hashed}, "updatedAt" = now()
    where "userId" = ${row.user_id} and "providerId" = 'credential'
    returning id
  `)[0]) await sql`
      insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values (${randomBytes(16).toString("hex")}, ${row.user_id}, 'credential', ${row.user_id}, ${hashed}, now(), now())
    `;
	await sql`update password_resets set used_at = now() where id = ${row.id}`;
	await sql`delete from "session" where "userId" = ${row.user_id}`;
	return json({ saved: true }, 200, resetCookie("", 0));
}
var Route$4 = createFileRoute("/api/password/reset")({ server: { handlers: { POST: ({ request }) => handlePasswordReset(request) } } });
function hmacSha256Hex(secret, message) {
	return createHmac("sha256", secret).update(message).digest("hex");
}
function safeEqual(a, b) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return diff === 0;
}
function stripeSignatureHeader(raw, secret, timestamp = Math.floor(Date.now() / 1e3)) {
	return `t=${timestamp},v1=${hmacSha256Hex(secret, `${timestamp}.${raw}`)}`;
}
function verifyStripeSignature(raw, header, secret, now = Date.now()) {
	if (!secret) return "Stripe webhook secret is not set.";
	const parts = /* @__PURE__ */ new Map();
	for (const piece of header.split(",")) {
		const index = piece.indexOf("=");
		if (index > 0) parts.set(piece.slice(0, index), piece.slice(index + 1));
	}
	const timestamp = parts.get("t") ?? "";
	const signature = parts.get("v1") ?? "";
	const seconds = Number(timestamp);
	if (!timestamp || !signature || !Number.isFinite(seconds)) return "Stripe signature is missing.";
	if (Math.abs(now / 1e3 - seconds) > 300) return "Stripe signature is too old.";
	if (!safeEqual(hmacSha256Hex(secret, `${timestamp}.${raw}`), signature)) return "Stripe signature does not match.";
	return null;
}
function skydoSignature(raw, secret) {
	return hmacSha256Hex(secret, raw);
}
function verifySkydoSignature(raw, header, secret) {
	if (!secret) return "Skydo webhook secret is not set.";
	const signature = header.trim().toLowerCase();
	if (!/^[0-9a-f]{64}$/.test(signature)) return "Skydo signature is missing.";
	if (!safeEqual(skydoSignature(raw, secret), signature)) return "Skydo signature does not match.";
	return null;
}
function planFromAmount(amount, currency) {
	const code = currency.trim().toLowerCase();
	const value = Math.round(amount);
	if (!Number.isFinite(value) || value < 0) return null;
	if (code === "usd") {
		if (value === 0) return "free";
		if (value === 59 || value === 5900) return "basic";
		if (value === 299 || value === 29900) return "advance";
		return null;
	}
	if (value === 0) return "free";
	if (value === 4999 || value === 499900) return "basic";
	if (value === 24999 || value === 2499900) return "advance";
	return null;
}
function asRecord(value) {
	return value && typeof value === "object" ? value : null;
}
function text(value) {
	return typeof value === "string" ? value.trim() : "";
}
function numberOf(value) {
	return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function explicitPlan(value) {
	const plan = text(value).toLowerCase();
	return isPlan(plan) ? plan : null;
}
function decideStripe(body) {
	const event = asRecord(body);
	const id = text(event?.id);
	const type = text(event?.type);
	if (!id || !type) return { error: "Stripe event needs an id and a type." };
	const object = asRecord(asRecord(event?.data)?.object) ?? {};
	const metadata = asRecord(object.metadata) ?? {};
	const email = text(object.customer_email) || text(asRecord(object.customer_details)?.email) || text(metadata.email);
	const named = explicitPlan(metadata.plan);
	const currency = text(object.currency) || "inr";
	const amount = numberOf(object.amount_total) || numberOf(object.amount_paid);
	if (type === "customer.subscription.deleted") return {
		eventId: id,
		eventType: type,
		email,
		plan: "free",
		billingState: "active",
		amountPaise: 0
	};
	if (type === "invoice.payment_failed") return {
		eventId: id,
		eventType: type,
		email,
		plan: null,
		billingState: "past_due",
		amountPaise: amount
	};
	if (type === "checkout.session.completed" || type === "invoice.paid" || type === "customer.subscription.updated") {
		const status = text(object.status);
		if (type === "customer.subscription.updated" && (status === "past_due" || status === "unpaid")) return {
			eventId: id,
			eventType: type,
			email,
			plan: named,
			billingState: "past_due",
			amountPaise: amount
		};
		const plan = named ?? planFromAmount(amount, currency);
		if (!plan) return { error: "This Stripe payment does not match Free, Basic, or Advance." };
		return {
			eventId: id,
			eventType: type,
			email,
			plan,
			billingState: "active",
			amountPaise: amount
		};
	}
	return {
		eventId: id,
		eventType: type,
		email,
		plan: null,
		billingState: null,
		amountPaise: 0
	};
}
function decideSkydo(body) {
	const event = asRecord(body);
	const id = text(event?.id);
	const type = text(event?.event).toLowerCase();
	if (!id || !type) return { error: "Skydo event needs an id and an event name." };
	const email = text(event?.payer_email) || text(event?.email);
	const named = explicitPlan(event?.plan) ?? explicitPlan(event?.reference);
	const currency = text(event?.currency) || "INR";
	const amount = numberOf(event?.amount);
	if (type === "payment.failed" || type === "payment.cancelled") return {
		eventId: id,
		eventType: type,
		email,
		plan: null,
		billingState: "past_due",
		amountPaise: 0
	};
	if (type === "payment.settled" || type === "payment.received") {
		const plan = named ?? planFromAmount(amount, currency);
		if (!plan) return { error: "This Skydo payment does not match Free, Basic, or Advance." };
		const code = currency.toLowerCase();
		const amountPaise = code === "inr" && amount < 1e5 ? Math.round(amount * 100) : code === "inr" ? Math.round(amount) : 0;
		return {
			eventId: id,
			eventType: type,
			email,
			plan,
			billingState: "active",
			amountPaise: plan === "free" ? 0 : amountPaise
		};
	}
	return {
		eventId: id,
		eventType: type,
		email,
		plan: null,
		billingState: null,
		amountPaise: 0
	};
}
async function settings(sql) {
	await sql`
    insert into platform_settings (id, stripe_secret, skydo_secret)
    values ('default', ${DEMO_STRIPE_SECRET}, ${DEMO_SKYDO_SECRET})
    on conflict (id) do nothing
  `;
	return (await sql`
    select stripe_secret, skydo_secret from platform_settings where id = 'default' limit 1
  `)[0] ?? {
		stripe_secret: "whsec_nock_demo_stripe",
		skydo_secret: "skydo_nock_demo"
	};
}
async function applyDecision(sql, provider, decision) {
	if ((await sql`
    select id from payment_events where provider = ${provider} and event_id = ${decision.eventId} limit 1
  `)[0]) return {
		received: true,
		duplicate: true
	};
	if (!decision.email) {
		await record(sql, provider, decision, "ignored", "No customer email on the event.");
		return {
			received: true,
			matched: false
		};
	}
	const business = (await sql`
    select b.id, b.mau
    from businesses b
    join memberships m on m.business_id = b.id and m.role = 'owner'
    join "user" u on u.id = m.user_id
    where lower(u.email) = ${decision.email.toLowerCase()}
    limit 1
  `)[0];
	if (!business) {
		await record(sql, provider, decision, "unmatched", "No workspace owner uses that email.");
		return {
			received: true,
			matched: false
		};
	}
	if (decision.plan) await sql`update businesses set plan = ${decision.plan} where id = ${business.id}`;
	if (decision.billingState) await sql`update businesses set billing_state = ${decision.billingState} where id = ${business.id}`;
	if (decision.billingState === "active" && decision.plan && decision.plan !== "free" && decision.amountPaise > 0) {
		const label = `${periodLabel()} · ${provider} · ${decision.eventId.slice(0, 12)}`;
		await sql`
      insert into invoices (
        id, business_id, period_label, plan, mau, included_mau, base_paise, overage_paise, total_paise, status
      ) values (
        ${crypto.randomUUID()}, ${business.id}, ${label}, ${decision.plan}, ${business.mau}, 0,
        ${decision.amountPaise}, 0, ${decision.amountPaise}, 'paid'
      )
      on conflict (business_id, period_label) do nothing
    `;
	}
	await record(sql, provider, decision, "applied", decision.plan ? `Plan set to ${decision.plan}.` : "Billing state updated.");
	return {
		received: true,
		matched: true
	};
}
async function record(sql, provider, decision, status, detail) {
	await sql`
    insert into payment_events (id, provider, event_id, event_type, email, plan, amount_paise, status, detail)
    values (
      ${crypto.randomUUID()}, ${provider}, ${decision.eventId}, ${decision.eventType}, ${decision.email},
      ${decision.plan ?? ""}, ${decision.amountPaise}, ${status}, ${detail}
    )
    on conflict (provider, event_id) do nothing
  `;
}
async function handleStripeRequest(request) {
	const raw = await request.text();
	const sql = await getSql();
	const secret = (await settings(sql)).stripe_secret;
	const problem = verifyStripeSignature(raw, request.headers.get("stripe-signature") ?? "", secret);
	if (problem) return Response.json({ error: problem }, { status: 400 });
	return decideAndApply(sql, "stripe", raw);
}
async function handleSkydoRequest(request) {
	const raw = await request.text();
	const sql = await getSql();
	const secret = (await settings(sql)).skydo_secret;
	const problem = verifySkydoSignature(raw, request.headers.get("x-skydo-signature") ?? "", secret);
	if (problem) return Response.json({ error: problem }, { status: 400 });
	return decideAndApply(sql, "skydo", raw);
}
async function decideAndApply(sql, provider, raw) {
	let body;
	try {
		body = JSON.parse(raw);
	} catch {
		return Response.json({ error: "Body is not JSON." }, { status: 400 });
	}
	const decision = provider === "stripe" ? decideStripe(body) : decideSkydo(body);
	if ("error" in decision) return Response.json({ error: decision.error }, { status: 400 });
	return Response.json(await applyDecision(sql, provider, decision));
}
async function signedReplay(input) {
	const sql = await getSql();
	const current = await settings(sql);
	const id = `${input.provider}_${crypto.randomUUID().slice(0, 8)}`;
	if (input.provider === "stripe") {
		const type = input.outcome === "canceled" ? "customer.subscription.deleted" : input.outcome === "failed" ? "invoice.payment_failed" : "checkout.session.completed";
		const amount = input.plan === "advance" ? 2499900 : input.plan === "basic" ? 499900 : 0;
		const raw = JSON.stringify({
			id,
			type,
			data: { object: {
				customer_email: input.email,
				metadata: { plan: input.plan },
				amount_total: amount,
				currency: "inr"
			} }
		});
		const problem = verifyStripeSignature(raw, stripeSignatureHeader(raw, current.stripe_secret), current.stripe_secret);
		if (problem) return { error: problem };
		const decision = decideStripe(JSON.parse(raw));
		if ("error" in decision) return { error: decision.error };
		return applyDecision(sql, "stripe", decision);
	}
	const event = input.outcome === "paid" ? "payment.settled" : "payment.failed";
	const amount = input.plan === "advance" ? 24999 : input.plan === "basic" ? 4999 : 0;
	const raw = JSON.stringify({
		id,
		event,
		payer_email: input.email,
		plan: input.plan,
		amount,
		currency: "INR"
	});
	const problem = verifySkydoSignature(raw, skydoSignature(raw, current.skydo_secret), current.skydo_secret);
	if (problem) return { error: problem };
	const decision = decideSkydo(JSON.parse(raw));
	if ("error" in decision) return { error: decision.error };
	return applyDecision(sql, "skydo", decision);
}
async function writeWebhookSettings(input) {
	const sql = await getSql();
	await settings(sql);
	await sql`
    update platform_settings set stripe_secret = ${input.stripeSecret}, skydo_secret = ${input.skydoSecret}
    where id = 'default'
  `;
}
async function ownerId$1(request) {
	const { auth } = await import("./server-CCpuExkQ.mjs").then((n) => n.s).then((n) => n.r);
	const userId = (await auth.api.getSession({ headers: request.headers }))?.user?.id;
	if (!userId) return null;
	return (await (await getSql())`select user_id from platform_admins where user_id = ${userId} limit 1`)[0] ? userId : null;
}
var Route$3 = createFileRoute("/api/webhooks/replay")({ server: { handlers: { POST: async ({ request }) => {
	if (!await ownerId$1(request)) return Response.json({ error: "System rights are required." }, { status: 403 });
	const body = await request.json().catch(() => null);
	const provider = body?.provider === "skydo" ? "skydo" : body?.provider === "stripe" ? "stripe" : null;
	const outcome = body?.outcome === "failed" || body?.outcome === "canceled" || body?.outcome === "paid" ? body.outcome : null;
	const email = (body?.email ?? "").trim().toLowerCase();
	const plan = body?.plan ?? "";
	if (!provider || !outcome || !isPlan(plan) || !email.includes("@")) return Response.json({ error: "Choose Stripe or Skydo, a plan, and an owner email." }, { status: 400 });
	const result = await signedReplay({
		provider,
		email,
		plan,
		outcome
	});
	if ("error" in result && result.error) return Response.json({ error: result.error }, { status: 400 });
	return Response.json(result);
} } } });
async function ownerId(request) {
	const { auth } = await import("./server-CCpuExkQ.mjs").then((n) => n.s).then((n) => n.r);
	const userId = (await auth.api.getSession({ headers: request.headers }))?.user?.id;
	if (!userId) return null;
	return (await (await getSql())`select user_id from platform_admins where user_id = ${userId} limit 1`)[0] ? userId : null;
}
var Route$2 = createFileRoute("/api/webhooks/settings")({ server: { handlers: { POST: async ({ request }) => {
	if (!await ownerId(request)) return Response.json({ error: "System rights are required." }, { status: 403 });
	const body = await request.json().catch(() => null);
	const stripeSecret = (body?.stripeSecret ?? "").trim();
	const skydoSecret = (body?.skydoSecret ?? "").trim();
	if (stripeSecret.length < 8 || skydoSecret.length < 8 || stripeSecret.length > 200 || skydoSecret.length > 200) return Response.json({ error: "Each secret needs 8–200 characters." }, { status: 400 });
	await writeWebhookSettings({
		stripeSecret,
		skydoSecret
	});
	return Response.json({ saved: true });
} } } });
var Route$1 = createFileRoute("/api/webhooks/skydo")({ server: { handlers: { POST: ({ request }) => handleSkydoRequest(request) } } });
var Route = createFileRoute("/api/webhooks/stripe")({ server: { handlers: { POST: ({ request }) => handleStripeRequest(request) } } });
var rootRouteChildren = {
	IndexRoute: Route$9.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$10
	}),
	AdminRoute: Route$8.update({
		id: "/admin",
		path: "/admin",
		getParentRoute: () => Route$10
	}),
	LoginRoute: Route$7.update({
		id: "/login",
		path: "/login",
		getParentRoute: () => Route$10
	}),
	ApiOwnerReadyRoute: Route$6.update({
		id: "/api/owner-ready",
		path: "/api/owner-ready",
		getParentRoute: () => Route$10
	}),
	ApiAuthSplatRoute: Route$5.update({
		id: "/api/auth/$",
		path: "/api/auth/$",
		getParentRoute: () => Route$10
	}),
	ApiPasswordResetRoute: Route$4.update({
		id: "/api/password/reset",
		path: "/api/password/reset",
		getParentRoute: () => Route$10
	}),
	ApiWebhooksReplayRoute: Route$3.update({
		id: "/api/webhooks/replay",
		path: "/api/webhooks/replay",
		getParentRoute: () => Route$10
	}),
	ApiWebhooksSettingsRoute: Route$2.update({
		id: "/api/webhooks/settings",
		path: "/api/webhooks/settings",
		getParentRoute: () => Route$10
	}),
	ApiWebhooksSkydoRoute: Route$1.update({
		id: "/api/webhooks/skydo",
		path: "/api/webhooks/skydo",
		getParentRoute: () => Route$10
	}),
	ApiWebhooksStripeRoute: Route.update({
		id: "/api/webhooks/stripe",
		path: "/api/webhooks/stripe",
		getParentRoute: () => Route$10
	})
};
var routeTree = Route$10._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { newPasswordError as a, signInFailureMessage as c, isExistingAccountError as i, signUpConflictMessage as l, accountEmailError as n, normalizeAccountEmail as o, isAccountState as r, resetStartMessage as s, router_exports as t };
