document.addEventListener('DOMContentLoaded', () => {
    // some people just want to use their regular cursor. fine.
    try {
        const globalState = JSON.parse(localStorage.getItem('drSongRankerGlobalState') || '{}');
        if (globalState.useSystemCursor) {
            document.body.classList.add('system-cursor');
        }
    } catch (e) {
        // storage is hard apparently
    }

    // vanity heart. because why not.
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
    });

    // mouse privilege.
    document.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        }
    });

    // glowy bits.
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
