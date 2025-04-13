import mongoose, { Schema, Document } from 'mongoose';

interface AttendanceDocument extends Document {
  studentId: mongoose.Schema.Types.ObjectId;
  deviceId: string;
  timestamp: Date; // timestamp for the exact time of detection
  date: Date;     // Added 'date' field (without time) for easier querying by day
  organizationId: mongoose.Schema.Types.ObjectId;
  method: 'automatic' | 'manual';
  status: 'present' | 'absent';
  markedBy?: mongoose.Schema.Types.ObjectId; // For: User who manually marked
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<AttendanceDocument>({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  deviceId: { type: String, required: true },
  timestamp: { type: Date, required: true },
  date: { type: Date, required: true }, // Store the date part
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  method: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
  status: { type: String, enum: ['present', 'absent'], default: 'present' }, // Default to present upon detection
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Attendance = mongoose.models.Attendance || mongoose.model<AttendanceDocument>('Attendance', AttendanceSchema);

export default Attendance;