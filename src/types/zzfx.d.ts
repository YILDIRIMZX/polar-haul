// Types for the parts of ZzFX (https://github.com/KilledByAPixel/ZzFX, MIT) this game uses.
declare module 'zzfx' {
  export const ZZFX: {
    volume: number
    audioContext: AudioContext
  }

  export class ZZFXSound {
    constructor(zzfxSound?: number[])
    play(volume?: number, pitch?: number, randomnessScale?: number, pan?: number, loop?: boolean): AudioBufferSourceNode | undefined
  }
}
