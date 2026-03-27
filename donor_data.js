// donor data config. i hate manual updates.
// edit this when someone actually pays up on discord. 
// i spend more time editing this file than actually listening to the music.

// fields:
// - name: who did it
// - pfp: path to their soul (or a placeholder)
// - quote: what they want me to say
// - styling: colors and glows because plain text isn't enough apparently

var DONOR_DATA = {
    // This is the person who gets the big slot above the leaderboard.
    currentTopDonor: {
        name: "STAVROS",
        month: "MARCH 2026",
        pfp: "Art/peeringSoul.png", // make sure to add the actual file later
        quote: "I made this site and all I got was this lousy donor slot.",
        styling: {
            borderColor: "var(--accent-color)",
            glowColor: "var(--accent-color)",
            textColor: "var(--accent-color)"
        }
    },

    // Historical donors for the Yearbook page, grouped by month.
    history: [
        {
            month: "MARCH 2026",
            donors: [
                {
                    name: "STAVROS",
                    pfp: "Art/peeringSoul.png",
                    quote: "I made this site and all I got was this lousy donor slot.",
                    styling: {
                        borderColor: "var(--accent-color)",
                        glowColor: "var(--accent-color)"
                    }
                }
            ]
        }
        // Add more months here as they come. Or don't. I'm just the messenger.
    ]
};

// if this is used in the browser, it needs to be accessible.
if (typeof window !== 'undefined') {
    window.DONOR_DATA = DONOR_DATA;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DONOR_DATA;
}

