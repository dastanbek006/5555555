import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, password } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Telefon va parol kiritilishi shart' }, { status: 400 });
    }

    // Easter Egg Check
    if (phone === '111' && password === '222') {
      return NextResponse.json({
        triggerPartnerModal: true,
        message: 'Admin tasdiqlashini kuting',
        partnerStatus: 'pending',
      });
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { partnerProfile: true },
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Telefon raqam yoki parol noto\'g\'ri' }, { status: 401 });
    }

    const response = NextResponse.json({
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

    // Set simple HTTP cookie for session identification
    response.cookies.set('session_user_id', user.id, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
