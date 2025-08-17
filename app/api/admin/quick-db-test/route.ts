// File: /app/api/admin/quick-db-test/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export async function GET() {
  console.log('🔍 QUICK DATABASE TEST STARTED');
  
  const results: any = {};
  
  // Test each potential database URL
  const urlsToTest = [
    ['DATABASE_URL', process.env.DATABASE_URL],
    ['POSTGRES_URL', process.env.POSTGRES_URL],
    ['POSTGRES_PRISMA_URL', process.env.POSTGRES_PRISMA_URL],
    ['DATABASE_URL_UNPOOLED', process.env.DATABASE_URL_UNPOOLED],
    ['POSTGRES_URL_NON_POOLING', process.env.POSTGRES_URL_NON_POOLING],
  ];
  
  for (const [name, url] of urlsToTest) {
    if (!url) {
      results[name] = { status: 'not_set' };
      continue;
    }
    
    try {
      const testPrisma = new PrismaClient({
        datasources: { db: { url: url as string } }
      });
      
      const schoolCount = await testPrisma.school.count();
      const schools = await testPrisma.school.findMany({
        take: 3,
        select: { 
          id: true, 
          name: true, 
          region: true, 
          status: true 
        }
      });
      
      await testPrisma.$disconnect();
      
      results[name] = {
        status: 'connected',
        schoolCount,
        sampleSchoolIds: schools.map(s => s.id),
        sampleSchools: schools,
        urlPreview: url.substring(0, 40) + '...'
      };
      
      // Check if this database contains the specific schools from your error
      const hasTargetSchools = schools.some(s => 
        s.id === 'cmeg2tg120021g5qo08deevqt' || 
        s.id === 'cmeg2tg2k0032g5qod2nbip5u'
      );
      
      if (hasTargetSchools) {
        results[name].hasTargetSchools = true;
      }
      
    } catch (error) {
      results[name] = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  // Test current prisma client
  try {
    const { prisma } = await import('@/lib/prisma');
    const currentCount = await prisma.school.count();
    const currentSchools = await prisma.school.findMany({
      take: 3,
      select: { id: true, name: true, region: true, status: true }
    });
    
    results.CURRENT_PRISMA_CLIENT = {
      status: 'connected',
      schoolCount: currentCount,
      sampleSchoolIds: currentSchools.map(s => s.id),
      sampleSchools: currentSchools
    };
    
  } catch (error) {
    results.CURRENT_PRISMA_CLIENT = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
  
  console.log('🎯 Quick DB Test Results:', JSON.stringify(results, null, 2));
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    targetSchoolIds: [
      'cmeg2tg120021g5qo08deevqt', 
      'cmeg2tg2k0032g5qod2nbip5u'
    ],
    databaseResults: results,
    recommendation: 'Look for the database that contains the most schools or the target school IDs'
  });
}
