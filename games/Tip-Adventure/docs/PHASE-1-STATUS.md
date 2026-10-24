# Tip's Jungle Run: Phase 1 status (handoff notes)

Attach this file together with `PHASE-2-PLAN.md` when continuing in a new session.

## What exists

- Game file: `games/Tip-Adventure/jungle-run.html`. One self-contained file (HTML, CSS and JS, about 2,000 lines).
- three.js is local: `games/Tip-Adventure/lib/three.min.js` (r149). There is no CDN and no build step.
- Character art: `games/Tip-Adventure/character/Tip-character-sheet.png` (used as the portrait on the start screen) and `Bip.png` (unused so far; the agent could not view it).
- `games/Tip-Adventure/index.html` is the older, separate 3D meadow game. Leave it alone.
- Home page card: `/index.html` has a card with `data-game="tip-jungle-run"` and a best-score getter. A Neon Horizon card was also added there.
- Repo: https://github.com/MrD009/mini-arcade (branch `master`). Phase 1 is committed and pushed.
- `games/test-gemini-1/` is untracked on purpose. Do not commit it.

## Game modes

| Mode id | What it is |
|---|---|
| `goal` | World 1 levels (5 so far). Reach a finish arch. 3 stars per level. |
| `endless` | Run until you die. Best score is saved. |
| `daily` | Endless-style run using a date-seeded layout and a daily modifier. Streak and daily bonus. |
| `treetop` | Bonus game. A 20 s termite-only sprint. Unlocks after clearing 1-2. |
| `dig` | Bonus game. A 4-column tap-the-beat rhythm game. Unlocks after clearing 1-4. |

Game states: `menu`, `playing`, `paused`, `finishing`, `won`, `dying`, `over`, `dig`.

## World 1 levels (the `LEVELS` array)

| Id | Name | Goal (m) | Speed | Hazards added | Star objective |
|---|---|---|---|---|---|
| 1-1 | Sunny Trailhead | 800 | 14-19 | logs, boulders | collect 80% of termites |
| 1-2 | Mossy Roll | 1200 | 15-22 | vines, mounds | smash 8 mounds |
| 1-3 | Muddy Bend | 1500 | 16-24 | mud, snakes | reach combo x3 |
| 1-4 | River Crossing | 1800 | 17-26 | rivers + log bridge, coconut monkeys | finish under 1:25 |
| 1-5 | Temple Chase | 2500 | 18-28 | boulder chase, temple finish gate | collect 70% of termites |

- Stars per level: 1 for finishing, 1 for the objective, 1 for taking no hits.
- A level unlocks when the previous level has at least 1 star.
- World 2 is shown as locked and "Coming soon" (needs `W2_STARS_NEEDED = 10`).
- Each `LEVELS` entry has these fields: `id, name, goal, speed[2], diff[2], palette[2], hazards[], objective{type,...}, intro[{id,hint}], chase?, finish?`.
- Objective types: `termites{pct}`, `smash{count}`, `combo{mult}`, `time{sec}`.

## Core mechanics

- 3 lanes (`LANE_W = 2.6`). Controls: A/D or arrows to change lane, W/Up/Space to jump, S/Down/Shift to roll. Touch uses swipes. P or Esc pauses.
- 3 hearts. A hit gives 1.8 s of invulnerability and slows Tip.
- Rolling smashes mounds and coconuts and slides under vines. It costs stamina.
- Pickups:
  - Termite: score and combo, up to x5.
  - Golden ant: 5 s turbo dash that smashes everything and is invulnerable.
  - Heart: heals 1.
  - Magnet: pulls termites in.
- Hazards: log (jump), boulder (change lane), vines (roll under), mound (smash by rolling), mud (slows), snake (slithers across lanes), river (jump or use a bridge), coconut (thrown by monkeys at a glowing lane).
- Boulder chase (levels with `chase: true`):
  - `chaseGap` runs from `CHASE_START` 40 to `CHASE_MAX` 50. The catch distance is 3.
  - A hit or river fall costs 8 (`CHASE_HIT`). Termites add 0.35.
  - A red screen glow and rumble warn you. The boulder is only drawn when the gap is below 7.5.
  - If it catches Tip, the run ends with the death text "Flattened by the boulder!".

## Meta systems

- Coins: 1 per 4 termites per run. A level clear adds 15 plus 10 per star. Missions and the daily run pay extra.
- Missions: 3 active, cumulative across runs. Types: termites, smash, dist, jump, roll, dash, magnet, river, clear.
- Daily run:
  - Seeded by `dayKey()`, so the hazard layout is mostly identical for everyone that day. Hearts can still differ.
  - 5 daily modifiers (`DAILY_MODS`): Sunny Sprint, Turbo Trail, Termite Frenzy, Misty Swamp, Golden Hour.
  - The first run of the day gives 25 coins plus 5 per streak day, capped at 7 days.
