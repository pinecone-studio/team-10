import { listEmployeeDirectory } from "../../../../lib/distribution/index.ts";

export const employeeDirectory = async (
  _parent: unknown,
  args: { activeOnly?: boolean | null },
  context: { db: Parameters<typeof listEmployeeDirectory>[0] },
) => {
  try {
    return await listEmployeeDirectory(context.db, {
      activeOnly: args.activeOnly ?? true,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown employee directory query error.";
    throw new Error(`Failed to fetch employee directory: ${message}`);
  }
};
