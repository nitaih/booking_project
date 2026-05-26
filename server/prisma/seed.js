import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting comprehensive database seeding...');

  // 1. Springs Hotel (Valley of Springs)
  const hotel1 = await prisma.hotel.create({
    data: {
      name: 'Springs Resort & Spa',
      stars: 4,
      country: 'Israel',
      city: 'Valley of Springs',
      number_of_rooms: 120,
      rooms: {
        create: [
          { name: 'Standard Single Room', max_guests: 1, price: 350.00, size: 20 },
          { name: 'Standard Double Room', max_guests: 2, price: 450.00, size: 25 },
          { name: 'Superior Twin Room', max_guests: 2, price: 520.00, size: 28 },
          { name: 'Deluxe Family Room', max_guests: 4, price: 750.00, size: 42 },
          { name: 'Grand Executive Suite', max_guests: 6, price: 1100.00, size: 60 },
        ],
      },
    },
  });

  // 2. The Norman (Tel Aviv)
  const hotel2 = await prisma.hotel.create({
    data: {
      name: 'The Norman Boutique Hotel',
      stars: 5,
      country: 'Israel',
      city: 'Tel Aviv',
      number_of_rooms: 50,
      rooms: {
        create: [
          { name: 'Classic Urban Room', max_guests: 2, price: 950.00, size: 28 },
          { name: 'Deluxe Balcony Room', max_guests: 2, price: 1200.00, size: 35 },
          { name: 'Junior Suite', max_guests: 3, price: 1550.00, size: 45 },
          { name: 'Duplex Suite', max_guests: 4, price: 2100.00, size: 65 },
          { name: 'The Penthouse Suite', max_guests: 4, price: 3500.00, size: 90 },
        ],
      },
    },
  });

  // 3. Royal Sea Palace (Eilat)
  const hotel3 = await prisma.hotel.create({
    data: {
      name: 'Royal Sea Palace',
      stars: 5,
      country: 'Israel',
      city: 'Eilat',
      number_of_rooms: 250,
      rooms: {
        create: [
          { name: 'Standard Mountain View', max_guests: 2, price: 600.00, size: 26 },
          { name: 'Deluxe Pool View', max_guests: 3, price: 780.00, size: 32 },
          { name: 'Premium Sea Front', max_guests: 3, price: 950.00, size: 35 },
          { name: 'Family Terrace Room', max_guests: 5, price: 1350.00, size: 50 },
          { name: 'Presidential Lagoon Suite', max_guests: 4, price: 2800.00, size: 85 },
        ],
      },
    },
  });

  // 4. Galilee Vista Lodge (Rosh Pinna)
  const hotel4 = await prisma.hotel.create({
    data: {
      name: 'Galilee Vista Lodge',
      stars: 4,
      country: 'Israel',
      city: 'Rosh Pinna',
      number_of_rooms: 40,
      rooms: {
        create: [
          { name: 'Rustic Studio', max_guests: 2, price: 500.00, size: 30 },
          { name: 'Garden Cottage', max_guests: 2, price: 680.00, size: 38 },
          { name: 'Panoramic View Room', max_guests: 2, price: 800.00, size: 35 },
          { name: 'Family Cabin', max_guests: 6, price: 1250.00, size: 58 },
          { name: 'Honeymoon Sanctuary Suite', max_guests: 2, price: 1600.00, size: 48 },
        ],
      },
    },
  });

  console.log('Database seeded successfully with 4 hotels and 20 rooms total!');
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });