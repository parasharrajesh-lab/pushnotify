import { b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { g as isRole, h as isPlan, l as checkPushToken } from "./owner-access-DOLxBY6A.mjs";
import { c as isAudience, o as authMiddleware, r as TAGS } from "./push-RHVUTltL.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/account-fns-l6XAJPsf.js
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatCount(n) {
	return new Intl.NumberFormat("en-IN").format(n);
}
function formatWhen(iso) {
	const then = new Date(iso).getTime();
	const delta = Date.now() - then;
	const min = Math.round(delta / 6e4);
	if (min < 1) return "Just now";
	if (min < 60) return `${min}m ago`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.round(hr / 24);
	if (day === 1) return "Yesterday";
	if (day < 14) return `${day}d ago`;
	return new Date(iso).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short"
	});
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-opacity duration-150 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-muted text-foreground hover:opacity-80",
			outline: "border border-border bg-card text-foreground hover:bg-muted",
			ghost: "text-foreground hover:bg-muted"
		},
		size: {
			default: "h-11 rounded-sm px-4 text-sm",
			sm: "h-9 rounded-sm px-3 text-sm",
			icon: "size-11 rounded-sm"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		className: cn(buttonVariants({
			variant,
			size
		}), className),
		type,
		...props
	});
}
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("h-11 w-full rounded-sm border border-border bg-card px-3 text-sm text-foreground", "placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
	if (!image) return "";
	if (image.startsWith("data:image/")) {
		if (!/^data:image\/(png|jpeg|jpg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(image) || image.length > 18e4) throw new Error("Use a PNG, JPEG, WEBP, or GIF under 120 KB.");
		return image;
	}
	let url;
	try {
		url = new URL(image);
	} catch {
		throw new Error("Image must be an https link or a small upload.");
	}
	if (url.protocol !== "https:") throw new Error("Image links must use https.");
	return url.toString();
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
var loadAccount = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("e338c5da8d4e59407e7f8ca5f8237db98428d53f198e62a3e3d64b81d87a1be4"));
var completeRegistration = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input || !isPlan(input.plan)) throw new Error("Choose Free, Basic, or Advance.");
	return {
		businessName: cleanName(input.businessName ?? "", "Business name"),
		plan: input.plan
	};
}).handler(createSsrRpc("be598046bfd5c09c1fb60919bedf47340bd2acc12bf3c5cc2bd2592ce35f442c"));
var sendPush = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
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
		audience: input.audience
	};
}).handler(createSsrRpc("189de9d168ac3b924cb0e8f126fb4903cf128e4d5e6dd17aa8a92c52c0891f61"));
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
}).handler(createSsrRpc("29d9819c5ef26103ba0f2166991269e5094bd0794a7a693c48810c06527bd393"));
var dropDevice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = (id ?? "").trim();
	if (!value) throw new Error("Missing device.");
	return value;
}).handler(createSsrRpc("4e41039d82fa094af5c7e846dfa80a46b758fbc525983fa6c1450a0e45ff0681"));
var setCapPreview = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((on) => Boolean(on)).handler(createSsrRpc("f5394ea229d65620f5bebd9c39e368177dc27e9985caa99356338ea24bb68988"));
var resetWorkspace = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("df7c190e9e1c60745bd9adaad36f69eb5a9fe0091a6f993d9ace1c25aa1c5c13"));
var updateBrand = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	name: cleanName(input?.name ?? "", "Business name"),
	logo: cleanImage(input?.logo ?? "")
})).handler(createSsrRpc("bed11b0809ed8a9c990a705979144d05fdec89c865b8ad950ca9e7a6b83237ae"));
var setOwnPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((plan) => {
	if (!isPlan(plan)) throw new Error("Choose Free, Basic, or Advance.");
	return plan;
}).handler(createSsrRpc("f3a1292298fa23440492ab4c82d59b02fe7df817d2bae528a6d7e23edd66abeb"));
var inviteMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isRole(input?.role)) throw new Error("Choose a role.");
	return {
		email: cleanEmail(input.email ?? ""),
		role: input.role
	};
}).handler(createSsrRpc("66079c67d0af64eb5ec7a4ba89656e49571ba71c3fbf129f8898779e507fc80c"));
var setMemberRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isRole(input?.role)) throw new Error("Choose a role.");
	const id = (input?.id ?? "").trim();
	if (!id) throw new Error("Missing member.");
	return {
		id,
		role: input.role
	};
}).handler(createSsrRpc("00de172fcf2d7e88374caa90a4646f98caaab2cd4392b6ade25ef766a550efa6"));
var removeMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = (id ?? "").trim();
	if (!value) throw new Error("Missing member.");
	return value;
}).handler(createSsrRpc("7b086128cb6642a772c2c34083e89c1b44849b15de5fa972d254da13be0202a7"));
var addBusinessUser = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
	return {
		businessName: cleanName(input.businessName ?? "", "Business name"),
		email: cleanEmail(input.email ?? ""),
		plan: input.plan
	};
}).handler(createSsrRpc("fd31a23d1feee2ab103a0b8ac5deb1a6dbd3c208813fc9f743bee45a2fb44e21"));
var setBusinessPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
	const id = (input?.id ?? "").trim();
	if (!id) throw new Error("Missing business.");
	return {
		id,
		plan: input.plan
	};
}).handler(createSsrRpc("08843f162bf4afa2aeb1dd78b86e6ea264e613fdf2621bf1cf305672b4cdd42e"));
var TARGETS = [
	"android",
	"ios",
	"web"
];
function isTarget(value) {
	return TARGETS.includes(value);
}
var setBusinessGrants = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = (input?.id ?? "").trim();
	if (!id) throw new Error("Missing business.");
	return {
		id,
		sdk: Boolean(input.sdk),
		webhook: Boolean(input.webhook),
		test: Boolean(input.test)
	};
}).handler(createSsrRpc("ad9d0a7140bcfe9543b54f4cd1a5f4b28f641264872484121429e6dfa6eb3476"));
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
}).handler(createSsrRpc("9e73be6c65be06dfccee246ca4c0c4aeb65774348560f66b0270e7a0caa2b90a"));
var removeConnection = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = (id ?? "").trim();
	if (!value) throw new Error("Missing connection.");
	return value;
}).handler(createSsrRpc("025263a4398f7686ad1a3b9438c5581b7e64691e1c44ade746fbee6265ccef87"));
var runTest = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const connectionId = (input?.connectionId ?? "").trim();
	const title = (input?.title ?? "").trim();
	const body = (input?.body ?? "").trim();
	const link = (input?.link ?? "").trim();
	if (!connectionId) throw new Error("Choose a connection.");
	if (!title || title.length > 65) throw new Error("Title is required, up to 65 characters.");
	if (!body || body.length > 180) throw new Error("Message is required, up to 180 characters.");
	if (link.length > 500 || /^(javascript|data|vbscript):/i.test(link)) throw new Error("That deep link is not allowed.");
	return {
		connectionId,
		title,
		body,
		link
	};
}).handler(createSsrRpc("39f5411c550fe32045b3f0523f8d78d7b937333f12ae4cad8f2f8a4e0f86d89a"));
var registerEnterprise = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!isPlan(input?.plan)) throw new Error("Choose Free, Basic, or Advance.");
	return {
		businessName: cleanName(input.businessName ?? "", "Business name"),
		contact: cleanName(input.contact ?? "", "Contact name"),
		email: cleanEmail(input.email ?? ""),
		plan: input.plan
	};
}).handler(createSsrRpc("03c65a8338c966a9dd33e50f367f6a8656c6138fb44217a609865aee6301ad85"));
var acceptEnterprise = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("e5552f434efd11b3617fca09925282a35e007b5a90625715605904f001a128dc"));
var issueInvoice = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((id) => {
	const value = (id ?? "").trim();
	if (!value) throw new Error("Missing business.");
	return value;
}).handler(createSsrRpc("46dce5ca3933ba564633676eb60cf4ffab102aaef92482ff8a97017d798ea755"));
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
}).handler(createSsrRpc("6cd9b078c6b114a7009caec8b27ab039e9317d436d6c6215eaa4c86e40be4e85"));
//#endregion
export { setBusinessPlan as C, updateBrand as D, setOwnPlan as E, setBusinessGrants as S, setMemberRole as T, removeConnection as _, addConnection as a, runTest as b, completeRegistration as c, formatCount as d, formatWhen as f, registerEnterprise as g, loadAccount as h, addBusinessUser as i, connectToken as l, issueInvoice as m, Input as n, addDevice as o, inviteMember as p, acceptEnterprise as r, cn as s, Button as t, dropDevice as u, removeMember as v, setCapPreview as w, sendPush as x, resetWorkspace as y };
