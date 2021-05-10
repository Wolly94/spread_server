import { radiusToUnits, radiusToUnitsFixPoint } from '../shared/game/common'
import { distance } from '../shared/game/entites'
import basicMechanics from './basicMechanics'
import Bubble from './bubble'
import Cell from './cell'
import { SpreadGameMechanics, FightModifier } from './spreadGame'

type vector = [number, number]

const onb = (e1: vector): vector => {
    return [-e1[1], e1[0]]
}

const scalarMul = (l: number, v: vector): vector => [v[0] * l, v[1] * l]
const mul = (v1: vector, v2: vector) => v1[0] * v2[0] + v1[1] * v2[1]

const add = (...v: vector[]): vector => {
    return [v.reduce((s, v) => v[0] + s, 0), v.reduce((s, v) => v[1] + s, 0)]
}

const difference = (
    pos1: [number, number],
    pos2: [number, number],
): [number, number] => {
    return [pos1[0] - pos2[0], pos1[1] - pos2[1]]
}

const bounceMechanics: SpreadGameMechanics = {
    collides: (bubble: Bubble, entity: Bubble | Cell) => {
        return (
            distance(bubble.position, entity.position) <=
            Math.min(bubble.radius, entity.radius)
        )
    },
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        fightModifier: FightModifier,
    ) => {
        return [null, null]
    },
    collideCell: (bubble: Bubble, cell: Cell, fightModifier: FightModifier) => {
        // bubble reached its destiny?
        if (bubble.targetId === cell.id) {
            if (basicMechanics.collides(bubble, cell))
                return basicMechanics.collideCell(bubble, cell, fightModifier)
            else return bubble
        }
        const dirToCell = difference(cell.position, bubble.position)
        const n = onb(bubble.direction)
        const newDirection = difference(
            dirToCell,
            scalarMul(2 * mul(n, dirToCell), n),
        )
        const targetDirection = difference(bubble.targetPos, bubble.position)

        return bubble
    },
}

export default bounceMechanics
