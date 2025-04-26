import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // Cho phép từ frontend
  },
})
export class TasksGateway {
  @WebSocketServer()
  server: Server;

  esendNewComment(taskId: number, comment: any) {
    this.server.emit('new_comment', { taskId, comment });
  }
}
