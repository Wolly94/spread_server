import ClientMessage from '../clientMessage'
import WebSocket from 'ws'

class SocketClient<TReceiveMessage, TSenderMessageData> {
    socket: WebSocket
    token: string
    url: string
    onReceiveMessage: null | ((message: TReceiveMessage) => void)

    constructor(toUrl: string, token: string) {
        this.socket = new WebSocket(toUrl + '?token=' + token)
        this.token = token
        this.url = toUrl
        this.onReceiveMessage = null

        this.socket.onopen = () => {
            this.onConnect()
        }
        this.socket.onmessage = (event) => {
            const data: TReceiveMessage = JSON.parse(event.data.toString())
            if (this.onReceiveMessage != null) this.onReceiveMessage(data)
        }
        this.socket.onclose = () => {
            this.onClose()
        }
    }

    close() {
        this.socket.close()
    }

    setReceiver(rec: (message: TReceiveMessage) => void) {
        this.onReceiveMessage = rec
    }

    waitForSocketConnection(callback: () => void) {
        setTimeout(() => {
            if (this.socket.readyState === WebSocket.OPEN) {
                callback()
            } else {
                this.waitForSocketConnection(callback)
            }
        }, 100)
    }

    sendMessageToServer(message: TSenderMessageData) {
        const mData: ClientMessage<TSenderMessageData> = {
            token: this.token,
            data: message,
        }
        const m = JSON.stringify(mData)
        this.waitForSocketConnection(() => {
            this.socket.send(m)
        })
    }

    onConnect() {
        console.log('Now connected')
    }

    onClose() {
        console.log('connection with gameserver closed')
    }
}

export default SocketClient
