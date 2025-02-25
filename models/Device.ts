import mongoose from 'mongoose';

const DeviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
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
        required: [true, 'location is required'], // Where the device is located
    },
    ipAddress: String, // Might be useful for debugging
    version: String,  // Version of the software running on the device
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
            default: true, // Is the device active?
        },
        // Add other settings as needed (e.g., face recognition model, camera settings)
    },
    camera: { // Track camera status
        type: String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },
    wifi: { // Track WiFi connection status
        type: String,
        enum: ['connected', 'disconnected'],
        default: 'disconnected',
    },
    ledStatus: { // Track LED status (if applicable)
        type: String,
        enum: ['ready', 'busy', 'error', 'connecting'], // Add other states as needed
        default: 'ready',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: { // Add an updatedAt field for tracking changes
        type: Date,
    },
}, { timestamps: true }); // Enable timestamps for createdAt and updatedAt

// Add index for deviceId (for faster queries)
// DeviceSchema.index({ deviceId: 1 }, { unique: true });

export default mongoose.models.Device || mongoose.model('Device', DeviceSchema);