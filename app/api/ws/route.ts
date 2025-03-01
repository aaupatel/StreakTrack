import { NextResponse } from "next/server";
import { WebSocketServer, WebSocket } from "ws";
import Device from "@/models/Device";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";

let wss: WebSocketServer | null = null;
const clients = new Map<string, WebSocket>();

export async function GET(request: Request) {
  console.log("WebSocket server running on port 3001");

  if (!wss) {
    wss = new WebSocketServer({ port: 3001 });

    wss.on("connection", (ws, req) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const deviceId = url.searchParams.get("deviceId");
      const organizationId = url.searchParams.get("organizationId");

      if (!deviceId) {
        ws.close(1003, "Missing deviceId");
        return;
      }

      if (!organizationId) {
        ws.close(1003, "Missing organizationId");
        return;
      }

      clients.set(deviceId, ws);
      console.log(`Device ${deviceId} connected`);

      connectDB().then(async () => {
        try {
          await Device.findOneAndUpdate(
            { _id: deviceId },
            { status: "online" }
          );
          console.log(`Device ${deviceId} status updated to online.`);

          // Fetch and send student data
          const students = await Student.find(
            { organizationId: organizationId },
            "_id name enrollmentNo images" // Select only the desired fields
          );
          
          console.log(JSON.stringify({ students: students }));
          ws.send(JSON.stringify({ students: students })); // Send data as JSON
        } catch (error) {
          console.error(`Error updating device ${deviceId} status or fetching students:`, error);
          ws.send(JSON.stringify({ error: "Error fetching data" }));
        }
      });

      ws.on("close", async () => {
        clients.delete(deviceId);
        console.log(`Device ${deviceId} disconnected`);

        connectDB().then(async () => {
          try {
            await Device.findOneAndUpdate(
              { _id: deviceId },
              { status: "offline" }
            );
            console.log(`Device ${deviceId} status updated to offline.`);
          } catch (error) {
            console.error(`Error updating device ${deviceId} status:`, error);
          }
        });
      });

      ws.on("message", (message) => {
        console.log(`Received message from ${deviceId}: ${message}`);
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for device ${deviceId}:`, error);
      });
    });
  }

  return NextResponse.json({ success: true });
}