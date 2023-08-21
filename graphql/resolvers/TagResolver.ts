import { IResolvers } from "@graphql-tools/utils";
import { IdeaTags } from "@/graphql/types/__generated__/apiTypes";
import { Tag } from "@prisma/client";

const resolvers: IResolvers = {
  Query: {
    getTags: async (): Promise<IdeaTags[]> => {
      const tags: Tag[] = await prisma.tag.findMany();
      return tags as IdeaTags[];
    },
  },
};

export default resolvers;
