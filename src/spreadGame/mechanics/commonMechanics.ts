import { distance } from '../../shared/game/entites'
import Bubble from '../bubble'
import Cell from '../cell'
import { FightModifier } from '../spreadGame'

export const calculationAccuracy = 0.01
export const minOverlap = 5

export const overlap = (b: Bubble, e: Bubble | Cell) => {
    return b.radius + e.radius - distance(b.position, e.position)
}

export const centerOverlap = (b: Bubble, e: Bubble | Cell) => {
    return Math.max(b.radius, e.radius) - distance(b.position, e.position)
}

// <= 0 if entities at least touch each other
export const entityDistance = (b: Bubble, e: Bubble | Cell) => {
    return Math.max(-overlap(b, e), 0)
}

// <= 0 if at least the center of one entity is contained in the other entity
export const centerOverlapDistance = (b: Bubble, e: Bubble | Cell) => {
    return Math.max(-centerOverlap(b, e), 0)
}

export interface SpreadGameMechanics {
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        fightModifier: FightModifier,
    ) => [Bubble | null, Bubble | null]
    collideCell: (
        bubble: Bubble,
        cell: Cell,
        fightModifier: FightModifier,
    ) => Bubble | null
    move: (bubble: Bubble, ms: number) => Bubble
}
