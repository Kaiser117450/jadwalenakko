import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const bundledWindowsCli =
  process.platform === "win32" && process.env.LOCALAPPDATA
    ? join(process.env.LOCALAPPDATA, "SpacetimeDB", "spacetime.exe")
    : null;

const cli =
  process.env.SPACETIMEDB_CLI ??
  (bundledWindowsCli && existsSync(bundledWindowsCli) ? bundledWindowsCli : "spacetime");

const result = spawnSync(cli, process.argv.slice(2), {
  stdio: "inherit",
  shell: false,
});

if (result.error) {
  throw result.error;
}

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
