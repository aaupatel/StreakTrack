import { NextResponse } from "next/server";
import { WebSocketServer, WebSocket } from "ws";
import Device from "@/models/Device";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import { ObjectId } from "mongodb";
import Attendance from "@/models/Attendance";

let wss: WebSocketServer | null = null;
const hardwareClients = new Map<string, WebSocket>(); // Hardware connections
const frontendClients = new Map<WebSocket, string | null>(); // Frontend connections (deviceId can be null initially)

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
        console.log("Hardware connection rejected: Missing deviceId.");
        ws.send(JSON.stringify({ error: "Missing deviceId" }));
        ws.close(1003, "Missing deviceId");
        return;
      }
      if (!organizationId) {
        console.log(`Hardware ${deviceId} connection rejected: Missing organizationId.`);
        ws.send(JSON.stringify({ error: "Missing organizationId" }));
        ws.close(1003, "Missing organizationId");
        return;
      }

      if (isHardware === "true") {
        // Hardware Device Connection
        
        if (hardwareClients.has(deviceId)) {
          console.log(`Hardware ${deviceId} tried to connect but is already connected.`);
          ws.send(JSON.stringify({ error: `Device ${deviceId} is already connected.` }));
          ws.close(1003, `Device ${deviceId} already connected`);
          return;
        }

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
      } else if (isHardware === "false") {
        // Frontend Page Connection
        frontendClients.set(ws, deviceId || null); // Associate with deviceId if provided
        console.log(`Frontend Page connected${deviceId ? ` (initially for device ${deviceId})` : ''}`);
      } else {
        // Undefined connection type
        console.log(`Unknown client tried to connect: URL=${req.url}`);
        ws.send(JSON.stringify({ error: "Invalid connection parameters" }));
        ws.close(1002, "Invalid connection parameters");
        return;
      }

      ws.on("close", async () => {
        if (isHardware === "true" && deviceId) {
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
        } else if (isHardware === "false") {
          frontendClients.delete(ws);
          console.log(`Frontend Page disconnected${deviceId ? ` (associated with device ${deviceId})` : ''}`);
        } else {
          frontendClients.delete(ws);
          console.log(`Unknown client disconnected: URL=${req.url}`);
        }
      });

      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message.toString());
          const senderDeviceId = deviceId; // The deviceId of the sender

          if (data.type === "start_stream" || data.type === "stop_stream") {
            const targetDeviceId = data.targetDeviceId;
            const hardwareSocket = hardwareClients.get(targetDeviceId);
            if (hardwareSocket && hardwareSocket.readyState === WebSocket.OPEN) {
              hardwareSocket.send(JSON.stringify(data));
              console.log(`Backend: Forwarded '${data.type}' command from frontend to hardware ${targetDeviceId}`);
            } else {
              console.log(`Backend: Hardware device ${targetDeviceId} not connected or not open for stream command.`);
              // Optionally, send an error back to the frontend
              frontendClients.forEach((clientDeviceId, clientWs) => {
                if (clientDeviceId === senderDeviceId && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ error: `Device ${targetDeviceId} is offline or not connected.` }));
                }
              });
            }
          } else if (data.type === "attendance") {
            const hardwareSocket = hardwareClients.get(senderDeviceId); // Attendance from hardware

            // Save attendance data to the database
            connectDB().then(async () => {
              try {
                const { studentId, timestamp } = data.student;
                const attendanceDate = new Date(timestamp);
                if (studentId && timestamp) {
                  const newAttendance = new Attendance({
                    deviceId: senderDeviceId,
                    studentId: studentId,
                    timestamp: new Date(timestamp),
                    date: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate()), // Set the 'date' field
                    status: 'present', // Directly set status to 'present'
                    method: 'automatic', // Directly set method to 'automatic'
                    organizationId,
                  });
                  await newAttendance.save();
                  console.log(`Backend: Attendance saved for student ${studentId} at ${timestamp}`);
                } else {
                  console.error(`Backend: Incomplete attendance data received from ${senderDeviceId}:`, data.student);
                }
              } catch (error) {
                console.error(`Backend: Error saving attendance data:`, error);
              }
            })
            // Forward attendance to all connected frontends for this device
            frontendClients.forEach((clientDeviceId, clientWs) => {
              if (clientDeviceId === senderDeviceId && clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify(data));
              }
            });
            console.log(`Backend: Received attendance from hardware ${senderDeviceId}:`, data);
          } else if (hardwareClients.has(senderDeviceId)) { // Message from hardware (live_stream)
            if (data.type === "live_stream" && data.frame) {
              // Forward live stream data to all frontends connected to this hardware
              frontendClients.forEach((clientDeviceId, clientWs) => {
                if (clientDeviceId === senderDeviceId && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify(data));
                }
              });
            } else {
              console.log(`Backend: Received message from hardware ${senderDeviceId}:`, data);
            }
          } else if (frontendClients.get(ws) && senderDeviceId) { // Message from a frontend associated with a device
            console.log(`Backend: Received message from frontend (for device ${senderDeviceId}):`, data);
            // Handle messages from frontend to control hardware if needed
            const hardwareSocket = hardwareClients.get(senderDeviceId);
            if (hardwareSocket && hardwareSocket.readyState === WebSocket.OPEN) {
              hardwareSocket.send(JSON.stringify(data));
            } else {
              console.log(`Backend: Hardware device ${senderDeviceId} not available to receive frontend command.`);
            }
          } else {
            console.log(`Backend: Received message from an unidentified client:`, data);
          }
        } catch (error) {
          console.error(`Backend: Error parsing message:`, error);
        }
      });

      ws.on("error", (error) => {
        console.error(`WebSocket error for ${isHardware === "true" ? `device ${deviceId}` : 'client'}:`, error);
      });
    });
  }

  return NextResponse.json({ success: true });
}