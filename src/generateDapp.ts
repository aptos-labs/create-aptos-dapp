import { execSync } from "child_process";
import chalk from "chalk";
import {
  ARGUMENT_NAMES,
  Template,
  Network,
  PackageManager,
} from "./constants.js";

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (e) {
    console.error(`Failed to execute ${command}`, e);
    return false;
  }
  return true;
};

export const generateDapp = async (opts: {
  name: string;
  template: Template;
  network: Network;
  packageManager: PackageManager;
}) => {
  const projectName = opts[ARGUMENT_NAMES.NAME] || "my-aptos-dapp";
  let repoAddr;
  switch (opts[ARGUMENT_NAMES.TEMPLATE]) {
    case "todolist-boilerplate":
      repoAddr = "https://github.com/aptos-labs/cad-todolist.git";
      break;
    case "dapp-boilerplate":
      repoAddr = "https://github.com/aptos-labs/cad-boilerplate.git";
      break;
    case "node-boilerplate":
      repoAddr = "https://github.com/aptos-labs/cad-node-boilerplate.git";
      break;
    default:
      repoAddr = "https://github.com/aptos-labs/cad-boilerplate.git";
  }
  const gitCheckoutCommand = `git clone ${repoAddr} ${projectName}`;
  const deleteDotGitCommand = `rm -rf ${projectName}/.git`;
  const replaceNpmUsagesCommand = `cd ${projectName} && sed -i.bak 's/npm/${opts.packageManager}/g' package.json && rm package.json.bak`;
  const installRootDepsCommand = `cd ${projectName} && ${opts.packageManager} install`;

  // Clone the repo
  console.log("Cloning template repo...");
  const checkedOut = runCommand(gitCheckoutCommand);
  const deleteDotGit = runCommand(deleteDotGitCommand);
  if (!checkedOut || !deleteDotGit) {
    console.error("Failed to clone the repo");
    process.exit(-1);
  } else {
    console.log("Cloned successfully");
  }

  // create .env file
  console.log("Creating .env file...");
  runCommand(`cd ${projectName} && touch .env`);
  const network = opts[ARGUMENT_NAMES.NETWORK] || "testnet";
  // TODO find a more sophisticate way to distinguish between node and web env
  if (opts[ARGUMENT_NAMES.TEMPLATE] === "node-boilerplate") {
    runCommand(`echo "APP_NETWORK=${network}" > ${projectName}/.env`);
    runCommand(`echo "APP_NETWORK=${network}" > ${projectName}/node/.env`);
  } else {
    runCommand(`echo "VITE_APP_NETWORK=${network}" > ${projectName}/.env`);
    runCommand(
      `echo "VITE_APP_NETWORK=${network}" > ${projectName}/frontend/.env`
    );
  }

  // Install dependencies
  console.log("Installing dependencies...");
  const replaceNpmUsages = runCommand(replaceNpmUsagesCommand);
  const installedRootDeps = runCommand(installRootDepsCommand);
  if (!replaceNpmUsages || !installedRootDeps) {
    console.error("Failed to install dependencies");
    process.exit(-1);
  }

  // Log next steps
  console.log("Success! You're ready to start building your dapp on Aptos.");

  console.log(chalk.bold("\nNext steps:") + "\n");
  console.log(
    chalk.green(`1. run [cd ${projectName}] to your dapp directory.`) + "\n"
  );
  console.log(
    chalk.green(
      `2. run [${opts.packageManager} run move:init] to initialize a new CLI Profile.`
    ) + "\n"
  );
  console.log(
    chalk.green(
      `3. run [${opts.packageManager} run move:compile] to compile your move contract.`
    ) + "\n"
  );
  console.log(
    chalk.green(
      `4. run [${opts.packageManager} run move:publish] to publish your contract.`
    ) + "\n"
  );
  console.log(
    chalk.green(`5. run [${opts.packageManager} start] to run your dapp.`) +
      "\n"
  );
};