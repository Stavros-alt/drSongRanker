import os
import json
import subprocess
import re

def get_duration(file_path):
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", file_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT
        )
        return float(result.stdout)
    except Exception as e:
        print(f"Error getting duration for {file_path}: {e}")
        return 0

directory = "/home/stavros_final/Documents/drSongRanker/UNDERTALEsoundtrack"
songs = []

# Pattern: toby fox - UNDERTALE Soundtrack - 01 Once Upon a Time.mp3
pattern = re.compile(r"toby fox - UNDERTALE Soundtrack - (\d+) (.*)\.mp3")

files = sorted(os.listdir(directory))
for filename in files:
    if filename.endswith(".mp3"):
        match = pattern.match(filename)
        if match:
            track_num = int(match.group(1))
            name = match.group(2)
            filepath = f"UNDERTALEsoundtrack/{filename}"
            duration = get_duration(os.path.join(directory, filename))
            
            songs.append({
                "id": 1000 + track_num,
                "name": name,
                "file": filepath,
                "rating": 1500,
                "comparisons": 0,
                "duration": round(duration, 2)
            })
        else:
            print(f"Skipping {filename} (no match)")

# Sort by id
songs.sort(key=lambda x: x["id"])

output = "const utSongList = " + json.dumps(songs, indent=4) + ";\n\nwindow.utSongList = utSongList;"
with open("ut_song_data.js", "w") as f:
    f.write(output)

print(f"Generated ut_song_data.js with {len(songs)} songs.")
