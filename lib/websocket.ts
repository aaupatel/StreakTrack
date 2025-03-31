import Device from "@/models/Device";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import connectDB from "@/lib/mongodb";

export async function fetchStudents(organizationId: string) {
  await connectDB();
  try {
    const students = await Student.find(
      { organizationId: organizationId },
      "_id name enrollmentNo images"
    );
    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    return null;
  }
}

export async function updateDeviceStatus(deviceId: string, status: string) {
  await connectDB();
  try {
    const updatedDevice = await Device.findOneAndUpdate(
      { _id: deviceId },
      { status: status },
      { new: true }
    );
    return updatedDevice;
  } catch (error) {
    console.error(`Error updating device ${deviceId} status:`, error);
    return null;
  }
}

export async function markAttendance(
  deviceId: string,
  studentId: string,
  organizationId: string,
  timestamp: Date
) {
  await connectDB();
  try {
    const attendance = await Attendance.create({
      deviceId: deviceId,
      memberId: studentId,
      organizationId: organizationId,
      timestamp: timestamp,
    });
    return attendance;
  } catch (error) {
    console.error(`Error marking attendance:`, error);
    return null;
  }
}

function isValidObjectId(id: string): boolean {
  if (id.length !== 24) {
    return false;
  }
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export { isValidObjectId };