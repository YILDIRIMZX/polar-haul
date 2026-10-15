<div align="center">

# Polar Haul

**The game from the ads, built for real: an idle-arcade survival game where you hunt polar bears, stack meat, run a processing line and grow a frozen base. Built as an installable web app (PWA).**

**English** · [Türkçe](README.tr.md)

![Version](https://img.shields.io/badge/version-0.8.0-3b6e8f)
![Status](https://img.shields.io/badge/status-in_development-8aa4b5)
![Three.js](https://img.shields.io/badge/Three.js-3D-1f2933)
![PWA](https://img.shields.io/badge/PWA-installable-3b6e8f)
![License](https://img.shields.io/badge/License-MIT-3b6e8f)

</div>

> [!IMPORTANT]
> **Unofficial fan project.** Polar Haul is an independent, non-commercial hobby project. It is **not** affiliated with, endorsed by or connected to Century Games or Whiteout Survival. "Whiteout Survival" is a trademark of its owner and is named here only to explain where the idea came from.
>
> No code, art, audio, characters or other material from the original game or its advertisements is used. Polar Haul is not a clone of the original game and is not meant to replace it: it builds a different game, the idle-arcade gameplay concept shown in the ads, with original and openly licensed (CC0) assets. Game mechanics are a shared genre; the brand and its content are not.
>
> If you hold rights and have a concern, please open an issue and it will be addressed promptly.

## Why this exists

Mobile ads for Whiteout Survival show a simple, satisfying game: a survivor leaves a fenced camp, fights polar bears, carries a tower of meat back on their head, drops it into a processing machine, collects cash and unlocks new areas. After installing the app, you get something else: a 4X strategy game with a world map, alliances and long timers.

Polar Haul builds the game the ads promised. It has two goals:

1. **To play the game from the ads**, on one personal iPhone, without ads, purchases or accounts.
2. **To learn** 3D web game development (Three.js, game loops, instancing, mobile performance and PWAs) on a project with a clear and fun target.

## What it will be

| Area | Plan |
|---|---|
| **Core loop** | Leave the base, auto-attack polar bears, stack the dropped meat on your head, carry it back, feed the processing line, collect cash. |
| **Progression** | Stand on unlock pads to spend cash: carry capacity, damage, speed, a second machine, hauling workers, new zones, gates. |
| **Challenge** | Tougher bears in outer zones and a boss bear at the end of the first map. |
| **Later updates** | Freezing survivors to rescue and employ, wood and a giant furnace with a heat radius, tents and an infirmary, new maps. |
| **Device** | Portrait, touch joystick, works offline, saves on the device with a backup file. |

The full plan is in [ROADMAP.md](ROADMAP.md) (Turkish).

## Install on iPhone

1. Open the app's GitHub Pages address in **Safari**.
2. Tap **Share → Add to Home Screen**.
3. Launch it from the home screen. It opens full screen and works without a connection.

Updates arrive automatically the next time the app is opened.

## Tech

TypeScript · Vite · Three.js · vite-plugin-pwa · GitHub Actions → GitHub Pages

## Changelog

Every version, with what changed and why, is listed in [CHANGELOG.md](CHANGELOG.md) in English and Turkish.

## License

Code is released under the [MIT License](LICENSE). Third-party code and assets keep their own licenses and are listed in [CREDITS.md](CREDITS.md); recorded sounds and art will be CC0 only.
