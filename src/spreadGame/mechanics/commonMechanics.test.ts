import Bubble from '../bubble'
import { centerOverlap, overlap } from './commonMechanics'

test('overlapCenter', () => {
    const pos1: [number, number] = [100, 100]
    const pos2: [number, number] = [110, 100]
    const b1 = new Bubble(0, pos1, [0, 0], 50, 0, 0, [1000, 1000])
    const b2 = new Bubble(0, pos2, [0, 0], 50, 0, 0, [1000, 1000])
    const overl = centerOverlap(b1, b2)
    expect(overl).toBe(40)
})
