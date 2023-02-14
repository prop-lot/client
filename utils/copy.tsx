const COPYMAP = {
  nouns: {
    tokenName: "noun",
  },
  "lil-nouns": {
    tokenName: "lil noun",
  },
};

const getCopyFor = (collection: "nouns" | "lil-nouns", key: "tokenName") =>
  COPYMAP[collection][key];

export default getCopyFor;
