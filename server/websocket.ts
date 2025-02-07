import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface Client {
  ws: WebSocket;
  userId: number;
}

export function setupWebSocket(wss: WebSocketServer) {
  const clients = new Set<Client>();

  wss.on("connection", (ws) => {
    ws.on("message", async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === "auth") {
          clients.add({ ws, userId: message.userId });
          return;
        }

        // Broadcast message to all connected clients
        clients.forEach((client) => {
          if (client.ws.readyState === WebSocket.OPEN) {
            client.ws.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      clients.forEach((client) => {
        if (client.ws === ws) {
          clients.delete(client);
        }
      });
    });
  });
}
