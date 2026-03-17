document.addEventListener('DOMContentLoaded', async () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_ZYm_PTc6nIPS6t7MKsWKrQ_pwSiLCq2';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // chart defaults. i'm never gonna get these to look perfect anyway.

    Chart.defaults.color = '#fff';
    Chart.defaults.borderColor = '#333';
    Chart.defaults.font.family = "'Roboto Mono', monospace";

    async function fetchData() {
        const [drRes, utRes, utyRes, tsusRes] = await Promise.all([
            supabase.from('songs').select('id, name, rating, comparisons').order('rating', { ascending: false }),
            supabase.from('ut_songs').select('id, name, rating, comparisons').order('rating', { ascending: false }),
            supabase.from('uty_songs').select('id, name, rating, comparisons').order('rating', { ascending: false }),
            supabase.from('tsus_songs').select('id, name, rating, comparisons').order('rating', { ascending: false })
        ]);

        if (drRes.error || utRes.error || utyRes.error || tsusRes.error) {
            console.error("Error fetching data:", drRes.error || utRes.error || utyRes.error || tsusRes.error);
            alert("Failed to load stats.");
            return [];
        }
        return [...drRes.data, ...utRes.data, ...utyRes.data, ...tsusRes.data].sort((a, b) => b.rating - a.rating);
    }

    async function fetchFelfebStats() {
        const { data, error } = await supabase.rpc('get_total_felfeb_votes');
        if (error) {
            console.error("Error fetching Felfeb votes:", error);
            return 0;
        }
        return data || 0;
    }

    const dbSongs = await fetchData();
    if (!dbSongs.length) return;

    // merging with local metadata. this feels like a disaster waiting to happen.
    const localSongs = [...(window.songList || []), ...(window.utSongList || []), ...(window.utySongList || []), ...(window.tsusSongList || [])];
    const songs = dbSongs.map(dbS => {
        const local = localSongs.find(l => l.id === dbS.id);
        return {
            ...dbS,
            duration: local ? local.duration : 0,
            file: local ? local.file : ''
        };
    });

    // game classification. i managed to make this straightforward for once.
    function getGame(song) {
        if (song.id < 1000) return 'DR';
        if (song.id < 2000) return 'UT';
        if (song.id < 4000) return 'UTY';
        return 'TSUS';
    }

    // section classification. i just copy-pasted this from app.js because i'm not refactoring everything today.
    function getSection(song) {
        if (song.id < 1000) {
            if (song.id <= 40) return 'Ch 1';
            if (song.id <= 87 || song.id === 38 || song.id === 40) return 'Ch 2';
            if (song.id <= 125) return 'Ch 3';
            if (song.id >= 300) return 'Scrapped';
            return 'Ch 4';
        }
        if (song.id < 2000) {
            const track = song.id - 1000;
            if (track <= 14) return 'Ruins';
            if (track <= 24) return 'Snowdin';
            if (track <= 46) return 'Waterfall';
            if (track <= 70) return 'Hotland / CORE';
            return 'New Home';
        }
        if (song.id >= 4000) return song.region || 'Unknown';

        // uty
        const track = song.id - 2000;
        if (track <= 16) return 'Ruins';
        if (track <= 33) return 'Snowdin';
        if (track <= 49) return 'Dunes';
        if (track <= 72) return 'Wild East';
        if (track <= 94) return 'Steamworks';
        if (track <= 125) return 'New Home';
        if (track === 126) return 'New Home'; // asgore. i'm finally over this.
        if (track === 127) return 'Ruins'; // enemy retreating. this starts in ruins but covers everything. still messy as hell.
        if (track === 128) return 'Snowdin'; // apprehension. Genocide martlet is exhausting.
        if (track === 129 || track === 130) return 'Wild East'; // starlo and ceroba are too much for me right now.
        if (track >= 131) return 'Steamworks'; // axis. whatever. i don't care.
        return 'New Home'; // zenith tracks. i'm done.
    }

    const publicSongs = songs;

    // split by game. i really should have done this from the start.
    const drSongs = publicSongs.filter(s => getGame(s) === 'DR');
    const utSongs = publicSongs.filter(s => getGame(s) === 'UT');
    const utySongs = publicSongs.filter(s => getGame(s) === 'UTY');
    const tsusSongs = publicSongs.filter(s => getGame(s) === 'TSUS');

    // ──────────────────────────────────────────────
    // quick stats row
    // ──────────────────────────────────────────────
    const quickStatsRow = document.getElementById('quick-stats-row');
    const avgRating = publicSongs.reduce((sum, s) => sum + s.rating, 0) / publicSongs.length;
    const totalComparisons = publicSongs.reduce((sum, s) => sum + (s.comparisons || 0), 0);

    const statsData = [
        { value: publicSongs.length, label: 'Total Songs' },
        { value: drSongs.length, label: 'Deltarune' },
        { value: utSongs.length, label: 'Undertale' },
        { value: utySongs.length, label: 'UT Yellow' },
        { value: tsusSongs.length, label: 'TS!Underswap' },
        { value: await fetchFelfebStats(), label: 'Felfeb Votes' }
    ];

    statsData.forEach(stat => {
        const box = document.createElement('div');
        box.className = 'stat-box';
        box.innerHTML = `
            <div class="stat-value">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        `;
        quickStatsRow.appendChild(box);
    });

    // ──────────────────────────────────────────────
    // helper: compute section averages
    // ──────────────────────────────────────────────
    function computeSectionAverages(songSet, sectionLabels) {
        const stats = {};
        sectionLabels.forEach(l => { stats[l] = { sum: 0, count: 0 }; });
        songSet.forEach(s => {
            const sec = getSection(s);
            if (stats[sec]) {
                stats[sec].sum += s.rating;
                stats[sec].count++;
            }
        });
        return sectionLabels.map(l => stats[l].count ? stats[l].sum / stats[l].count : 0);
    }

    // ──────────────────────────────────────────────
    // top 10 highest rated
    // ──────────────────────────────────────────────
    const top10 = songs.slice(0, 10);

    new Chart(document.getElementById('votesChart'), {
        type: 'bar',
        data: {
            labels: top10.map(s => s.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Rating',
                data: top10.map(s => s.rating),
                backgroundColor: '#00f2ff',
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { min: 1400 } }
        }
    });

    // ──────────────────────────────────────────────
    // bottom 10 lowest rated
    // ──────────────────────────────────────────────
    const bottom10 = [...songs].sort((a, b) => a.rating - b.rating).slice(0, 10);

    new Chart(document.getElementById('bottom10Chart'), {
        type: 'bar',
        data: {
            labels: bottom10.map(s => s.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Rating',
                data: bottom10.map(s => s.rating),
                backgroundColor: '#333333',
                borderColor: '#666',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { min: 1000 } }
        }
    });

    // ──────────────────────────────────────────────
    // rating distribution
    // ──────────────────────────────────────────────
    const ratings = publicSongs.map(s => Math.round(s.rating));
    const bins = {};
    ratings.forEach(r => {
        const bin = Math.floor(r / 50) * 50;
        bins[bin] = (bins[bin] || 0) + 1;
    });
    const binLabels = Object.keys(bins).sort((a, b) => parseInt(a) - parseInt(b));
    const binData = binLabels.map(b => bins[b]);

    new Chart(document.getElementById('ratingDistChart'), {
        type: 'bar',
        data: {
            labels: binLabels.map(b => `${b}-${parseInt(b) + 50}`),
            datasets: [{
                label: 'Number of Songs',
                data: binData,
                backgroundColor: '#00ff9d',
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });

    // ──────────────────────────────────────────────
    // average rating by game
    // ──────────────────────────────────────────────
    const gameLabels = ['Deltarune', 'Undertale', 'UT Yellow', 'TS!Underswap'];
    const gameAvgs = [drSongs, utSongs, utySongs, tsusSongs].map(set =>
        set.length ? set.reduce((sum, s) => sum + s.rating, 0) / set.length : 0
    );

    new Chart(document.getElementById('avgByGameChart'), {
        type: 'bar',
        data: {
            labels: gameLabels,
            datasets: [{
                label: 'Average Rating',
                data: gameAvgs,
                backgroundColor: ['#00ff9d', '#ff00ff', '#ffff00'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 1200 } },
            plugins: { legend: { display: false } }
        }
    });

    // ──────────────────────────────────────────────
    // deltarune by chapter
    // ──────────────────────────────────────────────
    const drSections = ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4'];
    const drAvgs = computeSectionAverages(drSongs, drSections);

    new Chart(document.getElementById('drChapterChart'), {
        type: 'bar',
        data: {
            labels: drSections,
            datasets: [{
                label: 'Average Rating',
                data: drAvgs,
                backgroundColor: ['#00ff9d', '#00f2ff', '#ff00ff', '#ffff00'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 1200 } },
            plugins: { legend: { display: false } }
        }
    });

    // ──────────────────────────────────────────────
    // undertale by area
    // ──────────────────────────────────────────────
    const utSections = ['Ruins', 'Snowdin', 'Waterfall', 'Hotland / CORE', 'New Home'];
    const utAvgs = computeSectionAverages(utSongs, utSections);

    new Chart(document.getElementById('utAreaChart'), {
        type: 'bar',
        data: {
            labels: utSections,
            datasets: [{
                label: 'Average Rating',
                data: utAvgs,
                backgroundColor: ['#ff0000', '#00f2ff', '#0066ff', '#ff8800', '#ff00ff'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { min: 1200 } },
            plugins: { legend: { display: false } }
        }
    });

    // ──────────────────────────────────────────────
    // uty by region
    // ──────────────────────────────────────────────
    const utySections = ['Ruins', 'Snowdin', 'Dunes', 'Wild East', 'Steamworks', 'New Home'];
    const utyAvgs = computeSectionAverages(utySongs, utySections);

    new Chart(document.getElementById('utyRegionChart'), {
        type: 'bar',
        data: {
            labels: utySections,
            datasets: [{
                label: 'Average Rating',
                data: utyAvgs,
                backgroundColor: ['#ff0000', '#00f2ff', '#ffff00', '#ff8800', '#888888', '#ff00ff'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 1200 },
                x: {
                    ticks: { maxRotation: 45, minRotation: 30, font: { size: 10 } }
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // ──────────────────────────────────────────────
    // most volatile (biggest outliers from game mean)
    // ──────────────────────────────────────────────
    const gameMeans = { DR: gameAvgs[0], UT: gameAvgs[1], UTY: gameAvgs[2], TSUS: gameAvgs[3] };

    const withDeviation = publicSongs.map(s => ({
        ...s,
        game: getGame(s),
        deviation: s.rating - gameMeans[getGame(s)]
    }));

    // top 10 by absolute deviation
    const mostVolatile = [...withDeviation]
        .sort((a, b) => Math.abs(b.deviation) - Math.abs(a.deviation))
        .slice(0, 10);

    new Chart(document.getElementById('volatilityChart'), {
        type: 'bar',
        data: {
            labels: mostVolatile.map(s => s.name.substring(0, 18) + (s.name.length > 18 ? '...' : '')),
            datasets: [{
                label: 'Deviation from Game Avg',
                data: mostVolatile.map(s => s.deviation),
                backgroundColor: mostVolatile.map(s => s.deviation > 0 ? '#00ff9d' : '#ff0000'),
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const song = mostVolatile[context.dataIndex];
                            const sign = song.deviation > 0 ? '+' : '';
                            return `${song.name} (${song.game}): ${sign}${Math.round(song.deviation)}`;
                        }
                    }
                }
            }
        }
    });

    // ──────────────────────────────────────────────
    // the curve (all songs sorted)
    // ──────────────────────────────────────────────
    const allSorted = [...songs].sort((a, b) => b.rating - a.rating);

    new Chart(document.getElementById('curveChart'), {
        type: 'line',
        data: {
            labels: allSorted.map((_, i) => i + 1),
            datasets: [{
                label: 'Rating',
                data: allSorted.map(s => s.rating),
                borderColor: '#00f2ff',
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
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
                            return `${song.name}: ${Math.round(song.rating)}`;
                        }
                    }
                },
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Rank' } },
                y: { title: { display: true, text: 'Rating' } }
            }
        }
    });

    // ──────────────────────────────────────────────
    // chronological quality: 3 separate charts
    // ──────────────────────────────────────────────
    function makeChronoChart(canvasId, songSet, color, gameLabel) {
        // normalize x-axis: just use order within this game
        const sorted = [...songSet].sort((a, b) => a.id - b.id);
        new Chart(document.getElementById(canvasId), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: gameLabel,
                    data: sorted.map((s, i) => ({ x: i + 1, y: s.rating })),
                    backgroundColor: color,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
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
                            }
                        }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: { title: { display: true, text: 'Track Order' } },
                    y: { title: { display: true, text: 'Rating' } }
                }
            }
        });
    }

    makeChronoChart('chronoDrChart', drSongs, '#ff00ff', 'Deltarune');
    makeChronoChart('chronoUtChart', utSongs, '#00ff9d', 'Undertale');
    makeChronoChart('chronoUtyChart', utySongs, '#ffff00', 'UT Yellow');

    // ──────────────────────────────────────────────
    // duration vs rating (fixed: no zero-duration songs)
    // ──────────────────────────────────────────────
    const songsWithDuration = publicSongs.filter(s => s.duration && s.duration > 0);

    new Chart(document.getElementById('durationChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Songs',
                data: songsWithDuration.map(s => ({ x: s.duration, y: s.rating })),
                backgroundColor: '#ffff00',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const song = songsWithDuration.find(s => Math.abs(s.duration - context.raw.x) < 0.01 && s.rating === context.raw.y);
                            return `${song ? song.name : 'Unknown'}: ${Math.round(context.raw.y)} (${context.raw.x}s)`;
                        }
                    }
                },
                legend: { display: false }
            },
            scales: {
                x: {
                    title: { display: true, text: 'Duration (Seconds)' },
                    type: 'linear',
                    position: 'bottom'
                },
                y: { title: { display: true, text: 'Rating' } }
            }
        }
    });

    // ──────────────────────────────────────────────
    // most battled
    // ──────────────────────────────────────────────
    const mostBattled = [...publicSongs].sort((a, b) => b.comparisons - a.comparisons).slice(0, 10);

    new Chart(document.getElementById('battlesChart'), {
        type: 'bar',
        data: {
            labels: mostBattled.map(s => s.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Total Battles',
                data: mostBattled.map(s => s.comparisons),
                backgroundColor: '#ff8800',
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { beginAtZero: true } }
        }
    });

    // ──────────────────────────────────────────────
    // radar chart. keeping it because it looks cool.
    // ──────────────────────────────────────────────
    const radarLabels = ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4', 'UT', 'UTY', 'TSUS'];
    const radarStats = {};
    radarLabels.forEach(l => { radarStats[l] = { sum: 0, count: 0 }; });

    publicSongs.forEach(s => {
        const game = getGame(s);
        if (game === 'DR') {
            const sec = getSection(s);
            if (radarStats[sec]) {
                radarStats[sec].sum += s.rating;
                radarStats[sec].count++;
            }
        } else if (game === 'UT') {
            radarStats['UT'].sum += s.rating;
            radarStats['UT'].count++;
        } else if (game === 'UTY') {
            radarStats['UTY'].sum += s.rating;
            radarStats['UTY'].count++;
        } else {
            radarStats['TSUS'].sum += s.rating;
            radarStats['TSUS'].count++;
        }
    });

    const radarData = radarLabels.map(l => radarStats[l].count ? radarStats[l].sum / radarStats[l].count : 0);

    new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: {
            labels: radarLabels,
            datasets: [{
                label: 'Avg Rating',
                data: radarData,
                backgroundColor: 'rgba(0, 255, 157, 0.2)',
                borderColor: '#00ff9d',
                pointBackgroundColor: '#fff',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00ff9d'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: '#333' },
                    grid: { color: '#333' },
                    pointLabels: { color: '#fff', font: { size: 14 } },
                    suggestedMin: 1300
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // ──────────────────────────────────────────────
    // secrets unlock. keep this.
    // ──────────────────────────────────────────────
    const secretsUnlocked = localStorage.getItem('drSongRankerSecretsUnlocked');
    if (secretsUnlocked !== 'true') {
        localStorage.setItem('drSongRankerSecretsUnlocked', 'true');

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-title">SECRET TRACKS UNLOCKED</div>
            <div class="toast-message">Hidden songs are now available in the main ranker!</div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }

});
