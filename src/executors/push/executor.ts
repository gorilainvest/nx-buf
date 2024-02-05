import { exec } from "child_process";
import * as path from "path";
import { ExecutorContext, logger } from "@nx/devkit";
import { PushExecutorSchema } from "./schema";

export default async function runExecutor(
  { dryRun }: PushExecutorSchema,
  context: ExecutorContext
) {
  if (dryRun) {
    if (context.isVerbose)
      logger.info("Not running 'buf push' because the 'dryRun' flag is set.");
    return { success: true };
  }
  try {
    const protoRoot = path.join(
      context.root,
      context.projectGraph!.nodes[context.projectName!]?.data.root
    );

    // Set the current working directory to the root directory of the source project
    const cwd = path.join(context.root, protoRoot);

    // Run the 'buf generate' command in the current working directory
    if (context.isVerbose) logger.info(`running 'buf push' on ${cwd}...`);
    await new Promise<void>((resolve, reject) =>
      exec(`npx buf push`, { cwd }, (error, stdout, stderr) => {
        if (error) {
          logger.error(stdout);
          logger.error(stderr);
          reject(error);
        } else {
          resolve();
        }
      })
    );

    // Return success if the function completes without errors
    return { success: true };
  } catch (error) {
    // Log the error and return failure if an error occurs
    logger.error(error);
    return { success: false, error };
  }
}
