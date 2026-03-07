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

directory = "/home/stavros_final/projects/drSongRanker/TS-UNDERSWAPsoundtrack"
songs = []

# Patterns to try
patterns = [
    re.compile(r"TS!UNDERSWAP Soundtrack - (\d+) - (.*) \[.*\]\.mp3"),
    re.compile(r"TS!Underswap OST (\d+) - (.*) \[.*\]\.mp3"),
    re.compile(r"(.*) - TS!Underswap OST \[.*\]\.mp3"),
    re.compile(r"(.*) - TS!Underswap Soundtrack \[.*\]\.mp3"),
    re.compile(r"TS!Underswap OST - (.*) \[.*\]\.mp3"),
    re.compile(r"(.*) \[.*\]\.mp3") # Fallback for everything else
]

if not os.path.exists(directory):
    print(f"Directory {directory} does not exist.")
    exit(1)

files = sorted(os.listdir(directory))
for i, filename in enumerate(files):
    if filename.endswith(".mp3"):
        name = filename
        
        for p in patterns:
            match = p.match(filename)
            if match:
                if len(match.groups()) == 2:
                    name = match.group(2)
                else:
                    name = match.group(1)
                break
        
        filepath = f"TS-UNDERSWAPsoundtrack/{filename}"
        duration = get_duration(os.path.join(directory, filename))
        
        songs.append({
            "id": 4000 + i + 1,
            "name": name.strip(),
            "file": filepath,
            "rating": 1500,
            "comparisons": 0,
            "duration": round(duration, 2)
        })

# Sort by id
songs.sort(key=lambda x: x["id"])

output = "const tsusSongList = " + json.dumps(songs, indent=4) + ";\n\nwindow.tsusSongList = tsusSongList;"
with open("tsus_song_data.js", "w") as f:
    f.write(output)

print(f"Generated tsus_song_data.js with {len(songs)} songs.")
