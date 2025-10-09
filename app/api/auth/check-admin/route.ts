import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const adminSession = cookieStore.get('admin-session');
  
  return NextResponse.json({ 
    isAdmin: !!adminSession 
  });
}
