import FindGameServerHandler from './findGameServerHandler'
import SpreadGameServer from './GameServer/gameServer'
import GameServerHandler from './gameServerHandler'

export const createGameServer = () => {
    const resp = GameServerHandler.createGameServer()
    return resp
}

export const createFindGameServer = () => {
    if (FindGameServerHandler.findGameServer === null) return null
    const port = 3030
    const result = FindGameServerHandler.createFindGameServer(port)
    return result
}
