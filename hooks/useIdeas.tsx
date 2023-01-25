import useSWR, { useSWRConfig, Fetcher } from "swr";
import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useApiError } from "./useApiError";

export interface VoteFormData {
  id: number;
  direction: number;
  ideaId: number;
  voter: {
    lilnounCount: number;
  };
}

export interface CommentFormData {
  body: string;
  ideaId: number;
  parentId?: number;
}

export interface Vote {
  id: number;
  voterId: string;
  ideaId: number;
  direction: number;
  voter: {
    wallet: string;
    lilnounCount: number;
  };
}

export interface Tag {
  label: string;
  type: string;
}

export interface Idea {
  id: number;
  title: string;
  tldr: string;
  description: string;
  tags?: Tag[];
  votes?: Vote[];
  creatorId: string;
  comments?: Comment[];
  votecount: number;
  createdAt: string;
  closed: boolean;
  deleted: boolean;
  _count?: {
    comments: number;
  };
}

export interface Comment {
  id: number;
  body: string;
  ideaId: number;
  parentId: number | null;
  authorId: string;
  replies: Reply[];
  createdAt: string;
  deleted: boolean;
}

type Reply = Comment;

export const SORT_BY: { [key: string]: string } = {
  VOTES_DESC: "Votes Desc",
  LATEST: "Latest",
  VOTES_ASC: "Votes Asc",
  OLDEST: "Oldest",
};

// Update the vote count in the cache for an idea after a new vote is recorded.
const updateVotesState = (ideas: Idea[], vote: Vote) => {
  const {
    ideaId,
    direction,
    voterId,
    voter: { lilnounCount },
  } = vote;
  const updatedIdeas = ideas.map((idea) => {
    if (idea.id === ideaId) {
      let seenVote = false;
      let voteCount = idea.votecount + direction * lilnounCount;

      const newIdeaVotes =
        idea.votes?.map((v) => {
          if (v.voterId === voterId) {
            seenVote = true;
            voteCount = idea.votecount + direction * 2 * lilnounCount; // * by 2 to double the weighting against their previous vote
            return { ...vote, direction };
          } else {
            return vote;
          }
        }) || [];

      if (!seenVote) {
        newIdeaVotes.push(vote);
      }

      return { ...idea, voteCount, votes: newIdeaVotes };
    }

    return idea;
  }) as Idea[];
  return updatedIdeas;
};

const buildCommentState = (
  comments: Comment[],
  newComment: Comment,
  parentId: number
) => {
  let newComments = [];
  if (parentId) {
    newComments = comments.map((comment: Comment) => {
      if (comment.id === parentId) {
        comment.replies = [...comment.replies, newComment];
      }

      return comment;
    });
  } else {
    newComments = [...comments, newComment];
  }

  return newComments;
};

