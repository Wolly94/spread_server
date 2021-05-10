import { radiusToUnits, radiusToUnitsFixPoint } from '../shared/game/common'
import { distance } from '../shared/game/entites'
import { distanceToBoundary } from '../shared/game/map'
import basicMechanics from './basicMechanics'
import Bubble from './bubble'
import Cell from './cell'
import { FightModifier, SpreadGameMechanics } from './spreadGame'

const minOverlap = 5

const scrapeOffMechanics: SpreadGameMechanics = {
    collides: (bubble: Bubble, entity: Bubble | Cell) => {
        return (
            distance(bubble.position, entity.position) <=
            bubble.radius + entity.radius - minOverlap
        )
    },
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        fightModifier: FightModifier,
    ) => {
        if (bubble1.playerId === bubble2.playerId) return [bubble1, bubble2]
        const dist = distance(bubble1.position, bubble2.position)
        const unitDiff = bubble1.units - bubble2.units
        const maxUnits = radiusToUnits(dist)
        if (unitDiff >= maxUnits) {
            bubble1.units =
                ((unitDiff + maxUnits) / (2 * dist)) ** 2 *
                radiusToUnitsFixPoint
            bubble1.updateRadius()
            return [bubble1, null]
        } else if (unitDiff <= -maxUnits) {
            bubble2.units =
                ((-unitDiff + maxUnits) / (2 * dist)) ** 2 *
                radiusToUnitsFixPoint
            bubble2.updateRadius()
            return [null, bubble2]
        } else {
            bubble1.units =
                ((unitDiff + maxUnits) / (2 * dist)) ** 2 *
                radiusToUnitsFixPoint
            bubble1.updateRadius()
            bubble2.units =
                ((-unitDiff + maxUnits) / (2 * dist)) ** 2 *
                radiusToUnitsFixPoint
            bubble2.updateRadius()
            return [bubble1, bubble2]
        }
    },
    collideCell: (bubble: Bubble, cell: Cell, fightModifier: FightModifier) => {
        // if collides returns true, then dist <= bubble.radius
        const dist = distance(bubble.position, cell.position) - cell.radius
        if (dist <= 0) {
            return basicMechanics.collideCell(bubble, cell, fightModifier)
        } else {
            const fighters = bubble.units - radiusToUnits(dist)
            // fighters >= here
            if (bubble.playerId === cell.playerId) {
                cell.units += fighters
            } else {
                const rem = cell.units - fighters
                if (rem < 0) {
                    cell.playerId = bubble.playerId
                    cell.units = -rem
                } else {
                    cell.units = rem
                }
            }
            bubble.units -= fighters
            bubble.updateRadius()
            return bubble
        }
    },
}

export default scrapeOffMechanics
