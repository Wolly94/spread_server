import WebSocket from 'ws'
import ClientMessage from '../shared/clientMessage'
import FindGameClientMessageData from '../shared/findGame/findGameClientMessages'
import FindGameServerMessage, {
    OpenGame,
    OpenGamesMessage,
} from '../shared/findGame/findGameServerMessages'
import GameServerHandler from './gameServerHandler'
import SocketServer from './socketServer'

class FindGameServer extends SocketServer<
    FindGameServerMessage,
    ClientMessage<FindGameClientMessageData>
> {
    updateClients() {
        const openGames = GameServerHandler.getGameServers().map(
            (gameServer, index) => {
                const result: OpenGame = gameServer.toOpenGame()
                return result
            },
        )
        const message: OpenGamesMessage = {
            type: 'opengames',
            data: openGames,
        }
        this.sendMessageToClients(message)
    }
    onConnect(client: WebSocket, token: string) {}
    onDisconnect(client: WebSocket, token: string) {}
    onReceiveMessage(
        client: WebSocket,
        message: ClientMessage<FindGameClientMessageData>,
        token: string,
    ) {
        if (message.data.type == 'joingame') {
            // TODO
        }
    }
}

export default FindGameServer
