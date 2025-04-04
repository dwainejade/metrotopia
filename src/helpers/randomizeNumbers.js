const randomizeInRange = (min, max, precision = 0) => {
	// Check if inputs are numbers
	if (typeof min !== "number" || typeof max !== "number") {
		console.error("Invalid input: min and max must be numbers");
		return 0;
	}

	// Ensure min is always less than max
	if (min > max) {
		[min, max] = [max, min];
	}

	// Check if precision is a non-negative integer
	if (!Number.isInteger(precision) || precision < 0) {
		console.error("Invalid precision: must be a non-negative integer");
		precision = 0;
	}

	const randomNumber = Math.random() * (max - min) + min;
	const roundedNumber = Number(randomNumber.toFixed(precision));

	return roundedNumber;
};

export default randomizeInRange;
