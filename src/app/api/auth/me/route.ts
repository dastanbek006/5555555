import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = cookies();
    const userId = cookieStore.get('session_user_id')?.value;

    if (!userId) {
      // Return default guest / admin fallback user for easy dev testing
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (adminUser) {
        return NextResponse.json({
          user: {
            id: adminUser.id,
            phone: adminUser.phone,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role,
            partnerTier: adminUser.partnerTier,
            partnerStatus: adminUser.partnerStatus,
            avatarUrl: adminUser.avatarUrl,
          },
        });
      }
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { partnerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        partnerTier: user.partnerTier,
        partnerStatus: user.partnerStatus,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
