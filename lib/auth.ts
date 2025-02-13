import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                try {
                    await connectDB();
                    const user = await User.findOne({
                        email: credentials.email,
                        emailVerified: true, // Ensure only verified users can log in
                    });

                    if (!user) {
                        throw new Error("User not found or email not verified");
                    }

                    const isValid = await bcrypt.compare(credentials.password, user.password);

                    if (!isValid) {
                        throw new Error("Invalid password");
                    }

                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        organizationId: user.organizationId?.toString(),
                        role: user.role,
                        organizationName: user.organizationName,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    throw error;
                }
            },
        }),
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
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.organizationId = token.organizationId;
                session.user.role = token.role;
                session.user.organizationName = token.organizationName;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === "development", // Enable debug in development
};



// import NextAuth from "next-auth";
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