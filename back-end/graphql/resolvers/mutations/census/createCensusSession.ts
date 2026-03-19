import type { MutationResolvers } from "../../../generated/types.ts";
import { createCensusSession as createCensusSessionRecord } from "../../../../lib/census/index.ts";

export const createCensusSession: NonNullable<
  MutationResolvers["createCensusSession"]
> = (_parent, args, context) =>
  createCensusSessionRecord(
    context.db,
    context.runtimeConfig,
    {
      title: args.title,
      scopeType: args.scopeType,
      scopeValue: args.scopeValue ?? null,
      dueAt: args.dueAt,
      note: args.note ?? null,
    },
    context.currentUserId,
  );
