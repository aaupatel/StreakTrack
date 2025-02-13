"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Camera, UserCheck } from "lucide-react";

export default function RealtimeAttendance() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastDetection, setLastDetection] = useState<any>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
        startDetection();
      }
    } catch (error) {
      toast.error("Failed to access camera");
      console.error(error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        return canvasRef.current.toDataURL('image/jpeg');
      }
    }
    return null;
  };

  const startDetection = () => {
    const detectFace = async () => {
      if (!isCapturing) return;

      const frame = captureFrame();
      if (frame) {
        try {
          const response = await fetch('/api/face-detection', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: frame })
          });

          if (response.ok) {
            const data = await response.json();
            setLastDetection(data);
            toast.success(`Attendance marked for ${data.name}`);
          }
        } catch (error) {
          console.error('Detection error:', error);
        }
      }

      // Run detection every 5 seconds
      setTimeout(detectFace, 5000);
    };

    detectFace();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Realtime Attendance</h1>
        <Button
          onClick={isCapturing ? stopCamera : startCamera}
          variant={isCapturing ? "destructive" : "default"}
        >
          <Camera className="mr-2 h-4 w-4" />
          {isCapturing ? "Stop Camera" : "Start Camera"}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <p className="text-sm text-gray-500 text-center">
            {isCapturing 
              ? "Camera is active. Face detection runs every 5 seconds." 
              : "Click 'Start Camera' to begin face detection"}
          </p>
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
                <p><strong>Name:</strong> {lastDetection.name}</p>
                <p><strong>Enrollment No:</strong> {lastDetection.enrollmentNo}</p>
                <p><strong>Confidence:</strong> {(lastDetection.confidence * 100).toFixed(2)}%</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No recent detections</p>
          )}
        </Card>
      </div>
    </div>
  );
}