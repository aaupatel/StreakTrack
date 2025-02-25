import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    unique: true,
  },
  type: {
    type: String,
    enum: ['education', 'business'],
    required: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  devices: [{ // Use an array of ObjectIds referencing the Device model
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device', // This is the crucial change
  }],
  apiKey: {
    type: String,
    required: true,
    unique: true,
  },
  settings: {
    maxDevices: {
      type: Number,
      default: 10,
    },
    attendanceWindow: {
      type: Number,
      default: 15, // minutes
    },
    autoMarkAbsent: {
      type: Boolean,
      default: true,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);