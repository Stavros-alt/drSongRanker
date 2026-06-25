document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_ZYm_PTc6nIPS6t7MKsWKrQ_pwSiLCq2';
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // DOM cache. i'm done with these IDs.
    const mainTitle = document.getElementById('main-title');
    const mainFilterSelect = document.getElementById('main-filter-select');
    const drToggle = document.getElementById('dr-toggle');
    const combinedToggle = document.getElementById('combined-toggle'); // finally.
    const utToggle = document.getElementById('ut-toggle');
    const utyToggle = document.getElementById('uty-toggle');
    const tsusToggle = document.getElementById('tsus-toggle');
    const showRatingsToggle = document.getElementById('show-ratings-toggle');
    const preventDuplicatesToggle = document.getElementById('prevent-duplicates-toggle');
    const showGlobalDiffToggle = document.getElementById('show-global-diff-toggle');
    const felfebModeToggle = document.getElementById('felfeb-mode-toggle');

    const systemCursorToggle = document.getElementById('system-cursor-toggle');

    const arena = document.querySelector('.arena');
    const songACard = document.getElementById('songA-card');
    const songBCard = document.getElementById('songB-card');
    const songAName = document.getElementById('songA-name');
    const songBName = document.getElementById('songB-name');
    const songARank = document.getElementById('songA-rank');
    const songBRank = document.getElementById('songB-rank');
    const chooseABtn = document.getElementById('chooseA-btn');
    const chooseBBtn = document.getElementById('chooseB-btn');
    const skipBtn = document.getElementById('skip-btn');
    const undoBtn = document.getElementById('undo-btn');
    const resetBtn = document.getElementById('reset-btn');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const rankingContainer = document.querySelector('.ranking-container');
    const myRankingBtn = document.getElementById('my-ranking-btn');
    const communityRankingBtn = document.getElementById('community-ranking-btn');
    const toggleRankingsBtn = document.getElementById('toggle-rankings-btn');
    const hideLeaderboardToggle = document.getElementById('hide-leaderboard-toggle');
    const hideMatchupRankingsToggle = document.getElementById('hide-matchup-rankings-toggle');
    const hideAccuracyToggle = document.getElementById('hide-accuracy-toggle');
    const hideAccuracyPercentToggle = document.getElementById('hide-accuracy-percent-toggle'); // discord anon asked for this. whatever.
    const audioA = document.getElementById('audioA');
    const audioB = document.getElementById('audioB');
    const previewBtns = document.querySelectorAll('.preview-btn');
    const fullPlayBtns = document.querySelectorAll('.full-play-btn');
    const editListBtn = document.getElementById('edit-list-btn');
    const chapterMixModal = document.getElementById('chapter-mix-modal');
    const applyMixBtn = document.getElementById('apply-mix-btn');
    const cancelMixBtn = document.getElementById('cancel-mix-btn');
    const mixCheckboxes = document.querySelectorAll('.mix-chapter-cb');
    const shareBtn = document.getElementById('share-btn');
    const shareModal = document.getElementById('share-modal');
    const closeShareBtn = document.getElementById('close-share-btn');
    const downloadShareBtn = document.getElementById('download-share-btn');
    const shareCountInput = document.getElementById('share-count-input');
    const sharePreview = document.getElementById('share-preview');
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
    const exportZipBtn = document.getElementById('export-zip-btn');
    const exportTextBtn = document.getElementById('export-text-btn');
    const rankingSearch = document.getElementById('ranking-search');
    const rankingList = document.getElementById('ranking-list');
    const vsText = document.getElementById('vs-text');
    const nextMatchupBtn = document.getElementById('next-matchup-btn');
    const showAgreementToggle = document.getElementById('show-agreement-toggle');
    const historyModal = document.getElementById('history-modal');
    const historySongName = document.getElementById('history-song-name');
    const historyList = document.getElementById('history-list');
    const closeHistoryBtn = document.getElementById('close-history-btn');

    // finish modal for overachievers. because apparently picking a song isn't enough.

    const finishModal = document.getElementById('finish-modal');
    const finishShowRankingsBtn = document.getElementById('finish-show-rankings-btn');
    const closeFinishBtn = document.getElementById('close-finish-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const playerProgress = document.getElementById('player-progress');
    const playerCurrentTime = document.getElementById('player-current-time');
    const playerDuration = document.getElementById('player-duration');

    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const customColorPicker = document.getElementById('custom-theme-picker');
    const customColorLabel = document.querySelector('.custom-color-label');
    const colorBtns = document.querySelectorAll('.theme-option');
    
    // background color stuff. because apparently the theme wasn't enough work.
    const customBgPicker = document.getElementById('custom-bg-picker');
    const customBgLabel = document.querySelector('.custom-bg-label');
    const bgBtns = document.querySelectorAll('.bg-option');
    const gasterThemeBtn = document.getElementById('gaster-theme-btn');
    const cyberThemeBtn = document.getElementById('cyber-theme-btn');

    // soul cursor color picker
    const customSoulPicker = document.getElementById('custom-soul-picker');
    const customSoulLabel = document.querySelector('.custom-soul-label');

    const customRankerModal = document.getElementById('custom-ranker-modal');
    const closeCustomBtn = document.getElementById('close-custom-btn');
    const saveCustomBtn = document.getElementById('save-custom-btn');
    const deleteListBtn = document.getElementById('delete-list-btn');
    const customSearch = document.getElementById('custom-search');
    const customChecklistContainer = document.getElementById('custom-checklist-container');
    const newListInput = document.getElementById('new-list-name');
    const createListBtn = document.getElementById('create-list-btn');
    const listEditorUi = document.getElementById('list-editor-ui');
    const editingListTitle = document.getElementById('editing-list-title');

    const secretLink = document.getElementById('secret-stats-link');
    const hiddenTab = document.getElementById('hidden-filter-btn');

    const gameMixModal = document.getElementById('game-mix-modal');
    const applyGameMixBtn = document.getElementById('apply-game-mix-btn');
    const cancelGameMixBtn = document.getElementById('cancel-game-mix-btn');
    const gameMixCheckboxes = document.querySelectorAll('.mix-game-cb');

    const suggestBtn = document.getElementById('suggest-btn');


    const voteStat = document.getElementById('vote-stat');
    const personalVoteStat = document.getElementById('personal-vote-stat');
    const exportLimitInput = document.getElementById('export-limit');

    const gasterExperimentContainer = document.getElementById('gaster-experiment-container');
    const gasterFakeExperimentBtn = document.getElementById('gaster-fake-experiment-btn');

    // global variables. i'm tired of tracking this.

    let currentSongA = null;
    let currentSongB = null;
    let previousRanking = [];
    let activePreviewTimeout = null;
    let currentChapterFilter = 'all';
    let votesSinceLastRefresh = 0; // stop hammering the api
    let currentActiveAudio = null; // tracking what's actually making noise.
    let vsClickCount = 0;
    let vsClickTimer = null;
    let gasterInterval = null;

    // accent colors. i don't care if it's pink or green.
    const accentColors = [
        '#00ff9d', // green i guess
        '#00f2ff', // cyan
        '#ff00ff'  // pink. why not.
    ];

    function applySpecialTheme() {
        const savedSpecial = localStorage.getItem('drSongRankerSpecialTheme');
        
        // i have to clear everything manually because i'm too tired to write a cleaner system.
        document.body.classList.remove('theme-gaster', 'theme-cyber');
        if (gasterThemeBtn) gasterThemeBtn.classList.remove('active');
        if (cyberThemeBtn) cyberThemeBtn.classList.remove('active');

        if (savedSpecial === 'gaster') {
            document.body.classList.add('theme-gaster');
            if (gasterThemeBtn) gasterThemeBtn.classList.add('active');
            
            // only show the placebo button if it hasn't been "scattered" yet. 
            // i'm sick of this button. please scatter it.
            const isScattered = localStorage.getItem('drSongRankerGasterExperimentScattered') === 'true';
            if (gasterExperimentContainer) {
                gasterExperimentContainer.style.display = isScattered ? 'none' : 'block';
            }
        } else if (savedSpecial === 'cyber') {
            document.body.classList.add('theme-cyber');
            if (cyberThemeBtn) cyberThemeBtn.classList.add('active');
            if (gasterExperimentContainer) gasterExperimentContainer.style.display = 'none';
        } else {
            if (gasterExperimentContainer) gasterExperimentContainer.style.display = 'none';
        }
    }
    applySpecialTheme();

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

    function loadBackgroundColor() {
        const savedBg = localStorage.getItem('drSongRankerBackground');
        if (savedBg) {
            document.documentElement.style.setProperty('--bg-color', savedBg);
            // highlight the active one. i hate this.
            bgBtns.forEach(btn => {
                if (btn.dataset.bg === savedBg) btn.classList.add('active');
                else btn.classList.remove('active');
            });
            if (customBgLabel && !Array.from(bgBtns).some(b => b.dataset.bg === savedBg)) {
                customBgLabel.classList.add('active');
                customBgLabel.style.background = savedBg;
                customBgLabel.style.color = getContrastColor(savedBg);
            }
        } else {
            document.documentElement.style.setProperty('--bg-color', '#000000');
            bgBtns.forEach(btn => {
                if (btn.dataset.bg === '#000000') btn.classList.add('active');
            });
        }
    }
    loadBackgroundColor();

    // settings ui stuff. i hate dom manipulation. why do i have to do this manually.


    if (vsText) {
        vsText.addEventListener('click', () => {
            vsClickCount++;
            clearTimeout(vsClickTimer);
            vsClickTimer = setTimeout(() => {
                vsClickCount = 0;
            }, 500);

            if (vsClickCount === 3) {
                if (!globalState.combinedDiscovered) {
                    globalState.combinedDiscovered = true;
                    saveState();
                }
                // the button does the switching now.
                if (combinedToggle) combinedToggle.style.display = 'inline-block';

                // auto-switch if we just discovered it? nah, let them click.
                vsClickCount = 0;
            }
        });
    }

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

            // if you pick a color, special themes die. i'm not dealing with color conflicts.
            if (state.specialTheme) {
                state.specialTheme = null;
                localStorage.removeItem('drSongRankerSpecialTheme');
                applySpecialTheme();
                saveState();
            }
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

        // special themes are dead to me now.
        if (state.specialTheme) {
            state.specialTheme = null;
            localStorage.removeItem('drSongRankerSpecialTheme');
            applySpecialTheme();
            saveState();
        }
    });

    // bg color logic. i'm muttering under my breath.
    bgBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.bg;
            localStorage.setItem('drSongRankerBackground', color);
            document.documentElement.style.setProperty('--bg-color', color);

            bgBtns.forEach(b => b.classList.remove('active'));
            customBgLabel.classList.remove('active');
            btn.classList.add('active');

            // if you pick a background, special themes die.
            if (state.specialTheme) {
                state.specialTheme = null;
                localStorage.removeItem('drSongRankerSpecialTheme');
                applySpecialTheme();
                saveState();
            }
        });
    });

    customBgPicker.addEventListener('input', (e) => {
        const color = e.target.value;
        document.documentElement.style.setProperty('--bg-color', color);
        localStorage.setItem('drSongRankerBackground', color);

        bgBtns.forEach(b => b.classList.remove('active'));
        customBgLabel.classList.add('active');
        customBgLabel.style.background = color;
        customBgLabel.style.color = getContrastColor(color);

        // special themes die in the custom picker too.
        if (state.specialTheme) {
            state.specialTheme = null;
            localStorage.removeItem('drSongRankerSpecialTheme');
            applySpecialTheme();
            saveState();
        }
    });

    if (gasterThemeBtn) {
        gasterThemeBtn.addEventListener('click', () => {
            if (state.specialTheme === 'gaster') {
                state.specialTheme = null;
                localStorage.removeItem('drSongRankerSpecialTheme');
            } else {
                state.specialTheme = 'gaster';
                localStorage.setItem('drSongRankerSpecialTheme', 'gaster');
                
                // clear other actives. i'm sick of this.
                colorBtns.forEach(b => b.classList.remove('active'));
                bgBtns.forEach(b => b.classList.remove('active'));
                customColorLabel.classList.remove('active');
                customBgLabel.classList.remove('active');
            }
            applySpecialTheme();
            saveState();
        });
    }

    if (gasterFakeExperimentBtn) {
        gasterFakeExperimentBtn.addEventListener('click', () => {
            // APRIL FOOLS PRANK: SCATTERING.
            // i'm essentially writing my own pink slip for this button. delicious.
            // i'm laughing into the void. it's very spacious.
            console.log("Experiment initiated. Result: CRYSTALIZED VOID. SCATTERING...");
            
            // trigger the scatter animation. gaster-scatter class manages the chaos.
            gasterFakeExperimentBtn.classList.add('gaster-scatter');
            
            // persist the disappearance. the user won't see this again. 
            // hopefully they think they broke the internet.
            localStorage.setItem('drSongRankerGasterExperimentScattered', 'true');

            // wait for the animation to finish, then hide the evidence.
            setTimeout(() => {
                if (gasterExperimentContainer) gasterExperimentContainer.style.display = 'none';
            }, 500); 
        });
    }

    if (cyberThemeBtn) {
        cyberThemeBtn.addEventListener('click', () => {
            if (state.specialTheme === 'cyber') {
                state.specialTheme = null;
                localStorage.removeItem('drSongRankerSpecialTheme');
            } else {
                state.specialTheme = 'cyber';
                localStorage.setItem('drSongRankerSpecialTheme', 'cyber');
                
                // same drill. wipe everything else.
                colorBtns.forEach(b => b.classList.remove('active'));
                bgBtns.forEach(b => b.classList.remove('active'));
                customColorLabel.classList.remove('active');
                customBgLabel.classList.remove('active');
            }
            applySpecialTheme();
            saveState();
        });
    }

    // undertale modding trend nonsense. i don't know why i do this.
    const makeRedderBtn = document.getElementById('make-redder-btn');
    const makeGreenerBtn = document.getElementById('make-greener-btn');
    const makeBluerBtn = document.getElementById('make-bluer-btn');

    let moddingRed = 0;
    let moddingGreen = 0;
    let moddingBlue = 0;

    function applyModdingOverlay() {
        let trendLayer = document.getElementById('modding-trend-overlay');
        if (!trendLayer) {
            // why am i making dom elements in js again? right. no energy to add to html.
            trendLayer = document.createElement('div');
            trendLayer.id = 'modding-trend-overlay';
            trendLayer.style.position = 'fixed';
            trendLayer.style.top = '0';
            trendLayer.style.left = '0';
            trendLayer.style.width = '100vw';
            trendLayer.style.height = '100vh';
            trendLayer.style.pointerEvents = 'none';
            trendLayer.style.zIndex = '999999';
            document.body.appendChild(trendLayer);
        }

        if (moddingRed === 0 && moddingGreen === 0 && moddingBlue === 0) {
            trendLayer.style.display = 'none';
            return;
        }

        trendLayer.style.display = 'block';
        // stacked gradients because background-color doesn't layer multiple rgba values. css is stupid.
        trendLayer.style.backgroundImage = `
            linear-gradient(rgba(255,0,0,${Math.min(1, moddingRed)}), rgba(255,0,0,${Math.min(1, moddingRed)})),
            linear-gradient(rgba(0,255,0,${Math.min(1, moddingGreen)}), rgba(0,255,0,${Math.min(1, moddingGreen)})),
            linear-gradient(rgba(0,0,255,${Math.min(1, moddingBlue)}), rgba(0,0,255,${Math.min(1, moddingBlue)}))
        `;
    }

    if (makeRedderBtn) {
        makeRedderBtn.addEventListener('click', () => {
            moddingRed += 0.25;
            applyModdingOverlay();
        });
    }

    if (makeGreenerBtn) {
        makeGreenerBtn.addEventListener('click', () => {
            moddingGreen += 0.25;
            applyModdingOverlay();
        });
    }

    if (makeBluerBtn) {
        makeBluerBtn.addEventListener('click', () => {
            moddingBlue += 0.25;
            applyModdingOverlay();
        });
    }

    // start it up. hopefully no one uses this.
    applyModdingOverlay();

    // math. i'm done with this.
    function getContrastColor(hexColor) {
        if (!hexColor) return 'white'; // whatever
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? 'black' : 'white';
    }

    let globalState = JSON.parse(localStorage.getItem('drSongRankerGlobalState') || '{"currentGame": "deltarune", "showRatings": false, "hideLeaderboard": false, "hideMatchupRankings": false, "hideAccuracy": false, "hideAccuracyPercent": false, "showAgreement": false, "preventDuplicates": true, "combinedDiscovered": false, "felfebMode": true, "useSystemCursor": false, "selectedFranchises": ["deltarune", "undertale", "uty", "tsus"], "specialTheme": null, "soulColor": "red", "soulInverted": false}');

    let state = {
        currentGame: globalState.currentGame,
        songs: [],
        comparisons: 0,
        history: null,
        secretsUnlocked: false,
        activeRankerList: 'all',
        customLists: {},
        currentCustomListName: null,
        boostedSongId: null,
        showRatings: globalState.showRatings,
        showAgreement: globalState.showAgreement || false,
        preventDuplicates: globalState.preventDuplicates !== undefined ? globalState.preventDuplicates : true,
        recentMatches: [], // keeping track of what we just saw.
        volume: parseFloat(localStorage.getItem('drSongRankerVolume') || '0.5'),
        felfebMode: globalState.felfebMode !== undefined ? globalState.felfebMode : true,

        useSystemCursor: globalState.useSystemCursor || false,
        selectedFranchises: globalState.selectedFranchises || ["deltarune", "undertale", "uty", "tsus"],
        hasSeenFinishScreen: false, // don't spam them with this every second
        hideLeaderboard: globalState.hideLeaderboard || false,
        hideMatchupRankings: globalState.hideMatchupRankings || false,
        hideAccuracy: globalState.hideAccuracy || false,
        hideAccuracyPercent: globalState.hideAccuracyPercent || false, // hiding the percentage. apparently numbers are stressful.
        showGlobalDiff: globalState.showGlobalDiff || false,
        specialTheme: globalState.specialTheme || localStorage.getItem('drSongRankerSpecialTheme') || null,
        soulColor: globalState.soulColor || 'red',
        soulInverted: globalState.soulInverted || false
    };

    function saveState() {
        const keyMap = {
            'combined': 'combinedSongRankerState',
            'deltarune': 'drSongRankerState',
            'undertale': 'utSongRankerState',
            'uty': 'utySongRankerState',
            'tsus': 'tsusSongRankerState'
        };
        const key = keyMap[state.currentGame] || 'drSongRankerState';
        localStorage.setItem(key, JSON.stringify(state));

        // why am i saving this twice? whatever.
        localStorage.setItem('drSongRankerGlobalState', JSON.stringify({
            currentGame: state.currentGame,
            showRatings: state.showRatings,
            preventDuplicates: state.preventDuplicates,
            combinedDiscovered: globalState.combinedDiscovered,
            felfebMode: state.felfebMode,

            useSystemCursor: state.useSystemCursor,
            showAgreement: state.showAgreement,
            selectedFranchises: state.selectedFranchises,
            hideLeaderboard: state.hideLeaderboard,
            hideMatchupRankings: state.hideMatchupRankings,
            hideAccuracy: state.hideAccuracy,
            hideAccuracyPercent: state.hideAccuracyPercent,
            showGlobalDiff: state.showGlobalDiff,
            specialTheme: state.specialTheme,
            soulColor: state.soulColor,
            soulInverted: state.soulInverted
        }));
    }

    // why am i even hiding this. just look at the screen.
    function updateLeaderboardVisibility() {
        if (!rankingContainer) return;
        if (state.hideLeaderboard) {
            rankingContainer.classList.add('force-hidden');
        } else {
            rankingContainer.classList.remove('force-hidden');
        }
    }

    function loadState() {
        const keyMap = {
            'combined': 'combinedSongRankerState',
            'deltarune': 'drSongRankerState',
            'undertale': 'utSongRankerState',
            'uty': 'utySongRankerState',
            'tsus': 'tsusSongRankerState'
        };
        const key = keyMap[state.currentGame] || 'drSongRankerState';
        const saved = localStorage.getItem(key);

        // choose the source list based on game. i hate this.
        let sourceList = [];
        if (state.currentGame === 'combined') {
            const drList = (typeof songList !== 'undefined') ? songList : (window.songList || []);
            const utList = (typeof utSongList !== 'undefined') ? utSongList : (window.utSongList || []);
            const utyList = (typeof utySongList !== 'undefined') ? utySongList : (window.utySongList || []);
            const tsusList = (typeof tsusSongList !== 'undefined') ? tsusSongList : (window.tsusSongList || []);
            
            if (state.selectedFranchises.includes('deltarune')) sourceList.push(...drList);
            if (state.selectedFranchises.includes('undertale')) sourceList.push(...utList);
            if (state.selectedFranchises.includes('uty')) sourceList.push(...utyList);
            if (state.selectedFranchises.includes('tsus')) sourceList.push(...tsusList);

            // if they somehow uncheck everything, just give them deltarune. i don't constant-check this.
            if (sourceList.length === 0) sourceList = drList;
        } else if (state.currentGame === 'deltarune') {
            sourceList = (typeof songList !== 'undefined') ? songList : (window.songList || []);
        } else if (state.currentGame === 'undertale') {
            sourceList = (typeof utSongList !== 'undefined') ? utSongList : (window.utSongList || []);
        } else if (state.currentGame === 'uty') {
            sourceList = (typeof utySongList !== 'undefined') ? utySongList : (window.utySongList || []);
        } else {
            sourceList = (typeof tsusSongList !== 'undefined') ? tsusSongList : (window.tsusSongList || []);
        }

        const drSaved = localStorage.getItem('drSongRankerState');
        const utSaved = localStorage.getItem('utSongRankerState');
        const utySaved = localStorage.getItem('utySongRankerState');
        const tsusSaved = localStorage.getItem('tsusSongRankerState');
        const combinedSaved = localStorage.getItem('combinedSongRankerState');
        
        const drParsed = drSaved ? JSON.parse(drSaved) : null;
        const utParsed = utSaved ? JSON.parse(utSaved) : null;
        const utyParsed = utySaved ? JSON.parse(utySaved) : null;
        const tsusParsed = tsusSaved ? JSON.parse(tsusSaved) : null;
        const combinedParsed = combinedSaved ? JSON.parse(combinedSaved) : null;

        if (saved) {
            const parsed = JSON.parse(saved);
            state.comparisons = parsed.comparisons || 0;
            state.history = parsed.history || null;
            state.activeRankerList = parsed.activeRankerList || 'all';
            // don't overwrite if i already loaded this garbage from storage.
            if (Object.keys(state.customLists).length === 0 && parsed.customLists && Object.keys(parsed.customLists).length > 0) {
                state.customLists = parsed.customLists;
                localStorage.setItem('drSongRankerCustomLists', JSON.stringify(state.customLists));
            }
            state.boostedSongId = parsed.boostedSongId || null;
            state.felfebMode = parsed.felfebMode !== undefined ? parsed.felfebMode : state.felfebMode;

            state.useSystemCursor = parsed.useSystemCursor !== undefined ? parsed.useSystemCursor : state.useSystemCursor;
            state.hasSeenFinishScreen = parsed.hasSeenFinishScreen || false;

            state.songs = sourceList.map(baseSong => {
                const possibleStates = [
                    parsed && parsed.songs ? parsed.songs.find(s => s.id === baseSong.id) : null,
                    drParsed && drParsed.songs ? drParsed.songs.find(s => s.id === baseSong.id) : null,
                    utParsed && utParsed.songs ? utParsed.songs.find(s => s.id === baseSong.id) : null,
                    utyParsed && utyParsed.songs ? utyParsed.songs.find(s => s.id === baseSong.id) : null,
                    tsusParsed && tsusParsed.songs ? tsusParsed.songs.find(s => s.id === baseSong.id) : null,
                    combinedParsed && combinedParsed.songs ? combinedParsed.songs.find(s => s.id === baseSong.id) : null
                ].filter(s => s !== null);

                const freshest = possibleStates.sort((a, b) => (b.comparisons || 0) - (a.comparisons || 0))[0];

                if (freshest) {
                    return {
                        ...baseSong,
                        rating: freshest.rating,
                        comparisons: freshest.comparisons,
                        matchHistory: freshest.matchHistory || [],
                        felfebRating: freshest.felfebRating || 1500,
                        felfebComparisons: freshest.felfebComparisons || 0,
                        felfebMatchHistory: freshest.felfebMatchHistory || []
                    };
                }
                return {
                    ...baseSong,
                    rating: 1500,
                    comparisons: 0,
                    matchHistory: [],
                    felfebRating: 1500,
                    felfebComparisons: 0,
                    felfebMatchHistory: []
                };
            });
        } else {
            state.songs = sourceList.map(baseSong => {
                const possibleStates = [
                    drParsed && drParsed.songs ? drParsed.songs.find(s => s.id === baseSong.id) : null,
                    utParsed && utParsed.songs ? utParsed.songs.find(s => s.id === baseSong.id) : null,
                    utyParsed && utyParsed.songs ? utyParsed.songs.find(s => s.id === baseSong.id) : null,
                    tsusParsed && tsusParsed.songs ? tsusParsed.songs.find(s => s.id === baseSong.id) : null,
                    combinedParsed && combinedParsed.songs ? combinedParsed.songs.find(s => s.id === baseSong.id) : null
                ].filter(s => s !== null);

                const freshest = possibleStates.sort((a, b) => (b.comparisons || 0) - (a.comparisons || 0))[0];

                if (freshest) {
                    return {
                        ...baseSong,
                        rating: freshest.rating,
                        comparisons: freshest.comparisons,
                        matchHistory: freshest.matchHistory || [],
                        felfebRating: freshest.felfebRating || 1500,
                        felfebComparisons: freshest.felfebComparisons || 0,
                        felfebMatchHistory: freshest.felfebMatchHistory || []
                    };
                }
                return {
                    ...baseSong,
                    rating: 1500,
                    comparisons: 0,
                    matchHistory: [],
                    felfebRating: 1500,
                    felfebComparisons: 0,
                    felfebMatchHistory: []
                };
            });
            state.comparisons = 0;
            state.history = null;
            state.activeRankerList = 'all';
            // i'm not clearing customLists here because loadCustomLists already did its job.
            state.boostedSongId = null;
        }

        populateCustomDropdown();

        // validation.
        const drValid = ['all', 'all_plus', '1', '2', '3', '4', 'hidden', 'duration_30', 'duration_20', 'duration_10', 'felfeb'];
        const utValid = ['all', 'all_plus', '1', '2', '3', '4', '5', 'hidden', 'duration_30', 'duration_20', 'duration_10', 'felfeb'];
        const utyValid = ['all', 'all_plus', 'ruins', 'snowdin', 'dunes', 'wild_east', 'steamworks', 'new_home', 'hidden', 'duration_30', 'duration_20', 'duration_10'];
        const tsusValid = ['all', 'all_plus', 'ruined_home', 'stardust_woods', 'koffin_keep', 'starstruck_village', 'crystal_springs', 'extras', 'hidden', 'duration_30', 'duration_20', 'duration_10'];
        let validLists = state.currentGame === 'deltarune' ? drValid : (state.currentGame === 'undertale' ? utValid : (state.currentGame === 'uty' ? utyValid : tsusValid));
        if (state.currentGame === 'combined') {
            validLists = Array.from(new Set([...drValid, ...utValid, ...utyValid, ...tsusValid, 'combined_all', 'felfeb']));
        }

        if (!validLists.includes(state.activeRankerList) && !state.customLists[state.activeRankerList]) {
            state.activeRankerList = 'all';
            currentChapterFilter = 'all';
            if (mainFilterSelect) mainFilterSelect.value = 'all';
        } else {
            currentChapterFilter = state.activeRankerList;
            if (mainFilterSelect) mainFilterSelect.value = state.activeRankerList;
        }

        // force this setting on for everyone at least once. i hate dealing with legacy saves.
        if (!localStorage.getItem('drSongRankerPreventDuplicatesForcedOn_v2')) {
            state.preventDuplicates = true;
            localStorage.setItem('drSongRankerPreventDuplicatesForcedOn_v2', 'true');
            saveState();
            if (preventDuplicatesToggle) preventDuplicatesToggle.checked = true;
        }

        // apply system cursor class if enabled. because some people hate fun.
        if (state.useSystemCursor) {
            document.body.classList.add('system-cursor');
        } else {
            document.body.classList.remove('system-cursor');
        }

        updateGameUI();
        updateLeaderboardVisibility();
        updateSoulColorUI();
    }

    function updateSoulColorUI() {
        // sync the cursor and the setting buttons. i'm sick of looking at this.
        const soulBtns = document.querySelectorAll('.soul-option');
        const cursor = document.querySelector('.custom-cursor');
        
        soulBtns.forEach(btn => {
            if (btn.dataset.soul === state.soulColor) btn.classList.add('active');
            else btn.classList.remove('active');
        });

        if (customSoulLabel) {
            if (state.soulColor && state.soulColor.startsWith('#')) {
                customSoulLabel.classList.add('active');
                customSoulLabel.style.backgroundColor = state.soulColor;
                customSoulLabel.style.color = getContrastColor(state.soulColor);
                if (customSoulPicker) {
                    customSoulPicker.value = state.soulColor;
                }
            } else {
                customSoulLabel.classList.remove('active');
                customSoulLabel.style.backgroundColor = '';
                customSoulLabel.style.color = '';
            }
        }

        if (cursor) {
            // clear old classes but keep active if it's there
            const isActive = cursor.classList.contains('active');
            cursor.className = 'custom-cursor';
            if (isActive) cursor.classList.add('active');

            const invertBtn = document.getElementById('custom-soul-invert');
            if (invertBtn) {
                const isCustom = state.soulColor && state.soulColor.startsWith('#');
                if (isCustom && state.soulInverted) invertBtn.classList.add('active');
                else invertBtn.classList.remove('active');
            }
            
            cursor.setAttribute('data-soul-mode', state.soulColor);
            if (state.soulColor && state.soulColor.startsWith('#')) {
                cursor.style.backgroundColor = state.soulColor;
                cursor.style.setProperty('--cursor-glow', state.soulColor);
                if (state.soulInverted) cursor.classList.add('inverted');
            } else {
                cursor.style.backgroundColor = '';
                cursor.style.setProperty('--cursor-glow', '');
                if (state.soulColor !== 'red') {
                    cursor.classList.add(`soul-${state.soulColor}`);
                }
            }
        }
    }

    // soul setting listeners. i hope no one clicks these.
    document.querySelectorAll('.soul-option').forEach(btn => {
        btn.addEventListener('click', () => {
            state.soulColor = btn.dataset.soul;
            updateSoulColorUI();
            saveState();
        });
    });

    if (customSoulPicker) {
        customSoulPicker.addEventListener('input', (e) => {
            const color = e.target.value;
            state.soulColor = color;
            updateSoulColorUI();
            saveState();
        });
    }

    const customSoulInvertBtn = document.getElementById('custom-soul-invert');
    if (customSoulInvertBtn) {
        customSoulInvertBtn.addEventListener('click', () => {
            // only meaningful for custom colors. presets have their own story.
            if (state.soulColor && state.soulColor.startsWith('#')) {
                state.soulInverted = !state.soulInverted;
                updateSoulColorUI();
                saveState();
            }
        });
    }

    function updateGameUI() {
        if (state.currentGame === 'deltarune') {
            if (drToggle) drToggle.classList.add('active');
            if (combinedToggle) combinedToggle.classList.remove('active');
            if (utToggle) utToggle.classList.remove('active');
            if (mainTitle) mainTitle.textContent = "Which Deltarune song is better?";
        } else if (state.currentGame === 'combined') {
            if (drToggle) drToggle.classList.remove('active');
            if (combinedToggle) combinedToggle.classList.add('active');
            if (utToggle) utToggle.classList.remove('active');
            if (utyToggle) utyToggle.classList.remove('active');
            if (mainTitle) mainTitle.textContent = "Deltarune vs Undertale vs UTY: Which is better?";
        } else if (state.currentGame === 'undertale') {
            if (drToggle) drToggle.classList.remove('active');
            if (combinedToggle) combinedToggle.classList.remove('active');
            if (utToggle) utToggle.classList.add('active');
            if (utyToggle) utyToggle.classList.remove('active');
            if (mainTitle) mainTitle.textContent = "Which Undertale song is better?";
        } else if (state.currentGame === 'uty') {
            if (drToggle) drToggle.classList.remove('active');
            if (combinedToggle) combinedToggle.classList.remove('active');
            if (utToggle) utToggle.classList.remove('active');
            if (utyToggle) utyToggle.classList.add('active');
            if (tsusToggle) tsusToggle.classList.remove('active');
            if (mainTitle) mainTitle.textContent = "Which Undertale Yellow song is better?";
        } else {
            if (drToggle) drToggle.classList.remove('active');
            if (combinedToggle) combinedToggle.classList.remove('active');
            if (utToggle) utToggle.classList.remove('active');
            if (utyToggle) utyToggle.classList.remove('active');
            if (tsusToggle) tsusToggle.classList.add('active');
            if (mainTitle) mainTitle.textContent = "Which TS!Underswap song is better?";
        }

        if (drToggle && state.currentGame !== 'deltarune') drToggle.classList.remove('active');
        if (utToggle && state.currentGame !== 'undertale') utToggle.classList.remove('active');
        if (utyToggle && state.currentGame !== 'uty') utyToggle.classList.remove('active');
        if (tsusToggle && state.currentGame !== 'tsus') tsusToggle.classList.remove('active');
        if (combinedToggle && state.currentGame !== 'combined') combinedToggle.classList.remove('active');

        if (combinedToggle) {
            combinedToggle.style.display = globalState.combinedDiscovered ? 'inline-block' : 'none';
        }
    }
    const PREVIEW_DURATION = 10000;
    const PREVIEW_START_TIME = 30;

    function checkSecretsGlobal() {
        const unlocked = localStorage.getItem('drSongRankerSecretsUnlocked') === 'true';
        state.secretsUnlocked = unlocked;
        if (secretLink) {
            secretLink.style.display = unlocked ? 'inline-block' : 'none';
        }
        if (hiddenTab) {
            hiddenTab.style.display = unlocked ? 'inline-block' : 'none';
        }
    }
    checkSecretsGlobal();

    // apple is a nightmare.
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    // volume logic. make it loud.
    function initVolume() {
        if (volumeSlider) {
            // ios doesn't let us touch the volume. because they hate us.
            if (isIOS) {
                volumeSlider.parentElement.style.display = 'none';
                return;
            }

            volumeSlider.value = state.volume;

            const updateVolume = (val) => {
                state.volume = val;
                localStorage.setItem('drSongRankerVolume', val);
                if (audioA) audioA.volume = val;
                if (audioB) audioB.volume = val;
                if (playlistAudio) playlistAudio.volume = val;
            };

            // init audio elements
            updateVolume(state.volume);

            volumeSlider.addEventListener('input', (e) => {
                updateVolume(parseFloat(e.target.value));
            });
        }
    }
    initVolume();

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds === Infinity) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }


    function updateProgressBar() {
        if (!currentActiveAudio) return;

        const audio = currentActiveAudio;
        if (audio.duration) {
            const percent = (audio.currentTime / audio.duration) * 100;
            playerProgress.value = percent;
            playerCurrentTime.textContent = formatTime(audio.currentTime);
            playerDuration.textContent = formatTime(audio.duration);
        }

        if (!audio.paused) {
            requestAnimationFrame(updateProgressBar);
        }
    }

    if (playerProgress) {
        const handleSeek = (e) => {
            if (!currentActiveAudio || !currentActiveAudio.duration || currentActiveAudio.duration === Infinity) return;
            const seekTime = (e.target.value / 100) * currentActiveAudio.duration;

            // safari gets cranky if we seek too fast.
            try {
                currentActiveAudio.currentTime = seekTime;
                playerCurrentTime.textContent = formatTime(seekTime);
            } catch (err) {
                console.warn("Seeking failed. Safari being Safari.", err);
            }
        };

        playerProgress.addEventListener('input', handleSeek);
        playerProgress.addEventListener('change', handleSeek);
    }

    // sync time updates if requestAnimationFrame is too much. 
    // actually, let's just use it when playing. performance is a myth anyway.
    [audioA, audioB, playlistAudio].forEach(audio => {
        audio.addEventListener('play', () => requestAnimationFrame(updateProgressBar));
        audio.addEventListener('loadedmetadata', () => {
            if (currentActiveAudio === audio) {
                playerDuration.textContent = formatTime(audio.duration);
            }
        });
    });


    // load lists. don't ask.
    function loadCustomLists() {
        const saved = localStorage.getItem('drSongRankerCustomLists');
        if (saved) {
            state.customLists = JSON.parse(saved);
        } else {
            // migration. i hate backward compatibility.
            const oldList = localStorage.getItem('drSongRankerCustomSelection');
            if (oldList) {
                state.customLists = { "Default": JSON.parse(oldList) };
                localStorage.setItem('drSongRankerCustomLists', JSON.stringify(state.customLists));
                // remove the old key so we don't migrate again if the user deletes "Default"
                localStorage.removeItem('drSongRankerCustomSelection');
            } else {
                state.customLists = {}; // init empty if nothing exists
            }
        }
        populateCustomDropdown();
    }
    loadCustomLists();

    // creation logic. whatever.
    if (createListBtn) {
        createListBtn.addEventListener('click', () => {
            const name = prompt("Enter a name for your new custom list:");
            if (!name) return;

            if (state.customLists[name] || ['all', 'all_plus', 'hidden', '1', '2', '3', '4'].includes(name) || name.startsWith('duration_')) {
                alert("List name already exists or is reserved!");
                return;
            }

            state.customLists[name] = [];
            state.currentCustomListName = name;
            saveListsToStorage();

            populateCustomDropdown(); // make sure dropdown has it

            // auto select.
            if (mainFilterSelect) {
                mainFilterSelect.value = name;
                // manual trigger. suffering.
                mainFilterSelect.dispatchEvent(new Event('change'));
            }

            // open the editor.
            showListEditor(name);
        });
    }

    if (editListBtn) {
        editListBtn.addEventListener('click', () => {
            const currentObj = mainFilterSelect;
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

    if (showRatingsToggle) {
        showRatingsToggle.checked = state.showRatings;
        showRatingsToggle.addEventListener('change', (e) => {
            state.showRatings = e.target.checked;
            saveState();
            if (myRankingBtn.classList.contains('active')) displayRankings();
            else displayCommunityRankings();
        });
    }

    if (preventDuplicatesToggle) {
        preventDuplicatesToggle.checked = state.preventDuplicates;
        preventDuplicatesToggle.addEventListener('change', (e) => {
            state.preventDuplicates = e.target.checked;
            // fine, clear the memory. i don't care.
            if (!state.preventDuplicates) state.recentMatches = [];
            saveState();
        });
    }

    // global diff toggle. who even uses this
    if (showGlobalDiffToggle) {
        showGlobalDiffToggle.checked = state.showGlobalDiff;
        showGlobalDiffToggle.addEventListener('change', (e) => {
            state.showGlobalDiff = e.target.checked;
            saveState();
            if (myRankingBtn.classList.contains('active')) displayRankings();
        });
    }

    if (felfebModeToggle) {
        felfebModeToggle.checked = state.felfebMode;
        felfebModeToggle.addEventListener('change', (e) => {
            state.felfebMode = e.target.checked;
            saveState();
        });
    }



    if (systemCursorToggle) {
        systemCursorToggle.checked = state.useSystemCursor;
        systemCursorToggle.addEventListener('change', (e) => {
            state.useSystemCursor = e.target.checked;
            if (state.useSystemCursor) {
                document.body.classList.add('system-cursor');
            } else {
                document.body.classList.remove('system-cursor');
            }
            saveState();
        });
    }

    if (showAgreementToggle) {
        showAgreementToggle.checked = state.showAgreement;
        showAgreementToggle.addEventListener('change', (e) => {
            state.showAgreement = e.target.checked;
            saveState();
        });
    }



    if (hideLeaderboardToggle) {
        hideLeaderboardToggle.checked = state.hideLeaderboard;
        // great, another toggle to manage. like i don't have enough to do.
        hideLeaderboardToggle.addEventListener('change', (e) => {
            state.hideLeaderboard = e.target.checked;
            saveState();
            updateLeaderboardVisibility();
        });
    }

    // another toggle because people complain about numbers.
    if (hideMatchupRankingsToggle) {
        hideMatchupRankingsToggle.checked = state.hideMatchupRankings;
        hideMatchupRankingsToggle.addEventListener('change', (e) => {
            state.hideMatchupRankings = e.target.checked;
            saveState();
            
            // force update the dom. whatever.
            if (songARank) {
                if (state.hideMatchupRankings) {
                    songARank.style.display = 'none';
                } else {
                    songARank.style.display = 'block';
                }
            }
            if (songBRank) {
                if (state.hideMatchupRankings) {
                    songBRank.style.display = 'none';
                } else {
                    songBRank.style.display = 'block';
                }
            }
        });
    }

    // hide the accuracy bar. anon from discord asked for this.
    if (hideAccuracyToggle) {
        hideAccuracyToggle.checked = state.hideAccuracy;
        hideAccuracyToggle.addEventListener('change', (e) => {
            state.hideAccuracy = e.target.checked;
            saveState();
            updateProgress();
        });
    }

    if (hideAccuracyPercentToggle) {
        hideAccuracyPercentToggle.checked = state.hideAccuracyPercent;
        hideAccuracyPercentToggle.addEventListener('change', (e) => {
            state.hideAccuracyPercent = e.target.checked;
            saveState();
            updateProgress(); // refresh the bar i guess.
        });
    }

    saveCustomBtn.addEventListener('click', () => {
        const name = state.currentCustomListName;
        if (!name) return;

        const checked = Array.from(customChecklistContainer.querySelectorAll('input:checked'))
            .map(input => parseInt(input.dataset.id));

        state.customLists[name] = checked;
        saveListsToStorage();

        // feedback.
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

        // hide modal
        customRankerModal.style.display = 'none';

        // refresh dropdown
        populateCustomDropdown();

        // reset selection to 'all'
        if (mainFilterSelect) {
            mainFilterSelect.value = 'all';
            mainFilterSelect.dispatchEvent(new Event('change'));
        }
    });


    function populateCustomChecklist(selectedIds = []) {
        customChecklistContainer.innerHTML = '';

        // all songs. no mercy.
        // state.songs has everything for the current game mode. not just deltarune.
        state.songs.forEach(song => {
            // hidden tracks only show if unlocked or if we're specifically editing a list that had them
            if (song.hidden && !state.secretsUnlocked && !selectedIds.includes(song.id)) return;

            const div = document.createElement('div');
            div.className = 'checklist-item';

            // allow clicking the row to toggle
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


    suggestBtn.addEventListener('click', () => {
        window.open('https://stavros-alt.github.io/Stavros-alt/suggestions.html', '_blank');
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

    // felfeb accessors. i refuse to copy-paste field names everywhere.
    function isFelfebRanker() {
        return state.activeRankerList === 'felfeb';
    }

    function getRating(song) {
        return isFelfebRanker() ? (song.felfebRating || 1500) : song.rating;
    }

    function getComparisons(song) {
        return isFelfebRanker() ? (song.felfebComparisons || 0) : song.comparisons;
    }

    function getMatchHistory(song) {
        return isFelfebRanker() ? (song.felfebMatchHistory || []) : (song.matchHistory || []);
    }

    function getFilteredSongs() {
        const query = rankingSearch.value.toLowerCase();
        const filter = state.activeRankerList;

        let pool = state.songs;



        if (filter === 'all' || filter === 'combined_all') {
            // normal OST only. no secrets.
            pool = pool.filter(s => !s.hidden);
        } else if (filter === 'all_plus') {
            // show me everything (if unlocked)
            return state.secretsUnlocked ? pool : pool.filter(s => !s.hidden);
        } else if (['1', '2', '3', '4', '5'].includes(filter)) {
            const ch = parseInt(filter);
            return pool.filter(s => (!s.hidden || state.secretsUnlocked) && getChaptersForSong(s).includes(ch));
        } else if (['ruins', 'snowdin', 'dunes', 'wild_east', 'steamworks', 'new_home', 'ruined_home', 'stardust_woods', 'koffin_keep', 'starstruck_village', 'crystal_springs', 'extras'].includes(filter)) {
            return pool.filter(s => (!s.hidden || state.secretsUnlocked) && getChaptersForSong(s).includes(filter));
        } else if (filter.startsWith('duration_')) {
            const limit = parseInt(filter.split('_')[1]);
            // filter out songs shorter than the limit (keep long ones).
            // also exclude hidden unless unlocked. whatever.
            return pool.filter(s => (!s.hidden || state.secretsUnlocked) && (s.duration && s.duration >= limit));
        } else if (filter === 'felfeb') {
            // only songs with felfeb versions. the musical lives on.
            return pool.filter(s => s.felfebFile && (!s.hidden || state.secretsUnlocked));
        } else if (filter === 'hidden') {
            return state.secretsUnlocked ? pool.filter(s => s.hidden) : [];
        } else if (filter.startsWith('mix_')) {
            // "mix_1_2_3" -> [1, 2, 3]
            const chapters = filter.replace('mix_', '').split('_').map(Number);
            return pool.filter(s => {
                if (s.hidden && !state.secretsUnlocked) return false;
                const songChapters = getChaptersForSong(s);
                return songChapters.some(ch => chapters.includes(ch));
            });
        } else {
            // assuming it's a custom list name
            const ids = state.customLists[filter] || [];
            return pool.filter(s => ids.includes(s.id) && (!s.hidden || state.secretsUnlocked));
        }

        return pool.filter(s => s.name.toLowerCase().includes(query));
    }

    function getChaptersForSong(song) {
        if (song.id >= 4000) {
            // TS!Underswap regional filters as requested
            if (song.region) return [song.region.toLowerCase().replace(/ /g, '_')];
            return ['all'];
        }
        if (song.id >= 2000) {
            const track = song.id - 2000;
            if (track <= 16) return ['ruins'];
            if (track >= 17 && track <= 33) return ['snowdin'];
            if (track >= 34 && track <= 49) return ['dunes'];
            if (track >= 50 && track <= 72) return ['wild_east'];
            if (track >= 73 && track <= 94) return ['steamworks'];
            if (track >= 95 && track <= 125) return ['new_home'];
            if (track === 126) return ['new_home']; // final encounter. finally done with asgore.
            if (track === 127) return ['ruins', 'snowdin', 'dunes', 'steamworks', 'new_home']; // enemy retreating. because it plays everywhere i guess.
            if (track === 128) return ['snowdin']; // apprehension. genocide martlet is a nightmare.
            if (track === 129 || track === 130) return ['wild_east']; // orange skies and trial by fury. starlo and ceroba are exhausting.
            if (track === 131) return ['steamworks']; // end of the line. axis is just... ugh.
            if (track >= 132) return ['new_home']; // remedy, retribution, honest day's work, adjourned. zenith martlet. don't even talk to me.
            return [];
        }
        if (song.id < 1000) {
            const ch = [];
            if (song.id <= 40) ch.push(1);
            if ((song.id >= 41 && song.id <= 87) || song.id === 38 || song.id === 40) {
                ch.push(2);
            }
            if (song.id >= 88 && song.id <= 125) ch.push(3);
            if (song.id >= 126 && song.id <= 200) ch.push(4);
            return ch;
        } else {
            // Undertale areas. Ruins (1-14), Snowdin (15-24), Waterfall (25-46), Hotland/CORE (47-70), New Home (71+)
            const track = song.id - 1000;
            if (track <= 14) return [1];
            if (track >= 15 && track <= 24) return [2];
            if (track >= 25 && track <= 46) return [3];
            if (track >= 47 && track <= 70) return [4];
            if (track >= 71) return [5];
            return [];
        }
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
            if (songARank) songARank.textContent = "";
            if (songBRank) songBRank.textContent = "";

            chooseABtn.disabled = true;
            chooseBBtn.disabled = true;
            skipBtn.disabled = true;
            return;
        }

        chooseABtn.disabled = false;
        chooseBBtn.disabled = false;
        skipBtn.disabled = false;

        let song1, song2;
        let attempts = 0;
        const maxAttempts = 50; // if we can't find a new pair in 50 tries, just give up. i'm done.

        do {
            // picking two songs. don't ask about the distribution.
            const roll = Math.random();

            // is someone cheating? i mean, using the boost feature?
            let boostedSong = null;
            if (state.boostedSongId) {
                boostedSong = availableSongs.find(s => s.id === state.boostedSongId);
            }

            if (boostedSong && Math.random() < 0.25) {
                song1 = boostedSong;
                state.boostedSongId = null; // finally done with that one.
                if (myRankingBtn.classList.contains('active')) displayRankings();
                else displayCommunityRankings();
            } else if (roll < 0.6) {
                // 60% for underrated
                const sortedByVotes = [...availableSongs].sort((a, b) => getComparisons(a) - getComparisons(b));
                const uncertaintyPoolSize = Math.max(5, Math.floor(availableSongs.length * 0.25));
                const uncertaintyPool = sortedByVotes.slice(0, uncertaintyPoolSize);
                song1 = uncertaintyPool[Math.floor(Math.random() * uncertaintyPool.length)];
            } else if (roll < 0.9) {
                // 30% for top rated
                const sortedByRating = [...availableSongs].sort((a, b) => getRating(b) - getRating(a));
                const topPoolSize = Math.min(20, availableSongs.length);
                const topPool = sortedByRating.slice(0, topPoolSize);
                song1 = topPool[Math.floor(Math.random() * topPool.length)];
            } else {
                // 10% pure chaos
                song1 = availableSongs[Math.floor(Math.random() * availableSongs.length)];
            }


            // next victim.
            const sortedOpponents = [...availableSongs]
                .filter(s => s.id !== song1.id)
                .sort((a, b) => Math.abs(getRating(a) - getRating(song1)) - Math.abs(getRating(b) - getRating(song1)));

            // neighbors. whatever.
            const neighborPoolSize = 10;
            const neighborPool = sortedOpponents.slice(0, neighborPoolSize);
            song2 = neighborPool[Math.floor(Math.random() * neighborPool.length)];

            if (!state.preventDuplicates || availableSongs.length < 5) break;

            const pairKey = [song1.id, song2.id].sort((a, b) => a - b).join('-');
            
            // strictly check against all history. i'm so tired of repeats.
            const history = getMatchHistory(song1);
            let alreadyFoughtInfo = false;
            for (let i = 0; i < history.length; i++) {
                if (history[i].opponentId === song2.id) {
                    alreadyFoughtInfo = true;
                    break;
                }
            }

            if (!state.recentMatches.includes(pairKey) && !alreadyFoughtInfo) break;
            attempts++;
        } while (attempts < maxAttempts);

        if (state.preventDuplicates && song1 && song2) {
            const pairKey = [song1.id, song2.id].sort((a, b) => a - b).join('-');
            state.recentMatches.push(pairKey);
            // keep it short. i'm not paying for your ram.
            if (state.recentMatches.length > 20) state.recentMatches.shift();
        }


        currentSongA = song1;
        currentSongB = song2;

        if (songAName && currentSongA) songAName.textContent = currentSongA.name;
        if (songBName && currentSongB) songBName.textContent = currentSongB.name;

        // and the numbers. i guess i have to sort the whole pool just to find two indexes.
        if (songARank && songBRank && currentSongA && currentSongB) {
            const sortedByRating = [...availableSongs].sort((a, b) => getRating(b) - getRating(a));
            const rankA = sortedByRating.findIndex(s => s.id === currentSongA.id) + 1;
            const rankB = sortedByRating.findIndex(s => s.id === currentSongB.id) + 1;

            songARank.textContent = `#${rankA}`;
            songBRank.textContent = `#${rankB}`;
            
            if (state.hideMatchupRankings) {
                songARank.style.display = 'none';
                songBRank.style.display = 'none';
            } else {
                songARank.style.display = 'block';
                songBRank.style.display = 'block';
            }
        }

        if (chooseABtn && currentSongA) chooseABtn.textContent = `I prefer ${currentSongA.name}`;
        if (chooseBBtn && currentSongB) chooseBBtn.textContent = `I prefer ${currentSongB.name}`;

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



    async function displayAgreementStats(winner) {
        // disable buttons. i don't want them clicking like crazy.
        chooseABtn.disabled = true;
        chooseBBtn.disabled = true;
        skipBtn.disabled = true;

        const songAStats = await fetchMatchupStats(currentSongA, currentSongB);
        
        const total = songAStats.wins + songAStats.losses;
        let percentA = 50;
        let percentB = 50;

        if (total > 0) {
            percentA = (songAStats.wins / total) * 100;
            percentB = (songAStats.losses / total) * 100;
        }

        const elA = document.getElementById('songA-agreement');
        const elB = document.getElementById('songB-agreement');

        if (elA) {
            elA.textContent = `${Math.round(percentA)}%`;
            elA.classList.add('visible');
        }
        if (elB) {
            elB.textContent = `${Math.round(percentB)}%`;
            elB.classList.add('visible');
        }

        // highlight the user's choice. because validation is nice.
        if (winner === 'A') songACard.style.borderColor = 'var(--accent-color)';
        else if (winner === 'B') songBCard.style.borderColor = 'var(--accent-color)';

        if (nextMatchupBtn) nextMatchupBtn.style.display = 'block';
    }

    async function fetchMatchupStats(songA, songB) {
        if (!songA || !songB) return { wins: 0, losses: 0 };
        try {
            const rpcName = isFelfebRanker() ? 'get_felfeb_global_matchups' : 'get_song_agreement_stats';
            console.log(`[Agreement] Fetching stats for target=${songA.id} (${songA.name}) against opponent=${songB.id} (${songB.name})`);
            
            const { data, error } = await supabaseClient.rpc(rpcName, { target_song_id: parseInt(songA.id) });
            if (error) throw error;

            console.log(`[Agreement] Data for ${songA.id}:`, data);

            if (data && Array.isArray(data)) {
                // use loose equality because sometimes those ids come back as strings from the database
                const matchup = data.find(m => m.opponent_id == songB.id);
                if (matchup) {
                    console.log(`[Agreement] Match found in primary search:`, matchup);
                    return { wins: parseInt(matchup.wins), losses: parseInt(matchup.losses) };
                }
            }

            // fallback: sometimes the database is just being difficult. let's check the other way around.
            console.log(`[Agreement] Match not found for song A as target. Trying song B: ${songB.id}`);
            const { data: dataB, error: errorB } = await supabaseClient.rpc(rpcName, { target_song_id: parseInt(songB.id) });
            if (!errorB && dataB && Array.isArray(dataB)) {
                console.log(`[Agreement] Data for ${songB.id}:`, dataB);
                const matchupB = dataB.find(m => m.opponent_id == songA.id);
                if (matchupB) {
                    console.log(`[Agreement] Match found in fallback:`, matchupB);
                    // inverse wins and losses for song A perspective
                    return { wins: parseInt(matchupB.losses), losses: parseInt(matchupB.wins) };
                }
            }
        } catch (err) {
            console.error("Failed to fetch agreement stats:", err);
        }
        return { wins: 0, losses: 0 };
    }

    if (nextMatchupBtn) {
        nextMatchupBtn.addEventListener('click', () => {
            nextMatchupBtn.style.display = 'none';
            // clean up UI
            const elA = document.getElementById('songA-agreement');
            const elB = document.getElementById('songB-agreement');
            if (elA) elA.classList.remove('visible');
            if (elB) elB.classList.remove('visible');
            songACard.style.borderColor = '';
            songBCard.style.borderColor = '';
            
            // re-enable buttons for next round
            chooseABtn.disabled = false;
            chooseBBtn.disabled = false;
            skipBtn.disabled = false;

            updateApp();
            saveState();
        });
    }

    async function handleChoice(winner) {
        if (!currentSongA || !currentSongB) {
            return;
        }

        // disable everything. i don't want you spamming the database.
        chooseABtn.disabled = true;
        chooseBBtn.disabled = true;
        skipBtn.disabled = true;

        // save history before we mess it up.
        state.history = {
            songA: {
                id: currentSongA.id,
                rating: getRating(currentSongA),
                comparisons: getComparisons(currentSongA)
            },
            songB: {
                id: currentSongB.id,
                rating: getRating(currentSongB),
                comparisons: getComparisons(currentSongB)
            },
            totalComparisons: state.comparisons,
            wasFelfeb: isFelfebRanker()
        };

        if (winner) {
            const winnerSong = (winner === 'A') ? currentSongA : currentSongB;
            const loserSong = (winner === 'A') ? currentSongB : currentSongA;

            const { newWinnerRating, newLoserRating } = updateElo(
                getRating(winnerSong),
                getRating(loserSong),
                getComparisons(winnerSong),
                getComparisons(loserSong)
            );

            const winnerChange = newWinnerRating - getRating(winnerSong);
            const loserChange = newLoserRating - getRating(loserSong);

            recordMatchHistory(winnerSong, loserSong, false, winnerChange, loserChange);

            if (isFelfebRanker()) {
                winnerSong.felfebRating = newWinnerRating;
                loserSong.felfebRating = newLoserRating;
                winnerSong.felfebComparisons++;
                loserSong.felfebComparisons++;
                await recordCommunityVote(winnerSong.id, loserSong.id);
            } else {
                winnerSong.rating = newWinnerRating;
                loserSong.rating = newLoserRating;
                winnerSong.comparisons++;
                loserSong.comparisons++;
                if (state.currentGame === 'combined') { // only sync if in combined mode
                    syncCombinedVote(winnerSong, loserSong);
                }
                await recordCommunityVote(winnerSong.id, loserSong.id);
            }
        } else {
            recordMatchHistory(null, null, true);
        }

        state.comparisons++;

        // i'm only fetching total votes every 15 personal votes because the database cost is killing me.
        votesSinceLastRefresh++;
        if (votesSinceLastRefresh >= 15) {
            fetchAndDisplayAllTimeStats();
            votesSinceLastRefresh = 0;
        } else {
            // incrementing locally because the api is too slow and i have no patience.
            if (voteStat) {
                const currentText = voteStat.textContent || "";
                const match = currentText.match(/\d+/);
                if (match) {
                    const newTotal = parseInt(match[0]) + 1;
                    voteStat.textContent = (isFelfebRanker() ? "Total Felfeb Votes: " : "Total Votes: ") + newTotal;
                }
            }
        }

        if (state.showAgreement && winner) {
            await displayAgreementStats(winner);
        } else {
            // re-enable buttons if not showing agreement
            chooseABtn.disabled = false;
            chooseBBtn.disabled = false;
            skipBtn.disabled = false;
            updateApp();
        }
        saveState();
    }

    function recordMatchHistory(winner, loser, isTie = false, winnerChange = 0, loserChange = 0) {
        const timestamp = Date.now();
        const resultA = isTie ? 'tie' : (winner === currentSongA ? 'win' : 'loss');
        const resultB = isTie ? 'tie' : (winner === currentSongB ? 'win' : 'loss');
        const changeA = isTie ? 0 : (winner === currentSongA ? winnerChange : loserChange);
        const changeB = isTie ? 0 : (winner === currentSongB ? winnerChange : loserChange);

        const historyListA = getMatchHistory(currentSongA);
        const historyListB = getMatchHistory(currentSongB);

        historyListA.unshift({
            opponent: currentSongB.name,
            opponentId: currentSongB.id,
            result: resultA,
            ratingChange: changeA,
            time: timestamp
        });

        historyListB.unshift({
            opponent: currentSongA.name,
            opponentId: currentSongA.id,
            result: resultB,
            ratingChange: changeB,
            time: timestamp
        });

        // cap history to 100 entries. i'm not a database.
        if (historyListA.length > 100) historyListA.pop();
        if (historyListB.length > 100) historyListB.pop();

        // making sure these arrays exist because javascript is terrible.
        if (isFelfebRanker()) {
            currentSongA.felfebMatchHistory = historyListA;
            currentSongB.felfebMatchHistory = historyListB;
        } else {
            currentSongA.matchHistory = historyListA;
            currentSongB.matchHistory = historyListB;
        }
    }

    function syncCombinedVote(winnerSong, loserSong) {
        if (state.currentGame !== 'combined') return;

        // sinking this ship to the other ones.
        try {
            const drStr = localStorage.getItem('drSongRankerState');
            const utStr = localStorage.getItem('utSongRankerState');

            // if they don't exist, we can't update them. tough luck.
            const drState = drStr ? JSON.parse(drStr) : null;
            const utState = utStr ? JSON.parse(utStr) : null;

            let drUpdated = false;
            let utUpdated = false;

            const patch = (targetState, sourceSong) => {
                if (!targetState || !targetState.songs) return false;
                const match = targetState.songs.find(s => s.id === sourceSong.id);
                if (match) {
                    match.rating = sourceSong.rating;
                    match.comparisons = sourceSong.comparisons;
                    match.matchHistory = sourceSong.matchHistory;
                    return true;
                }
                return false;
            };

            // winner
            if (winnerSong.id < 1000) { if (patch(drState, winnerSong)) drUpdated = true; }
            else { if (patch(utState, winnerSong)) utUpdated = true; }

            // loser
            if (loserSong.id < 1000) { if (patch(drState, loserSong)) drUpdated = true; }
            else { if (patch(utState, loserSong)) utUpdated = true; }

            // save if we touched anything
            if (drUpdated && drState) {
                drState.comparisons = (drState.comparisons || 0) + 1;
                localStorage.setItem('drSongRankerState', JSON.stringify(drState));
            }
            if (utUpdated && utState) {
                utState.comparisons = (utState.comparisons || 0) + 1;
                localStorage.setItem('utSongRankerState', JSON.stringify(utState));
            }
        } catch (e) {
            console.error("sync error. localstorage is haunting me.", e);
        }
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
        if (playerProgress) playerProgress.value = 0;
        if (playerCurrentTime) playerCurrentTime.textContent = "0:00";
        if (playerDuration) playerDuration.textContent = "0:00";
    }

    function playPreview(songKey) {
        stopAllMusic();

        const audioEl = (songKey === 'A') ? audioA : audioB;
        const otherAudioEl = (songKey === 'A') ? audioB : audioA;
        const songData = (songKey === 'A') ? currentSongA : currentSongB;

        otherAudioEl.pause();

        currentActiveAudio = audioEl;

        let previewFile = songData.file;
        if (state.felfebMode && songData.felfebFile) {
            if (isFelfebRanker() || Math.random() < 0.1) {
                previewFile = songData.felfebFile;
            }
        }

        playerSongName.textContent = `${songData.name} (Preview)`;

        // no buttons for previews.
        playerPrevBtn.style.visibility = 'hidden';
        playerNextBtn.style.visibility = 'hidden';

        musicPlayerBar.classList.remove('hidden');

        // if it's short, play the last 10 seconds.
        // if it's 30-60s, play from the start.
        // otherwise skip the first 30s because i only care about the middle bit.
        let startTime = PREVIEW_START_TIME;
        if (songData.duration) {
            if (songData.duration < 30) {
                startTime = Math.max(0, songData.duration - 10);
            } else if (songData.duration <= 60) {
                startTime = 0;
            }
        }

        // can't set currentTime until metadata is loaded. browsers are picky about this
        // and it silently breaks after the first song if you don't wait.
        const onMetaReady = () => {
            audioEl.removeEventListener('loadedmetadata', onMetaReady);
            audioEl.currentTime = startTime;
            const playPromise = audioEl.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    playerPlayBtn.textContent = "⏸";
                    activePreviewTimeout = setTimeout(() => {
                        audioEl.pause();
                        playerPlayBtn.textContent = "⏯";
                    }, PREVIEW_DURATION);
                }).catch(err => {
                    console.error("Audio preview playback failed:", err.message);
                });
            }
        };

        audioEl.addEventListener('loadedmetadata', onMetaReady);
        audioEl.onerror = () => console.error("preview audio load error for:", previewFile);
        audioEl.src = encodeURI(previewFile);
        audioEl.load();
    }

    function playFullSong(songKey) {
        const songData = (songKey === 'A') ? currentSongA : currentSongB;
        if (!songData) {
            console.warn("playFullSong called with no song data.");
            return;
        }
        stopAllMusic();

        const audioEl = (songKey === 'A') ? audioA : audioB;

        currentActiveAudio = audioEl;

        let fullFile = songData.file;
        if (state.felfebMode && songData.felfebFile) {
            if (isFelfebRanker() || Math.random() < 0.1) {
                fullFile = songData.felfebFile;
            }
        }

        playerSongName.textContent = songData.name;

        // hide prev/next because this isn't a playlist. i'm lazy.
        playerPrevBtn.style.visibility = 'hidden';
        playerNextBtn.style.visibility = 'hidden';

        musicPlayerBar.classList.remove('hidden');

        // load() resets to t=0 anyway so no need to seek. don't fight the browser.
        audioEl.onerror = () => console.error("full song audio load error for:", fullFile);
        audioEl.src = encodeURI(fullFile);
        audioEl.load();
        audioEl.play().then(() => {
            playerPlayBtn.textContent = "⏸";
        }).catch(err => {
            console.error("Full playback failed:", err.message); // great. even this is broken.
        });
    }



    // recording votes. what a joy.
    async function recordCommunityVote(winnerId, loserId) {
        if (isFelfebRanker()) {
            try {
                const { error } = await supabaseClient.rpc('handle_felfeb_vote', {
                    winner_id: winnerId,
                    loser_id: loserId
                });
                if (error) throw error;
            } catch (error) {
                console.error(`Error recording Felfeb community vote:`, error.message);
            }
            return;
        }

        // mixed votes don't exist in the database. yet.
        const winnerDeltarune = winnerId < 1000;
        const loserDeltarune = loserId < 1000;

        if (winnerDeltarune !== loserDeltarune) return;

        let rpcName;
        if (winnerDeltarune) rpcName = 'handle_vote';
        else if (winnerId > 1000 && winnerId < 2000) rpcName = 'handle_ut_vote';
        else if (winnerId >= 2000 && winnerId < 4000) rpcName = 'handle_uty_vote';
        else if (winnerId >= 4000) rpcName = 'handle_tsus_vote';
        else return; // what even is this song? i don't care.
        try {
            const { error } = await supabaseClient.rpc(rpcName, {
                winner_id: winnerId,
                loser_id: loserId
            });
            if (error) throw error;
        } catch (error) {
            console.error(`Error recording community vote for ${state.currentGame}:`, error.message);
        }
    }



    // fetching stats because i'm obsessed with numbers for some reason.
    async function fetchAndDisplayAllTimeStats() {
        try {
            if (currentChapterFilter === 'felfeb' || isFelfebRanker()) {
                const { data, error } = await supabaseClient.rpc('get_total_felfeb_votes');
                if (error) throw error;
                if (voteStat) voteStat.textContent = `Total Felfeb Votes: ${data || 0}`;
                return;
            }

            if (state.currentGame === 'combined') {
                const [drRes, utRes, utyRes, tsusRes] = await Promise.all([
                    supabaseClient.rpc('get_total_votes'),
                    supabaseClient.rpc('get_total_ut_votes'),
                    supabaseClient.rpc('get_total_uty_votes'),
                    supabaseClient.rpc('get_total_tsus_votes')
                ]);

                if (drRes.error) throw drRes.error;
                if (utRes.error) throw utRes.error;
                if (utyRes.error) throw utyRes.error;
                if (tsusRes.error) throw tsusRes.error;

                const total = (drRes.data || 0) + (utRes.data || 0) + (utyRes.data || 0) + (tsusRes.data || 0);
                if (voteStat) voteStat.textContent = `Total Votes: ${total}`;
                return;
            }

            let rpcName = 'get_total_votes';
            if (state.currentGame === 'undertale') rpcName = 'get_total_ut_votes';
            else if (state.currentGame === 'undertale_yellow' || state.currentGame === 'uty') rpcName = 'get_total_uty_votes';
            else if (state.currentGame === 'tsus') rpcName = 'get_total_tsus_votes';
            const { data: voteData, error: voteError } = await supabaseClient.rpc(rpcName);

            if (voteError) {
                throw voteError;
            }

            const votes = voteData || 0;
            if (voteStat) voteStat.textContent = `Total Votes: ${votes}`;

        } catch (error) {
            console.error("CRITICAL ERROR fetching stats:", error);
            if (voteStat) voteStat.textContent = "";
        }
    }

    let cachedCommunitySongs = [];
    let cachedCommunityGame = null;
    let cachedIsFelfeb = null;

    // load community data offline from hardcoded ratings
    function ensureCommunityData() {
        const isFelfeb = (currentChapterFilter === 'felfeb' || isFelfebRanker());
        if (cachedCommunityGame === state.currentGame && cachedIsFelfeb === isFelfeb && cachedCommunitySongs.length > 0) {
            return Promise.resolve(true);
        }

        try {
            let combinedData = [];
            let sourceList = [];
            if (state.currentGame === 'combined') {
                const drList = (typeof songList !== 'undefined') ? songList : (window.songList || []);
                const utList = (typeof utSongList !== 'undefined') ? utSongList : (window.utSongList || []);
                const utyList = (typeof utySongList !== 'undefined') ? utySongList : (window.utySongList || []);
                const tsusList = (typeof tsusSongList !== 'undefined') ? tsusSongList : (window.tsusSongList || []);
                sourceList = [...drList, ...utList, ...utyList, ...tsusList];
            } else if (state.currentGame === 'deltarune') {
                sourceList = (typeof songList !== 'undefined') ? songList : (window.songList || []);
            } else if (state.currentGame === 'undertale') {
                sourceList = (typeof utSongList !== 'undefined') ? utSongList : (window.utSongList || []);
            } else if (state.currentGame === 'uty') {
                sourceList = (typeof utySongList !== 'undefined') ? utySongList : (window.utySongList || []);
            } else if (state.currentGame === 'tsus') {
                sourceList = (typeof tsusSongList !== 'undefined') ? tsusSongList : (window.tsusSongList || []);
            }

            if (isFelfeb) {
                // only include songs that actually have a felfeb rating. not all of them do.
                sourceList.forEach(localSong => {
                    const rating = window.GLOBAL_FELFEB_RATINGS && window.GLOBAL_FELFEB_RATINGS[localSong.id];
                    if (rating !== undefined) {
                        combinedData.push({
                            id: localSong.id,
                            name: localSong.name,
                            rating: rating,
                            file: localSong.file,
                            hidden: localSong.hidden,
                            duration: localSong.duration || 0,
                            felfebFile: localSong.felfebFile,
                            isBonus: localSong.isBonus || false,
                            region: localSong.region
                        });
                    }
                });
            } else {
                sourceList.forEach(localSong => {
                    const rating = (window.GLOBAL_SONG_RATINGS && window.GLOBAL_SONG_RATINGS[localSong.id] !== undefined)
                        ? window.GLOBAL_SONG_RATINGS[localSong.id]
                        : 1500;
                    combinedData.push({
                        id: localSong.id,
                        name: localSong.name,
                        rating: rating,
                        file: localSong.file,
                        hidden: localSong.hidden,
                        duration: localSong.duration || 0,
                        felfebFile: localSong.felfebFile,
                        isBonus: localSong.isBonus || false,
                        region: localSong.region
                    });
                });
            }

            combinedData.sort((a, b) => b.rating - a.rating);

            cachedCommunitySongs = combinedData;
            cachedCommunityGame = state.currentGame;
            cachedIsFelfeb = isFelfeb;
            return Promise.resolve(true);
        } catch (err) {
            console.error("error processing community data:", err);
            return Promise.resolve(false);
        }
    }

    // displaying community rankings. i'm finally getting around to this.
    async function displayCommunityRankings() {
        rankingList.innerHTML = '<li>Loading community data...</li>';

        const success = await ensureCommunityData();
        if (!success) {
            rankingList.innerHTML = `<li>Error loading rankings</li>`;
            return;
        }

        try {

            const filteredSongs = filterSongsByChapter(cachedCommunitySongs, currentChapterFilter);

            rankingList.innerHTML = '';
            filteredSongs.forEach((song, index) => {
                const li = document.createElement('li');
                li.style.cursor = 'pointer';
                li.addEventListener('click', () => playSongFromCurrentList(index)); // why even use the button at this point

                const nameSpan = document.createElement('span');
                nameSpan.classList.add('song-name');
                nameSpan.textContent = song.name;
                li.appendChild(nameSpan);

                const details = document.createElement('small');
                details.textContent = Math.round(song.rating);
                details.style.display = state.showRatings ? 'inline' : 'none';
                li.appendChild(details);

                const boostBtn = document.createElement('button');
                boostBtn.className = 'boost-rank-btn';
                boostBtn.innerHTML = state.boostedSongId === song.id ? '⚡' : '↑';
                boostBtn.title = "Boost probability in next matches";
                if (state.boostedSongId === song.id) li.classList.add('boosted');

                boostBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    setBoostedSong(song.id);
                });
                li.appendChild(boostBtn);

                const historyBtn = document.createElement('button');
                historyBtn.className = 'history-rank-btn';
                historyBtn.innerHTML = '📜';
                historyBtn.title = "View global match history";
                historyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    showGlobalMatchHistory(song);
                });
                li.appendChild(historyBtn);

                rankingList.appendChild(li);
            });
        } catch (error) {
            rankingList.innerHTML = `<li>Error loading rankings: ${error.message}</li>`;
        }
    }

    async function showGlobalMatchHistory(song) {
        historySongName.textContent = `GLOBAL HISTORY: ${song.name}`;
        historyList.innerHTML = '<p style="color: #666; text-align: center;">Fetching global matchup data...</p>';
        historyModal.style.display = 'flex';

        try {
            const rpcName = isFelfebRanker() ? 'get_felfeb_global_matchups' : 'get_song_agreement_stats';
            const { data, error } = await supabaseClient.rpc(rpcName, { target_song_id: parseInt(song.id) });
            if (error) throw error;

            if (!data || data.length === 0) {
                historyList.innerHTML = '<p style="color: #666; text-align: center;">No global matchups recorded yet.</p>';
                return;
            }

            // sort by total matches
            const sortedData = data.sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses));

            historyList.innerHTML = '';

            // i guess i have to map ids to names manually. wonderful. my life is a cycle of mapping ids.
            // uty ids > 2000, ut > 1000, dr < 1000
            let allSongsMeta = [...state.songs];
            if (state.currentGame === 'combined') {
                // already have all of them if combined, probably, but let's be safe.
                // actually state.songs only has current game.
            }

            sortedData.forEach(match => {
                const total = match.wins + match.losses;
                if (total === 0) return; // shouldn't happen but whatever.
                const winRatio = ((match.wins / total) * 100).toFixed(1);

                let opponentName = "Unknown Song";
                // find the name. brute force it because of course the ids aren't consistent.
                const drMatch = (typeof window.songList !== 'undefined') ? window.songList.find(s => s.id == match.opponent_id) : null;
                const utMatch = (typeof utSongList !== 'undefined') ? utSongList.find(s => s.id == match.opponent_id) : null;
                const utyMatch = (typeof utySongList !== 'undefined') ? utySongList.find(s => s.id == match.opponent_id) : null;
                const tsusMatch = (typeof tsusSongList !== 'undefined') ? tsusSongList.find(s => s.id == match.opponent_id) : null;

                if (drMatch) opponentName = drMatch.name;
                else if (utMatch) opponentName = utMatch.name;
                else if (utyMatch) opponentName = utyMatch.name;
                else if (tsusMatch) opponentName = tsusMatch.name;
                else {
                    // search in the combined list if not found in specific lists
                    const s = state.songs.find(s => s.id == match.opponent_id);
                    if (s) opponentName = s.name;
                }

                const item = document.createElement('div');
                item.className = 'history-item';
                item.style.padding = '10px';
                item.style.borderBottom = '1px solid #222';
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.alignItems = 'center';

                const resultColor = winRatio >= 50 ? '#00ff9d' : '#ff4444';

                item.innerHTML = `
                    <div style="flex: 1;">
                        <span style="color: ${resultColor}; font-weight: bold;">[${winRatio}% WIN]</span>
                        <span> vs ${opponentName}</span>
                    </div>
                    <div style="display: flex; flex-direction: column; align-items: flex-end; font-family: 'Roboto Mono', monospace; font-size: 0.85em;">
                        <span style="color: #00ff9d;">${match.wins} W</span>
                        <span style="color: #ff4444;">${match.losses} L</span>
                    </div>
                `;
                historyList.appendChild(item);
            });

        } catch (error) {
            console.error("Error fetching global matchups:", error);
            historyList.innerHTML = `<p style="color: #ff4444; text-align: center;">Failed to load data: ${error.message}</p>`;
        }
    }

    function displayRankings() {
        rankingList.innerHTML = '';
        const timestamp = new Date().toLocaleTimeString();
        // console.log("Rendering rankings at " + timestamp); 

        const filteredSongs = filterSongsByChapter(state.songs, currentChapterFilter);
        // tiebreak tied songs by community rating. uty/tsus don't have a felfeb global set so they always use the main map.
        const hasFelfebGlobal = state.felfebMode && (state.currentGame === 'deltarune' || state.currentGame === 'undertale');
        const globalRatingsMap = hasFelfebGlobal
            ? (window.GLOBAL_FELFEB_RATINGS || {})
            : (window.GLOBAL_SONG_RATINGS || {});
        const sortedSongs = [...filteredSongs].sort((a, b) => {
            const diff = getRating(b) - getRating(a);
            if (diff !== 0) return diff;
            const ga = globalRatingsMap[a.id] || 1500;
            const gb = globalRatingsMap[b.id] || 1500;
            return gb - ga;
        });

        // build a lookup for global positions. only if they toggled it on
        let globalRanks = null;
        if (state.showGlobalDiff && cachedCommunityGame === state.currentGame && cachedCommunitySongs.length > 0) {
            const filteredGlobal = filterSongsByChapter(cachedCommunitySongs, currentChapterFilter);
            const sortedGlobal = [...filteredGlobal].sort((a, b) => b.rating - a.rating);
            globalRanks = {};
            for (let i = 0; i < sortedGlobal.length; i++) {
                globalRanks[sortedGlobal[i].id] = i;
            }
        }

        sortedSongs.forEach((song, index) => {
            const li = document.createElement('li');
            li.style.cursor = 'pointer'; // i shouldn't have to do this here but whatever
            li.addEventListener('click', () => playSongFromCurrentList(index)); // fine, you can click it now. happy?

            const nameSpan = document.createElement('span');
            nameSpan.classList.add('song-name');
            nameSpan.textContent = song.name;
            li.appendChild(nameSpan);

            // rank diff goes after the name. not inside it or overflow eats it
            if (globalRanks !== null && globalRanks[song.id] !== undefined) {
                let globalPos = globalRanks[song.id];
                let rankDiff = globalPos - index; 
                if (rankDiff !== 0) {
                    const diffSpan = document.createElement('span');
                    diffSpan.classList.add('global-diff');
                    diffSpan.textContent = (rankDiff > 0 ? '+' : '') + rankDiff;
                    diffSpan.title = `global rank: #${globalPos + 1}`;
                    diffSpan.style.color = rankDiff > 0 ? '#00ff9d' : '#ff4444';
                    li.appendChild(diffSpan);
                }
            }

            const details = document.createElement('small');
            details.textContent = Math.round(getRating(song));
            details.style.display = state.showRatings ? 'inline' : 'none';
            li.appendChild(details);

            const boostBtn = document.createElement('button');
            boostBtn.className = 'boost-rank-btn';
            boostBtn.innerHTML = state.boostedSongId === song.id ? '⚡' : '↑';
            boostBtn.title = "Boost probability in next matches";
            if (state.boostedSongId === song.id) li.classList.add('boosted');

            boostBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                setBoostedSong(song.id);
            });
            li.appendChild(boostBtn);

            const historyBtn = document.createElement('button');
            historyBtn.className = 'history-rank-btn';
            historyBtn.innerHTML = '📜';
            historyBtn.title = "View match history";
            historyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showMatchHistory(song);
            });
            li.appendChild(historyBtn);

            rankingList.appendChild(li);
        });

        // lazy fetch. only hits supabase when the toggle is on and cache is stale
        if (state.showGlobalDiff && (cachedCommunityGame !== state.currentGame || cachedCommunitySongs.length === 0)) {
            ensureCommunityData().then(success => {
                if (success && myRankingBtn.classList.contains('active')) {
                    displayRankings();
                }
            });
        }
    }

    function updateProgress() {
        // this used to be hardcoded to 100. ancient relic from when DR was the only ost
        const activeSongs = filterSongsByChapter(state.songs, currentChapterFilter);
        let poolSize = activeSongs.length || 1;
        const accuracy = 100 * (1 - Math.exp(-state.comparisons / poolSize));

        // they wanted to hide this. fine.
        const progressContainer = document.getElementById('progress-container');
        if (state.hideAccuracy) {
            if (progressContainer) progressContainer.style.display = 'none';
        } else {
            if (progressContainer) progressContainer.style.display = '';
            if (progressBar) progressBar.style.width = `${accuracy}%`;
            
            if (progressText) {
                if (state.hideAccuracyPercent) {
                    progressText.style.display = 'none'; // poof. it's gone.
                } else {
                    progressText.style.display = '';
                    progressText.textContent = `Ranking Accuracy: ${accuracy.toFixed(1)}%`;
                }
            }
        }

        // vote hoarding counter. i guess people cheat. whatever.
        if (personalVoteStat) {
            personalVoteStat.textContent = `YOUR VOTES: ${state.comparisons}`;
        }

        // popup for 100% completion so they stop complaining
        if (accuracy.toFixed(1) === "100.0" && !state.hasSeenFinishScreen) {
            state.hasSeenFinishScreen = true;
            saveState();
            if (finishModal) finishModal.style.display = 'flex';
        }
    }


    function filterSongsByActiveList(songs) {
        const activeList = state.activeRankerList;
        if (activeList === 'all') {
            // prevent hidden songs from showing in All
            return songs.filter(s => !s.hidden);
        }

        if (activeList === 'hidden') {
            return songs.filter(s => s.hidden || (state.currentGame === 'deltarune' && s.id > 200) || (state.currentGame === 'undertale_yellow' && s.id > 3000));
        }

        if (activeList === 'custom') {
            const customSelection = JSON.parse(localStorage.getItem('drSongRankerCustomSelection') || '[]');
            return songs.filter(s => customSelection.includes(s.id));
        }

        // chapter grouping. organization is suffering.
        const ch = parseInt(activeList);
        return songs.filter(s => {
            const chapters = getChaptersForSong(s);
            return chapters.includes(ch);
        });
    }

    // sync the filters. automation for the lazy.    // i'm not doing full reactive state, deal with it.
    function filterSongsByChapter(songs, filter) {
        let pool = songs;

        if (filter === 'all' || filter === 'combined_all') {
            return pool.filter(s => !s.hidden);
        }
        if (filter === 'all_plus') {
            return state.secretsUnlocked ? songs : songs.filter(s => !s.hidden);
        }
        if (filter === 'hidden') {
            return state.secretsUnlocked ? songs.filter(s => s.hidden || (state.currentGame === 'deltarune' && s.id > 200) || (state.currentGame === 'undertale_yellow' && s.id > 3000)) : [];
        }

        // chapters
        if (['1', '2', '3', '4', '5'].includes(filter)) {
            const ch = parseInt(filter);
            return songs.filter(s => {
                const visible = !s.hidden || state.secretsUnlocked;
                if (!visible) return false;

                const chapters = getChaptersForSong(s);
                return chapters.includes(ch);
            });
        }

        // locations/regions (UTY and TS!Underswap)
        if (['ruins', 'snowdin', 'dunes', 'wild_east', 'steamworks', 'new_home', 'ruined_home', 'stardust_woods', 'koffin_keep', 'starstruck_village', 'crystal_springs', 'extras'].includes(filter)) {
            return songs.filter(s => {
                const visible = !s.hidden || state.secretsUnlocked;
                if (!visible) return false;
                const chapters = getChaptersForSong(s);
                return chapters.includes(filter);
            });
        }

        if (filter.startsWith('duration_')) {
            const limit = parseInt(filter.split('_')[1]);
            // same logic as getfilteredsongs. why do i have two functions for this.
            return songs.filter(s => (!s.hidden || state.secretsUnlocked) && (s.duration && s.duration >= limit));
        }

        if (filter === 'felfeb') {
            return songs.filter(s => s.felfebFile && (!s.hidden || state.secretsUnlocked));
        }

        if (filter.startsWith('mix_')) {
            const chapters = filter.replace('mix_', '').split('_').map(Number);
            return songs.filter(s => {
                const visible = !s.hidden || state.secretsUnlocked;
                if (!visible) return false;
                const songChapters = getChaptersForSong(s);
                return songChapters.some(ch => chapters.includes(ch));
            });
        }

        // custom lists
        const ids = state.customLists[filter] || [];
        return songs.filter(s => ids.includes(s.id) && (!s.hidden || state.secretsUnlocked));
    }

    function setBoostedSong(id) {
        if (state.boostedSongId === id) {
            state.boostedSongId = null; // toggle off i guess
        } else {
            state.boostedSongId = id;
        }
        saveState();
        if (myRankingBtn.classList.contains('active')) displayRankings();
        else displayCommunityRankings();
    }

    function showMatchHistory(song) {
        historySongName.textContent = `HISTORY: ${song.name}`;
        historyList.innerHTML = '';

        const history = getMatchHistory(song);
        if (history.length === 0) {
            historyList.innerHTML = '<p style="color: #666; text-align: center;">No matches recorded yet.</p>';
        } else {
            history.forEach((match, index) => {
                const item = document.createElement('div');
                item.className = 'history-item';
                item.style.padding = '10px';
                item.style.borderBottom = '1px solid #222';
                item.style.display = 'flex';
                item.style.justifyContent = 'space-between';
                item.style.alignItems = 'center';

                const resultColor = match.result === 'win' ? '#00ff9d' : (match.result === 'loss' ? '#ff4444' : '#888');
                const resultText = match.result.toUpperCase();

                const date = new Date(match.time).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                item.innerHTML = `
                    <div style="flex: 1;">
                        <span style="color: ${resultColor}; font-weight: bold;">[${resultText}]</span>
                        <span> vs ${match.opponent}</span>
                        ${match.opponentId ? `<button class="swap-result-btn" title="Correction: Change this result" style="margin-left: 10px; background: none; border: 1px solid #333; color: #666; cursor: pointer; border-radius: 4px; padding: 2px 4px; font-size: 0.8em;">🔄</button>` : ''}
                    </div>
                    <small style="color: #444; font-size: 0.7em;">${date}</small>
                `;

                const swapBtn = item.querySelector('.swap-result-btn');
                if (swapBtn) {
                    swapBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm(`Swap the result of the match against ${match.opponent}? Ratings will be adjusted.`)) {
                            swapMatchResult(song, index);
                        }
                    });
                }

                historyList.appendChild(item);
            });
        }

        historyModal.style.display = 'flex';
    }

    function swapMatchResult(song, index) {
        const historyList = getMatchHistory(song);
        const match = historyList[index];
        if (!match || !match.opponentId) return;

        const opponent = state.songs.find(s => s.id === match.opponentId);
        const opponentHistoryList = opponent ? getMatchHistory(opponent) : null;
        if (!opponent || !opponentHistoryList) return;

        // find the counterpart. why do they have to click things wrong.
        const opponentMatchIndex = opponentHistoryList.findIndex(m => m.time === match.time && m.opponentId === song.id);
        if (opponentMatchIndex === -1) {
            alert("Record lost in the void. Pruning happened or something.");
            return;
        }

        const opponentMatch = opponentHistoryList[opponentMatchIndex];

        // undo the damage if we have the numbers.
        if (match.ratingChange !== undefined) {
            if (isFelfebRanker()) song.felfebRating -= match.ratingChange;
            else song.rating -= match.ratingChange;
        }
        if (opponentMatch.ratingChange !== undefined) {
            if (isFelfebRanker()) opponent.felfebRating -= opponentMatch.ratingChange;
            else opponent.rating -= opponentMatch.ratingChange;
        }

        // rewrite history. i'm not a time traveler.
        const oldResult = match.result;
        match.result = (oldResult === 'win') ? 'loss' : (oldResult === 'loss' ? 'win' : 'tie');
        opponentMatch.result = (oldResult === 'win') ? 'win' : (oldResult === 'loss' ? 'loss' : 'tie');

        // recalculate ratings because math never ends.
        if (match.result !== 'tie') {
            const winnerSong = (match.result === 'win') ? song : opponent;
            const loserSong = (match.result === 'win') ? opponent : song;

            const { newWinnerRating, newLoserRating } = updateElo(
                getRating(winnerSong),
                getRating(loserSong),
                getComparisons(winnerSong) - 1,
                getComparisons(opponent) - 1
            );

            const winnerChange = newWinnerRating - getRating(winnerSong);
            const loserChange = newLoserRating - getRating(loserSong);

            if (isFelfebRanker()) {
                winnerSong.felfebRating = newWinnerRating;
                loserSong.felfebRating = newLoserRating;
            } else {
                winnerSong.rating = newWinnerRating;
                loserSong.rating = newLoserRating;
            }

            // store the new mistakes.
            if (match.result === 'win') {
                match.ratingChange = winnerChange;
                opponentMatch.ratingChange = loserChange;
            } else {
                match.ratingChange = loserChange;
                opponentMatch.ratingChange = winnerChange;
            }
        }

        // dump everything back to storage.
        if (!isFelfebRanker()) {
            syncCombinedVote(song, opponent);
        }
        saveState();
        showMatchHistory(song);
        if (myRankingBtn.classList.contains('active')) displayRankings();
    }

    if (closeHistoryBtn) {
        closeHistoryBtn.addEventListener('click', () => {
            historyModal.style.display = 'none';
        });
    }

    if (finishShowRankingsBtn) {
        finishShowRankingsBtn.addEventListener('click', () => {
            if (finishModal) finishModal.style.display = 'none';
            communityRankingBtn.classList.remove('active');
            myRankingBtn.classList.add('active');
            displayRankings();
            rankingContainer.scrollIntoView({ behavior: 'smooth' }); // nice touch i guess
        });
    }

    if (closeFinishBtn) {
        closeFinishBtn.addEventListener('click', () => {
            if (finishModal) finishModal.style.display = 'none';
        });
    }

    // close on click outside.
    window.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.style.display = 'none';
        }
        if (finishModal && e.target === finishModal) {
            finishModal.style.display = 'none';
        }
    });


    function initializeNewState() {
        const source = window.songList || songList || [];
        state.songs = JSON.parse(JSON.stringify(source));
        state.comparisons = 0;
        state.hasSeenFinishScreen = false;
    }

    function resetState() {
        if (confirm("THIS WILL ERASE ALL YOUR VOTES AND RANKINGS FOREVER. ARE YOU SURE?")) {
            localStorage.removeItem('drSongRankerState');
            localStorage.removeItem('utSongRankerState');
            localStorage.removeItem('utySongRankerState');
            localStorage.removeItem('tsusSongRankerState');
            localStorage.removeItem('combinedSongRankerState');
            localStorage.removeItem('drSongRankerTheme');
            localStorage.removeItem('drSongRankerBackground');
            location.reload();
        }
    }

    function undoVote() {
        if (!state.history) return;

        // find the victims.
        const songA = state.songs.find(s => s.id === state.history.songA.id);
        const songB = state.songs.find(s => s.id === state.history.songB.id);

        if (songA && songB) {
            if (state.history.wasFelfeb) {
                songA.felfebRating = state.history.songA.rating;
                songA.felfebComparisons = state.history.songA.comparisons;
                songB.felfebRating = state.history.songB.rating;
                songB.felfebComparisons = state.history.songB.comparisons;
            } else {
                songA.rating = state.history.songA.rating;
                songA.comparisons = state.history.songA.comparisons;
                songB.rating = state.history.songB.rating;
                songB.comparisons = state.history.songB.comparisons;
            }
            state.comparisons = state.history.totalComparisons;

            // go back to the scene of the crime.
            currentSongA = songA;
            currentSongB = songB;

            // cleanup history. i'm not leaving tracks.
            const historyListA = state.history.wasFelfeb ? (songA.felfebMatchHistory || []) : (songA.matchHistory || []);
            const historyListB = state.history.wasFelfeb ? (songB.felfebMatchHistory || []) : (songB.matchHistory || []);
            if (historyListA.length > 0) historyListA.shift();
            if (historyListB.length > 0) historyListB.shift();
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

    // listeners. i'm not doing this twice.
    if (drToggle) {
        drToggle.addEventListener('click', () => {
            if (state.currentGame === 'deltarune') return;
            saveState(); // save old game state first
            state.currentGame = 'deltarune';
            loadState();
            saveState(); // save new currentGame to globalState
            updateMainFilterOptions();
            updateProgress();
            presentNewPair();
            fetchAndDisplayAllTimeStats();
            if (myRankingBtn.classList.contains('active')) displayRankings();
            else displayCommunityRankings();
        });
    }

    if (utToggle) {
        utToggle.addEventListener('click', () => {
            if (state.currentGame === 'undertale') return;
            saveState(); // save old game state first
            state.currentGame = 'undertale';
            loadState();
            saveState(); // save new currentGame to globalState
            updateMainFilterOptions();
            updateProgress();
            presentNewPair();
            fetchAndDisplayAllTimeStats();
            if (myRankingBtn.classList.contains('active')) displayRankings();
            else displayCommunityRankings();
        });
    }

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

    if (combinedToggle) {
        combinedToggle.addEventListener('click', () => {
            if (state.currentGame === 'combined') return;
            saveState();
            state.currentGame = 'combined';
            if (mainTitle) mainTitle.textContent = 'DELTARUNE VS UNDERTALE VS UTY: WHICH IS BETTER?';
            currentChapterFilter = 'combined_all';
            state.activeRankerList = 'combined_all';
            if (mainFilterSelect) mainFilterSelect.value = 'combined_all';
            loadState();
            saveState();
            updateMainFilterOptions();
            updateProgress();
            presentNewPair();
            fetchAndDisplayAllTimeStats();
            if (myRankingBtn.classList.contains('active')) displayRankings();
            else displayCommunityRankings();
        });
    }

    if (utyToggle) {
        utyToggle.addEventListener('click', () => {
            if (state.currentGame === 'uty') return;
            saveState();
            state.currentGame = 'uty';
            loadState();
            saveState();
            updateMainFilterOptions();
            updateProgress();
            presentNewPair();
            fetchAndDisplayAllTimeStats();
            if (myRankingBtn.classList.contains('active')) displayRankings();
            else displayCommunityRankings();
        });
    }

    if (tsusToggle) {
        tsusToggle.addEventListener('click', () => {
            if (state.currentGame === 'tsus') return;
            saveState();
            state.currentGame = 'tsus';
            loadState();
            saveState();
            updateMainFilterOptions();
            updateProgress();
            presentNewPair();
            fetchAndDisplayAllTimeStats();
            if (myRankingBtn.classList.contains('active')) displayRankings();
            else displayCommunityRankings();
        });
    }

    function updateMainFilterOptions() {
        if (!mainFilterSelect) return;
        
        let html = '';
        
        if (state.currentGame === 'combined') {
            const franchises = [];
            if (state.selectedFranchises.includes('deltarune')) franchises.push('DR');
            if (state.selectedFranchises.includes('undertale')) franchises.push('UT');
            if (state.selectedFranchises.includes('uty')) franchises.push('UTY');
            if (state.selectedFranchises.includes('tsus')) franchises.push('TS!US');

            const mixLabel = franchises.length > 0 ? franchises.join(' + ') : 'Empty Mix';
            html += `<option value="combined_all">All Games (${mixLabel})</option>`;
            html += `<option value="mix_games" style="color: var(--accent-color); font-weight: bold;">Mix Franchises...</option>`;
        } else {
            html += `<option value="all">All Songs (Original)</option>`;
        }
        
        if (state.currentGame === 'deltarune') {
            html += `
                <option value="1">Chapter 1</option>
                <option value="2">Chapter 2</option>
                <option value="3">Chapter 3</option>
                <option value="4">Chapter 4</option>
                <option value="mix_chapters" style="color: var(--accent-color); font-weight: bold;">Mix Chapters...</option>
            `;
        } else if (state.currentGame === 'undertale') {
            html += `
                <option value="1">Ruins</option>
                <option value="2">Snowdin</option>
                <option value="3">Waterfall</option>
                <option value="4">Hotland/CORE</option>
                <option value="5">New Home</option>
            `;
        } else if (state.currentGame === 'uty') {
            html += `
                <optgroup label="Undertale Yellow">
                    <option value="ruins">Ruins</option>
                    <option value="snowdin">Snowdin</option>
                    <option value="dunes">Dunes</option>
                    <option value="wild_east">Wild East</option>
                    <option value="steamworks">Steamworks</option>
                    <option value="new_home">New Home</option>
                </optgroup>
            `;
        } else if (state.currentGame === 'tsus') {
            html += `
                <optgroup label="TS!Underswap">
                    <option value="ruined_home">Ruined Home</option>
                    <option value="stardust_woods">Stardust Woods</option>
                    <option value="koffin_keep">Koffin Keep</option>
                    <option value="starstruck_village">Starstruck Village</option>
                    <option value="crystal_springs">Crystal Springs</option>
                    <option value="extras">Extras</option>
                </optgroup>
            `;
        }
        
        // hidden filter. only if secrets are unlocked.
        if (state.secretsUnlocked) {
            html += `<option value="all_plus">All + Hidden</option>`;
            html += `<option value="hidden">Hidden Tracks Only</option>`;
        }
        
        // felfeb. if applicable.
        if (state.currentGame === 'deltarune' || state.currentGame === 'undertale' || state.currentGame === 'combined') {
            html += `<option value="felfeb">Felfeb Versions</option>`;
        }
        
        html += `
            <optgroup label="Filter by Length">
                <option value="duration_30">Hide songs < 30s</option>
                <option value="duration_20">Hide songs < 20s</option>
                <option value="duration_10">Hide songs < 10s</option>
            </optgroup>
            <optgroup label="Custom Lists" id="custom-lists-optgroup">
            </optgroup>
        `;
        
        mainFilterSelect.innerHTML = html;
        
        // restore custom lists
        const customOptgroup = document.getElementById('custom-lists-optgroup');
        if (customOptgroup) {
            Object.keys(state.customLists).forEach(listName => {
                const opt = document.createElement('option');
                opt.value = listName;
                opt.textContent = listName;
                customOptgroup.appendChild(opt);
            });
        }
        
        // restore selection or fallback
        const currentFilter = state.activeRankerList;
        const allOptionValues = Array.from(mainFilterSelect.options).map(o => o.value);
        if (allOptionValues.includes(currentFilter)) {
            mainFilterSelect.value = currentFilter;
            currentChapterFilter = currentFilter;
        } else {
            // combined_all doesn't exist outside combined mode, so fall back
            const defaultVal = state.currentGame === 'combined' ? 'combined_all' : 'all';
            mainFilterSelect.value = defaultVal;
            currentChapterFilter = defaultVal;
            state.activeRankerList = defaultVal;
        }
    }



    if (mainFilterSelect) {
        mainFilterSelect.addEventListener('change', (e) => {
            const val = e.target.value;

            if (val === 'mix_games') {
                gameMixModal.style.display = 'flex';
                // sync checkboxes
                gameMixCheckboxes.forEach(cb => {
                    cb.checked = state.selectedFranchises.includes(cb.value);
                });
                // reset select so it doesn't stay on "Mix Franchises..."
                mainFilterSelect.value = state.activeRankerList === 'all' ? 'combined_all' : state.activeRankerList;
                return;
            }

            if (val === 'mix_chapters') {
                chapterMixModal.style.display = 'flex';
                mixCheckboxes.forEach(cb => cb.checked = false);
                return;
            }

            currentChapterFilter = val;
            state.activeRankerList = currentChapterFilter;
            saveState();

            if (editListBtn) {
                editListBtn.style.display = state.customLists[currentChapterFilter] ? 'inline-block' : 'none';
            }

            if (myRankingBtn.classList.contains('active')) {
                displayRankings();
            } else {
                displayCommunityRankings();
            }
            presentNewPair();
        });
    }

    applyGameMixBtn.addEventListener('click', () => {
        const selected = [];
        gameMixCheckboxes.forEach(cb => {
            if (cb.checked) selected.push(cb.value);
        });

        if (selected.length === 0) {
            alert("Select at least one game.");
            return;
        }

        state.selectedFranchises = selected;
        state.activeRankerList = 'combined_all';
        gameMixModal.style.display = 'none';

        saveState();
        loadState();
        updateMainFilterOptions();
        presentNewPair();
        if (myRankingBtn.classList.contains('active')) displayRankings();
        else displayCommunityRankings();
    });

    cancelGameMixBtn.addEventListener('click', () => {
        gameMixModal.style.display = 'none';
    });

    // initial filter setup
    updateMainFilterOptions();

    fetchAndDisplayAllTimeStats();

    chooseABtn.addEventListener('click', () => handleChoice('A'));
    chooseBBtn.addEventListener('click', () => handleChoice('B'));
    skipBtn.addEventListener('click', () => {
        // they chose nothing. fine. next snippet.
        if (state.preventDuplicates && currentSongA && currentSongB) {
            const pairKey = [currentSongA.id, currentSongB.id].sort((a, b) => a - b).join('-');
            state.recentMatches.push(pairKey);
            if (state.recentMatches.length > 20) state.recentMatches.shift();
        }
        presentNewPair();
        saveState();
    });
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


    if (applyMixBtn) {
        applyMixBtn.addEventListener('click', () => {
            const selected = Array.from(mixCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selected.length === 0) {
                alert("Pick at least one chapter. I can't mix nothing.");
                return;
            }

            const mixKey = `mix_${selected.join('_')}`;
            const label = `Mixed: Ch ${selected.join(' + ')}`;

            // hack: create temporary option so it shows up without reloading
            let option = Array.from(mainFilterSelect.options).find(opt => opt.value === mixKey);
            if (!option) {
                option = document.createElement('option');
                option.value = mixKey;
                option.textContent = label;
                // insert it after the standard chapters. finding the right spot is a pain.
                const mixChaptersOpt = mainFilterSelect.querySelector('option[value="mix_chapters"]');
                if (mixChaptersOpt) {
                    mainFilterSelect.insertBefore(option, mixChaptersOpt);
                } else {
                    mainFilterSelect.appendChild(option);
                }
            }

            mainFilterSelect.value = mixKey;
            chapterMixModal.style.display = 'none';

            // trigger the change manually since setting value doesn't fire it
            mainFilterSelect.dispatchEvent(new Event('change'));
        });
    }

    if (cancelMixBtn) {
        cancelMixBtn.addEventListener('click', () => {
            chapterMixModal.style.display = 'none';
            // revert to previous or default
            mainFilterSelect.value = state.activeRankerList;
            if (mainFilterSelect.value === 'mix_chapters') {
                mainFilterSelect.value = 'all'; // fallback
                state.activeRankerList = 'all';
                presentNewPair(); // refresh just in case
            }
        });
    }

    // removed duplicate createListBtn listener

    function populateCustomDropdown() {
        const select = mainFilterSelect;
        if (!select) return;

        // use state as source of truth, fallback to current select value if valid
        const targetVal = state.activeRankerList || select.value || 'all';
        select.innerHTML = '';

        // standard options
        let standardOptions = [
            { val: 'all', text: state.currentGame === 'deltarune' ? 'All Songs (Original)' : (state.currentGame === 'undertale_yellow' ? 'All Songs (UTY)' : 'All Songs') }
        ];

        if (state.currentGame === 'deltarune') {
            standardOptions.push(
                { val: '1', text: 'Chapter 1' },
                { val: '2', text: 'Chapter 2' },
                { val: '3', text: 'Chapter 3' },
                { val: '4', text: 'Chapter 4' },
                { val: 'mix_chapters', text: 'Mix Chapters...' }
            );
        } else if (state.currentGame === 'undertale_yellow' || state.currentGame === 'uty') {
            standardOptions.push(
                { val: 'ruins', text: 'Ruins (UTY)' },
                { val: 'snowdin', text: 'Snowdin (UTY)' },
                { val: 'dunes', text: 'Dunes (UTY)' },
                { val: 'wild_east', text: 'Wild East (UTY)' },
                { val: 'steamworks', text: 'Steamworks (UTY)' },
                { val: 'new_home', text: 'New Home (UTY)' },
                // genocide section removed because the user said it was 'unfair'. fine.
            );
        } else if (state.currentGame === 'combined') {
            // keep it simple. just all songs.
        } else {
            standardOptions.push(
                { val: '1', text: 'Ruins' },
                { val: '2', text: 'Snowdin' },
                { val: '3', text: 'Waterfall' },
                { val: '4', text: 'Hotland / CORE' },
                { val: '5', text: 'New Home / End' }
            );
        }

        // add secret options if unlocked (mostly for DR, but whatever)
        if (state.secretsUnlocked) {
            standardOptions.splice(1, 0, { val: 'all_plus', text: 'All Songs + Hidden' });
            standardOptions.push({ val: 'hidden', text: 'Hidden Tracks' });
        }

        // felfeb filter. uty doesn't have any so skip it.
        if (state.currentGame !== 'undertale_yellow' && state.currentGame !== 'uty') {
            standardOptions.push({ val: 'felfeb', text: 'Felfeb Songs' });
        }

        standardOptions.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.val;
            el.textContent = opt.text;
            if (opt.val === 'mix_chapters') {
                el.style.color = 'var(--accent-color)';
                el.style.fontWeight = 'bold';
            }
            select.appendChild(el);
        });

        // check if we have an active mix that isn't in standard options.
        // this is why we can't have nice things.
        if (targetVal.startsWith('mix_') && targetVal !== 'mix_chapters') {
            const chapters = targetVal.replace('mix_', '').split('_');
            const label = `Mixed: Ch ${chapters.join(' + ')}`;

            const option = document.createElement('option');
            option.value = targetVal;
            option.textContent = label;

            // force insert it
            const mixChaptersOpt = select.querySelector('option[value="mix_chapters"]');
            if (mixChaptersOpt) {
                select.insertBefore(option, mixChaptersOpt);
            } else {
                select.appendChild(option);
            }
        }

        // duration filters
        const durationGroup = document.createElement('optgroup');
        durationGroup.label = "Filter by Length";
        durationGroup.innerHTML = `
            <option value="duration_30">Hide songs < 30s</option>
            <option value="duration_20">Hide songs < 20s</option>
            <option value="duration_10">Hide songs < 10s</option>
        `;
        select.appendChild(durationGroup);

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

        // restore selection
        select.value = targetVal;

        // if the target value is invalid (not in options), fallback to all
        if (select.value !== targetVal) {
            select.value = 'all';
            // optional: update state?
            // state.activeRankerList = 'all';
        }
    }




    // sharing. i'm tired.
    function updateSharePreview() {
        if (!shareBtn) return;
        const isCommunity = communityRankingBtn.classList.contains('active');
        const sourceData = isCommunity ? cachedCommunitySongs : state.songs;

        if (isCommunity && cachedCommunitySongs.length === 0) {
            alert("Community data not loaded yet. Please wait.");
            return;
        }

        const filteredData = filterSongsByChapter(sourceData, currentChapterFilter);
        const sortedData = [...filteredData].sort((a, b) => getRating(b) - getRating(a));

        const songCount = shareCountInput ? parseInt(shareCountInput.value) : 10;
        const topSongs = sortedData.slice(0, songCount);

        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#00ff9d';

        let titleText = isCommunity ? "COMMUNITY" : "MY";
        titleText += songCount >= sortedData.length ? " RANKING" : ` TOP ${songCount}`;

        if (currentChapterFilter !== 'all') {
            titleText += ` (${currentChapterFilter.toUpperCase()})`;
        }

        // i shortened this because the footer kept eating the songs. hope this is enough.
        const targetHeight = 580;

        // scaling logic. i honestly don't know why i'm doing this anymore.
        let cols = 1;
        if (songCount > 120) cols = 4;
        else if (songCount > 60) cols = 3;
        else if (songCount > 25) cols = 2;

        const itemsPerCol = Math.ceil(songCount / cols);
        const itemHeight = targetHeight / itemsPerCol;

        const fontSize = Math.min(Math.max(itemHeight * 0.7, 8), 28);
        const marginBottom = Math.max(itemHeight - (fontSize * 1.2), 0);

        let html = `<h3 style="margin-top:0; margin-bottom: 20px; border-bottom: 2px solid ${accentColor}; padding-bottom: 8px; text-transform: uppercase; color: ${accentColor}; font-size: 30px;">${titleText}</h3>`;

        // less gap, more room for titles. because text needs a home.
        html += `<div style="column-count: ${cols}; column-gap: 15px; height: ${targetHeight}px; font-size: ${fontSize}px; line-height: 1.1;">`;
        // making room for the numbers i just shoved outside the list.
        const listPaddingLeft = fontSize > 20 ? "60px" : "45px";
        html += `<ul style="padding-left: ${listPaddingLeft}; margin: 0; color: #fff; height: 100%; list-style-type: none;">`;
        topSongs.forEach((song, index) => {
            // hanging numbers because apparently decimal alignment is a thing people care about.
            // li no longer has overflow:hidden because i was accidentally hiding my own work. typical.
            html += `<li style="margin-bottom: ${marginBottom}px; position: relative; width: 100%; display: block;">`;
            html += `<span style="color: ${accentColor}; font-weight: bold; position: absolute; right: 100%; margin-right: 12px; text-align: right; pointer-events: none; white-space: nowrap;">${index + 1}.</span>`;
            html += `<span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; width: 100%;">${song.name}</span></li>`;
        });
        html += '</ul></div>';

        // pushing this footer down. go away.
        html += `<p style="position: absolute; bottom: 12px; right: 30px; margin: 0; font-size: 13px; color: #555; font-family: 'Roboto Mono', monospace;">stavros-alt.github.io/drSongRanker</p>`;

        sharePreview.innerHTML = html;
        sharePreview.style.backgroundColor = "#000";
        // shrinking paddings because real estate is expensive.
        sharePreview.style.padding = "45px 25px";
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            updateSharePreview();
            shareModal.style.display = 'flex';
        });
    }

    if (shareCountInput) {
        shareCountInput.addEventListener('input', () => {
            updateSharePreview();
        });
    }

    closeShareBtn.addEventListener('click', () => {
        shareModal.style.display = 'none';
    });

    downloadShareBtn.addEventListener('click', () => {
        // prepare for capture. 
        // html2canvas struggles with transforms. let's temporarily un-transform it.
        const originalStyle = sharePreview.style.cssText;
        sharePreview.style.transform = 'none';
        sharePreview.style.position = 'fixed';
        sharePreview.style.top = '0';
        sharePreview.style.left = '0';
        sharePreview.style.zIndex = '-9999';

        html2canvas(sharePreview, {
            backgroundColor: "#000000",
            width: 600,
            height: 800,
            scale: 2 // high res. i'm a pro.
        }).then(canvas => {
            sharePreview.style.cssText = originalStyle; // restore
            const link = document.createElement('a');
            link.download = 'deltarune-ranking.png';
            link.href = canvas.toDataURL('image/png');
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
            sourceSongs = [...state.songs].sort((a, b) => getRating(b) - getRating(a));
        }

        // apply the filter. why did i even have that conditional check? i'm actually losing it.
        sourceSongs = filterSongsByChapter(sourceSongs, currentChapterFilter);

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

    function playSongFromCurrentList(index) {
        // i am literally copying logic from generateAndStartPlaylist because refactoring is too much work today.
        let sourceSongs = [];
        if (communityRankingBtn.classList.contains('active')) {
            sourceSongs = [...cachedCommunitySongs];
        } else {
            sourceSongs = [...state.songs].sort((a, b) => getRating(b) - getRating(a));
        }

        // filter the songs. i'm not dealing with hidden stuff if the user didn't ask for it.
        sourceSongs = filterSongsByChapter(sourceSongs, currentChapterFilter);

        if (sourceSongs.length === 0 || index < 0 || index >= sourceSongs.length) return; // i hope you didn't click nothing.

        playlist = sourceSongs;
        currentPlaylistIndex = index;

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
        // felfeb jumpscare in the playlist too. nowhere is safe.
        let playFile = song.file;
        if (state.felfebMode && song.felfebFile) {
            if (isFelfebRanker() || Math.random() < 0.1) {
                playFile = song.felfebFile;
            }
        }
        playlistAudio.src = encodeURI(playFile);
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
            return null; // not loaded yet
        }

        // apply chapter/custom filter
        let filtered = filterSongsByChapter(pool, currentChapterFilter);

        // sort by rating (global or personal)
        return [...filtered].sort((a, b) => getRating(b) - getRating(a));
    }

    exportM3UBtn.addEventListener('click', () => {
        const sourceSongs = getExportSourceSongs();
        if (sourceSongs === null) {
            alert("Global data not loaded. Switch to Global tab once first.");
            return;
        }

        const limit = parseInt(exportLimitInput.value) || 10;
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
        const prefix = state.currentGame === 'deltarune' ? 'deltarune' : 'undertale';
        a.download = `${prefix}_playlist_${currentChapterFilter}.m3u`;
        a.click();
        URL.revokeObjectURL(url);
        exportModal.style.display = 'none';
    });


    exportZipBtn.addEventListener('click', async () => {
        const sourceSongs = getExportSourceSongs();
        if (sourceSongs === null) {
            alert("Global data not loaded. Switch to Global tab once first.");
            return;
        }

        const limit = parseInt(exportLimitInput.value) || 10;
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

            let prefix = 'deltarune';
            if (state.currentGame === 'undertale') prefix = 'undertale';
            else if (state.currentGame === 'undertale_yellow') prefix = 'uty';
            const content = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${prefix}_top_${addedCount}_songs.zip`;
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

        const limit = parseInt(exportLimitInput.value) || 10;
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
            if (state.currentGame === 'deltarune') {
                if (s.id <= 40) chapterSuffix = " (Chapter 1)";
                else if (s.id <= 87 || s.id === 38 || s.id === 40) chapterSuffix = " (Chapter 2)";
                else if (s.id <= 125) chapterSuffix = " (Chapter 3)";
                else if (s.id <= 165) chapterSuffix = " (Chapter 4)";
            } else {
                const track = s.id - 1000;
                if (track <= 14) chapterSuffix = " (Ruins)";
                else if (track <= 24) chapterSuffix = " (Snowdin)";
                else if (track <= 46) chapterSuffix = " (Waterfall)";
                else if (track <= 70) chapterSuffix = " (Hotland/CORE)";
                else chapterSuffix = " (New Home/End)";
            }

            let ostName = 'Deltarune OST';
            if (state.currentGame === 'undertale') ostName = 'Undertale OST';
            else if (state.currentGame === 'undertale_yellow') ostName = 'Undertale Yellow OST';
            return `${songName} - Toby Fox ${ostName}${chapterSuffix}`;
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
    if (showRatingsToggle) showRatingsToggle.checked = state.showRatings;
    if (preventDuplicatesToggle) preventDuplicatesToggle.checked = state.preventDuplicates;
    if (showGlobalDiffToggle) showGlobalDiffToggle.checked = state.showGlobalDiff;
    checkSecretsGlobal();
    // populateCustomDropdown is already called inside loadState.
    // just make sure the select value is synced one last time.
    updateMainFilterOptions();
    if (mainFilterSelect) mainFilterSelect.value = state.activeRankerList;
    updateApp();

    // one-time donation popup. dismiss writes a key so it never comes back.
    const DONATION_KEY = 'drSongRankerDonationPopupDismissed';
    const donationPopup = document.getElementById('donation-popup');
    const donationCloseBtn = document.getElementById('donation-close-btn');
    const donationKofiLink = document.getElementById('donation-kofi-link');

    function dismissDonationPopup() {
        try {
            localStorage.setItem(DONATION_KEY, 'true');
        } catch (e) {
            // private mode or storage full. nothing to do, popup just won't persist.
        }
        if (donationPopup) donationPopup.style.display = 'none';
    }

    if (donationPopup && !localStorage.getItem(DONATION_KEY)) {
        donationPopup.style.display = 'flex';
    }

    if (donationCloseBtn) {
        donationCloseBtn.addEventListener('click', dismissDonationPopup);
    }

    // kofi link opens in new tab AND dismisses the popup so it's gone for good.
    if (donationKofiLink) {
        donationKofiLink.addEventListener('click', dismissDonationPopup);
    }

    // refresh on back button because browsers are annoying.
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            checkSecretsGlobal();
            populateCustomDropdown();
            updateApp();
        }
    });

    // debug function for testing the finish screen.
    window.debugTriggerFinish = () => {
        let activeSongs = filterSongsByChapter(state.songs, currentChapterFilter);
        let poolSize = activeSongs.length || 1;
        state.comparisons = Math.ceil(poolSize * 7);
        state.hasSeenFinishScreen = false;
        updateProgress();
    };

});
