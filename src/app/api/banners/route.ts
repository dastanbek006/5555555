import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({ where: { isActive: true } });
    return NextResponse.json({ banners });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { imageUrl, text } = await request.json();
    const banner = await prisma.banner.create({
      data: { imageUrl, text },
    });
    return NextResponse.json({ banner });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
