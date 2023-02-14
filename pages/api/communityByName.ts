import { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const community = await prisma.community.findFirst({
    where: {
      name: req.body.name,
    },
  });

  res.json({ community });
};

export default handler;
