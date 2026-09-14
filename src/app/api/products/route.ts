import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true, partner: true },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = products.map((p) => ({
      ...p,
      title: p.name,
      images: JSON.parse(p.images || '[]'),
    }));

    return NextResponse.json({ products: parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    let partnerId = null;
    if (token) {
      const defaultPartner = await prisma.user.findFirst({ where: { role: 'PARTNER' } });
      partnerId = defaultPartner?.id;
    }

    if (!partnerId) {
      const partnerUser = await prisma.user.findFirst({ where: { role: 'PARTNER' } });
      partnerId = partnerUser?.id;
    }

    if (!partnerId) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'ting' }, { status: 401 });
    }

    const { name, description, price, stock, categoryId, images } = await request.json();

    const imgArray = Array.isArray(images) ? images.slice(0, 3) : [];

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        categoryId,
        partnerId,
        images: JSON.stringify(imgArray),
        isActive: parseInt(stock, 10) > 0,
      },
    });

    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
