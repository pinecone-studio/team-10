import {
  getAssignmentAcknowledgmentPdfByToken,
} from "../../../../lib/distribution/index.ts";
import type { GraphQLContext } from "../../../../lib/context.ts";

export const assignmentAcknowledgmentPdf = async (
  _parent: unknown,
  args: { token: string },
  context: Pick<GraphQLContext, "db" | "runtimeConfig">,
) => {
  try {
    return await getAssignmentAcknowledgmentPdfByToken(
      context.db,
      context.runtimeConfig,
      args.token,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown assignment acknowledgment PDF query error.";
    throw new Error(`Failed to load assignment acknowledgment PDF: ${message}`);
  }
};
