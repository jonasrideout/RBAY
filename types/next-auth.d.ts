// /types/next-auth.d.ts

import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    schoolId?: string
    schoolName?: string
    teacherName?: string
    dashboardToken?: string
    schoolStatus?: string
  }

  interface Session {
    user: {
      id?: string
      name?: string | null
      email?: string | null
      image?: string | null
      schoolId?: string
      schoolName?: string
      teacherName?: string
      dashboardToken?: string
      schoolStatus?: string
    }
  }
}
