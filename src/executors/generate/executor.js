"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const promises_1 = require("fs/promises");
const path = __importStar(require("path"));
const glob_1 = require("glob");
const devkit_1 = require("@nx/devkit");
async function runExecutor({ srcProject, copyFrom, copyTo, options }, context) {
    try {
        // Check if the source project exists in the project graph
        if (!(srcProject in context.projectGraph.nodes))
            throw new Error(`Root directory of source project "${srcProject}" not found.`);
        const protoRoot = path.join(context.projectGraph.nodes[srcProject]?.data.root);
        const targetProjectRoot = path.join(context.root, context.projectGraph.nodes[context.projectName]?.data.root);
        // Set the current working directory to the root directory of the source project
        const cwd = path.join(context.root, protoRoot);
        // Build the 'buf generate' command to be run
        let command = `npx buf generate`;
        if (typeof options === "string")
            command += ` ${options}`;
        // Run the 'buf generate' command in the current working directory
        if (context.isVerbose)
            devkit_1.logger.info(`running '${command}' on ${cwd}...`);
        await new Promise((resolve, reject) => (0, child_process_1.exec)(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                devkit_1.logger.error(stdout);
                devkit_1.logger.error(stderr);
                reject(error);
            }
            else {
                resolve();
            }
        }));
        // Remove the existing generated files in the target project directory
        const copyToPath = path.join(targetProjectRoot, copyTo);
        if (context.isVerbose)
            devkit_1.logger.info(`cleaning up ${copyToPath}`);
        await (0, promises_1.rm)(copyToPath, { recursive: true, force: true });
        // Get the list of generated files from the source project directory
        const targetGeneratedFles = await (0, glob_1.glob)(copyFrom.map((p) => path.join(cwd, p)));
        if (!targetGeneratedFles.length)
            throw new Error(`no files found to copy from patterns: ${JSON.stringify(copyFrom)}`);
        // Copy the generated files to the target project directory
        for (const file of targetGeneratedFles) {
            const targetFile = path.join(copyToPath, path.basename(file));
            if (context.isVerbose)
                devkit_1.logger.info(`copying ${file} to ${targetFile}`);
            await (0, promises_1.cp)(file, targetFile, { recursive: true, force: true });
        }
        // Return success if the function completes without errors
        return { success: true };
    }
    catch (error) {
        // Log the error and return failure if an error occurs
        devkit_1.logger.error(error);
        return { success: false, error };
    }
}
exports.default = runExecutor;
