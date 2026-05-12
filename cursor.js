document.addEventListener('DOMContentLoaded', () => {
    // some people hate fun and want a regular cursor. whatever.
    try {
        const globalState = JSON.parse(localStorage.getItem('drSongRankerGlobalState') || '{}');
        if (globalState.useSystemCursor) {
            document.body.classList.add('system-cursor');
        }
    } catch (e) {
        // storage is broken. again.
    }

    // the heart. because i had nothing better to do.
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        updateCursorPosition(e.clientX, e.clientY);
    });

    // pointers. why are there so many ways to move a mouse.
    document.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
            updateCursorPosition(e.clientX, e.clientY);
        }
    });

    function updateCursorPosition(x, y) {
        cursor.style.left = `${x}px`;
        cursor.style.top = `${y}px`;
    }

    // persistence is suffering.
    try {
        const globalState = JSON.parse(localStorage.getItem('drSongRankerGlobalState') || '{}');
        if (globalState.soulColor) {
            cursor.setAttribute('data-soul-mode', globalState.soulColor);
            if (globalState.soulColor !== 'red') {
                cursor.classList.add(`soul-${globalState.soulColor}`);
            }
        }
    } catch (e) {
        // i give up on localstorage.
    }

    // glowy bits for buttons. i'm done with this.
    const interactiveSelectors = 'button, .song-card, .ranking-toggle-btn, .filter-btn, a, input, .chart-card';

    document.body.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.add('active');
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.remove('active');
        }
    });
});
