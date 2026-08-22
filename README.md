# drSongRanker

Elo based ranker for Deltarune, Undertale, Undertale Yellow, and TS Underswap. Pick between two songs at a time and it builds a personal ranking. Global vote counts sync to Supabase. Everything else stays in localStorage.

This exists because sorting hundreds of tracks by hand is tedious. Elo gets a usable top 10 in a couple hundred comparisons. You do not need to reach 100 percent.

## Setup

No build step. Static HTML, CSS, and vanilla JS.

```bash
# from the project root
python3 -m http.server 8000
# open http://localhost:8000
```

Any static server works. A server is needed to avoid CORS issues when loading soundtrack files. On Linux or macOS the command above is enough. Windows users can use WSL or any simple http server.

Supabase is only needed for global stats. Without keys the ranker still works locally but community rankings will not load.

## Configuration

All state is in localStorage.

* `drSongRankerGlobalState` global UI prefs, current game, theme, which franchises and DR chapters are enabled for Combined, leaderboard visibility, cursor settings
* `drSongRankerState` Deltarune ratings
* `utSongRankerState` Undertale ratings
* `utySongRankerState` Undertale Yellow ratings
* `tsusSongRankerState` TS Underswap ratings
* `combinedSongRankerState` Combined mode ratings
* `drSongRankerCustomLists` custom playlists created with + Custom List
* `drSongRankerSecretsUnlocked` hidden tracks toggle
* `drSongRankerVolume` player volume

No environment variables. To reset, clear these keys or use Settings then Save Data then Reset.

## Usage

1. Pick a game at the top. Deltarune is default. Combined is hidden, click VS three times quickly to unlock it.
2. Choose a song. Use Preview and Play Full to listen, Skip to pass, Undo to revert the last vote.
3. Filter the pool with the dropdown. Use Mix Chapters to combine chapters, Mix Franchises and Mix DR Chapters in Combined mode to mix games, or + Custom List to pick exact songs.
4. Toggle My Rank and Global to switch between personal and community ordering. Global can be Elo or Centrality.
5. Search, play, or export the list as text, M3U, or MP3 zip.

## Notes and Known Issues

* Combined mode is very buggy and very unfinished, use it at your own risk. Ratings there are separate from per game ratings.
* Felfeb lyrical versions have about a 10 percent chance to play in Deltarune, Undertale, and Combined. Disable in Settings.
* Mobile layout works but the two column view is cramped. Desktop is better.
* Previews stream files from the soundtrack folders. Slow connections can hang.
* Supabase handles only global comparisons and community rankings. Personal data never leaves the browser.
* Soul cursor uses mask image. Old browsers fall back to the system cursor.
* Cache bust query strings like `?v=blockmixed` are used on JS and CSS includes.

## Features

* Custom soul cursor color and Monster Soul invert
* Red, green, blue overlay themes and dark background toggle
* Chapter and franchise filtering, custom playlists
* Group Merge in Settings then Save Data then Group Merge. Load multiple exported JSON files and it averages ratings per song.
* Share card generation and playlist export

## Credits

* Music and IP by Toby Fox
* TS Underswap by Team Switched
* Undertale Yellow by Master Sword
