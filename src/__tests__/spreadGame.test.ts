import { SpreadMap } from '../shared/game/map'
import basicMechanics from '../spreadGame/basicMechanics'
import Bubble from '../spreadGame/bubble'
import Cell from '../spreadGame/cell'
import { SpreadGameImplementation } from '../spreadGame/spreadGame'

const createMapHelper = (cells: Cell[]): SpreadMap => {
    return {
        height: 1000,
        width: 1000,
        players: 10,
        cells: cells,
    }
}

const calculatedCollisionTimeInMs = (b1: Bubble, b2: Bubble) => {
    const distance = Math.sqrt(
        (b1.position[0] - b2.position[0]) ** 2 +
            (b1.position[1] - b2.position[1]) ** 2,
    )
    return (distance / 2 / b1.speed) * 1000
}

test('bubble collision', () => {
    const cells = [
        new Cell(0, 0, [100, 100], 50, 50),
        new Cell(1, 1, [400, 500], 50, 50),
    ]
    const gameState = new SpreadGameImplementation(
        createMapHelper(cells),
        basicMechanics,
    )
    gameState.sendUnits(0, [0], 1)
    gameState.sendUnits(1, [1], 0)
    expect(gameState.bubbles.length).toBe(2)
    const b1 = gameState.bubbles[0]
    const b2 = gameState.bubbles[1]
    const ms = calculatedCollisionTimeInMs(b1, b2)
    gameState.step(ms)
    expect(gameState.bubbles.length).toBe(0)
})
