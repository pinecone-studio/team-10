import { mergeTypeDefs } from "@graphql-tools/merge";
import { BaseTypeDefs } from "./base.ts";

export const typeDefs = mergeTypeDefs([BaseTypeDefs]);
