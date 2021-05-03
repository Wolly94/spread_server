import Bubble from './bubble'

test('overlaps', () => {
    const pos1: [number, number] = [100, 100]
    const pos2: [number, number] = [110, 100]
    const b1 = new Bubble(0, pos1, [0, 0], 50, 0)
    const b2 = new Bubble(0, pos2, [0, 0], 50, 0)
    expect(b1.overlaps(b2)).toBe(true)
})
test('dumb test', () => {
    const x = 10
    const y = 10
    expect(x).toBe(y)
})
