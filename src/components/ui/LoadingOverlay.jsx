import React, { useState, useEffect } from "react";
import useTransitionStore from "../../stores/transitionStore";

const LoadingOverlay = ({ onComplete }) => {
	const { isVisible, isTransitioning } = useTransitionStore();
	const [animationState, setAnimationState] = useState("loading");
	const [isLoading, setIsLoading] = useState(true);
	useEffect(() => {
		if (!isLoading && animationState === "loading") {
			setAnimationState("complete");
		} else if (isLoading && animationState !== "loading") {
			setAnimationState("loading");
		}
	}, [isLoading, animationState]);

	// if (!isVisible && !isTransitioning) return null;

	const handleClick = () => {
		if (isLoading) {
			setIsLoading(false);
			onComplete();
		}
	};

	return (
		<div className="loading-overlay" onClick={handleClick}>
			{[...Array(5)].map((_, index) => (
				<div key={index} className="loading-bar-container">
					<div
						className={`loading-bar ${animationState}`}
						style={{
							animationDelay: `${index * 0.2}s, ${(5 - index) * 0.1}s`,
						}}
					/>
				</div>
			))}
			<style jsx>{`
				.loading-overlay {
					position: fixed;
					top: 0;
					bottom: 0;
					left: 0;
					right: 0;
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: center;
					z-index: 1000;
					pointer-events: none;
				}
				.loading-bar-container {
					height: 20vh;
					position: relative;
					overflow: hidden;
					pointer-events: auto;
				}
				.loading-bar {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					background-color: black;
					transform: scaleX(0);
					transform-origin: left;
				}
				.loading-bar.loading {
					animation: grow 0.5s ease-in-out forwards;
				}
				.loading-bar.complete {
					animation: grow 0.5s ease-out forwards,
						slideOff 0.4s ease-in-out forwards;
				}
				@keyframes grow {
					from {
						transform: scaleX(0);
					}
					to {
						transform: scaleX(1);
					}
				}
				@keyframes slideOff {
					to {
						transform: translateX(100%);
					}
				}
			`}</style>
		</div>
	);
};

export default LoadingOverlay;
