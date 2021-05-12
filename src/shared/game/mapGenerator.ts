import { radiusToUnits } from './common'
import {
    addCellToMap,
    availableSpaceFromPosition,
    emptyMap,
    MapCell,
    SpreadMap,
} from './map'

const minDistance = 10

function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min
}

const calculateDensity = (map: SpreadMap) => {
    const covered = map.cells.reduce((coveredSpace, cell) => {
        return coveredSpace + Math.PI * cell.radius ** 2
    }, 0)
    return covered / (map.width * map.height)
}

const getStartingUnits = (saturated: number) => {
    const lowerPart = 1 / 8
    const maxPart = 1 - lowerPart
    const x01 = Math.random()
    const xCapped = lowerPart + x01 * (maxPart - lowerPart)
    const xCappedM11 = 2 * (xCapped - 1 / 2)
    const v = (saturated / 2) * (xCappedM11 ** 11 + 1)
    const result = Math.ceil(v)
    return result
}

export const generate2PlayerMap = (squareSideLength: number) => {
    let cellId = 1
    const cellDensity = 0.05
    const cellRadii = [25, 100]
    const playerDist = [12, 3, 1] // 12 null : 3 owner of side : 1 owner of other side
    const radiusAccuracy = 5
    let setStartingCells = false
    let map = emptyMap()
    map.width = squareSideLength
    map.height = squareSideLength
    const half = squareSideLength / 2
    const mapCenter = [half, half]
    // generate cells on the map
    while (calculateDensity(map) < cellDensity) {
        let centered = false
        const number = getRandomIntInclusive(
            setStartingCells ? 1 : playerDist[0] + 1,
            playerDist.reduce((s, n) => s + n, 0),
        )
        let playerId = null
        if (number <= playerDist[0]) {
            playerId = null
        } else if (number <= playerDist[1] + playerDist[0]) {
            playerId = 0
        } else {
            playerId = 1
        }
        let radius =
            getRandomIntInclusive(
                cellRadii[0] / radiusAccuracy,
                cellRadii[1] / radiusAccuracy,
            ) * radiusAccuracy
        let x = getRandomIntInclusive(0, half)
        let y = getRandomIntInclusive(0, 2 * half)
        const avSpace = availableSpaceFromPosition(map, [x, y])
        radius = Math.min(avSpace - minDistance, radius)
        if ((x - mapCenter[0]) ** 2 + (y - mapCenter[1]) ** 2 <= radius ** 2) {
            x = mapCenter[0]
            y = mapCenter[1]
            centered = true
            playerId = -1
        }
        const cell1: MapCell = {
            id: cellId,
            playerId: centered ? null : playerId,
            radius: radius,
            units: 0,
            position: [x, y],
        }
        const r = addCellToMap(cell1, map)
        if (r.error !== null) continue
        //const units = getRandomIntInclusive(radius / 8, radius)
        map = r.map

        const createdCellIndex = map.cells.findIndex((c) => c.id === cell1.id)
        if (createdCellIndex < 0) continue
        else {
            const units = getStartingUnits(
                radiusToUnits(map.cells[createdCellIndex].radius),
            )
            map.cells[createdCellIndex].units = units
            cell1.units = units
        }

        cellId = cellId + 1
        if (!centered) {
            const rotatedPosition: [number, number] = [
                2 * mapCenter[0] - x,
                2 * mapCenter[1] - y,
            ]
            const cell2: MapCell = {
                ...cell1,
                position: rotatedPosition,
                playerId: playerId !== null ? 1 - playerId : playerId,
                id: cellId,
            }
            cellId = cellId + 1
            const r2 = addCellToMap(cell2, map)
            if (playerId !== null) setStartingCells = true
            map = r2.map
        }
    }
    return map
}
