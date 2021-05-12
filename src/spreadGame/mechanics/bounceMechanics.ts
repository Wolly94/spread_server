import { distance } from '../../shared/game/entites'
import Bubble from '../bubble'
import Cell from '../cell'
import { FightModifier } from '../spreadGame'
import basicMechanics from './basicMechanics'
import {
    calculationAccuracy,
    fight,
    minOverlap,
    overlap,
    reinforceCell,
    SpreadGameMechanics,
    takeOverCell,
} from './commonMechanics'
import scrapeOffMechanics from './scrapeOffMechanics'

const minUnitsOnBounce = 1

type vector = [number, number]

const onb = (e1: vector): vector => {
    return [-e1[1], e1[0]]
}

const scalarMul = (l: number, v: vector): vector => [v[0] * l, v[1] * l]
const mul = (v1: vector, v2: vector) => v1[0] * v2[0] + v1[1] * v2[1]

const add = (...v: vector[]): vector => {
    return [v.reduce((s, v) => v[0] + s, 0), v.reduce((s, v) => v[1] + s, 0)]
}

const normalize = (v: vector): vector | null => {
    const length = distance(v, [0, 0])
    if (length <= 0.001) return null
    else return scalarMul(1 / length, v)
}

const difference = (pos1: vector, pos2: vector): vector => {
    return [pos1[0] - pos2[0], pos1[1] - pos2[1]]
}

const rotate = (v: vector, angle: number): vector => {
    // cos a  -sin a
    // sin a  cos a
    const co = Math.cos(angle)
    const si = Math.sin(angle)
    const res: [number, number] = [co * v[0] - si * v[1], si * v[0] + co * v[1]]
    return res
}

const adjustedDirection = (
    bubblePos: vector,
    bubbleDir: vector,
    targetPos: vector,
): vector => {
    const requiredAccuracy = 0.01
    const baseAngle = (10 / 360) * 2 * Math.PI
    const dirToTarget = normalize(difference(targetPos, bubblePos))
    if (dirToTarget === null) return bubbleDir
    const dirMistake = distance(dirToTarget, bubbleDir)
    if (dirMistake <= requiredAccuracy) return bubbleDir
    const n = onb(dirToTarget)
    const coords: [number, number] = [
        mul(dirToTarget, bubbleDir),
        mul(n, bubbleDir),
    ]
    const wrongSide = coords[0] < 0
    const wrongPart = coords[1]
    const scale = dirMistake / 3
    if (wrongPart >= 0) {
        return rotate(bubbleDir, -baseAngle * scale)
    } else {
        return rotate(bubbleDir, +baseAngle * scale)
    }
}

const bounceMechanics: SpreadGameMechanics = {
    collideBubble: (
        bubble1: Bubble,
        bubble2: Bubble,
        fightModifier: FightModifier,
    ) => {
        return scrapeOffMechanics.collideBubble(bubble1, bubble2, fightModifier)
    },
    collideCell: (bubble: Bubble, cell: Cell, fightModifier: FightModifier) => {
        // bubble reached its destiny?
        if (bubble.targetId === cell.id) {
            return basicMechanics.collideCell(bubble, cell, fightModifier)
        }
        if (overlap(bubble, cell) < calculationAccuracy) return bubble
        const fighters = Math.min(minUnitsOnBounce, bubble.units, cell.units)
        bubble.units -= fighters
        bubble.updateRadius()
        if (cell.playerId === bubble.playerId) {
            reinforceCell(cell, fighters)
        } else {
            const cellRem = fight(fighters, cell.units, fightModifier)
            takeOverCell(cell, cellRem, bubble.playerId)
        }
        const dirToCell = normalize(difference(cell.position, bubble.position))
        if (dirToCell === null)
            return basicMechanics.collideCell(bubble, cell, fightModifier)
        const newDirection = difference(
            bubble.direction,
            scalarMul(2 * mul(dirToCell, bubble.direction), dirToCell),
        )
        bubble.direction = newDirection

        return bubble
    },
    move: (bubble, ms) => {
        bubble = basicMechanics.move(bubble, ms)
        bubble.direction = adjustedDirection(
            bubble.position,
            bubble.direction,
            bubble.targetPos,
        )
        return bubble
    },
}

export default bounceMechanics
