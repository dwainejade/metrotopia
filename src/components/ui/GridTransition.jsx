import React, { useEffect, useRef } from "react";
import useTransitionStore from "../../stores/transitionStore";
import "../../styles/Transitions.css";

const GridTransition = ({ direction = "forward", onComplete }) => {
	const { rows } = useTransitionStore();
	const gridRef = useRef(null);
	const timeoutRef = useRef(null);

	// Adjust these values to change speed and duration of the transition
	const baseDelay = 0.1;
	const animationDuration = 0.4;

	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;

		grid.style.setProperty("--row-count", rows);
		grid.style.setProperty("--animation-duration", `${animationDuration}s`);
		grid.style.setProperty("--base-delay", `${baseDelay}s`);

		generateRowDelayCSS(rows, baseDelay);

		const totalDuration = (rows - 1) * baseDelay + animationDuration;

		if (direction === "forward") {
			grid.classList.add("active");
			grid.classList.remove("reverse", "reverse-active");
		} else if (direction === "reverse") {
			grid.classList.add("reverse", "reverse-active");
			grid.classList.remove("active");
		}

		if (timeoutRef.current) clearTimeout(timeoutRef.current);

		timeoutRef.current = setTimeout(onComplete, totalDuration * 1000);

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [direction, onComplete, rows, baseDelay, animationDuration]);

	return (
		<div ref={gridRef} className="grid-transition">
			{[...Array(rows)].map((_, index) => (
				<div key={index} className="row"></div>
			))}
		</div>
	);
};

function generateRowDelayCSS(rowCount, baseDelay) {
	const styleId = "grid-transition-delays";
	let styleElement = document.getElementById(styleId);

	if (!styleElement) {
		styleElement = document.createElement("style");
		styleElement.id = styleId;
		document.head.appendChild(styleElement);
	}

	let css = "";
	for (let i = 0; i < rowCount; i++) {
		const delay = (i * baseDelay).toFixed(2);
		const reverseDelay = ((rowCount - 1 - i) * baseDelay).toFixed(2);

		css += `
            .grid-transition.active .row:nth-child(${i + 1}) {
                transition-delay: ${delay}s;
            }
            .grid-transition.reverse-active .row:nth-child(${i + 1}) {
                transition-delay: ${reverseDelay}s;
            }
        `;
	}

	styleElement.textContent = css;
}

export default GridTransition;
