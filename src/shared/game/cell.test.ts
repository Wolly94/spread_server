import Cell from './cell'
import { radiusToUnits, unitsToRadius } from './common'

test('units decreasing when too much', () => {
    const radius = 50
    const maxUnits = radiusToUnits(50)
    const cell = new Cell(0, 0, [100, 100], maxUnits * 2, radius)
    expect(cell.units).toBe(2 * maxUnits)
    const msPerUnit = 1000 / cell.growthPerSecond
    const ms = cell.growthPerSecond * 1000
    cell.grow(msPerUnit)
    expect(cell.units).toBe(2 * maxUnits - 1)
    cell.grow(msPerUnit * (maxUnits - 1))
    expect(cell.units).toBe(maxUnits)
    cell.grow(msPerUnit)
    expect(cell.units).toBe(maxUnits)
    cell.grow(5 * msPerUnit)
    expect(cell.units).toBe(maxUnits)
})
