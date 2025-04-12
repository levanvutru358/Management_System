import { ConnectedSocket, OnGatewayConnection, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { Server } from "socket.io";

@WebSocketGateway({ cors: true})
export class NotificationsGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server    

    handleConnection(client: Socket, message: string) {
        const userId = Number(client.handshake.query.userId)
        if(userId && !isNaN(userId)) {
            client.join(userId.toString())
            const message = `User ${userId} connected and joined room`
        } else {
            const message = `Invalid or missing user ${userId} in query`
        }
    }

    sendNotification(name: string, message: string) {
        this.server.to(name).emit('Notification', {message})
    }

}