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

    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return NextResponse.json({ error: 'Buyurtma topilmadi' }, { status: 404 });
    }

    // STRICT PRIVACY HOOK: When marked TOPSHIRILDI, delete attached files from disk & clear DB reference
    let attachedFiles = existingOrder.attachedFiles;

    if (status === 'TOPSHIRILDI' && existingOrder.attachedFiles) {
      try {
        const fileList: string[] = JSON.parse(existingOrder.attachedFiles);
        fileList.forEach((fileRelPath) => {
          if (fileRelPath.startsWith('/uploads/')) {
            const diskPath = path.join(process.cwd(), 'public', fileRelPath);
            if (fs.existsSync(diskPath)) {
              fs.unlinkSync(diskPath);
              console.log(`[PRIVACY HOOK] Permanently deleted user file: ${diskPath}`);
            }
          }
        });
      } catch (e) {
        console.error('[PRIVACY HOOK ERROR]: Failed to delete files from disk', e);
      }
      attachedFiles = null; // Purge reference in DB while maintaining order metadata
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        attachedFiles,
      },
      include: {
        user: true,
        partner: true,
      },
    });

    return NextResponse.json({ order: updatedOrder });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
