import fetch from 'node-fetch';

// Simulates a hardware device sending attendance data
async function simulateHardwareDevice() {
  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const API_KEY = process.env.HARDWARE_API_KEY;
  const INTERVAL = parseInt(process.env.HARDWARE_DEVICE_INTERVAL || '5000');

  // Simulated member IDs (replace with actual member IDs from your database)
  const memberIds = [
    '507f1f77bcf86cd799439011',
    '507f1f77bcf86cd799439012',
    '507f1f77bcf86cd799439013'
  ];

  async function sendAttendanceData() {
    try {
      // Simulate random attendance records
      const records = memberIds.map(memberId => ({
        memberId,
        timestamp: new Date().toISOString(),
        deviceId: 'DEVICE_001'
      }));

      const response = await fetch(`${API_URL}/api/hardware/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY!
        },
        body: JSON.stringify({ records })
      });

      const data = await response.json();
      console.log('Attendance data sent:', data);
    } catch (error) {
      console.error('Error sending attendance data:', error);
    }
  }

  // Send data at regular intervals
  setInterval(sendAttendanceData, INTERVAL);
}

simulateHardwareDevice();