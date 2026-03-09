/*
 * This file just for testing the ./prisma.ts
 */

import { randomInt } from "node:crypto";
import { prisma } from "./prisma";

let num = randomInt(20000);

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "test" + num,
      email: "email@mail." + num,
      order: {
        create: {
          title: "testTitle" + num,
        },
      },
    },
    include: {
      order: true,
    },
  });

  console.log(user);

  const allUsers = await prisma.user.findMany({
    include: {
      order: true,
    },
  });

  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
