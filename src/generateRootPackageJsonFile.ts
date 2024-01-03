import fs from "node:fs";
import path from "path";
import { getOS } from "./utils/helpers.js";

/**
 * Generates the root package.json file for a template
 *
 * @param templateDir path to the template directory
 * @param selection Selections
 * @param projectName the chosen project name
 *
 * @returns the generated pkg file
 */
export const generateRootPackageJsonFile = (
  templateDir,
  selection,
  projectName
) => {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );
  // set package name to chosen project name
  pkg.name = projectName;

  // add npm scripts
  if (selection.environment === "node") {
    pkg.scripts[
      "postinstall"
    ] = `cd node && ${selection.packageManager} install`;
    pkg.scripts["start"] = `cd node && ts-node index.ts`;
  } else {
    pkg.scripts[
      "postinstall"
    ] = `cd frontend && ${selection.packageManager} install`;
    pkg.scripts["start"] = `cd frontend && ${selection.packageManager} run dev`;
  }

  const os = getOS();

  if (os === "Windows") {
    pkg.scripts[
      "move:init"
    ] = `Get-Content .env | ForEach-Object { [System.Environment]::SetEnvironmentVariable($_.Split('=')[0], $_.Split('=')[1], [System.EnvironmentVariableTarget]::Process) }
 && aptos init --network=$VITE_APP_NETWORK --profile=$VITE_APP_NETWORK`;
    pkg.scripts[
      "move:compile"
    ] = `Get-Content .env | ForEach-Object { [System.Environment]::SetEnvironmentVariable($_.Split('=')[0], $_.Split('=')[1], [System.EnvironmentVariableTarget]::Process) }
 && aptos move compile --package-dir move --skip-fetch-latest-git-deps --named-addresses module_addr=$(./scripts/get_module_addr.sh)`;
    pkg.scripts[
      "move:test"
    ] = `Get-Content .env | ForEach-Object { [System.Environment]::SetEnvironmentVariable($_.Split('=')[0], $_.Split('=')[1], [System.EnvironmentVariableTarget]::Process) }
 && aptos move test --package-dir move --skip-fetch-latest-git-deps --named-addresses module_addr=$(./scripts/get_module_addr.sh)`;
    pkg.scripts[
      "move:publish"
    ] = `Get-Content .env | ForEach-Object { [System.Environment]::SetEnvironmentVariable($_.Split('=')[0], $_.Split('=')[1], [System.EnvironmentVariableTarget]::Process) }
 && aptos move publish --package-dir move --skip-fetch-latest-git-deps --named-addresses module_addr=$(./scripts/get_module_addr.sh) --profile=$VITE_APP_NETWORK && ./scripts/gen_abi.sh`;
  } else {
    pkg.scripts[
      "move:init"
    ] = `export $(cat .env | xargs) && aptos init --network=$VITE_APP_NETWORK --profile=$VITE_APP_NETWORK`;
    pkg.scripts[
      "move:compile"
    ] = `export $(cat .env | xargs) && aptos move compile --package-dir move --skip-fetch-latest-git-deps --named-addresses module_addr=$(./scripts/get_module_addr.sh)`;
    pkg.scripts[
      "move:test"
    ] = `export $(cat .env | xargs) && aptos move test --package-dir move --skip-fetch-latest-git-deps --named-addresses module_addr=$(./scripts/get_module_addr.sh)`;
    pkg.scripts[
      "move:publish"
    ] = `export $(cat .env | xargs) && aptos move publish --package-dir move --skip-fetch-latest-git-deps --named-addresses module_addr=$(./scripts/get_module_addr.sh) --profile=$VITE_APP_NETWORK && ./scripts/gen_abi.sh`;
  }

  return pkg;
};
