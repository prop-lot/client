import { typeDefs } from "./schemas/schema";
import { makeExecutableSchema } from "@graphql-tools/schema";
import resolvers from "./resolversMap";
import { GraphQLSchema } from "graphql";

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
