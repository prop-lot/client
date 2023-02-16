import { PrismaClient, TagType } from "@prisma/client";
import Chance from "chance";

const prisma = new PrismaClient();
const chance = new Chance();

async function seed() {
  const user: { wallet: string; ens: string } = {
    ens: "test.eth",
    wallet: "",
  };

  const communityData = {
    uname: "nouns",
    data: {},
  };

  const community = await prisma.community.create({
    data: communityData,
  });

  const communityData2 = {
    uname: "lilnouns",
    data: {},
  };

  const community2 = await prisma.community.create({
    data: communityData2,
  });

  for (const type of [
    TagType.REQUEST,
    TagType.OTHER,
    TagType.SUGGESTION,
    TagType.GOVERNANCE,
    TagType.COMMUNITY,
  ]) {
    const lowercaseType = type.toLowerCase();
    const label = lowercaseType[0].toUpperCase() + lowercaseType.slice(1);
    await prisma.tag.create({
      data: {
        type,
        label,
      },
    });
  }

  for (let i = 0; i < 20; i++) {
    user.wallet = `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9${i}`;
    await prisma.user.create({ data: user });
  }

  for (let i = 0; i < 15; i++) {
    const idea = await prisma.idea.create({
      data: {
        communityId: i % 2 === 0 ? community.id : community2.id,
        title: chance.word({ length: 5 }),
        tldr: chance.sentence({ words: 5 }),
        description: chance.sentence({ words: 10 }),
        creatorId: `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9${i}`,
        tokenSupplyOnCreate: 7 * i,
        createdAtBlock: 16534162,
      },
    });

    for (let i = 0; i < 20; i++) {
      await prisma.vote.create({
        data: {
          ideaId: idea.id,
          voterId: `0xcf7ed3acca5a467e9e704c703e8d87f634fb0fc9${i}`,
          direction: 1,
          voterWeight: i * 3 + 1,
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
