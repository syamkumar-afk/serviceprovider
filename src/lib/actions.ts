"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- Services ---
export async function createService(data: {
  title: string;
  price: number;
  category: string;
  description: string;
  providerId: string;
}) {
  const service = await prisma.service.create({
    data: {
      title: data.title,
      price: data.price,
      category: data.category,
      description: data.description,
      providerId: data.providerId,
    },
  });
  revalidatePath("/provider/dashboard");
  return service;
}

export async function deleteService(id: string) {
  await prisma.service.delete({ where: { id } });
  revalidatePath("/provider/dashboard");
}

export async function getServices() {
  return await prisma.service.findMany({
    include: { provider: true },
    orderBy: { createdAt: "desc" },
  });
}

// --- Bookings ---
export async function bookService(data: {
  serviceId: string;
  clientId: string;
  providerId: string;
  amount: number;
}) {
  const booking = await prisma.booking.create({
    data: {
      serviceId: data.serviceId,
      clientId: data.clientId,
      providerId: data.providerId,
      totalAmount: data.amount,
      status: "PENDING",
    },
  });
  revalidatePath("/provider/dashboard");
  return booking;
}

export async function updateBookingStatus(id: string, status: string) {
  await prisma.booking.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/provider/dashboard");
}

export async function getProviderDashboardData(providerId: string) {
  const [services, bookings, earnings] = await Promise.all([
    prisma.service.findMany({ where: { providerId }, orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({ 
      where: { providerId }, 
      include: { client: true, service: true },
      orderBy: { createdAt: "desc" } 
    }),
    prisma.transaction.findMany({ where: { userId: providerId }, orderBy: { createdAt: "desc" } }),
  ]);

  return { services, bookings, earnings };
}

// --- Messages ---
export async function sendMessage(data: {
  senderId: string;
  receiverId: string;
  content: string;
  conversationId: string;
}) {
  const message = await prisma.message.create({
    data: {
      senderId: data.senderId,
      receiverId: data.receiverId,
      content: data.content,
      conversationId: data.conversationId,
    },
  });
  revalidatePath("/provider/dashboard/messages");
  return message;
}

export async function getConversations(userId: string, userEmail?: string) {
  // Ensure user exists if we only have email or if ID is missing from DB
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user && userEmail) {
     user = await prisma.user.findUnique({ where: { email: userEmail } });
     if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: userEmail,
            name: userEmail.split('@')[0],
          }
        });
     }
  }

  const currentUserId = user?.id || userId;

  // Simple conversation list for MVP
  let sent = await prisma.message.findMany({ where: { senderId: currentUserId }, include: { receiver: true } });
  let received = await prisma.message.findMany({ where: { receiverId: currentUserId }, include: { sender: true } });
  
  // Logic to fill with a welcome message if empty
  if (sent.length === 0 && received.length === 0) {
    // Find or create a 'System' provider
    const supportEmail = "support@marketplace.local";
    let support = await prisma.user.findFirst({ where: { email: supportEmail } });
    if (!support) {
      support = await prisma.user.create({
        data: {
          email: supportEmail,
          name: "Marketplace Support",
          role: "PROVIDER",
          title: "System Concierge",
        }
      });
    }

    // Create several messages to ensure it's populated
    await prisma.message.createMany({
      data: [
        {
          content: "👋 Welcome! This is a sample conversation to help you get started.",
          senderId: support.id,
          receiverId: currentUserId,
          conversationId: support.id,
        },
        {
          content: "You can find services to book on the homepage, or create your own service in the dashboard!",
          senderId: support.id,
          receiverId: currentUserId,
          conversationId: support.id,
        }
      ]
    });

    // Refresh data
    sent = await prisma.message.findMany({ where: { senderId: currentUserId }, include: { receiver: true } });
    received = await prisma.message.findMany({ where: { receiverId: currentUserId }, include: { sender: true } });

    // Add another random conversation from a different user
    const advisorEmail = "advisor@marketplace.local";
    let advisor = await prisma.user.findFirst({ where: { email: advisorEmail } });
    if (!advisor) {
      advisor = await prisma.user.create({
        data: {
          email: advisorEmail,
          name: "Project Advisor",
          role: "PROVIDER",
          title: "Setup Expert",
        }
      });
    }

    await prisma.message.createMany({
      data: [
        {
          content: "Hi there! I'm here to help you get your first listing live. Do you have any questions about the process?",
          senderId: advisor.id,
          receiverId: currentUserId,
          conversationId: advisor.id,
        },
        {
          content: "I recommend starting with a clear title and a competitive price. Let me know if you want to review your draft!",
          senderId: advisor.id,
          receiverId: currentUserId,
          conversationId: advisor.id,
        }
      ]
    });

    // Final refresh
    sent = await prisma.message.findMany({ where: { senderId: currentUserId }, include: { receiver: true } });
    received = await prisma.message.findMany({ where: { receiverId: currentUserId }, include: { sender: true } });
  }

  return { sent, received };
}

// --- Withdrawals ---
export async function withdrawFunds(userId: string, amount: number) {
  const tx = await prisma.transaction.create({
    data: {
      userId,
      amount: -amount,
      description: "Withdrawal to bank account",
      type: "WITHDRAWAL",
      status: "PROCESSING",
    },
  });
  revalidatePath("/provider/dashboard/payouts");
  return tx;
}

// --- Profile ---
export async function updateProfile(userId: string, data: {
  name?: string;
  title?: string;
  bio?: string;
  timezone?: string;
  currency?: string;
}) {
  await prisma.user.update({
    where: { id: userId },
    data,
  });
  revalidatePath("/provider/dashboard/settings");
}
