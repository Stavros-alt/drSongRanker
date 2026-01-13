console.log("SCRIPT STARTING");
const https = require('https');
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, 'DELTARUNESoundtrack');

if (!fs.existsSync(TARGET_DIR)) {
    console.log(`CREATING DIR: ${TARGET_DIR}`);
    fs.mkdirSync(TARGET_DIR);
}

const tracks = [
    { name: 'man.ogg', url: 'https://deltarune.wiki/images/Man_music.ogg' },
    { name: 'man_nes.ogg', url: 'https://deltarune.wiki/images/Man_nes_music.ogg' },
    { name: 'man_2.ogg', url: 'https://deltarune.wiki/images/Man_2_music.ogg' },
    { name: 'find_her.ogg', url: 'https://deltarune.wiki/images/Find_Her_music.ogg' },
    { name: 'alley_ambience.ogg', url: 'https://deltarune.wiki/images/Alley_ambience_music.ogg' },
    { name: 'alt_church_lobby.ogg', url: 'https://deltarune.wiki/images/Alt_church_lobby_music.ogg' },
    { name: 'ambientwater_weird.ogg', url: 'https://deltarune.wiki/images/Ambientwater_weird_music.ogg' },
    { name: 'audio_drone.ogg', url: 'https://deltarune.wiki/images/AUDIO_DRONE_music.ogg' },
    { name: 'baci_distort.ogg', url: 'https://deltarune.wiki/images/Baci_distort_music.ogg' },
    { name: 'board_ocean.ogg', url: 'https://deltarune.wiki/images/Board_ocean_music.ogg' },
    { name: 'ch4_first_intro.ogg', url: 'https://deltarune.wiki/images/Ch4_first_intro_music.ogg' },
    { name: 'cool_beat.ogg', url: 'https://deltarune.wiki/images/Cool_Beat_music.ogg' },
    { name: 'honksong.ogg', url: 'https://deltarune.wiki/images/Honksong.ogg' },
    { name: 'jitterbug_muffled.ogg', url: 'https://deltarune.wiki/images/Jitterbug_muffled.ogg' },
    { name: 'lancer_annoying.ogg', url: 'https://deltarune.wiki/images/Lancer_Annoying_music.ogg' },
    { name: 'pianpian.ogg', url: 'https://deltarune.wiki/images/Pianpian_music_Chapter_4.ogg' },
    { name: 'smallpiano_room.ogg', url: 'https://deltarune.wiki/images/Smallpiano_room_music.ogg' },
    { name: 'strongwind_loop.ogg', url: 'https://deltarune.wiki/images/Strongwind_loop_music.ogg' },
    { name: 'mike_music_reset.ogg', url: 'https://deltarune.wiki/images/Mike_music_resetting_score.ogg' },
    { name: 'w.ogg', url: 'https://deltarune.wiki/images/W_music.ogg' },
    { name: 'kris_piano_sevenfour.ogg', url: 'https://deltarune.wiki/images/Kris_piano_sevenfour_music.ogg' },
    { name: 'kris_piano_quiz.ogg', url: 'https://deltarune.wiki/images/Kris_piano_quiz_music.ogg' },
    { name: 'kris_piano_lancer_waltz.ogg', url: 'https://deltarune.wiki/images/Kris_piano_lancer_waltz_music.ogg' },
    { name: 'kris_piano_rouxls.ogg', url: 'https://deltarune.wiki/images/Kris_piano_rouxls_music.ogg' },
    { name: 'kris_piano_waitingroom.ogg', url: 'https://deltarune.wiki/images/Kris_piano_waitingroom_music.ogg' },
    { name: 'kris_piano_shop.ogg', url: 'https://deltarune.wiki/images/Kris_piano_shop_music.ogg' },
    { name: 'kris_piano_last_prophecy.ogg', url: 'https://deltarune.wiki/images/Kris_piano_last_prophecy_music.ogg' },
    { name: 'kris_piano_prophecy.ogg', url: 'https://deltarune.wiki/images/Kris_piano_prophecy_music.ogg' },
    { name: 'cybercity_alt.ogg', url: 'https://deltarune.wiki/images/WELCOME_TO_THE_CITY_music_alternate.ogg' },
    { name: 'berdly_battle.ogg', url: 'https://deltarune.wiki/images/Berdly_battle_heartbeat_true_music.ogg' },
    { name: 'me.ogg', url: 'https://deltarune.wiki/images/Me_music.ogg' },
    { name: 'sinedrone_high.ogg', url: 'https://deltarune.wiki/images/Weird_Route_music_sinedrone.ogg' },
    { name: 'ominous_worse.ogg', url: 'https://deltarune.wiki/images/Ominous_worse_music.ogg' },
    { name: 'tinnitus.ogg', url: 'https://deltarune.wiki/images/Tinnitus_music.ogg' },
    { name: 'annoying_prophecy.ogg', url: 'https://deltarune.wiki/images/Annoying_prophecy_music.ogg' },
    { name: 'audio_menu.ogg', url: 'https://deltarune.wiki/images/Audio_menu_music.ogg' },
    { name: 'cyber_battle.ogg', url: 'https://deltarune.wiki/images/Cyber_battle_music.ogg' },
    { name: 'cybercity_old.ogg', url: 'https://deltarune.wiki/images/Cybercity_old_music.ogg' },
    { name: 'noelle.ogg', url: 'https://deltarune.wiki/images/Noelle_music.ogg' },
    { name: 'spamton_house.ogg', url: 'https://deltarune.wiki/images/Spamton_house_music.ogg' },
    { name: 'static_placeholder.ogg', url: 'https://deltarune.wiki/images/Static_placeholder_music.ogg' },
    { name: 'thrash_rating.ogg', url: 'https://deltarune.wiki/images/Thrash_rating_music.ogg' },
    { name: 'field_of_hopes_crisp.ogg', url: 'https://deltarune.wiki/images/Field_of_hopes_preview_crisp_music.ogg' },
    { name: 'battle_preview_crisp.ogg', url: 'https://deltarune.wiki/images/Battle_preview_crisp_music.ogg' },
    { name: 'nightmare_boss_links.ogg', url: 'https://deltarune.wiki/images/Nightmare_boss_links_music.ogg' },
    { name: 'church_test.ogg', url: 'https://deltarune.wiki/images/Church_zone2_alt_longer_test_music.ogg' },
    { name: 'sinedrone_danger.ogg', url: 'https://deltarune.wiki/images/Sinedrone_danger_music.ogg' },
    { name: 'wet_tapdancing.ogg', url: 'https://deltarune.wiki/images/Wet_tapdancing_music.ogg' },
    { name: 'wet_tapdancing2.ogg', url: 'https://deltarune.wiki/images/Wet_tapdancing2_music.ogg' },
    { name: 'wet_tapdancing_failed.ogg', url: 'https://deltarune.wiki/images/Wet_tapdancing_failed_music.ogg' },
    { name: 'dogcheck.ogg', url: 'https://deltarune.wiki/images/Annoying_prophecy_music.ogg' }
];

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        const options = { headers: { 'User-Agent': 'Mozilla/5.0' } };
        const request = https.get(url, options, (res) => {
            console.log(`STATUS FOR ${url}: ${res.statusCode}`);
            if (res.statusCode === 301 || res.statusCode === 302) {
                console.log(`REDIRECTING TO: ${res.headers.location}`);
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Status: ${res.statusCode}`));
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`FINISHED: ${dest}`);
                resolve();
            });
        });
        request.on('error', (err) => {
            console.error(`ERROR REQUESTING ${url}: ${err.message}`);
            reject(err);
        });
    });
}

(async function () {
    console.log(`RUNNING SCRAPER. TOTAL: ${tracks.length}`);
    for (const track of tracks) {
        const dest = path.join(TARGET_DIR, track.name);
        try {
            console.log(`DOWNLOADING: ${track.name} FROM ${track.url}`);
            await download(track.url, dest);
        } catch (e) {
            console.error(`FAILED: ${track.name} - ${e.message}`);
        }
    }
    console.log("ALL DONE.");
})();
