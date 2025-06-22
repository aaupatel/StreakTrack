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
- **Face Detection**: OpenCV
- **Hardware Integration**: Raspberry Pi, Python

## Prerequisites

- Node.js 18.x or higher
- MongoDB Database
- Gmail Account (for email notifications)
- Raspberry Pi (for hardware setup)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/aaupatel/StreakTrack.git
   cd StreakTrack
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

This section provides a quick guide to setting up the Raspberry Pi hardware for the StreakTrack attendance system, integrating it with the main web application.

For complete source code, detailed wiring diagrams, and in-depth instructions, please refer to the dedicated hardware repository on GitHub:
https://github.com/aaupatel/StreakTrack_Hardware

## Prerequisites for Hardware Setup

#### 1. Hardware Requirements

* Raspberry Pi (tested with Raspberry Pi 4 recommended)

* Raspberry Pi Camera Module V2 (or compatible)

* LCD Display (20x4 I2C)

* Assorted LEDs (Green, Yellow, Blue, Red)

* Jumper wires

* Power supply for Raspberry Pi


#### 2. Software Requirements
* Raspberry Pi OS (or compatible)
* Python 3
* Required Python libraries (install via `pip install -r requirements.txt` after cloning the hardware repo):
    `asyncio`, `websockets`, `aiohttp`, `opencv-python`, `RPi.GPIO`, `picamera2`, `numpy`, `face_recognition`, `pickle`, `sqlite3`, `RPLCD`

### Installation & Usage Summary

1.  **Clone the Hardware Repository:**

    ```
    git clone https://github.com/aaupatel/StreakTrack_Hardware
    cd StreakTrack_Hardware
    ```

2.  **Install Python Dependencies:**
    Navigate into the `StreakTrack_Hardware` directory and install the required Python packages:

    ```
    pip install -r requirements.txt
    ```

3.  **Configure `config.json`:**
    Create a `config.json` file in the `StreakTrack_Hardware` project root. This file holds essential configuration for your device to communicate with the web application.

    * You can find your `organizationId` on your **Profile Page** within the StreakTrack website.

    * You can find the `deviceId` for each registered device in the **"Device Status"** section of the Hardware page on the StreakTrack website.

    ```
    {
      "website_url": "YOUR_WEBSOCKET_SERVER_URL",
      "deviceId": "YOUR_DEVICE_ID",
      "organizationId": "YOUR_ORGANIZATION_ID"
    }
    ```

    **Note:** Replace `YOUR_WEBSOCKET_SERVER_URL` with the actual URL of your deployed StreakTrack backend (e.g., `ws://your-deployed-url.vercel.app`).

4.  **Physical Hardware Connections:**

    * Connect the Raspberry Pi Camera Module to the CSI port.

    * Connect the LCD display to the Raspberry Pi's I2C pins (SDA to GPIO2, SCL to GPIO3, VCC to 5V, GND to GND).

    * Connect LEDs to specified GPIO pins (GREEN: 32, YELLOW: 36, BLUE: 38, RED: 40) via suitable current-limiting resistors.

5.  **Run the Device Script:**
    Navigate to the `StreakTrack_Hardware` directory and execute the main Python script:

    ```
    sudo python3 main.py
    ```

    *Use `sudo` to ensure the script has the necessary permissions to access the camera and GPIO pins.*

6.  **Stopping the Device:**
    To stop the script: Press Ctrl + C in the terminal. This will also trigger the GPIO cleanup.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.