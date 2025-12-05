document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';

    if (!window.supabase) {
        console.error("Supabase client not loaded. Make sure the script tag is in your HTML.");
        alert("Error: Could not connect to the ranking service. Please refresh.");
        return;
    }

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Theme
    // Theme settings
    const accentColors = [
        '#00ff9d', // Soft Green
        '#00f2ff', // Soft Cyan
        '#ff00ff'  // Magenta
    ];

    function loadTheme() {
        const savedColor = localStorage.getItem('drSongRankerTheme');
        if (savedColor && savedColor !== 'random') {
            document.documentElement.style.setProperty('--accent-color', savedColor);
        } else {
            // Default Random
            const randomColor = accentColors[Math.floor(Math.random() * accentColors.length)];
            document.documentElement.style.setProperty('--accent-color', randomColor);
        }
    }
    loadTheme();

    // Settings Elements
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const colorBtns = document.querySelectorAll('.color-btn:not(.custom-color-label)');
    const customColorPicker = document.getElementById('custom-theme-picker');
    const customColorLabel = document.querySelector('.custom-color-label');

    settingsBtn.addEventListener('click', () => {
        if (settingsModal.style.display === 'flex') {
            settingsModal.style.display = 'none';
        } else {
            settingsModal.style.display = 'flex';
        }
    });

    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            if (color === 'random') {
                localStorage.setItem('drSongRankerTheme', 'random');
                const randomColor = accentColors[Math.floor(Math.random() * accentColors.length)];
                document.documentElement.style.setProperty('--accent-color', randomColor);
            } else {
                localStorage.setItem('drSongRankerTheme', color);
                document.documentElement.style.setProperty('--accent-color', color);
            }

            // UI update
            colorBtns.forEach(b => b.classList.remove('active'));
            customColorLabel.classList.remove('active');
            btn.classList.add('active');
        });
    });

    // Custom color
    customColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--accent-color', color);
        localStorage.setItem('drSongRankerTheme', color);

        // Update UI
        colorBtns.forEach(b => b.classList.remove('active'));
        customColorLabel.classList.add('active');
        customColorLabel.style.background = color;
        customColorLabel.style.color = getContrastColor(color); // Helper to ensure text is visible
    });

    // Contrast helper
    function getContrastColor(hexColor) {
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    }

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

    function updateElo(winnerRating, loserRating, winnerComparisons, loserComparisons) {
        // Dynamic K-Factor.
        const getK = (comparisons) => (comparisons < 10) ? 100 : 32;

        const kWinner = getK(winnerComparisons);
        const kLoser = getK(loserComparisons);

        const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));

        // Calculate changes separately based on each song's K-factor
        const winnerChange = kWinner * (1 - expectedWin);
        const loserChange = kLoser * (expectedWin - 1); // expectedLoss = 1 - expectedWin, so (0 - expectedWin) -> actually (score - expected) = (0 - expectedWin)

        return {
            newWinnerRating: winnerRating + winnerChange,
            newLoserRating: loserRating + loserChange, // loserChange is negative
        };
    }

    function presentNewPair() {
        const roll = Math.random();
        let song1;

        if (roll < 0.6) {
            // 60% chance: low votes.
            const sortedByVotes = [...state.songs].sort((a, b) => a.comparisons - b.comparisons);
            const uncertaintyPoolSize = Math.max(5, Math.floor(state.songs.length * 0.25));
            const uncertaintyPool = sortedByVotes.slice(0, uncertaintyPoolSize);
            song1 = uncertaintyPool[Math.floor(Math.random() * uncertaintyPool.length)];
        } else if (roll < 0.9) {
            // 30% chance: top rated.
            const sortedByRating = [...state.songs].sort((a, b) => b.rating - a.rating);
            const topPoolSize = Math.min(20, state.songs.length);
            const topPool = sortedByRating.slice(0, topPoolSize);
            song1 = topPool[Math.floor(Math.random() * topPool.length)];
        } else {
            // 10% chance: random.
            song1 = state.songs[Math.floor(Math.random() * state.songs.length)];
        }

        // Pick opponent.
        const sortedOpponents = [...state.songs]
            .filter(s => s.id !== song1.id)
            .sort((a, b) => Math.abs(a.rating - song1.rating) - Math.abs(b.rating - song1.rating));

        // Top 10 closest ratings.
        const neighborPoolSize = 10;
        const neighborPool = sortedOpponents.slice(0, neighborPoolSize);
        const song2 = neighborPool[Math.floor(Math.random() * neighborPool.length)];

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

            const { newWinnerRating, newLoserRating } = updateElo(
                winnerSong.rating,
                loserSong.rating,
                winnerSong.comparisons,
                loserSong.comparisons
            );

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
        // Accuracy calc.
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

    // Sharing
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



    // Playlist
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

    // card stuff
    const cardModal = document.getElementById('card-modal');
    const closeCardBtn = document.getElementById('close-card-btn');
    const downloadCardBtn = document.getElementById('download-card-btn');
    const tradingCard = document.getElementById('trading-card');
    const cardPlayBtn = document.getElementById('card-play-btn');

    // dom nodes
    const cardRank = document.getElementById('card-rank');
    const cardRating = document.getElementById('card-rating');
    const cardChapterIcon = document.getElementById('card-chapter-icon');
    const cardTitle = document.getElementById('card-title');
    const cardChapter = document.getElementById('card-chapter');
    const cardRival = document.getElementById('card-rival');

    let currentCardSong = null;

    function getChapterInfo(id) {
        if (id <= 40) return { num: '1', icon: 'Art/Chapter_1_icon.png' };
        if (id <= 87) return { num: '2', icon: 'Art/Chapter_2_icon.png' };
        if (id <= 125) return { num: '3', icon: 'Art/Chapter_3_icon.png' };
        return { num: '4', icon: 'Art/Chapter_4_icon.png' };
    }

    function openCardModal(song, rank, rivalName) {
        currentCardSong = song;

        // fill it in
        cardRank.textContent = `#${rank}`;
        cardRating.textContent = `RATING: ${Math.round(song.rating)}`;
        cardTitle.textContent = song.name;

        const chapterInfo = getChapterInfo(song.id);
        cardChapter.textContent = chapterInfo.num;

        // update image
        cardChapterIcon.src = chapterInfo.icon;
        cardChapterIcon.style.display = 'block';

        cardRival.textContent = rivalName || "None";

        // make it shiny if they win
        tradingCard.classList.remove('rank-gold', 'rank-silver', 'rank-bronze', 'rank-standard');
        if (rank === 1) tradingCard.classList.add('rank-gold');
        else if (rank <= 3) tradingCard.classList.add('rank-silver');
        else if (rank <= 10) tradingCard.classList.add('rank-bronze');
        else tradingCard.classList.add('rank-standard');

        cardModal.style.display = 'flex';
    }

    // clicks
    rankingList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li) return;

        // check tab
        const isCommunity = communityRankingBtn.classList.contains('active');
        const sourceData = isCommunity ? cachedCommunitySongs : state.songs;

        // figure out what they clicked
        const filteredSongs = filterSongsByChapter(sourceData, currentChapterFilter);
        const sortedSongs = [...filteredSongs].sort((a, b) => b.rating - a.rating);

        // list index matches sorted array
        let index = 0;
        let sibling = li.previousElementSibling;
        while (sibling) {
            index++;
            sibling = sibling.previousElementSibling;
        }

        const song = sortedSongs[index];
        const rank = index + 1;
        const rival = (index > 0) ? sortedSongs[index - 1].name : "CHAMPION";

        if (song) {
            openCardModal(song, rank, rival);
        }
    });

    closeCardBtn.addEventListener('click', () => {
        cardModal.style.display = 'none';
        if (activePreviewTimeout) clearTimeout(activePreviewTimeout);
        audioA.pause();
        audioB.pause();
    });

    cardPlayBtn.addEventListener('click', () => {
        if (currentCardSong) {
            // hacking the preview player
            audioA.src = encodeURI(currentCardSong.file);
            playPreview('A');
        }
    });

    downloadCardBtn.addEventListener('click', () => {
        html2canvas(tradingCard, {
            backgroundColor: null, // Transparent
            scale: 2
        }).then(canvas => {
            const link = document.createElement('a');
            // Use ID to ensure safe filename
            link.download = `dr_card_${currentCardSong.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error("Card generation failed:", err);
            alert("Could not generate card image.");
        });
    });

    // close it
    window.addEventListener('click', (e) => {
        if (e.target === cardModal) {
            cardModal.style.display = 'none';
        }
    });

    updateApp();
});