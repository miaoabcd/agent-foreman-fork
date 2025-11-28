/**
 * Project scanner for analyzing existing codebases
 * Supports: Node.js, Go, Python with various frameworks
 */
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { glob } from "glob";
import type {
  ProjectSurvey,
  TechStackInfo,
  DirectoryStructure,
  ModuleInfo,
  DiscoveredFeature,
  CompletionAssessment,
  ProjectCommands,
} from "./types.js";

/**
 * Scan a project and return comprehensive survey
 */
export async function scanProject(basePath: string): Promise<ProjectSurvey> {
  const techStack = await detectTechStack(basePath);
  const structure = await scanDirectoryStructure(basePath);
  const modules = await scanModules(basePath, structure);
  const features = await discoverFeatures(basePath, techStack, structure);
  const completion = assessCompletion(modules);
  const commands = await detectCommands(basePath, techStack);

  return { techStack, structure, modules, features, completion, commands };
}

// ============================================================================
// Tech Stack Detection
// ============================================================================

/**
 * Detect the project's technology stack
 */
async function detectTechStack(basePath: string): Promise<TechStackInfo> {
  const info: TechStackInfo = {
    language: "unknown",
    framework: "unknown",
    buildTool: "unknown",
    testFramework: "unknown",
    packageManager: "unknown",
  };

  // Check for package.json (Node.js/TypeScript)
  await detectNodeStack(basePath, info);

  // Check for go.mod (Go)
  await detectGoStack(basePath, info);

  // Check for Python
  await detectPythonStack(basePath, info);

  return info;
}

async function detectNodeStack(basePath: string, info: TechStackInfo): Promise<void> {
  const packageJsonPath = path.join(basePath, "package.json");
  try {
    const content = await fs.readFile(packageJsonPath, "utf-8");
    const pkg = JSON.parse(content);
    info.language = "typescript/javascript";

    // Detect package manager
    info.packageManager = await detectNodePackageManager(basePath);

    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Detect framework
    if (deps["vue"]) info.framework = "vue";
    else if (deps["nuxt"]) info.framework = "nuxt";
    else if (deps["react"]) info.framework = "react";
    else if (deps["next"]) info.framework = "next";
    else if (deps["@angular/core"]) info.framework = "angular";
    else if (deps["astro"]) info.framework = "astro";
    else if (deps["express"]) info.framework = "express";
    else if (deps["fastify"]) info.framework = "fastify";
    else if (deps["koa"]) info.framework = "koa";
    else if (deps["hono"]) info.framework = "hono";

    // Detect test framework
    if (deps["vitest"]) info.testFramework = "vitest";
    else if (deps["jest"]) info.testFramework = "jest";
    else if (deps["mocha"]) info.testFramework = "mocha";
    else if (deps["ava"]) info.testFramework = "ava";

    // Detect build tool
    if (deps["vite"]) info.buildTool = "vite";
    else if (deps["webpack"]) info.buildTool = "webpack";
    else if (deps["esbuild"]) info.buildTool = "esbuild";
    else if (deps["rollup"]) info.buildTool = "rollup";
    else if (deps["parcel"]) info.buildTool = "parcel";
    else if (deps["turbo"]) info.buildTool = "turbo";
    else if (deps["typescript"]) info.buildTool = "tsc";
  } catch {
    // Not a Node.js project
  }
}

async function detectNodePackageManager(basePath: string): Promise<string> {
  try {
    await fs.access(path.join(basePath, "pnpm-lock.yaml"));
    return "pnpm";
  } catch {}

  try {
    await fs.access(path.join(basePath, "yarn.lock"));
    return "yarn";
  } catch {}

  try {
    await fs.access(path.join(basePath, "bun.lockb"));
    return "bun";
  } catch {}

  return "npm";
}

async function detectGoStack(basePath: string, info: TechStackInfo): Promise<void> {
  try {
    const goModPath = path.join(basePath, "go.mod");
    const goMod = await fs.readFile(goModPath, "utf-8");

    info.language = "go";
    info.buildTool = "go build";
    info.testFramework = "go test";
    info.packageManager = "go mod";

    // Detect framework
    if (goMod.includes("labstack/echo")) info.framework = "echo";
    else if (goMod.includes("gin-gonic/gin")) info.framework = "gin";
    else if (goMod.includes("gofiber/fiber")) info.framework = "fiber";
    else if (goMod.includes("go-chi/chi")) info.framework = "chi";
    else if (goMod.includes("gorilla/mux")) info.framework = "gorilla";
  } catch {
    // Not a Go project
  }
}

