import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_bozor_tm_jwt_secret_key_2026';

export async function POST(request: Request) {
  try {
    const { firstName, lastName, phone, password, avatarUrl, isPartner, level, businessName } = await request.json();

    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    if (existingUser) {
      return NextResponse.json({ error: "Ushbu telefon raqam allaqachon ro'yxatdan o'tgan" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const role = isPartner ? 'PARTNER' : 'CLIENT';

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        phone,
        passwordHash,
        avatarUrl,
        role,
        partner: isPartner
          ? {
              create: {
                level: level || 'STANDARD',
                status: 'PENDING',
              },
            }
          : undefined,
      },
      include: { partner: true },
    });

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      message: isPartner ? 'Admin tasdiqlashini kuting' : "Muvaffaqiyatli ro'yxatdan o'tdingiz",
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

    response.cookies.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
