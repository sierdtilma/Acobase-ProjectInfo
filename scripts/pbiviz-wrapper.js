const { spawnSync } = require("child_process");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const args = process.argv.slice(2);

function run(command, commandArgs, env) {
  const result = spawnSync(command, commandArgs, {
    cwd: rootDir,
    stdio: "inherit",
    shell: false,
    env: env || process.env
  });

  if (result.error) {
    throw result.error;
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
}

const isPackageCommand = args[0] === "package";

if (isPackageCommand) {
  run("node", ["./scripts/bump-version.js"]);
}

run("node", ["./node_modules/powerbi-visuals-tools/bin/pbiviz.js", ...args]);
