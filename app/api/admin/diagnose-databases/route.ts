// File: /app/api/admin/diagnose-databases/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Test multiple database URLs
const testDatabases = async () => {
  const results: any = {};
  
  // Test DATABASE_URL (primary)
  if (process.env.DATABASE_URL) {
    try {
      const prisma1 = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL } }
      });
      const schoolCount = await prisma1.school.count();
      const sampleSchools = await prisma1.school.findMany({ 
        take: 3,
        select: { id: true, schoolName: true, region: true, status: true }
      });
      await prisma1.$disconnect();
      
      results.DATABASE_URL = {
        status: 'connected',
        schoolCount,
        sampleSchools,
        url: process.env.DATABASE_URL?.substring(0, 30) + '...'
      };
    } catch (error) {
      results.DATABASE_URL = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test POSTGRES_URL
  if (process.env.POSTGRES_URL) {
    try {
      const prisma2 = new PrismaClient({
        datasources: { db: { url: process.env.POSTGRES_URL } }
      });
      const schoolCount = await prisma2.school.count();
      const sampleSchools = await prisma2.school.findMany({ 
        take: 3,
        select: { id: true, schoolName: true, region: true, status: true }
      });
      await prisma2.$disconnect();
      
      results.POSTGRES_URL = {
        status: 'connected',
        schoolCount,
        sampleSchools,
        url: process.env.POSTGRES_URL?.substring(0, 30) + '...'
      };
    } catch (error) {
      results.POSTGRES_URL = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test POSTGRES_PRISMA_URL  
  if (process.env.POSTGRES_PRISMA_URL) {
    try {
      const prisma3 = new PrismaClient({
        datasources: { db: { url: process.env.POSTGRES_PRISMA_URL } }
      });
      const schoolCount = await prisma3.school.count();
      const sampleSchools = await prisma3.school.findMany({ 
        take: 3,
        select: { id: true, schoolName: true, region: true, status: true }
      });
      await prisma3.$disconnect();
      
      results.POSTGRES_PRISMA_URL = {
        status: 'connected',
        schoolCount,
        sampleSchools,
        url: process.env.POSTGRES_PRISMA_URL?.substring(0, 30) + '...'
      };
    } catch (error) {
      results.POSTGRES_PRISMA_URL = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  return results;
};

export async function GET() {
  console.log('🔍 DATABASE DIAGNOSTIC STARTED');
  
  try {
    // Show current environment variable setup
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      POSTGRES_PRISMA_URL: !!process.env.POSTGRES_PRISMA_URL,
      DATABASE_URL_UNPOOLED: !!process.env.DATABASE_URL_UNPOOLED,
      POSTGRES_URL_NON_POOLING: !!process.env.POSTGRES_URL_NON_POOLING
    };

    console.log('📋 Environment Variables Present:', envVars);

    // Test each database connection
    const databaseResults = await testDatabases();
    
    console.log('🎯 Database Test Results:', JSON.stringify(databaseResults, null, 2));

    // Current prisma client check
    const { prisma } = await import('@/lib/prisma');
    const currentSchoolCount = await prisma.school.count();
    const currentSampleSchools = await prisma.school.findMany({ 
      take: 5,
      select: { id: true, schoolName: true, region: true, status: true }
    });

    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      environmentVariables: envVars,
      databaseConnections: databaseResults,
      currentPrismaClient: {
        schoolCount: currentSchoolCount,
        sampleSchools: currentSampleSchools,
        usingUrl: 'Determined by /lib/prisma.ts configuration'
      },
      recommendations: [] as string[]
    };

    // Generate recommendations
    const schoolCounts = Object.values(databaseResults)
      .filter((result: any) => result.status === 'connected')
      .map((result: any) => result.schoolCount);
    
    const maxSchools = Math.max(...schoolCounts);
    const databasesWithData = Object.entries(databaseResults)
      .filter(([_, result]: [string, any]) => result.status === 'connected' && result.schoolCount > 0);

    if (databasesWithData.length > 1) {
      diagnosticReport.recommendations.push(
        "🚨 CRITICAL: Multiple databases contain school data",
        `Primary database appears to be the one with ${maxSchools} schools`,
        "Consolidate to single DATABASE_URL to fix matching issues"
      );
    }

    if (currentSchoolCount !== maxSchools) {
      diagnosticReport.recommendations.push(
        "⚠️  Current Prisma client is NOT using the database with the most data",
        "Update /lib/prisma.ts configuration to use the correct DATABASE_URL"
      );
    }

    return NextResponse.json(diagnosticReport, { status: 200 });

  } catch (error) {
    console.error('❌ Database diagnostic failed:', error);
    return NextResponse.json({
      error: 'Database diagnostic failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
