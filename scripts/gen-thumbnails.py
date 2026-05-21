#!/usr/bin/env python3
import json, os, sys

GAMES_DIR = "/var/www/games"

for game_id in os.listdir(GAMES_DIR):
    game_dir = os.path.join(GAMES_DIR, game_id)
    if not os.path.isdir(game_dir):
        continue
    thumb_path = os.path.join(game_dir, "thumbnail.svg")
    info_path = os.path.join(game_dir, "info.json")
    if os.path.exists(thumb_path):
        continue
    if not os.path.exists(info_path):
        continue
    try:
        info = json.load(open(info_path))
        name = info.get("name", game_id)
        emoji = info.get("emoji", "🎮")
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)" rx="16"/>
  <text x="200" y="140" font-size="80" text-anchor="middle" dominant-baseline="middle">{emoji}</text>
  <text x="200" y="210" font-family="Arial,sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">{name}</text>
</svg>'''
        with open(thumb_path, "w") as f:
            f.write(svg)
        print(f"Created thumbnail for: {game_id}")
    except Exception as e:
        print(f"Error for {game_id}: {e}")
