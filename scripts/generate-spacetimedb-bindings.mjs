import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, "..");
const moduleDir = resolve(rootDir, "spacetimedb");
const modulePackagePath = resolve(moduleDir, "package.json");
const modulePackage = JSON.parse(readFileSync(modulePackagePath, "utf8"));
const outputDir = resolve(moduleDir, modulePackage.spacetimedb.bindingOutput);
const databaseName =
  process.env.SPACETIMEDB_DATABASE ??
  modulePackage.spacetimedb.databaseName ??
  "enakko-jadwal-local";
const cli = process.env.SPACETIMEDB_CLI ?? "spacetime";
const args = [
  "generate",
  "--lang",
  "typescript",
  "--project-path",
  moduleDir,
  "--out-dir",
  outputDir,
];

if (process.env.SPACETIMEDB_SERVER) {
  args.push("--server", process.env.SPACETIMEDB_SERVER);
}

args.push(databaseName);
mkdirSync(outputDir, { recursive: true });

const result = spawnSync(cli, args, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  if (result.error.code === "ENOENT") {
    console.error(
      "Unable to find the SpacetimeDB CLI. Install `spacetime` and rerun `npm run spacetimedb:generate`."
    );
  } else {
    console.error(result.error.message);
  }

  process.exit(1);
}

process.exit(result.status ?? 1);