export const useIdeas = () => {
  const HOST = process.env.API_HOST;
  const { isLoggedIn, triggerSignIn } = useAuth();
  const { setError, error: errorModalVisible } = useApiError();
  const { mutate } = useSWRConfig();
  const [sortBy, setSortBy] = useState(undefined);

  useEffect(() => {
    if (sortBy !== undefined) {
      mutate(`${HOST}/ideas`);
    }
  }, [sortBy]);

  const fetcher: Fetcher = async (
    input: RequestInfo,
    init?: RequestInit,
    ...args: any[]
  ) => {
    if (!HOST) {
      throw new Error("API host not defined");
    }
    const res = await fetch(input, init);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  };

  const getIdeas = () => {
    const { data, error }: any = useSWR(`${HOST}/ideas`, (url) =>
      fetcher(`${url}?sort=${sortBy || "VOTES_DESC"}`)
    );
    if (error && !errorModalVisible) {
      setError(error);
    }

    return data?.data as Idea[];
  };

  const getIdea = (id: string) => {
    const { data, error }: any = useSWR(`${HOST}/idea/${id}`, fetcher);

    if (error && !errorModalVisible) {
      setError(error);
    }

    return data?.data as Idea;
  };

  const getComments = (id: string) => {
    const { data, error }: any = useSWR(`${HOST}/idea/${id}/comments`, fetcher);

    return { comments: data?.data as Comment[], error };
  };

  const castVote = async (formData: VoteFormData) => {
    const response = await fetch(`${HOST}/idea/vote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) throw new Error("Failed to add vote");
    return response.json();
  };

  // Use to cast votes on the idea/:id page with optimistic updates and revalidation
  const voteOnIdea = (formData: VoteFormData) => {
    try {
      mutate(
        `${HOST}/idea/${formData.ideaId}`,
        async () => await castVote(formData),
        {
          optimisticData: (data: { data: Idea }) => {
            const idea = updateVotesState([data.data], formData as Vote);
            return { data: idea[0] };
          },
          rollbackOnError: true,
          populateCache: (mutationResult, currentData) => {
            const idea = updateVotesState(
              [currentData.data],
              mutationResult.data as Vote
            );
            return { data: idea[0] };
          },
          revalidate: true,
        }
      );
    } catch (e: any) {
      const error = {
        message: e.message || "Failed to submit your vote!",
        status: e.status || 500,
      };
      setError(error);
    }
  };

  // Use to comment and reply with optimistic updates and revalidation
  const commentOnIdea = (formData: any) => {
    try {
      mutate(
        `${HOST}/idea/${formData.ideaId}/comments`,
        async () => {
          const response = await fetch(
            `${HOST}/idea/${formData.ideaId}/comments`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(formData),
            }
          );
          if (!response.ok) throw new Error("Failed to add comment");
          return response.json();
        },
        {
          optimisticData: ({ data }: { data: Comment[] }) => {
            const comments = buildCommentState(
              data,
              {
                ...formData,
                replies: [],
                createdAt: "Now",
                id: 0,
                timestamp: new Date(),
              },
              formData.parentId
            );

            return { data: comments };
          },
          rollbackOnError: true,
          populateCache: (
            { data }: { data: Comment },
            currentData: { data: Comment[] }
          ) => {
            const comments = buildCommentState(
              currentData.data,
              data,
              formData.parentId
            );
            return { data: comments.filter((comment) => comment.id !== 0) };
          },
          revalidate: true,
        }
      );
    } catch (e: any) {
      const error = {
        message: e.message || "Failed to submit your comment!",
        status: e.status || 500,
      };
      setError(error);
    }
  };

  // Use to cast votes on the ideas list with optimistic updates and revalidation
  const voteOnIdeaList = (formData: VoteFormData) => {
    try {
      mutate(`${HOST}/ideas`, async () => await castVote(formData), {
        optimisticData: (data: { data: Idea[] }) => {
          const ideas = updateVotesState(data.data, formData as Vote);
          return { data: ideas };
        },
        rollbackOnError: true,
        populateCache: (mutationResult, currentData) => {
          const ideas = updateVotesState(
            currentData.data,
            mutationResult.data as Vote
          );
          return { data: ideas };
        },
        revalidate: true,
      });
    } catch (e: any) {
      const error = {
        message: e.message || "Failed to submit your vote!",
        status: e.status || 500,
      };
      setError(error);
    }
  };

  const deleteCommentWithoutReValidation = async (
    ideaId: number,
    commentId: number
  ) => {
    const response = await fetch(`${HOST}/comment/${commentId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete comment");

    const data = await response.json();
    return data;
  };

  const deleteComment = (ideaId: number, commentId: number) => {
    const key = `${HOST}/idea/${ideaId}/comments`;
    try {
      mutate(
        key,
        async () => {
          const response = await fetch(`${HOST}/comment/${commentId}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Failed to delete comment");

          const data = await response.json();
          return data;
        },
        {
          optimisticData: ({ data }: { data: Comment[] }) => {
            const comments = data.map((comment) => {
              if (comment.id === commentId) {
                comment.deleted = true;
              }
              return comment;
            });

            return { data: comments };
          },
          rollbackOnError: true,
          populateCache: (
            { data }: { data: Comment },
            currentData: { data: Comment[] }
          ) => {
            return { data: currentData.data };
          },
          revalidate: true,
        }
      );
    } catch (e: any) {
      const error = {
        message: e.message || "Failed to delete your comment!",
        status: e.status || 500,
      };
      setError(error);
    }
  };

  // no mutate here, because we are getting the list of ideas from the graphql query and not the API.
  // there is no cache key to update. (unlike comments)
  const deleteIdea = async (id: number) => {
    try {
      const response = await fetch(`${HOST}/idea/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete idea");
      const idea = await response.json();
      return idea.data;
    } catch (e: any) {
      console.error(e);
      const error = {
        message: e.message || "Failed to delete your comment!",
        status: e.status || 500,
      };
      setError(error);
    }
  };

  return {
    voteOnIdeaList: async (formData: VoteFormData) => {
      if (!isLoggedIn) {
        try {
          await triggerSignIn();
          voteOnIdeaList(formData);
        } catch (e) {}
      } else {
        voteOnIdeaList(formData);
      }
    },
    voteOnIdea: async (formData: VoteFormData) => {
      if (!isLoggedIn) {
        try {
          await triggerSignIn();
          voteOnIdea(formData);
        } catch (e) {}
      } else {
        voteOnIdea(formData);
      }
    },
    commentOnIdea: async (formData: CommentFormData) => {
      if (!isLoggedIn) {
        try {
          await triggerSignIn();
          commentOnIdea(formData);
        } catch (e) {}
      } else {
        commentOnIdea(formData);
      }
    },
    deleteCommentWithoutReValidation: async (
      ideaId: number,
      commentId: number
    ) => {
      if (!isLoggedIn) {
        try {
          await triggerSignIn();
          await deleteCommentWithoutReValidation(ideaId, commentId);
        } catch (e) {}
      } else {
        await deleteCommentWithoutReValidation(ideaId, commentId);
      }
    },
    deleteComment: async (ideaId: number, commentId: number) => {
      if (!isLoggedIn) {
        try {
          await triggerSignIn();
          await deleteComment(ideaId, commentId);
        } catch (e) {}
      } else {
        await deleteComment(ideaId, commentId);
      }
    },
    deleteIdea: async (ideaId: number) => {
      if (!isLoggedIn) {
        try {
          await triggerSignIn();
          await deleteIdea(ideaId);
        } catch (e) {}
      } else {
        await deleteIdea(ideaId);
      }
    },
    getIdeas,
    getIdea,
    getComments,
    setSortBy,
  };
};
