/// <reference path="../../node_modules/@cloudflare/workers-types/latest/index.d.ts" />

export default {
	async fetch(request, env) {
		return new Response(`Running in ${navigator.userAgent}!`);
	}
} satisfies ExportedHandler;
