import Bubble from './bubble'
import Cell from './cell'
import { FightModifier, SpreadGameMechanics } from './spreadGame'

const basicMechanics: SpreadGameMechanics = {
    collides: (bubble: Bubble, entity: Bubble | Cell) => {
        return (
            (bubble.position[0] - entity.position[0]) ** 2 +
                (bubble.position[1] - entity.position[1]) ** 2 <=
            Math.max(bubble.radius, entity.radius) ** 2
        )
    },
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        fightModifier: FightModifier,
    ) => {
        // TODO modify 'this' accordingly
        // return
        if (bubble1.playerId === bubble2.playerId) return [bubble1, bubble2]
        const result = bubble1.units - bubble2.units
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
        if (bubble.playerId === cell.playerId) {
            cell.units += bubble.units
        } else {
            const result = cell.units - bubble.units
            if (result >= 0) {
                cell.units = result
            } else {
                cell.units = -result
                cell.playerId = bubble.playerId
            }
        }
        return null
    },
}

export default basicMechanics
