document.addEventListener('DOMContentLoaded', async () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Chart options
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

    // Chart 1: Rating Distribution
    const ratings = songs.map(s => Math.round(s.rating));
    const bins = {};
    // Create bins of 50 points (e.g., 1200-1250, 1250-1300)
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
            maintainAspectRatio: false, // Fill the 400px height
            plugins: {
                legend: { display: false }
            }
        }
    });

    // Chart 2: Chapter Performance
    // Helper to map ID to Chapter
    function getChapter(id) {
        if (id <= 40) return 'Ch 1';
        if (id <= 87) return 'Ch 2';
        if (id <= 125) return 'Ch 3';
        return 'Ch 4'; // Assuming up to 165
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

    // Chart 3: Top 10
    const top20 = songs.slice(0, 20);

    new Chart(document.getElementById('votesChart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Songs',
                data: top20.map(s => ({ x: s.rating, y: s.comparisons || 0 })), // Assuming 'comparisons' is tracked in DB? 
                // Wait, DB might not have 'comparisons' column if it's only local?
                // Actually, app.js doesn't sync 'comparisons' to DB, only 'rating'.
                // Ah, the prompt said "Global charts". 
                // If 'comparisons' isn't in DB, we can't show global vote volume per song.
                // Let's check app.js recordCommunityVote.
                // It calls 'handle_vote'. We don't see the schema.
                // Assuming for now we only have 'rating'.
                // If we can't get comparisons, maybe we just plot Rating vs Rank (linear check)?
                // Or just Top 10 Ratings bar chart.
                // Let's stick to Top 10 Ratings for now if comparisons is missing.
                // Actually, let's try to fetch it. If it's missing, we'll fallback.
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

    // Switch to bar chart.

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



    // Chart 5: Bottom 10
    const bottom10 = [...songs].sort((a, b) => a.rating - b.rating).slice(0, 10);

    new Chart(document.getElementById('bottom10Chart'), {
        type: 'bar',
        data: {
            labels: bottom10.map(s => s.name.substring(0, 15) + '...'),
            datasets: [{
                label: 'Rating',
                data: bottom10.map(s => s.rating),
                backgroundColor: '#333333', // Dark grey for the losers
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

    // Chart 6: Sorted Ratings
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
                pointRadius: 0 // Smooth line, no dots
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

});
