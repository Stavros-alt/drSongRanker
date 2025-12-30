document.addEventListener('DOMContentLoaded', async () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // chart options. making this look decent is impossible.
    Chart.defaults.color = '#fff';
    Chart.defaults.borderColor = '#333';
    Chart.defaults.font.family = "'Roboto Mono', monospace";

    async function fetchData() {
        const { data, error } = await supabase
            .from('songs')
            .select('*')
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

    // chart 1: rating distribution.
    // just a bar chart. move along.
    const ratings = songs.map(s => Math.round(s.rating));
    const bins = {};
    // buckets of 50. arbitrary number, whatever.
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
            maintainAspectRatio: false, // fill the space
            plugins: {
                legend: { display: false }
            }
        }
    });

    // chart 2: chapter stats.
    // yes, this switch is ugly. i don't care.
    function getChapter(id) {
        if (id <= 40) return 'Ch 1';
        if (id <= 87) return 'Ch 2';
        if (id <= 125) return 'Ch 3';
        return 'Ch 4'; // sure.
    }

    const chapterStats = {
        'Ch 1': { sum: 0, count: 0 },
        'Ch 2': { sum: 0, count: 0 },
        'Ch 3': { sum: 0, count: 0 },
        'Ch 4': { sum: 0, count: 0 }
    };

    songs.forEach(s => {
        const ch = getChapter(s.id);
        if (chapterStats[ch]) {
            chapterStats[ch].sum += s.rating;
            chapterStats[ch].count++;
        }
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
                y: { min: 1200 } // Zoom in to show differences
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // chart 3: top 10.
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

    // scatter was ugly. bars are less ugly.
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
            indexAxis: 'y', // Horizontal bar
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



    // chart 5: bottom 10. garbage.
    const bottom10 = [...songs].sort((a, b) => a.rating - b.rating).slice(0, 10);

    new Chart(document.getElementById('bottom10Chart'), {
        type: 'bar',
        data: {
            labels: bottom10.map(s => s.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Rating',
                data: bottom10.map(s => s.rating),
                backgroundColor: '#333333', // dark like this code base
                borderColor: '#666',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { min: 1000 } } // Adjust min to show scale
        }
    });

    // chart 6: the curve. line go up.
    const allSorted = [...songs].sort((a, b) => b.rating - a.rating);

    new Chart(document.getElementById('curveChart'), {
        type: 'line',
        data: {
            labels: allSorted.map((_, i) => i + 1), // Rank 1 to N
            datasets: [{
                label: 'Rating',
                data: allSorted.map(s => s.rating),
                borderColor: '#00f2ff',
                backgroundColor: 'rgba(0, 242, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 0 // smooth it out.
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

    // chart 7. scatter. complete chaos.
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

    // math. i think this is right.
    const mean = songs.reduce((sum, s) => sum + s.rating, 0) / songs.length;
    const variance = songs.reduce((sum, s) => sum + Math.pow(s.rating - mean, 2), 0) / songs.length;
    const stdDev = Math.sqrt(variance);

    // chart 8: radar chart.
    // useless but looks cool.
    const chapterAverages = chData;
    // raw data, whatever.

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
                    suggestedMin: 1300 // Focus on the differences
                }
            },
            plugins: { legend: { display: false } }
        }
    });

    // chart 9: tier list. pie charts are awful.
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

    // chart 10: name length vs rating. 
    // does length matter? probably not.
    new Chart(document.getElementById('nameLengthChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Songs',
                data: songs.map(s => ({ x: s.name.length, y: s.rating })),
                backgroundColor: '#ffff00'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: (context) => {
                            const song = songs.find(s => s.name.length === context.raw.x && s.rating === context.raw.y);
                            // close enough.
                            return `${song ? song.name : 'Song'}: ${Math.round(context.raw.y)}`;
                        }
                    }
                },
                legend: { display: false }
            },
            scales: {
                x: { title: { display: true, text: 'Name Length (Chars)' } },
                y: { title: { display: true, text: 'Rating' } }
            }
        }
    });

    const stdDevDisplay = document.getElementById('stdDevDisplay');
    if (stdDevDisplay) {
        stdDevDisplay.textContent = `σ ${stdDev.toFixed(1)}`;
    }

});
