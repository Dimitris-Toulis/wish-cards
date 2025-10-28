export function showMessage(title: string, message: string) {
	const modal = document.getElementById("modal")! as HTMLDialogElement;
	const modalTitle = document.getElementById("modal-title")!;
	modalTitle.textContent = title;
	const modalMessage = document.getElementById("modal-message")!;
	modalMessage.innerHTML = message;
	document
		.getElementById("modal-close")
		?.addEventListener("click", () => closeModal(modal));
	openModal(modal);
}

/*
 * Modal
 *
 * Pico.css - https://picocss.com
 * Copyright 2019-2024 - Licensed under MIT
 */

// Config
const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 400; // ms
let visibleModal: HTMLDialogElement | null = null;

// Open modal
export const openModal = (modal: HTMLDialogElement) => {
	const { documentElement: html } = document;
	const scrollbarWidth = getScrollbarWidth();
	if (scrollbarWidth) {
		html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
	}
	html.classList.add(isOpenClass, openingClass);
	setTimeout(() => {
		visibleModal = modal;
		html.classList.remove(openingClass);
	}, animationDuration);
	modal.showModal();
};

// Close modal
export const closeModal = (modal: HTMLDialogElement) => {
	visibleModal = null;
	const { documentElement: html } = document;
	html.classList.add(closingClass);
	setTimeout(() => {
		html.classList.remove(closingClass, isOpenClass);
		html.style.removeProperty(scrollbarWidthCssVar);
		modal.close();
	}, animationDuration);
};

// Close with a click outside
document.addEventListener("click", (event) => {
	if (visibleModal === null) return;
	const modalContent = visibleModal.querySelector("article");
	//@ts-ignore
	const isClickInside = modalContent?.contains(event.target);
	!isClickInside && closeModal(visibleModal);
});

// Close with Esc key
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && visibleModal) {
		closeModal(visibleModal);
	}
});

// Get scrollbar width
const getScrollbarWidth = () => {
	const scrollbarWidth =
		window.innerWidth - document.documentElement.clientWidth;
	return scrollbarWidth;
};
