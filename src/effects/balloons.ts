import "./balloons.css";
import { confetti } from "@tsparticles/confetti";

const balloonContainer = document.createElement("div");
balloonContainer.id = "balloon-container";
document.body.appendChild(balloonContainer);

const getRandomIntInclusive = (min: number, max: number) =>
	Math.floor(Math.random() * (max - min + 1) + min);

function getRandomStyles() {
	const h = getRandomIntInclusive(0, 360);
	const s = getRandomIntInclusive(15, 100);
	const l = getRandomIntInclusive(15, 90);
	const top = getRandomIntInclusive(100, 200);
	const left = getRandomIntInclusive(0, 90);
	return `
		--color: hsl(${h}deg, ${s}%, ${l}%);
  		top: ${top}dvh;
		left: ${left}dvw;
  	`;
}

export async function effect(opts: { amount?: number }) {
	const amount = opts.amount ?? 30;
	const animations = [];
	const balloons = [];
	for (let i = 0; i < amount; i++) {
		const balloon = document.createElement("div");

		balloon.classList.add("balloon");
		balloon.style.cssText = getRandomStyles();
		balloon.addEventListener(
			"click",
			async () => {
				balloon.getAnimations().forEach((anim) => anim.pause());
				await balloon.animate(
					[{ transform: "scale(1)" }, { transform: "scale(0)" }],
					{
						duration: 200,
						fill: "forwards",
						easing: "cubic-bezier(0.36, 0, 0.66, -0.56)",
						composite: "add"
					}
				).finished;

				const rect = balloon.getBoundingClientRect();
				await confetti({
					startVelocity: 30,
					spread: 360,
					ticks: 700,
					zIndex: 1000,
					particleCount: 150,
					origin: {
						y: (rect.top + rect.bottom) / 2 / window.innerHeight,
						x: (rect.right + rect.left) / 2 / window.innerWidth
					}
				});
				balloon.getAnimations().forEach((anim) => anim.cancel());
			},
			{ once: true }
		);
		balloonContainer.appendChild(balloon);
		balloons.push(balloon);

		animations.push(
			balloon.animate(
				[
					{ opacity: 1, transform: "translateY(0)" },
					{
						opacity: 0.7,
						transform: `translateY(calc(-1 *(${
							parseInt(balloon.style.top) + 100 // in viewport + out of viewport
						}dvh + ${
							balloon.getBoundingClientRect().height * 2 + 5 // Balloon tail
						}px)))`
					}
				],
				{
					duration: getRandomIntInclusive(9000, 13000),
					fill: "forwards",
					easing: "ease-in"
				}
			).finished
		);
	}
	await Promise.allSettled(animations);
	// Remove balloons belonging to this animation from the DOM
	balloons.forEach((balloon) => balloon.remove());
}
