import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as nextPlan, b as quoteUsage, d as formatInr, i as PLAN_RATES, x as runLogicChecks, y as planLabel } from "./owner-access-gxEwVfLU.mjs";
import { d as formatCount, n as Input, s as cn, t as Button } from "./account-fns-7GP3bSk7.mjs";
import { i as usePush, n as UserButton, r as useCurrentUserState } from "./gates-CN0gzG2z.mjs";
import { t as emailSignIn } from "./email-session-CMHsUb3L.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-zk4-eMr0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CHECKS = runLogicChecks();
function AdminPanel() {
	const businesses = usePush((s) => s.businesses);
	const seats = usePush((s) => s.seats);
	const invoices = usePush((s) => s.invoices);
	const registerEnterprise = usePush((s) => s.registerEnterprise);
	const changeBusinessPlan = usePush((s) => s.changeBusinessPlan);
	const setGrants = usePush((s) => s.setGrants);
	const issueBill = usePush((s) => s.issueBill);
	const paymentEvents = usePush((s) => s.paymentEvents);
	const webhookSecrets = usePush((s) => s.webhookSecrets);
	const load = usePush((s) => s.load);
	const [stripeSecret, setStripeSecret] = (0, import_react.useState)("");
	const [skydoSecret, setSkydoSecret] = (0, import_react.useState)("");
	const [replayEmail, setReplayEmail] = (0, import_react.useState)("");
	const [replayPlan, setReplayPlan] = (0, import_react.useState)("basic");
	const [replayProvider, setReplayProvider] = (0, import_react.useState)("stripe");
	const [businessName, setBusinessName] = (0, import_react.useState)("");
	const [contact, setContact] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [plan, setPlan] = (0, import_react.useState)("advance");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Subscriptions"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-1 max-w-xl text-sm text-muted-foreground",
					children: "Free, Basic, and Advance are the rates. An enterprise is billed pay per use on Basic or Advance after the owner accepts. Stripe and Skydo confirm a paid plan."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 pt-4 sm:grid-cols-2",
					children: Object.keys(PLAN_RATES).map((id) => {
						const rate = PLAN_RATES[id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "rounded-xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: rate.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "pt-1 font-display text-4xl font-medium tabular-nums",
									children: formatInr(rate.basePaise)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [formatCount(rate.includedMau), " MAU included"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "pt-2 text-sm",
									children: [
										"Then ",
										formatInr(rate.overagePaise),
										" per extra MAU"
									]
								})
							]
						}, id);
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
				onSubmit: (event) => {
					event.preventDefault();
					(async () => {
						const error = await registerEnterprise({
							businessName,
							contact,
							email,
							plan
						});
						if (error) toast.error(error);
						else {
							toast.success("Enterprise registered. Billing starts after they accept.");
							setBusinessName("");
							setContact("");
							setEmail("");
						}
					})();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Register an enterprise"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Company", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: businessName,
							onChange: (e) => setBusinessName(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Contact name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: contact,
							onChange: (e) => setContact(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Billing email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: ["basic", "advance"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": plan === item,
							onClick: () => setPlan(item),
							className: cn("h-11 rounded-sm px-3 text-sm font-medium", plan === item ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: item === "basic" ? "Basic" : "Advance"
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Register enterprise"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Workspaces"
				}), businesses.map((business) => {
					const quote = business.kind === "enterprise" ? quoteUsage(business.plan, business.mau) : null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-start justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: business.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										business.ownerEmail || "Owner pending",
										" · ",
										planLabel(business.plan),
										business.billingState === "past_due" ? " · payment failed" : "",
										" ·",
										" ",
										business.kind === "enterprise" ? business.onboarded ? "Enterprise live" : "Waiting to accept" : "Self-serve",
										" ·",
										" ",
										formatCount(business.mau),
										" MAU"
									]
								}),
								quote ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "pt-1 text-sm tabular-nums",
									children: [
										"This period ",
										formatInr(quote.totalPaise),
										quote.extra > 0 ? ` · ${formatCount(quote.extra)} extra MAU ${formatInr(quote.overagePaise)}` : " · inside the included MAU"
									]
								}) : null
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => {
										(async () => {
											const error = await changeBusinessPlan({
												id: business.id,
												plan: nextPlan(business.plan)
											});
											if (error) toast.error(error);
										})();
									},
									children: ["Set ", planLabel(nextPlan(business.plan))]
								}), business.kind === "enterprise" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => {
										(async () => {
											const error = await issueBill(business.id);
											if (error) toast.error(error);
											else toast.success("Bill issued.");
										})();
									},
									children: "Issue bill"
								}) : null]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								["sdk", "SDK"],
								["webhook", "Webhook"],
								["test", "Test run"]
							].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": business.grants[key],
								onClick: () => {
									(async () => {
										const error = await setGrants({
											id: business.id,
											sdk: key === "sdk" ? !business.grants.sdk : business.grants.sdk,
											webhook: key === "webhook" ? !business.grants.webhook : business.grants.webhook,
											test: key === "test" ? !business.grants.test : business.grants.test
										});
										if (error) toast.error(error);
									})();
								},
								className: cn("h-11 rounded-sm px-3 text-sm font-medium", business.grants[key] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
								children: label
							}, key))
						})]
					}, business.id);
				})]
			}),
			seats.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Waiting for registration"
				}), seats.map((seat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-xl border border-border bg-card px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: seat.businessName
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [
							" ",
							"· ",
							seat.email,
							" · ",
							planLabel(seat.plan),
							seat.kind === "enterprise" ? " · Enterprise pay per use" : ""
						]
					})]
				}, seat.id))]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Bills"
					}),
					invoices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No bill has been issued."
					}) : null,
					invoices.map((invoice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "rounded-xl border border-border bg-card px-4 py-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: invoice.businessName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									" ",
									"· ",
									invoice.periodLabel,
									" · ",
									planLabel(invoice.plan),
									" · ",
									formatCount(invoice.mau),
									" MAU ·",
									" "
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: formatInr(invoice.totalPaise)
							})
						]
					}, invoice.id))
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Stripe and Skydo"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Point Stripe at /api/webhooks/stripe and Skydo at /api/webhooks/skydo. Stripe signs Stripe-Signature. Skydo signs X-Skydo-Signature with HMAC-SHA256 of the raw body. A failed payment pauses sends. A deleted Stripe subscription moves the workspace to Free."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "break-all font-mono text-xs text-subtle",
						children: ["Stripe secret ", webhookSecrets.stripe || stripeSecret]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "break-all font-mono text-xs text-subtle",
						children: ["Skydo secret ", webhookSecrets.skydo || skydoSecret]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-col gap-3",
						onSubmit: (event) => {
							event.preventDefault();
							(async () => {
								const token = sessionStorage.getItem("grok-auth.bearer-token");
								const response = await fetch("/api/webhooks/settings", {
									method: "POST",
									credentials: "include",
									headers: {
										"content-type": "application/json",
										...token ? { authorization: `Bearer ${token}` } : {}
									},
									body: JSON.stringify({
										stripeSecret,
										skydoSecret
									})
								});
								const body = await response.json().catch(() => null);
								if (!response.ok) toast.error(body?.error || "Could not save secrets.");
								else {
									toast.success("Webhook secrets saved.");
									await load();
								}
							})();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["Stripe signing secret", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: stripeSecret,
									onChange: (e) => setStripeSecret(e.target.value),
									placeholder: webhookSecrets.stripe
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["Skydo signing secret", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: skydoSecret,
									onChange: (e) => setSkydoSecret(e.target.value),
									placeholder: webhookSecrets.skydo
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Save secrets"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-col gap-3 border-t border-border pt-3",
						onSubmit: (event) => {
							event.preventDefault();
							(async () => {
								const token = sessionStorage.getItem("grok-auth.bearer-token");
								const response = await fetch("/api/webhooks/replay", {
									method: "POST",
									credentials: "include",
									headers: {
										"content-type": "application/json",
										...token ? { authorization: `Bearer ${token}` } : {}
									},
									body: JSON.stringify({
										provider: replayProvider,
										email: replayEmail,
										plan: replayPlan,
										outcome: "paid"
									})
								});
								const body = await response.json().catch(() => null);
								if (!response.ok) toast.error(body?.error || "Webhook was rejected.");
								else {
									toast.success(body?.matched ? "Signed payment applied." : "Signed, but no workspace matched that email.");
									await load();
								}
							})();
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-medium",
								children: "Send a signed test"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: ["stripe", "skydo"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": replayProvider === item,
									onClick: () => setReplayProvider(item),
									className: cn("h-11 rounded-sm px-3 text-sm font-medium", replayProvider === item ? "bg-primary text-primary-foreground" : "bg-muted"),
									children: item === "stripe" ? "Stripe" : "Skydo"
								}, item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex flex-col gap-1 text-sm font-medium",
								children: ["Owner email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "email",
									value: replayEmail,
									onChange: (e) => setReplayEmail(e.target.value),
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									"free",
									"basic",
									"advance"
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									"aria-pressed": replayPlan === item,
									onClick: () => setReplayPlan(item),
									className: cn("h-11 rounded-sm px-3 text-sm font-medium", replayPlan === item ? "bg-primary text-primary-foreground" : "bg-muted"),
									children: planLabel(item)
								}, item))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Apply signed payment"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2",
						children: paymentEvents.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium",
								children: event.provider
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted-foreground",
								children: [
									" ",
									"· ",
									event.eventType,
									" · ",
									event.email || "no email",
									" · ",
									event.status,
									event.plan ? ` · ${event.plan}` : ""
								]
							})]
						}, event.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Rules"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: CHECKS.map((check) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "rounded-xl border border-border bg-card px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium",
							children: [
								check.pass ? "Pass" : "Fail",
								" · ",
								check.name
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: check.detail
						})]
					}, check.name))
				})]
			})
		]
	});
}
function AdminPage() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-4xl font-medium",
			children: "Nock"
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminLogin, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminGate, {});
}
function AdminLogin() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		fetch("/api/owner-ready", { method: "POST" }).then(async (response) => {
			if (!response.ok) throw new Error("The system owner account is not ready.");
			setReady(true);
		}).catch((caught) => {
			setError(caught instanceof Error ? caught.message : "The system owner account is not ready.");
		});
	}, []);
	async function onSubmit(event) {
		event.preventDefault();
		setError("");
		setBusy(true);
		try {
			await emailSignIn({
				email: email.trim(),
				password
			});
			window.location.assign("/admin");
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not sign in.");
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-background px-4 py-10 text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit,
			className: "mx-auto flex w-full max-w-md flex-col gap-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl font-medium tracking-tight",
					children: "Nock"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "System owner"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Separate from a business workspace. Enter the system owner email and password. They are not listed on this page."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 text-sm font-medium",
					children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "email",
						value: email,
						onChange: (e) => setEmail(e.target.value),
						autoComplete: "username",
						required: true
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex flex-col gap-1 text-sm font-medium",
					children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						autoComplete: "current-password",
						required: true
					})]
				}),
				error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-danger",
					children: error
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: busy || !ready || false,
					children: ready ? busy ? "Please wait…" : "Sign in" : "Preparing the owner account…"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/login",
					className: "text-sm text-muted-foreground underline",
					children: "Business sign in"
				})
			]
		})
	});
}
function AdminGate() {
	const ready = usePush((s) => s.ready);
	const loadError = usePush((s) => s.loadError);
	const load = usePush((s) => s.load);
	const isSystemAdmin = usePush((s) => s.isSystemAdmin);
	const email = usePush((s) => s.email);
	const role = usePush((s) => s.role);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, { position: "top-center" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl font-medium",
					children: "Nock"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "System owner"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "text-sm font-medium underline",
						children: "Workspace"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-3xl px-4 py-6",
				children: [
					!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-medium",
						children: "Nock"
					}) : null,
					ready && loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-danger",
						children: loadError
					}) : null,
					ready && !loadError && !isSystemAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "max-w-md text-sm text-muted-foreground",
						children: [
							"This panel is only for the system owner. Signed in as ",
							email || "unknown",
							" ",
							role ? `(${role})` : "(no workspace)",
							"."
						]
					}) : null,
					ready && !loadError && isSystemAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPanel, {}) : null
				]
			})
		]
	});
}
//#endregion
export { AdminPage as component };
