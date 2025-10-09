# Deltarune Song Ranker

A simple web tool for ranking every song in the Deltarune soundtrack without the hassle of a manual tier list.

This app uses a pairwise comparison method powered by an Elo rating system. You are presented with two songs at a time and simply choose which one you prefer. Each choice refines the master ranking, allowing you to quickly and easily discover your definitive favorite tracks.

## Features

-   **Full Soundtrack:** Includes all 165 songs from Deltarune.
-   **Elo-Based Ranking:** No tedious drag-and-drop. Just simple "this or that" choices.
-   **Song Previews:** Not sure which song is which? Each choice includes a "Play Preview" button to jog your memory.
-   **Saves Your Progress:** All your rankings are saved automatically in your browser. You can close the tab and continue right where you left off at any time.
-   **Live-Updating List:** Your full ranked list is visible and updates in real-time with every comparison you make.

## How to Use

1.  **Open the Tool:** [Click here to access the Deltarune Song Ranker](https://Stavros-alt.github.io/drSongRanker/)
2.  **Start Comparing:** The app will present you with two random songs.
3.  **Listen and Choose:** Use the "Play Preview" buttons if needed, then click the button for the song you prefer. If you can't decide or don't know the songs, you can select "It's a Tie / Skip".
4.  **Check Your Ranking:** Watch your personalized ranking take shape on the right-hand side of the screen.
5.  **Repeat!** The more you vote, the more accurate your final list will become. Aim for at least 150-200 comparisons for a solid list.

## Support the Project

This is a free fan-project created for the community. If you enjoy using this tool and want to show your appreciation, you can support its development and help cover potential future costs (like a custom domain).

[![Ko-fi Badge](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/stavros916)

## For Developers (Running Locally)

If you want to run this project on your own machine:

1.  Clone this repository or download the files.
2.  Ensure you have all the MP3 files in the `DELTARUNESoundtrack` directory.
3.  From the project's root directory, run a simple local web server. If you have Python 3, you can use:
    ```bash
    python3 -m http.server
    ```
4.  Open your browser and navigate to `http://localhost:8000`.

## Credit

This is a non-profit, fan-made project. All music and the Deltarune IP are the property of Toby Fox. Please support the official creators by purchasing the games and official merchandise.

-   [Deltarune on Steam](https://store.steampowered.com/app/1671210/DELTARUNE/)
-   [Official Undertale/Deltarune Merchandise on Fangamer](https://www.fangamer.com/collections/deltarune)
