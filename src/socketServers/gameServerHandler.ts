import FindGameServerHandler from './findGameServerHandler'
import SpreadGameServer from './GameServer/gameServer'

class GameServerHandler {
    static runningGameServers: SpreadGameServer[] = []
    static addRunningGameServer = (gameServer: SpreadGameServer) => {
        GameServerHandler.runningGameServers.push(gameServer)
        FindGameServerHandler.findGameServer?.updateClients()
    }

    static getGameServers = () => {
        return GameServerHandler.runningGameServers
    }

    static createGameServer = (port: number) => {
        const gameServer = new SpreadGameServer(port)
        gameServer.open()
        gameServer.lobbyToInGame()
        GameServerHandler.addRunningGameServer(gameServer)
        return gameServer.creationResponse()
    }

    static shutDown = (port: number) => {
        const index = GameServerHandler.runningGameServers.findIndex(
            (gs) => gs.port === port,
        )
        if (index >= 0) GameServerHandler.runningGameServers.splice(index, 1)

        FindGameServerHandler.findGameServer?.updateClients()
    }
}

export default GameServerHandler
