//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-DVMXR3ww.js
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
		preloads: ["/assets/index-BObOiDjg.js", "/assets/react-SIfiwpqq.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-BObOiDjg.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-BPkq3-jG.js",
			"/assets/account-fns-BT4tEjwP.js",
			"/assets/gates-B-A8fSvh.js"
		]
	},
	"/admin": {
		filePath: "/workspace/src/routes/admin.tsx",
		children: void 0,
		preloads: [
			"/assets/admin-DMdHH-3e.js",
			"/assets/account-fns-BT4tEjwP.js",
			"/assets/gates-B-A8fSvh.js",
			"/assets/email-session-DIlUXca6.js"
		]
	},
	"/login": {
		filePath: "/workspace/src/routes/login.tsx",
		children: void 0,
		preloads: [
			"/assets/login-CVbhdfez.js",
			"/assets/account-fns-BT4tEjwP.js",
			"/assets/client-C85fcJ4s.js",
			"/assets/email-session-DIlUXca6.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
