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
        GameServerHandler.addRunningGameServer(gameServer)
        gameServer.open()
        gameServer.lobbyToInGame()
        return gameServer.creationResponse()
    }
}

export default GameServerHandler
