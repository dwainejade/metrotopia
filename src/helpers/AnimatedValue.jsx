import React, { useState, useEffect } from "react";
import { useSpring, animated } from "react-spring";

const AnimatedValue = ({ value, precision = 0, type = "number" }) => {
	const [prevValue, setPrevValue] = useState(value);
	const [shouldAnimate, setShouldAnimate] = useState(false);

	useEffect(() => {
		if (value !== prevValue) {
			setShouldAnimate(true);
			setPrevValue(value);
		}
	}, [value, prevValue]);

	const props = useSpring({
		number: shouldAnimate ? value : prevValue,
		from: { number: prevValue },
		config: { duration: 300 },
		onRest: () => setShouldAnimate(false),
	});

	// Helper function to format the value based on type and precision
	const formatValue = (val) => {
		const numericValue = Number(val);

		// Handle invalid number inputs
		if (isNaN(numericValue)) return "N/A";

		if (type === "currency") {
			return numericValue.toLocaleString("en-US", {
				style: "currency",
				currency: "USD",
				minimumFractionDigits: precision,
				maximumFractionDigits: precision,
			});
		} else if (type === "stat") {
			return numericValue.toLocaleString(undefined, {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		} else if (type === "number") {
			// Format numbers with commas for thousands/millions
			return numericValue.toLocaleString(undefined, {
				minimumFractionDigits: precision,
				maximumFractionDigits: precision,
			});
		} else {
			return numericValue.toFixed(precision);
		}
	};

	return (
		<animated.span
			aria-label={`${type === "currency" ? "Currency" : "Number"} value`}
		>
			{props.number?.to((val) => formatValue(val))}
		</animated.span>
	);
};

export default AnimatedValue;