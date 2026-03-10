import { mergeTypeDefs } from "@graphql-tools/merge";
import { TodoTypeDefs } from "./todo";

export const typeDefs = mergeTypeDefs([TodoTypeDefs]);
