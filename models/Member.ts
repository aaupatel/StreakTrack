import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  type: {
    type: String,
    enum: ['student', 'employee'],
    required: [true, 'Member type is required'],
  },
  branch: {
    type: String,
    required: [true, 'Branch/Department is required'],
  },
  enrollmentId: {
    type: String,
    required: [true, 'ID is required'],
  },
  fatherName: {
    type: String,
    required: [true, 'Father\'s name is required'],
  },
  contactNo: {
    type: String,
    required: [true, 'Contact number is required'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
  },
  images: {
    type: [String],
    required: [true, 'At least three images are required'],
    validate: [(val: string[]) => val.length === 3, 'Exactly three images are required'],
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Compound index for unique enrollment IDs within an organization
MemberSchema.index(
  { enrollmentId: 1, organizationId: 1 }, 
  { unique: true }
);

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);