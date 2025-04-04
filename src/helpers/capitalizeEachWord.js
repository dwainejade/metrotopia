const doNotCapitalize = ["and", "or", "of"];

export const capitalizeEachWord = (str) => {
	if (!str) return "";
	return str
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
};

export const spaceEachWord = (str) => {
	return str
		.replace(/([A-Z])/g, " $1") // Add space before each capital letter
		.split(" ") // Split into words
		.map((word, index) => {
			// Capitalize if it's not in lowercaseWords, or if it's the first word
			if (index === 0 || !doNotCapitalize.includes(word.toLowerCase())) {
				return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
			}
			return word.toLowerCase(); // Otherwise, keep it lowercase
		})
		.join(" ")
		.trim(); // Remove any leading/trailing spaces
};