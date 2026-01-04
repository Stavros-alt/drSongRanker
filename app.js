document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';

    if (!window.supabase) {
        console.error("Supabase client not loaded. Make sure the script tag is in your HTML.");
        alert("Error: Could not connect to the ranking service. Please refresh.");
        return;
    }

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


    // theme stuff. i don't care if it's pink or green.
    const accentColors = [
        '#00ff9d', // green i guess
        '#00f2ff', // cyan
        '#ff00ff'  // pink. why not.
    ];

    function loadTheme() {
        const savedColor = localStorage.getItem('drSongRankerTheme');
        if (savedColor && savedColor !== 'random') {
            document.documentElement.style.setProperty('--accent-color', savedColor);
        } else {
            // default. because who cares.
            const randomColor = accentColors[Math.floor(Math.random() * accentColors.length)];
            document.documentElement.style.setProperty('--accent-color', randomColor);
        }
    }
    loadTheme();

    // settings ui stuff. i hate dom manipulation.
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

            // updating the dom is suffering.
            colorBtns.forEach(b => b.classList.remove('active'));
            customColorLabel.classList.remove('active');
            btn.classList.add('active');
        });
    });

    // picker. i don't know why this needs a change event AND an input event.
    // whatever.
    customColorPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--accent-color', color);
        localStorage.setItem('drSongRankerTheme', color);

        colorBtns.forEach(b => b.classList.remove('active'));
        customColorLabel.classList.add('active');
        customColorLabel.style.background = color;
        customColorLabel.style.color = getContrastColor(color);
    });

    // math. i'm done with this.
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
        history: null // i guess we only need to go back once.
    };

    let currentSongA, currentSongB;
    let previousRanking = [];
    let activePreviewTimeout = null;
    let currentChapterFilter = 'all';
    let votesSinceLastRefresh = 0; // stop hammering the api
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
    const undoBtn = document.getElementById('undo-btn');

    // suggestion box. i don't even know why i'm taking requests.
    const suggestBtn = document.getElementById('suggest-btn');
    const suggestionModal = document.getElementById('suggestion-modal');
    const closeSuggestionBtn = document.getElementById('close-suggestion-btn');
    const submitSuggestionBtn = document.getElementById('submit-suggestion-btn');
    const suggestionText = document.getElementById('suggestion-text');

    suggestBtn.addEventListener('click', () => {
        suggestionModal.style.display = 'flex';
    });

    closeSuggestionBtn.addEventListener('click', () => {
        suggestionModal.style.display = 'none';
    });

    submitSuggestionBtn.addEventListener('click', async () => {
        const content = suggestionText.value.trim();
        if (!content) {
            alert("Maybe actually type something first?");
            return;
        }

        submitSuggestionBtn.disabled = true;
        submitSuggestionBtn.textContent = "SENDING...";

        try {
            const { error } = await supabaseClient
                .from('feature_suggestions')
                .insert([{ content: content }]);

            if (error) throw error;

            alert("Got it. I'll look at it whenever I have time.");
            suggestionText.value = '';
            suggestionModal.style.display = 'none';
        } catch (err) {
            console.error("Suggestion failed:", err);
            alert("Great, even the suggestion box is broken. Try again later.");
        } finally {
            submitSuggestionBtn.disabled = false;
            submitSuggestionBtn.textContent = "SUBMIT";
        }
    });

    window.addEventListener('click', (e) => {
        if (e.target === suggestionModal) {
            suggestionModal.style.display = 'none';
        }
    });

    function updateElo(winnerRating, loserRating, winnerComparisons, loserComparisons) {
        // why is elo so convoluted.
        const getK = (comparisons) => (comparisons < 10) ? 100 : 32;

        const kWinner = getK(winnerComparisons);
        const kLoser = getK(loserComparisons);

        const expectedWin = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));

        const winnerChange = kWinner * (1 - expectedWin);
        const loserChange = kLoser * (expectedWin - 1);

        return {
            newWinnerRating: winnerRating + winnerChange,
            newLoserRating: loserRating + loserChange,
        };
    }

    function presentNewPair() {
        // picking two songs. don't ask about the distribution.
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

        // next victim.
        const sortedOpponents = [...state.songs]
            .filter(s => s.id !== song1.id)
            .sort((a, b) => Math.abs(a.rating - song1.rating) - Math.abs(b.rating - song1.rating));

        // neighbors. whatever.
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

        // enable if there's history. it's not hard.
        if (undoBtn) undoBtn.disabled = !state.history;
    }

    function handleChoice(winner) {
        if (!currentSongA || !currentSongB) return;

        // save history before we mess it up.
        state.history = {
            songA: { id: currentSongA.id, rating: currentSongA.rating, comparisons: currentSongA.comparisons },
            songB: { id: currentSongB.id, rating: currentSongB.rating, comparisons: currentSongB.comparisons },
            totalComparisons: state.comparisons
        };

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

            // only fetch total votes every 15 personal votes. my egress is crying.
            votesSinceLastRefresh++;
            if (votesSinceLastRefresh >= 15) {
                fetchAndDisplayAllTimeStats();
                votesSinceLastRefresh = 0;
            } else {
                // just increment locally for now so the user sees something change.
                const voteStat = document.getElementById('vote-stat');
                if (voteStat) {
                    const currentText = voteStat.textContent || "";
                    const match = currentText.match(/\d+/);
                    if (match) {
                        const newTotal = parseInt(match[0]) + 1;
                        voteStat.textContent = `Total Votes: ${newTotal}`;
                    }
                }
            }
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

        // fix for short songs because they're special apparently.
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



    async function fetchAndDisplayAllTimeStats() {
        try {
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
            const voteStat = document.getElementById('vote-stat');
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

            // paths. whatever.
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
                const nameSpan = document.createElement('span');
                nameSpan.classList.add('song-name');
                nameSpan.textContent = song.name;
                li.appendChild(nameSpan);

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
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('song-name');
            nameSpan.textContent = song.name;
            li.appendChild(nameSpan);

            const details = document.createElement('small');
            details.textContent = ` (Rating: ${Math.round(song.rating)})`;
            li.appendChild(details);
            rankingList.appendChild(li);
        });
    }

    function updateProgress() {
        // math. i'm done.
        const accuracy = 100 * (1 - Math.exp(-state.comparisons / 100));

        progressBar.style.width = `${accuracy}%`;
        progressText.textContent = `Ranking Accuracy: ${accuracy.toFixed(1)}%`;

        // counter.
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
            state.history = null;
            updateApp();
        }
    }

    function undoVote() {
        if (!state.history) return;

        // find the victims.
        const songA = state.songs.find(s => s.id === state.history.songA.id);
        const songB = state.songs.find(s => s.id === state.history.songB.id);

        if (songA && songB) {
            songA.rating = state.history.songA.rating;
            songA.comparisons = state.history.songA.comparisons;
            songB.rating = state.history.songB.rating;
            songB.comparisons = state.history.songB.comparisons;
            state.comparisons = state.history.totalComparisons;

            // go back to the scene of the crime.
            currentSongA = songA;
            currentSongB = songB;
        }

        state.history = null; // one time use. don't get greedy.

        // update rankings and progress, but DON'T pick new songs.
        if (myRankingBtn.classList.contains('active')) {
            displayRankings();
        }
        updateProgress();
        saveState();

        // refresh the display manually. i hate this.
        songAName.textContent = currentSongA.name;
        songBName.textContent = currentSongB.name;
        chooseABtn.textContent = `I prefer ${currentSongA.name}`;
        chooseBBtn.textContent = `I prefer ${currentSongB.name}`;
        audioA.src = encodeURI(currentSongA.file);
        audioB.src = encodeURI(currentSongB.file);
        audioA.load();
        audioB.load();

        if (undoBtn) undoBtn.disabled = true;
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


    fetchAndDisplayAllTimeStats();

    chooseABtn.addEventListener('click', () => handleChoice('A'));
    chooseBBtn.addEventListener('click', () => handleChoice('B'));
    tieBtn.addEventListener('click', () => handleChoice(null));
    undoBtn.addEventListener('click', undoVote);
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
                return songs.filter(s => (s.id >= 41 && s.id <= 87) || s.id === 38 || s.id === 40);
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

    // sharing. i'm tired.
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
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'deltarune-ranking.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    });

    // close on click. users find things hard.
    window.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.style.display = 'none';
        }
    });



    // playlist.
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
        // source.
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

        // picky users.
        if (currentChapterFilter !== 'all') {
            sourceSongs = filterSongsByChapter(sourceSongs, currentChapterFilter);
        }

        if (sourceSongs.length === 0) {
            alert("No songs found for this filter.");
            return;
        }

        // finally.
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

    // search.
    const rankingSearch = document.getElementById('ranking-search');
    rankingSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const items = rankingList.getElementsByTagName('li');

        Array.from(items).forEach(item => {
            const songName = item.querySelector('.song-name').textContent.toLowerCase();
            if (songName.includes(searchTerm)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });

    updateApp();
});