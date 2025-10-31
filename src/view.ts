import "./styles/view.css";
import type { Config } from "./workers/main";
/*{
	wish: "Happy birthday!",
	message: "Have a nice birthday!",
	bgColor: "#00f0ff",
	wishColor: "#ff0000",
	effects: [
		{ name: "confetti", onOpen: false, amount: 15000 },
		{ name: "fireworks", onOpen: false, sound: true },
		{ name: "balloons", onOpen: false, amount: 30 }
	]
};*/

async function loadConfig(): Promise<Config> {
	const urlParams = new URLSearchParams(window.location.search);
	const urlConfig = urlParams.get("config");
	if (urlConfig) return JSON.parse(decodeURIComponent(urlConfig));
	else {
		let params = Array.from(urlParams.entries());
		if (params.length == 1) {
			const id = params[0][0];
			const data: { error: any } | { config: Config } = await (
				await fetch(`/api/card?id=${id}`)
			).json();
			if ("error" in data) {
				return {
					wish: "There was an error fetching the card",
					message: data.error.message,
					bgColor: "#ffffff",
					wishColor: "#000000",
					effects: []
				};
			} else {
				return data.config;
			}
		} else {
			return {
				wish: "Invalid URL",
				bgColor: "#ffffff",
				wishColor: "#000000",
				effects: []
			};
		}
	}
}

const configPromise = loadConfig();

const EFFECTS = {
	confetti: {
		btnText: "Confetti!",
		script: "confetti"
	},
	fireworks: {
		btnText: "Fireworks!",
		script: "fireworks"
	},
	balloons: {
		btnText: "Balloons!",
		script: "balloons"
	}
};

async function loadEffect(name: keyof typeof EFFECTS) {
	const module: { effect: (options?: any) => Promise<void> } = await import(
		`./effects/${EFFECTS[name].script}.ts`
	);
	return module.effect;
}

function textColorBasedOnBackground(bgColor: string) {
	const r = parseInt(bgColor.substring(1, 3), 16) / 255;
	const g = parseInt(bgColor.substring(3, 5), 16) / 255;
	const b = parseInt(bgColor.substring(5, 7), 16) / 255;

	const x = [r, g, b].map((i) =>
		i <= 0.04045 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4)
	);

	const L = 0.2126 * x[0] + 0.7152 * x[1] + 0.0722 * x[2];
	return L > 0.179 ? "#000" : "#fff";
}

document.addEventListener("DOMContentLoaded", async () => {
	const config = await configPromise;

	const wishElement = document.getElementById("wish")!;
	wishElement.textContent = config.wish;
	if (config.wish.length > 30)
		wishElement.style.setProperty("--font-scale", "0.75");

	document.title = config.wish;
	if (config.message) {
		document.getElementById("message")!.textContent = config.message;
		document.getElementById("message")!.style.color =
			textColorBasedOnBackground(config.bgColor);
	} else {
		document.getElementById("message")!.remove();
	}
	document.body.style.backgroundColor = config.bgColor;
	if (config.wishColor == "rainbow") {
		wishElement.style.animation = "wish-rainbow 1s linear infinite";
		wishElement.style.color = "#e74b1a";
	} else {
		wishElement.style.color = config.wishColor;
	}

	const reducedMotion =
		window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

	const effects = await Promise.allSettled(
		config.effects.map(async (opts) => {
			const { name, onOpen } = opts;
			if (Object.hasOwn(EFFECTS, name)) {
				const effect = await loadEffect(name as keyof typeof EFFECTS);
				if (onOpen && !reducedMotion) effect(opts);
				return () => effect(opts);
			} else {
				return Promise.reject(null);
			}
		})
	);

	for (let i = 0; i < effects.length; i++) {
		const effectResult = effects[i];
		if (effectResult.status == "rejected") continue;

		const effectBtn = document.createElement("button");
		effectBtn.classList.add("effect");
		effectBtn.textContent =
			EFFECTS[config.effects[i].name as keyof typeof EFFECTS].btnText;
		effectBtn.addEventListener("click", () => effectResult.value());
		document.getElementById("effects")?.appendChild(effectBtn);
	}
});
