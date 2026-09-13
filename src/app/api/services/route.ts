import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: { customFields: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ services });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, iconImage, customFields } = await request.json();

    const service = await prisma.service.create({
      data: {
        name,
        iconImage,
        customFields: {
          create: customFields.map((field: any) => ({
            fieldName: field.fieldName,
            fieldType: field.fieldType || 'text',
            isRequired: field.isRequired !== false,
          })),
        },
      },
      include: { customFields: true },
    });

    return NextResponse.json({ service });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isBlocked } = await request.json();
    const service = await prisma.service.update({
      where: { id },
      data: { isBlocked },
    });
    return NextResponse.json({ service });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
