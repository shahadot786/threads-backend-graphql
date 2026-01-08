import { prisma } from "../src/lib/prisma.js";
import { userService } from "../src/graphql/user/user.service.js";
import { randomUUID } from "crypto";

async function main() {
    console.log("🌱 Starting seed...");

    // Clear existing data
    await prisma.notification.deleteMany();
    await prisma.postLike.deleteMany();
    await prisma.postMention.deleteMany();
    await prisma.postHashtag.deleteMany();
    await prisma.repost.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.postMedia.deleteMany();
    await prisma.post.deleteMany();
    await prisma.block.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.user.deleteMany();

    // Create Users
    console.log("Creating 20 mock users...");
    const users = [];
    for (let i = 0; i < 20; i++) {
        const firstName = `User${i + 1}`;
        const email = `user${i + 1}@example.com`;
        const id = randomUUID(); // Generate a fake Supabase ID

        // We strictly use userService.createUser which now requires just profile data
        const user = await userService.createUser({
            id,
            firstName,
            email,
            username: `user${i + 1}`,
            profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
        });
        users.push(user);
    }

    // Follows
    console.log("Creating follow relationships...");
    for (const user of users) {
        const randomUsers = users.filter((u) => u.id !== user.id);
        const followCount = Math.floor(Math.random() * 5) + 1;

        for (let i = 0; i < followCount; i++) {
            const target = randomUsers[Math.floor(Math.random() * randomUsers.length)];
            try {
                await userService.followUser(user.id, target.id);
            } catch (e) {
                // ignore duplicate follows
            }
        }
    }

    // Posts
    console.log("Creating 100 mock posts...");
    for (let i = 0; i < 100; i++) {
        const author = users[Math.floor(Math.random() * users.length)];
        await prisma.post.create({
            data: {
                authorId: author.id,
                content: `This is post #${i + 1} from ${author.username}. #threads #clone`,
            }
        });
    }

    console.log("✅ Seed completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
