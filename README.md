# drSongRanker
Elo-based song ranker for Deltarune, Undertale, and various mods. It works. Don't touch the code unless you want to spend three hours debugging my variable naming choices.

## Setup
It's just static HTML. Run a local server if you want to avoid CORS issues with the soundtrack files.
`python3 -m http.server`
Windows users? Good luck. Maybe use WSL or something.

## Usage
1. Pick a game (Deltarune, Undertale, UTY, TS!Underswap, or Combined).
2. Click the song you like better.
3. Your ranking updates in real-time.
4. Export as MP3s, M3U, or text if you actually have friends to share it with.

## Configuration
Everything is in local storage. `drSongRankerGlobalState` handles your UI preferences. `drSongRankerState` and friends handle the actual Elo math.

## Known Issues
- Mobile layout is... a choice. Use a real computer.
- Previews might hang if your internet is garbage.
- Supabase sync is mostly for global stats. Personal ranks are local. Don't clear your cache if you care about your list.
- Custom soul cursors use `mask-image`. If your browser is from 2012, it'll probably look like garbage.

## Features I Added Because People Kept Asking
- **Custom Soul Cursor:** Change your cursor color. Includes a Monster Soul mode (upside down) and an invert toggle for custom colors.
- **Theme Overlays:** Red/Green/Blue site-wide overlays.
- **Combined Mode:** Rank everything at once. Good luck.

## Credits
- Toby Fox (Audio/IP)
- Team Switched (TS!Underswap)
- Master Sword (UTY)
- Me (Still suffering)
