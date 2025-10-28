import "./styles/main.css";

let config = {
	name: "Name",
	message: "Have a nice birthday!",
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
	const module = await import(`./effects/${EFFECTS[name].script}.ts`);

	if (onOpen) module.effect();

	const effectBtn = document.createElement("button");
	effectBtn.classList.add("effect");
	effectBtn.textContent = EFFECTS[name].btnText;
	effectBtn.addEventListener("click", () => module.effect());
	document.getElementById("effects")?.appendChild(effectBtn);
}

document.addEventListener("DOMContentLoaded", async () => {
	document.getElementById(
		"wish"
	)!.textContent = `Happy birthday ${config.name}!`;
	document.getElementById("message")!.textContent = config.message;
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
