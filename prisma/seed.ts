import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.alert.deleteMany();
  await prisma.orderFile.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.serviceField.deleteMany();
  await prisma.service.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Boshliq',
      phone: '998900000000',
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const vipPartnerUser = await prisma.user.create({
    data: {
      firstName: 'Jasur',
      lastName: 'VIP Hamkor',
      phone: '998911111111',
      passwordHash,
      role: 'PARTNER',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      partner: {
        create: {
          level: 'VIP',
          status: 'APPROVED',
        },
      },
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      firstName: 'Anvar',
      lastName: 'Talaba',
      phone: '998933333333',
      passwordHash,
      role: 'CLIENT',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    },
  });

  // 2. Banners
  await prisma.banner.createMany({
    data: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000',
        text: 'TM Smart Market — Tezkor yetkazib berish! Talabalar uchun chegirma!',
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000',
        text: 'Kserokopiya va pasport rasm xizmati 100% sifat kafolati bilan!',
        isActive: true,
      },
    ],
  });

  // 3. Categories
  const catGiyim = await prisma.category.create({
    data: { name: 'Giyim-boshlar', imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400' },
  });
  const catCosmetics = await prisma.category.create({
    data: { name: 'Atirlar/Kosmetika', imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
  });
  const catOziqOvqat = await prisma.category.create({
    data: { name: 'Oziq-ovqat', imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
  });
  const catTayyorTaomlar = await prisma.category.create({
    data: { name: 'Tayyor taomlar', imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400' },
  });
  const catOquvQurollari = await prisma.category.create({
    data: { name: "O'quv qurollari", imageUrl: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400' },
  });

  // 4. Products
  await prisma.product.createMany({
    data: [
      {
        name: 'Futbolka Smart Cotton',
        description: '100% paxta, talabalar uchun qulay kofta',
        price: 85000,
        stock: 15,
        images: JSON.stringify(['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500']),
        categoryId: catGiyim.id,
        partnerId: vipPartnerUser.id,
      },
      {
        name: 'Fransuz Atri Exclusive 50ml',
        description: 'Uzoq saqlanuvchi erkaklar va ayollar xushbo\'y atri',
        price: 210000,
        stock: 5,
        images: JSON.stringify(['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500']),
        categoryId: catCosmetics.id,
        partnerId: vipPartnerUser.id,
      },
      {
        name: 'Talaba daftari A4 100 bet',
        description: 'Qattiq muqovali va sifatli qog\'ozli daftar',
        price: 18000,
        stock: 50,
        images: JSON.stringify(['https://images.unsplash.com/photo-1584697964409-3708a2394a1b?w=500']),
        categoryId: catOquvQurollari.id,
        partnerId: vipPartnerUser.id,
      },
    ],
  });

  // 5. Services
  await prisma.service.create({
    data: {
      name: 'Kserokopiya va Chop etish',
      imageUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=300',
      categoryId: catOquvQurollari.id,
      fields: {
        create: [
          { label: 'Hujjat faylini yuklang', fieldType: 'FILE', required: true },
          { label: 'Nusxa soni', fieldType: 'NUMBER', required: true },
          { label: 'Format (A4/A3)', fieldType: 'TEXT', required: true },
        ],
      },
    },
  });

  await prisma.service.create({
    data: {
      name: 'Pasport rasm (3x4 Express)',
      imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300',
      categoryId: catOquvQurollari.id,
      fields: {
        create: [
          { label: 'Pasport rasmi fayli', fieldType: 'FILE', required: true },
          { label: 'Oq fon berish kerakmi?', fieldType: 'TEXT', required: false },
        ],
      },
    },
  });

  console.log('New schema seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
