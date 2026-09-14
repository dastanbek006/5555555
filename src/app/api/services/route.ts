import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      include: { fields: true },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = services.map((s) => ({
      ...s,
      iconImage: s.imageUrl,
      customFields: s.fields.map((f) => ({
        id: f.id,
        fieldName: f.label,
        fieldType: f.fieldType.toLowerCase(),
        isRequired: f.required,
      })),
    }));

    return NextResponse.json({ services: mapped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, imageUrl, categoryId, fields } = await request.json();

    const category = categoryId || (await prisma.category.findFirst())?.id;

    const service = await prisma.service.create({
      data: {
        name,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1568667256549-094345857637?w=300',
        categoryId: category!,
        fields: {
          create: (fields || []).map((f: any) => ({
            label: f.label || f.fieldName,
            fieldType: (f.fieldType || 'TEXT').toUpperCase(),
            required: f.required !== false,
          })),
        },
      },
      include: { fields: true },
    });

    return NextResponse.json({ service });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, isActive } = await request.json();
    const service = await prisma.service.update({
      where: { id },
      data: { isActive },
    });
    return NextResponse.json({ service });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
