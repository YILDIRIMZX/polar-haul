import { registerSW } from 'virtual:pwa-register'
import { Game } from './game/Game.ts'
import './style.css'

registerSW({ immediate: true })

// iOS Safari still allows pinch zoom on a standalone app unless the gesture is cancelled.
document.addEventListener('gesturestart', (e) => e.preventDefault())

const canvas = document.getElementById('game') as HTMLCanvasElement
const splash = document.getElementById('splash')

const game = new Game(canvas, () => splash?.classList.add('hidden'))
game.start()

// Development only: lets the browser console reach the game for testing. Left out of the published build.
if (import.meta.env.DEV) Object.assign(window, { game })
