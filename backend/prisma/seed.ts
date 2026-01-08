import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomBytes, createHmac } from "crypto";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Helper to generate password hash
function generateHash(password: string, salt: string): string {
    return createHmac("sha256", salt).update(password).digest("hex");
}

const firstNames = [
    "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth",
    "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
    "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Margaret", "Anthony", "Betty", "Donald", "Sandra"
];

const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"
];

const bioTemplates = [
    "Lover of coffee and code.",
    "Just here for the memes.",
    "Digital nomad exploring the world.",
    "Tech enthusiast & fitness junkie.",
    "Building things that matter.",
    "Photographer | Traveler | Dreamer",
    "Software Engineer by day, gamer by night.",
    "Passionate about AI and future tech.",
    "Living life one commit at a time.",
    "Music is my escape."
];

const postContents = [
    "Just started learning GraphQL, it's amazing! 🚀",
    "Anyone else excited about the new Threads features? 👀",
    "Coffee is the most important meal of the day. ☕",
    "Coding late at night hits different. 🌙",
    "Unpopular opinion: Tabs > Spaces. Fight me. 😂",
    "The weather is perfect for a hike today! 🌲",
    "Why is centering a div still so hard? CSS struggles.",
    "Just launched my new portfolio! Check it out.",
    "Reading a great book on system design. Highly recommend.",
    "Does anyone have advice for scaling Node.js apps?",
    "Happy Friday everyone! What are you working on?",
    "Simplicity is the soul of efficiency.",
    "Dream big, work hard, stay humble.",
    "Exploring the mountains this weekend. 🏔️",
    "Just watched a mind-blowing documentary on space."
];

const placeholderImages = [
    "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba",
    "https://images.unsplash.com/photo-1682687221038-404670e01d46",
    "https://images.unsplash.com/photo-1682687220063-4742bd7fd538",
    "https://images.unsplash.com/photo-1682687220198-88e9bdea9931",
    "https://images.unsplash.com/photo-1682687220067-dced9a881b56"
];

function getRandomUser() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    return {
        firstName,
        lastName,
        username,
        email: `${username}@example.com`,
        bio: bioTemplates[Math.floor(Math.random() * bioTemplates.length)],
        profileImageUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };
}

async function main() {
    console.log("🌱 Starting seed...");

    // 1. Create Users
    const users = [];
    const password = "password123";
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = generateHash(password, salt);

    console.log("Creating 20 mock users...");
    for (let i = 0; i < 20; i++) {
        const userData = getRandomUser();

        // Check if exists to avoid collision
        const existing = await prisma.user.findUnique({ where: { email: userData.email } });
        if (existing) continue;

        const user = await prisma.user.create({
            data: {
                ...userData,
                password: hashedPassword,
                salt,
                is_verified: Math.random() > 0.8, // 20% verified
            },
        });
        users.push(user);
    }

    if (users.length === 0) {
        console.log("No new users created (maybe already seeded?). Fetching existing...");
        const existingUsers = await prisma.user.findMany({ take: 20 });
        users.push(...existingUsers);
    }

    // 2. Create Follow Relationships (for suggested users sorting)
    console.log("Creating follow relationships...");
    for (const user of users) {
        // Each user follows 3-8 random other users
        const followCount = Math.floor(Math.random() * 5) + 3;
        const shuffled = users.filter(u => u.id !== user.id).sort(() => 0.5 - Math.random());
        const toFollow = shuffled.slice(0, followCount);

        for (const target of toFollow) {
            try {
                await prisma.follow.create({
                    data: {
                        followerId: user.id,
                        followingId: target.id,
                    },
                });
            } catch (e) {
                // Ignore duplicate follows
            }
        }
    }

    // 3. Create Posts
    console.log("Creating 100 mock posts...");
    for (let i = 0; i < 100; i++) {
        const author = users[Math.floor(Math.random() * users.length)];
        const content = postContents[Math.floor(Math.random() * postContents.length)];
        const hasImage = Math.random() > 0.7; // 30% chance of image

        const post = await prisma.post.create({
            data: {
                content,
                authorId: author.id,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random time in last 7 days
            },
        });

        if (hasImage) {
            await prisma.postMedia.create({
                data: {
                    postId: post.id,
                    mediaType: "IMAGE",
                    mediaUrl: `${placeholderImages[Math.floor(Math.random() * placeholderImages.length)]}?random=${i}`,
                    position: 0,
                },
            });
        }

        // Random likes (0-15)
        const likeCount = Math.floor(Math.random() * 15);
        const likers = users.filter(u => u.id !== author.id).sort(() => 0.5 - Math.random()).slice(0, likeCount);

        for (const liker of likers) {
            await prisma.postLike.create({
                data: {
                    userId: liker.id,
                    postId: post.id,
                },
            });
        }
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
