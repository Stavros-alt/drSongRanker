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

    settingsBtn.addEventListener('click', (e) => {
        if (settingsModal.style.display === 'flex') {
            settingsModal.style.display = 'none';
        } else {
            settingsModal.style.display = 'flex';
        }
    });

    // close settings if you click anywhere else. why do i have to handle this manually.
    window.addEventListener('click', (e) => {
        if (settingsModal.style.display === 'flex' &&
            !settingsModal.contains(e.target) &&
            !settingsBtn.contains(e.target)) {
            settingsModal.style.display = 'none';
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

    const songList = window.songList || []; // pull from app_song_data.js

    let state = {
        songs: [],
        comparisons: 0,
        history: null,
        secretsUnlocked: false,
        activeRankerList: 'all', // all, 1, 2, 3, 4, hidden, or [customListName]
        customLists: {}, // { "Cool List": [1, 2, 5], ... }
        currentCustomListName: null // which one are we editing right now
    };

    function saveState() {
        localStorage.setItem('drSongRankerState', JSON.stringify(state));
    }

    function loadState() {
        const saved = localStorage.getItem('drSongRankerState');
        if (saved) {
            const parsed = JSON.parse(saved);
            state.comparisons = parsed.comparisons || 0;
            state.history = parsed.history || null;
            // DO NOT load secretsUnlocked from here. It is managed by checkSecretsGlobal() reading from localStorage.

            // merge songs to keep ratings but add new files/metadata
            const sourceList = window.songList || songList || [];
            state.songs = sourceList.map(baseSong => {
                const savedSong = parsed.songs ? parsed.songs.find(s => s.id === baseSong.id) : null;
                if (savedSong) {
                    return { ...baseSong, rating: savedSong.rating, comparisons: savedSong.comparisons };
                }
                return { ...baseSong };
            });
        } else {
            // fresh start
            const sourceList = window.songList || songList || [];
            state.songs = sourceList.map(s => ({ ...s }));
        }

        // ensure custom lists are loaded if they weren't in state (migration)
        if (Object.keys(state.customLists).length === 0) {
            // loadCustomLists(); // deprecated?
        }
        populateCustomDropdown();

        // validation: if active list is bogus, reset to all.
        const validLists = ['all', '1', '2', '3', '4', 'hidden'];
        if (!validLists.includes(state.activeRankerList) && !state.customLists[state.activeRankerList]) {
            state.activeRankerList = 'all';
            currentChapterFilter = 'all';
            if (activeListSelect) activeListSelect.value = 'all';
        }
    }

    let currentSongA, currentSongB;
    let previousRanking = [];
    let activePreviewTimeout = null;
    let currentChapterFilter = 'all';
    let votesSinceLastRefresh = 0; // stop hammering the api
    let currentActiveAudio = null; // tracking what's actually making noise.
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
    const fullPlayBtns = document.querySelectorAll('.full-play-btn');
    const toggleRankingsBtn = document.getElementById('toggle-rankings-btn');
    const rankingContainer = document.querySelector('.ranking-container');
    const myRankingBtn = document.getElementById('my-ranking-btn');
    const communityRankingBtn = document.getElementById('community-ranking-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const undoBtn = document.getElementById('undo-btn');
    function checkSecretsGlobal() {
        const unlocked = localStorage.getItem('drSongRankerSecretsUnlocked') === 'true';
        state.secretsUnlocked = unlocked;
        const statsLink = document.getElementById('secret-stats-link');
        if (statsLink) {
            statsLink.style.display = unlocked ? 'inline' : 'none';
        }
        const hiddenTab = document.getElementById('hidden-filter-btn');
        if (hiddenTab) {
            hiddenTab.style.display = unlocked ? 'inline-block' : 'none';
        }
    }
    checkSecretsGlobal();

    // custom ranker stuff. i'm done with lists.
    const manageCustomBtn = document.getElementById('manage-custom-btn');
    const customRankerModal = document.getElementById('custom-ranker-modal');
    const closeCustomBtn = document.getElementById('close-custom-btn');
    const saveCustomBtn = document.getElementById('save-custom-btn');
    const deleteListBtn = document.getElementById('delete-list-btn');
    const customSearch = document.getElementById('custom-search');
    const customChecklistContainer = document.getElementById('custom-checklist-container');
    const newListInput = document.getElementById('new-list-name');
    const createListBtn = document.getElementById('create-list-btn');
    const editListBtn = document.getElementById('edit-list-btn');
    const listEditorUi = document.getElementById('list-editor-ui');
    const editingListTitle = document.getElementById('editing-list-title');

    // Load custom lists from storage
    function loadCustomLists() {
        const saved = localStorage.getItem('drSongRankerCustomLists');
        if (saved) {
            state.customLists = JSON.parse(saved);
        } else {
            // migration from old format ONLY if new format doesn't exist
            const oldList = localStorage.getItem('drSongRankerCustomSelection');
            if (oldList) {
                state.customLists = { "Default": JSON.parse(oldList) };
                localStorage.setItem('drSongRankerCustomLists', JSON.stringify(state.customLists));
                // Remove the old key so we don't migrate again if the user deletes "Default"
                localStorage.removeItem('drSongRankerCustomSelection');
            } else {
                state.customLists = {}; // Initialize empty if nothing exists
            }
        }
        populateCustomDropdown();
    }
    loadCustomLists();

    // Unified Create List Logics
    if (createListBtn) {
        createListBtn.addEventListener('click', () => {
            const name = prompt("Enter a name for your new custom list:");
            if (!name) return;

            if (state.customLists[name] || ['all', 'all_plus', 'hidden', '1', '2', '3', '4'].includes(name)) {
                alert("List name already exists or is reserved!");
                return;
            }

            state.customLists[name] = [];
            state.currentCustomListName = name;
            saveListsToStorage();

            populateCustomDropdown(); // Ensure dropdown has it

            // auto-select
            const mainFilterSelect = document.getElementById('main-filter-select');
            if (mainFilterSelect) {
                mainFilterSelect.value = name;
                // dispatch change manually to trigger UI updates
                mainFilterSelect.dispatchEvent(new Event('change'));
            }

            // Open Editor Immediately
            showListEditor(name);
        });
    }

    if (editListBtn) {
        editListBtn.addEventListener('click', () => {
            const currentObj = document.getElementById('main-filter-select');
            if (currentObj && state.customLists[currentObj.value]) {
                state.currentCustomListName = currentObj.value;
                showListEditor(currentObj.value);
            }
        });
    }

    function showListEditor(name) {
        customRankerModal.style.display = 'flex'; // FORCE OPEN
        listEditorUi.style.display = 'block';
        saveCustomBtn.style.display = 'inline-block';
        deleteListBtn.style.display = 'inline-block';
        editingListTitle.textContent = `Editing: ${name}`;
        populateCustomChecklist(state.customLists[name]);
    }

    function saveListsToStorage() {
        localStorage.setItem('drSongRankerCustomLists', JSON.stringify(state.customLists));
    }

    // manageCustomBtn is dead. Long live the dropdown.
    /* 
    manageCustomBtn.addEventListener('click', () => {
        checkSecretsGlobal();
        customRankerModal.style.display = 'flex';
        renderListsPool();
    });
    */

    closeCustomBtn.addEventListener('click', () => {
        customRankerModal.style.display = 'none';
        listEditorUi.style.display = 'none';
        saveCustomBtn.style.display = 'none';
        deleteListBtn.style.display = 'none';
        state.currentCustomListName = null;
    });

    saveCustomBtn.addEventListener('click', () => {
        const name = state.currentCustomListName;
        if (!name) return;

        const checked = Array.from(customChecklistContainer.querySelectorAll('input:checked'))
            .map(input => parseInt(input.dataset.id));

        state.customLists[name] = checked;
        saveListsToStorage();

        // Visual feedback
        const originalText = saveCustomBtn.textContent;
        saveCustomBtn.textContent = "Saved!";
        saveCustomBtn.style.backgroundColor = "var(--accent-color)";
        saveCustomBtn.style.color = "#000";
        setTimeout(() => {
            saveCustomBtn.textContent = originalText;
            saveCustomBtn.style.backgroundColor = "";
            saveCustomBtn.style.color = "";
        }, 1500);

        if (state.activeRankerList === name) {
            presentNewPair();
            if (myRankingBtn.classList.contains('active')) {
                displayRankings();
            }
        }
    });

    deleteListBtn.addEventListener('click', () => {
        const name = state.currentCustomListName;
        if (!name || !confirm(`Delete list "${name}"?`)) return;

        delete state.customLists[name];
        saveListsToStorage();
        state.currentCustomListName = null;

        // Hide modal
        customRankerModal.style.display = 'none';

        // Refresh dropdown
        populateCustomDropdown();

        // Reset selection to 'all'
        const mainFilterSelect = document.getElementById('main-filter-select');
        if (mainFilterSelect) {
            mainFilterSelect.value = 'all';
            mainFilterSelect.dispatchEvent(new Event('change'));
        }
    });


    function populateCustomChecklist(selectedIds = []) {
        customChecklistContainer.innerHTML = '';

        // all songs. no mercy.
        songList.forEach(song => {
            // hidden tracks only show if unlocked or if we're specifically editing a list that had them
            if (song.hidden && !state.secretsUnlocked && !selectedIds.includes(song.id)) return;

            const div = document.createElement('div');
            div.className = 'checklist-item';

            // Allow clicking the row to toggle
            div.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
            });

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.dataset.id = song.id;
            checkbox.checked = selectedIds.includes(song.id);

            const label = document.createElement('label');
            label.textContent = song.name;
            if (song.hidden) label.style.color = 'var(--accent-color)';

            div.appendChild(checkbox);
            div.appendChild(label);
            customChecklistContainer.appendChild(div);
        });
    }

    customSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        Array.from(customChecklistContainer.children).forEach(div => {
            const name = div.querySelector('label').textContent.toLowerCase();
            div.style.display = name.includes(term) ? 'flex' : 'none';
        });
    });

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

            alert("Got it. Go to the Discord to campaign for your idea.");
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

    // submissions are enabled. go bother people on discord.

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

    function getFilteredSongs() {
        const query = rankingSearch.value.toLowerCase();
        const filter = state.activeRankerList;

        let pool = state.songs;

        if (filter === 'all') {
            // normal OST only. no secrets.
            pool = pool.filter(s => !s.hidden);
        } else if (filter === 'all_plus') {
            // show me everything (if unlocked)
            return state.secretsUnlocked ? pool : pool.filter(s => !s.hidden);
        } else if (filter === '1' || filter === '2' || filter === '3' || filter === '4') {
            const ch = parseInt(filter);
            return pool.filter(s => (!s.hidden || state.secretsUnlocked) && getChaptersForSong(s).includes(ch));
        } else if (filter === 'hidden') {
            return state.secretsUnlocked ? pool.filter(s => s.hidden) : [];
        } else {
            // assuming it's a custom list name
            const ids = state.customLists[filter] || [];
            return pool.filter(s => ids.includes(s.id) && (!s.hidden || state.secretsUnlocked));
        }

        return pool.filter(s => s.name.toLowerCase().includes(query));
    }

    function getChaptersForSong(song) {
        const ch = [];
        if (song.id <= 40) ch.push(1);
        if ((song.id >= 41 && song.id <= 87) || song.id === 38 || song.id === 40) {
            ch.push(2);
        }
        if (song.id >= 88 && song.id <= 125) ch.push(3);
        if (song.id >= 126 && song.id <= 200) ch.push(4);
        return ch;
    }

    function presentNewPair() {
        // we only rank what we're told to. i'm not a mind reader.
        const pool = getFilteredSongs();
        // if we are in 'hidden' mode, obviously we want to see them.
        let availableSongs = pool;
        if (state.activeRankerList !== 'hidden') {
            availableSongs = pool.filter(s => !s.hidden || state.secretsUnlocked);
        }

        if (!availableSongs || availableSongs.length < 2) {
            songAName.textContent = "NOT ENOUGH SONGS";
            songBName.textContent = "IN THIS LIST";

            chooseABtn.disabled = true;
            chooseBBtn.disabled = true;
            tieBtn.disabled = true;
            return;
        }

        chooseABtn.disabled = false;
        chooseBBtn.disabled = false;
        tieBtn.disabled = false;

        // picking two songs. don't ask about the distribution.
        const roll = Math.random();
        let song1;

        if (availableSongs.length < 2) {
            // well this is awkward.
            songAName.textContent = "Not enough songs";
            songBName.textContent = "in this list.";
            return;
        }

        if (roll < 0.6) {
            // 60% chance for some low vote songs i guess.
            const sortedByVotes = [...availableSongs].sort((a, b) => a.comparisons - b.comparisons);
            const uncertaintyPoolSize = Math.max(5, Math.floor(availableSongs.length * 0.25));
            const uncertaintyPool = sortedByVotes.slice(0, uncertaintyPoolSize);
            song1 = uncertaintyPool[Math.floor(Math.random() * uncertaintyPool.length)];
        } else if (roll < 0.9) {
            // 30% for the top rated ones.
            const sortedByRating = [...availableSongs].sort((a, b) => b.rating - a.rating);
            const topPoolSize = Math.min(20, availableSongs.length);
            const topPool = sortedByRating.slice(0, topPoolSize);
            song1 = topPool[Math.floor(Math.random() * topPool.length)];
        } else {
            // 10% pure chaos.
            song1 = availableSongs[Math.floor(Math.random() * availableSongs.length)];
        }

        // next victim.
        const sortedOpponents = [...availableSongs]
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
                // incrementing locally because the api is too slow/expensive.
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
        saveState();
    }

    function stopAllMusic() {
        if (activePreviewTimeout) {
            clearTimeout(activePreviewTimeout);
            activePreviewTimeout = null;
        }
        audioA.pause();
        audioB.pause();
        playlistAudio.pause();
        isPlaylistPlaying = false;
        playerPlayBtn.textContent = "⏯"; // show the play icon because everything is dead.
    }

    function playPreview(songKey) {
        stopAllMusic();

        const audioEl = (songKey === 'A') ? audioA : audioB;
        const otherAudioEl = (songKey === 'A') ? audioB : audioA;
        const songData = (songKey === 'A') ? currentSongA : currentSongB;

        otherAudioEl.pause();

        currentActiveAudio = audioEl;
        playerSongName.textContent = `${songData.name} (Preview)`;

        // no buttons for previews.
        playerPrevBtn.style.visibility = 'hidden';
        playerNextBtn.style.visibility = 'hidden';

        musicPlayerBar.classList.remove('hidden');

        audioEl.currentTime = PREVIEW_START_TIME;

        // fix for short songs because they're special apparently.
        if (!isNaN(audioEl.duration) && audioEl.duration < PREVIEW_START_TIME + 5) {
            audioEl.currentTime = 0;
        }

        const playPromise = audioEl.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                playerPlayBtn.textContent = "⏸";
                activePreviewTimeout = setTimeout(() => {
                    audioEl.pause();
                    playerPlayBtn.textContent = "⏯";
                }, PREVIEW_DURATION);
            }).catch(error => {
                console.error("Audio playback error:", error);
            });
        }
    }

    function playFullSong(songKey) {
        stopAllMusic();

        const audioEl = (songKey === 'A') ? audioA : audioB;
        const songData = (songKey === 'A') ? currentSongA : currentSongB;

        currentActiveAudio = audioEl;
        playerSongName.textContent = songData.name;

        // hide prev/next because this isn't a playlist. i'm lazy.
        playerPrevBtn.style.visibility = 'hidden';
        playerNextBtn.style.visibility = 'hidden';

        musicPlayerBar.classList.remove('hidden');

        audioEl.currentTime = 0; // back to the start.
        audioEl.play().then(() => {
            playerPlayBtn.textContent = "⏸";
        }).catch(error => {
            console.error("Full playback error:", error); // great. even this is broken.
        });
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
                    file: localSong ? localSong.file : '',
                    hidden: localSong ? localSong.hidden : false
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
        const timestamp = new Date().toLocaleTimeString();
        // console.log("Rendering rankings at " + timestamp); 

        const filteredSongs = filterSongsByChapter(state.songs, currentChapterFilter);
        const sortedSongs = [...filteredSongs].sort((a, b) => b.rating - a.rating);

        sortedSongs.forEach((song, index) => {
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('song-name');
            nameSpan.textContent = song.name;
            li.appendChild(nameSpan);

            const details = document.createElement('small');
            details.textContent = ` (R: ${Math.round(song.rating)})`; // Shortened to check if this change applies
            li.appendChild(details);
            rankingList.appendChild(li);
        });
    }

    function updateProgress() {
        // math. i'm done.
        const accuracy = 100 * (1 - Math.exp(-state.comparisons / 100));

        progressBar.style.width = `${accuracy}%`;
        progressText.textContent = `Ranking Accuracy: ${accuracy.toFixed(1)}%`;

        // vote hoarding counter.
        const personalVoteStat = document.getElementById('personal-vote-stat');
        if (personalVoteStat) {
            personalVoteStat.textContent = `YOUR VOTES: ${state.comparisons}`;
        }
    }


    function filterSongsByActiveList(songs) {
        const activeList = state.activeRankerList;
        if (activeList === 'all') {
            // prevent hidden songs from showing in All
            return songs.filter(s => !s.hidden);
        }

        if (activeList === 'hidden') {
            return songs.filter(s => s.hidden || s.id > 200);
        }

        if (activeList === 'custom') {
            const customSelection = JSON.parse(localStorage.getItem('drSongRankerCustomSelection') || '[]');
            return songs.filter(s => customSelection.includes(s.id));
        }

        // chapter grouping. math is pain.
        const ch = parseInt(activeList);
        return songs.filter(s => {
            if (ch === 1) return s.id <= 40;
            if (ch === 2) return (s.id >= 41 && s.id <= 87) || s.id === 38 || s.id === 40;
            if (ch === 3) return s.id >= 88 && s.id <= 125;
            if (ch === 4) return s.id >= 126 && s.id <= 165;
            return false;
        });
    }

    // sync the ranking list filters with the active ranker if possible. 
    // i'm not doing full reactive state, deal with it.
    function filterSongsByChapter(songs, filter) {
        if (filter === 'all') {
            return songs.filter(s => !s.hidden);
        }
        if (filter === 'all_plus') {
            return state.secretsUnlocked ? songs : songs.filter(s => !s.hidden);
        }
        if (filter === 'hidden') {
            return state.secretsUnlocked ? songs.filter(s => s.hidden || s.id > 200) : [];
        }

        // chapters
        if (['1', '2', '3', '4'].includes(filter)) {
            const ch = parseInt(filter);
            return songs.filter(s => {
                const visible = !s.hidden || state.secretsUnlocked;
                if (!visible) return false;

                if (ch === 1) return s.id <= 40;
                if (ch === 2) return (s.id >= 41 && s.id <= 87) || s.id === 38 || s.id === 40;
                if (ch === 3) return s.id >= 88 && s.id <= 125;
                if (ch === 4) return s.id >= 126 && s.id <= 165;
                return false;
            });
        }

        // custom lists
        const ids = state.customLists[filter] || [];
        return songs.filter(s => ids.includes(s.id) && (!s.hidden || state.secretsUnlocked));
    }


    function initializeNewState() {
        const source = window.songList || songList || [];
        state.songs = JSON.parse(JSON.stringify(source));
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
        } else if (communityRankingBtn.classList.contains('active')) {
            // we don't auto-update community rankings on every vote because that's expensive and slow.
            // but sure, if you want to.
        }
        updateProgress();
        presentNewPair();
        saveState();
    }

    // if (typeof songList === 'undefined' || songList.length === 0) {
    //     alert("Error: Song data not found. Make sure 'app_song_data.js' is present.");
    //     return;
    // }

    loadState();


    fetchAndDisplayAllTimeStats();

    chooseABtn.addEventListener('click', () => handleChoice('A'));
    chooseBBtn.addEventListener('click', () => handleChoice('B'));
    tieBtn.addEventListener('click', () => handleChoice(null));
    undoBtn.addEventListener('click', undoVote);
    resetBtn.addEventListener('click', resetState);
    previewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // stop playlist if previewing. why did i even make a playlist.
            if (isPlaylistPlaying) {
                playlistAudio.pause();
                isPlaylistPlaying = false;
            }
            playPreview(btn.dataset.song);
        });
    });
    fullPlayBtns.forEach(btn => {
        btn.addEventListener('click', () => playFullSong(btn.dataset.song)); // hope they like the whole song.
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



    const mainFilterSelect = document.getElementById('main-filter-select');
    // createListBtn is defined at the top

    // Filter change logic
    if (mainFilterSelect) {
        mainFilterSelect.addEventListener('change', (e) => {
            currentChapterFilter = e.target.value;
            state.activeRankerList = currentChapterFilter;

            // Show/Hide Edit Button
            if (editListBtn) {
                if (state.customLists[currentChapterFilter]) {
                    editListBtn.style.display = 'inline-block';
                } else {
                    editListBtn.style.display = 'none';
                }
            }

            if (myRankingBtn.classList.contains('active')) {
                displayRankings();
            } else {
                displayCommunityRankings();
            }
            presentNewPair();
        });
    }

    // Removed duplicate createListBtn listener

    function populateCustomDropdown() {
        const select = document.getElementById('main-filter-select');
        if (!select) return;

        const currentVal = select.value;
        select.innerHTML = '';

        // Standard Options
        const standardOptions = [
            { val: 'all', text: 'All Songs (Original)' },
            { val: '1', text: 'Chapter 1' },
            { val: '2', text: 'Chapter 2' },
            { val: '3', text: 'Chapter 3' },
            { val: '4', text: 'Chapter 4' },
        ];

        // Add secret options if unlocked
        if (state.secretsUnlocked) {
            standardOptions.splice(1, 0, { val: 'all_plus', text: 'All Songs + Hidden' });
            standardOptions.push({ val: 'hidden', text: 'Hidden Tracks' });
        }

        standardOptions.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.val;
            el.textContent = opt.text;
            select.appendChild(el);
        });

        // Custom Lists Optgroup
        const listNames = Object.keys(state.customLists || {});
        if (listNames.length > 0) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Custom Lists';
            optgroup.id = 'custom-lists-optgroup';

            listNames.sort().forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                optgroup.appendChild(option);
            });
            select.appendChild(optgroup);
        }

        // Restore selection if valid
        const validValues = standardOptions.map(o => o.val).concat(listNames);
        if (validValues.includes(currentVal)) {
            select.value = currentVal;
        } else {
            select.value = 'all';
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



    // endless stream of noise.
    const musicPlayerBar = document.getElementById('music-player-bar');
    const playerSongName = document.getElementById('player-song-name');
    const playerPrevBtn = document.getElementById('player-prev-btn');
    const playerPlayBtn = document.getElementById('player-play-btn');
    const playerNextBtn = document.getElementById('player-next-btn');
    const playerCloseBtn = document.getElementById('player-close-btn');
    const playlistAudio = document.getElementById('playlist-audio');
    const playListBtn = document.getElementById('play-list-btn');
    const exportListBtn = document.getElementById('export-list-btn');
    const exportModal = document.getElementById('export-modal');
    const closeExportBtn = document.getElementById('close-export-btn');
    const exportM3UBtn = document.getElementById('export-m3u-btn');
    const exportTextBtn = document.getElementById('export-text-btn');

    let playlist = [];
    let currentPlaylistIndex = 0;
    let isPlaylistPlaying = false;

    function generateAndStartPlaylist() {
        // where is this coming from.
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

        // users with too many opinions.
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

        // show the buttons again.
        playerPrevBtn.style.visibility = 'visible';
        playerNextBtn.style.visibility = 'visible';

        musicPlayerBar.classList.remove('hidden');
        playSongInPlaylist(currentPlaylistIndex);
    }

    function playSongInPlaylist(index) {
        if (index < 0 || index >= playlist.length) return;

        stopAllMusic(); // don't want overlay.
        currentPlaylistIndex = index;
        const song = playlist[currentPlaylistIndex];

        currentActiveAudio = playlistAudio;
        playerSongName.textContent = `${index + 1}. ${song.name}`;
        playlistAudio.src = encodeURI(song.file);
        playlistAudio.play().then(() => {
            isPlaylistPlaying = true;
            playerPlayBtn.textContent = "⏸";
        }).catch(e => console.error("Playback failed:", e)); // skip it? nah.
    }

    function togglePlaylistPlay() {
        if (!currentActiveAudio) return;

        if (currentActiveAudio.paused) {
            currentActiveAudio.play();
            if (currentActiveAudio === playlistAudio) isPlaylistPlaying = true;
            playerPlayBtn.textContent = "⏸";
        } else {
            currentActiveAudio.pause();
            if (currentActiveAudio === playlistAudio) isPlaylistPlaying = false;
            playerPlayBtn.textContent = "⏯";
        }
    }

    playListBtn.addEventListener('click', generateAndStartPlaylist);

    playerPrevBtn.addEventListener('click', () => playSongInPlaylist(currentPlaylistIndex - 1));
    playerNextBtn.addEventListener('click', () => playSongInPlaylist(currentPlaylistIndex + 1));

    playerPlayBtn.addEventListener('click', togglePlaylistPlay);

    playerCloseBtn.addEventListener('click', () => {
        stopAllMusic();
        musicPlayerBar.classList.add('hidden');
    });

    // Export. i'm literally doing your job for you.
    exportListBtn.addEventListener('click', () => {
        exportModal.style.display = 'flex';
    });

    closeExportBtn.addEventListener('click', () => {
        exportModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === exportModal) {
            exportModal.style.display = 'none';
        }
    });

    function getExportSourceSongs() {
        const isGlobal = communityRankingBtn.classList.contains('active');
        let pool = isGlobal ? cachedCommunitySongs : state.songs;

        if (isGlobal && pool.length === 0) {
            return null; // Not loaded yet
        }

        // Apply chapter/custom filter
        let filtered = filterSongsByChapter(pool, currentChapterFilter);

        // Sort by rating (global or personal)
        return [...filtered].sort((a, b) => b.rating - a.rating);
    }

    exportM3UBtn.addEventListener('click', () => {
        const sourceSongs = getExportSourceSongs();
        if (sourceSongs === null) {
            alert("Global data not loaded. Switch to Global tab once first.");
            return;
        }

        const limit = parseInt(document.getElementById('export-limit').value) || 10;
        const exportPool = sourceSongs.slice(0, limit);

        if (exportPool.length === 0) {
            alert("Nothing to export. Maybe vote once?");
            return;
        }

        let m3uContent = "#EXTM3U\n";
        exportPool.forEach(song => {
            // we use the local path. if you moved your files, that's a you problem.
            m3uContent += `#EXTINF:-1,${song.name}\n${song.file}\n`;
        });

        const blob = new Blob([m3uContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `deltarune_playlist_${currentChapterFilter}.m3u`;
        a.click();
        URL.revokeObjectURL(url);
        exportModal.style.display = 'none';
    });

    const exportZipBtn = document.getElementById('export-zip-btn');
    exportZipBtn.addEventListener('click', async () => {
        const sourceSongs = getExportSourceSongs();
        if (sourceSongs === null) {
            alert("Global data not loaded. Switch to Global tab once first.");
            return;
        }

        const limit = parseInt(document.getElementById('export-limit').value) || 10;
        const exportPool = sourceSongs.slice(0, limit);

        if (exportPool.length === 0) {
            alert("No songs to export. Select a list with actual songs in it.");
            return;
        }

        exportZipBtn.disabled = true;
        const originalText = exportZipBtn.textContent;
        exportZipBtn.textContent = "ZIPPING...";

        try {
            const zip = new JSZip();
            const folder = zip.folder("deltarune_mp3s");
            let addedCount = 0;

            const fetchPromises = exportPool.map(async (song) => {
                try {
                    // try to normalize path if it has weird ./ 
                    const cleanPath = song.file.replace(/\/\.\//g, '/');
                    const response = await fetch(encodeURI(cleanPath));
                    if (!response.ok) throw new Error(`http error! status: ${response.status}`);
                    const blob = await response.blob();
                    // just the filename. i'm not recreating the entire soundtrack folder structure.
                    const filename = cleanPath.split('/').pop();
                    folder.file(filename, blob);
                    addedCount++;
                } catch (e) {
                    console.error(`Failed to fetch ${song.name}:`, e);
                }
            });

            await Promise.all(fetchPromises);

            if (addedCount === 0) {
                alert("Failed to fetch any MP3 files. Are you running this on a server? Check console for CORS or 404s.");
                return;
            }

            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `deltarune_top_${addedCount}_songs.zip`;
            a.click();
            URL.revokeObjectURL(url);
            exportModal.style.display = 'none';
        } catch (err) {
            console.error("ZIP failed:", err);
            alert("ZIP generation failed. I am genuinely surprised.");
        } finally {
            exportZipBtn.disabled = false;
            exportZipBtn.textContent = originalText;
        }
    });

    exportTextBtn.addEventListener('click', () => {
        const sourceSongs = getExportSourceSongs();
        if (sourceSongs === null) {
            alert("Global data not loaded. Switch to Global tab once first.");
            return;
        }

        const limit = parseInt(document.getElementById('export-limit').value) || 10;
        const exportPool = sourceSongs.slice(0, limit);

        if (exportPool.length === 0) {
            alert("No songs, no list. Logic is hard, I know.");
            return;
        }

        const textList = exportPool.map(s => {
            let songName = s.name;
            // band-aids for bad search results.
            if (songName === "AIRWAVES") songName = "Air Waves";
            if (songName === "A DARK ZONE") songName = "A Dark Zone";

            // keep the remixes away from me.
            if (songName === "Rude Buster" || songName === "Before the Story") {
                return `${songName} - Toby Fox DELTARUNE Chapter 1 (Original Game Soundtrack)`;
            }
            if (songName === "My Castle Town") {
                return `${songName} - Toby Fox DELTARUNE Chapter 2 OST`;
            }

            let chapterSuffix = "";
            if (s.id <= 40) chapterSuffix = " (Chapter 1)";
            else if (s.id <= 87 || s.id === 38 || s.id === 40) chapterSuffix = " (Chapter 2)";
            else if (s.id <= 125) chapterSuffix = " (Chapter 3)";
            else if (s.id <= 165) chapterSuffix = " (Chapter 4)";

            return `${songName} - Toby Fox Deltarune OST${chapterSuffix}`;
        }).join('\n');
        navigator.clipboard.writeText(textList).then(() => {
            alert("Copied to clipboard. Paste it into Spotify/YouTube tools and leave me alone.");
            exportModal.style.display = 'none';
        }).catch(err => {
            console.error("Clipboard failed:", err);
            alert("Clipboard failed. My life is suffering.");
        });
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

    // init app
    loadState();
    checkSecretsGlobal(); // Refresh secrets from localStorage AFTER loading stale state
    populateCustomDropdown(); // Rebuild dropdown with correct secrets status
    if (!state.songs || state.songs.length === 0) {
        state.songs = window.songList ? [...window.songList] : [];
    }
    presentNewPair();
    updateApp();

});
