import { distance } from '../../shared/game/entites'
import Bubble from '../bubble'
import Cell from '../cell'
import { FightModifier } from '../spreadGame'
import {
    calculationAccuracy,
    centerOverlap,
    centerOverlapDistance,
    SpreadGameMechanics,
} from './commonMechanics'

export const fight = (
    att: number,
    def: number,
    fightModifier: FightModifier,
): number => {
    return att - def
}

export const reinforce = (sender: number, receiver: number) => {
    return sender + receiver
}

const basicMechanics: SpreadGameMechanics = {
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        fightModifier: FightModifier,
    ) => {
        if (centerOverlap(bubble1, bubble2) < calculationAccuracy)
            return [bubble1, bubble2]
        // TODO modify 'this' accordingly
        // return
        if (bubble1.playerId === bubble2.playerId) return [bubble1, bubble2]
        const result = fight(bubble1.units, bubble2.units, fightModifier)
        if (result === 0) {
            return [null, null]
        } else if (result > 0) {
            bubble1.units = result
            bubble1.updateRadius()
            return [bubble1, null]
        } else {
            bubble2.units = -result
            bubble2.updateRadius()
            return [null, bubble2]
        }
    },
    collideCell: (bubble: Bubble, cell: Cell, fightModifier: FightModifier) => {
        if (centerOverlap(bubble, cell) < calculationAccuracy) return bubble
        if (bubble.playerId === cell.playerId) {
            cell.units = reinforce(bubble.units, cell.units)
        } else {
            const result = fight(cell.units, bubble.units, fightModifier)
            if (result >= 0) {
                cell.units = result
            } else {
                cell.units = -result
                cell.playerId = bubble.playerId
            }
        }
        return null
    },
    move: (bubble: Bubble, ms: number) => {
        bubble.position[0] += (bubble.speed * bubble.direction[0] * ms) / 1000.0
        bubble.position[1] += (bubble.speed * bubble.direction[1] * ms) / 1000.0
        return bubble
    },
}

export default basicMechanics
