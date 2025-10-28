import "./styles/create.scss";

function getConfig(form: HTMLFormElement) {
	const data = Object.fromEntries(new FormData(form).entries());
	const config = {
		wish: data.wish,
		message: data.message,
		wishColor: data.wishColorType == "rainbow" ? "rainbow" : data.wishColor,
		bgColor: data.bgColor,
		effects: [] as { [k: string]: any }[]
	};
	for (let effectName of ["confetti", "fireworks", "balloons"]) {
		if (!data[effectName]) continue;
		const effect: { [k: string]: any } = { name: effectName };
		for (let k of Object.keys(data)) {
			if (k.startsWith(effectName + "-")) {
				const key = k.split("-")[1];
				let val = data[k] as any;
				if (val == "on") val = true;
				if (!isNaN(parseInt(val))) val = parseInt(val);
				effect[key] = val;
			}
		}
		config.effects.push(effect);
	}
	return config;
}

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("card-form")?.addEventListener("submit", (e) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		if (!form.checkValidity()) return;

		const config = getConfig(form);
		console.log(config);
	});
	document.getElementById("preview-btn")?.addEventListener("click", () => {
		const form = document.getElementById("card-form")! as HTMLFormElement;
		if (!form.checkValidity()) return;

		const config = getConfig(form);
		window.location.href =
			window.origin + "/?config=" + encodeURIComponent(JSON.stringify(config));
	});
});
