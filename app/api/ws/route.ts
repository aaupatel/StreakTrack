import { NextResponse } from "next/server";
import { WebSocketServer, WebSocket } from "ws";
import Device from "@/models/Device";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { ObjectId } from "mongodb";

let wss: WebSocketServer | null = null;
const hardwareClients = new Map<string, WebSocket>(); // Hardware connections
const frontendClients = new Map<string, WebSocket>(); // Frontend connections

export async function GET(request: Request) {
  console.log("WebSocket server running on port 3001");

  if (!wss) {
    wss = new WebSocketServer({ port: 3001 });

    wss.on("connection", (ws, req) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const deviceId = url.searchParams.get("deviceId");
      const organizationId = url.searchParams.get("organizationId");
      const isHardware = url.searchParams.get("isHardware");
      
      if (!deviceId) {
        ws.close(1003, "Missing deviceId");
        return;
      }
      
      if (!organizationId) {
        ws.close(1003, "Missing organizationId");
        return;
      }
      
      if (isHardware === "true") {
        // Hardware Device Connection
        hardwareClients.set(deviceId, ws);
        console.log(`Hardware Device ${deviceId} connected`);

        connectDB().then(async () => {
          try {
            await Device.findOneAndUpdate({ _id: deviceId }, { status: "online" });
            console.log(`Device ${deviceId} status updated to online.`);

            if (!ObjectId.isValid(organizationId)) {
              console.error(
                `Invalid organizationId ${organizationId} for device ${deviceId}`
              );
              ws.send(JSON.stringify({ error: "Invalid organizationId" }));
              return;
            }

            const students = await Student.find(
              { organizationId: organizationId },
              "_id name enrollmentNo images"
            );
            ws.send(JSON.stringify({ students: students }));
          } catch (error) {
            console.error(
              `Error updating device ${deviceId} status or fetching students:`,
              error
            );
            ws.send(JSON.stringify({ error: "Error fetching data" }));
          }
        });
      } else {
        // Frontend Page Connection
        frontendClients.set(deviceId, ws);
        console.log(`Frontend Page connected to device ${deviceId}`);
      }

      ws.on("close", async () => {
        if (isHardware === "true") {
          hardwareClients.delete(deviceId);
          console.log(`Hardware Device ${deviceId} disconnected`);

          connectDB().then(async () => {
            try {
              await Device.findOneAndUpdate({ _id: deviceId }, { status: "offline" });
              console.log(`Device ${deviceId} status updated to offline.`);
            } catch (error) {
              console.error(`Error updating device ${deviceId} status:`, error);
            }
          });
        } else {
          frontendClients.delete(deviceId);
          console.log(`Frontend Page for device ${deviceId} disconnected`);
        }
      });

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          const hardwareSocket = hardwareClients.get(deviceId);
          const frontendSocket = frontendClients.get(deviceId);

          if (hardwareSocket && data.type === "start_stream" || data.type === "stop_stream") {
            hardwareSocket.send(message.toString());
          } else if (hardwareSocket && frontendSocket && data.type === "live_stream") {
            // Forward live stream data from hardware to frontend
            frontendSocket.send(message.toString());
          } else {
            console.log(`Received message from ${deviceId}: ${message}`);
          }

        } catch (error) {
          console.error(`Error parsing message from ${deviceId}:`, error);
        }
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for device ${deviceId}:`, error);
      });
    });
  }

  return NextResponse.json({ success: true });
}