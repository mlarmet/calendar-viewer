function twoDigits(number) {
	return number.toLocaleString("en-US", {
		minimumIntegerDigits: 2,
		useGrouping: false,
	});
}

module.exports = { twoDigits };
