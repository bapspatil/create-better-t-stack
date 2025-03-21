import path from "node:path";
import fs from "fs-extra";
import type { ProjectAddons } from "../types";

export async function setupAddons(projectDir: string, addons: ProjectAddons[]) {
	if (addons.includes("docker")) {
		await setupDocker(projectDir);
	}
}

async function setupDocker(projectDir: string) {
	const dockerfileContent = `FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \\
		if [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
		elif [ -f package-lock.json ]; then npm ci; \\
		elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \\
		elif [ -f bun.lockb ]; then yarn global add bun && bun install --frozen-lockfile; \\
		else npm i; \\
		fi

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# First build client
RUN npm run build -w @better-t/client
# Then build server
RUN npm run build -w @better-t/server

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Copy necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/client/dist ./packages/client/dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/client/package.json ./packages/client/package.json

EXPOSE 3000

CMD ["node", "packages/server/dist/index.js"]
`;

	const dockerComposeContent = `version: '3'

services:
		app:
				build: .
				ports:
						- "3000:3000"
				environment:
						- NODE_ENV=production
						- TURSO_CONNECTION_URL=\${TURSO_CONNECTION_URL}
						- TURSO_AUTH_TOKEN=\${TURSO_AUTH_TOKEN}
						- CORS_ORIGIN=\${CORS_ORIGIN}
				restart: always
`;

	const dockerignoreContent = `.git
node_modules
**/node_modules
**/dist
.env
.env.*
`;

	await fs.writeFile(path.join(projectDir, "Dockerfile"), dockerfileContent);
	await fs.writeFile(
		path.join(projectDir, "docker-compose.yml"),
		dockerComposeContent,
	);
	await fs.writeFile(
		path.join(projectDir, ".dockerignore"),
		dockerignoreContent,
	);
}
