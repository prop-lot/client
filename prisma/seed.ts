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
    data: {
      name: "Nouns",
      pfpUrl:
        "https://i.seadn.io/gae/vfYB4RarIqixy2-wyfP4lIdK6fsOT8uNrmKxvYCJdjdRwAMj2ZjC2zTSxL-YKky0s-4Pb6eML7ze3Ouj54HrpUlfSWx52xF_ZK2TYw?auto=format&w=96",
    },
  };

  const community = await prisma.community.create({
    data: communityData,
  });

  const communityData2 = {
    uname: "lilnouns",
    data: {
      name: "Lil Nouns",
      pfpUrl:
        "https://i.seadn.io/gae/NeMen42xORQc--X_rAm6d5HCcRxkL5ZqAFi8LCSdFoRLi3AVNvEJ4Eo_-kFMnk8TVtPsnFxrMZ-DQIy-qjHgZnw4UFZYhjOWTmI_0w?auto=format&w=96",
    },
  };

  const community2 = await prisma.community.create({
    data: communityData2,
  });

  for (const type of [
    TagType.CREATIVE,
    TagType.COMMUNITY,
    TagType.GOVERNANCE,
    TagType.PUBLIC_GOOD,
    TagType.SOFTWARE,
    TagType.HARDWARE,
    TagType.OTHER,
  ]) {
    const words = type
      .split("_")
      .map(
        (word) =>
          word.toLowerCase()[0].toUpperCase() + word.toLowerCase().slice(1)
      );
    const label = words.join(" ");
    await prisma.tag.create({
      data: {
        type,
        label,
      },
    });
  }

  for (let i = 0; i < 20; i++) {
    user.wallet = `0xcf7ed3acca5a467e9e704c703e8d87f634fb0f${
      i < 10 ? `c${i}` : i
    }`;
    await prisma.user.create({ data: user });
  }

  for (let i = 0; i < 15; i++) {
    const idea = await prisma.idea.create({
      data: {
        communityId: i % 2 === 0 ? community.id : community2.id,
        title: chance.word({ length: 5 }),
        tldr: chance.sentence({ words: 5 }),
        description: chance.sentence({ words: 10 }),
        creatorId: `0xcf7ed3acca5a467e9e704c703e8d87f634fb0f${
          i < 10 ? `c${i}` : i
        }`,
        tokenSupplyOnCreate: 7 * i,
        createdAtBlock: 16534162,
      },
    });

    for (let i = 0; i < 20; i++) {
      await prisma.vote.create({
        data: {
          ideaId: idea.id,
          voterId: `0xcf7ed3acca5a467e9e704c703e8d87f634fb0f${
            i < 10 ? `c${i}` : i
          }`,
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
