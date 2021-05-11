import basicMechanics from '../spreadGame/basicMechanics'
import Bubble from '../spreadGame/bubble'

test('overlaps', () => {
    const pos1: [number, number] = [100, 100]
    const pos2: [number, number] = [110, 100]
    const b1 = new Bubble(0, pos1, [0, 0], 50, 0, 0, [1000, 1000])
    const b2 = new Bubble(0, pos2, [0, 0], 50, 0, 0, [1000, 1000])
    expect(basicMechanics.collides(b1, b2)).toBe(true)
})

test('collide 50 vs 25 units', () => {
    const u1 = 50
    const u2 = 25
    const b1 = new Bubble(0, [0, 0], [0, 0], u1, 0, 0, [1000, 1000])
    const b2 = new Bubble(0, [100, 100], [0, 0], u2, 0, 0, [1000, 1000])
    const res = basicMechanics.collideBubble(b1, b2, {})
    expect(res[0]).not.toBe(null)
    expect(res[1]).toBe(null)
    expect(b1.units).toBe(u1 - u2)
})

test('collide 50 vs 50 units', () => {
    const u1 = 50
    const u2 = 50
    const b1 = new Bubble(0, [0, 0], [0, 0], u1, 0, 0, [1000, 1000])
    const b2 = new Bubble(0, [100, 100], [0, 0], u2, 0, 0, [1000, 1000])
    const res = basicMechanics.collideBubble(b1, b2, {})
    expect(res[0]).toBe(null)
    expect(res[1]).toBe(null)
})

test('collide 25 vs 50 units', () => {
    const u1 = 25
    const u2 = 50
    const b1 = new Bubble(0, [0, 0], [0, 0], u1, 0, 0, [1000, 1000])
    const b2 = new Bubble(0, [100, 100], [0, 0], u2, 0, 0, [1000, 1000])
    const res = basicMechanics.collideBubble(b1, b2, {})
    expect(res[0]).toBe(null)
    expect(res[1]).not.toBe(null)
    if (res[1] === null) {
        expect(true).toBe(false)
    } else {
        expect(res[1].units).toBe(u2 - u1)
    }
})
