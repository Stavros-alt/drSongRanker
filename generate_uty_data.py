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

def clean_name(name):
    # remove trailing hashes/IDs (e.g. 657460584bb84)
    name = re.sub(r'[a-f0-9]{10,}', '', name)
    # replace multiple hyphens with a single space
    name = re.sub(r'-+', ' ', name)
    # common soundtrack naming fixes: "s " becomes "'s "
    name = re.sub(r'(\w) s ', r"\1's ", name)
    # trim spaces
    name = name.strip()
    
    if not name:
        return "..."
        
    # capitalize words
    words = name.split()
    capitalized_words = []
    for i, word in enumerate(words):
        # capitalize first word, and any word that isn't a small common word
        if i == 0 or word.lower() not in ["a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "of", "in", "with"]:
            capitalized_words.append(word.capitalize())
        else:
            capitalized_words.append(word.lower())
    
    # manual fixes for specific tracks if needed
    result = " ".join(capitalized_words)
    if "Qu Pasi N" in result: result = "Qué Pasión"
    if "Caf Dune" in result: result = "Café Dune"
    
    return result

directory = "/home/stavros_final/projects/drSongRanker/UNDERTALEYELLOWsoundtrack"
songs = []

# pattern: 001---once-upon-a-truthful-time.mp3
pattern = re.compile(r"(\d+)---(.*)\.mp3")

files = sorted(os.listdir(directory))
for filename in files:
    if filename.endswith(".mp3"):
        match = pattern.match(filename)
        if match:
            track_num = int(match.group(1))
            raw_name = match.group(2)
            name = clean_name(raw_name)
            filepath = f"UNDERTALEYELLOWsoundtrack/{filename}"
            duration = get_duration(os.path.join(directory, filename))
            
            songs.append({
                "id": 2000 + track_num,
                "name": name,
                "file": filepath,
                "rating": 1500,
                "comparisons": 0,
                "duration": round(duration, 2)
            })
        else:
            # handle if track has way too many hyphens. why.
            match = re.match(r"(\d+)-+(.*)\.mp3", filename)
            if match:
                track_num = int(match.group(1))
                raw_name = match.group(2)
                name = clean_name(raw_name)
                filepath = f"UNDERTALEYELLOWsoundtrack/{filename}"
                duration = get_duration(os.path.join(directory, filename))
                songs.append({
                    "id": 2000 + track_num,
                    "name": name,
                    "file": filepath,
                    "rating": 1500,
                    "comparisons": 0,
                    "duration": round(duration, 2)
                })
            else:
                print(f"Skipping {filename} (no match)")

# sort by id. obviously.
songs.sort(key=lambda x: x["id"])

output = "const utySongList = " + json.dumps(songs, indent=3) + ";\n\nwindow.utySongList = utySongList;"
with open("uty_song_data.js", "w") as f:
    f.write(output)

print(f"Generated uty_song_data.js with {len(songs)} songs.")
