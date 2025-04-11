import { NextResponse } from "next/server";
import { WebSocketServer, WebSocket } from "ws";
import Device from "@/models/Device";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { ObjectId } from "mongodb";

let wss: WebSocketServer | null = null;
const hardwareClients = new Map<string, WebSocket>(); // Hardware connections
const frontendClients = new Map<WebSocket, string>(); // Frontend connections

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
        frontendClients.set(ws, deviceId);
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
          frontendClients.delete(ws);
          console.log(`Frontend Page for device ${deviceId} disconnected`);
        }
      });

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          const senderDeviceId = deviceId; // The deviceId of the sender

          if (data.type === "start_stream" || data.type === "stop_stream") {
            const targetDeviceId = data.targetDeviceId;
            const hardwareSocket = hardwareClients.get(targetDeviceId);
            if (hardwareSocket && hardwareSocket.readyState === WebSocket.OPEN) {
              hardwareSocket.send(JSON.stringify(data));
              console.log(`Backend: Forwarded '${data.type}' command to hardware ${targetDeviceId}`);
            } else {
              console.log(`Backend: Hardware device ${targetDeviceId} not connected or not open.`);
              // No need to send error to frontend here, the UI handles it
            }
          } else if (data.type === "attendance") {
            const hardwareSocket = hardwareClients.get(senderDeviceId); // Attendance from hardware
            // Forward attendance to all connected frontends for this device
            frontendClients.forEach((clientDeviceId, clientWs) => {
              if (clientDeviceId === senderDeviceId && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify(data));
              }
            });
          } else if (hardwareClients.has(senderDeviceId)) { // Message from hardware (live_stream)
            if (data.type === "live_stream" && data.frame) {
              // Forward live stream data to all frontends connected to this hardware
              frontendClients.forEach((clientDeviceId, clientWs) => {
                if (clientDeviceId === senderDeviceId && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify(data));
                }
              });
            } else {
              console.log(`Backend: Received JSON from hardware ${senderDeviceId}:`, data);
            }
          } else {
            console.log(`Backend: Received message from frontend ${senderDeviceId}:`, data);
          }
        } catch (error) {
          console.error(`Backend: Error parsing message:`, error);
        }
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for device ${deviceId}:`, error);
      });
    });
  }

  return NextResponse.json({ success: true });
}