import { radiusToUnits } from './common'
import { distanceToEntity } from './entites'

export interface MapCell {
    id: number
    playerId: number | null
    position: [number, number]
    radius: number
    units: number
}

// adjusts recoverable values
const isMapCell = (cell: MapCell): cell is MapCell => {
    if (cell.playerId && typeof cell.playerId !== 'number') cell.playerId = null // return false
    if (typeof cell.units !== 'number') cell.units = 0 // return false
    if (typeof cell.radius !== 'number') cell.radius = mapDefaults.minRadius // return false
    if (!Array.isArray(cell.position) || !(cell.position.length === 2))
        return false
    if (
        typeof cell.position[0] !== 'number' ||
        typeof cell.position[1] !== 'number'
    )
        return false
    return true
}

export interface SpreadMap {
    cells: MapCell[]
    players: number
    width: number
    height: number
}

export const mapDefaults = {
    minRadius: 15,
    width: 1000,
    height: 1000,
    maxPlayers: 4,
}

export const distanceToBoundary = (
    map: SpreadMap,
    position: [number, number],
) => {
    return Math.min(
        position[0],
        position[1],
        map.width - position[0],
        map.height - position[1],
    )
}

const distanceToCells = (cells: MapCell[], position: [number, number]) => {
    return Math.min(...cells.map((c) => distanceToEntity(c, position)))
}

export const availableSpaceFromPosition = (
    map: SpreadMap,
    position: [number, number],
) => {
    return Math.min(
        distanceToBoundary(map, position),
        distanceToCells(map.cells, position),
    )
}

export const availableSpace = (map: SpreadMap, cell: MapCell) => {
    return Math.min(
        distanceToBoundary(map, cell.position),
        distanceToCells(
            map.cells.filter((c) => c.id !== cell.id),
            cell.position,
        ),
    )
}

// modifies cell
export const adjustCellValues = (map: SpreadMap, cell: MapCell) => {
    cell.units = Math.floor(cell.units)

    const existingCell = map.cells.find((c) => c.id === cell.id)
    cell.radius = Math.floor(cell.radius)
    cell.units = Math.min(cell.units, 2 * radiusToUnits(cell.radius))
    cell.position = [Math.floor(cell.position[0]), Math.floor(cell.position[1])]
    if (cell.radius < mapDefaults.minRadius) return 'Radius too small!'
    const space = availableSpace(map, cell)
    if (space < mapDefaults.minRadius) {
        return 'Not enough space!'
    }
    cell.radius = Math.min(space, cell.radius)
    return null
}

export const updateCellInMap = (
    cell: MapCell,
    map: SpreadMap,
): { map: SpreadMap; error: string | null } => {
    const error = adjustCellValues(map, cell)
    if (error !== null) return { map: { ...map }, error: error }
    let newCells = [...map.cells]
    const index = newCells.findIndex((c) => c.id === cell.id)
    if (index >= 0) newCells[index] = cell
    return { map: { ...map, cells: newCells }, error: null }
}

export const removeCellFromMap = (cellId: number, map: SpreadMap) => {
    let newCells = [...map.cells]
    const index = newCells.findIndex((c) => c.id === cellId)
    if (index >= 0) newCells.splice(index, 1)
    return { ...map, cells: newCells }
}

export const addCellToMap = (
    cell: MapCell,
    map: SpreadMap,
): { map: SpreadMap; error: string | null } => {
    if (map.cells.some((c) => c.id === cell.id)) {
        return { map: { ...map }, error: null }
    }
    const error = adjustCellValues(map, cell)
    if (error !== null) return { map: { ...map }, error: error }
    const cells = [...map.cells, cell]
    return { map: { ...map, cells: cells }, error: null }
}

export const emptyMap = (): SpreadMap => {
    return {
        cells: [],
        players: mapDefaults.maxPlayers,
        width: 1000,
        height: 1000,
    }
}

export const getPlayerIds = (map: SpreadMap) => {
    const players = new Set(
        map.cells.map((c) => (c.playerId === null ? -1 : c.playerId)),
    )
    players.delete(-1)
    return players
}

export const validateMap = (map: SpreadMap) => {
    let message = ''
    if (typeof map.width !== 'number' || typeof map.height !== 'number') {
        message = 'invalid sizes or playercount: set to default'
        map.width = mapDefaults.width
        map.height = mapDefaults.height
    }
    if (!Array.isArray(map.cells)) {
        message += 'cells are not given as array'
        map.cells = []
    }
    let m: SpreadMap = { ...map }
    for (var i = 0; i < map.cells.length; i++) {
        const cell = map.cells[i]
        if (!isMapCell(cell)) {
            message += '\ninvalid cell'
            continue
        }
        const r = updateCellInMap(map.cells[i], m)
        if (r.error !== null) {
            m = removeCellFromMap(map.cells[i].id, m)
            message += '\nremoved cell with id ' + map.cells[i].id.toString()
        } else m = r.map
    }
    const playerCount = new Set(m.cells.map((c) => c.playerId)).size - 1
    if (playerCount !== map.players) message += '\nnumber of players adjusted'
    return { map: { ...m, players: playerCount }, message: message }
}
