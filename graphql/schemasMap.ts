import 'graphql-import-node';
import * as typeDefs from '@/graphql/schemas/schema.graphql';
import { makeExecutableSchema } from "@graphql-tools/schema";
import resolvers from "./resolversMap";
import { GraphQLSchema } from "graphql";

const schema: GraphQLSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
