import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      organizationId?: string;
      role?: 'admin' | 'co-admin';
      organizationName?: string;
      profileImage?: string;
      contactNo?: string;
    } & DefaultSession['user'];
    organization?: {
      _id: string;
      name: string;
      type: string;
      admin: string;
      coAdmins: string[];
      apiKey: string;
      devices: string[];
      settings: {
        maxDevices: number;
        attendanceWindow: number;
        autoMarkAbsent: boolean;
      };
      createdAt: Date;
    };
  }

  interface User {
    id: string;
    organizationId?: string;
    role?: 'admin' | 'co-admin';
    organizationName?: string;
    profileImage?: string;
    contactNo?: string;
    organization?: {
      _id: string;
      name: string;
      type: string;
      admin: string;
      coAdmins: string[];
      apiKey: string;
      devices: string[];
      settings: {
        maxDevices: number;
        attendanceWindow: number;
        autoMarkAbsent: boolean;
      };
      createdAt: Date;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    organizationId?: string;
    role?: 'admin' | 'co-admin';
    organizationName?: string;
    profileImage?: string;
    contactNo?: string; 
    organization?: {
      _id: string;
      name: string;
      type: string;
      admin: string;
      coAdmins: string[];
      apiKey: string;
      devices: string[];
      settings: {
        maxDevices: number;
        attendanceWindow: number;
        autoMarkAbsent: boolean;
      };
      createdAt: Date;
    };
  }
}
