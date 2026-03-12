import type { QueryResolvers } from "../../../generated/types.ts";
import { listReceives } from "../../../../lib/receives.ts";

export const receives: NonNullable<QueryResolvers["receives"]> = async (
  _parent,
  _args,
  context,
) => listReceives(context.db);
