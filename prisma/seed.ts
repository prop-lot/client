import { PrismaClient } from "@prisma/client";
import Chance from "chance";

const prisma = new PrismaClient();
const chance = new Chance();

async function seed() {
  const user: { wallet: string; ens: string; lilnounCount: number } = {
    ens: "test.eth",
    lilnounCount: 3,
    wallet: "",
  };

  const communityData = {
    name: "Nouns",
  };

  const community = await prisma.community.create({
    data: communityData,
  });

  for (let i = 0; i < 20; i++) {
    user.wallet = `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9${i}`;
    await prisma.user.create({ data: user });
  }

  for (let i = 0; i < 15; i++) {
    const idea = await prisma.idea.create({
      data: {
        communityId: community.id,
        title: chance.word({ length: 5 }),
        tldr: chance.sentence({ words: 5 }),
        description: chance.sentence({ words: 10 }),
        creatorId: `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9${i}`,
        votecount: 0,
        tokenSupplyOnCreate: 7 * i,
      },
    });

    for (let i = 0; i < 20; i++) {
      await prisma.vote.create({
        data: {
          ideaId: idea.id,
          voterId: `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9${i}`,
          direction: 1,
        },
      });
    }
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
