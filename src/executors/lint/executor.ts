import { exec } from "child_process";
import { LintExecutorSchema } from "./schema";
import { ExecutorContext, logger } from "@nx/devkit";
import * as path from "path";

export default async function runExecutor(
  _: LintExecutorSchema,
  context: ExecutorContext
) {
  try {
    const cwd = path.join(
      context.root,
      context.projectGraph!.nodes[context.projectName!]?.data.root
    );

    await new Promise<void>((resolve, reject) =>
      exec(`npx buf lint`, { cwd }, (error, stdout, stderr) => {
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
