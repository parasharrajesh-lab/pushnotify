import { o as __toESM } from "../_runtime.mjs";
import { B as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as nextPlan, a as RIGHTS, b as quoteUsage, c as ROLE_LABEL, d as formatInr, i as PLAN_RATES, o as RIGHT_ROWS, s as ROLES, y as planLabel } from "./owner-access-gxEwVfLU.mjs";
import { a as audienceLabel, b as tokenCounts, c as chartSeries, h as reviewCampaign, i as TAGS, o as audienceSize, r as STEPS, v as stateLabel, y as tagLabel } from "./middleware-fDVXmQad.mjs";
import { c as completeRegistration, d as formatCount, f as formatWhen, n as Input, s as cn, t as Button } from "./account-fns-7GP3bSk7.mjs";
import { i as usePush, n as UserButton, r as useCurrentUserState, t as RedirectToSignIn } from "./gates-CN0gzG2z.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { a as ResponsiveContainer, i as Bar, n as YAxis, o as Tooltip, r as XAxis, t as BarChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C_ERKh0G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Phone({ platform, title, body, link, image, video, appName, logo, pulse, surface = "lock", button = "", onPlatform }) {
	const now = /* @__PURE__ */ new Date();
	const time = now.toLocaleTimeString("en-IN", {
		hour: "numeric",
		minute: "2-digit"
	});
	const show = title.trim().length > 0 || body.trim().length > 0;
	const [logoFailed, setLogoFailed] = (0, import_react.useState)(false);
	const mark = (appName.trim() || "N").charAt(0).toUpperCase();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto w-60",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center gap-1 pb-3",
				role: "group",
				"aria-label": "Preview platform",
				children: ["ios", "android"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": platform === item,
					onClick: () => onPlatform(item),
					className: cn("h-11 rounded-sm px-3 text-xs font-medium", platform === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
					children: item === "ios" ? "iOS" : "Android"
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-xl border border-border bg-foreground p-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative h-96 overflow-hidden rounded-lg bg-screen text-screen-fg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-4 pt-3 text-xs text-screen-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: time
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: platform === "ios" ? "Nock" : "LTE" })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-4 pt-5 text-center font-display text-4xl font-medium tabular-nums tracking-tight",
							children: time
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-4 pb-3 text-center text-xs text-screen-muted",
							children: now.toLocaleDateString("en-IN", {
								weekday: "long",
								day: "numeric",
								month: "long"
							})
						}),
						surface === "lock" ? show ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "banner-in mx-3 max-h-64 overflow-hidden rounded-sm bg-notif p-3 text-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										logo && !logoFailed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: logo,
											alt: "",
											className: "size-6 rounded-sm object-cover",
											onError: () => setLogoFailed(true)
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex size-6 items-center justify-center rounded-sm bg-primary font-mono text-xs font-semibold text-primary-foreground",
											children: mark
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "truncate text-xs font-medium",
											children: appName || "App"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "ml-auto text-xs text-muted-foreground",
											children: "now"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "pt-2 text-sm font-semibold leading-snug",
									children: title.trim() || "Untitled"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "pt-1 text-sm leading-snug text-muted-foreground",
									children: body.trim() || "Message body"
								}),
								image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: image,
									alt: "",
									className: "mt-2 h-16 w-full rounded-sm object-cover"
								}) : null,
								video ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
									src: video,
									className: "mt-2 h-16 w-full rounded-sm",
									controls: true,
									playsInline: true
								}) : null,
								link.trim() ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate pt-2 font-mono text-xs text-subtle",
									children: link.trim()
								}) : null
							]
						}, pulse) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-6 pt-8 text-center text-sm text-screen-muted",
							children: "Write a message to preview it on the lock screen."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-3 pt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: appName || "App"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-2 w-24 rounded-sm bg-screen-muted/40" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-2 h-2 w-16 rounded-sm bg-screen-muted/30" }),
								show ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: cn("banner-in overflow-hidden bg-notif p-3 text-foreground", surface === "modal" ? "mt-10 rounded-lg" : "mt-4 rounded-sm"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "text-sm font-semibold leading-snug",
											children: title.trim() || "Untitled"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "pt-1 text-sm leading-snug text-muted-foreground",
											children: body.trim() || "Message body"
										}),
										image ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: image,
											alt: "",
											className: "mt-2 h-14 w-full rounded-sm object-cover"
										}) : null,
										surface === "primer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 h-9 rounded-sm bg-primary text-center text-sm font-medium leading-9 text-primary-foreground",
											children: button.trim() || "Allow"
										}) : null
									]
								}, pulse) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "pt-6 text-center text-sm text-screen-muted",
									children: "Write the in-app message."
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-3 text-center text-xs text-muted-foreground",
				children: surface === "lock" ? "Lock screen" : surface === "primer" ? "Permission primer" : "In-app message"
			})
		]
	});
}
function ActivityView() {
	const campaigns = usePush((s) => s.campaigns);
	const appName = usePush((s) => s.businessName);
	const logo = usePush((s) => s.logo);
	const [selected, setSelected] = (0, import_react.useState)(campaigns[0]?.id ?? null);
	const [preview, setPreview] = (0, import_react.useState)("ios");
	const current = campaigns.find((item) => item.id === selected) ?? null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8 lg:flex-row lg:items-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "order-2 flex min-w-0 flex-1 flex-col gap-4 lg:order-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Activity"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-1 text-sm text-muted-foreground",
				children: "Broadcasts from this workspace. Basic keeps a short delivery log."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: campaigns.map((campaign) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampaignRow, {
					campaign,
					on: campaign.id === selected,
					onSelect: () => setSelected(campaign.id)
				}) }, campaign.id))
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "order-1 lg:sticky lg:top-24 lg:order-2 lg:w-64 lg:shrink-0",
			children: current ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {
				platform: preview,
				title: current.title,
				body: current.body,
				link: current.link,
				image: current.image ?? "",
				video: current.video ?? "",
				appName,
				logo,
				pulse: 0,
				surface: current.channel === "inapp" ? current.layout ?? "banner" : "lock",
				button: current.button,
				onPlatform: setPreview
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "No sends yet."
			})
		})]
	});
}
function CampaignRow({ campaign, on, onSelect }) {
	const rate = campaign.targeted === 0 ? 0 : Math.round(campaign.delivered / campaign.targeted * 100);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelect,
		"aria-pressed": on,
		className: cn("w-full rounded-xl border px-4 py-3 text-left", on ? "border-primary bg-card" : "border-border bg-card hover:bg-muted"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: campaign.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "shrink-0 text-xs tabular-nums text-muted-foreground",
					children: formatWhen(campaign.createdAt)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pt-1 text-sm text-muted-foreground",
				children: [
					campaign.channel === "inapp" ? "In-app" : "Push",
					" · ",
					campaign.isTest ? `Test run · ${campaign.testLabel || "Connection"}` : audienceLabel(campaign.audience),
					campaign.deliveryState && campaign.deliveryState !== "sent" ? ` · ${stateLabel(campaign.deliveryState)}` : ""
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pt-2 text-xs tabular-nums text-muted-foreground",
				children: [
					formatCount(campaign.delivered),
					" delivered · ",
					formatCount(campaign.failed),
					" failed · ",
					formatCount(campaign.clicked),
					" clicked · ",
					rate,
					"%"
				]
			})
		]
	});
}
function BrandView() {
	const currentName = usePush((s) => s.businessName);
	const currentLogo = usePush((s) => s.logo);
	const saveBrand = usePush((s) => s.saveBrand);
	const [name, setName] = (0, import_react.useState)(currentName);
	const [logo, setLogo] = (0, import_react.useState)(currentLogo);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "flex max-w-xl flex-col gap-4",
		onSubmit: (event) => {
			event.preventDefault();
			(async () => {
				const error = await saveBrand({
					name,
					logo
				});
				if (error) toast.error(error);
				else toast.success("Brand updated.");
			})();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Brand"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-1 text-sm text-muted-foreground",
				children: "The logo and name appear on every lock-screen preview for this business."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-sm font-medium",
				children: ["Business name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-sm font-medium",
				children: ["Logo link", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: logo.startsWith("data:") ? "" : logo,
					onChange: (e) => setLogo(e.target.value),
					placeholder: "https://"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-sm font-medium",
				children: ["Or upload", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "file",
					accept: "image/png,image/jpeg,image/webp,image/gif",
					className: "text-sm",
					onChange: (event) => {
						const file = event.target.files?.[0];
						if (!file) return;
						if (file.size > 12e4) {
							toast.error("Logo must be under 120 KB.");
							return;
						}
						const reader = new FileReader();
						reader.onload = () => setLogo(typeof reader.result === "string" ? reader.result : "");
						reader.readAsDataURL(file);
					}
				})]
			}),
			logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: logo,
				alt: "",
				className: "size-16 rounded-sm border border-border object-cover"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				children: "Save brand"
			})
		]
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("min-h-24 w-full rounded-sm border border-border bg-card px-3 py-2 text-sm text-foreground", "placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
var TARGETS = [
	{
		id: "android",
		label: "Android"
	},
	{
		id: "ios",
		label: "iOS"
	},
	{
		id: "web",
		label: "Website"
	}
];
function targetLabel(target) {
	return TARGETS.find((item) => item.id === target)?.label ?? target;
}
function ConnectView() {
	const grants = usePush((s) => s.grants);
	const connections = usePush((s) => s.connections);
	const rights = usePush((s) => s.rights);
	const addLink = usePush((s) => s.addLink);
	const removeLink = usePush((s) => s.removeLink);
	const testRun = usePush((s) => s.testRun);
	const connectToken = usePush((s) => s.connectToken);
	const subscribers = usePush((s) => s.subscribers);
	const canConnect = rights.includes("connect");
	const canTest = rights.includes("test");
	const [kind, setKind] = (0, import_react.useState)("sdk");
	const [target, setTarget] = (0, import_react.useState)("android");
	const [name, setName] = (0, import_react.useState)("");
	const [endpoint, setEndpoint] = (0, import_react.useState)("");
	const [testId, setTestId] = (0, import_react.useState)("");
	const [title, setTitle] = (0, import_react.useState)("Test from Nock");
	const [body, setBody] = (0, import_react.useState)("This is a sandbox delivery to the connected app.");
	const [link, setLink] = (0, import_react.useState)("metrobites://test");
	const [tokenPlatform, setTokenPlatform] = (0, import_react.useState)("android");
	const [tokenName, setTokenName] = (0, import_react.useState)("");
	const [token, setToken] = (0, import_react.useState)("");
	const tokens = subscribers.filter((item) => item.pushToken && item.status === "active");
	const kindOpen = kind === "sdk" ? grants.sdk : grants.webhook;
	const chosen = connections.find((item) => item.id === testId) ?? connections[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Connect"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-1 max-w-xl text-sm text-muted-foreground",
				children: "Owners and developers add an SDK or a webhook after the system admin grants it. A test run records one delivery to that connection."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-wrap gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("rounded-sm px-3 py-2", grants.sdk ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
						children: ["SDK ", grants.sdk ? "granted" : "locked"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("rounded-sm px-3 py-2", grants.webhook ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
						children: ["Webhook ", grants.webhook ? "granted" : "locked"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("rounded-sm px-3 py-2", grants.test ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
						children: ["Test run ", grants.test ? "granted" : "locked"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
				onSubmit: (event) => {
					event.preventDefault();
					(async () => {
						const error = await connectToken({
							platform: tokenPlatform,
							token,
							name: tokenName
						});
						if (error) toast.error(error);
						else {
							toast.success("Messaging token connected.");
							setToken("");
							setTokenName("");
						}
					})();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Android and iOS messaging token"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Paste an FCM registration token or a 64-character APNs device token. It is stored on this workspace and counted in MAU."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: ["android", "ios"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": tokenPlatform === item,
							onClick: () => setTokenPlatform(item),
							className: cn("h-11 rounded-sm px-3 text-sm font-medium", tokenPlatform === item ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: item === "android" ? "Android" : "iOS"
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Device name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: tokenName,
							onChange: (e) => setTokenName(e.target.value),
							placeholder: "Rider phone"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Token", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: token,
							onChange: (e) => setToken(e.target.value),
							rows: 3,
							required: true,
							placeholder: tokenPlatform === "ios" ? "64 hex characters" : "FCM token with a colon"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Connect token"
					}),
					tokens.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-1 text-sm text-muted-foreground",
						children: tokens.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							item.name,
							" · ",
							item.platform === "ios" ? "iOS" : "Android",
							" · ",
							item.pushToken?.slice(-8)
						] }, item.id))
					}) : null
				]
			}),
			canConnect ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
				onSubmit: (event) => {
					event.preventDefault();
					(async () => {
						const error = await addLink({
							kind,
							target,
							name,
							endpoint
						});
						if (error) toast.error(error);
						else {
							toast.success(kind === "sdk" ? "SDK key created." : "Webhook saved.");
							setName("");
							setEndpoint("");
						}
					})();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Add a connection"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: ["sdk", "webhook"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": kind === item,
							onClick: () => setKind(item),
							className: cn("h-11 rounded-sm px-3 text-sm font-medium", kind === item ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: item === "sdk" ? "SDK" : "Webhook"
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: TARGETS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": target === item.id,
							onClick: () => setTarget(item.id),
							className: cn("h-11 rounded-sm px-3 text-sm font-medium", target === item.id ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Metro Bites Android",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: [kind === "webhook" ? "Webhook URL" : target === "web" ? "Site origin" : target === "ios" ? "Bundle id" : "Package name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: endpoint,
							onChange: (e) => setEndpoint(e.target.value),
							placeholder: kind === "webhook" ? "https://api.example.com/nock" : target === "web" ? "https://app.example.com" : "com.example.app",
							required: kind === "webhook"
						})]
					}),
					!kindOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"The system admin has not granted ",
							kind === "sdk" ? "SDK" : "webhook",
							" access yet."
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: !kindOpen,
						children: kind === "sdk" ? "Create SDK key" : "Save webhook"
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "flex flex-col gap-2",
				children: [connections.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted-foreground",
					children: "No SDK or webhook yet."
				}) : null, connections.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								item.kind === "sdk" ? "SDK" : "Webhook",
								" · ",
								targetLabel(item.target),
								item.endpoint ? ` · ${item.endpoint}` : ""
							]
						})] }), canConnect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-10 rounded-sm px-3 text-xs font-medium text-danger hover:bg-danger-bg",
							onClick: () => {
								(async () => {
									const error = await removeLink(item.id);
									if (error) toast.error(error);
								})();
							},
							children: "Remove"
						}) : null]
					}), item.appKey ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 break-all font-mono text-xs text-subtle",
						children: ["App key ", item.appKey]
					}) : null]
				}, item.id))]
			}),
			canTest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
				onSubmit: (event) => {
					event.preventDefault();
					if (!chosen) return;
					(async () => {
						const error = await testRun({
							connectionId: chosen.id,
							title,
							body,
							link
						});
						if (error) toast.error(error);
						else toast.success(`Test recorded for ${chosen.name}.`);
					})();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Test run"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Sends one sandbox delivery to the connection you pick. It stays in Activity."
					}),
					connections.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Add a connection before a test run."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: connections.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": (testId || connections[0]?.id) === item.id,
							onClick: () => setTestId(item.id),
							className: cn("h-11 rounded-sm px-3 text-sm font-medium", (testId || connections[0]?.id) === item.id ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: item.name
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Title", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: title,
							onChange: (e) => setTitle(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Message", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: body,
							onChange: (e) => setBody(e.target.value),
							rows: 3
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Deep link", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: link,
							onChange: (e) => setLink(e.target.value)
						})]
					}),
					!grants.test ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "The system admin has not granted test runs yet."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: !grants.test || connections.length === 0,
						children: "Run test"
					})
				]
			}) : null
		]
	});
}
function DevicesView() {
	const subscribers = usePush((s) => s.subscribers);
	const addDevice = usePush((s) => s.addDevice);
	const unregister = usePush((s) => s.unregister);
	const canEdit = usePush((s) => s.rights.includes("devices_edit"));
	const [query, setQuery] = (0, import_react.useState)("");
	const [platform, setPlatform] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [userId, setUserId] = (0, import_react.useState)("");
	const [city, setCity] = (0, import_react.useState)("Mumbai");
	const [nextPlatform, setNextPlatform] = (0, import_react.useState)("android");
	const [tag, setTag] = (0, import_react.useState)("orders");
	const rows = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return subscribers.filter((device) => {
			if (platform !== "all" && device.platform !== platform) return false;
			if (!q) return true;
			return device.name.toLowerCase().includes(q) || device.userId.toLowerCase().includes(q) || device.city.toLowerCase().includes(q);
		});
	}, [
		subscribers,
		query,
		platform
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Devices"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-1 text-sm text-muted-foreground",
					children: "A sample of the Metro Bites fleet. Dead tokens drop out of MAU."
				})] }), canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => setOpen((v) => !v),
					children: open ? "Close" : "Add test device"
				}) : null]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2",
				onSubmit: (event) => {
					event.preventDefault();
					(async () => {
						const error = await addDevice({
							name,
							userId,
							platform: nextPlatform,
							city,
							tag
						});
						if (error) {
							toast.error(error);
							return;
						}
						toast.success("Device registered. MAU +1.");
						setName("");
						setUserId("");
					})();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: "Aisha Khan"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["User id", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: userId,
							onChange: (e) => setUserId(e.target.value),
							placeholder: "usr_30ab"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["City", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: city,
							onChange: (e) => setCity(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Platform and tag", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [["android", "ios"].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": nextPlatform === item,
								onClick: () => setNextPlatform(item),
								className: cn("h-11 rounded-sm px-3 text-sm", nextPlatform === item ? "bg-primary text-primary-foreground" : "bg-muted"),
								children: item === "android" ? "Android" : "iOS"
							}, item)), TAGS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"aria-pressed": tag === item,
								onClick: () => setTag(item),
								className: cn("h-11 rounded-sm px-3 text-sm", tag === item ? "bg-primary text-primary-foreground" : "bg-muted"),
								children: tagLabel(item)
							}, item))]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Register device"
						})
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search name, user, city",
					"aria-label": "Search devices"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: [
						"all",
						"android",
						"ios"
					].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-pressed": platform === item,
						onClick: () => setPlatform(item),
						className: cn("h-11 rounded-sm px-3 text-sm font-medium", platform === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"),
						children: item === "all" ? "All" : item === "android" ? "Android" : "iOS"
					}, item))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground",
					children: "No devices match that filter."
				}) : rows.map((device) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: device.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate font-mono text-xs text-muted-foreground",
								children: [
									device.userId,
									" · ",
									device.city,
									device.pushToken ? ` · token ${device.pushToken.slice(-8)}` : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("text-xs font-medium", device.status === "active" ? "text-ok" : "text-danger"),
							children: device.status === "active" ? "Active" : "Unregistered"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2 pt-3 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-muted px-2 py-1",
								children: device.platform === "android" ? "Android" : "iOS"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-muted px-2 py-1",
								children: tagLabel(device.tag)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "tabular-nums",
								children: formatWhen(device.lastSeen)
							}),
							device.status === "active" && canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "ml-auto h-11 rounded-sm px-2 text-xs font-medium text-danger hover:bg-danger-bg",
								onClick: () => {
									(async () => {
										const error = await unregister(device.id);
										if (error) toast.error(error);
										else toast("Token marked unregistered. MAU −1.");
									})();
								},
								children: "Drop token"
							}) : null
						]
					})]
				}, device.id))
			})
		]
	});
}
function EnterpriseOnboard() {
	const name = usePush((s) => s.businessName);
	const plan = usePush((s) => s.plan);
	const acceptTerms = usePush((s) => s.acceptTerms);
	const rate = PLAN_RATES[plan];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Enterprise onboarding"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-pretty text-muted-foreground",
				children: [
					name,
					" is registered on ",
					rate.name,
					". Billing starts after you accept. The monthly base covers the included MAU. Extra monthly active devices are pay per use at the plan rate. The system owner issues the bill. No card is charged on this screen."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
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
						children: [
							"base per month · ",
							formatCount(rate.includedMau),
							" MAU included"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-3 text-sm",
						children: [
							"Then ",
							formatInr(rate.overagePaise),
							" for each extra MAU."
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => {
					(async () => {
						const error = await acceptTerms();
						if (error) toast.error(error);
						else toast.success("Pay-per-use is on. You can connect tokens.");
					})();
				},
				children: "Accept and open the workspace"
			})
		]
	});
}
function OnboardView() {
	const load = usePush((s) => s.load);
	const [name, setName] = (0, import_react.useState)("");
	const [plan, setPlan] = (0, import_react.useState)("free");
	const [busy, setBusy] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mx-auto flex max-w-lg flex-col gap-4",
		onSubmit: (event) => {
			event.preventDefault();
			setBusy(true);
			(async () => {
				try {
					await completeRegistration({ data: {
						businessName: name,
						plan
					} });
					await load();
				} catch (error) {
					toast.error(error instanceof Error ? error.message : "Could not open the workspace.");
					setBusy(false);
				}
			})();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Open your workspace"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Your sign-in is not on a team yet. Name the business and choose Free, Basic, or Advance."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex flex-col gap-1 text-sm font-medium",
				children: ["Business name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: name,
					onChange: (e) => setName(e.target.value),
					required: true
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: [
					"free",
					"basic",
					"advance"
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-pressed": plan === item,
					onClick: () => setPlan(item),
					className: cn("h-11 rounded-sm px-3 text-sm font-medium", plan === item ? "bg-primary text-primary-foreground" : "bg-muted"),
					children: item === "free" ? "Free" : item === "basic" ? "Basic" : "Advance"
				}, item))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "submit",
				disabled: busy,
				children: busy ? "Opening…" : "Create workspace"
			})
		]
	});
}
var INCLUDED = [
	"Android and iOS",
	"API send and broadcast",
	"Platform and tag audience",
	"Dead-token cleanup",
	"30-day delivery log"
];
var LOCKED = [
	"Web push",
	"Journeys",
	"A/B tests",
	"Webhooks and export",
	"12-month retention"
];
function PlanView() {
	const mau = usePush((s) => s.mau);
	const cap = usePush((s) => s.mauCap);
	const plan = usePush((s) => s.plan);
	const canEdit = usePush((s) => s.rights.includes("plan_edit"));
	const overCap = usePush((s) => s.overCap);
	const setOverCap = usePush((s) => s.setOverCap);
	const changePlan = usePush((s) => s.changePlan);
	const campaigns = usePush((s) => s.campaigns);
	const reset = usePush((s) => s.reset);
	const billing = usePush((s) => s.billing);
	const businessId = usePush((s) => s.businessId);
	const invoices = usePush((s) => s.invoices);
	const billingState = usePush((s) => s.billingState);
	const shown = overCap ? cap : mau;
	const pct = Math.min(100, Math.round(shown / cap * 100));
	const data = chartSeries(campaigns);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Plan"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "pt-1 text-sm text-muted-foreground",
				children: [
					planLabel(plan),
					" includes ",
					formatCount(cap),
					" MAU.",
					plan === "free" ? " There is no charge and no overage." : " Extra MAU is pay per use. Stripe or Skydo can confirm the plan."
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium text-muted-foreground",
						children: "Mobile MAU this month"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-2 font-display text-5xl font-medium tabular-nums tracking-tight",
						children: [formatCount(shown), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-2xl text-muted-foreground",
							children: [" / ", formatCount(cap)]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 h-2 overflow-hidden rounded-sm bg-muted",
						role: "meter",
						"aria-valuenow": shown,
						"aria-valuemin": 0,
						"aria-valuemax": cap,
						"aria-label": "MAU used",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: cn("h-full w-full origin-left bg-primary", overCap && "bg-danger"),
							style: { transform: `scaleX(${pct / 100})` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-3 text-sm text-muted-foreground",
						children: overCap ? "Cap preview is on. Sends are paused, the way a live Basic workspace behaves at 10,000 MAU." : `${formatCount(cap - mau)} MAU left before sends pause.`
					}),
					billingState === "past_due" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-3 text-sm text-danger",
						children: "A Stripe or Skydo payment failed. Sends stay paused until the next settled payment."
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 pt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: overCap ? "default" : "outline",
								onClick: () => void setOverCap(!overCap),
								children: overCap ? "Clear cap preview" : "Preview the cap"
							}),
							canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => void changePlan(nextPlan(plan)),
								children: ["Move to ", planLabel(nextPlan(plan))]
							}) : null,
							canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => void reset(),
								children: "Reset sample"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {})
						]
					})
				]
			}),
			billing === "pay_per_use" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Pay per use this period"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2 font-display text-4xl font-medium tabular-nums",
						children: formatInr(quoteUsage(plan, mau).totalPaise)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-1 text-sm text-muted-foreground",
						children: quoteUsage(plan, mau).extra > 0 ? `${formatCount(quoteUsage(plan, mau).extra)} MAU above the included ${formatCount(cap)}, at the ${planLabel(plan)} rate.` : "Usage is inside the included MAU. The bill is the plan base until the system owner issues it."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2 pt-3",
						children: invoices.filter((item) => item.businessId === businessId).map((invoice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm",
							children: [
								invoice.periodLabel,
								" · ",
								formatInr(invoice.totalPaise),
								" issued"
							]
						}, invoice.id))
					})
				]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Delivered, last 14 days"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-48 pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data,
							barCategoryGap: "28%",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "label",
									tick: {
										fill: "var(--color-muted-foreground)",
										fontSize: 11
									},
									axisLine: false,
									tickLine: false,
									interval: 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { hide: true }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									cursor: { fill: "var(--color-muted)" },
									contentStyle: {
										background: "var(--color-card)",
										border: "1px solid var(--color-border)",
										borderRadius: "8px",
										fontSize: "12px"
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "sent",
									fill: "var(--color-primary)",
									radius: [
										4,
										4,
										0,
										0
									]
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "On Basic"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "pt-3 text-sm text-muted-foreground",
						children: INCLUDED.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-t border-border py-2 first:border-t-0",
							children: item
						}, item))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Advance, not on this plan"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "pt-3 text-sm text-subtle",
						children: LOCKED.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "border-t border-border py-2 first:border-t-0",
							children: item
						}, item))
					})]
				})]
			})
		]
	});
}
var CHOICES = [
	{
		id: "all",
		audience: { kind: "all" },
		label: "All users"
	},
	{
		id: "android",
		audience: {
			kind: "platform",
			platform: "android"
		},
		label: "Android"
	},
	{
		id: "ios",
		audience: {
			kind: "platform",
			platform: "ios"
		},
		label: "iOS"
	},
	...TAGS.map((tag) => ({
		id: tag,
		audience: {
			kind: "tag",
			tag
		},
		label: tagLabel(tag)
	}))
];
var EMPTY = {
	channel: "push",
	qualification: "past",
	layout: "lock",
	audience: {
		kind: "tag",
		tag: "orders"
	},
	title: "Rider is nearby",
	body: "Ananya is 4 minutes away with your order.",
	link: "metrobites://order/4821",
	image: "",
	video: "",
	button: "Allow",
	delivery: "now",
	ttlHours: 24,
	delaySeconds: 0,
	quietHours: true,
	goal: "Order opened"
};
function SendView() {
	const reach = usePush((s) => s.reach);
	const subscribers = usePush((s) => s.subscribers);
	const plan = usePush((s) => s.plan);
	const logo = usePush((s) => s.logo);
	const appName = usePush((s) => s.businessName);
	const send = usePush((s) => s.send);
	const [draft, setDraft] = (0, import_react.useState)(EMPTY);
	const [step, setStep] = (0, import_react.useState)("Start");
	const [choice, setChoice] = (0, import_react.useState)("orders");
	const [preview, setPreview] = (0, import_react.useState)("ios");
	const [pulse, setPulse] = (0, import_react.useState)(0);
	const [sending, setSending] = (0, import_react.useState)(false);
	const devices = subscribers.map((device) => ({
		platform: device.platform,
		tag: device.tag,
		status: device.status,
		pushToken: device.pushToken
	}));
	const reviewed = reviewCampaign({
		draft,
		reach,
		devices,
		plan
	});
	const tokens = tokenCounts(devices, draft.audience);
	const index = STEPS.indexOf(step);
	function patch(next) {
		setDraft((current) => ({
			...current,
			...next
		}));
	}
	function go(next) {
		const problem = reviewCampaign({
			draft,
			reach,
			devices,
			plan
		}).error;
		if ((step === "What" || step === "When" || next === "Publish" || next === "When") && problem && STEPS.indexOf(next) > index) {
			toast.error(problem);
			return;
		}
		setStep(next);
	}
	async function onSubmit(event) {
		event.preventDefault();
		if (step !== "Publish") {
			const next = STEPS[index + 1];
			if (next) go(next);
			return;
		}
		if (reviewed.error || sending) {
			if (reviewed.error) toast.error(reviewed.error);
			return;
		}
		setSending(true);
		const error = await send(draft);
		setSending(false);
		if (error) {
			toast.error(error);
			return;
		}
		setPulse((n) => n + 1);
		toast.success(stateLabel(reviewed.state));
	}
	const surface = draft.channel === "push" ? "lock" : draft.layout;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8 lg:flex-row lg:items-start",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit,
			className: "order-2 flex min-w-0 flex-1 flex-col gap-5 lg:order-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "Campaign"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-1 text-sm text-pretty text-muted-foreground",
					children: "Push reaches the lock screen through FCM and APNs. In-app shows inside the open app, including the permission primer."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 overflow-x-auto",
					role: "tablist",
					"aria-label": "Campaign steps",
					children: STEPS.map((name, item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "tab",
						"aria-selected": step === name,
						onClick: () => go(name),
						className: cn("h-11 shrink-0 rounded-sm px-3 text-sm font-medium", step === name ? "bg-primary text-primary-foreground" : "bg-muted"),
						children: [
							item + 1,
							". ",
							name
						]
					}, name))
				}),
				step === "Start" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "pb-2 text-sm font-medium",
							children: "Channel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-2 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								on: draft.channel === "push",
								label: "Push",
								detail: "Lock screen · FCM and APNs",
								onClick: () => patch({
									channel: "push",
									layout: "lock"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								on: draft.channel === "inapp",
								label: "In-app",
								detail: "Shown while the app is open",
								onClick: () => patch({
									channel: "inapp",
									layout: draft.layout === "lock" ? "banner" : draft.layout
								})
							})]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "pb-2 text-sm font-medium",
							children: "Who qualifies"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
									on: draft.qualification === "past",
									label: "Past behavior",
									detail: "",
									onClick: () => patch({ qualification: "past" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
									on: draft.qualification === "live",
									label: "Live behavior",
									detail: "",
									onClick: () => patch({
										qualification: "live",
										delivery: "now"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
									on: draft.qualification === "external",
									label: "External trigger",
									detail: "",
									onClick: () => patch({
										qualification: "external",
										delivery: "now"
									})
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card p-4 text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: "iOS and Android setup"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
									className: "list-decimal space-y-1 pt-2 pl-4 text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Ask with an in-app primer before the system permission." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Save the APNs or FCM token on the device." }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Address the campaign to those tokens, with a deep link and rich media." })
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "pt-3 tabular-nums text-muted-foreground",
									children: [
										"APNs tokens ",
										formatCount(tokens.ios),
										" · FCM tokens ",
										formatCount(tokens.android),
										" · Waiting on permission ",
										formatCount(tokens.waiting)
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: ["Goal", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.goal,
								maxLength: 80,
								onChange: (e) => patch({ goal: e.target.value }),
								placeholder: "Optional conversion, such as Order opened"
							})]
						})
					]
				}) : null,
				step === "Who" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
						className: "pb-2 text-sm font-medium",
						children: "Audience"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: CHOICES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": choice === item.id,
							onClick: () => {
								setChoice(item.id);
								patch({ audience: item.audience });
								if (item.audience.kind === "platform") setPreview(item.audience.platform);
							},
							className: cn("h-10 rounded-sm px-3 text-sm font-medium", choice === item.id ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: item.label
						}, item.id))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "pt-3 text-sm tabular-nums text-muted-foreground",
						children: [
							"Estimated reach ",
							formatCount(draft.layout === "primer" ? tokens.waiting : audienceSize(reach, draft.audience)),
							" · ",
							audienceLabel(draft.audience)
						]
					}),
					reviewed.error && (draft.layout === "primer" || audienceSize(reach, draft.audience) === 0) ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "pt-2 text-sm text-danger",
						children: reviewed.error
					}) : null
				] }) : null,
				step === "What" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-4",
					children: [
						draft.channel === "inapp" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "pb-2 text-sm font-medium",
							children: "Layout"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
									on: draft.layout === "banner",
									label: "Banner",
									detail: "",
									onClick: () => patch({ layout: "banner" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
									on: draft.layout === "modal",
									label: "Modal",
									detail: "",
									onClick: () => patch({ layout: "modal" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
									on: draft.layout === "primer",
									label: "Push primer",
									detail: "",
									onClick: () => patch({ layout: "primer" })
								})
							]
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "One message on the lock screen. Title, body, image, and a deep link."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: [
								"Title",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.title,
									maxLength: 65,
									onChange: (e) => patch({ title: e.target.value })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-normal tabular-nums text-muted-foreground",
									children: [draft.title.length, "/65"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: [
								"Message",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: draft.body,
									maxLength: 180,
									onChange: (e) => patch({ body: e.target.value })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-normal tabular-nums text-muted-foreground",
									children: [draft.body.length, "/180"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: ["Deep link", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.link,
								onChange: (e) => patch({ link: e.target.value }),
								placeholder: "app://order/4821"
							})]
						}),
						draft.layout === "primer" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: ["Button", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.button,
								maxLength: 24,
								onChange: (e) => patch({ button: e.target.value })
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: [
								"Image",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: draft.image.startsWith("data:") ? "" : draft.image,
									onChange: (e) => patch({ image: e.target.value }),
									placeholder: "https:// image"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "file",
									accept: "image/png,image/jpeg,image/webp,image/gif",
									className: "text-sm text-muted-foreground",
									onChange: (event) => {
										const file = event.target.files?.[0];
										if (!file) return;
										if (file.size > 12e4) {
											toast.error("Image must be under 120 KB.");
											return;
										}
										const reader = new FileReader();
										reader.onload = () => patch({ image: typeof reader.result === "string" ? reader.result : "" });
										reader.readAsDataURL(file);
									}
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: ["Video", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: draft.video,
								disabled: plan !== "advance" || draft.layout === "primer",
								onChange: (e) => patch({ video: e.target.value }),
								placeholder: plan === "advance" ? "https:// video" : "Video is on Advance"
							})]
						})
					]
				}) : null,
				step === "When" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex flex-col gap-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "pb-2 text-sm font-medium",
							children: "Delivery"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								on: draft.delivery === "now",
								label: "Now",
								detail: "",
								onClick: () => patch({ delivery: "now" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								on: draft.delivery === "later",
								label: "Later",
								detail: "",
								onClick: () => patch({
									delivery: "later",
									qualification: draft.qualification === "past" ? "past" : "past"
								})
							})]
						})] }),
						draft.channel === "push" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: ["Time to live, hours", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 1,
								max: 72,
								value: draft.ttlHours,
								onChange: (e) => patch({ ttlHours: Number(e.target.value) })
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex flex-col gap-1 text-sm font-medium",
							children: ["Delay after the trigger, seconds", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "number",
								min: 0,
								max: 1200,
								value: draft.delaySeconds,
								onChange: (e) => patch({ delaySeconds: Number(e.target.value) })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm font-medium",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: draft.quietHours,
								onChange: (e) => patch({ quietHours: e.target.checked })
							}), "Quiet hours, 9pm to 9am"]
						}),
						reviewed.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: reviewed.error
						}) : null
					]
				}) : null,
				step === "Publish" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-xl border border-border bg-card p-4 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: "Summary"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
							className: "pt-2 text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									draft.channel === "push" ? "Push" : "In-app",
									" · ",
									draft.qualification === "past" ? "Past behavior" : draft.qualification === "live" ? "Live behavior" : "External trigger"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									audienceLabel(draft.audience),
									" · ",
									formatCount(reviewed.targeted),
									" reachable"
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									draft.delivery === "now" ? "Send now" : "Schedule",
									" · ",
									stateLabel(reviewed.state)
								] }),
								draft.channel === "push" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"TTL ",
									draft.ttlHours,
									" hours · APNs ",
									formatCount(tokens.ios),
									" · FCM ",
									formatCount(tokens.android)
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
									"Delay ",
									draft.delaySeconds,
									"s · ",
									draft.layout
								] }),
								draft.goal ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Goal · ", draft.goal] }) : null
							]
						}),
						reviewed.error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "pt-3 text-danger",
							children: reviewed.error
						}) : null
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [index > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => setStep(STEPS[index - 1] ?? "Start"),
						children: "Back"
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: sending || step === "Publish" && Boolean(reviewed.error),
						children: sending ? "Publishing…" : step === "Publish" ? "Publish campaign" : "Continue"
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "order-1 lg:sticky lg:top-24 lg:order-2 lg:w-64 lg:shrink-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {
				platform: preview,
				title: draft.title,
				body: draft.body,
				link: draft.link,
				image: draft.image,
				video: plan === "advance" ? draft.video : "",
				appName,
				logo,
				pulse,
				surface: surface === "lock" ? "lock" : surface,
				button: draft.button,
				onPlatform: setPreview
			})
		})]
	});
}
function Choice({ on, label, detail, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"aria-pressed": on,
		onClick,
		className: cn("rounded-xl border px-3 py-3 text-left", on ? "border-primary bg-card" : "border-border bg-card"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: label
		}), detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "pt-1 text-xs text-muted-foreground",
			children: detail
		}) : null]
	});
}
function SystemView() {
	const businesses = usePush((s) => s.businesses);
	const seats = usePush((s) => s.seats);
	const addBusiness = usePush((s) => s.addBusiness);
	const changeBusinessPlan = usePush((s) => s.changeBusinessPlan);
	const setGrants = usePush((s) => s.setGrants);
	const [businessName, setBusinessName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [plan, setPlan] = (0, import_react.useState)("basic");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl font-medium tracking-tight",
					children: "System"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pt-1 text-sm text-muted-foreground",
					children: "Add a business user, then grant SDK, webhook, and test-run rights. Enterprise registration and pay-per-use bills are in the system owner panel."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/admin",
					className: "mt-3 inline-block text-sm font-medium underline",
					children: "Open the owner panel"
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
				onSubmit: (event) => {
					event.preventDefault();
					(async () => {
						const error = await addBusiness({
							businessName,
							email,
							plan
						});
						if (error) toast.error(error);
						else {
							toast.success("Business user saved.");
							setBusinessName("");
							setEmail("");
						}
					})();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Business name", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: businessName,
							onChange: (e) => setBusinessName(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Owner email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex gap-2",
						children: [
							"free",
							"basic",
							"advance"
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": plan === item,
							onClick: () => setPlan(item),
							className: cn("h-11 rounded-sm px-3 text-sm font-medium", plan === item ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: planLabel(item)
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Add business user"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "flex flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Workspaces"
					}),
					businesses.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "No business has registered yet."
					}) : null,
					businesses.map((business) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [business.logo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: business.logo,
									alt: "",
									className: "size-10 rounded-sm object-cover"
								}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: business.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										business.ownerEmail || "Owner pending",
										" · ",
										planLabel(business.plan)
									]
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
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
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-2",
							"aria-label": `Grants for ${business.name}`,
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
					}, business.id))
				]
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
							" · ",
							seat.email,
							" · ",
							planLabel(seat.plan)
						]
					})]
				}, seat.id))]
			}) : null
		]
	});
}
function TeamView() {
	const members = usePush((s) => s.members);
	const invite = usePush((s) => s.invite);
	const changeRole = usePush((s) => s.changeRole);
	const removeTeammate = usePush((s) => s.removeTeammate);
	const [email, setEmail] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("marketer");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl font-medium tracking-tight",
				children: "Team"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "pt-1 text-sm text-muted-foreground",
				children: "Invite by email. They join with that address when they register or sign in. You choose the role."
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-3 rounded-xl border border-border bg-card p-4",
				onSubmit: (event) => {
					event.preventDefault();
					(async () => {
						const error = await invite({
							email,
							role
						});
						if (error) toast.error(error);
						else {
							toast.success("Team seat saved.");
							setEmail("");
						}
					})();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1 text-sm font-medium",
						children: ["Email", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							placeholder: "ops@company.com",
							required: true
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: ROLES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-pressed": role === item,
							onClick: () => setRole(item),
							className: cn("h-11 rounded-sm px-3 text-sm font-medium", role === item ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: ROLE_LABEL[item]
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Add to team"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col gap-2",
				children: members.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-xl border border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: member.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: member.email
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium text-muted-foreground",
							children: member.pending ? "Waiting to register" : "Active"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2 pt-3",
						children: [ROLES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							disabled: member.pending,
							"aria-pressed": member.role === item,
							onClick: () => {
								(async () => {
									const error = await changeRole({
										id: member.id,
										role: item
									});
									if (error) toast.error(error);
								})();
							},
							className: cn("h-10 rounded-sm px-3 text-xs font-medium disabled:opacity-40", member.role === item ? "bg-primary text-primary-foreground" : "bg-muted"),
							children: ROLE_LABEL[item]
						}, item)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "h-10 rounded-sm px-3 text-xs font-medium text-danger hover:bg-danger-bg",
							onClick: () => {
								(async () => {
									const error = await removeTeammate(member.id);
									if (error) toast.error(error);
								})();
							},
							children: "Remove"
						})]
					})]
				}, member.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "overflow-x-auto rounded-xl border border-border bg-card p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: "Rights"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "mt-3 w-full min-w-[36rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: "Function"
						}), ROLES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: ROLE_LABEL[item]
						}, item))]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: RIGHT_ROWS.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 pr-3",
							children: row.label
						}), ROLES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-2 text-muted-foreground",
							children: RIGHTS[item].includes(row.id) ? "Yes" : "—"
						}, item))]
					}, row.id)) })]
				})]
			})
		]
	});
}
var NAV = [
	{
		id: "send",
		label: "Campaigns",
		right: "send"
	},
	{
		id: "devices",
		label: "Devices",
		right: "devices"
	},
	{
		id: "activity",
		label: "Activity",
		right: "activity"
	},
	{
		id: "plan",
		label: "Plan",
		right: "plan"
	},
	{
		id: "team",
		label: "Team",
		right: "team"
	},
	{
		id: "connect",
		label: "Connect",
		right: "connect"
	},
	{
		id: "brand",
		label: "Brand",
		right: "brand"
	}
];
function Shell() {
	const ready = usePush((s) => s.ready);
	const loadError = usePush((s) => s.loadError);
	const load = usePush((s) => s.load);
	const rights = usePush((s) => s.rights);
	const role = usePush((s) => s.role);
	const isSystemAdmin = usePush((s) => s.isSystemAdmin);
	const businessId = usePush((s) => s.businessId);
	const businessName = usePush((s) => s.businessName);
	const plan = usePush((s) => s.plan);
	const mau = usePush((s) => s.mau);
	const mauCap = usePush((s) => s.mauCap);
	const overCap = usePush((s) => s.overCap);
	const kind = usePush((s) => s.kind);
	const onboarded = usePush((s) => s.onboarded);
	const [view, setView] = (0, import_react.useState)("send");
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const items = [...NAV.filter((item) => rights.includes(item.right)), ...isSystemAdmin ? [{
		id: "system",
		label: "System"
	}] : []];
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		if (items.some((item) => item.id === view)) return;
		const next = items[0]?.id;
		if (next) setView(next);
	}, [
		ready,
		view,
		rights,
		isSystemAdmin,
		items
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, { position: "top-center" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-border bg-card px-4 py-6 lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl font-medium tracking-tight",
						children: "Nock"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate pt-1 text-sm text-muted-foreground",
						children: businessName || "Workspace"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-8 flex flex-col gap-1",
						"aria-label": "Sections",
						children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-current": view === item.id ? "page" : void 0,
							onClick: () => setView(item.id),
							className: cn("h-11 rounded-sm px-3 text-left text-sm font-medium", view === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"),
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-auto pt-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:pl-56",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-xl font-medium leading-none lg:hidden",
							children: "Nock"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-sm text-muted-foreground",
							children: [
								businessName || "Workspace",
								role ? ` · ${ROLE_LABEL[role]}` : "",
								plan && businessId ? ` · ${planLabel(plan)}` : ""
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [
							businessId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: cn("text-sm tabular-nums", overCap ? "text-danger" : "text-foreground"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: formatCount(overCap ? mauCap : mau)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: [
										" / ",
										formatCount(mauCap),
										" MAU"
									]
								})]
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "lg:hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})
							}),
							isSystemAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "/admin",
								className: "text-sm font-medium underline",
								children: "Owner panel"
							}) : null
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "mx-auto max-w-5xl px-4 py-6 pb-28 lg:pb-10",
					children: [
						!ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-3xl font-medium",
							children: "Nock"
						}) : null,
						ready && loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-danger",
							children: loadError
						}) : null,
						ready && !loadError && !businessId && view !== "system" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardView, {}) : null,
						ready && !loadError && businessId && kind === "enterprise" && !onboarded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EnterpriseOnboard, {}) : null,
						ready && !loadError && businessId && onboarded && view === "send" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SendView, {}) : null,
						ready && !loadError && businessId && onboarded && view === "devices" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DevicesView, {}) : null,
						ready && !loadError && businessId && onboarded && view === "activity" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivityView, {}) : null,
						ready && !loadError && businessId && onboarded && view === "plan" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanView, {}) : null,
						ready && !loadError && businessId && onboarded && view === "team" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TeamView, {}) : null,
						ready && !loadError && businessId && onboarded && view === "connect" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConnectView, {}) : null,
						ready && !loadError && businessId && onboarded && view === "brand" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandView, {}) : null,
						ready && !loadError && view === "system" && isSystemAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SystemView, {}) : null
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card lg:hidden",
				"aria-label": "Sections",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex overflow-x-auto",
					children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "min-w-20 flex-1",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-current": view === item.id ? "page" : void 0,
							onClick: () => setView(item.id),
							className: cn("h-16 w-full text-sm font-medium", view === item.id ? "text-foreground" : "text-muted-foreground"),
							children: item.label
						})
					}, item.id))
				})
			})
		]
	});
}
function Home() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center bg-background text-foreground",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-4xl font-medium",
			children: "Nock"
		})
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, {});
}
//#endregion
export { Home as component };
