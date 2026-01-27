document.addEventListener('DOMContentLoaded', async () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // chart options. it's never gonna look right.
    Chart.defaults.color = '#fff';
    Chart.defaults.borderColor = '#333';
    Chart.defaults.font.family = "'Roboto Mono', monospace";

    async function fetchData() {
        const { data, error } = await supabase
            .from('songs')
            .select('id, name, rating, comparisons')
            .order('rating', { ascending: false });

        if (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load stats.");
            return [];
        }
        return data;
    }

    const dbSongs = await fetchData();
    if (!dbSongs.length) return;

    // merge with local data to get duration/metadata
    const localSongs = window.songList || [];
    const songs = dbSongs.map(dbS => {
        const local = localSongs.find(l => l.id === dbS.id);
        return {
            ...dbS,
            duration: local ? local.duration : 0,
            file: local ? local.file : ''
        };
    });

    // rating dist. whatever.
    const songsWithChapters = songs.map(s => {
        const chapters = [];
        if (s.id <= 40) chapters.push('Ch 1');
        if ((s.id >= 41 && s.id <= 87) || s.id === 38 || s.id === 40) chapters.push('Ch 2');
        if (s.id >= 88 && s.id <= 125) chapters.push('Ch 3');
        if (s.id >= 126 && s.id <= 200) chapters.push('Ch 4');
        return { ...s, chapters };
    });

    // Exclude hidden songs (IDs 201+) from all-time stats to prevent pollution
    const publicSongs = songsWithChapters.filter(s => s.id <= 200);

    const ratings = publicSongs.map(s => Math.round(s.rating));
    const bins = {};
    ratings.forEach(r => {
        const bin = Math.floor(r / 50) * 50;
        bins[bin] = (bins[bin] || 0) + 1;
    });

    // Actually calculate the stats i forgot to write
    const chapterStats = {
        'Ch 1': { sum: 0, count: 0 },
        'Ch 2': { sum: 0, count: 0 },
        'Ch 3': { sum: 0, count: 0 },
        'Ch 4': { sum: 0, count: 0 }
    };

    publicSongs.forEach(song => {
        song.chapters.forEach(ch => {
            if (chapterStats[ch]) {
                chapterStats[ch].sum += song.rating;
                chapterStats[ch].count++;
            }
        });
    });

    const chLabels = Object.keys(chapterStats);
    const chData = chLabels.map(ch => chapterStats[ch].sum / chapterStats[ch].count);

    new Chart(document.getElementById('chapterChart'), {
        type: 'bar',
        data: {
            labels: chLabels,
            datasets: [{
                label: 'Average Rating',
                data: chData,
                backgroundColor: ['#00ff9d', '#00f2ff', '#ff00ff', '#ffff00'],
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 1200 }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // random numbers that look professional.
    const top20 = publicSongs.slice(0, 20);

    new Chart(document.getElementById('votesChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Songs',
                data: top20.map(s => ({ x: s.rating, y: s.comparisons || 0 })),
                backgroundColor: '#ff00ff'
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { title: { display: true, text: 'Rating' } },
                y: { title: { display: true, text: 'Estimated Votes (If Available)' } }
            }
        }
    });

    // visual clutter.
    const top10 = songs.slice(0, 10);
    const top10Chart = Chart.getChart("votesChart");
    if (top10Chart) top10Chart.destroy();

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
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { min: 1400 }
            }
        }
    });



    // the absolute failures.
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

    // Rating Distribution (The missing link)
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
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // the slope of despair.
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

    // pure unadulterated chaos.
    // chronological order view. but exclude secrets.
    new Chart(document.getElementById('chronoChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Songs',
                data: publicSongs.map(s => ({ x: s.id, y: s.rating })),
                backgroundColor: '#ff00ff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const song = publicSongs.find(s => s.id === context.raw.x);
                            return `${song.name}: ${Math.round(context.raw.y)}`;
                        }
                    }
                },
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Song ID (Chronological)' } },
                y: { title: { display: true, text: 'Rating' } }
            }
        }
    });


    // useless shapes.
    const chapterAverages = chData;

    new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: {
            labels: chLabels,
            datasets: [{
                label: 'Avg Rating',
                data: chapterAverages,
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

    // dynamic tiers based on percentiles. better than arbitrary numbers.
    // S+ (Top 5%), S (Next 10%), A (Next 20%), B (Next 30%), C (Next 20%), D (Bottom 15%)
    const sortedByRating = [...publicSongs].sort((a, b) => b.rating - a.rating);
    const total = sortedByRating.length;

    // threshold indices
    const iSPlus = Math.floor(total * 0.05);
    const iS = Math.floor(total * 0.15);
    const iA = Math.floor(total * 0.35);
    const iB = Math.floor(total * 0.65);
    const iC = Math.floor(total * 0.85);

    const tiers = { 'S+': 0, 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };

    sortedByRating.forEach((s, index) => {
        if (index < iSPlus) tiers['S+']++;
        else if (index < iS) tiers['S']++;
        else if (index < iA) tiers['A']++;
        else if (index < iB) tiers['B']++;
        else if (index < iC) tiers['C']++;
        else tiers['D']++;
    });

    new Chart(document.getElementById('tierChart'), {
        type: 'doughnut',
        data: {
            labels: Object.keys(tiers),
            datasets: [{
                data: Object.values(tiers),
                backgroundColor: [
                    '#ff00ff', // S+ Magenta
                    '#00f2ff', // S Cyan
                    '#00ff9d', // A Green
                    '#ffff00', // B Yellow
                    '#ff8800', // C Orange
                    '#ff0000'  // D Red
                ],
                borderColor: '#000',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#fff' } }
            }
        }
    });

    // oh look, you found the stats. have some secrets.
    const secretsUnlocked = localStorage.getItem('drSongRankerSecretsUnlocked');
    if (secretsUnlocked !== 'true') {
        localStorage.setItem('drSongRankerSecretsUnlocked', 'true');

        // Create themed toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-title">SECRET TRACKS UNLOCKED</div>
            <div class="toast-message">Hidden songs are now available in the main ranker!</div>
        `;

        document.body.appendChild(toast);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            toast.style.transition = 'opacity 0.5s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 5000);
    }


    // new stats. user requested this. i deliver.

    // 1. does length matter? (duration vs rating)
    // kept the short clips. chaos is good.
    new Chart(document.getElementById('durationChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Songs',
                data: publicSongs.map(s => ({ x: s.duration, y: s.rating })),
                backgroundColor: '#ffff00', // yellow because why not
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
                            const song = publicSongs.find(s => Math.abs(s.duration - context.raw.x) < 0.01 && s.rating === context.raw.y);
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
                y: {
                    title: { display: true, text: 'Rating' }
                }
            }
        }
    });

    // 2. most battled.
    const mostBattled = [...publicSongs].sort((a, b) => b.comparisons - a.comparisons).slice(0, 10);

    new Chart(document.getElementById('battlesChart'), {
        type: 'bar',
        data: {
            labels: mostBattled.map(s => s.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Total Battles',
                data: mostBattled.map(s => s.comparisons),
                backgroundColor: '#ff8800', // orange
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

    // 3. chapter mvps.
    // we already have 'songsWithChapters'.
    const mvpContainer = document.getElementById('mvp-container');
    const chapters = ['Ch 1', 'Ch 2', 'Ch 3', 'Ch 4'];

    chapters.forEach(ch => {
        const chapterSongs = publicSongs.filter(s => s.chapters.includes(ch));
        if (chapterSongs.length === 0) return;

        const mvp = chapterSongs.reduce((prev, current) => (prev.rating > current.rating) ? prev : current);

        const card = document.createElement('div');
        card.style.border = '1px solid var(--accent-color, #fff)';
        card.style.padding = '10px';
        card.style.textAlign = 'center';
        card.style.borderRadius = '8px';
        card.style.background = '#111';

        card.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: #aaa;">${ch} MVP</h3>
            <div style="font-weight: bold; color: #fff; margin-bottom: 5px;">${mvp.name}</div>
            <div style="color: var(--accent-color, #00ff9d); font-size: 1.2em;">${Math.round(mvp.rating)}</div>
        `;
        mvpContainer.appendChild(card);
    });

});


