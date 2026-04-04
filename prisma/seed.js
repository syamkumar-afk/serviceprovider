const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.message.deleteMany({})
  await prisma.transaction.deleteMany({})
  await prisma.booking.deleteMany({})
  await prisma.service.deleteMany({})
  await prisma.user.deleteMany({})

  // Create Providers
  const provider1 = await prisma.user.create({
    data: {
      email: 'alex@example.com',
      name: 'Alex Rivera',
      role: 'PROVIDER',
      title: 'Full Stack Developer',
      bio: 'Expert in Next.js and Tailwind CSS with 5 years of experience.',
    },
  })

  const provider2 = await prisma.user.create({
    data: {
      email: 'sarah@example.com',
      name: 'Sarah Chen',
      role: 'PROVIDER',
      title: 'UI/UX Designer',
      bio: 'Creating beautiful and functional user experiences for mobile and web.',
    },
  })

  // Create Services
  await prisma.service.create({
    data: {
      title: 'Custom Next.js Website',
      description: 'I will build a high-performance Next.js website for your business.',
      price: 499,
      category: 'Development',
      providerId: provider1.id,
      isActive: true,
      rating: 4.9,
    },
  })

  await prisma.service.create({
    data: {
      title: 'Bug Fixing & Optimization',
      description: 'I will fix bugs and optimize your React/Next.js application performance.',
      price: 150,
      category: 'Development',
      providerId: provider1.id,
      isActive: true,
      rating: 4.7,
    },
  })

  await prisma.service.create({
    data: {
      title: 'Mobile App UI Design',
      description: 'Complete UI/UX design for your iOS or Android application.',
      price: 800,
      category: 'Design',
      providerId: provider2.id,
      isActive: true,
      rating: 5.0,
    },
  })

  await prisma.service.create({
    data: {
      title: 'Logo & Brand Identity',
      description: 'I will create a unique brand identity for your startup.',
      price: 300,
      category: 'Design',
      providerId: provider2.id,
      isActive: true,
      rating: 4.8,
    },
  })

  // Create a Client
  const client1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      name: 'John Doe',
      role: 'CLIENT',
    },
  })

  // Create a Booking
  const serviceToBook = await prisma.service.findFirst({ where: { title: 'Custom Next.js Website' } })
  await prisma.booking.create({
    data: {
      status: 'PENDING',
      totalAmount: serviceToBook.price,
      clientId: client1.id,
      providerId: provider1.id,
      serviceId: serviceToBook.id,
    },
  })

  // Create some Messages
  await prisma.message.create({
    data: {
      content: 'Hi Alex, I am interested in your Next.js service!',
      senderId: client1.id,
      receiverId: provider1.id,
      conversationId: client1.id, // Simple grouping for demo
    },
  })

  await prisma.message.create({
    data: {
      content: 'Hey John! Glad to hear. What kind of website do you need?',
      senderId: provider1.id,
      receiverId: client1.id,
      conversationId: client1.id,
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
