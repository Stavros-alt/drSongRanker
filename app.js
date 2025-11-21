document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';

    if (!window.supabase) {
        console.error("Supabase client not loaded. Make sure the script tag is in your HTML.");
        alert("Error: Could not connect to the ranking service. Please refresh.");
        return;
    }

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // --- Dynamic Theme ---
    const accentColors = [
        '#00ff9d', // Soft Green
        '#00f2ff', // Soft Cyan
        '#ff00ff'  // Magenta
    ];
    const randomColor = accentColors[Math.floor(Math.random() * accentColors.length)];
    document.documentElement.style.setProperty('--accent-color', randomColor);

    let state = {
        songs: [],
        comparisons: 0,
    };

    let currentSongA, currentSongB;
    let previousRanking = [];
    let activePreviewTimeout = null;
    let currentChapterFilter = 'all';
    const PREVIEW_DURATION = 10000;
    const PREVIEW_START_TIME = 30;

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
        // Fuzzy Neighbor Matchmaking: Pick randomly from the top 10 closest opponents
        // This prevents the same pairs from appearing constantly and makes ranking feel faster.
        const poolSize = 10;
        const pool = sortedOpponents.slice(0, poolSize);
        const song2 = pool[Math.floor(Math.random() * pool.length)];

        currentSongA = song1;
        currentSongB = song2;

        songAName.textContent = currentSongA.name;
        songBName.textContent = currentSongB.name;
        chooseABtn.textContent = `I prefer ${currentSongA.name}`;
        chooseBBtn.textContent = `I prefer ${currentSongB.name}`;

        audioA.src = encodeURI(currentSongA.file);
        audioB.src = encodeURI(currentSongB.file);

        audioA.load();
        audioB.load();

        arena.classList.remove('slide-in');
        setTimeout(() => {
            songACard.classList.remove('selected', 'loser');
            songBCard.classList.remove('selected', 'loser');
            arena.classList.add('slide-in');
        }, 50);
    }

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
            fetchAndDisplayAllTimeStats();
        }

        updateApp();
    }

    function playPreview(songKey) {
        if (activePreviewTimeout) {
            clearTimeout(activePreviewTimeout);
        }

        const audioEl = (songKey === 'A') ? audioA : audioB;
        const otherAudioEl = (songKey === 'A') ? audioB : audioA;
        otherAudioEl.pause();

        audioEl.currentTime = PREVIEW_START_TIME;

        // Fix for short songs: If duration is valid and shorter than start time + buffer, start at 0
        if (!isNaN(audioEl.duration) && audioEl.duration < PREVIEW_START_TIME + 5) {
            audioEl.currentTime = 0;
        }

        const playPromise = audioEl.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                activePreviewTimeout = setTimeout(() => {
                    audioEl.pause();
                }, PREVIEW_DURATION);
            }).catch(error => {
                console.error("Audio playback error:", error);
            });
        }
    }



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

    async function fetchAndDisplayAllTimeStats() {
        try {
            const { data: visitorData, error: visitorError } = await supabaseClient
                .from('site_stats')
                .select('total_visitors')
                .eq('id', 1)
                .single();

            if (visitorError && visitorError.code !== 'PGRST116') {
                throw visitorError;
            }

            const visitors = visitorData ? visitorData.total_visitors : 0;
            const visitorStat = document.getElementById('visitor-stat');
            if (visitorStat) visitorStat.textContent = `Total Visitors: ${visitors}`;

            const { data: voteData, error: voteError } = await supabaseClient
                .rpc('get_total_votes');

            if (voteError) {
                throw voteError;
            }

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

    let cachedCommunitySongs = [];

    async function displayCommunityRankings() {
        rankingList.innerHTML = '<li>Loading community data...</li>';
        try {
            const { data, error } = await supabaseClient
                .from('songs')
                .select('name, id, rating')
                .order('rating', { ascending: false });

            if (error) throw error;

            // Merge file paths from local state
            cachedCommunitySongs = data.map(cSong => {
                const localSong = state.songs.find(s => s.id === cSong.id);
                return {
                    ...cSong,
                    file: localSong ? localSong.file : ''
                };
            });

            const filteredSongs = filterSongsByChapter(cachedCommunitySongs, currentChapterFilter);

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

    function displayRankings() {
        rankingList.innerHTML = '';

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

    function updateProgress() {
        // Asymptotic Accuracy: 100 * (1 - e^(-comparisons / 100))
        // Tweaked to 100 divisor for a smoother, more "earned" progression.
        const accuracy = 100 * (1 - Math.exp(-state.comparisons / 100));

        progressBar.style.width = `${accuracy}%`;
        progressText.textContent = `Ranking Accuracy: ${accuracy.toFixed(1)}%`;

        // Update Personal Vote Counter
        const personalVoteStat = document.getElementById('personal-vote-stat');
        if (personalVoteStat) {
            personalVoteStat.textContent = `YOUR VOTES: ${state.comparisons}`;
        }
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

    if (typeof songList === 'undefined' || songList.length === 0) {
        alert("Error: Song data not found. Make sure 'app_song_data.js' is present.");
        return;
    }

    loadState();

    handleUniqueVisitor();
    fetchAndDisplayAllTimeStats();

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

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentChapterFilter = btn.dataset.chapter;

            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (myRankingBtn.classList.contains('active')) {
                displayRankings();
            } else {
                displayCommunityRankings();
            }
        });
    });

    function filterSongsByChapter(songs, filter) {
        if (filter === 'all') {
            return songs;
        }
        switch (filter) {
            case '1':
            case 'ch1': // Fallback
                return songs.filter(s => s.id >= 1 && s.id <= 40);
            case '2':
            case 'ch2': // Fallback
                return songs.filter(s => s.id >= 41 && s.id <= 87);
            case '3':
            case 'ch3': // Fallback
                return songs.filter(s => s.id >= 88 && s.id <= 125);
            case '4':
            case 'ch4': // Fallback
                return songs.filter(s => s.id >= 126 && s.id <= 165);
            default:
                return songs;
        }
    }

    // --- Sharing Functionality ---
    const shareBtn = document.getElementById('share-btn');
    const shareModal = document.getElementById('share-modal');
    const closeShareBtn = document.getElementById('close-share-btn');
    const downloadShareBtn = document.getElementById('download-share-btn');
    const sharePreview = document.getElementById('share-preview');

    shareBtn.addEventListener('click', () => {
        const isCommunity = communityRankingBtn.classList.contains('active');
        const sourceData = isCommunity ? cachedCommunitySongs : state.songs;

        if (isCommunity && cachedCommunitySongs.length === 0) {
            alert("Community data not loaded yet. Please wait.");
            return;
        }

        const filteredData = filterSongsByChapter(sourceData, currentChapterFilter);
        const topSongs = [...filteredData]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10);

        let titleText = isCommunity ? "COMMUNITY TOP 10" : "MY TOP 10";
        if (currentChapterFilter !== 'all') {
            titleText += ` (${currentChapterFilter.toUpperCase()})`;
        }

        let html = `<h3 style="margin-top:0; border-bottom: 2px solid #fff; padding-bottom: 5px; text-transform: uppercase;">${titleText}</h3>`;
        html += '<ol style="padding-left: 20px; margin: 0;">';
        topSongs.forEach(song => {
            html += `<li style="margin-bottom: 5px;">${song.name}</li>`;
        });
        html += '</ol>';
        html += '<p style="margin-top: 15px; font-size: 0.8em; color: #888;">Ranked at: stavros-alt.github.io/drSongRanker</p>';

        sharePreview.innerHTML = html;
        shareModal.style.display = 'flex';
    });

    closeShareBtn.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });

    downloadShareBtn.addEventListener('click', () => {
        html2canvas(sharePreview, {
            backgroundColor: "#000000",
            scale: 2 // Higher resolution
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'deltarune-ranking.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });

    // --- Custom Cursor Logic ---
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    // Add pointermove for robust tracking on hybrid devices (Chromebooks, Surface, etc.)
    document.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        }
    });

    // Add hover effect for interactive elements
    const interactiveSelectors = 'button, .song-card, .ranking-toggle-btn, .filter-btn, a, input';

    document.body.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.add('active');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.remove('active');
        }
    });

    // --- Playlist Logic ---
    const musicPlayerBar = document.getElementById('music-player-bar');
    const playerSongName = document.getElementById('player-song-name');
    const playerPrevBtn = document.getElementById('player-prev-btn');
    const playerPlayBtn = document.getElementById('player-play-btn');
    const playerNextBtn = document.getElementById('player-next-btn');
    const playerCloseBtn = document.getElementById('player-close-btn');
    const playlistAudio = document.getElementById('playlist-audio');
    const playListBtn = document.getElementById('play-list-btn');

    let playlist = [];
    let currentPlaylistIndex = 0;
    let isPlaylistPlaying = false;

    function generateAndStartPlaylist() {
        // 1. Determine source (My Rank vs Global)
        let sourceSongs = [];
        if (communityRankingBtn.classList.contains('active')) {
            if (cachedCommunitySongs.length > 0) {
                sourceSongs = [...cachedCommunitySongs];
            } else {
                alert("Community data not loaded yet. Please wait.");
                return;
            }
        } else {
            sourceSongs = [...state.songs].sort((a, b) => b.rating - a.rating);
        }

        // 2. Apply Filter
        if (currentChapterFilter !== 'all') {
            sourceSongs = filterSongsByChapter(sourceSongs, currentChapterFilter);
        }

        if (sourceSongs.length === 0) {
            alert("No songs found for this filter.");
            return;
        }

        // 3. Start Playlist
        playlist = sourceSongs;
        currentPlaylistIndex = 0;
        musicPlayerBar.classList.remove('hidden');
        playSongInPlaylist(currentPlaylistIndex);
    }

    function playSongInPlaylist(index) {
        if (index < 0 || index >= playlist.length) return;

        currentPlaylistIndex = index;
        const song = playlist[currentPlaylistIndex];

        playerSongName.textContent = `${index + 1}. ${song.name}`;
        playlistAudio.src = encodeURI(song.file);
        playlistAudio.play().then(() => {
            isPlaylistPlaying = true;
            playerPlayBtn.textContent = "⏸";
        }).catch(e => console.error("Playback failed:", e));
    }

    function togglePlaylistPlay() {
        if (playlistAudio.paused) {
            playlistAudio.play();
            isPlaylistPlaying = true;
            playerPlayBtn.textContent = "⏸";
        } else {
            playlistAudio.pause();
            isPlaylistPlaying = false;
            playerPlayBtn.textContent = "⏯";
        }
    }

    playListBtn.addEventListener('click', generateAndStartPlaylist);

    playerPrevBtn.addEventListener('click', () => playSongInPlaylist(currentPlaylistIndex - 1));
    playerNextBtn.addEventListener('click', () => playSongInPlaylist(currentPlaylistIndex + 1));

    playerPlayBtn.addEventListener('click', togglePlaylistPlay);

    playerCloseBtn.addEventListener('click', () => {
        playlistAudio.pause();
        musicPlayerBar.classList.add('hidden');
    });

    playlistAudio.addEventListener('ended', () => {
        playSongInPlaylist(currentPlaylistIndex + 1);
    });

    updateApp();
});