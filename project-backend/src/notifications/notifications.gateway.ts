import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*'}})
export class NotificationsGateway {
    @WebSocketServer()
    server: Server    

    sendNotification(userId: string, message: string) {
        this.server.to(userId).emit('notification', message);
    }
    
    @SubscribeMessage('join')
    handleJoin(@MessageBody() userId: string) {
        this.server.socketsJoin(userId);
        const welcomeMessage = "Welcome to the task management system!";
        this.sendNotification(userId, welcomeMessage);
    }

}