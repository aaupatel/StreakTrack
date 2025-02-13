import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { WebSocketServer } from "ws";

let wss: WebSocketServer | null = null;

export function GET(request: Request) {
  const session = getServerSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Upgrade the HTTP connection to WebSocket
  if (!wss) {
    wss = new WebSocketServer({ noServer: true });
    
    // Handle WebSocket connections
    wss.on("connection", (ws) => {
      ws.on("message", (message) => {
        // Broadcast messages to all connected clients
        wss?.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
          }
        });
      });
    });
  }

  // Return upgrade response
  const { socket, response } = Deno.upgradeWebSocket(request);
  return response;
}