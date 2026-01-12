import { prisma } from "../src/lib/prisma.js";
import { userService } from "../src/graphql/user/user.service.js";
import { randomUUID } from "crypto";
import { faker } from "@faker-js/faker";

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (order matters)
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

  /**
   * USERS
   */
  console.log("Creating 100 mock users...");
  const users = [];

  for (let i = 0; i < 100; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const user = await userService.createUser({
      id: randomUUID(), // Supabase-style ID
      firstName,
      lastName,
      email,
      username,
      profileImageUrl: `https://picsum.photos/seed/${username}/200`, // ✅ Picsum avatar
    });

    users.push(user);
  }

  /**
   * FOLLOWS
   */
  console.log("Creating follow relationships...");
  for (const user of users) {
    const targets = users.filter((u) => u.id !== user.id);
    const followCount = faker.number.int({ min: 1, max: 5 });

    for (let i = 0; i < followCount; i++) {
      const target = faker.helpers.arrayElement(targets);
      try {
        await userService.followUser(user.id, target.id);
      } catch {
        // ignore duplicates
      }
    }
  }

  /**
   * POSTS
   */
  console.log("Creating 1000 mock posts...");
  for (let i = 0; i < 1000; i++) {
    const author = faker.helpers.arrayElement(users);

    const post = await prisma.post.create({
      data: {
        authorId: author.id,
        content: faker.lorem.paragraph({
          min: 1,
          max: 3,
        }),
      },
    });

    /**
     * OPTIONAL: Add image media to some posts
     */
    if (faker.datatype.boolean()) {
      await prisma.postMedia.create({
        data: {
          postId: post.id,
          mediaUrl: `https://picsum.photos/seed/${post.id}/800/600`,
          mediaType: "IMAGE",
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
