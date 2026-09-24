//#region node_modules/.nitro/vite/services/ssr/assets/_tanstack-start-manifest_v-Beaxo3yu.js
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
		preloads: ["/assets/index-DLm9qbJA.js", "/assets/react-SIfiwpqq.js"],
		scripts: [{ attrs: {
			type: "module",
			async: !0,
			src: "/assets/index-DLm9qbJA.js"
		} }]
	},
	"/": {
		filePath: "/workspace/src/routes/index.tsx",
		children: void 0,
		preloads: [
			"/assets/routes-C7wHNwyW.js",
			"/assets/account-fns-ZNFk3Uwc.js",
			"/assets/gates-CgvXW0NR.js"
		]
	},
	"/admin": {
		filePath: "/workspace/src/routes/admin.tsx",
		children: void 0,
		preloads: [
			"/assets/admin-BzGqH6AT.js",
			"/assets/account-fns-ZNFk3Uwc.js",
			"/assets/gates-CgvXW0NR.js",
			"/assets/email-session-DIlUXca6.js"
		]
	},
	"/login": {
		filePath: "/workspace/src/routes/login.tsx",
		children: void 0,
		preloads: [
			"/assets/login-BZYLz8D1.js",
			"/assets/account-fns-ZNFk3Uwc.js",
			"/assets/client-C85fcJ4s.js",
			"/assets/email-session-DIlUXca6.js"
		]
	}
} });
//#endregion
export { tsrStartManifest };
