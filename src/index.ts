import {
  CreateDependencies,
  CreateDependenciesContext,
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

type CreateDependenciesParametersCompat =
  | Parameters<CreateDependencies> // v17
  | [CreateDependenciesContext] // v16.7
  | [
      {
        projectsConfigurations?: {
          projects: Record<string, ProjectConfiguration>;
        };
      }
    ]; // <v16.7

const plugin: NxPluginV2 = {
  name: "nx-buf",
  createDependencies(...args: CreateDependenciesParametersCompat) {
    const projectMap =
      args.length === 2
        ? args[1].projects
        : "projects" in args[0]
        ? args[0].projects
        : args[0].projectsConfigurations?.projects;
    if (!projectMap) {
      logger.warn("Could not find project map");
      return [];
    }

    const deps: RawProjectGraphDependency[] = [];
    for (const [project, config] of Object.entries(projectMap)) {
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