async function detectPythonStack(basePath: string, info: TechStackInfo): Promise<void> {
  // Check for pyproject.toml, requirements.txt, or setup.py
  const hasPyproject = await fileExists(path.join(basePath, "pyproject.toml"));
  const hasRequirements = await fileExists(path.join(basePath, "requirements.txt"));
  const hasSetupPy = await fileExists(path.join(basePath, "setup.py"));

  if (!hasPyproject && !hasRequirements && !hasSetupPy) return;

  info.language = "python";
  info.buildTool = "pip";

  // Detect package manager
  if (hasPyproject) {
    const content = await fs.readFile(path.join(basePath, "pyproject.toml"), "utf-8");
    if (content.includes("[tool.poetry]")) {
      info.packageManager = "poetry";
    } else if (content.includes("[tool.pdm]")) {
      info.packageManager = "pdm";
    } else {
      info.packageManager = "pip";
    }
  } else {
    info.packageManager = "pip";
  }

  // Read requirements to detect framework
  let deps = "";
  if (hasRequirements) {
    deps = await fs.readFile(path.join(basePath, "requirements.txt"), "utf-8");
  } else if (hasPyproject) {
    deps = await fs.readFile(path.join(basePath, "pyproject.toml"), "utf-8");
  }

  // Detect framework
  if (deps.includes("fastapi")) info.framework = "fastapi";
  else if (deps.includes("flask")) info.framework = "flask";
  else if (deps.includes("django")) info.framework = "django";
  else if (deps.includes("starlette")) info.framework = "starlette";
  else if (deps.includes("tornado")) info.framework = "tornado";

  // Detect test framework
  if (deps.includes("pytest")) info.testFramework = "pytest";
  else if (deps.includes("unittest")) info.testFramework = "unittest";
  else info.testFramework = "pytest"; // Default for Python
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Directory Structure Scanning
// ============================================================================

async function scanDirectoryStructure(basePath: string): Promise<DirectoryStructure> {
  const structure: DirectoryStructure = {
    entryPoints: [],
    srcDirs: [],
    testDirs: [],
    configFiles: [],
  };

  // Common entry points
  const entryPatterns = [
    "src/index.{ts,tsx,js,jsx}",
    "src/main.{ts,tsx,js,jsx}",
    "src/app.{ts,tsx,js,jsx}",
    "main.{go,ts,js,py}",
    "app.{py,ts,js}",
    "cmd/*/main.go",
    "server.{ts,js,py}",
    "index.{ts,js}",
  ];

  for (const pattern of entryPatterns) {
    const matches = await glob(pattern, { cwd: basePath });
    structure.entryPoints.push(...matches);
  }

  // Source directories
  const srcPatterns = ["src", "lib", "pkg", "internal", "app", "api", "core"];
  for (const dir of srcPatterns) {
    try {
      const stat = await fs.stat(path.join(basePath, dir));
      if (stat.isDirectory()) structure.srcDirs.push(dir);
    } catch {}
  }

  // Test directories
  const testPatterns = ["tests", "test", "__tests__", "spec", "e2e"];
  for (const dir of testPatterns) {
    try {
      const stat = await fs.stat(path.join(basePath, dir));
      if (stat.isDirectory()) structure.testDirs.push(dir);
    } catch {}
  }

  // Config files
  const configPatterns = [
    "*.config.{ts,js,json,mjs,cjs}",
    "tsconfig*.json",
    ".eslintrc*",
    ".prettierrc*",
    "vite.config.*",
    "next.config.*",
    "nuxt.config.*",
    "astro.config.*",
  ];

  for (const pattern of configPatterns) {
    const matches = await glob(pattern, { cwd: basePath });
    structure.configFiles.push(...matches);
  }

  return structure;
}

// ============================================================================
// Module Scanning
// ============================================================================

async function scanModules(
  basePath: string,
  structure: DirectoryStructure
): Promise<ModuleInfo[]> {
  const modules: ModuleInfo[] = [];

  for (const srcDir of structure.srcDirs) {
    const srcPath = path.join(basePath, srcDir);
    try {
      const entries = await fs.readdir(srcPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const modulePath = path.join(srcDir, entry.name);
          const files = await glob("**/*.{ts,tsx,js,jsx,go,py}", {
            cwd: path.join(basePath, modulePath),
          });

          modules.push({
            name: entry.name,
            path: modulePath,
            description: "",
            files,
            status: files.length > 3 ? "partial" : files.length > 0 ? "stub" : "stub",
          });
        }
      }
    } catch {}
  }

  return modules;
}

