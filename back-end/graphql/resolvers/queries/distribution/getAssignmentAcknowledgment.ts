import {
  getAssignmentAcknowledgmentPreviewByToken,
} from "../../../../lib/distribution/index.ts";
import type { GraphQLContext } from "../../../../lib/context.ts";

export const assignmentAcknowledgment = async (
  _parent: unknown,
  args: { token: string },
  context: Pick<GraphQLContext, "db" | "runtimeConfig">,
) => {
  try {
    return await getAssignmentAcknowledgmentPreviewByToken(
      context.db,
      context.runtimeConfig,
      args.token,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown assignment acknowledgment query error.";
    throw new Error(`Failed to load assignment acknowledgment: ${message}`);
  }
};
