import FindGameServerHandler from './findGameServerHandler'
import SpreadGameServer from './GameServer/gameServer'

class AllGameServerHandler {
    static gameServers: Array<[number, SpreadGameServer | null]> = Array.from(
        { length: 10 },
        (_, i) => [i + 3031, null],
    )

    static getGameServers = () => {
        const gss = AllGameServerHandler.gameServers
            .map((val) => val[1])
            .filter((gs): gs is SpreadGameServer => gs !== null)
        return gss
    }

    static createGameServer = () => {
        const index = AllGameServerHandler.gameServers.findIndex(
            (val) => val[1] === null,
        )
        if (index >= 0) {
            const port = AllGameServerHandler.gameServers[index][0]
            const gameServer = new SpreadGameServer(port)
            gameServer.open()
            AllGameServerHandler.gameServers[index] = [port, gameServer]
            return gameServer.creationResponse()
        } else return null
    }

    static shutDown = (port: number) => {
        const index = AllGameServerHandler.gameServers.findIndex(
            (gs) => gs[0] === port,
        )
        if (index >= 0) {
            AllGameServerHandler.gameServers[index][1]?.shutdown()
            AllGameServerHandler.gameServers[index][1] = null
        }

        FindGameServerHandler.findGameServer?.updateClients()
    }
}

export default AllGameServerHandler
