import { t as authClient } from "./client-CVqXY6bk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/email-session-CMHsUb3L.js
var BEARER_KEY = "grok-auth.bearer-token";
function messageOf(body, fallback) {
	if (!body || typeof body !== "object") return fallback;
	const record = body;
	if (typeof record.message === "string" && record.message) return record.message;
	if (typeof record.error?.message === "string" && record.error.message) return record.error.message;
	return fallback;
}
async function postAuth(path, payload) {
	const response = await fetch(path, {
		method: "POST",
		credentials: "include",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(payload)
	});
	const token = response.headers.get("set-auth-token");
	if (token) sessionStorage.setItem(BEARER_KEY, token);
	const body = await response.json().catch(() => null);
	if (!response.ok) throw new Error(messageOf(body, "Sign-in failed."));
	await authClient.getSession();
}
function emailSignUp(input) {
	return postAuth("/api/auth/sign-up/email", input);
}
function emailSignIn(input) {
	return postAuth("/api/auth/sign-in/email", input);
}
//#endregion
export { emailSignUp as n, emailSignIn as t };