- Wardrobe:
  - Scales: Classic, Mint (80), Berry (120), Golden (250).
  - Accessories: Explorer Hat (60), Red Scarf (60), Shades (100).
  - Applied live to the 3D Tip through `applySkin()` and `applyAcc()`.
- Bonus games: Treetop Dash pays about 0.6 coins per termite plus 15. Mound Dig pays hit-based coins plus a rank bonus (S/A/B/C).

## Save data (localStorage key `tipJungleRun`)

```
{
  endlessBest, coins, skin, acc:{hat,scarf,glasses},
  owned:{'skin:mint':true,'acc:hat':true},
  levels:{'1-1':{stars,best,time}},
  missions:[{type,target,reward,progress}],
  daily:{'YYYY-MM-DD':{best,plays}}, streak:{last,count},
  bonus:{treetop,dig}
}
```

`persist()` runs on run end, on pause, and on `pagehide`.

## Code map (all in jungle-run.html, in file order)

1. CSS, then HTML (HUD, start modal, level modal, shop, pause, end modal, dig canvas).
2. Config: `LEVELS`, `PAL`, `DAILY_MODS`, `SKINS`, `ACCS`, `MISSION_DEFS`, `BONUS_*`, `CHASE_*`, `RIVER_HD`.
3. Storage (`save`, `persist`, `stat()` for missions), `Sfx` class (all sound is procedural Web Audio), the three.js scene, and the recycled jungle trail segments.
4. `buildTip()` (accessories and the skin API), then the maker functions for each entity (`makeLog`, `makeRiver`, `makeMonkey`, `makeFinish`, and so on).
5. `spawnHazard` / `spawnRiver` / `spawnMonkeyThrow` / `spawnCoconut`, then `PATTERNS`, `spawnRow`, `spawnTreetopRow`.
6. Game state, `resetGame`, the HUD (`updateHUD`, `objective()`), input.
7. Flow: `startGame`, `goMenu`, `openLevels`, `openShop`, `showEnd`, `fillBonusEnd`.
8. Gameplay: `hurt`, `fall`, `smash`, `collect`, `updateEntities`, `updatePlayer`, `animateTip`, `updateCamera`, `playingStep`, `updateChase`, `step`.
9. Bonus: `startDig`, `drawDig`, `finishDig`, `finishTreetop`, then wiring.

How to add things:

- New level: add an entry to `LEVELS` (and `intro` hints if it adds a hazard).
- New hazard:
  - Write a `makeX()`.
  - Add a `case` in `spawnHazard`, or a spawn function for special entities.
  - Add a pattern in `PATTERNS` with `h: ['hazardName']`, and add the name to the level's `hazards` and to `ALL_HAZARDS`.
  - Add collision handling in `updateEntities`, and an `intro` hint.
- Gameplay layout randomness must use `rnd()`, not `Math.random()`, so the daily run stays deterministic.

## Testing notes (what worked)

- Syntax check without a browser: extract the `<script>` body to a temp file and run `node --check` on it.
- To force scenarios, make a temporary copy of the game with a hook before the final `frame();`, for example `window.__t = { get entities(){return entities}, spawn(id,z){PATTERNS[patIndex(id)].fn(z)}, ... }`. Delete the copy afterwards. Never commit it.
- For screenshots, press P to pause, then hide `#pauseModal` and take the screenshot.
- Seed saves with `page.addInitScript`. Do not set localStorage and then reload, because `pagehide` persist overwrites it with the old in-memory save.
- Git on Windows PowerShell 5.1: do not add `2>&1` to git commands, and do not pipe `git status` into `Select-Object -First N`. Both produce a misleading "exit code 1".

## Known gaps and untested items

- Balance numbers are guesses and none of 1-4 and 1-5 has been played start to finish: the 1:25 target on 1-4, the 6 m river gap, the chase penalties, and the coin and mission rewards.
- Mound Dig timing was only tested by blind tapping, and the chart is aligned to the music tempo of 112 BPM by code only (not checked by ear).
- Touch controls and small-screen layouts were not tested on a real device.
- Seen from behind, Tip looks like a rounded ball, so an upright back-view or a different camera might read better.
- The daily run is only mostly deterministic (heart pickups depend on lives).
- `Bip.png` has not been used.
- Level 1-5 might be too easy or too hard compared with 1-4.
