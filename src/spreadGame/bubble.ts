import { unitsToRadius } from '../shared/game/common'
import Cell from './cell'

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
    targetId: number
    targetPos: [number, number]
    constructor(
        playerId: number,
        position: [number, number],
        direction: [number, number],
        units: number,
        motherId: number,
        targetId: number,
        targetPos: [number, number],
    ) {
        this.id = bubbleIds
        bubbleIds += 1
        this.playerId = playerId
        this.position = position
        this.direction = direction
        this.units = units
        this.motherId = motherId
        this.speed = 90
        this.targetId = targetId
        this.targetPos = targetPos
        this.radius = unitsToRadius(units)
    }

    updateRadius() {
        this.radius = unitsToRadius(this.units)
    }
}
