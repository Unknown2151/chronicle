// prisma/seed.ts
import { PrismaClient, Pace, MemberRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Create Users
    const admin = await prisma.user.upsert({
        where: { email: 'admin@chronicle.app' },
        update: {},
        create: { email: 'admin@chronicle.app', name: 'Dr. Shelley (Admin)' },
    });

    const members = await Promise.all(
        Array.from({ length: 4 }).map((_, i) =>
            prisma.user.upsert({
                where: { email: `reader${i + 1}@chronicle.app` },
                update: {},
                create: { email: `reader${i + 1}@chronicle.app`, name: `Reader ${i + 1}` },
            })
        )
    );

    // 2. Create Room
    const room = await prisma.room.upsert({
        where: { id: 'seed-room-1' },
        update: {},
        create: {
            id: 'seed-room-1',
            title: 'Frankenstein by Mary Shelley',
            bookTitle: 'Frankenstein',
            author: 'Mary Shelley',
            pace: Pace.MEDIUM,
            moods: ['Gothic', 'Philosophical'],
            themes: ['Creation', 'Isolation'],
            adminId: admin.id,
            isPublic: true,
        },
    });

    // 3. Create Memberships
    await prisma.roomMember.upsert({
        where: { userId_roomId: { userId: admin.id, roomId: room.id } },
        update: {},
        create: { userId: admin.id, roomId: room.id, role: MemberRole.ADMIN },
    });

    for (const member of members) {
        await prisma.roomMember.upsert({
            where: { userId_roomId: { userId: member.id, roomId: room.id } },
            update: {},
            create: { userId: member.id, roomId: room.id, role: MemberRole.MEMBER },
        });
    }

    // 4. Create Chunks
    const now = new Date();
    const chunksData = [
        { title: 'Letters I–IV', order: 1, deadline: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }, // 7 days ago
        { title: 'Chapters 1–5', order: 2, deadline: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) }, // 3 days ago
        { title: 'Chapters 6–10', order: 3, deadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000) }, // tomorrow
        { title: 'Chapters 11–16', order: 4, deadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }, // 7 days from now
        { title: 'Chapters 17–24 + Walton', order: 5, deadline: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) }, // 14 days
    ];

    const chunks = [];
    for (const data of chunksData) {
        const chunk = await prisma.chunk.upsert({
            where: { roomId_order: { roomId: room.id, order: data.order } },
            update: { deadline: data.deadline },
            create: { ...data, roomId: room.id },
        });
        chunks.push(chunk);
    }

    // 5. Create Progress (The Spoiler Lock)
    // Admin & all members finished Chunks 1 & 2
    const allUsers = [admin, ...members];
    for (const user of allUsers) {
        for (const chunk of [chunks[0], chunks[1]]) {
            await prisma.userProgress.upsert({
                where: { userId_chunkId: { userId: user.id, chunkId: chunk.id } },
                update: {},
                create: { userId: user.id, chunkId: chunk.id },
            });
        }
    }

    // Only Admin and Member 1 & 2 finished Chunk 3
    const advancedUsers = [admin, members[0], members[1]];
    for (const user of advancedUsers) {
        await prisma.userProgress.upsert({
            where: { userId_chunkId: { userId: user.id, chunkId: chunks[2].id } },
            update: {},
            create: { userId: user.id, chunkId: chunks[2].id },
        });
    }

    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });