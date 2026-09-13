import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isBlocked: false },
      include: { category: true, seller: true },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = products.map((p) => ({
      ...p,
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
    const userId = cookieStore.get('session_user_id')?.value;

    let sellerId = userId;
    if (!sellerId) {
      const vipUser = await prisma.user.findFirst({ where: { partnerTier: 'VIP' } });
      sellerId = vipUser?.id;
    }

    if (!sellerId) {
      return NextResponse.json({ error: 'Avtorizatsiyadan o\'ting' }, { status: 401 });
    }

    const { title, description, price, stock, categoryId, images } = await request.json();

    if (!title || !price || stock === undefined || !categoryId) {
      return NextResponse.json({ error: 'Barcha ma\'lumotlarni kiriting' }, { status: 400 });
    }

    const imgArray = Array.isArray(images) ? images.slice(0, 3) : [];

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        categoryId,
        sellerId,
        images: JSON.stringify(imgArray),
        isBlocked: parseInt(stock, 10) <= 0,
      },
    });

    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
