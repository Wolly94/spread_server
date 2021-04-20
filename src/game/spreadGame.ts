export interface SpreadGame {
    start: (updateInterval: number) => void
    step: (ms: number) => void
    sendUnits: (
        playerToken: string,
        senderIds: number[],
        receiverId: number,
    ) => void
    toString: () => string
}

export const exampleSpreadGame: SpreadGame = {
    start: (updateInterval: number) => {
        console.log('start with interval: ', updateInterval)
    },
    step: (ms: number) => {
        console.log('step ', ms)
    },
    sendUnits: (playerToken, senderIds, receiverIds) => {},
    toString: () => JSON.stringify({ gameData: '' }),
}
