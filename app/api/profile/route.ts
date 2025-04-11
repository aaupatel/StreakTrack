// app/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { uploadToCloudinary } from '@/lib/cloudinary'; // Adjust the path to your cloudinary utility
import connectDB from '@/lib/mongodb';
import { authOptions } from '@/lib/auth';
import User from '@/models/User';

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const name = formData.get('name') as string | null;
        const email = formData.get('email') as string | null;
        const contactNo = formData.get('contactNo') as string | null;
        const imageFile = formData.get('image') as File | null;

        const updates: {
            name?: string;
            email?: string;
            contactNo?: string;
            image?: string;
        } = {};

        if (name !== null) {
            updates.name = name;
        }

        if (email !== null) {
            // Add email format validation if needed
            const existingUserWithEmail = await User.findOne({ email });
            if (existingUserWithEmail && existingUserWithEmail._id.toString() !== user._id.toString()) {
                return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
            }
            updates.email = email;
        }

        if (contactNo !== null) {
            // You might want to add validation for contactNo format here
            updates.contactNo = contactNo;
        }
        const imageUrl = await uploadToCloudinary(imageFile)
        if (imageUrl) {
          updates.image = imageUrl;
        } else {
          return NextResponse.json({ message: 'Failed to upload image to Cloudinary' }, { status: 500 });
        }
      } catch (cloudinaryError: any) {
        console.error('Cloudinary error:', cloudinaryError);
        return NextResponse.json({ message: 'Failed to upload image to Cloudinary', error: cloudinaryError.message }, { status: 500 });
      }
    }

    if (Object.keys(updates).length > 0) {
      const updatedUser = await User.findByIdAndUpdate(user._id, updates, {
        new: true,
      }).select('-password'); // Exclude password from the response

      return NextResponse.json(updatedUser, { status: 200 });
    }

    return NextResponse.json(user.select('-password'), { status: 200, message: 'No updates needed' });

  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}