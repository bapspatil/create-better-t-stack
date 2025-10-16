import path from "node:path";
import fs from "fs-extra";
import type { ProjectConfig } from "../../types";
import { addPackageDependency } from "../../utils/add-package-deps";

export async function setupPayments(config: ProjectConfig) {
	const { payments, projectDir, frontend, backend } = config;

	if (!payments || payments === "none") {
		return;
	}

	const clientDir = path.join(projectDir, "apps/web");
	const authDir = path.join(projectDir, "packages/auth");
	const backendDir = path.join(projectDir, "packages/backend");

	const clientDirExists = await fs.pathExists(clientDir);
	const authDirExists = await fs.pathExists(authDir);
	const backendDirExists = await fs.pathExists(backendDir);

	if (payments === "polar") {
		// Handle Convex backend + Polar
		if (backend === "convex" && backendDirExists) {
			await addPackageDependency({
				dependencies: ["@convex-dev/polar"],
				projectDir: backendDir,
			});
		}

		// Handle traditional backend + Polar
		if (authDirExists && backend !== "convex") {
			await addPackageDependency({
				dependencies: ["@polar-sh/better-auth", "@polar-sh/sdk"],
				projectDir: authDir,
			});
		}

		if (clientDirExists) {
			const hasWebFrontend = frontend.some((f) =>
				[
					"react-router",
					"tanstack-router",
					"tanstack-start",
					"next",
					"nuxt",
					"svelte",
					"solid",
				].includes(f),
			);

			if (hasWebFrontend && backend !== "convex") {
				await addPackageDependency({
					dependencies: ["@polar-sh/better-auth"],
					projectDir: clientDir,
				});
			}
		}
	}
}
