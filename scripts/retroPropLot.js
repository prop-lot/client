const { PrismaClient } = require("@prisma/client");
var csv = require("csv");
var fs = require("fs");
var path = require("path");

let prisma = new PrismaClient();

var ideaPath = path.join(__dirname, "idea.csv");
var ideaData = fs.readFileSync(ideaPath, "utf8");

var ideaTagPath = path.join(__dirname, "idea_tag.csv");
var ideaTagData = fs.readFileSync(ideaTagPath, "utf8");

var userPath = path.join(__dirname, "user.csv");
var userData = fs.readFileSync(userPath, "utf8");

var commentPath = path.join(__dirname, "comment.csv");
var commentData = fs.readFileSync(commentPath, "utf8");

var votePath = path.join(__dirname, "vote.csv");
var voteData = fs.readFileSync(votePath, "utf8");

let votes = [];
let comments = [];
let ideas = [];
let ideaTags = [];

const parseIdeas = () => {
  csv.parse(voteData, function (err, data) {
    const [headers, ...rows] = data;
    votes = rows.map((row) => {
      const zip = headers.map((h, i) => [h, row[i]]);
      const vote = zip.reduce((acc, [h, v]) => {
        if (h === "id") return acc;
        acc[h] = v;
        return acc;
      }, {});
      return vote;
    });

    csv.parse(commentData, function (err, data) {
      const [headers, ...rows] = data;
      comments = rows.map((row) => {
        const zip = headers.map((h, i) => [h, row[i]]);
        const comment = zip.reduce((acc, [h, v]) => {
          if (h === "id") return acc;
          acc[h] = v;
          return acc;
        }, {});
        return comment;
      });

      csv.parse(ideaTagData, function (err, data) {
        const [headers, ...rows] = data;
        ideaTags = rows.map((row) => {
          const zip = headers.map((h, i) => [h, row[i]]);
          const ideaTag = zip.reduce((acc, [h, v]) => {
            if (h === "id") return acc;
            acc[h] = v;
            return acc;
          }, {});
          return ideaTag;
        });

        csv.parse(ideaData, function (err, data) {
          const [headers, ...rows] = data;
          ideas = rows.map((row) => {
            const zip = headers.map((h, i) => [h, row[i]]);
            const idea = zip.reduce((acc, [h, v]) => {
              acc[h] = v;
              return acc;
            }, {});
            return idea;
          });

          // const group = ideas.slice(0, 5);
          const group = [ideas[0]];

          group.forEach(async (idea) => {
            const formattedIdea = await formatIdea(
              idea,
              ideaTags,
              votes,
              comments
            );
            postIdea(formattedIdea);
          });
        });
      });
    });
  });
};

const formatIdea = async (idea, ideaTags, allVotes, allComments) => {
  const tags = ideaTags.filter((it) => it.A === idea.id);
  const comments = allComments.filter((c) => c.ideaId === idea.id);
  const votes = allVotes.filter((v) => v.ideaId === idea.id);

  const formattedVotes = await Promise.all(
    votes.map(async (v) => {
      const user = await prisma.user.findUnique({
        where: { wallet: v.voterId },
      });

      return {
        voter: { connect: { wallet: v.voterId } },
        direction: parseInt(v.direction),
        voterWeight: parseInt(user.legacyTokenCount),
      };
    })
  );

  const formattedIdea = {
    title: idea.title,
    description: idea.description,
    tldr: idea.tldr,
    createdAt: new Date(idea.createdAt),
    updatedAt: new Date(idea.updatedAt),
    createdBy: { connect: { wallet: idea.creatorId } },
    // TODO -- CHANGE TO 3 WHEN IN PRODUCTION
    community: { connect: { id: 2 } },
    tags: {
      connect: tags.map((t) => ({ id: parseInt(t.B) })),
    },
    comments: {
      create: comments.map((c) => ({
        author: { connect: { wallet: c.authorId } },
        body: c.body,
      })),
    },
    votes: {
      create: formattedVotes,
    },
    // not sure about these... this data isn't in the old database
    tokenSupplyOnCreate: 7000,
    createdAtBlock: 16683000,
  };

  return formattedIdea;
};

const postIdea = async (idea) => {
  const newIdea = await prisma.idea.create({
    data: idea,
  });
};

const parseUsers = () => {
  csv.parse(userData, function (err, data) {
    const [headers, ...rows] = data;
    const users = rows.map((row) => {
      const zip = headers.map((h, i) => [h, row[i]]);
      const user = zip.reduce((acc, [h, v]) => {
        if (h === "id") return acc;
        if (h === "lilnounCount") {
          acc["legacyTokenCount"] = parseInt(v);
          return acc;
        }
        acc[h] = v;
        return acc;
      }, {});
      return user;
    });
    users.forEach((user) => {
      postUser(user);
    });
  });
};

const postUser = async (user) => {
  const upsertUser = await prisma.user.upsert({
    where: { wallet: user.wallet },
    update: {},
    create: user,
  });
};

parseIdeas();
// parseUsers();

/// steps ==> run parse users
/// steps ==> run parse ideas
