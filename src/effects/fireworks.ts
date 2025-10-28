import { fireworks } from "@tsparticles/fireworks";
import "./fireworks.css";

const getRandomInRange = (min: number, max: number) =>
	Math.random() * (max - min) + min;

export async function effect(opts: { sound?: boolean }) {
	const instance = await fireworks({
		speed: { min: 5, max: 20 },
		sounds: opts.sound ?? true
	});
	await new Promise((res) => setTimeout(res, getRandomInRange(9, 13) * 1000));
	instance?.stop();
}
