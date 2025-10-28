import "./styles/main.css";

let config = {
	name: "Name",
	message: "Have a nice birthday!",
	bgColor: "#00f0ff",
	textColor: "#ff0000",
	effects: [
		{ name: "confetti", onOpen: true },
		{ name: "balloons", onOpen: false }
	]
};

const EFFECTS = {
	confetti: {
		btnText: "Confetti!",
		script: "confetti"
	},
	balloons: {
		btnText: "Balloons!",
		script: "balloons"
	}
};

async function loadEffect(name: keyof typeof EFFECTS, onOpen: boolean) {
	const module: { effect: () => Promise<void> } = await import(
		`./effects/${EFFECTS[name].script}.ts`
	);

	if (onOpen) module.effect();

	const effectBtn = document.createElement("button");
	effectBtn.classList.add("effect");
	effectBtn.textContent = EFFECTS[name].btnText;
	effectBtn.addEventListener("click", () => module.effect());
	document.getElementById("effects")?.appendChild(effectBtn);
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
	wishElement.textContent = `Happy birthday ${config.name}!`;
	document.getElementById("message")!.textContent = config.message;

	document.body.style.backgroundColor = config.bgColor;
	document.getElementById("message")!.style.color = textColorBasedOnBackground(
		config.bgColor
	);
	if (config.textColor == "rainbow") {
		wishElement.style.animation = "wish-rainbow 1s linear infinite";
		wishElement.style.color = "#e74b1a";
	} else {
		wishElement.style.color = config.textColor;
	}

	await Promise.allSettled(
		config.effects.map(({ name, onOpen }) => {
			if (Object.hasOwn(EFFECTS, name))
				return loadEffect(name as keyof typeof EFFECTS, onOpen);
			else {
				return Promise.resolve(null);
			}
		})
	);
});
