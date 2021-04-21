import { Cell } from './cell'

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
        this.id = 1
        this.playerId = playerId
        this.position = position
        this.direction = direction
        this.units = units
        this.radius = 25
        this.motherId = motherId
        this.speed = 50
    }
    collide(enemy: Bubble): [boolean, Bubble | null] {
        // TODO modify 'this' accordingly
        // return
        const survived = true
        return [survived, enemy]
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
