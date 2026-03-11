import { mergeTypeDefs } from "@graphql-tools/merge";
import { OrderTypeDefs } from "./order.ts";
import { TodoTypeDefs } from "./todo.ts";

export const typeDefs = mergeTypeDefs([TodoTypeDefs, OrderTypeDefs]);
