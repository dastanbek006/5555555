import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { phone, password, firstName, lastName, isPartner, businessName } = await request.json();

    if (!phone || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Barcha majburiy maydonlarni to\'ldiring' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: 'Ushbu telefon raqam allaqachon ro\'yxatdan o\'tgan' }, { status: 400 });
    }

    const role = isPartner ? 'PARTNER' : 'USER';
    const partnerTier = isPartner ? 'ODDIY' : 'NONE';
    const partnerStatus = isPartner ? 'PENDING' : 'NONE';

    const user = await prisma.user.create({
      data: {
        phone,
        password,
        firstName,
        lastName,
        role,
        partnerTier,
        partnerStatus,
        partnerProfile: isPartner
          ? {
              create: {
                businessName: businessName || 'Yangi Hamkor',
                status: 'PENDING',
                tier: 'ODDIY',
              },
            }
          : undefined,
      },
      include: { partnerProfile: true },
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        partnerTier: user.partnerTier,
        partnerStatus: user.partnerStatus,
      },
      message: isPartner ? 'Admin tasdiqlashini kuting' : 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz',
    });

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
