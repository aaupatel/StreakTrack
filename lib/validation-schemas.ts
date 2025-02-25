import { z } from 'zod';

export const memberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  branch: z.string().min(2, 'Branch/Department is required'),
  enrollmentId: z.string().min(2, 'ID is required'),
  fatherName: z.string().min(2, 'Father\'s name is required'),
  contactNo: z.string().min(10, 'Contact number must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  images: z.array(z.string()).length(3, 'Exactly three images are required'),
});

export const deviceSchema = z.object({
  name: z.string().min(2, 'Device name is required'),
  location: z.string().min(2, 'Location is required'),
  ipAddress: z.string().optional(),
  version: z.string().optional(),
  settings: z.object({
    captureInterval: z.number().min(1000).max(60000).optional(),
    batchSize: z.number().min(1).max(100).optional(),
    enabled: z.boolean().optional(),
  }).optional(),
});

export const attendanceSchema = z.object({
  memberId: z.string().min(1, 'Member ID is required'),
  // deviceId: z.string().min(1, 'Device ID is required'),
});