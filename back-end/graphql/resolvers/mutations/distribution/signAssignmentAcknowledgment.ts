import {
  signAssignmentAcknowledgment as signAssignmentAcknowledgmentRecord,
} from "../../../../lib/distribution/index.ts";
import type { GraphQLContext } from "../../../../lib/context.ts";

export const signAssignmentAcknowledgment = async (
  _parent: unknown,
  args: {
    token: string;
    signerName: string;
    signatureText: string;
  },
  context: Pick<GraphQLContext, "db" | "runtimeConfig" | "requestIpAddress">,
) => {
  try {
    return await signAssignmentAcknowledgmentRecord(
      context.db,
      context.runtimeConfig,
      {
        token: args.token,
        signerName: args.signerName,
        signatureText: args.signatureText,
        signerIpAddress: context.requestIpAddress,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown sign assignment acknowledgment resolver error.";
    throw new Error(`signAssignmentAcknowledgment failed: ${message}`);
  }
};
