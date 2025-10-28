/// <reference path="../../node_modules/@cloudflare/workers-types/latest/index.d.ts" />
import * as z from "zod";
import { nanoid } from "nanoid";

const hexColorSchema = z
	.string()
	.regex(
		/^#[0-9A-Fa-f]{6}$/,
		"Invalid hex color (must be 6 hex digits, no alpha)"
	);

const cardConfig = z
	.object({
		wish: z.string().max(100).min(1),
		message: z
			.string()
			.max(250)
			.transform((val) => (val === "" ? undefined : val))
			.optional(),
		wishColor: hexColorSchema.or(z.literal("rainbow")),
		bgColor: hexColorSchema,
		effects: z
			.array(
				z.discriminatedUnion("name", [
					z.object({
						name: z.literal("confetti"),
						onOpen: z.boolean().default(false),
						amount: z.number().max(3000).min(100).default(1500)
					}),
					z.object({
						name: z.literal("fireworks"),
						onOpen: z.boolean().default(false),
						sound: z.boolean().default(true)
					}),
					z.object({
						name: z.literal("balloons"),
						onOpen: z.boolean().default(false),
						amount: z.number().min(1).max(60).default(30)
					})
				])
			)
			.refine(
				(items) => {
					const types = items.map((item) => item.name);
					return new Set(types).size === types.length;
				},
				{
					message: "Each effect must appear only once"
				}
			)
	})
	.strict();

export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === "/api/create" && request.method == "POST") {
			try {
				const data = await request.json();
				const result = cardConfig.safeParse(data);
				if (!result.success) {
					return new Response(JSON.stringify({ error: result.error }), {
						headers: { "Content-Type": "application/json" },
						status: 400
					});
				} else {
					const config = result.data;
					const key = nanoid(8);
					await env.KV.put(key, JSON.stringify(config), {
						expirationTtl: 7889400 // 3 months
					});
					return new Response(JSON.stringify({ id: key }), {
						headers: { "Content-Type": "application/json" }
					});
				}
			} catch (err) {
				return new Response(JSON.stringify({ error: err }), { status: 400 });
			}
		}

		return new Response("Not Found", { status: 404 });
	}
} satisfies ExportedHandler<{ KV: KVNamespace }>;
