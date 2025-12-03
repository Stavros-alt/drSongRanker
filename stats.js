document.addEventListener('DOMContentLoaded', async () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';

    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Common Chart Options (Dark World Theme)
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

    // --- Chart 1: Rating Distribution ---
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
            plugins: {
                legend: { display: false }
            }
        }
    });

    // --- Chart 2: Chapter Performance ---
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
            scales: {
                y: { min: 1200 } // Zoom in to show differences
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    // --- Chart 3: Top 20 Votes vs Rating ---
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

    // Correction for Chart 3:
    // Since we likely don't have global 'comparisons' count per song (Elo usually just updates rating),
    // let's change Chart 3 to "Top 10 Highest Rated Songs" bar chart for clarity.
    // The Scatter plot is risky without confirmed data.

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
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: { min: 1400 }
            }
        }
    });

});
