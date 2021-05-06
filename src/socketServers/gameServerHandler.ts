import FindGameServerHandler from './findGameServerHandler'
import SpreadGameServer from './GameServer/gameServer'

class GameServerHandler {
    static gameServers: Array<[number, SpreadGameServer | null]> = Array.from(
        { length: 10 },
        (_, i) => [i + 3031, null],
    )

    static getGameServers = () => {
        const gss = GameServerHandler.gameServers
            .map((val) => val[1])
            .filter((gs): gs is SpreadGameServer => gs !== null)
        return gss
    }

    static createGameServer = () => {
        const index = GameServerHandler.gameServers.findIndex(
            (val) => val[1] === null,
        )
        if (index >= 0) {
            const port = GameServerHandler.gameServers[index][0]
            const gameServer = new SpreadGameServer(port)
            gameServer.open()
            gameServer.lobbyToInGame()
            GameServerHandler.gameServers[index] = [port, gameServer]
            return gameServer.creationResponse()
        } else return null
    }

    static shutDown = (port: number) => {
        const index = GameServerHandler.gameServers.findIndex(
            (gs) => gs[0] === port,
        )
        if (index >= 0) {
            GameServerHandler.gameServers[index][1]?.shutdown()
            GameServerHandler.gameServers[index][1] = null
        }

        FindGameServerHandler.findGameServer?.updateClients()
    }
}

export default GameServerHandler
