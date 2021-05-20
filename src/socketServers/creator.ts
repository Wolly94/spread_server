import FindGameServerHandler from './findGameServerHandler'
import SpreadGameServer from './GameServer/gameServer'
import AllGameServerHandler from './gameServerHandler'

export const createGameServer = () => {
    const resp = AllGameServerHandler.createGameServer()
    return resp
}

export const createFindGameServer = () => {
    if (FindGameServerHandler.findGameServer !== null) return null
    const port = 3030
    const result = FindGameServerHandler.createFindGameServer(port)
    return result
}
