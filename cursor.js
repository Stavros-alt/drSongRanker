document.addEventListener("DOMContentLoaded", () => {
	// check if system cursor was requested
	try {
		const globalState = JSON.parse(
			localStorage.getItem("drSongRankerGlobalState") || "{}",
		);
		if (globalState.useSystemCursor) {
			document.body.classList.add("system-cursor");
		}
	} catch (e) {}

	const cursor = document.createElement("div");
	cursor.classList.add("custom-cursor");
	document.body.appendChild(cursor);

	document.addEventListener("mousemove", (e) => {
		updateCursorPosition(e.clientX, e.clientY);
	});

	document.addEventListener("pointermove", (e) => {
		if (e.pointerType === "mouse" || e.pointerType === "pen") {
			updateCursorPosition(e.clientX, e.clientY);
		}
	});

	function updateCursorPosition(x, y) {
		cursor.style.left = `${x}px`;
		cursor.style.top = `${y}px`;
	}

	try {
		const globalState = JSON.parse(
			localStorage.getItem("drSongRankerGlobalState") || "{}",
		);
		if (globalState.soulColor) {
			cursor.setAttribute("data-soul-mode", globalState.soulColor);
			if (globalState.soulColor.startsWith("#")) {
				cursor.style.backgroundColor = globalState.soulColor;
				cursor.style.setProperty("--cursor-glow", globalState.soulColor);
				if (globalState.soulInverted) cursor.classList.add("inverted");
			} else if (globalState.soulColor !== "red") {
				cursor.classList.add(`soul-${globalState.soulColor}`);
			}
		}
	} catch (e) {}

	const interactiveSelectors =
		"button, .song-card, .ranking-toggle-btn, .filter-btn, a, input, .chart-card";

	document.body.addEventListener("mouseover", (e) => {
		if (e.target.closest(interactiveSelectors)) {
			cursor.classList.add("active");
		}
	});

	document.body.addEventListener("mouseout", (e) => {
		if (e.target.closest(interactiveSelectors)) {
			cursor.classList.remove("active");
		}
	});
});
