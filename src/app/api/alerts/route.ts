import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const alerts = await prisma.sLAAlert.findMany({
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ alerts });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
