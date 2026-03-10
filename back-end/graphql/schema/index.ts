import { mergeTypeDefs } from "@graphql-tools/merge";
import { TestTypeDefs } from "./test";

export const typeDefs = mergeTypeDefs([TestTypeDefs]);
