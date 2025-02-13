import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
  },
  enrollmentNo: {
    type: String,
    required: [true, 'Enrollment number is required'],
    unique: true,
  },
  fatherName: {
    type: String,
    required: [true, 'Father\'s name is required'],
  },
  contactNo: {
    type: String,
    required: [true, 'Student contact number is required'],
  },
  fatherContactNo: {
    type: String,
    required: [true, 'Father\'s contact number is required'],
  },
  images: {
    type: [String],
    required: [true, 'At least three images are required'],
    validate: [(val: string[]) => val.length === 3, 'Exactly three images are required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);