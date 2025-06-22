export { authOptions } from "@/app/api/auth/[...nextauth]/options";

// import type { NextAuthConfig } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import bcrypt from "bcryptjs";

// const config = {
//   providers: [
//     CredentialsProvider({
//       name: "credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) {
//           return null;
//         }

//         try {
//           const { default: connectDB } = await import("@/lib/mongodb");
//           const { default: Faculty } = await import("@/models/Faculty");
          
//           await connectDB();
//           const faculty = await Faculty.findOne({ email: credentials.email });

//           if (!faculty) {
//             return null;
//           }

//           const isValid = await bcrypt.compare(credentials.password, faculty.password);

//           if (!isValid) {
//             return null;
//           }

//           return {
//             id: faculty._id.toString(),
//             email: faculty.email,
//             name: faculty.name,
//           };
//         } catch (error) {
//           console.error("Auth error:", error);
//           return null;
//         }
//       }
//     })
//   ],
//   pages: {
//     signIn: "/auth/login",
//   },
//   session: {
//     strategy: "jwt",
//     maxAge: 30 * 24 * 60 * 60, // 30 days
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token && session.user) {
//         session.user.id = token.id;
//       }
//       return session;
//     },
//   },
// } satisfies NextAuthConfig;

// export const { handlers, auth, signIn, signOut } = NextAuth(config);