import SpreadGameServer, { runningGameServers } from './gameServer'

let currentPort = 3030

const nextPort = () => {
    currentPort += 1
    return currentPort
}

export interface CreateSocketResponse {
    url: string
}

export const createGameServer = () => {
    const port = nextPort()
    const gameServer = new SpreadGameServer(port)
    gameServer.open()
    gameServer.start()
    runningGameServers.push(gameServer)
    const resp: CreateSocketResponse = {
        url: gameServer.url,
    }
    return resp
}
