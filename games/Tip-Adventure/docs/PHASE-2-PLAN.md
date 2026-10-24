# Tip's Jungle Run: Phase 2 plan (chapters before World 2)

Attach this file and `PHASE-1-STATUS.md` when continuing. Then say, for example: "Start Phase 2, step 1".
Work one step at a time, and commit and push after each step. Read the Phase 1 code map before editing.

## Goal

Expand World 1 into chapters of 10 levels each. Existing levels 1-1 to 1-5 stay as they are and become part of Chapter 1, so saved stars keep working. World 2 (Sunbaked Dunes) comes after the chapters.

## Chapter layout (proposed)

| Chapter | Theme | Levels | New hazards | Boss (level 10) |
|---|---|---|---|---|
| 1. Jungle Trail | Sunny to golden-hour jungle | 1-1 to 1-10 | the current set (logs, boulders, vines, mounds, mud, snakes, rivers, monkeys) | a harder Temple Chase (the current 1-5 becomes the level-5 mid-boss) |
| 2. Misty Swamp | Fog, dusk, fireflies | 2-1 to 2-10 | lily-pad jumping, snapping crocodiles that lunge into a lane, swinging vines, a lantern-lit night section | a giant crocodile chase |
| 3. Ancient Ruins | Stone temple, torches | 3-1 to 3-10 | spike floors, swinging blades, crumbling tiles, dart walls | a rolling stone-door maze or a walking golem |

The default is 3 chapters in World 1 (30 levels, 90 stars). This is still an open decision.

## The 10-level pattern for each chapter

- Levels 1 and 6: introduce a new hazard with a one-time hint banner.
- Levels 2, 3, 7 and 8: practice, mixing the new hazard with old ones.
- Level 4: a remix level with a time or no-hit objective.
- Level 5: a mid-boss, or a bonus-game unlock.
- Level 9: a hard warm-up before the boss.
- Level 10: the boss, plus a chapter reward.

Levels should be generated from a short config (goal, speed range, difficulty range, hazard set, objective, palette, intro hints), not hand-written one at a time. The current `LEVELS` entry fields already cover this.

## Progression and rewards

- Chapter N+1 unlocks when you clear the Chapter N boss and have a star threshold (default: 20 of 30 per chapter).
- World 2 would need about 50 of 90 stars. Change `W2_STARS_NEEDED` accordingly.
- Each chapter ends with a reward: coins, one new Tip scale colour or accessory, and a short story card.
- A new bonus game per chapter (for example a lily-pad hop for the swamp), unlocked mid-chapter.
- A story is optional. `character/Bip.png` exists; the agent could not view it. If Bip is a friend character, Tip could be searching for or rescuing Bip across the chapters.

## Technical changes needed

- Level IDs: keep the `1-N` format for Chapter 1. Add `2-N` and `3-N`. `save.levels` is already keyed by id.
- `LEVELS`: grow to 30 entries, or generate them from a builder function with a per-chapter config.
- `isUnlocked(i)` and `totalStars()`: make them chapter-aware, with the chapter gate and the star threshold.
- `renderLevels()`: add chapter tabs or paging, and move the bonus list per chapter.
- `showEnd()`: the "Next level" button must cross chapter boundaries, and a boss clear needs a chapter-complete reward screen.
- `PAL`: add palettes for the swamp (night, fireflies) and the ruins (torch light). `applyAtmosphere` already lerps two palettes.
- New hazard pattern (copy the river and monkey approach): a `makeX()`, a `case` in `spawnHazard` (or a special spawn function), a `PATTERNS` entry with `h: ['name']`, collision handling in `updateEntities`, a hint, and the hazard name added to `ALL_HAZARDS`.
- Save data: add a chapter-rewards-claimed map. Everything else is additive.

## Suggested build order

1. Data and UI: chapter-aware level data, level select with chapter tabs and unlock gates. Extend Chapter 1 to 10 levels using existing hazards. Move the current 1-5 to be the mid-boss.
2. Chapter 1 boss and chapter reward screen (coins, one cosmetic, story card).
3. Chapter 2: new hazards one at a time (lily pads, then crocodiles, then swinging vines, then the lantern night), then levels 2-1 to 2-10, the boss, and a bonus game.
4. Chapter 3: the same, with ruins hazards.
5. Tuning pass: balance each chapter, check the coin economy against the shop prices, and test on touch.
6. World 2 (Sunbaked Dunes): a new palette and hazards, unlocked by stars.

## Open questions to settle (defaults in brackets)

1. How many chapters in World 1? [3]
2. Generate levels from templates, or hand-design each? [templates]
3. Include a story and comic cards? [yes, short]
4. Star threshold to open each chapter? [20 of 30]
5. Should each chapter boss give a unique cosmetic? [yes]

## Housekeeping reminders

- Commit and push after each step. The remote has other work on `master`, so run `git fetch` first if a push is rejected, and rebase instead of forcing.
- Do not commit `games/test-gemini-1/`.
- See the testing notes in `PHASE-1-STATUS.md` (temp test copy with a debug hook, pause-and-screenshot, `addInitScript` for seeding saves, and the PowerShell git quirks).
