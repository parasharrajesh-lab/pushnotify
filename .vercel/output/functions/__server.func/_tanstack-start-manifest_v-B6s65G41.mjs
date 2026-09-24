//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-B6s65G41.js
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
		preloads: ["/assets/index-DtKjVKza.js", "/assets/react-SIfiwpqq.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-DtKjVKza.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-PM9THI5U.js",
			"/assets/account-fns-B75YeEKk.js",
			"/assets/gates-DmVJtIoT.js"
		]
	},
	"/admin": {
		filePath: "/workspace/src/routes/admin.tsx",
		children: void 0,
		preloads: [
			"/assets/admin-ndru6vkC.js",
			"/assets/account-fns-B75YeEKk.js",
			"/assets/gates-DmVJtIoT.js",
			"/assets/email-session-DIlUXca6.js"
		]
	},
	"/login": {
		filePath: "/workspace/src/routes/login.tsx",
		children: void 0,
		preloads: [
			"/assets/login-DXgFojhV.js",
			"/assets/account-fns-B75YeEKk.js",
			"/assets/client-C85fcJ4s.js",
			"/assets/email-session-DIlUXca6.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
