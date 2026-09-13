import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const partners = await prisma.user.findMany({
      where: { role: 'PARTNER' },
      include: { partnerProfile: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ partners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { userId, partnerTier, partnerStatus } = await request.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        partnerTier: partnerTier || undefined,
        partnerStatus: partnerStatus || undefined,
      },
      include: { partnerProfile: true },
    });

    if (user.partnerProfile) {
      await prisma.partnerProfile.update({
        where: { userId },
        data: {
          tier: partnerTier || undefined,
          status: partnerStatus || undefined,
        },
      });
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
