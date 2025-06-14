"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Camera, Power, RefreshCw, Plus, Cctv, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";

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
  organizationId: {
    _id: string;
  };
}

export default function HardwarePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [videoFeedSource, setVideoFeedSource] = useState<string | null>(null);
  const videoFeedRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [selectedOnlineDeviceId, setSelectedOnlineDeviceId] = useState<
    string | null
  >(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastDetection, setLastDetection] = useState<any>(null);
  const [loader, setLoader] = useState(true);

  const form = useForm<z.infer<typeof deviceFormSchema>>({
    resolver: zodResolver(deviceFormSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch("/api/hardware/devices");
      if (!response.ok) throw new Error("Failed to fetch devices");
      const newData = await response.json();
      if (JSON.stringify(newData) !== JSON.stringify(devices)) {
        setDevices(newData);
      }
    } catch (error) {
      toast.error("Failed to fetch devices");
    }
  }, [devices, setDevices]);

  useEffect(() => {
    fetchDevices();
    const interval = setInterval(fetchDevices, 10000);
    return () => clearInterval(interval);
  }, [fetchDevices]);

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

  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      if (typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "live_stream" && data.frame) {
            const base64Data = data.frame;
            setVideoFeedSource(`data:image/jpeg;base64,${base64Data}`);
            setLoader(false);
          } else if ((data.type === "attendance" || data.type === "detected") && data.student) {
            setLastDetection(data.student);
          }
        } catch (error) {
          console.error("Error parsing JSON WebSocket message:", error);
        }
      } else if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => {
          if (
            typeof reader.result === "string" &&
            reader.result.startsWith("data:image/jpeg;base64,")
          ) {
            setVideoFeedSource(reader.result);
            setLoader(false);
          } else {
            console.warn("Received non-image Blob data.");
          }
        };
        reader.readAsDataURL(event.data);
      }
    },
    [setVideoFeedSource]
  );

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.log("Disconnecting WebSocket...");
      wsRef.current.close();
      wsRef.current = null;
    }
    setVideoFeedSource(null);
  }, [wsRef, setVideoFeedSource]);

  const connectWebSocket = useCallback(
    (deviceId: string, organizationId: string) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("WebSocket is already open.");
        return;
      }

      if (wsRef.current) {
        console.log("Websocket is already connected.");
        wsRef.current.onmessage = (event) => {
          handleWebSocketMessage(event);
        };
        return;
      }

      console.log("Connecting WebSocket...");
      disconnectWebSocket();
      try {
        wsRef.current = new WebSocket(
          `ws://localhost:3001?deviceId=${deviceId}&organizationId=${organizationId}&isHardware=false`
        );

        wsRef.current.onopen = () => {
          console.log("WebSocket connected.");
        };

        wsRef.current.onmessage = (event) => {
          handleWebSocketMessage(event);
        };

        wsRef.current.onclose = () => {
          // console.log("WebSocket connection closed.");
          setVideoFeedSource(null);
        };

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error);
          toast.error("Failed to connect to device.");
          setVideoFeedSource(null);
        };
      } catch (error) {
        console.error("WebSocket connection error:", error);
        toast.error("Failed to connect to device.");
        setVideoFeedSource(null);
      }
    },
    [disconnectWebSocket, wsRef, setVideoFeedSource, handleWebSocketMessage]
  );

  useEffect(() => {
    // console.log("Selected device id changed", selectedDeviceId);
    if (selectedDeviceId) {
      const device = devices.find((d) => d._id === selectedDeviceId);
      connectWebSocket(selectedDeviceId, device?.organizationId?._id || "");
    } else {
      disconnectWebSocket();
      setIsStreaming(false);
      setVideoFeedSource(null);
      setLastDetection(null);
    }
  }, [
    selectedDeviceId,
    connectWebSocket,
    fetchDevices,
    devices,
    disconnectWebSocket,
  ]);

  const startStream = () => {
    if (!selectedOnlineDeviceId) {
      toast.error("Please select a device to start the stream.");
      return;
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "start_stream",
          targetDeviceId: selectedOnlineDeviceId,
        })
      );
      setIsStreaming(true);
    } else {
      toast.error("Websocket is not connected");
    }
  };

  const stopStream = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "stop_stream",
          targetDeviceId: selectedOnlineDeviceId,
        })
      );
      setIsStreaming(false);
      setVideoFeedSource(null);
      setLastDetection(null);
    } else {
      toast.error("Websocket is not connected");
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
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
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
                          <Input
                            placeholder="Enter device location"
                            {...field}
                          />
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
                    <p className="text-sm text-gray-500">
                      Location: {device.location}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm ${
                        device.status === "online"
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    >
                      {device.status}
                    </span>
                    <Power
                      className={`h-5 w-5 ${
                        device.status === "online"
                          ? "text-green-500"
                          : "text-red-400"
                      }`}
                    />
                  </div>
                  {device.status === "offline" && device.lastSeen && (
                    <div className="text-xs text-gray-500 mt-1">
                      Last seen: {new Date(device.lastSeen).toLocaleString()}
                    </div>
                  )}
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
          <div className="flex items-center justify-between">
            <h2 className="flex text-lg font-semibold mb-4">
              Realtime Camera
              <Cctv className="ml-2 h-5 w-5" />
            </h2>
            {devices.filter((device) => device.status === "online").length >
            0 ? (
              <div className="flex gap-2">
                <Select
                  onValueChange={(value) => {
                    setSelectedOnlineDeviceId(value);
                    setSelectedDeviceId(value);
                    connectWebSocket(
                      value,
                      devices.find((d) => d._id === value)?.organizationId
                        ?._id || ""
                    );
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Online Device" />
                  </SelectTrigger>
                  <SelectContent>
                    {devices
                      .filter((device) => device.status === "online")
                      .map((device) => (
                        <SelectItem key={device._id} value={device._id}>
                          {device.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  disabled={!selectedOnlineDeviceId}
                  onClick={isStreaming ? stopStream : startStream}
                  variant={isStreaming ? "destructive" : "default"}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isStreaming ? "Stop Stream" : "Start Stream"}
                </Button>
              </div>
            ) : (
              <p>No online devices</p>
            )}
          </div>
          {isStreaming ? (
            <div className="flex flex-col gap-4">
              <div
                id="video-feed"
                className="bg-gray-100 w-full rounded-md space-y-4 overflow-hidden"
                ref={videoFeedRef}
              >
                {loader ? (
                  <div className="flex justify-center items-center w-full h-full">
                    Spinner
                    <div className="loader"></div>
                  </div>
                ) : (
                  videoFeedSource && (
                    <div className="relative w-full h-full">
                      <Image
                        src={videoFeedSource}
                        alt="Camera Feed"
                        width={100}
                        height={100}
                        style={{ width: "100%", height: "auto" }}
                      />
                    </div>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Last Detection</h2>
        {lastDetection ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-green-600">
              <UserCheck className="h-5 w-5" />
              <span>Student Detected</span>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {lastDetection.name}
              </p>
              <p>
                <strong>Enrollment No:</strong> {lastDetection.enrollmentNo}
              </p>
              <p>
                <strong>Confidence:</strong>{" "}
                {/* {(lastDetection.confidence * 100).toFixed(2)}% */}
              </p>
              {lastDetection.timestamp && (
                <p>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(lastDetection.timestamp).toLocaleString()}
                </p>
              )}
              {lastDetection.deviceId && (
                <p>
                  <strong>Device ID:</strong> {lastDetection.deviceId}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No recent detections</p>
        )}
      </Card>
      {/* <Card className="p-6">
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
      </Card> */}
    </div>
  );
}
