import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'smart_bozor_tm_jwt_secret_key_2026';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        partner: true,
        items: { include: { product: true } },
        files: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    let userId = null;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        // Token decode failed
      }
    }

    if (!userId) {
      const defaultUser = await prisma.user.findFirst();
      userId = defaultUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'ting' }, { status: 401 });
    }

    const { type, items, attachedFiles } = await request.json();

    let totalPrice = 0;
    const orderItemsData = [];

    if (type === 'PRODUCT' && Array.isArray(items)) {
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          return NextResponse.json({ error: `Mahsulot zaxirasi yetarli emas` }, { status: 400 });
        }

        totalPrice += product.price * item.quantity;
        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });

        // Decrement stock & auto-block if 0
        const updatedStock = product.stock - item.quantity;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: updatedStock,
            isActive: updatedStock > 0,
          },
        });
      }
    } else {
      totalPrice = 15000;
    }

    const partner = await prisma.user.findFirst({
      where: { role: 'PARTNER' },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        partnerId: partner?.id || null,
        type: type || 'PRODUCT',
        status: 'PENDING',
        totalPrice,
        items: {
          create: orderItemsData,
        },
        files: attachedFiles
          ? {
              create: attachedFiles.map((f: string) => ({
                fileUrl: f,
                fileType: 'IMAGE',
              })),
            }
          : undefined,
      },
      include: {
        user: true,
        items: true,
        files: true,
      },
    });

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
