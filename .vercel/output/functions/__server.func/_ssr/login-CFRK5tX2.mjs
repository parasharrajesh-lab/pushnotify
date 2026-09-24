import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { y as planLabel } from "./owner-access-BUXscoKo.mjs";
import { c as completeRegistration, n as Input, s as cn, t as Button } from "./account-fns-DRPJC4Eu.mjs";
import { r as signIn } from "./client-CVqXY6bk.mjs";
import { t as GROK_PROVIDERS } from "./server-DMA1ES5G.mjs";
import { n as emailSignUp, t as emailSignIn } from "./email-session-CMHsUb3L.mjs";
import { a as newPasswordError, c as signInFailureMessage, i as isExistingAccountError, l as signUpConflictMessage, n as accountEmailError, o as normalizeAccountEmail, r as isAccountState, s as resetStartMessage } from "./router-C8SmBa4Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-CFRK5tX2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PLANS = [
	{
		id: "free",
		name: "Free",
		price: "₹0",
		mau: "500 MAU",
		points: [
			"Android and iOS",
			"Image and deep link",
			"Sends pause at the cap"
		]
	},
	{
		id: "basic",
		name: "Basic",
		price: "₹4,999",
		mau: "10,000 MAU",
		points: [
			"Team and roles",
			"Then ₹0.80 per extra MAU",
			"Stripe or Skydo"
		]
	},
	{
		id: "advance",
		name: "Advance",
		price: "₹24,999",
		mau: "100,000 MAU",
		points: [
			"Video on the lock screen",
			"Then ₹0.40 per extra MAU",
			"Stripe or Skydo"
		]
	}
];
function Login() {
	const [mode, setMode] = (0, import_react.useState)("up");
	const [plan, setPlan] = (0, import_react.useState)("free");
	const [name, setName] = (0, import_react.useState)("");
	const [businessName, setBusinessName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [resetReady, setResetReady] = (0, import_react.useState)(false);
	const [notice, setNotice] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	function showMode(next) {
		setMode(next);
		setError("");
		setNotice("");
		setResetReady(false);
		setPassword("");
		setConfirm("");
	}
	async function accountState(mail) {
		const body = await (await fetch("/api/password/reset", {
			method: "POST",
			credentials: "include",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				action: "status",
				email: mail
			})
		})).json().catch(() => null);
		return isAccountState(body?.state) ? body.state : "missing";
	}
	async function onSubmit(event) {
		event.preventDefault();
		setError("");
		setNotice("");
		const mail = normalizeAccountEmail(email);
		if (mode !== "reset" && password.length < 8) {
			setError("Use at least 8 characters.");
			return;
		}
		setBusy(true);
		try {
			if (mode === "reset") {
				if (!resetReady) {
					const emailError = accountEmailError(mail);
					if (emailError) {
						setError(emailError);
						setBusy(false);
						return;
					}
					const response = await fetch("/api/password/reset", {
						method: "POST",
						credentials: "include",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							action: "start",
							email: mail
						})
					});
					const body = await response.json().catch(() => null);
					if (!response.ok) throw new Error(body?.error || "Could not start a reset.");
					if (!body?.issued) {
						setError(resetStartMessage(body?.reason === "owner" ? "owner" : "missing") ?? "No account uses that email. Register a workspace.");
						setBusy(false);
						return;
					}
					setResetReady(true);
					setNotice("Choose a new password. It replaces the old one for this email.");
					setBusy(false);
					return;
				}
				const passwordError = newPasswordError(password, confirm);
				if (passwordError) {
					setError(passwordError);
					setBusy(false);
					return;
				}
				const response = await fetch("/api/password/reset", {
					method: "POST",
					credentials: "include",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						action: "finish",
						email: mail,
						password,
						confirm
					})
				});
				const body = await response.json().catch(() => null);
				if (!response.ok || !body?.saved) throw new Error(body?.error || "Could not save the new password.");
				setResetReady(false);
				setPassword("");
				setConfirm("");
				setMode("in");
				setNotice("Password saved. Sign in with the new one.");
				setBusy(false);
				return;
			}
			if (mode === "up") {
				if (name.trim().length < 2 || businessName.trim().length < 2) {
					setError("Name and business are required.");
					setBusy(false);
					return;
				}
				try {
					await emailSignUp({
						name: name.trim(),
						email: mail,
						password
					});
				} catch (caught) {
					const message = caught instanceof Error ? caught.message : "";
					if (!isExistingAccountError(message)) throw caught;
					const state = await accountState(mail);
					if (state !== "password") throw new Error(signUpConflictMessage(state));
					try {
						await emailSignIn({
							email: mail,
							password
						});
					} catch {
						throw new Error(signUpConflictMessage("password"));
					}
				}
				await completeRegistration({ data: {
					businessName: businessName.trim(),
					plan
				} });
			} else try {
				await emailSignIn({
					email: mail,
					password
				});
			} catch (caught) {
				const message = caught instanceof Error ? caught.message : "";
				if (!/invalid email or password/i.test(message)) throw caught;
				throw new Error(signInFailureMessage(await accountState(mail)));
			}
			window.location.assign("/");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not sign in.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-background px-4 py-8 text-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-start",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl font-medium tracking-tight",
					children: "Nock"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "pt-3 font-display text-3xl font-medium tracking-tight",
					children: mode === "up" ? "Register a workspace" : mode === "reset" ? "New password" : "Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-2 max-w-md text-sm text-pretty text-muted-foreground",
					children: mode === "reset" ? "Business emails can set a new password here. The system owner uses a separate sign-in." : "Mobile push for a business and its team. Pick a plan, then sign in with email, Google, or X."
				}),
				mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 pt-6",
					children: PLANS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"aria-pressed": plan === item.id,
						onClick: () => setPlan(item.id),
						className: cn("rounded-xl border p-4 text-left", plan === item.id ? "border-primary bg-card" : "border-border bg-card"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: item.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "pt-1 font-display text-3xl font-medium tabular-nums",
								children: item.price
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: ["per month · ", item.mau]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "pt-3 text-sm text-muted-foreground",
								children: item.points.map((point) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "border-t border-border py-1.5 first:border-t-0",
									children: point
								}, point))
							})
						]
					}, item.id))
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-4 text-xs text-muted-foreground",
					children: "Free opens immediately. Basic and Advance can also be confirmed by a signed Stripe or Skydo payment. No card is charged on this page."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit,
				className: "flex flex-col gap-4 rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": mode === "up",
							className: cn("h-11 rounded-sm text-sm font-medium", mode === "up" ? "bg-primary text-primary-foreground" : "bg-muted"),
							onClick: () => showMode("up"),
							children: "Register"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": mode === "in",
							className: cn("h-11 rounded-sm text-sm font-medium", mode === "in" ? "bg-primary text-primary-foreground" : "bg-muted"),
							onClick: () => showMode("in"),
							children: "Sign in"
						})]
					}),
					mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Your name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							autoComplete: "name"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Business name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: businessName,
							onChange: (e) => setBusinessName(e.target.value),
							placeholder: "Metro Bites"
						})]
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: email,
							onChange: (e) => {
								setEmail(e.target.value);
								if (resetReady) {
									setResetReady(false);
									setPassword("");
									setConfirm("");
									setNotice("");
								}
							},
							autoComplete: "email",
							required: true
						})]
					}),
					mode !== "reset" || resetReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: [mode === "reset" ? "New password" : "Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							autoComplete: mode === "in" ? "current-password" : "new-password",
							required: true
						})]
					}) : null,
					mode === "in" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "self-start text-sm underline",
						onClick: () => showMode("reset"),
						children: "Forgot password"
					}) : null,
					mode === "reset" && resetReady ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Confirm new password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "password",
							value: confirm,
							onChange: (e) => setConfirm(e.target.value),
							autoComplete: "new-password",
							required: true
						})]
					}) : null,
					notice ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: notice
					}) : null,
					error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: error
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: busy || false,
						children: busy ? "Please wait…" : mode === "up" ? `Create ${planLabel(plan)} workspace` : mode === "reset" ? resetReady ? "Save new password" : "Continue" : "Sign in"
					}),
					mode === "reset" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "self-start text-sm underline",
						onClick: () => showMode("in"),
						children: "Back to sign in"
					}) : null,
					mode !== "reset" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-2 border-t border-border pt-4",
						children: GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => {
								signIn(provider.providerId, { callbackURL: "/" }).catch((caught) => {
									setError(caught instanceof Error ? caught.message : "Could not sign in.");
								});
							},
							children: ["Continue with ", provider.label]
						}, provider.providerId))
					}) : null,
					null
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto mt-8 w-full max-w-5xl border-t border-border pt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
				href: "/admin",
				className: "text-sm font-medium underline",
				children: "System owner sign in"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-1 max-w-md text-xs text-muted-foreground",
				children: "Separate from a business workspace. The owner password is not shown."
			})]
		})]
	});
}
//#endregion
export { Login as component };
