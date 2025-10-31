import { showMessage } from "./components/modal";
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
	document
		.getElementById("card-form")
		?.addEventListener("submit", async (e) => {
			e.preventDefault();
			const form = e.target as HTMLFormElement;
			if (!form.checkValidity()) return;

			const config = getConfig(form);
			const result: { error: any } | { id: string } = await (
				await fetch("/api/card", {
					method: "POST",
					body: JSON.stringify(config)
				})
			).json();
			if ("error" in result) {
				showMessage(
					"Error",
					`<p>There was an error while making your card: ${result.error.message}</p>`
				);
			} else {
				showMessage(
					"Card Created",
					`<p>Your card has been created!</p>
					<p>Send this link to the recipient: </p><a href="${
						window.origin + "/v?" + result.id
					}" target="_blank">${window.origin + "/v?" + result.id}</a>`
				);
			}
		});
	document.getElementById("preview-btn")?.addEventListener("click", () => {
		const form = document.getElementById("card-form")! as HTMLFormElement;
		if (!form.checkValidity()) return;

		const config = getConfig(form);
		window.location.href =
			window.origin + "/v?config=" + encodeURIComponent(JSON.stringify(config));
	});
});
