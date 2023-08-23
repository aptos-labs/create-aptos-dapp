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
  let templateDirectory;
  switch (opts[ARGUMENT_NAMES.TEMPLATE]) {
    case "todolist":
      templateDirectory = "todolist";
      break;
    case "dapp-boilerplate":
      templateDirectory = "dapp-boilerplate";
      break;
    case "node-boilerplate":
      templateDirectory = "node-boilerplate";
      break;
    default:
      templateDirectory = "dapp-boilerplate";
  }
  const copyTemplateToProjectDirectory = `cp -r templates/${templateDirectory} ${projectName}/`;
  const installRootDepsCommand = `cd ${projectName} && ${opts.packageManager} install`;
  const replaceNpmUsagesCommand = `cd ${projectName} && sed -i.bak 's/npm/${opts.packageManager}/g' package.json && rm package.json.bak`;

  // Creating project directory
  console.log("Creating project...");
  const copiedTemplate = runCommand(copyTemplateToProjectDirectory);
  if (!copiedTemplate) {
    console.error("Failed to create project directory");
    process.exit(-1);
  } else {
    console.log("Created successfully");
  }

  // create .env file
  console.log("Creating .env file...");
  runCommand(`cd ${projectName} && touch .env`);
  const network = opts[ARGUMENT_NAMES.NETWORK] || "testnet";

  // TODO more sophisticate way to distinguish between node and web env
  if (templateDirectory === "node-boilerplate") {
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
      `2. run [${opts.packageManager} run move:init] to initialize a new Profile.`
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
