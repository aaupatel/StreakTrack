import connectDB from "../lib/mongodb";
import Faculty from "../models/Faculty";
import bcrypt from "bcryptjs";

async function createTestFaculty() {
  try {
    await connectDB();

    // Check if faculty already exists
    const existingFaculty = await Faculty.findOne({ email: "ayushpatidar2810@gmail.com" });
    if (existingFaculty) {
      console.log("Faculty already exists");
      return;
    }

    // Create new faculty
    const hashedPassword = await bcrypt.hash("123456", 10);
    const faculty = await Faculty.create({
      name: "Ayush Patidar",
      email: "ayushpatidar2810@gmail.com",
      password: hashedPassword,
      emailVerified: true
    });

    console.log("Test faculty created successfully:", faculty);
  } catch (error) {
    console.error("Error creating test faculty:", error);
  } finally {
    process.exit(0);
  }
}