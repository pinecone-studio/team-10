import { mergeTypeDefs } from "@graphql-tools/merge";
import { CatalogTypeDefs } from "./catalog.ts";
import { NotificationTypeDefs } from "./notification.ts";
import { OrderTypeDefs } from "./order.ts";
import { ReceiveTypeDefs } from "./receive.ts";

export const typeDefs = mergeTypeDefs([
  CatalogTypeDefs,
  NotificationTypeDefs,
  OrderTypeDefs,
  ReceiveTypeDefs,
]);
