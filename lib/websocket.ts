import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { parse } from 'url';
import { verify } from 'jsonwebtoken';

let wss: WebSocketServer;

export function initWebSocket(server: HTTPServer) {
  wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', async (request, socket, head) => {
    const { pathname, query } = parse(request.url!, true);

    if (pathname === '/api/ws') {
      try {
        // Verify authentication token
        const token = query.token as string;
        if (!token) {
          socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
          socket.destroy();
          return;
        }

        const decoded = verify(token, process.env.JWT_SECRET!);
        
        wss.handleUpgrade(request, socket, head, (ws) => {
          ws.organizationId = (decoded as any).organizationId;
          wss.emit('connection', ws);
        });
      } catch (error) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    }
  });

  wss.on('connection', (ws: any) => {
    console.log(`Client connected to organization: ${ws.organizationId}`);

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        broadcastToOrganization(ws.organizationId, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log(`Client disconnected from organization: ${ws.organizationId}`);
    });
  });
}

export function broadcastToOrganization(organizationId: string, data: any) {
  wss.clients.forEach((client: any) => {
    if (client.organizationId === organizationId) {
      client.send(JSON.stringify(data));
    }
  });
}