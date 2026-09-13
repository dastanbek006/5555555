import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.sLAAlert.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customField.deleteMany();
  await prisma.service.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.partnerProfile.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      phone: '998900000000',
      password: 'adminpassword',
      firstName: 'Admin',
      lastName: 'Boshliq',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const vipSeller = await prisma.user.create({
    data: {
      phone: '998911111111',
      password: 'sellerpassword',
      firstName: 'Jasur',
      lastName: 'VIP Sotuvchi',
      role: 'PARTNER',
      partnerTier: 'VIP',
      partnerStatus: 'APPROVED',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      partnerProfile: {
        create: {
          businessName: 'Smart VIP Tech Store',
          address: 'Toshkent sh., Chilanzar',
          status: 'APPROVED',
          tier: 'VIP',
          lat: 41.2995,
          lng: 69.2401,
        },
      },
    },
  });

  const normalPartner = await prisma.user.create({
    data: {
      phone: '998922222222',
      password: 'partnerpassword',
      firstName: 'Sardor',
      lastName: 'Kuryer',
      role: 'PARTNER',
      partnerTier: 'ODDIY',
      partnerStatus: 'APPROVED',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      partnerProfile: {
        create: {
          businessName: 'Fast Delivery TM',
          address: 'Toshkent sh., Yunusobod',
          status: 'APPROVED',
          tier: 'ODDIY',
          lat: 41.3110,
          lng: 69.2797,
        },
      },
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      phone: '998933333333',
      password: 'userpassword',
      firstName: 'Anvar',
      lastName: 'Talaba',
      role: 'USER',
      avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
    },
  });

  // 2. Banners
  await prisma.banner.createMany({
    data: [
      {
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000',
        text: 'TM Smart Market - Tezkor yetkazib berish! Talabalar uchun chegirma!',
        isActive: true,
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1000',
        text: 'Barcha kserokopiya va pasport rasm xizmatlari 100% kafolat bilan!',
        isActive: true,
      },
    ],
  });

  // 3. Categories
  const catGiyim = await prisma.category.create({
    data: {
      name: 'Giyim-boshlar',
      coverImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400',
    },
  });

  const catCosmetics = await prisma.category.create({
    data: {
      name: 'Atirlar/Kosmetika',
      coverImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    },
  });

  const catOziqOvqat = await prisma.category.create({
    data: {
      name: "Oziq-ovqat",
      coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    },
  });

  const catTayyorTaomlar = await prisma.category.create({
    data: {
      name: 'Tayyor taomlar',
      coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    },
  });

  const catOquvQurollari = await prisma.category.create({
    data: {
      name: "O'quv qurollari",
      coverImage: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400',
    },
  });

  // 4. Products (Uploaded by VIP Seller)
  await prisma.product.createMany({
    data: [
      {
        title: 'Futbolka Smart Cotton',
        description: '100% paxta, talabalar uchun qulay sifatli kofta',
        price: 85000,
        stock: 15,
        images: JSON.stringify(['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500']),
        categoryId: catGiyim.id,
        sellerId: vipSeller.id,
      },
      {
        title: 'Fransuz Atri Exclusive 50ml',
        description: 'Uzoq saqlanuvchi erkaklar va ayollar xushbo\'y atri',
        price: 210000,
        stock: 5,
        images: JSON.stringify(['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=500']),
        categoryId: catCosmetics.id,
        sellerId: vipSeller.id,
      },
      {
        title: 'Talaba daftari A4 100 bet',
        description: 'Qattiq muqovali va sifatli qog\'ozli daftar',
        price: 18000,
        stock: 50,
        images: JSON.stringify(['https://images.unsplash.com/photo-1584697964409-3708a2394a1b?w=500']),
        categoryId: catOquvQurollari.id,
        sellerId: vipSeller.id,
      },
    ],
  });

  // 5. Dynamic Services
  const kserokopiya = await prisma.service.create({
    data: {
      name: 'Kserokopiya',
      iconImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=300',
      customFields: {
        create: [
          { fieldName: 'Hujjat faylini yuklang yoki rasmga oling', fieldType: 'file', isRequired: true },
          { fieldName: 'Nusxa soni', fieldType: 'number', isRequired: true },
          { fieldName: 'Rangli yoki Oq-qora', fieldType: 'text', isRequired: true },
        ],
      },
    },
  });

  const pasportRasm = await prisma.service.create({
    data: {
      name: 'Pasport rasm',
      iconImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300',
      customFields: {
        create: [
          { fieldName: 'Pasport uchun rasm yuklang yoki kameradan oling', fieldType: 'file', isRequired: true },
          { fieldName: 'Fonsiz qilish kerakmi? (Ha/Yo\'q)', fieldType: 'text', isRequired: false },
        ],
      },
    },
  });

  await prisma.service.create({
    data: {
      name: 'Oilaviy rasmlar',
      iconImage: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300',
      customFields: {
        create: [
          { fieldName: 'Oilaviy rasmlarni tanlang', fieldType: 'file', isRequired: true },
          { fieldName: 'Rasm o\'lchami (10x15, A4)', fieldType: 'text', isRequired: true },
        ],
      },
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
