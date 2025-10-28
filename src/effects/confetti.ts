import { confetti } from "@tsparticles/confetti";

const getRandomInRange = (min: number, max: number) =>
	Math.random() * (max - min) + min;

export async function effect(opts: { amount?: number }) {
	const multiplier = opts.amount ? opts.amount / 1500 : 1;
	for (let i = 0; i < 15; i++) {
		const options = {
			angle: 30,
			count: getRandomInRange(50, 100) * multiplier,
			position: {
				x: 0,
				y: getRandomInRange(40, 60)
			},
			spread: 60,
			startVelocity: getRandomInRange(45, 65),
			drift: 0.1,
			ticks: 150
		};
		await Promise.allSettled([
			confetti(options),
			confetti({
				...options,
				angle: 180 - options.angle,
				position: {
					x: 100,
					y: options.position.y
				}
			})
		]);
		await new Promise((res) => setTimeout(res, 200 / Math.sqrt(10 - i)));
	}
}
