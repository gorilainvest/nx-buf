import { exec } from "child_process";
import { LintExecutorSchema } from "./schema";
import { ExecutorContext, logger } from "@nx/devkit";
import * as path from "path";

export default async function runExecutor(
  { options }: LintExecutorSchema,
  context: ExecutorContext
) {
  try {
    const cwd = path.join(
      context.root,
      context.projectGraph!.nodes[context.projectName!]?.data.root
    );

    // Build the 'buf lint' command to be run
    let command = `npx buf lint`;
    if (typeof options === "string") command += ` ${options}`;

    await new Promise<void>((resolve, reject) =>
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          logger.error(stdout);
          logger.error(stderr);
          reject(error);
        } else {
          resolve();
        }
      })
    );
    return { success: true };
  } catch (error) {
    logger.error(error);
    return { success: false, error };
  }
}
