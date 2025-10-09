/**
 * @file app.js
 * @author Stavrianos Galben
 * @date 2024-10-26
 * @desc Main application logic for Deltarune Song Ranker with Elo-based ranking system and Supabase integration.
 */

document.addEventListener('DOMContentLoaded', () => {

    // Supabase integration for community rankings and statistics
    // Using Supabase for real-time data synchronization and community features
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';
    
    // Check if the supabase object from the CDN is available
    if (!window.supabase) {
        console.error("Supabase client not loaded. Make sure the script tag is in your HTML.");
        alert("Error: Could not connect to the ranking service. Please refresh.");
        return; // Stop execution if supabase is not available
    }

    // Initialize Supabase client
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    /**
     * Maps easter egg images to specific songs that trigger them
     * Adds fun visual elements during comparisons
     */
    const songToImageMap = {
      'funGang.jpeg': ["Don't Forget", "Faint Courage", "THE LEGEND", "Empty Town", "My Castle Town", "Field of Hopes and Dreams", "Susie", "Vs. Susie", "Imminent Death"],
      'spamtenna.jpeg': ["Spamton", "NOW'S YOUR CHANCE TO BE A", "BIG SHOT", "Dialtone", "HEY EVERY !", "Keygen", "Deal Gone Wrong", "A Real Boy!", "It's TV Time!"],
      'bergentruck.jpeg': ["Lost Girl", "Girl Next Door", "Ferris Wheel"],
      'rouxlsTwerk.jpeg': ["Rouxls Kaard", "It's Pronounced -Rules-", "Ruder Buster"],
    };

    // Centralized state management for application data
    // Keeps track of songs, comparisons, and other critical data
    let state = {
        songs: [],
        comparisons: 0,
    };

    // Global variables for managing current comparison and UI state
    // These variables are used throughout the application for tracking state
    let currentSongA, currentSongB;
    let previousRanking = [];
    let activePreviewTimeout = null; 
    let currentChapterFilter = 'all'; 
    const PREVIEW_DURATION = 10000;
    const PREVIEW_START_TIME = 30;

    // Cached DOM element references for performance optimization
    // Reduces repeated DOM lookups for better performance
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
    const filterBtns = document.querySelectorAll('.filter-btn');
    const easterEggContainer = document.getElementById('easter-egg-container');

    /**
     * Updates song ratings using the Elo rating system
     * Implements the Elo rating algorithm to adjust ratings based on match outcomes
     * @function updateElo
     * @param {number} winnerRating - Current rating of the winning song
     * @param {number} loserRating - Current rating of the losing song
     * @returns {Object} Object containing new ratings for both songs
     */
    function updateElo(winnerRating, loserRating) {
        const kFactor = 32;
        const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
        const ratingChange = kFactor * (1 - expectedWin);
        return {
            newWinnerRating: winnerRating + ratingChange,
            newLoserRating: loserRating - ratingChange,
        };
    }

    /**
     * Selects and displays a new pair of songs for comparison
     * Prioritizes songs with similar ratings for more meaningful comparisons
     * @function presentNewPair
     */
    function presentNewPair() {
        const song1 = state.songs[Math.floor(Math.random() * state.songs.length)];
        const sortedOpponents = [...state.songs]
            .filter(s => s.id !== song1.id)
            .sort((a, b) => Math.abs(a.rating - song1.rating) - Math.abs(b.rating - song1.rating));
        const song2 = sortedOpponents[0];

        currentSongA = song1;
        currentSongB = song2;

        checkAndTriggerEasterEgg(currentSongA, currentSongB);

        songAName.textContent = currentSongA.name;
        songBName.textContent = currentSongB.name;
        chooseABtn.textContent = `I prefer ${currentSongA.name}`;
        chooseBBtn.textContent = `I prefer ${currentSongB.name}`;

        audioA.src = encodeURI(currentSongA.file);
        audioB.src = encodeURI(currentSongB.file);

        // Force the browser to start loading the audio
        audioA.load();
        audioB.load();

        // Animation logic - re-trigger slide-in animation
        arena.classList.remove('slide-in');
        // Use timeout to allow browser to remove class before re-adding
        setTimeout(() => {
            songACard.classList.remove('selected', 'loser');
            songBCard.classList.remove('selected', 'loser');
            arena.classList.add('slide-in');
        }, 0);
    }

    /**
     * Processes user choice in a comparison and updates ratings
     * Handles the logic for updating ratings based on user selection
     * @function handleChoice
     * @param {string|null} winner - 'A' if first song won, 'B' if second song won, null for tie/skip
     */
    function handleChoice(winner) {
        if (!currentSongA || !currentSongB) return;

        if (winner) {
            const winnerSong = (winner === 'A') ? currentSongA : currentSongB;
            const loserSong = (winner === 'A') ? currentSongB : currentSongA;

            const { newWinnerRating, newLoserRating } = updateElo(winnerSong.rating, loserSong.rating);
            winnerSong.rating = newWinnerRating;
            loserSong.rating = newLoserRating;
            
            winnerSong.comparisons++;
            loserSong.comparisons++;
            state.comparisons++;
            
            recordCommunityVote(winnerSong.id, loserSong.id);
            fetchAndDisplayAllTimeStats(); // Update stats after each vote
        }
        
        // Update the app for the next round
        updateApp();
    }

    /**
     * Plays a preview of a song for a limited duration
     * Allows users to preview songs before making a choice
     * @function playPreview
     * @param {string} songKey - 'A' or 'B' to identify which song to play
     */
    function playPreview(songKey) {
        // Cancel any existing preview timer
        if (activePreviewTimeout) {
            clearTimeout(activePreviewTimeout);
        }

        const audioEl = (songKey === 'A') ? audioA : audioB;
        const otherAudioEl = (songKey === 'A') ? audioB : audioA;
        otherAudioEl.pause(); // Stop other preview if playing
        
        audioEl.currentTime = PREVIEW_START_TIME;
        
        // The .play() method returns a promise for error handling
        const playPromise = audioEl.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Audio is playing. Set timer to pause it.
                activePreviewTimeout = setTimeout(() => {
                    audioEl.pause();
                }, PREVIEW_DURATION);
            }).catch(error => {
                // Handle errors (e.g., user hasn't interacted with page)
                console.error("Audio playback error:", error);
            });
        }
    }

    /**
     * Randomly triggers easter egg images during song comparisons
     * Adds surprise visual elements to enhance user experience
     * @function checkAndTriggerEasterEgg
     * @param {Object} songA - First song in comparison
     * @param {Object} songB - Second song in comparison
     */
    function checkAndTriggerEasterEgg(songA, songB) {
        // 5% chance for an easter egg to appear
        if (Math.random() > 0.05) {
            return;
        }
        
        if (easterEggContainer.classList.contains('show-easter-egg')) {
            return;
        }

        for (const [imageFile, songList] of Object.entries(songToImageMap)) {
            if (songList.includes(songA.name) || songList.includes(songB.name)) {
                easterEggContainer.style.backgroundImage = `url(Art/${imageFile})`;
                easterEggContainer.classList.add('show-easter-egg');

                easterEggContainer.addEventListener('animationend', () => {
                    easterEggContainer.classList.remove('show-easter-egg');
                }, { once: true });
                
                return;
            }
        }
    }

    /**
     * Records user vote in the community database
     * Sends vote data to Supabase for community rankings
     * @function recordCommunityVote
     * @param {number} winnerId - ID of the winning song
     * @param {number} loserId - ID of the losing song
     */
    async function recordCommunityVote(winnerId, loserId) {
        try {
            const { error } = await supabaseClient.rpc('handle_vote', {
                winner_id: winnerId,
                loser_id: loserId
            });
            if (error) throw error;
        } catch (error) {
            console.error("Error recording community vote:", error.message);
        }
    }

    /**
     * Tracks unique visitors using localStorage and Supabase
     * Increments visitor count in the database for analytics
     * @function handleUniqueVisitor
     */
    async function handleUniqueVisitor() {
        if (!localStorage.getItem('hasVisitedDrRanker')) {
            try {
                const { error } = await supabaseClient.rpc('increment_visitor_count');
                if (error) throw error;
                localStorage.setItem('hasVisitedDrRanker', 'true');
            } catch (error) {
                console.error("Error incrementing visitor count:", error.message);
            }
        }
    }

    /**
     * Fetches and displays site statistics (visitors and votes)
     * Retrieves and shows community engagement metrics
     * @function fetchAndDisplayAllTimeStats
     */
    async function fetchAndDisplayAllTimeStats() {
        try {
            // Fetch total visitor count
            const { data: visitorData, error: visitorError } = await supabaseClient
                .from('site_stats')
                .select('total_visitors')
                .eq('id', 1)
                .single();

            // Handle special "no rows found" error code
            if (visitorError && visitorError.code !== 'PGRST116') {
                throw visitorError;
            }

            const visitors = visitorData ? visitorData.total_visitors : 0;
            const visitorStat = document.getElementById('visitor-stat');
            if (visitorStat) visitorStat.textContent = `Total Visitors: ${visitors}`;

            // Fetch total vote count
            const { data: voteData, error: voteError } = await supabaseClient
                .rpc('get_total_votes');

            if (voteError) {
                throw voteError;
            }
            
            // Handle null response for votes
            const votes = voteData || 0;
            const voteStat = document.getElementById('vote-stat');
            if (voteStat) voteStat.textContent = `Total Votes: ${votes}`;

        } catch (error) {
            console.error("CRITICAL ERROR fetching stats:", error);
            const visitorStat = document.getElementById('visitor-stat');
            const voteStat = document.getElementById('vote-stat');
            if (visitorStat) visitorStat.textContent = "Stats: Error";
            if (voteStat) voteStat.textContent = "";
        }
    }

    /**
     * Displays community rankings from the database
     * Fetches and shows the community's ranked song list
     * @function displayCommunityRankings
     */
    async function displayCommunityRankings() {
        rankingList.innerHTML = '<li>Loading community data...</li>';
        try {
            const { data, error } = await supabaseClient
                .from('songs')
                .select('name, id, rating')
                .order('rating', { ascending: false });

            if (error) throw error;
            
            // Filter the data we received from Supabase
            const filteredSongs = filterSongsByChapter(data, currentChapterFilter);

            rankingList.innerHTML = '';
            filteredSongs.forEach((song, index) => {
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

    /**
     * Displays user's personal rankings
     * Shows the user's own ranked song list based on their votes
     * @function displayRankings
     */
    function displayRankings() {
        rankingList.innerHTML = '';
        
        // Filter the songs from the state FIRST
        const filteredSongs = filterSongsByChapter(state.songs, currentChapterFilter);

        const sortedSongs = [...filteredSongs].sort((a, b) => b.rating - a.rating);
        
        sortedSongs.forEach((song, index) => {
            const li = document.createElement('li');
            li.textContent = song.name;
            const details = document.createElement('small');
            details.textContent = ` (Rating: ${Math.round(song.rating)})`;
            li.appendChild(details);
            rankingList.appendChild(li);
        });
    }

    /**
     * Updates the progress bar based on comparison count
     * Provides visual feedback on user progress
     * @function updateProgress
     */
    function updateProgress() {
        const totalSongs = state.songs.length;
        const comparisonsNeeded = totalSongs * 2; // An arbitrary goal for 100%
        const progressPercentage = Math.min((state.comparisons / comparisonsNeeded) * 100, 100);

        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${state.comparisons} Comparisons Made`;
    }

    /**
     * Saves application state to localStorage
     * Persists user data between sessions
     * @function saveState
     */
    function saveState() {
        try {
            localStorage.setItem('drSongRankerState', JSON.stringify(state));
        } catch (e) {
            console.error("Could not save state to localStorage:", e);
        }
    }

    /**
     * Loads application state from localStorage
     * Restores user data from previous sessions
     * @function loadState
     */
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
    
    /**
     * Initializes a new application state with song data
     * Sets up the initial state when no saved data exists
     * @function initializeNewState
     */
    function initializeNewState() {
        state.songs = JSON.parse(JSON.stringify(songList)); 
        state.comparisons = 0;
    }

    /**
     * Resets application state after user confirmation
     * Allows users to start fresh with all data cleared
     * @function resetState
     */
    function resetState() {
        if (confirm("Are you sure you want to reset all progress? This cannot be undone.")) {
            localStorage.removeItem('drSongRankerState');
            initializeNewState();
            updateApp();
        }
    }

    /**
     * Updates the entire application UI
     * Refreshes all UI elements to reflect current state
     * @function updateApp
     */
    function updateApp() {
        if (myRankingBtn.classList.contains('active')) {
            displayRankings();
        }
        updateProgress();
        presentNewPair();
        saveState();
    }
    
    // Initialize application after verifying song data is available
    // Ensures that the app has the necessary data to function
    if (typeof songList === 'undefined' || songList.length === 0) {
        alert("Error: Song data not found. Make sure 'app_song_data.js' is present.");
        return;
    }

    loadState();
    
    // Initialize statistics tracking
    // Sets up visitor tracking and fetches initial stats
    handleUniqueVisitor();
    fetchAndDisplayAllTimeStats();
    
    // Event Listeners
    // Organized event listeners for UI interactions
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

    // Chapter filter button event listeners
    // Allows users to filter rankings by chapter
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update the state
            currentChapterFilter = btn.dataset.chapter;

            // Update the active class on buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Re-render the currently visible list
            if (myRankingBtn.classList.contains('active')) {
                displayRankings();
            } else {
                displayCommunityRankings();
            }
        });
    });

    /**
     * Filters songs by chapter based on their ID ranges
     * Allows users to view rankings for specific chapters
     * @function filterSongsByChapter
     * @param {Array} songs - Array of song objects to filter
     * @param {string} filter - Chapter filter ('all', 'ch1', 'ch2', 'ch3', 'ch4')
     * @returns {Array} Filtered array of song objects
     */
    function filterSongsByChapter(songs, filter) {
        if (filter === 'all') {
            return songs;
        }
        // Using a switch statement for clarity
        switch (filter) {
            case 'ch1':
                return songs.filter(s => s.id >= 1 && s.id <= 40);
            case 'ch2':
                return songs.filter(s => s.id >= 41 && s.id <= 87);
            case 'ch3':
                return songs.filter(s => s.id >= 88 && s.id <= 125);
            case 'ch4':
                return songs.filter(s => s.id >= 126 && s.id <= 165);
            default:
                return songs;
        }
    }

    // Start the application
    // Initializes the app and begins the ranking process
    updateApp();
});