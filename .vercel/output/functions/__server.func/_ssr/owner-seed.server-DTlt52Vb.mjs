import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
import { p as getSql } from "./owner-access-D4e8lj_h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/owner-seed.server-DTlt52Vb.js
/** Server-only. Never import this from a component or other client module. */
var SYSTEM_OWNER = {
	email: "owner@nock.app",
	password: "NockOwner#2026",
	name: "Nock Owner"
};
var owner_seed_server_exports = /* @__PURE__ */ __exportAll({ seedSystemOwner: () => seedSystemOwner });
var pending = null;
function seedSystemOwner() {
	pending ??= run().catch((error) => {
		pending = null;
		throw error;
	});
	return pending;
}
async function run() {
	const { auth } = await import("./server-BWUAkxHl.mjs").then((n) => n.s).then((n) => n.r);
	const sql = await getSql();
	if (!(await sql`select id from "user" where lower(email) = ${SYSTEM_OWNER.email} limit 1`)[0]) await auth.api.signUpEmail({
		body: {
			email: SYSTEM_OWNER.email,
			password: SYSTEM_OWNER.password,
			name: SYSTEM_OWNER.name
		},
		headers: new Headers({ origin: "http://127.0.0.1:8080" })
	});
	const user = await sql`select id from "user" where lower(email) = ${SYSTEM_OWNER.email} limit 1`;
	if (!user[0]) return;
	await sql`insert into platform_admins (user_id) values (${user[0].id}) on conflict (user_id) do nothing`;
	const viewers = await sql`select id from "user" where email like ${"%@viewer.grok.invalid"}`;
	for (const viewer of viewers) await sql`delete from platform_admins where user_id = ${viewer.id}`;
}
//#endregion
export { seedSystemOwner as n, owner_seed_server_exports as t };
