import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json({ error: 'Mahsulot topilmadi' }, { status: 404 });
    }

    // Try to remove associated files if local
    try {
      const images: string[] = JSON.parse(product.images || '[]');
      images.forEach((imgUrl) => {
        if (imgUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', imgUrl);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    } catch (e) {
      console.error('File unlink error:', e);
    }

    // Hard delete from DB
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Mahsulot va barcha rasmlar to\'liq o\'chirildi' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
