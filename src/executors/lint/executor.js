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
const devkit_1 = require("@nx/devkit");
const path = __importStar(require("path"));
async function runExecutor(_, context) {
    try {
        const cwd = path.join(context.root, context.projectGraph.nodes[context.projectName]?.data.root);
        await new Promise((resolve, reject) => (0, child_process_1.exec)(`npx buf lint`, { cwd }, (error, stdout, stderr) => {
            if (error) {
                devkit_1.logger.error(stdout);
                devkit_1.logger.error(stderr);
                reject(error);
            }
            else {
                resolve();
            }
        }));
        return { success: true };
    }
    catch (error) {
        devkit_1.logger.error(error);
        return { success: false, error };
    }
}
exports.default = runExecutor;
