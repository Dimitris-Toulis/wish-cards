import "./styles/main.css";

let config = {
	wish: "Happy birthday!",
	message: "Have a nice birthday!",
	bgColor: "#00f0ff",
	wishColor: "#ff0000",
	effects: [
		{ name: "confetti", onOpen: false },
		{ name: "fireworks", onOpen: false },
		{ name: "balloons", onOpen: false }
	]
};

const urlParams = new URLSearchParams(window.location.search);
const urlConfig = urlParams.get("config");
console.log(urlConfig);
if (urlConfig) config = JSON.parse(decodeURIComponent(urlConfig));

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
	const wishElement = document.getElementById("wish")!;
	wishElement.textContent = config.wish;
	document.getElementById("message")!.textContent = config.message;

	document.body.style.backgroundColor = config.bgColor;
	document.getElementById("message")!.style.color = textColorBasedOnBackground(
		config.bgColor
	);
	if (config.wishColor == "rainbow") {
		wishElement.style.animation = "wish-rainbow 1s linear infinite";
		wishElement.style.color = "#e74b1a";
	} else {
		wishElement.style.color = config.wishColor;
	}

	const effects = await Promise.allSettled(
		config.effects.map(async (opts) => {
			const { name, onOpen } = opts;
			if (Object.hasOwn(EFFECTS, name)) {
				const effect = await loadEffect(name as keyof typeof EFFECTS);
				if (onOpen) effect(opts);
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
