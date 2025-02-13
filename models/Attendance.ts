import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true,
  },
  deviceId: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
}, {
  timestamps: true,
});

// Compound index for unique attendance per member per day
AttendanceSchema.index({ 
  memberId: 1, 
  timestamp: 1,
  organizationId: 1 
}, { 
  unique: true 
});

export default mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);