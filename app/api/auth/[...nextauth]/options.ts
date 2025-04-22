import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Organization from "@/models/Organization";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          await connectDB();
          const user = await User.findOne({ 
            email: credentials.email,
            emailVerified: true // Only allow verified users to login
          });

          if (!user) {
            throw new Error("User not found or email not verified");
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);

          if (!isValid) {
            throw new Error("Invalid password");
          }

          // Fetch organization details if user is linked to an organization
          let organization = null;
          if (user.organizationId) {
            organization = await Organization.findById(user.organizationId).lean();
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            organizationId: user.organizationId?.toString(),
            role: user.role,
            organizationName: user.organizationName,
            organization: organization || null,
            profileImage: user.profileImage,
            contactNo: user.contactNo,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw error; // Propagate the error for better error handling
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.role = user.role;
        token.organizationName = user.organizationName;
        token.organization = user.organization;
        token.profileImage = user.profileImage;
        token.contactNo = user.contactNo;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.organizationId = token.organizationId;
        session.user.role = token.role;
        session.user.organizationName = token.organizationName;
        session.organization = token.organization;
        session.user.profileImage = token.profileImage;
        session.user.contactNo = token.contactNo;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  // debug: true
};