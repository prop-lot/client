import IdeasService from "@/services/ideas";

import { IResolvers } from "@graphql-tools/utils";
import {
  QueryGetIdeaArgs,
  QueryGetIdeasArgs,
  MutationSubmitIdeaVoteArgs,
  MutationSubmitIdeaArgs,
  MutationDeleteIdeaCommentArgs,
  Idea,
  Vote,
  Comment,
  MutationDeleteIdeaArgs,
  DeleteDataResponse,
} from "@/graphql/types/__generated__/apiTypes";
import { TagType } from "@prisma/client";

import { VirtualTags } from "@/utils/virtual";

import { getBlock } from "@/utils/ethers";

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
    deleteIdeaComment: async (
      _parent: any,
      args: MutationDeleteIdeaCommentArgs,
      context
    ): Promise<Comment> =>  {
      if (!context.authScope.isAuthorized) {
        throw new Error("Failed to delete comment: unauthorized");
      }

      const foundComment = await IdeasService.getComment(args.id);

      if (context.authScope.user.wallet !== foundComment?.authorId) {
        throw new Error("Failed to delete comment: you are not the author");
      }

      const comment: Comment = await IdeasService.deleteComment(args.id);
      return comment;
    },
    deleteIdea: async (
      _parent: any,
      args: MutationDeleteIdeaArgs,
      context
    ): Promise<DeleteDataResponse> =>  {
      if (!context.authScope.isAuthorized) {
        throw new Error("Failed to delete idea: unauthorized");
      }

      const foundIdea = await IdeasService.getIdeaRaw(args.id);

      if (context.authScope.user.wallet !== foundIdea?.creatorId) {
        throw new Error("Failed to delete idea: you are not the author");
      }

      const result: { id: number, success: boolean } = await IdeasService.deleteIdea(args.id);
      return result;
    },
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


      if (!context.communityTokenConfig?.getUserVoteWeightAtBlock) {
        throw new Error("Failed to save idea: token unsupported");
      }

      const vote: Vote = await IdeasService.voteOnIdea(
        {
          ideaId: args.options.ideaId,
          direction: args.options.direction,
        },
        context.communityTokenConfig.getUserVoteWeightAtBlock,
        context.authScope.user
      );
      return vote;
    },
    submitIdea: async (_parent: any, args: MutationSubmitIdeaArgs, context) => {
      if (!context.authScope.isAuthorized) {
        throw new Error("Failed to create idea: unauthorized");
      }

      const communityTokenConfig = context.communityTokenConfig;

      if (!communityTokenConfig?.getTotalSupply) {
        throw new Error("Failed to save idea: token unsupported");
      }

      const [totalSupply, currentBlock, authorTokenCount] = await Promise.all([communityTokenConfig.getTotalSupply(), getBlock(), communityTokenConfig.getUserTokenCount(context.authScope.user.wallet)]);

      if (!totalSupply || !currentBlock || !authorTokenCount) {
        throw new Error("Failed to save idea: couldn't fetch required data");
      }

      const idea = await IdeasService.createIdea(
        {
          title: args.options.title,
          description: args.options.description,
          tldr: args.options.tldr,
          tags: (args.options.tags as TagType[]) || [],
          communityId: context.communityId,
          totalSupply,
          currentBlock,
          authorTokenCount,
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
