import { cancel, group, log } from "@clack/prompts";
import pc from "picocolors";
import type {
	ProjectAddons,
	ProjectBackend,
	ProjectConfig,
	ProjectDBSetup,
	ProjectDatabase,
	ProjectExamples,
	ProjectFrontend,
	ProjectOrm,
	ProjectPackageManager,
	ProjectRuntime,
} from "../types";
import { getAddonsChoice } from "./addons";
import { getAuthChoice } from "./auth";
import { getBackendFrameworkChoice } from "./backend-framework";
import { getDatabaseChoice } from "./database";
import { getDBSetupChoice } from "./db-setup";
import { getExamplesChoice } from "./examples";
import { getFrontendChoice } from "./frontend-option";
import { getGitChoice } from "./git";
import { getNoInstallChoice } from "./install";
import { getORMChoice } from "./orm";
import { getPackageManagerChoice } from "./package-manager";
import { getProjectName } from "./project-name";
import { getRuntimeChoice } from "./runtime";

type PromptGroupResults = {
	projectName: string;
	database: ProjectDatabase;
	orm: ProjectOrm;
	auth: boolean;
	addons: ProjectAddons[];
	examples: ProjectExamples[];
	git: boolean;
	packageManager: ProjectPackageManager;
	noInstall: boolean;
	dbSetup: ProjectDBSetup;
	backend: ProjectBackend;
	runtime: ProjectRuntime;
	frontend: ProjectFrontend[];
};

export async function gatherConfig(
	flags: Partial<ProjectConfig>,
): Promise<ProjectConfig> {
	const result = await group<PromptGroupResults>(
		{
			projectName: async () => {
				return getProjectName(flags.projectName);
			},
			frontend: () => getFrontendChoice(flags.frontend),
			backend: () => getBackendFrameworkChoice(flags.backend),
			runtime: ({ results }) =>
				getRuntimeChoice(flags.runtime, results.backend),
			database: () => getDatabaseChoice(flags.database),
			orm: ({ results }) =>
				getORMChoice(flags.orm, results.database !== "none", results.database),
			auth: ({ results }) =>
				getAuthChoice(
					flags.auth,
					results.database !== "none",
					results.frontend,
				),
			addons: ({ results }) => getAddonsChoice(flags.addons, results.frontend),
			examples: ({ results }) =>
				getExamplesChoice(
					flags.examples,
					results.database,
					results.frontend,
					results.backend,
				),
			dbSetup: ({ results }) =>
				getDBSetupChoice(
					results.database ?? "none",
					flags.dbSetup,
					results.orm,
				),
			git: () => getGitChoice(flags.git),
			packageManager: () => getPackageManagerChoice(flags.packageManager),
			noInstall: () => getNoInstallChoice(flags.noInstall),
		},
		{
			onCancel: () => {
				cancel(pc.red("Operation cancelled"));
				process.exit(0);
			},
		},
	);

	return {
		projectName: result.projectName,
		frontend: result.frontend,
		database: result.database,
		orm: result.orm,
		auth: result.auth,
		addons: result.addons,
		examples: result.examples,
		git: result.git,
		packageManager: result.packageManager,
		noInstall: result.noInstall,
		dbSetup: result.dbSetup,
		backend: result.backend,
		runtime: result.runtime,
	};
}
