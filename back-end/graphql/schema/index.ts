import { mergeTypeDefs } from "@graphql-tools/merge";
import { OrderTypeDefs } from "./order.ts";
import { ReceiveTypeDefs } from "./receive.ts";

export const typeDefs = mergeTypeDefs([OrderTypeDefs, ReceiveTypeDefs]);
