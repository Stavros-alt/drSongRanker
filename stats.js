document.addEventListener("DOMContentLoaded", async () => {
	const SUPABASE_URL = "https://tsqubxgafnzmxejwknbm.supabase.co";
	const SUPABASE_KEY = "sb_publishable_ZYm_PTc6nIPS6t7MKsWKrQ_pwSiLCq2";

	const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

	const RANKING_MODE_KEY = "drSongRankerStatsMode";
	const HIDE_HIDDEN_KEY = "drSongRankerStatsHideHidden";
	let rankingMode = localStorage.getItem(RANKING_MODE_KEY) || "elo";
	let hideHidden = localStorage.getItem(HIDE_HIDDEN_KEY) !== "0";
	let gameFilter = "all";
	let gapGame = "all";
	let secGame = "DR";
	let searchText = "";
	let sortKey = "rank";
	let sortDir = 1;
	let visibleLimit = 100;

	const charts = {};

	Chart.defaults.color = "#fff";
	Chart.defaults.borderColor = "#333";
	Chart.defaults.font.family = "'Roboto Mono', monospace";

	function getScore(s) {
		if (rankingMode === "centrality") {
			return s.centrality == null ? 50 : s.centrality;
		}
		return s.rating;
	}

	function fmtScore(v) {
		if (rankingMode === "centrality") return v.toFixed(1);
		return String(Math.round(v));
	}

	function scoreLabel() {
		return rankingMode === "centrality" ? "Centrality" : "Elo";
	}

	function makeChart(id, config) {
		if (charts[id]) charts[id].destroy();
		const el = document.getElementById(id);
		if (!el) return;
		charts[id] = new Chart(el, config);
	}

	/* game and section helpers mirror app logic */
	function getGame(song) {
		if (song.id < 1000) return "DR";
		if (song.id < 2000) return "UT";
		if (song.id < 4000) return "UTY";
		return "TSUS";
	}

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
			/* area source lives in ut song data, edit there */
			const track = song.id - 1000;
			const ch =
				(typeof UT_AREA_BY_TRACK !== "undefined" && UT_AREA_BY_TRACK[track]) ||
				5;
			return ["Ruins", "Snowdin", "Waterfall", "Hotland / CORE", "New Home"][ch - 1];
		}
		if (song.id >= 4000) return song.region || "Unknown";
		const track = song.id - 2000;
		if (track <= 16) return "Ruins";
		if (track <= 33) return "Snowdin";
		if (track <= 49) return "Dunes";
		if (track <= 72) return "Wild East";
		if (track <= 94) return "Steamworks";
		if (track <= 125) return "New Home";
		if (track === 126) return "New Home";
		if (track === 127) return "Ruins";
		if (track === 128) return "Snowdin";
		if (track === 129 || track === 130) return "Wild East";
		if (track >= 131) return "Steamworks";
		return "New Home";
	}

	/* section colors match the share export palette */
	const SECTION_COLORS = {
		"Ch 1": "#bf44ff",
		"Ch 2": "#44ccff",
		"Ch 3": "#ff4444",
		"Ch 4": "#4466ff",
		"Ch 5": "#ffdd00",
		Scrapped: "#666666",
		Ruins: "#bf44ff",
		Snowdin: "#44ccff",
		Waterfall: "#4466ff",
		"Hotland / CORE": "#ff8800",
		"New Home": "#ffdd00",
		Dunes: "#ff8800",
		"Wild East": "#ff4444",
		Steamworks: "#4466ff",
	};

	const GAME_COLORS = {
		DR: "#00ff9d",
		UT: "#ff4444",
		UTY: "#ffdd00",
		TSUS: "#44ccff",
	};

	const GAME_NAMES = {
		DR: "Deltarune",
		UT: "Undertale",
		UTY: "UT Yellow",
		TSUS: "TS!Underswap",
	};

	function sectionColor(sec, fallback) {
		return SECTION_COLORS[sec] || fallback || "#888888";
	}

	async function fetchSongs() {
		const [drRes, utRes, utyRes, tsusRes] = await Promise.all([
			supabase.from("songs").select("id, name, rating, comparisons, centrality"),
			supabase.from("ut_songs").select("id, name, rating, comparisons, centrality"),
			supabase.from("uty_songs").select("id, name, rating, comparisons, centrality"),
			supabase.from("tsus_songs").select("id, name, rating, comparisons, centrality"),
		]);
		const err = drRes.error || utRes.error || utyRes.error || tsusRes.error;
		if (err) {
			console.error("stats fetch failed:", err);
			return null;
		}
		return [
			...(drRes.data || []),
			...(utRes.data || []),
			...(utyRes.data || []),
			...(tsusRes.data || []),
		];
	}

	async function fetchVoteTotal(rpc) {
		try {
			const { data, error } = await supabase.rpc(rpc);
			if (error) throw error;
			return data || 0;
		} catch (err) {
			console.error("vote total failed:", rpc, err);
			return 0;
		}
	}

	function readPersonal() {
		const map = {};
		let totalVotes = 0;
		const keys = [
			"drSongRankerState",
			"utSongRankerState",
			"utySongRankerState",
			"tsusSongRankerState",
		];
		for (const key of keys) {
			try {
				const raw = localStorage.getItem(key);
				if (!raw) continue;
				const state = JSON.parse(raw);
				if (!state || !Array.isArray(state.songs)) continue;
				totalVotes += state.comparisons || 0;
				for (const s of state.songs) {
					if (s == null || s.id == null) continue;
					if (!map[s.id]) {
						map[s.id] = {
							rating: s.rating,
							comparisons: s.comparisons || 0,
						};
					}
				}
			} catch (err) {
				console.error("personal parse failed:", key, err);
			}
		}
		/* combined save only fills gaps left by game saves */
		try {
			const raw = localStorage.getItem("combinedSongRankerState");
			if (raw) {
				const state = JSON.parse(raw);
				if (state && Array.isArray(state.songs)) {
					for (const s of state.songs) {
						if (s == null || s.id == null) continue;
						if (!map[s.id]) {
							map[s.id] = {
								rating: s.rating,
								comparisons: s.comparisons || 0,
							};
						}
					}
				}
			}
		} catch (err) {
			console.error("personal parse failed: combined", err);
		}
		return { map, totalVotes };
	}

	const dbSongs = await fetchSongs();
	if (!dbSongs) {
		alert("Failed to load stats.");
		return;
	}

	const [votesDr, votesUt, votesUty, votesTsus, votesFelfeb] = await Promise.all([
		fetchVoteTotal("get_total_votes"),
		fetchVoteTotal("get_total_ut_votes"),
		fetchVoteTotal("get_total_uty_votes"),
		fetchVoteTotal("get_total_tsus_votes"),
		fetchVoteTotal("get_total_felfeb_votes"),
	]);

	const localSongs = [
		...(window.songList || []),
		...(window.utSongList || []),
		...(window.utySongList || []),
		...(window.tsusSongList || []),
	];
	const localById = {};
	for (const l of localSongs) localById[l.id] = l;

	const personal = readPersonal();

	const songs = dbSongs.map((dbS) => {
		const local = localById[dbS.id];
		const mine = personal.map[dbS.id];
		return {
			...dbS,
			duration: local ? local.duration : 0,
			region: local ? local.region : undefined,
			game: getGame(dbS),
			section: "",
			hidden: local ? !!local.hidden : false,
			mineRating: mine && mine.comparisons > 0 ? mine.rating : null,
		};
	});
	for (const s of songs) s.section = getSection(s);

	const byId = {};
	for (const s of songs) byId[s.id] = s;

	let visibleSongs = [];
	function visSongs() {
		return hideHidden ? songs.filter((s) => !s.hidden) : songs;
	}

	/* global rank per mode, recomputed on rerender */
	let globalRank = {};
	function computeRanks(list) {
		const ordered = [...list].sort((a, b) => getScore(b) - getScore(a));
		globalRank = {};
		ordered.forEach((s, i) => {
			globalRank[s.id] = i + 1;
		});
	}

	let topSong = null;
	let mostBattledSong = null;
	let rated = [];
	let gapLoveAll = [];
	let gapColdAll = [];
	let biggestGap = null;
	function computeDerived(list) {
		const ordered = [...list].sort((a, b) => getScore(b) - getScore(a));
		topSong = ordered[0] || null;
		mostBattledSong =
			[...list].sort((a, b) => (b.comparisons || 0) - (a.comparisons || 0))[0] ||
			null;
		/* elo gap between personal save and global board */
		rated = list.filter((s) => s.mineRating != null);
		for (const s of rated) s.gap = Math.round(s.mineRating - s.rating);
		gapLoveAll = [...rated].sort((a, b) => b.gap - a.gap);
		gapColdAll = [...rated].sort((a, b) => a.gap - b.gap);
		biggestGap =
			[...rated].sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap))[0] || null;
	}

	function renderHero() {
		const row = document.getElementById("quick-stats-row");
		row.innerHTML = "";
		const globalVotes = votesDr + votesUt + votesUty + votesTsus;
		const boxes = [
			{
				value: globalVotes.toLocaleString(),
				sub: "felfeb " + Number(votesFelfeb).toLocaleString(),
				label: "Global Votes",
				color: "#00f2ff",
			},
			{
				value: String(visibleSongs.length),
				sub: "across 4 games",
				label: "Total Songs",
				color: null,
			},
			{
				value: Number(personal.totalVotes).toLocaleString(),
				sub: rated.length + " songs rated by you",
				label: "Your Votes",
				color: "#ff00ff",
			},
			{
				value: topSong ? topSong.name : "…",
				sub: topSong ? scoreLabel() + " " + fmtScore(getScore(topSong)) : "",
				label: "World Number One",
				color: "#00ff9d",
			},
			{
				value: mostBattledSong ? mostBattledSong.name : "…",
				sub: mostBattledSong
					? Number(mostBattledSong.comparisons || 0).toLocaleString() + " battles"
					: "",
				label: "Most Battled",
				color: "#ff8800",
			},
			{
				value: biggestGap ? biggestGap.name : "…",
				sub: biggestGap
					? (biggestGap.gap > 0 ? "+" : "") + biggestGap.gap + " you vs world"
					: "rank songs to see this",
				label: "Biggest Taste Gap",
				color: "#ff4444",
			},
		];
		for (const b of boxes) {
			const box = document.createElement("div");
			box.className = "stat-box";
			if (b.color) box.style.borderLeft = "4px solid " + b.color;
			const val = document.createElement("div");
			val.className = "stat-value";
			val.style.fontSize = b.value.length > 14 ? "1.1em" : "2em";
			val.textContent = b.value;
			const sub = document.createElement("div");
			sub.className = "stat-sub";
			sub.textContent = b.sub;
			const label = document.createElement("div");
			label.className = "stat-label";
			label.textContent = b.label;
			box.append(val, sub, label);
			row.appendChild(box);
		}
	}

	function boardRows() {
		let rows = visibleSongs.filter((s) => {
			if (gameFilter !== "all" && s.game !== gameFilter) return false;
			if (searchText && !s.name.toLowerCase().includes(searchText)) return false;
			return true;
		});
		const dir = sortDir;
		rows.sort((a, b) => {
			switch (sortKey) {
				case "name":
					return dir * a.name.localeCompare(b.name);
				case "section":
					return dir * String(a.section).localeCompare(String(b.section));
				case "score":
					return dir * (getScore(b) - getScore(a));
				case "battles":
					return dir * ((b.comparisons || 0) - (a.comparisons || 0));
				case "you":
					if (a.mineRating == null && b.mineRating == null) return 0;
					if (a.mineRating == null) return 1;
					if (b.mineRating == null) return -1;
					return dir * (a.mineRating - b.mineRating);
				case "diff":
					if (a.gap == null && b.gap == null) return 0;
					if (a.gap == null) return 1;
					if (b.gap == null) return -1;
					return dir * (a.gap - b.gap);
				default:
					return dir * (globalRank[a.id] - globalRank[b.id]);
			}
		});
		return rows;
	}

	function renderBoard() {
		const rows = boardRows();
		const body = document.getElementById("board-body");
		body.innerHTML = "";
		const shown = rows.slice(0, visibleLimit);
		for (const s of shown) {
			const tr = document.createElement("tr");

			const rank = document.createElement("td");
			rank.className = "rank-num";
			rank.textContent = globalRank[s.id];
			tr.appendChild(rank);

			const name = document.createElement("td");
			name.textContent = s.name;
			tr.appendChild(name);

			const sec = document.createElement("td");
			const dot = document.createElement("span");
			dot.className = "sec-dot";
			dot.style.background = sectionColor(s.section, GAME_COLORS[s.game]);
			sec.appendChild(dot);
			sec.appendChild(document.createTextNode(s.game + " · " + s.section));
			tr.appendChild(sec);

			const score = document.createElement("td");
			score.className = "score-good";
			score.textContent = fmtScore(getScore(s));
			tr.appendChild(score);

			const battles = document.createElement("td");
			battles.textContent = Number(s.comparisons || 0).toLocaleString();
			tr.appendChild(battles);

			const you = document.createElement("td");
			you.textContent = s.mineRating != null ? String(Math.round(s.mineRating)) : "…";
			tr.appendChild(you);

			const gap = document.createElement("td");
			if (s.gap == null) {
				gap.textContent = "…";
			} else {
				gap.textContent = (s.gap > 0 ? "+" : "") + s.gap;
				gap.className = s.gap >= 0 ? "diff-up" : "diff-down";
			}
			tr.appendChild(gap);

			body.appendChild(tr);
		}
		const count = document.getElementById("board-count");
		let hiddenSuffix = "";
		if (hideHidden) {
			const n = songs.filter((s) => {
				if (!s.hidden) return false;
				if (gameFilter !== "all" && s.game !== gameFilter) return false;
				if (searchText && !s.name.toLowerCase().includes(searchText)) return false;
				return true;
			}).length;
			if (n) hiddenSuffix = " · " + n + " hidden";
		}
		count.textContent =
			"showing " + shown.length + " of " + rows.length + " songs · " + scoreLabel() + " mode" + hiddenSuffix;
		const title = document.getElementById("board-title");
		title.textContent =
			"Leaderboard" + (gameFilter === "all" ? "" : " · " + GAME_NAMES[gameFilter]);
		const more = document.getElementById("board-more");
		more.style.display = rows.length > visibleLimit ? "block" : "none";
	}

	function renderGaps() {
		const love = document.getElementById("gap-love");
		const cold = document.getElementById("gap-cold");
		love.innerHTML = "";
		cold.innerHTML = "";
		const cols = document.getElementById("gap-cols");
		const existing = document.getElementById("gap-empty");
		if (existing) existing.remove();
		if (!rated.length) {
			const p = document.createElement("p");
			p.id = "gap-empty";
			p.className = "empty-note";
			p.textContent = "no local rankings found. go rank some songs first.";
			cols.appendChild(p);
			return;
		}
		function fill(list, el) {
			const shown = list
				.filter((s) => gapGame === "all" || s.game === gapGame)
				.slice(0, 5);
			if (!shown.length) {
				const li = document.createElement("li");
				li.textContent = "nothing rated in this game yet.";
				el.appendChild(li);
				return;
			}
			for (const s of shown) {
				const li = document.createElement("li");
				const name = document.createElement("span");
				name.className = "gap-song";
				name.textContent = s.name;
				const num = document.createElement("div");
				num.className = "gap-num";
				num.textContent =
					"you " +
					Math.round(s.mineRating) +
					" · world " +
					Math.round(s.rating) +
					" (" +
					(s.gap > 0 ? "+" : "") +
					s.gap +
					") · #" +
					globalRank[s.id];
				li.append(name, num);
				el.appendChild(li);
			}
		}
		fill(gapLoveAll, love);
		fill(gapColdAll, cold);
	}

	function renderTaste() {
		const ul = document.getElementById("taste-list");
		ul.innerHTML = "";
		if (!rated.length) {
			const li = document.createElement("li");
			li.textContent = "rank songs and this fills in.";
			ul.appendChild(li);
			return;
		}
		const agg = {};
		for (const s of rated) {
			const key = s.game + " " + s.section;
			if (!agg[key]) agg[key] = { sum: 0, count: 0, color: sectionColor(s.section, GAME_COLORS[s.game]) };
			agg[key].sum += s.mineRating;
			agg[key].count += 1;
		}
		const rows = Object.entries(agg)
			.filter(([, v]) => v.count >= 2)
			.map(([k, v]) => ({ name: k, avg: v.sum / v.count, count: v.count, color: v.color }))
			.sort((a, b) => b.avg - a.avg)
			.slice(0, 8);
		if (!rows.length) {
			const li = document.createElement("li");
			li.textContent = "rate a few more songs first.";
			ul.appendChild(li);
			return;
		}
		const top = rows[0].avg;
		const base = Math.min(...rows.map((r) => r.avg));
		for (const r of rows) {
			const li = document.createElement("li");
			const bar = document.createElement("span");
			bar.className = "taste-bar";
			const width = top === base ? 60 : 20 + Math.round(((r.avg - base) / (top - base)) * 80);
			bar.style.width = width + "px";
			bar.style.background = r.color;
			const label = document.createElement("span");
			label.textContent = r.name + " · " + Math.round(r.avg) + " (" + r.count + ")";
			li.append(bar, label);
			ul.appendChild(li);
		}
	}

	/* label order stays chronological per game */
	const SECTION_ORDER = {
		DR: ["Ch 1", "Ch 2", "Ch 3", "Ch 4", "Ch 5", "Scrapped"],
		UT: ["Ruins", "Snowdin", "Waterfall", "Hotland / CORE", "New Home"],
		UTY: ["Ruins", "Snowdin", "Dunes", "Wild East", "Steamworks", "New Home"],
	};
	function renderSections() {
		const sets = {
			DR: visibleSongs.filter((s) => s.game === "DR"),
			UT: visibleSongs.filter((s) => s.game === "UT"),
			UTY: visibleSongs.filter((s) => s.game === "UTY"),
			TSUS: visibleSongs.filter((s) => s.game === "TSUS"),
		};
		const set = sets[secGame] || [];
		const order = (SECTION_ORDER[secGame] || []).filter((sec) =>
			set.some((s) => s.section === sec),
		);
		for (const s of set) {
			if (!order.includes(s.section)) order.push(s.section);
		}
		const avgs = order.map((sec) => {
			const inSec = set.filter((s) => s.section === sec);
			return inSec.reduce((sum, s) => sum + getScore(s), 0) / inSec.length;
		});
		makeChart("sectionChart", {
			type: "bar",
			data: {
				labels: order,
				datasets: [
					{
						data: avgs,
						backgroundColor: order.map((sec) => sectionColor(sec, GAME_COLORS[secGame])),
						borderColor: "#fff",
						borderWidth: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) => " avg " + fmtScore(ctx.raw),
						},
					},
				},
			},
		});
	}

	function renderDist() {
		const width = rankingMode === "centrality" ? 5 : 100;
		const bins = {};
		for (const s of visibleSongs) {
			const bin = Math.floor(getScore(s) / width) * width;
			bins[bin] = (bins[bin] || 0) + 1;
		}
		const labels = Object.keys(bins)
			.map(Number)
			.sort((a, b) => a - b);
		makeChart("distChart", {
			type: "bar",
			data: {
				labels: labels.map((b) => b + " to " + (b + width)),
				datasets: [
					{
						data: labels.map((b) => bins[b]),
						backgroundColor: "#00ff9d",
						borderColor: "#fff",
						borderWidth: 1,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: false } },
				scales: { y: { beginAtZero: true } },
			},
		});
	}

	function renderCurve() {
		const ordered = [...visibleSongs].sort((a, b) => getScore(b) - getScore(a));
		makeChart("curveChart", {
			type: "line",
			data: {
				labels: ordered.map((_, i) => i + 1),
				datasets: [
					{
						data: ordered.map((s) => getScore(s)),
						borderColor: "#00f2ff",
						backgroundColor: "rgba(0, 242, 255, 0.1)",
						fill: true,
						tension: 0.4,
						pointRadius: 0,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: ordered.map((s) => GAME_COLORS[s.game]),
						segment: {
							borderColor: (ctx) => {
								const s = ordered[ctx.p1DataIndex];
								return s ? GAME_COLORS[s.game] : "#00f2ff";
							},
						},
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							title: (ctx) => "rank #" + ctx[0].label,
							label: (ctx) => {
								const song = ordered[ctx.dataIndex];
								return " " + song.name + ": " + fmtScore(getScore(song));
							},
						},
					},
				},
				scales: {
					x: { title: { display: true, text: "Rank" } },
					y: { title: { display: true, text: scoreLabel() } },
				},
			},
		});
	}

	/* tooltips use the point index, value lookup breaks on ties */
	function renderDuration() {
		const pts = visibleSongs.filter((s) => s.duration && s.duration > 0);
		const canvas = document.getElementById("durationChart");
		if (!pts.length) {
			if (canvas && canvas.parentElement) {
				canvas.parentElement.innerHTML =
					'<p class="empty-note">no duration data in song files.</p>';
			}
			return;
		}
		makeChart("durationChart", {
			type: "scatter",
			data: {
				datasets: [
					{
						data: pts.map((s) => ({ x: s.duration, y: getScore(s) })),
						backgroundColor: pts.map((s) => GAME_COLORS[s.game]),
						pointRadius: 4,
						pointHoverRadius: 6,
					},
				],
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false },
					tooltip: {
						callbacks: {
							label: (ctx) => {
								const song = pts[ctx.dataIndex];
								return (
									" " + song.name + ": " + fmtScore(ctx.raw.y) + " (" + song.duration + "s)"
								);
							},
						},
					},
				},
				scales: {
					x: { title: { display: true, text: "Duration (Seconds)" } },
					y: { title: { display: true, text: scoreLabel() } },
				},
			},
		});
	}

	function renderBattled() {
		const ol = document.getElementById("battled-list");
		ol.innerHTML = "";
		const top = [...visibleSongs]
			.sort((a, b) => (b.comparisons || 0) - (a.comparisons || 0))
			.slice(0, 15);
		for (const s of top) {
			const li = document.createElement("li");
			const name = document.createElement("span");
			name.textContent = s.name + " ";
			const count = document.createElement("span");
			count.className = "battle-count";
			count.textContent = Number(s.comparisons || 0).toLocaleString();
			li.append(name, count);
			ol.appendChild(li);
		}
	}

	function renderAll() {
		visibleSongs = visSongs();
		computeRanks(visibleSongs);
		computeDerived(visibleSongs);
		renderHero();
		renderBoard();
		renderGaps();
		renderTaste();
		renderSections();
		renderDist();
		renderCurve();
		renderDuration();
		renderBattled();
	}

	const toggleBtn = document.getElementById("ranking-mode-toggle");
	const toggleLabel = document.getElementById("ranking-mode-label");
	function paintToggle() {
		const last = toggleBtn.querySelector("span:last-child");
		if (rankingMode === "centrality") {
			toggleLabel.textContent = "Elo";
			toggleLabel.classList.remove("active-mode");
			last.classList.add("active-mode");
		} else {
			toggleLabel.textContent = "Elo";
			toggleLabel.classList.add("active-mode");
			last.classList.remove("active-mode");
		}
	}
	paintToggle();
	toggleBtn.addEventListener("click", () => {
		rankingMode = rankingMode === "elo" ? "centrality" : "elo";
		localStorage.setItem(RANKING_MODE_KEY, rankingMode);
		paintToggle();
		renderAll();
	});

	/* hidden by default, matches the main ranker */
	const hiddenBtn = document.getElementById("hidden-toggle");
	const hiddenLabel = document.getElementById("hidden-toggle-label");
	function paintHidden() {
		hiddenLabel.textContent = hideHidden ? "show hidden" : "hide hidden";
	}
	paintHidden();
	hiddenBtn.addEventListener("click", () => {
		hideHidden = !hideHidden;
		localStorage.setItem(HIDE_HIDDEN_KEY, hideHidden ? "1" : "0");
		paintHidden();
		renderAll();
	});

	document.querySelectorAll("#board-controls .game-tab").forEach((btn) => {
		btn.addEventListener("click", () => {
			document
				.querySelectorAll("#board-controls .game-tab")
				.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			gameFilter = btn.dataset.game;
			visibleLimit = 100;
			renderBoard();
		});
	});

	document.querySelectorAll("#gap-tabs .game-tab").forEach((btn) => {
		btn.addEventListener("click", () => {
		document
			.querySelectorAll("#gap-tabs .game-tab")
			.forEach((b) => b.classList.remove("active"));
		btn.classList.add("active");
		gapGame = btn.dataset.gapgame;
		renderGaps();
	});
	});

	document.querySelectorAll("#sec-tabs .game-tab").forEach((btn) => {
		btn.addEventListener("click", () => {
			document
				.querySelectorAll("#sec-tabs .game-tab")
				.forEach((b) => b.classList.remove("active"));
			btn.classList.add("active");
			secGame = btn.dataset.secgame;
			renderSections();
		});
	});

	document.getElementById("board-search").addEventListener("input", (e) => {
		searchText = e.target.value.trim().toLowerCase();
		visibleLimit = 100;
		renderBoard();
	});

	document.querySelectorAll("#board-table th").forEach((th) => {
		th.addEventListener("click", () => {
			const key = th.dataset.sort;
			if (sortKey === key) {
				sortDir *= -1;
			} else {
				sortKey = key;
				sortDir = 1;
			}
			renderBoard();
		});
	});

	document.getElementById("board-more").addEventListener("click", () => {
		visibleLimit += 100;
		renderBoard();
	});

	renderAll();

	/* visiting here unlocks hidden tracks in the main ranker */
	const secretsUnlocked = localStorage.getItem("drSongRankerSecretsUnlocked");
	if (secretsUnlocked !== "true") {
		localStorage.setItem("drSongRankerSecretsUnlocked", "true");
		const toast = document.createElement("div");
		toast.className = "toast-notification";
		const toastTitle = document.createElement("div");
		toastTitle.className = "toast-title";
		toastTitle.textContent = "SECRET TRACKS UNLOCKED";
		const toastMsg = document.createElement("div");
		toastMsg.className = "toast-message";
		toastMsg.textContent = "Hidden songs are now available in the main ranker!";
		toast.append(toastTitle, toastMsg);
		document.body.appendChild(toast);
		setTimeout(() => {
			toast.style.transition = "opacity 0.5s";
			toast.style.opacity = "0";
			setTimeout(() => toast.remove(), 500);
		}, 5000);
	}
});
