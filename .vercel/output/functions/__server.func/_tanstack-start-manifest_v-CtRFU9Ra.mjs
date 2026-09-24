//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-CtRFU9Ra.js
var tsrStartManifest = () => ({ routes: {
	__root__: {
		filePath: "/workspace/src/routes/__root.tsx",
		children: [
			"/",
			"/admin",
			"/login",
			"/api/owner-ready",
			"/api/auth/$",
			"/api/password/reset",
			"/api/webhooks/replay",
			"/api/webhooks/settings",
			"/api/webhooks/skydo",
			"/api/webhooks/stripe"
		],
		preloads: ["/assets/index-CKTvKhQ4.js", "/assets/react-SIfiwpqq.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-CKTvKhQ4.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-CB20H_be.js",
			"/assets/account-fns-CVYP9FqD.js",
			"/assets/gates-DUhjVlAu.js"
		]
	},
	"/admin": {
		filePath: "/workspace/src/routes/admin.tsx",
		children: void 0,
		preloads: [
			"/assets/admin-BcoFVkdV.js",
			"/assets/account-fns-CVYP9FqD.js",
			"/assets/gates-DUhjVlAu.js",
			"/assets/email-session-DIlUXca6.js"
		]
	},
	"/login": {
		filePath: "/workspace/src/routes/login.tsx",
		children: void 0,
		preloads: [
			"/assets/login-B10t10q3.js",
			"/assets/account-fns-CVYP9FqD.js",
			"/assets/client-C85fcJ4s.js",
			"/assets/email-session-DIlUXca6.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
