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
const devkit_1 = require("@nx/devkit");
const fs_1 = require("fs");
const path = __importStar(require("path"));
const plugin = {
    name: "nx-buf",
    createDependencies(...args) {
        const projectMap = args.length === 2
            ? args[1].projects
            : "projects" in args[0]
                ? args[0].projects
                : args[0].projectsConfigurations?.projects;
        if (!projectMap) {
            devkit_1.logger.warn("Could not find project map");
            return [];
        }
        const deps = [];
        for (const [project, config] of Object.entries(projectMap)) {
            const bufTask = Object.values(config.targets ?? {}).find((target) => target.executor === "@gorilainvest/nx-buf:generate");
            if (!bufTask?.options)
                continue;
            const projectJsonPath = path.join(config.root, "project.json");
            if (!(0, fs_1.existsSync)(projectJsonPath)) {
                devkit_1.logger.warn(`Project file ${projectJsonPath} does not exist.`);
                continue;
            }
            deps.push({
                source: project,
                target: bufTask.options.srcProject,
                sourceFile: projectJsonPath,
                type: devkit_1.DependencyType.static,
                dependencyType: devkit_1.DependencyType.static, // compat with 16.7
            });
        }
        return deps;
    },
};
module.exports = plugin;
