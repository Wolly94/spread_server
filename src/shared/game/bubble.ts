import Cell from './cell'
import { unitsToRadius } from './common'

var bubbleIds = 0

export default class Bubble {
    id: number
    playerId: number
    motherId: number
    position: [number, number]
    direction: [number, number]
    speed: number
    radius: number
    units: number
    constructor(
        playerId: number,
        position: [number, number],
        direction: [number, number],
        units: number,
        motherId: number,
    ) {
        this.id = bubbleIds
        bubbleIds += 1
        this.playerId = playerId
        this.position = position
        this.direction = direction
        this.units = units
        this.motherId = motherId
        this.speed = 100
        this.radius = unitsToRadius(units)
    }

    updateRadius() {
        this.radius = unitsToRadius(this.units)
    }

    // return [this did survive?, remainingEnemy]
    collide(enemy: Bubble): [boolean, Bubble | null] {
        // TODO modify 'this' accordingly
        // return
        const result = this.units - enemy.units
        if (result === 0) {
            return [false, null]
        } else if (result > 0) {
            this.units = result
            this.updateRadius()
            return [true, null]
        } else {
            enemy.units = -result
            enemy.updateRadius()
            return [false, enemy]
        }
    }
    overlaps(other: Bubble | Cell) {
        return (
            (this.position[0] - other.position[0]) ** 2 +
                (this.position[1] - other.position[1]) ** 2 <=
            Math.max(this.radius, other.radius) ** 2
        )
    }
    move(ms: number) {
        this.position[0] += (this.speed * this.direction[0] * ms) / 1000.0
        this.position[1] += (this.speed * this.direction[1] * ms) / 1000.0
    }
}
