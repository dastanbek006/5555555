import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        partner: true,
        items: { include: { product: true } },
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
    let userId = cookieStore.get('session_user_id')?.value;

    if (!userId) {
      const defaultUser = await prisma.user.findFirst({ where: { role: 'USER' } });
      userId = defaultUser?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'ting' }, { status: 401 });
    }

    const { orderType, items, serviceId, customInputs, attachedFiles, userLat, userLng } = await request.json();

    let totalPrice = 0;
    const orderItemsData = [];

    if (orderType === 'PRODUCT' && Array.isArray(items)) {
      for (const item of items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product || product.stock < item.quantity) {
          return NextResponse.json({ error: `Mahsulot zaxirasi yetarli emas: ${product?.title}` }, { status: 400 });
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
            isBlocked: updatedStock <= 0,
          },
        });
      }
    } else {
      totalPrice = 15000; // Fixed default service base price
    }

    // Assign to an available partner
    const partner = await prisma.user.findFirst({
      where: { role: 'PARTNER', partnerStatus: 'APPROVED' },
    });

    const order = await prisma.order.create({
      data: {
        userId,
        partnerId: partner?.id || null,
        orderType: orderType || 'PRODUCT',
        serviceId: serviceId || null,
        totalPrice,
        paymentMethod: "Naqd to'lov",
        attachedFiles: attachedFiles ? JSON.stringify(attachedFiles) : null,
        customInputs: customInputs ? JSON.stringify(customInputs) : null,
        userLat: userLat || 41.2995,
        userLng: userLng || 69.2401,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        user: true,
        items: true,
      },
    });

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
