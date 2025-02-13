import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";

export async function POST(request: Request) {
  try {
    await connectDB();
    const { image } = await request.json();

    // Process the incoming image
    const detectedFaces = await detectFaces(image);
    if (!detectedFaces) {
      return NextResponse.json(
        { error: "No face detected in the image" },
        { status: 400 }
      );
    }

    // Find matching student
    const matchResults = await findMatchingStudents(detectedFaces);
    if (!matchResults.length) {
      return NextResponse.json(
        { error: "No matching student found" },
        { status: 404 }
      );
    }

    // Get the best match
    const bestMatch = matchResults[0];
    
    // Mark attendance automatically
    await markAttendance(bestMatch.studentId);

    return NextResponse.json({
      studentId: bestMatch.studentId,
      name: bestMatch.name,
      enrollmentNo: bestMatch.enrollmentNo,
      confidence: bestMatch.confidence
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Face detection failed" },
      { status: 500 }
    );
  }
}

async function detectFaces(imageData: string) {
  try {
    // Convert base64 to buffer if needed
    const imageBuffer = Buffer.from(imageData.split(',')[1], 'base64');
    
    // Here you would call your face detection service
    // For example, using TensorFlow.js or a cloud service
    
    // Simulated response structure
    return {
      faceFeatures: {
        embeddings: [], // Face embedding vector
        landmarks: [],  // Facial landmarks
        confidence: 0.95
      }
    };
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}

async function findMatchingStudents(detectedFace: any) {
  try {
    // Get all students from database
    const students = await Student.find({});
    const matches = [];

    for (const student of students) {
      // Compare detected face with each stored image of the student
      for (const storedImage of student.images) {
        const similarity = await compareFaces(detectedFace, storedImage);
        
        if (similarity > 0.8) { // Threshold for matching
          matches.push({
            studentId: student._id,
            name: student.name,
            enrollmentNo: student.enrollmentNo,
            confidence: similarity
          });
        }
      }
    }

    // Sort by confidence score
    return matches.sort((a, b) => b.confidence - a.confidence);
  } catch (error) {
    console.error('Face matching error:', error);
    return [];
  }
}

async function compareFaces(detectedFace: any, storedImage: string) {
  try {
    // Here you would implement face comparison logic
    // This could use cosine similarity between face embeddings
    
    // Simulated comparison score
    return 0.95;
  } catch (error) {
    console.error('Face comparison error:', error);
    return 0;
  }
}

async function markAttendance(studentId: string) {
  try {
    const response = await fetch('/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId,
        status: 'present',
        method: 'automatic'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to mark attendance');
    }

    return await response.json();
  } catch (error) {
    console.error('Attendance marking error:', error);
    throw error;
  }
}