import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_bozor_tm_jwt_secret_key_2026';

export async function POST(request: Request) {
  try {
    const { phone, password, partnerRegistration, businessName } = await request.json();

    if (!phone || !password) {
      return NextResponse.json({ error: "Telefon va parol kiritilishi shart" }, { status: 400 });
    }

    // VAZIFA 2 - Maxsus mantiq: Phone = "111", Parol = "222" -> Easter Egg Partner Modal Trigger
    if (phone === '111' && password === '222') {
      if (partnerRegistration) {
        // Submit Partner Application with status = PENDING
        const existingUser = await prisma.user.findUnique({ where: { phone: partnerRegistration.phone } });

        let user;
        if (existingUser) {
          user = existingUser;
        } else {
          const passwordHash = await bcrypt.hash('123456', 10);
          user = await prisma.user.create({
            data: {
              firstName: partnerRegistration.firstName || 'Hamkor',
              lastName: partnerRegistration.lastName || 'Arizachi',
              phone: partnerRegistration.phone,
              passwordHash,
              role: 'PARTNER',
            },
          });
        }

        await prisma.partner.upsert({
          where: { userId: user.id },
          update: { status: 'PENDING' },
          create: {
            userId: user.id,
            level: partnerRegistration.level || 'STANDARD',
            status: 'PENDING',
          },
        });

        return NextResponse.json({
          triggerPartnerModal: true,
          status: 'PENDING',
          message: 'Admin tasdiqlashini kuting',
        });
      }

      return NextResponse.json({
        triggerPartnerModal: true,
        message: 'Hamkor bo\'lish ro\'yxatdan o\'tish formasini to\'ldiring',
      });
    }

    // Standard Auth
    const user = await prisma.user.findUnique({
      where: { phone },
      include: { partner: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Telefon raqam yoki parol noto'g'ri" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Telefon raqam yoki parol noto'g'ri" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
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
