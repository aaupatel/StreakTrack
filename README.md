# StreakTrack - Attendance Management System

StreakTrack is a modern face detection-based attendance management system designed for educational institutions and businesses. It uses advanced face detection technology to automate attendance tracking and provides comprehensive management features.

## Features

- 🎯 Face Detection-based Attendance
- 👥 Student/Employee Management
- 📊 Real-time Attendance Tracking
- 📱 Hardware Device Integration
- 📈 Analytics and Reports
- 👨‍💼 Multi-level Administration (Admin, Co-Admin)
- 🔐 Secure Authentication
- 📧 Email Notifications

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, shadcn/ui
- **Face Detection**: TensorFlow.js
- **Hardware Integration**: Raspberry Pi, Python

## Prerequisites

- Node.js 18.x or higher
- MongoDB Database
- Gmail Account (for email notifications)
- Raspberry Pi (for hardware setup)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/streak-track.git
   cd streak-track
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Hardware Setup (Raspberry Pi)

1. Install required Python packages:
   ```bash
   pip install opencv-python websockets requests numpy
   ```

2. Create a new file `attendance_device.py`:
   ```python
   import cv2
   import websockets
   import asyncio
   import json
   import requests
   import time
   from datetime import datetime

   # Configuration
   API_URL = "your_api_url"
   DEVICE_ID = "your_device_id"
   API_KEY = "your_api_key"
   BATCH_SIZE = 10
   INTERVAL = 5  # seconds

   class AttendanceDevice:
       def __init__(self):
           self.face_cascade = cv2.CascadeClassifier(
               cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
           )
           self.camera = cv2.VideoCapture(0)
           self.attendance_buffer = []

       async def connect_websocket(self):
           uri = f"ws://{API_URL}/api/ws?token={API_KEY}&deviceId={DEVICE_ID}"
           async with websockets.connect(uri) as websocket:
               while True:
                   try:
                       # Send heartbeat
                       await websocket.send(json.dumps({
                           "type": "heartbeat",
                           "deviceId": DEVICE_ID
                       }))
                       
                       # Process face detection
                       detections = self.detect_faces()
                       if detections:
                           self.attendance_buffer.extend(detections)
                       
                       # Send batch if buffer is full
                       if len(self.attendance_buffer) >= BATCH_SIZE:
                           await self.send_attendance_batch()
                       
                       await asyncio.sleep(INTERVAL)
                   except Exception as e:
                       print(f"Error: {e}")
                       break

       def detect_faces(self):
           ret, frame = self.camera.read()
           if not ret:
               return []

           gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
           faces = self.face_cascade.detectMultiScale(
               gray, scaleFactor=1.1, minNeighbors=5
           )

           detections = []
           for (x, y, w, h) in faces:
               face_roi = frame[y:y+h, x:x+w]
               # Here you would implement face recognition
               # For demo, we'll simulate a detection
               detections.append({
                   "timestamp": datetime.now().isoformat(),
                   "deviceId": DEVICE_ID
               })

           return detections

       async def send_attendance_batch(self):
           if not self.attendance_buffer:
               return

           try:
               response = requests.post(
                   f"{API_URL}/api/hardware/attendance",
                   headers={
                       "Content-Type": "application/json",
                       "x-api-key": API_KEY
                   },
                   json={"records": self.attendance_buffer}
               )
               
               if response.status_code == 200:
                   self.attendance_buffer = []
               else:
                   print(f"Failed to send attendance: {response.text}")
           except Exception as e:
               print(f"Error sending attendance: {e}")

       def cleanup(self):
           self.camera.release()

   async def main():
       device = AttendanceDevice()
       try:
           while True:
               try:
                   await device.connect_websocket()
               except Exception as e:
                   print(f"Connection error: {e}")
                   await asyncio.sleep(5)
       finally:
           device.cleanup()

   if __name__ == "__main__":
       asyncio.run(main())
   ```

3. Run the device script:
   ```bash
   python attendance_device.py
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |
| `NEXTAUTH_SECRET` | JWT secret key | Yes |
| `NEXTAUTH_URL` | Authentication URL | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `EMAIL_USER` | Gmail address | Yes |
| `EMAIL_PASS` | Gmail app password | Yes |
| `HARDWARE_API_KEY` | API key for hardware devices | Yes |
| `HARDWARE_DEVICE_INTERVAL` | Device data sending interval | No |
| `MAX_BATCH_SIZE` | Max attendance records per batch | No |

## API Routes

### Authentication
- `POST /api/auth/register` - Register new organization
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address

### Members
- `GET /api/members` - List members
- `POST /api/members` - Add new member
- `GET /api/members/:id` - Get member details

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/export` - Export attendance data

### Hardware
- `POST /api/hardware/devices` - Register new device
- `GET /api/hardware/devices` - List devices
- `POST /api/hardware/attendance` - Batch attendance from devices

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.