import FindGameServerHandler from './findGameServerHandler'
import GameServerHandler from './gameServerHandler'

let currentPort = 3030

const nextPort = () => {
    currentPort += 1
    return currentPort
}

export const createGameServer = () => {
    const port = nextPort()
    const result = GameServerHandler.createGameServer(port)
    return result
}

export const createFindGameServer = () => {
    const port = nextPort()
    const result = FindGameServerHandler.createFindGameServer(port)
    return result
}
