import 'dotenv/config';
import {PrismaClient} from '../generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({adapter});
async function main() {
  // Create categories
  const audio = await prisma.category.upsert({
    where: {name: 'Audio'},
    update: {},
    create: {name: 'Audio'},
  });

  const keyboards = await prisma.category.upsert({
    where: {name: 'Keyboards'},
    update: {},
    create: {name: 'Keyboards'},
  });

  const gaming = await prisma.category.upsert({
    where: {name: 'Gaming'},
    update: {},
    create: {name: 'Gaming'},
  });

  const displays = await prisma.category.upsert({
    where: {name: 'Displays'},
    update: {},
    create: {name: 'Displays'},
  });

  const accessories = await prisma.category.upsert({
    where: {name: 'Accessories'},
    update: {},
    create: {name: 'Accessories'},
  });

  // Create products
  await prisma.product.upsert({
    where: {id: 1},
    update: {},
    create: {
      id: 1,
      name: 'Wireless Headphones',
      price: 50,
      categoryId: audio.id,
      description:
        'High-fidelity wireless headphones with active noise cancellation and 30-hour battery life.',
      image:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    },
  });

  await prisma.product.upsert({
    where: {id: 2},
    update: {},
    create: {
      id: 2,
      name: 'Mechanical Keyboard',
      price: 80,
      categoryId: keyboards.id,
      description:
        'Custom mechanical gaming keyboard with RGB backlighting and responsive tactile switches.',
      image:
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
    },
  });

  await prisma.product.upsert({
    where: {id: 3},
    update: {},
    create: {
      id: 3,
      name: 'Gaming Mouse',
      price: 35,
      categoryId: gaming.id,
      description:
        'Ergonomic gaming mouse with precision optical sensor up to 16,000 DPI and programmable buttons.',
      image:
        'https://images.unsplash.com/photo-1527814050087-3793815479db',
    },
  });

  await prisma.product.upsert({
    where: {id: 4},
    update: {},
    create: {
      id: 4,
      name: 'USB-C Fast Charger',
      price: 25,
      categoryId: accessories.id,
      description:
        'Ultra-compact 65W GaN dual-port USB-C power adapter for phones, tablets, and laptops.',
      image:
        'https://www.4xem.com/cdn/shop/files/4X25WCHARGEKIT_main_42346726-05ee-4943-a08d-1874c698609c_535x.jpg?v=1695146056',
    },
  });

  await prisma.product.upsert({
    where: {id: 5},
    update: {},
    create: {
      id: 5,
      name: 'Gaming Monitor 27"',
      price: 250,
      categoryId: displays.id,
      description:
        '27-inch 144Hz curved gaming monitor with 1ms response time, AMD FreeSync, and HDR support.',
      image:
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
    },
  });

  await prisma.product.upsert({
    where: {id: 6},
    update: {},
    create: {
      id: 6,
      name: 'Webcam HD Pro',
      price: 70,
      categoryId: accessories.id,
      description:
        '1080p full HD streaming webcam with dual noise-reducing microphones and auto light correction.',
      image:
        'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
    },
  });

  console.log('✅ Categories and products seeded successfully.');
}

main()
  .catch(error => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });