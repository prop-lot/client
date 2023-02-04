import IdeasService from "@/services/ideas";

import { IResolvers } from "@graphql-tools/utils";
import {
  QueryGetIdeaArgs,
  QueryGetIdeasArgs,
  MutationSubmitIdeaVoteArgs,
  MutationSubmitIdeaArgs,
  Idea,
  Vote,
  Comment,
} from "@/graphql/types/__generated__/apiTypes";
import { TagType } from "@prisma/client";

import { VirtualTags } from "@/utils/virtual";

const resolvers: IResolvers = {
  Query: {
    getIdea: async (_parent: any, args: QueryGetIdeaArgs) => {
      const idea = await IdeasService.get(args.options.ideaId as number);
      return idea;
    },
    getIdeas: async (
      _parent: any,
      args: QueryGetIdeasArgs
    ): Promise<Idea[]> => {
      const ideas: Idea[] = await IdeasService.all({
        sortBy: args.options.sort as string,
      });
      return ideas;
    },
  },
  Mutation: {
    submitIdeaComment: async (
      _parent: any,
      args: any,
      context
    ): Promise<Comment> => {
      if (!context.authScope.isAuthorized) {
        throw new Error("Failed to save comment: unauthorized");
      }
      const comment: Comment = await IdeasService.commentOnIdea(
        {
          ideaId: args.options.ideaId,
          body: args.options.body,
          parentId: args.options.parentId,
        },
        context.authScope.user
      );
      return comment;
    },
    submitIdeaVote: async (
      _parent: any,
      args: MutationSubmitIdeaVoteArgs,
      context
    ): Promise<Vote> => {
      if (!context.authScope.isAuthorized) {
        throw new Error("Failed to save vote: unauthorized");
      }

      const vote: Vote = await IdeasService.voteOnIdea(
        {
          ideaId: args.options.ideaId,
          direction: args.options.direction,
        },
        context.authScope.user
      );
      return vote;
    },
    submitIdea: async (
      _parent: any,
      args: MutationSubmitIdeaArgs,
      context
    ): Promise<Idea> => {
      if (!context.authScope.isAuthorized) {
        throw new Error("Failed to create idea: unauthorized");
      }

      const idea: Idea = await IdeasService.createIdea(
        {
          title: args.options.title,
          description: args.options.description,
          tldr: args.options.tldr,
          tags: (args.options.tags as TagType[]) || [],
        },
        context.authScope.user
      );
      return idea;
    },
  },
  Idea: {
    tags: async (root) => {
      const tags = root.tags;
      const matchingVirtualTags = Object.keys(VirtualTags)
        .filter((key) => {
          const vT = VirtualTags[key];
          return vT.filterFn(root);
        })
        .map((key) => {
          if (key === "CONSENSUS") {
            return {
              ...VirtualTags[key],
              label: `${root.consensus}% consensus`,
            };
          }
          return VirtualTags[key];
        });

      return [...matchingVirtualTags, ...tags];
    },
    comments: async (root) => {
      const comments = await IdeasService.getIdeaComments(root.id);
      return comments;
    },
    ideaStats: (root) => root._count,
  },
};

export default resolvers;
