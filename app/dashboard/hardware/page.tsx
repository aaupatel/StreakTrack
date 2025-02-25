"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Camera,
  Wifi,
  Power,
  RefreshCw,
  Plus,
  Terminal
} from "lucide-react";

const deviceFormSchema = z.object({
  name: z.string().min(2, "Device name is required"),
  location: z.string().min(2, "Device location is required"),
});

interface Device {
  _id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  lastSeen?: string;
}

export default function HardwarePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof deviceFormSchema>>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch("/api/hardware/devices");
      if (!response.ok) throw new Error("Failed to fetch devices");
      const data = await response.json();
      setDevices(data);
    } catch (error) {
      toast.error("Failed to fetch devices");
    }
  };

  const onSubmit = async (values: z.infer<typeof deviceFormSchema>) => {
    setLoading(true);
    try {
      const response = await fetch("/api/hardware/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to add device");

      toast.success("Device added successfully");
      form.reset();
      setDialogOpen(false);
      fetchDevices();
    } catch (error) {
      toast.error("Failed to add device");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Hardware Devices</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDevices}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Device</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Device Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter device location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Adding..." : "Add Device"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Device Status</h2>
          <div className="space-y-4">
            {devices.map((device) => (
              <div
                key={device.name}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Camera className="h-6 w-6 text-gray-400" />
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-gray-500">ID: {device._id}</p>
                    <p className="text-sm text-gray-500">Location: {device.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Wifi className={`h-5 w-5 ${
                      device.status === "online" ? "text-green-500" : "text-gray-400"
                    }`} />
                    <span className={`text-sm ${
                      device.status === "online" ? "text-green-500" : "text-gray-500"
                    }`}>
                      {device.status}
                    </span>
                  </div>
                  <Power className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))}
            {devices.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                No devices registered
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">1. Hardware Requirements</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>Raspberry Pi (3 or newer)</li>
                <li>Pi Camera Module</li>
                <li>Internet Connection</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">2. Installation Steps</h3>
              <ul className="list-disc list-inside text-sm text-gray-600">
                <li>Connect the camera module</li>
                <li>Configure network settings</li>
                <li>Install required software</li>
                <li>Set up the connection</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Raspberry Pi Code</h2>
          <Button variant="outline" size="sm">
            <Terminal className="h-4 w-4 mr-2" />
            Copy Code
          </Button>
        </div>
        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            <code>{`# Python code for Raspberry Pi
import RPi.GPIO as GPIO
import cv2
import requests
import time
import websockets
import asyncio
import json

# Configuration
API_URL = "${process.env.NEXT_PUBLIC_APP_URL}/api"
DEVICE_ID = "your_device_id"
API_KEY = "your_api_key"

async def connect_websocket():
    uri = f"ws://{API_URL}/ws?token={API_KEY}&deviceId={DEVICE_ID}"
    async with websockets.connect(uri) as websocket:
        while True:
            try:
                # Send heartbeat
                await websocket.send(json.dumps({
                    "type": "heartbeat",
                    "deviceId": DEVICE_ID
                }))
                
                # Process face detection
                if detect_face():
                    await websocket.send(json.dumps({
                        "type": "detection",
                        "deviceId": DEVICE_ID,
                        "timestamp": time.time()
                    }))
                
                await asyncio.sleep(5)
            except Exception as e:
                print(f"Error: {e}")
                break

def detect_face():
    # Implement face detection logic
    return True

async def main():
    while True:
        try:
            await connect_websocket()
        except Exception as e:
            print(f"Connection error: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(main())`}</code>
          </pre>
        </div>
      </Card> */}
    </div>
  );
}