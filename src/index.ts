import {
  DependencyType,
  NxPluginV2,
  ProjectConfiguration,
  RawProjectGraphDependency,
  StaticDependency,
  TargetConfiguration,
  logger,
} from "@nx/devkit";
import { GenerateExecutorSchema } from "./executors/generate/schema";
import { existsSync } from "fs";
import * as path from "path";

const plugin: NxPluginV2 = {
  name: "nx-buf",
  createDependencies(context) {
    const deps: RawProjectGraphDependency[] = [];

    for (const [project, config] of Object.entries(
      context.projects ??
        ((context as any).projectsConfigurations // compat with 16.7
          ?.projects as ProjectConfiguration[])
    )) {
      const bufTask = Object.values(config.targets ?? {}).find(
        (target) => target.executor === "@gorilainvest/nx-buf:generate"
      ) as TargetConfiguration<GenerateExecutorSchema> | undefined;
      if (!bufTask?.options) continue;

      const projectJsonPath = path.join(config.root, "project.json");
      if (!existsSync(projectJsonPath)) {
        logger.warn(`Project file ${projectJsonPath} does not exist.`);
        continue;
      }

      deps.push({
        source: project,
        target: bufTask.options.srcProject,
        sourceFile: projectJsonPath,
        type: DependencyType.static,
        dependencyType: DependencyType.static, // compat with 16.7
      } as any as StaticDependency);
    }

    return deps;
  },
};

export = plugin;