// ============================================================================
// Feature Discovery
// ============================================================================

async function discoverFeatures(
  basePath: string,
  techStack: TechStackInfo,
  structure: DirectoryStructure
): Promise<DiscoveredFeature[]> {
  const features: DiscoveredFeature[] = [];

  // Discover from routes
  const routeFeatures = await discoverFromRoutes(basePath, techStack);
  features.push(...routeFeatures);

  // Discover from tests
  const testFeatures = await discoverFromTests(basePath, structure);
  features.push(...testFeatures);

  // Remove duplicates by ID
  const uniqueFeatures = new Map<string, DiscoveredFeature>();
  for (const f of features) {
    if (!uniqueFeatures.has(f.id)) {
      uniqueFeatures.set(f.id, f);
    }
  }

  return Array.from(uniqueFeatures.values());
}

async function discoverFromRoutes(
  basePath: string,
  techStack: TechStackInfo
): Promise<DiscoveredFeature[]> {
  const features: DiscoveredFeature[] = [];

  // Route patterns by framework
  const patterns: Record<string, RegExp[]> = {
    express: [
      /\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi,
      /router\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi,
    ],
    fastify: [/fastify\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi],
    koa: [/router\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi],
    echo: [/e\.(GET|POST|PUT|DELETE|PATCH)\s*\(\s*["']([^"']+)["']/gi],
    gin: [/\.(GET|POST|PUT|DELETE|PATCH)\s*\(\s*["']([^"']+)["']/gi],
    fiber: [/app\.(Get|Post|Put|Delete|Patch)\s*\(\s*["']([^"']+)["']/gi],
    fastapi: [/@app\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/gi],
    flask: [/@app\.route\s*\(\s*["']([^"']+)["'][^)]*methods\s*=\s*\[["'](\w+)["']/gi],
    django: [/path\s*\(\s*["']([^"']+)["']/gi],
    vue: [/path:\s*["']([^"']+)["']/gi],
    nuxt: [/path:\s*["']([^"']+)["']/gi],
    react: [/path:\s*["']([^"']+)["']/gi],
    next: [/\/pages\/([^.]+)\./gi],
    astro: [/\/pages\/([^.]+)\./gi],
  };

  const frameworkPatterns = patterns[techStack.framework] || [];

  // Find route files
  const routeGlobs = [
    "**/*{route,router,controller,handler,api,endpoint}*.{ts,js,go,py}",
    "**/routes/**/*.{ts,js,go,py}",
    "**/api/**/*.{ts,js,go,py}",
    "**/controllers/**/*.{ts,js,go,py}",
  ];

  for (const routeGlob of routeGlobs) {
    const routeFiles = await glob(routeGlob, {
      cwd: basePath,
      ignore: ["node_modules/**", "dist/**", "build/**", ".git/**"],
    });

    for (const file of routeFiles) {
      try {
        const content = await fs.readFile(path.join(basePath, file), "utf-8");
        for (const pattern of frameworkPatterns) {
          // Reset regex lastIndex
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const method = match[1]?.toUpperCase() || "GET";
            const route = match[2] || match[1];
            if (route) {
              features.push({
                id: routeToFeatureId(route, method),
                description: `${method} ${route}`,
                module: extractModuleFromPath(file),
                source: "route",
                confidence: 0.8,
              });
            }
          }
        }
      } catch {}
    }
  }

  return features;
}

async function discoverFromTests(
  basePath: string,
  structure: DirectoryStructure
): Promise<DiscoveredFeature[]> {
  const features: DiscoveredFeature[] = [];

  const testPatterns = [
    "**/*.test.{ts,tsx,js,jsx}",
    "**/*.spec.{ts,tsx,js,jsx}",
    "**/*_test.go",
    "**/test_*.py",
    "**/*_test.py",
  ];

  for (const pattern of testPatterns) {
    const testFiles = await glob(pattern, {
      cwd: basePath,
      ignore: ["node_modules/**", "dist/**", ".git/**"],
    });

    for (const file of testFiles) {
      try {
        const content = await fs.readFile(path.join(basePath, file), "utf-8");

        // JavaScript/TypeScript test patterns
        const jsPatterns = [
          /describe\s*\(\s*["']([^"']+)["']/g,
          /it\s*\(\s*["']([^"']+)["']/g,
          /test\s*\(\s*["']([^"']+)["']/g,
        ];

        // Go test patterns
        const goPatterns = [/func\s+Test(\w+)\s*\(/g];

        // Python test patterns
        const pyPatterns = [
          /def\s+test_(\w+)\s*\(/g,
          /class\s+Test(\w+)\s*[:(]/g,
        ];

        const allPatterns = [...jsPatterns, ...goPatterns, ...pyPatterns];

        for (const pattern of allPatterns) {
          pattern.lastIndex = 0;
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const description = match[1];
            if (description && description.length > 2) {
              features.push({
                id: descriptionToFeatureId(description),
                description: description,
                module: extractModuleFromPath(file),
                source: "test",
                confidence: 0.9,
              });
            }
          }
        }
      } catch {}
    }
  }

  return features;
}

function routeToFeatureId(route: string, method: string): string {
  const normalized = route
    .replace(/^\//, "")
    .replace(/\//g, ".")
    .replace(/[{}:]/g, "")
    .replace(/[^a-z0-9.]/gi, "_")
    .toLowerCase();
  return `api.${method.toLowerCase()}.${normalized || "root"}`;
}

function descriptionToFeatureId(description: string): string {
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 50);
}

function extractModuleFromPath(filePath: string): string {
  const parts = filePath.split("/").filter(Boolean);
  // Skip common directory names
  const skipDirs = ["src", "lib", "app", "api", "test", "tests", "__tests__"];
  for (const part of parts) {
    if (!skipDirs.includes(part) && !part.includes(".")) {
      return part;
    }
  }
  return parts[0]?.replace(/\.[^.]+$/, "") || "main";
}

// ============================================================================
// Completion Assessment
// ============================================================================

function assessCompletion(modules: ModuleInfo[]): CompletionAssessment {
  const byModule: Record<string, number> = {};
  let totalScore = 0;

  for (const mod of modules) {
    const score = mod.status === "complete" ? 100 : mod.status === "partial" ? 50 : 10;
    byModule[mod.name] = score;
    totalScore += score;
  }

  return {
    overall: modules.length > 0 ? Math.round(totalScore / modules.length) : 0,
    byModule,
    notes: [],
  };
}

// ============================================================================
// Command Detection
// ============================================================================

async function detectCommands(
  basePath: string,
  techStack: TechStackInfo
): Promise<ProjectCommands> {
  const commands: ProjectCommands = {
    install: "",
    dev: "",
    build: "",
    test: "",
  };

  // Node.js commands
  if (techStack.language === "typescript/javascript") {
    try {
      const pkg = JSON.parse(
        await fs.readFile(path.join(basePath, "package.json"), "utf-8")
      );
      const scripts = pkg.scripts || {};
      const pm = techStack.packageManager;

      commands.install = `${pm} install`;
      commands.dev = scripts.dev ? `${pm} run dev` : "";
      commands.build = scripts.build ? `${pm} run build` : "";
      commands.test = scripts.test ? `${pm} run test` : "";
      commands.lint = scripts.lint ? `${pm} run lint` : undefined;
    } catch {}
  }

  // Go commands
  if (techStack.language === "go") {
    commands.install = "go mod tidy";
    commands.dev = "go run .";
    commands.build = "go build -o ./bin/app .";
    commands.test = "go test ./...";
  }

  // Python commands
  if (techStack.language === "python") {
    const pm = techStack.packageManager;
    if (pm === "poetry") {
      commands.install = "poetry install";
      commands.dev = "poetry run python -m app";
      commands.test = "poetry run pytest";
    } else if (pm === "pdm") {
      commands.install = "pdm install";
      commands.dev = "pdm run python -m app";
      commands.test = "pdm run pytest";
    } else {
      commands.install = "pip install -r requirements.txt";
      commands.dev = "python -m app";
      commands.test = "pytest";
    }
    commands.build = "";
  }

  return commands;
}

// ============================================================================
// Survey Markdown Generation
// ============================================================================

/**
 * Generate markdown report from survey results
 */
export function generateSurveyMarkdown(survey: ProjectSurvey): string {
  const lines: string[] = [];

  lines.push("# Project Survey\n");

  // Tech Stack
  lines.push("## Tech Stack\n");
  lines.push("| Aspect | Value |");
  lines.push("|--------|-------|");
  lines.push(`| Language | ${survey.techStack.language} |`);
  lines.push(`| Framework | ${survey.techStack.framework} |`);
  lines.push(`| Build Tool | ${survey.techStack.buildTool} |`);
  lines.push(`| Test Framework | ${survey.techStack.testFramework} |`);
  lines.push(`| Package Manager | ${survey.techStack.packageManager} |`);
  lines.push("");

  // Directory Structure
  lines.push("## Directory Structure\n");

  if (survey.structure.entryPoints.length > 0) {
    lines.push("### Entry Points");
    for (const e of survey.structure.entryPoints) {
      lines.push(`- \`${e}\``);
    }
    lines.push("");
  }

  if (survey.structure.srcDirs.length > 0) {
    lines.push("### Source Directories");
    for (const d of survey.structure.srcDirs) {
      lines.push(`- \`${d}/\``);
    }
    lines.push("");
  }

  if (survey.structure.testDirs.length > 0) {
    lines.push("### Test Directories");
    for (const d of survey.structure.testDirs) {
      lines.push(`- \`${d}/\``);
    }
    lines.push("");
  }

  if (survey.structure.configFiles.length > 0) {
    lines.push("### Config Files");
    for (const f of survey.structure.configFiles) {
      lines.push(`- \`${f}\``);
    }
    lines.push("");
  }

  // Modules
  if (survey.modules.length > 0) {
    lines.push("## Modules\n");
    for (const m of survey.modules) {
      lines.push(`### ${m.name}`);
      lines.push(`- **Path**: \`${m.path}\``);
      lines.push(`- **Status**: ${m.status}`);
      lines.push(`- **Files**: ${m.files.length}`);
      lines.push("");
    }
  }

  // Discovered Features
  if (survey.features.length > 0) {
    lines.push("## Discovered Features\n");
    lines.push("| ID | Description | Module | Source | Confidence |");
    lines.push("|----|-------------|--------|--------|------------|");
    for (const f of survey.features.slice(0, 50)) {
      // Limit to 50 for readability
      lines.push(
        `| ${f.id} | ${f.description} | ${f.module} | ${f.source} | ${Math.round(f.confidence * 100)}% |`
      );
    }
    if (survey.features.length > 50) {
      lines.push(`\n*... and ${survey.features.length - 50} more features*`);
    }
    lines.push("");
  }

  // Completion Assessment
  lines.push("## Completion Assessment\n");
  lines.push(`**Overall: ${survey.completion.overall}%**\n`);

  if (Object.keys(survey.completion.byModule).length > 0) {
    lines.push("| Module | Completion |");
    lines.push("|--------|------------|");
    for (const [m, c] of Object.entries(survey.completion.byModule)) {
      lines.push(`| ${m} | ${c}% |`);
    }
    lines.push("");
  }

  // Commands
  lines.push("## Commands\n");
  lines.push("```bash");
  if (survey.commands.install) lines.push(`# Install dependencies\n${survey.commands.install}\n`);
  if (survey.commands.dev) lines.push(`# Start development server\n${survey.commands.dev}\n`);
  if (survey.commands.build) lines.push(`# Build for production\n${survey.commands.build}\n`);
  if (survey.commands.test) lines.push(`# Run tests\n${survey.commands.test}`);
  if (survey.commands.lint) lines.push(`\n# Lint code\n${survey.commands.lint}`);
  lines.push("```\n");

  return lines.join("\n");
}
