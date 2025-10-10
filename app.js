document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://tsqubxgafnzmxejwknbm.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXVieGdhZm56bXhlandrbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzA2ODcsImV4cCI6MjA2ODY0NjY4N30.YY78tWRNQsK6OZREh-8w2fAxiLBbBaG4kZfVYROkirY';
    
    if (!window.supabase) {
        console.error("Supabase client not loaded. Make sure the script tag is in your HTML.");
        alert("Error: Could not connect to the ranking service. Please refresh.");
        return;
    }
    
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
const songToImageMap = {
  'funGang.jpeg': ["Don't Forget", "Faint Courage", "THE LEGEND", "Empty Town", "My Castle Town", "Field of Hopes and Dreams", "Susie", "Vs. Susie", "Imminent Death"],
  'spamtenna.jpeg': ["Spamton", "NOW'S YOUR CHANCE TO BE A", "BIG SHOT", "Dialtone", "HEY EVERY !", "Keygen", "Deal Gone Wrong", "A Real Boy!", "It's TV Time!"],
  'bergentruck.jpeg': ["Lost Girl", "Girl Next Door", "Ferris Wheel"],
  'rouxlsTwerk.jpeg': ["Rouxls Kaard", "It's Pronounced -Rules-", "Ruder Buster"],
};

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
    const easterEggContainer = document.getElementById('easter-egg-container');

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
        
        checkAndTriggerEasterEgg(currentSongA, currentSongB);
        
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
        }, 0);
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
    
function checkAndTriggerEasterEgg(songA, songB) {
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
    
    async function displayCommunityRankings() {
        rankingList.innerHTML = '<li>Loading community data...</li>';
        try {
            const { data, error } = await supabaseClient
                .from('songs')
                .select('name, id, rating')
                .order('rating', { ascending: false });
            
            if (error) throw error;
            
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
        const totalSongs = state.songs.length;
        const comparisonsNeeded = totalSongs * 2;
        const progressPercentage = Math.min((state.comparisons / comparisonsNeeded) * 100, 100);
        
        progressBar.style.width = `${progressPercentage}%`;
        progressText.textContent = `${state.comparisons} Comparisons Made`;
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
    
    updateApp();
});