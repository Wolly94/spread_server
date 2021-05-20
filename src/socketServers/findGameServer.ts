import ClientMessage from 'spread_game/dist/messages/clientMessage'
import FindGameClientMessageData from 'spread_game/dist/messages/findGame/findGameClientMessages'
import FindGameServerMessage, {
    OpenGame,
    OpenGamesMessage,
} from 'spread_game/dist/messages/findGame/findGameServerMessages'
import WebSocket from 'ws'
import AllGameServerHandler from './gameServerHandler'
import SocketServer from './socketServer'

class FindGameServer extends SocketServer<
    FindGameServerMessage,
    ClientMessage<FindGameClientMessageData>
> {
    updateClients() {
        this.sendMessageToClients(this.getUpdateMessage())
    }
    getUpdateMessage() {
        const openGames = AllGameServerHandler.getGameServers().map(
            (gameServer, index) => {
                const result: OpenGame = gameServer.toOpenGame()
                return result
            },
        )
        const message: OpenGamesMessage = {
            type: 'opengames',
            data: openGames,
        }
        return message
    }
    onConnect(client: WebSocket, token: string) {
        this.sendMessageToClient(client, this.getUpdateMessage())
    }
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
