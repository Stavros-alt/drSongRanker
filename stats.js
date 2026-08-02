document.addEventListener("DOMContentLoaded", async () => {
	const SUPABASE_URL = "https://tsqubxgafnzmxejwknbm.supabase.co";
	const SUPABASE_KEY = "sb_publishable_ZYm_PTc6nIPS6t7MKsWKrQ_pwSiLCq2";

	const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

	// elo or centrality mode
	const RANKING_MODE_KEY = "drSongRankerStatsMode";
	const rankingMode = localStorage.getItem(RANKING_MODE_KEY) || "elo";

	function getScore(s) {
		if (rankingMode === "centrality") {
			return s.centrality != null ? s.centrality : 50;
		}
		return s.rating;
	}

	function getScoreLabel() {
		return rankingMode === "centrality" ? "Centrality" : "Rating";
	}

	// toggle button
	const toggleBtn = document.getElementById("ranking-mode-toggle");
	const toggleLabel = document.getElementById("ranking-mode-label");
	if (toggleBtn) {
		if (rankingMode === "centrality") {
			toggleLabel.textContent = "Elo";
			toggleLabel.classList.remove("active-mode");
			toggleBtn.querySelector("span:last-child").classList.add("active-mode");
		} else {
			toggleLabel.classList.add("active-mode");
		}
		toggleBtn.addEventListener("click", () => {
			const next = rankingMode === "elo" ? "centrality" : "elo";
			localStorage.setItem(RANKING_MODE_KEY, next);
			location.reload();
		});
	}

	// chart defaults

	Chart.defaults.color = "#fff";
	Chart.defaults.borderColor = "#333";
	Chart.defaults.font.family = "'Roboto Mono', monospace";

	async function fetchData() {
		const [drRes, utRes, utyRes, tsusRes] = await Promise.all([
			supabase
				.from("songs")
				.select("id, name, rating, comparisons, centrality")
				.order("rating", { ascending: false }),
			supabase
				.from("ut_songs")
				.select("id, name, rating, comparisons, centrality")
				.order("rating", { ascending: false }),
			supabase
				.from("uty_songs")
				.select("id, name, rating, comparisons, centrality")
				.order("rating", { ascending: false }),
			supabase
				.from("tsus_songs")
				.select("id, name, rating, comparisons, centrality")
				.order("rating", { ascending: false }),
		]);

		if (drRes.error || utRes.error || utyRes.error || tsusRes.error) {
			console.error(
				"Error fetching data:",
				drRes.error || utRes.error || utyRes.error || tsusRes.error,
			);
			alert("Failed to load stats.");
			return [];
		}
		const merged = [
			...drRes.data,
			...utRes.data,
			...utyRes.data,
			...tsusRes.data,
		];
		const sortKey = rankingMode === "centrality" ? "centrality" : "rating";
		return merged.sort((a, b) => {
			const va =
				a[sortKey] != null ? a[sortKey] : rankingMode === "centrality" ? 50 : 0;
			const vb =
				b[sortKey] != null ? b[sortKey] : rankingMode === "centrality" ? 50 : 0;
			return vb - va;
		});
	}

	async function fetchFelfebStats() {
		const { data, error } = await supabase.rpc("get_total_felfeb_votes");
		if (error) {
			console.error("Error fetching Felfeb votes:", error);
			return 0;
		}
		return data || 0;
	}

	const dbSongs = await fetchData();
	if (!dbSongs.length) return;

	const localSongs = [
		...(window.songList || []),
		...(window.utSongList || []),
		...(window.utySongList || []),
		...(window.tsusSongList || []),
	];
	const songs = dbSongs.map((dbS) => {
		const local = localSongs.find((l) => l.id === dbS.id);
		return {
			...dbS,
			duration: local ? local.duration : 0,
			file: local ? local.file : "",
		};
	});

	function getGame(song) {
		if (song.id < 1000) return "DR";
		if (song.id < 2000) return "UT";
		if (song.id < 4000) return "UTY";
		return "TSUS";
	}

	// section classification (mirrors app.js)
	function getSection(song) {
		if (song.id < 1000) {
			if (song.id <= 40) return "Ch 1";
			if (song.id <= 87 || song.id === 38 || song.id === 40) return "Ch 2";
			if (song.id <= 125) return "Ch 3";
			if (song.id >= 300) return "Scrapped";
			if (song.id >= 252 && song.id <= 291) return "Ch 5";
			return "Ch 4";
		}
		if (song.id < 2000) {
			const track = song.id - 1000;
			if (track <= 14) return "Ruins";
			if (track <= 24) return "Snowdin";
			if (track <= 46) return "Waterfall";
			if (track <= 70) return "Hotland / CORE";
			return "New Home";
		}
		if (song.id >= 4000) return song.region || "Unknown";

		// uty
		const track = song.id - 2000;
		if (track <= 16) return "Ruins";
		if (track <= 33) return "Snowdin";
		if (track <= 49) return "Dunes";
		if (track <= 72) return "Wild East";
		if (track <= 94) return "Steamworks";
		if (track <= 125) return "New Home";
		if (track === 126) return "New Home";
		if (track === 127) return "Ruins"; // starts in ruins but covers everything
		if (track === 128) return "Snowdin";
		if (track === 129 || track === 130) return "Wild East";
		if (track >= 131) return "Steamworks";
		return "New Home";
	}

	const publicSongs = songs;

	const drSongs = publicSongs.filter((s) => getGame(s) === "DR");
	const utSongs = publicSongs.filter((s) => getGame(s) === "UT");
	const utySongs = publicSongs.filter((s) => getGame(s) === "UTY");
	const tsusSongs = publicSongs.filter((s) => getGame(s) === "TSUS");

	// quick stats row
	const quickStatsRow = document.getElementById("quick-stats-row");
	const avgRating =
		publicSongs.reduce((sum, s) => sum + s.rating, 0) / publicSongs.length;
	const totalComparisons = publicSongs.reduce(
		(sum, s) => sum + (s.comparisons || 0),
		0,
	);

	const statsData = [
		{ value: publicSongs.length, label: "Total Songs", color: null },
		{ value: drSongs.length, label: "Deltarune", color: "#00ff9d" },
		{ value: utSongs.length, label: "Undertale", color: "#ff4444" },
		{ value: utySongs.length, label: "UT Yellow", color: "#666" },
		{ value: tsusSongs.length, label: "TS!Underswap", color: "#666" },
		{ value: await fetchFelfebStats(), label: "Felfeb Votes", color: null },
	];

	statsData.forEach((stat) => {
		const box = document.createElement("div");
		box.className = "stat-box";
		if (stat.color) {
			box.style.borderLeft = "4px solid " + stat.color;
		}
		box.innerHTML = `
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        `;
		quickStatsRow.appendChild(box);
	});

	// section averages
	function computeSectionAverages(songSet, sectionLabels) {
		const stats = {};
		sectionLabels.forEach((l) => {
			stats[l] = { sum: 0, count: 0 };
		});
		songSet.forEach((s) => {
			const sec = getSection(s);
			if (stats[sec]) {
				stats[sec].sum += getScore(s);
				stats[sec].count++;
			}
		});
		return sectionLabels.map((l) =>
			stats[l].count ? stats[l].sum / stats[l].count : 0,
		);
	}

	// top 10 highest rated
	const top10 = songs.slice(0, 10);

	new Chart(document.getElementById("votesChart"), {
		type: "bar",
		data: {
			labels: top10.map((s) => s.name.substring(0, 15) + "..."),
			datasets: [
				{
					label: getScoreLabel(),
					data: top10.map((s) => getScore(s)),
					backgroundColor: "#00f2ff",
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		},
		options: {
			indexAxis: "y",
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
		},
	});

	// bottom 10 lowest rated
	const bottom10 = [...songs]
		.sort((a, b) => getScore(a) - getScore(b))
		.slice(0, 10);

	new Chart(document.getElementById("bottom10Chart"), {
		type: "bar",
		data: {
			labels: bottom10.map((s) => s.name.substring(0, 15) + "..."),
			datasets: [
				{
					label: getScoreLabel(),
					data: bottom10.map((s) => getScore(s)),
					backgroundColor: "#333333",
					borderColor: "#666",
					borderWidth: 1,
				},
			],
		},
		options: {
			indexAxis: "y",
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
		},
	});

	// rating distribution
	const ratings = publicSongs.map((s) => Math.round(getScore(s)));
	const bins = {};
	ratings.forEach((r) => {
		const bin = Math.floor(r / 50) * 50;
		bins[bin] = (bins[bin] || 0) + 1;
	});
	const binLabels = Object.keys(bins).sort((a, b) => parseInt(a) - parseInt(b));
	const binData = binLabels.map((b) => bins[b]);

	new Chart(document.getElementById("ratingDistChart"), {
		type: "bar",
		data: {
			labels: binLabels.map((b) => `${b}-${parseInt(b) + 50}`),
			datasets: [
				{
					label: "Number of Songs",
					data: binData,
					backgroundColor: "#00ff9d",
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: { y: { beginAtZero: true } },
		},
	});

	// average rating by game
	const gameLabels = ["Deltarune", "Undertale", "UT Yellow", "TS!Underswap"];
	const gameAvgs = [drSongs, utSongs, utySongs, tsusSongs].map((set) =>
		set.length ? set.reduce((sum, s) => sum + getScore(s), 0) / set.length : 0,
	);

	new Chart(document.getElementById("avgByGameChart"), {
		type: "bar",
		data: {
			labels: gameLabels,
			datasets: [
				{
					label: getScoreLabel() + " Average",
					data: gameAvgs,
					backgroundColor: ["#00ff9d", "#ff4444", "#666", "#666"],
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
		},
	});

	// deltarune by chapter
	const drSections = ["Ch 1", "Ch 2", "Ch 3", "Ch 4", "Ch 5"];
	const drAvgs = computeSectionAverages(drSongs, drSections);

	new Chart(document.getElementById("drChapterChart"), {
		type: "bar",
		data: {
			labels: drSections,
			datasets: [
				{
					label: getScoreLabel() + " Average",
					data: drAvgs,
					backgroundColor: [
						"#bf44ff",
						"#44ccff",
						"#ff4444",
						"#4466ff",
						"#ffdd00",
					],
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
		},
	});

	// undertale by area
	const utSections = [
		"Ruins",
		"Snowdin",
		"Waterfall",
		"Hotland / CORE",
		"New Home",
	];
	const utAvgs = computeSectionAverages(utSongs, utSections);

	new Chart(document.getElementById("utAreaChart"), {
		type: "bar",
		data: {
			labels: utSections,
			datasets: [
				{
					label: getScoreLabel() + " Average",
					data: utAvgs,
					backgroundColor: [
						"#bf44ff",
						"#44ccff",
						"#4466ff",
						"#ff8800",
						"#ffdd00",
					],
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
		},
	});

	// uty by region
	const utySections = [
		"Ruins",
		"Snowdin",
		"Dunes",
		"Wild East",
		"Steamworks",
		"New Home",
	];
	const utyAvgs = computeSectionAverages(utySongs, utySections);

	new Chart(document.getElementById("utyRegionChart"), {
		type: "bar",
		data: {
			labels: utySections,
			datasets: [
				{
					label: getScoreLabel() + " Average",
					data: utyAvgs,
					backgroundColor: [
						"#bf44ff",
						"#44ccff",
						"#ff8800",
						"#ff4444",
						"#4466ff",
						"#ffdd00",
					],
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					ticks: { maxRotation: 45, minRotation: 30, font: { size: 10 } },
				},
			},
			plugins: { legend: { display: false } },
		},
	});

	// most volatile (biggest outliers from game mean)
	const gameMeans = {
		DR: gameAvgs[0],
		UT: gameAvgs[1],
		UTY: gameAvgs[2],
		TSUS: gameAvgs[3],
	};

	const withDeviation = publicSongs.map((s) => ({
		...s,
		game: getGame(s),
		deviation: getScore(s) - gameMeans[getGame(s)],
	}));

	// top 10 by absolute deviation
	const mostVolatile = [...withDeviation]
		.sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))
		.slice(0, 10);

	new Chart(document.getElementById("volatilityChart"), {
		type: "bar",
		data: {
			labels: mostVolatile.map(
				(s) => s.name.substring(0, 18) + (s.name.length > 18 ? "..." : ""),
			),
			datasets: [
				{
					label: "Deviation from Game Avg",
					data: mostVolatile.map((s) => s.deviation),
					backgroundColor: mostVolatile.map((s) =>
						s.deviation > 0 ? "#00ff9d" : "#ff0000",
					),
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		},
		options: {
			indexAxis: "y",
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: { display: false },
				tooltip: {
					callbacks: {
						label: (context) => {
							const song = mostVolatile[context.dataIndex];
							const sign = song.deviation > 0 ? "+" : "";
							return `${song.name} (${song.game}): ${sign}${Math.round(song.deviation)}`;
						},
					},
				},
			},
		},
	});

	// the curve (all songs sorted)
	const allSorted = [...songs].sort((a, b) => getScore(b) - getScore(a));

	new Chart(document.getElementById("curveChart"), {
		type: "line",
		data: {
			labels: allSorted.map((_, i) => i + 1),
			datasets: [
				{
					label: getScoreLabel(),
					data: allSorted.map((s) => getScore(s)),
					borderColor: "#00f2ff",
					backgroundColor: "rgba(0, 242, 255, 0.1)",
					fill: true,
					tension: 0.4,
					pointRadius: 0,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				tooltip: {
					callbacks: {
						title: (context) => `Rank #${context[0].label}`,
						label: (context) => {
							const song = allSorted[context.dataIndex];
							return `${song.name}: ${Math.round(getScore(song))}`;
						},
					},
				},
				legend: { display: false },
			},
			scales: {
				x: { title: { display: true, text: "Rank" } },
				y: { title: { display: true, text: getScoreLabel() } },
			},
		},
	});

	// chronological quality: 3 separate charts
	function makeChronoChart(canvasId, songSet, color, gameLabel) {
		// normalize the x axis: just use order within this game
		const sorted = [...songSet].sort((a, b) => a.id - b.id);
		new Chart(document.getElementById(canvasId), {
			type: "scatter",
			data: {
				datasets: [
					{
						label: gameLabel,
						data: sorted.map((s, i) => ({ x: i + 1, y: getScore(s) })),
						backgroundColor: color,
						pointRadius: 4,
						pointHoverRadius: 6,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					tooltip: {
						callbacks: {
							label: (context) => {
								const song = sorted[context.dataIndex];
								return `${song.name}: ${Math.round(context.raw.y)}`;
							},
						},
					},
					legend: { display: false },
				},
				scales: {
					x: { title: { display: true, text: "Track Order" } },
					y: { title: { display: true, text: getScoreLabel() } },
				},
			},
		});
	}

	makeChronoChart("chronoDrChart", drSongs, "#ff00ff", "Deltarune");
	makeChronoChart("chronoUtChart", utSongs, "#00ff9d", "Undertale");
	makeChronoChart("chronoUtyChart", utySongs, "#ffff00", "UT Yellow");

	// duration vs rating (fixed: no zero duration songs)
	const songsWithDuration = publicSongs.filter(
		(s) => s.duration && s.duration > 0,
	);

	new Chart(document.getElementById("durationChart"), {
		type: "scatter",
		data: {
			datasets: [
				{
					label: "Songs",
					data: songsWithDuration.map((s) => ({
						x: s.duration,
						y: getScore(s),
					})),
					backgroundColor: "#ffff00",
					pointRadius: 4,
					pointHoverRadius: 6,
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				tooltip: {
					callbacks: {
						label: (context) => {
							const song = songsWithDuration.find(
								(s) =>
									Math.abs(s.duration - context.raw.x) < 0.01 &&
									getScore(s) === context.raw.y,
							);
							return `${song ? song.name : "Unknown"}: ${Math.round(context.raw.y)} (${context.raw.x}s)`;
						},
					},
				},
				legend: { display: false },
			},
			scales: {
				x: {
					title: { display: true, text: "Duration (Seconds)" },
					type: "linear",
					position: "bottom",
				},
				y: { title: { display: true, text: getScoreLabel() } },
			},
		},
	});

	// most battled
	const mostBattled = [...publicSongs]
		.sort((a, b) => b.comparisons - a.comparisons)
		.slice(0, 10);

	new Chart(document.getElementById("battlesChart"), {
		type: "bar",
		data: {
			labels: mostBattled.map((s) => s.name.substring(0, 15) + "..."),
			datasets: [
				{
					label: "Total Battles",
					data: mostBattled.map((s) => s.comparisons),
					backgroundColor: "#ff8800",
					borderColor: "#fff",
					borderWidth: 1,
				},
			],
		},
		options: {
			indexAxis: "y",
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
			scales: { x: { beginAtZero: true } },
		},
	});

	// radar chart. keeping it because it looks cool.
	const radarLabels = [
		"Ch 1",
		"Ch 2",
		"Ch 3",
		"Ch 4",
		"Ch 5",
		"UT",
		"UTY",
		"TSUS",
	];
	const radarStats = {};
	radarLabels.forEach((l) => {
		radarStats[l] = { sum: 0, count: 0 };
	});

	publicSongs.forEach((s) => {
		const game = getGame(s);
		if (game === "DR") {
			const sec = getSection(s);
			if (radarStats[sec]) {
				radarStats[sec].sum += getScore(s);
				radarStats[sec].count++;
			}
		} else if (game === "UT") {
			radarStats["UT"].sum += getScore(s);
			radarStats["UT"].count++;
		} else if (game === "UTY") {
			radarStats["UTY"].sum += getScore(s);
			radarStats["UTY"].count++;
		} else {
			radarStats["TSUS"].sum += getScore(s);
			radarStats["TSUS"].count++;
		}
	});

	const radarData = radarLabels.map((l) =>
		radarStats[l].count ? radarStats[l].sum / radarStats[l].count : 0,
	);

	new Chart(document.getElementById("radarChart"), {
		type: "radar",
		data: {
			labels: radarLabels,
			datasets: [
				{
					label: "Avg " + getScoreLabel(),
					data: radarData,
					backgroundColor: "rgba(0, 255, 157, 0.2)",
					borderColor: "#00ff9d",
					pointBackgroundColor: "#fff",
					pointBorderColor: "#fff",
					pointHoverBackgroundColor: "#fff",
					pointHoverBorderColor: "#00ff9d",
				},
			],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				r: {
					angleLines: { color: "#333" },
					grid: { color: "#333" },
					pointLabels: { color: "#fff", font: { size: 14 } },
				},
			},
			plugins: { legend: { display: false } },
		},
	});

	// personal completed rankings
	try {
		const chapterLabels = ["Ch 1", "Ch 2", "Ch 3", "Ch 4", "Ch 5"];
		const myChapterStats = {};
		for (const l of chapterLabels) {
			myChapterStats[l] = { sum: 0, count: 0 };
		}

		const drStr = localStorage.getItem("drSongRankerState");
		if (drStr) {
			const drState = JSON.parse(drStr);
			if (drState && drState.songs && drState.comparisons > 0) {
				for (let i = 0; i < drState.songs.length; i++) {
					const song = drState.songs[i];
					// reusing that hacky getSection function.
					const sec = getSection(song);
					if (myChapterStats[sec]) {
						myChapterStats[sec].sum += song.rating;
						myChapterStats[sec].count++;
					}
				}
			}
		}

		// fine, i'll add the other games too just in case.
		const utStr = localStorage.getItem("utSongRankerState");
		if (utStr) {
			const utState = JSON.parse(utStr);
			if (utState && utState.songs && utState.comparisons > 0) {
				myChapterStats["UT"] = { sum: 0, count: 0 };
				for (let j = 0; j < utState.songs.length; j++) {
					myChapterStats["UT"].sum += utState.songs[j].rating;
					myChapterStats["UT"].count++;
				}
				chapterLabels.push("UT");
			}
		}

		const utyStr = localStorage.getItem("utySongRankerState");
		if (utyStr) {
			const utyState = JSON.parse(utyStr);
			if (utyState && utyState.songs && utyState.comparisons > 0) {
				myChapterStats["UTY"] = { sum: 0, count: 0 };
				for (const s of utyState.songs) {
					myChapterStats["UTY"].sum += s.rating;
					myChapterStats["UTY"].count++;
				}
				chapterLabels.push("UTY");
			}
		}

		const tsusStr = localStorage.getItem("tsusSongRankerState");
		if (tsusStr) {
			const tsusState = JSON.parse(tsusStr);
			if (tsusState && tsusState.songs && tsusState.comparisons > 0) {
				myChapterStats["TSUS"] = { sum: 0, count: 0 };
				for (const s of tsusState.songs) {
					myChapterStats["TSUS"].sum += s.rating;
					myChapterStats["TSUS"].count++;
				}
				chapterLabels.push("TSUS");
			}
		}

		// do we even have data?
		let hasData = false;
		for (const l of chapterLabels) {
			if (myChapterStats[l] && myChapterStats[l].count > 0) {
				hasData = true;
				break;
			}
		}

		const canvasElement = document.getElementById("personalRadarChart");
		if (hasData && canvasElement) {
			const pData = [];
			for (let idx = 0; idx < chapterLabels.length; idx++) {
				const l = chapterLabels[idx];
				if (myChapterStats[l] && myChapterStats[l].count) {
					pData.push(myChapterStats[l].sum / myChapterStats[l].count);
				} else {
					pData.push(0);
				}
			}

			// i hope this color doesn't look terrible.
			new Chart(canvasElement, {
				type: "radar",
				data: {
					labels: chapterLabels,
					datasets: [
						{
							label: "Your Avg Rating",
							data: pData,
							backgroundColor: "rgba(255, 0, 255, 0.2)",
							borderColor: "#ff00ff",
							pointBackgroundColor: "#fff",
							pointBorderColor: "#fff",
							pointHoverBackgroundColor: "#fff",
							pointHoverBorderColor: "#ff00ff",
						},
					],
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					scales: {
						r: {
							angleLines: { color: "#333" },
							grid: { color: "#333" },
							pointLabels: { color: "#fff", font: { size: 14 } },
							suggestedMin: 1200,
						},
					},
					plugins: { legend: { display: false } },
				},
			});
		} else if (canvasElement && canvasElement.parentElement) {
			// no local rankings data
			canvasElement.parentElement.innerHTML =
				'<p style="text-align: center; color: #666; margin-top: 40px;">no local rankings found. go rank some songs first.</p>';
		}
	} catch (err) {
		// localstorage parsing failed. probably corrupt state.
		console.error("couldn't parse local stats:", err);
	}
	const secretsUnlocked = localStorage.getItem("drSongRankerSecretsUnlocked");
	if (secretsUnlocked !== "true") {
		localStorage.setItem("drSongRankerSecretsUnlocked", "true");

		const toast = document.createElement("div");
		toast.className = "toast-notification";
		toast.innerHTML = `
            <div class="toast-title">SECRET TRACKS UNLOCKED</div>
            <div class="toast-message">Hidden songs are now available in the main ranker!</div>
        `;

		document.body.appendChild(toast);

		setTimeout(() => {
			toast.style.transition = "opacity 0.5s";
			toast.style.opacity = "0";
			setTimeout(() => toast.remove(), 500);
		}, 5000);
	}
});
