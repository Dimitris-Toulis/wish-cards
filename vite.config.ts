import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
	plugins: [
		cloudflare(),
		{
			name: "vite-plugin-cloudflare-headers",
			apply: "build",
			generateBundle(_, bundle) {
				const particlesFile = Object.keys(bundle).filter((x) =>
					x.includes("assets/tsparticles")
				)[0];
				if (particlesFile) {
					const outPath = resolve(__dirname, "dist/client/_headers");
					writeFileSync(
						outPath,
						`/v\n  Link: </${particlesFile}>; rel=preload; as=script; crossorigin`
					);
				}
			}
		}
	],
	environments: {
		client: {
			build: {
				rollupOptions: {
					input: {
						main: resolve(__dirname, "index.html"),
						create: resolve(__dirname, "create.html"),
						view: resolve(__dirname, "v.html")
					},
					output: {
						manualChunks(id) {
							if (id.includes("@tsparticles")) return "tsparticles";
						}
					}
				}
			}
		}
	}
});
