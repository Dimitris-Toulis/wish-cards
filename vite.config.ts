import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));
export default defineConfig({
	plugins: [cloudflare()],
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
