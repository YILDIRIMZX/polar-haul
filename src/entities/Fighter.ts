import type { Vector3 } from 'three'

// Anyone a bear can turn on and fight: the player, and the hunters.
export interface Fighter {
  readonly position: Vector3
  readonly inBase: boolean // bears never follow anyone into the base
  readonly alive: boolean
  damage(amount: number): void
}
