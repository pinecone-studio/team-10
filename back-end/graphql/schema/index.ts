import { mergeTypeDefs } from "@graphql-tools/merge";
import { TodoTypeDefs } from "./todo.ts";

export const typeDefs = mergeTypeDefs([TodoTypeDefs]);
