import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        partner: true,
        items: { include: { product: true } },
        files: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const { id } = params;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 });
    }

    // STRICT PRIVACY HOOK: When status = DELIVERED, soft delete and unlink attached files
    if (status === 'DELIVERED' && existingOrder.files.length > 0) {
      for (const file of existingOrder.files) {
        if (file.fileUrl.startsWith('/uploads/')) {
          const diskPath = path.join(process.cwd(), 'public', file.fileUrl);
          if (fs.existsSync(diskPath)) {
            fs.unlinkSync(diskPath);
          }
        }
        await prisma.orderFile.update({
          where: { id: file.id },
          data: { isDeleted: true },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        deliveredAt: status === 'DELIVERED' ? new Date() : null,
      },
      include: {
        user: true,
        partner: true,
        files: true,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
