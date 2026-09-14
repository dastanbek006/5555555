import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_bozor_tm_jwt_secret_key_2026';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      // Fallback guest client
      const defaultUser = await prisma.user.findFirst({ where: { role: 'CLIENT' } });
      if (defaultUser) {
        return NextResponse.json({
          user: {
            id: defaultUser.id,
            firstName: defaultUser.firstName,
            lastName: defaultUser.lastName,
            phone: defaultUser.phone,
            role: defaultUser.role,
            avatarUrl: defaultUser.avatarUrl,
          },
        });
      }
      return NextResponse.json({ user: null });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { partner: true },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        partner: user.partner,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ user: null });
  }
}
