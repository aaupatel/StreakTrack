"use client";

import { useRef, useState } from "react";
import Webcam from "react-webcam";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SwitchCamera } from "lucide-react";

interface CameraCaptureDialogProps {
  open: boolean;
  onClose: () => void;
  onCapture: (image: string) => void;
}

export default function CameraCaptureDialog({
  open,
  onClose,
  onCapture,
}: CameraCaptureDialogProps) {
  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [camError, setCamError] = useState<string | null>(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="p-4">
        <DialogHeader>
          <DialogTitle>Camera</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode,
            }}
            onUserMediaError={(err) => {
              console.error(err);
              setCamError(
                err instanceof DOMException ? err.message : String(err)
              );
            }}
            className="rounded-lg border border-black"
          />
          {camError && (
            <p className="text-red-600 text-sm mt-2">
              {camError.includes("Only secure origins")
                ? "Camera blocked: open page via HTTPS or localhost."
                : camError}
            </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setFacingMode((prev) =>
                  prev === "user" ? "environment" : "user"
                )
              }
              className="flex flex-row md:hidden"
            >
              <SwitchCamera className="mr-2 h-5 w-5" />
              Switch Camera
            </Button>
            <Button onClick={capture}>Capture</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
