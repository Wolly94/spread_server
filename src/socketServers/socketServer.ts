import WebSocket from 'ws'

interface CreateSocketResponse {
    url: string
}

abstract class SocketServer<TSenderMessage, TReceiverMessage> {
    socket: WebSocket.Server
    url: string
    tokenClients: Map<string, WebSocket>

    // later allow connecting other players and read data like skills accordingly
    constructor(port: number) {
        //const port = nextPort()
        this.socket = new WebSocket.Server({ port: port })
        this.url = 'ws://localhost:' + port.toString() + '/'
        this.tokenClients = new Map()
    }

    // socket now accepts connections from clients
    open() {
        this.socket.on('connection', (socketClient, req) => {
            const token = req.url?.replace('/?token=', '')
            if (token != undefined) {
                if (this.tokenClients.has(token)) {
                    const cli = this.tokenClients.get(token)
                    if (cli != undefined) {
                        cli.close()
                    }
                    this.tokenClients.set(token, socketClient)
                }
                // gets fired when server receives message from client
                socketClient.on('message', (message) => {
                    const m: TReceiverMessage = JSON.parse(
                        message.valueOf().toString(),
                    )
                    this.onReceiveMessage(socketClient, m, token)
                })
                // gets fired on close
                socketClient.on('close', () => {
                    this.onDisconnect(socketClient)
                })
                this.onConnect(socketClient, token)
            } else {
                socketClient.close()
            }
        })
    }

    sendMessageToClients(message: TSenderMessage) {
        const json = JSON.stringify(message)
        this.socket.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(json)
            }
        })
    }

    abstract onReceiveMessage(
        client: WebSocket,
        message: TReceiverMessage,
        token: string,
    ): void

    onConnect(client: WebSocket, token: string) {
        //this.latestPlayerId += 1
        //this.playerTokens.set(token, this.latestPlayerId)
        console.log('connected with url: ', client.url)
        console.log('client Set length: ', this.socket.clients.size)
    }

    onDisconnect(client: WebSocket) {
        console.log('closed')
        console.log('Number of clients: ', this.socket.clients.size)
    }
}

export default SocketServer