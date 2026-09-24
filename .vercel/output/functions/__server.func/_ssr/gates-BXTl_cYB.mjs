import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime, v as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as RIGHTS, r as EMPTY_GRANTS } from "./owner-access-BUXscoKo.mjs";
import { L as mauCap, n as BASE_REACH } from "./middleware-uX_hVAj_.mjs";
import { C as setBusinessGrants, D as setOwnPlan, E as setMemberRole, O as updateBrand, S as sendPush, T as setCapPreview, _ as removeConnection, a as addConnection, b as runTest, g as registerEnterprise, h as loadAccount, i as addBusinessUser, l as connectToken, m as issueInvoice, o as addDevice, p as inviteMember, r as acceptEnterprise, u as dropDevice, v as removeMember, w as setBusinessPlan, x as saveSegment, y as resetWorkspace } from "./account-fns-DRPJC4Eu.mjs";
import { i as signOut, t as authClient } from "./client-CVqXY6bk.mjs";
import { a as hasGateSessionMarker } from "./server-DMA1ES5G.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gates-BXTl_cYB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function fromAccount(account) {
	const business = account.business;
	return {
		ready: true,
		loadError: "",
		isSystemAdmin: account.isSystemAdmin,
		email: account.email,
		userName: account.name,
		role: account.role,
		rights: account.role ? [...RIGHTS[account.role]] : [],
		members: account.members,
		seats: account.seats,
		businesses: account.businesses,
		tokens: account.tokens,
		businessId: business?.id ?? null,
		businessName: business?.name ?? "",
		logo: business?.logo ?? "",
		plan: business?.plan ?? "basic",
		mauCap: mauCap(business?.plan ?? "basic"),
		mau: business?.mau ?? 0,
		reach: business?.reach ?? structuredClone(BASE_REACH),
		subscribers: business?.subscribers ?? [],
		segments: business?.segments ?? [],
		campaigns: business?.campaigns ?? [],
		overCap: business?.overCap ?? false,
		grants: business?.grants ?? EMPTY_GRANTS,
		connections: business?.connections ?? [],
		kind: business?.kind ?? "self",
		billing: business?.billing ?? "recorded",
		billingState: business?.billingState ?? "active",
		onboarded: business?.onboarded ?? true,
		invoices: account.invoices.length ? account.invoices : business?.invoices ?? [],
		paymentEvents: account.paymentEvents,
		webhookSecrets: account.webhookSecrets
	};
}
async function apply(run) {
	try {
		usePush.setState(fromAccount(await run()));
		return null;
	} catch (error) {
		return error instanceof Error ? error.message : "Something went wrong.";
	}
}
var usePush = create((set) => ({
	ready: false,
	loadError: "",
	isSystemAdmin: false,
	email: "",
	userName: "",
	role: null,
	rights: [],
	members: [],
	seats: [],
	businesses: [],
	tokens: [],
	businessId: null,
	businessName: "",
	logo: "",
	plan: "basic",
	mauCap: mauCap("basic"),
	mau: 0,
	reach: structuredClone(BASE_REACH),
	subscribers: [],
	segments: [],
	campaigns: [],
	overCap: false,
	grants: EMPTY_GRANTS,
	connections: [],
	kind: "self",
	billing: "recorded",
	billingState: "active",
	onboarded: true,
	invoices: [],
	paymentEvents: [],
	webhookSecrets: {
		stripe: "",
		skydo: ""
	},
	load: async () => {
		try {
			set(fromAccount(await loadAccount()));
		} catch (error) {
			set({
				ready: true,
				loadError: error instanceof Error ? error.message : "Could not load the workspace."
			});
		}
	},
	send: (input) => apply(() => sendPush({ data: input })),
	saveSegment: (input) => apply(() => saveSegment({ data: input })),
	addDevice: (input) => apply(() => addDevice({ data: input })),
	dropToken: (input) => apply(() => dropDevice({ data: input })),
	setOverCap: (on) => apply(() => setCapPreview({ data: on })),
	reset: () => apply(() => resetWorkspace()),
	saveBrand: (input) => apply(() => updateBrand({ data: input })),
	changePlan: (plan) => apply(() => setOwnPlan({ data: plan })),
	invite: (input) => apply(() => inviteMember({ data: input })),
	changeRole: (input) => apply(() => setMemberRole({ data: input })),
	removeTeammate: (id) => apply(() => removeMember({ data: id })),
	addBusiness: (input) => apply(() => addBusinessUser({ data: input })),
	changeBusinessPlan: (input) => apply(() => setBusinessPlan({ data: input })),
	setGrants: (input) => apply(() => setBusinessGrants({ data: input })),
	addLink: (input) => apply(() => addConnection({ data: input })),
	removeLink: (id) => apply(() => removeConnection({ data: id })),
	testRun: (input) => apply(() => runTest({ data: input })),
	registerEnterprise: (input) => apply(() => registerEnterprise({ data: input })),
	acceptTerms: () => apply(() => acceptEnterprise()),
	issueBill: (id) => apply(() => issueInvoice({ data: id })),
	connectToken: (input) => apply(() => connectToken({ data: input }))
}));
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	const { data, isPending } = authClient.useSession();
	const user = data?.user;
	return {
		user: user ? {
			id: user.id,
			displayName: user.name ?? null,
			primaryEmail: user.email ?? null,
			profileImageUrl: user.image ?? null,
			isDevFallback: false
		} : null,
		isPending
	};
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
//#endregion
export { usePush as i, UserButton as n, useCurrentUserState as r, RedirectToSignIn as t };
