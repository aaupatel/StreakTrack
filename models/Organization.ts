import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline',
  },
  lastSeen: Date,
  location: {
    type: String,
    required: true,
  },
  ipAddress: String,
  version: String,
  settings: {
    captureInterval: {
      type: Number,
      default: 5000, // 5 seconds
    },
    batchSize: {
      type: Number,
      default: 50,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  }
});

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
  devices: [DeviceSchema],
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

// Compound index for unique device IDs within an organization
OrganizationSchema.index(
  { 'devices.deviceId': 1 }, 
  { unique: true, sparse: true }
);

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);