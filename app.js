document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let state = {
        songs: [],
        comparisons: 0,
    };

    let currentSongA, currentSongB;
    const PREVIEW_DURATION = 10000; // 10 seconds
    const PREVIEW_START_TIME = 30; // Start 30 seconds in

    // --- DOM ELEMENTS ---
    const songAName = document.getElementById('songA-name');
    const songBName = document.getElementById('songB-name');
    const chooseABtn = document.getElementById('chooseA-btn');
    const chooseBBtn = document.getElementById('chooseB-btn');
    const tieBtn = document.getElementById('tie-btn');
    const resetBtn = document.getElementById('reset-btn');
    const progressIndicator = document.getElementById('progress-indicator');
    const rankingList = document.getElementById('ranking-list');
    const audioA = document.getElementById('audioA');
    const audioB = document.getElementById('audioB');
    const previewBtns = document.querySelectorAll('.preview-btn');

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
        // Smarter Pairing: Pick a song, then find an opponent with a similar rating.
        const song1 = state.songs[Math.floor(Math.random() * state.songs.length)];
        
        // Find an opponent for song1
        const sortedOpponents = [...state.songs]
            .filter(s => s.id !== song1.id)
            .sort((a, b) => Math.abs(a.rating - song1.rating) - Math.abs(b.rating - song1.rating));
        
        const song2 = sortedOpponents[0];

        currentSongA = song1;
        currentSongB = song2;

        // Update UI
        songAName.textContent = currentSongA.name;
        songBName.textContent = currentSongB.name;
        chooseABtn.textContent = `I prefer ${currentSongA.name}`;
        chooseBBtn.textContent = `I prefer ${currentSongB.name}`;

        // Load audio files (URL encode spaces and other special characters in filenames)
        audioA.src = encodeURI(currentSongA.file);
        audioB.src = encodeURI(currentSongB.file);
    }

    function handleChoice(winner) {
        if (!currentSongA || !currentSongB) return;

        if (winner) { // Not a tie
            const winnerSong = (winner === 'A') ? currentSongA : currentSongB;
            const loserSong = (winner === 'A') ? currentSongB : currentSongA;

            const { newWinnerRating, newLoserRating } = updateElo(winnerSong.rating, loserSong.rating);
            winnerSong.rating = newWinnerRating;
            loserSong.rating = newLoserRating;
            
            winnerSong.comparisons++;
            loserSong.comparisons++;
            state.comparisons++;
        }
        
        updateApp();
    }

    function playPreview(songKey) {
        const audioEl = (songKey === 'A') ? audioA : audioB;
        const otherAudioEl = (songKey === 'A') ? audioB : audioA;
        otherAudioEl.pause(); // Stop other preview if playing
        
        audioEl.currentTime = PREVIEW_START_TIME;
        audioEl.play().catch(e => console.error("Audio play failed:", e));

        setTimeout(() => {
            audioEl.pause();
        }, PREVIEW_DURATION);
    }

    function displayRankings() {
        rankingList.innerHTML = ''; // Clear previous list
        const sortedSongs = [...state.songs].sort((a, b) => b.rating - a.rating);
        
        sortedSongs.forEach(song => {
            const li = document.createElement('li');
            li.textContent = song.name;
            const details = document.createElement('small');
            details.textContent = `(Rating: ${Math.round(song.rating)})`;
            li.appendChild(details);
            rankingList.appendChild(li);
        });
    }

    function updateProgress() {
        progressIndicator.textContent = `Comparisons Made: ${state.comparisons}`;
    }

    // --- STATE & UI SYNC ---
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
            // Basic validation
            if (!state.songs || state.songs.length === 0) {
                initializeNewState();
            }
        } else {
            initializeNewState();
        }
    }
    
    function initializeNewState() {
        // Deep copy the initial songList from the other file
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
        displayRankings();
        updateProgress();
        presentNewPair();
        saveState();
    }
    
    // --- INITIALIZATION ---
    function init() {
        // Ensure songList is loaded
        if (typeof songList === 'undefined' || songList.length === 0) {
            alert("Error: Song data not found. Make sure 'app_song_data.js' is present and correctly formatted.");
            return;
        }

        loadState();
        
        chooseABtn.addEventListener('click', () => handleChoice('A'));
        chooseBBtn.addEventListener('click', () => handleChoice('B'));
        tieBtn.addEventListener('click', () => handleChoice(null));
        resetBtn.addEventListener('click', resetState);
        previewBtns.forEach(btn => {
            btn.addEventListener('click', () => playPreview(btn.dataset.song));
        });

        updateApp();
    }

    init();
});