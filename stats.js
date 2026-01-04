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

    const songs = await fetchData();
    if (!songs.length) return;

    // rating dist. whatever.
    const ratings = songs.map(s => Math.round(s.rating));
    const bins = {};
    // buckets.
    ratings.forEach(r => {
        const bin = Math.floor(r / 50) * 50;
        bins[bin] = (bins[bin] || 0) + 1;
    });

    const sortedBins = Object.keys(bins).sort((a, b) => a - b);
    const distData = sortedBins.map(b => bins[b]);
    const distLabels = sortedBins.map(b => `${b}-${parseInt(b) + 50}`);

    new Chart(document.getElementById('ratingDistChart'), {
        type: 'bar',
        data: {
            labels: distLabels,
            datasets: [{
                label: 'Number of Songs',
                data: distData,
                backgroundColor: '#00ff9d',
                borderColor: '#fff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Chapters.
    function getChapter(id) {
        if (id <= 40) return 'Ch 1';
        if (id <= 87) return 'Ch 2';
        if (id <= 125) return 'Ch 3';
        return 'Ch 4';
    }

    const chapterStats = {
        'Ch 1': { sum: 0, count: 0 },
        'Ch 2': { sum: 0, count: 0 },
        'Ch 3': { sum: 0, count: 0 },
        'Ch 4': { sum: 0, count: 0 }
    };

    songs.forEach(s => {
        const chapters = [];
        if (s.id <= 40) chapters.push('Ch 1');
        // fine. they go in ch 2 too.
        if ((s.id >= 41 && s.id <= 87) || s.id === 38 || s.id === 40) {
            if (!chapters.includes('Ch 2')) chapters.push('Ch 2');
        }
        if (s.id >= 88 && s.id <= 125) chapters.push('Ch 3');
        if (s.id >= 126) chapters.push('Ch 4');

        chapters.forEach(ch => {
            if (chapterStats[ch]) {
                chapterStats[ch].sum += s.rating;
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

    // big numbers.
    const top20 = songs.slice(0, 20);

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

    // mess.
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



    // the bottom.
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

    // the curve.
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

    // chaos.
    new Chart(document.getElementById('chronoChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Songs',
                data: songs.map(s => ({ x: s.id, y: s.rating })),
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
                            const song = songs.find(s => s.id === context.raw.x);
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

    // tiers.
    const tiers = { 'S+': 0, 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
    songs.forEach(s => {
        if (s.rating >= 1600) tiers['S+']++;
        else if (s.rating >= 1550) tiers['S']++;
        else if (s.rating >= 1500) tiers['A']++;
        else if (s.rating >= 1450) tiers['B']++;
        else if (s.rating >= 1400) tiers['C']++;
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



});
