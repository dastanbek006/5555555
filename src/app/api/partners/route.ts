import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ partners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { partnerId, level, status } = await request.json();

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        level: level || undefined,
        status: status || undefined,
      },
      include: { user: true },
    });

    return NextResponse.json({ partner });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
