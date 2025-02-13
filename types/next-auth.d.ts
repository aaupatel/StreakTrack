import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      organizationId?: string;
      role?: 'admin' | 'co-admin';
      organizationName?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    organizationId?: string;
    role?: 'admin' | 'co-admin';
    organizationName?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    organizationId?: string;
    role?: 'admin' | 'co-admin';
    organizationName?: string;
  }
}