// Wait until the entire HTML document is loaded and parsed
document.addEventListener('DOMContentLoaded', () => {

    // --- SUPABASE SETUP ---
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';
    
    // Check if the supabase object from the CDN is available
    if (!window.supabase) {
        console.error("Supabase client not loaded. Make sure the script tag is in your HTML.");
        alert("Error: Could not connect to the ranking service. Please refresh.");
        return; // Stop execution if supabase is not available
    }

    // This is the corrected initialization. We'll name our client 'supabase' for simplicity.
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- STATE MANAGEMENT ---
    let state = {
        songs: [],
        comparisons: 0,
    };

    let currentSongA, currentSongB;
    let previousRanking = [];
    let activePreviewTimeout = null; // ADD THIS LINE
    const PREVIEW_DURATION = 10000;
    const PREVIEW_START_TIME = 30;

    // --- DOM ELEMENTS ---
    const songAName = document.getElementById('songA-name');
    const songBName = document.getElementById('songB-name');
    const songACard = document.getElementById('songA-card');
    const songBCard = document.getElementById('songB-card');
    const arena = document.querySelector('.arena');
    const chooseABtn = document.getElementById('chooseA-btn');
    const chooseBBtn = document.getElementById('chooseB-btn');
    const tieBtn = document.getElementById('tie-btn');
    const resetBtn = document.getElementById('reset-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const rankingList = document.getElementById('ranking-list');
    const audioA = document.getElementById('audioA');
    const audioB = document.getElementById('audioB');
    const previewBtns = document.querySelectorAll('.preview-btn');
    const toggleRankingsBtn = document.getElementById('toggle-rankings-btn');
    const rankingContainer = document.querySelector('.ranking-container');
    const myRankingBtn = document.getElementById('my-ranking-btn');
    const communityRankingBtn = document.getElementById('community-ranking-btn');

    // --- CORE LOGIC ---
    function updateElo(winnerRating, loserRating) {
        const kFactor = 32;
        const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
        const ratingChange = kFactor * (1 - expectedWin);
        return {
            newWinnerRating: winnerRating + ratingChange,
            newLoserRating: loserRating - ratingChange,
        };
    }

    function presentNewPair() {
        const song1 = state.songs[Math.floor(Math.random() * state.songs.length)];
        const sortedOpponents = [...state.songs]
            .filter(s => s.id !== song1.id)
            .sort((a, b) => Math.abs(a.rating - song1.rating) - Math.abs(b.rating - song1.rating));
        const song2 = sortedOpponents[0];

        currentSongA = song1;
        currentSongB = song2;

        console.log('Presenting pair:', currentSongA.name, 'vs', currentSongB.name);
        songAName.textContent = currentSongA.name;
        songBName.textContent = currentSongB.name;
        console.log('Song names have been set in the DOM.');
        chooseABtn.textContent = `I prefer ${currentSongA.name}`;
        chooseBBtn.textContent = `I prefer ${currentSongB.name}`;

        audioA.src = encodeURI(currentSongA.file);
        audioB.src = encodeURI(currentSongB.file);

        // ADD THESE TWO LINES to force the browser to start loading the audio
        audioA.load();
        audioB.load();

        // Animation logic
        arena.classList.remove('slide-in');
        // We use a timeout of 0 to allow the browser to remove the class before re-adding it,
        // which is necessary to re-trigger the animation.
        setTimeout(() => {
            songACard.classList.remove('selected', 'loser');
            songBCard.classList.remove('selected', 'loser');
            arena.classList.add('slide-in');
        }, 0);
    }

    function handleChoice(winner) {
        if (!currentSongA || !currentSongB) return;

        // Stop any playing audio
        audioA.pause();
        audioB.pause();
        if (activePreviewTimeout) {
            clearTimeout(activePreviewTimeout);
        }

        if (winner) {
            const winnerSong = (winner === 'A') ? currentSongA : currentSongB;
            const loserSong = (winner === 'A') ? currentSongB : currentSongA;
            const winnerCard = (winner === 'A') ? songACard : songBCard;
            const loserCard = (winner === 'A') ? songBCard : songACard;

            // Apply visual feedback
            winnerCard.classList.add('selected');
            loserCard.classList.add('loser');

            const { newWinnerRating, newLoserRating } = updateElo(winnerSong.rating, loserSong.rating);
            winnerSong.rating = newWinnerRating;
            loserSong.rating = newLoserRating;
            
            winnerSong.comparisons++;
            loserSong.comparisons++;
            state.comparisons++;
            
            recordCommunityVote(winnerSong.id, loserSong.id);
        }
        
        // Wait for the animation to play out before updating
        setTimeout(() => {
            updateApp();
        }, 1200); // 1.2 seconds delay
    }

    // Replace the old playPreview function with this one
    function playPreview(songKey) {
        // First, if another preview is scheduled to be paused, cancel that timer.
        if (activePreviewTimeout) {
            clearTimeout(activePreviewTimeout);
        }

        const audioEl = (songKey === 'A') ? audioA : audioB;
        const otherAudioEl = (songKey === 'A') ? audioB : audioA;
        otherAudioEl.pause(); // Stop other preview if playing
        
        audioEl.currentTime = PREVIEW_START_TIME;
        
        // The .play() method returns a promise. We'll use it to handle things gracefully.
        const playPromise = audioEl.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Audio is playing. Now, set the timer to pause it.
                // Store the ID of this new timer so we can cancel it later if needed.
                activePreviewTimeout = setTimeout(() => {
                    audioEl.pause();
                }, PREVIEW_DURATION);
            }).catch(error => {
                // This will catch errors, e.g., if the user hasn't interacted with the page.
                console.error("Audio playback error:", error);
            });
        }
    }

    // --- Community Functions ---
    async function recordCommunityVote(winnerId, loserId) {
        try {
            // Using the simplified 'supabase' variable
            const { error } = await supabase.rpc('handle_vote', {
                winner_id: winnerId,
                loser_id: loserId
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error recording community vote:", error.message);
        }
    }

    async function displayCommunityRankings() {
        rankingList.innerHTML = '<li>Loading community data...</li>';
        try {
            // Using the simplified 'supabase' variable
            const { data, error } = await supabase
                .from('songs')
                .select('name, rating')
                .order('rating', { ascending: false });

            if (error) throw error;

            rankingList.innerHTML = '';
            data.forEach((song, index) => {
                const li = document.createElement('li');
                li.textContent = song.name;
                const details = document.createElement('small');
                details.textContent = ` (Rating: ${Math.round(song.rating)})`;
                li.appendChild(details);
                rankingList.appendChild(li);
            });
        } catch (error) {
            rankingList.innerHTML = `<li>Error loading rankings: ${error.message}</li>`;
        }
    }

    // --- Display and State Functions ---
    function displayRankings() {
        const sortedSongs = [...state.songs].sort((a, b) => b.rating - a.rating);
        const newRanking = sortedSongs.map(s => s.id);

        rankingList.innerHTML = ''; // Clear the list before re-populating

        sortedSongs.forEach((song, index) => {
            const li = document.createElement('li');
            li.dataset.songId = song.id;
            li.textContent = song.name;
            
            const details = document.createElement('small');
            details.textContent = ` (Rating: ${Math.round(song.rating)})`;
            li.appendChild(details);

            // Check for rank changes
            const oldIndex = previousRanking.indexOf(song.id);
            if (oldIndex !== -1) {
                if (index < oldIndex) {
                    li.classList.add('rank-up');
                } else if (index > oldIndex) {
                    li.classList.add('rank-down');
                }
            }
            
            rankingList.appendChild(li);
        });

        // Update the previous ranking state for the next comparison
        previousRanking = newRanking;
    }

    function updateProgress() {
        const totalSongs = state.songs.length;
        const comparisonsNeeded = totalSongs * 2; // An arbitrary goal for 100%
        const progressPercentage = Math.min((state.comparisons / comparisonsNeeded) * 100, 100);

    }

    function saveState() {
        try {
            localStorage.setItem('drSongRankerState', JSON.stringify(state));
        } catch (e) {
            console.error("Could not save state to localStorage:", e);
        }
    }

    function loadState() {
        const savedState = localStorage.getItem('drSongRankerState');
        if (savedState) {
            state = JSON.parse(savedState);
            if (!state.songs || state.songs.length === 0) {
                initializeNewState();
            }
        } else {
            initializeNewState();
        }
    }
    
    function initializeNewState() {
        state.songs = JSON.parse(JSON.stringify(songList)); 
        state.comparisons = 0;
    }

    function resetState() {
        if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
            localStorage.removeItem('drSongRankerState');
            initializeNewState();
            updateApp();
        }
    }

    function updateApp() {
        if (myRankingBtn.classList.contains('active')) {
            displayRankings();
        }
        updateProgress();
        presentNewPair();
        saveState();
    }
    
    // --- INITIALIZATION ---
    if (typeof songList === 'undefined' || songList.length === 0) {
        alert("Error: Song data not found. Make sure 'app_song_data.js' is present.");
        return;
    }

    loadState();
    
    // Event Listeners
    chooseABtn.addEventListener('click', () => handleChoice('A'));
    chooseBBtn.addEventListener('click', () => handleChoice('B'));
    tieBtn.addEventListener('click', () => handleChoice(null));
    resetBtn.addEventListener('click', resetState);
    previewBtns.forEach(btn => {
        btn.addEventListener('click', () => playPreview(btn.dataset.song));
    });
    toggleRankingsBtn.addEventListener('click', () => {
        rankingContainer.classList.toggle('visible');
    });

    myRankingBtn.addEventListener('click', () => {
        communityRankingBtn.classList.remove('active');
        myRankingBtn.classList.add('active');
        displayRankings();
    });

    communityRankingBtn.addEventListener('click', () => {
        myRankingBtn.classList.remove('active');
        communityRankingBtn.classList.add('active');
        displayCommunityRankings();
    });

    // Start the app
    updateApp();
});