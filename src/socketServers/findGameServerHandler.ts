import FindGameServer from './findGameServer'

class FindGameServerHandler {
    static findGameServer: FindGameServer | null = null
    static getUrlResponse = () => {
        if (FindGameServerHandler.findGameServer != null) {
            return FindGameServerHandler.findGameServer.creationResponse()
        } else {
            return { url: null }
        }
    }
    static createFindGameServer = (port: number) => {
        const findGameServer = new FindGameServer(port)
        findGameServer.open()
        FindGameServerHandler.findGameServer = findGameServer
        return findGameServer.creationResponse()
    }
}

export default FindGameServerHandler
