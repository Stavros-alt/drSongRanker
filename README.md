# drSongRanker

Elo-based ranking for Deltarune music. It works, so don't touch the code. I'm already handling enough egress issues as it is.

## Features

- Ranks songs using Elo.
- Stats dashboard (uses Chart.js, which was a nightmare to configure).
- Global database sync via Supabase.
- MP3 export as ZIP (for when you can't be bothered with Spotify).

## Setup

Don't overcomplicate it. Use a local server.
`python3 -m http.server`

## Note

I don't have time for feature requests. If it's broken, it's probably Supabase's fault.

## Exporting Playlists

You can export your rankings to Spotify, YouTube, or Apple Music.

1.  Click **Export Playlist** -> **Copy Text**.
2.  Go to [TuneMyMusic](https://www.tunemymusic.com/transfer).
3.  Select **"From Text"** (or "Free Text").
4.  Paste the list.
5.  Select your destination (Spotify/YouTube/etc).
6.  Done.

*Note: I use specific search strings (e.g., forcing the "Chapter 1" album for "Rude Buster") to avoid remixes. It works 100% of the time on Spotify. If it breaks on Apple Music or YouTube, that's not my problem.*

## Credits

- Toby Fox (Audio/IP)
- Me (Everything else)
