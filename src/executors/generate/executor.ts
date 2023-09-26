import { exec } from "child_process";
import { cp, rm } from "fs/promises";
import * as path from "path";
import { glob } from "glob";
import { ExecutorContext, logger } from "@nx/devkit";
import { GenerateExecutorSchema } from "./schema";

export default async function runExecutor(
  { srcProject, copyFrom, copyTo }: GenerateExecutorSchema,
  context: ExecutorContext
) {
  try {
    // Check if the source project exists in the project graph
    if (!(srcProject in context.projectGraph!.nodes))
      throw new Error(
        `Root directory of source project "${srcProject}" not found.`
      );
    const protoRoot = path.join(
      context.projectGraph!.nodes[srcProject]?.data.root
    );
    const targetProjectRoot = path.join(
      context.root,
      context.projectGraph!.nodes[context.projectName!]?.data.root
    );

    // Set the current working directory to the root directory of the source project
    const cwd = path.join(context.root, protoRoot);

    // Run the 'buf generate' command in the current working directory
    if (context.isVerbose) logger.info(`running 'buf generate' on ${cwd}...`);
    await new Promise<void>((resolve, reject) =>
      exec(`npx buf generate`, { cwd }, (error, stdout, stderr) => {
        if (error) {
          logger.error(stdout);
          logger.error(stderr);
          reject(error);
        } else {
          resolve();
        }
      })
    );

    // Remove the existing generated files in the target project directory
    const copyToPath = path.join(targetProjectRoot, copyTo);
    if (context.isVerbose) logger.info(`cleaning up ${copyToPath}`);
    await rm(copyToPath, { recursive: true, force: true });

    // Get the list of generated files from the source project directory
    const targetGeneratedFles = await glob(
      copyFrom.map((p) => path.join(cwd, p))
    );
    if (!targetGeneratedFles.length)
      throw new Error(
        `no files found to copy from patterns: ${JSON.stringify(copyFrom)}`
      );

    // Copy the generated files to the target project directory
    for (const file of targetGeneratedFles) {
      const targetFile = path.join(copyToPath, path.basename(file));
      if (context.isVerbose) logger.info(`copying ${file} to ${targetFile}`);
      await cp(file, targetFile, { recursive: true, force: true });
    }

    // Return success if the function completes without errors
    return { success: true };
  } catch (error) {
    // Log the error and return failure if an error occurs
    logger.error(error);
    return { success: false, error };
  }
}
