import { execSync } from "child_process";
import chalk from "chalk";

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (e) {
    console.error("Failed to execute ${command}, e");
    return false;
  }
  return true;
};

export const generateDapp = async () => {
  // TODO:Update repoName to dynamic name
  const repoName = "my-aptos-dapp";
  const repoAddr = "https://github.com/0xmaayan/aptos-todolist.git";
  const gitCheckoutCommand = `git clone ${repoAddr} ${repoName}`;
  const installDepsCommand = `cd ${repoName}/frontend && npm install`;

  // Clone the repo
  console.log("Cloning the the create-apt-dapp repo...");
  const checkedOut = runCommand(gitCheckoutCommand);
  if (!checkedOut) {
    console.error("Failed to clone the repo");
    process.exit(-1);
  } else {
    console.log("Cloned successfully");
  }

  // create .env file
  console.log("Creating .env file...");
  runCommand(`cd ${repoName} && touch .env`);
  // TODO: Update network to dynamic network
  runCommand(`echo "REACT_APP_NETWORK=testnet" > ${repoName}/.env`);

  // Install dependencies
  console.log("Installing dependencies...");
  const installedDeps = runCommand(installDepsCommand);
  if (!installedDeps) {
    console.error("Failed to install dependencies");
    process.exit(-1);
  }

  console.log("Success! You're ready to start building your dapp on Aptos.");

  console.log(chalk.bold("\nNext steps:") + "\n");
  console.log(chalk.green(`run [cd ${repoName}] to your dapp directory.`));
  console.log(
    chalk.green(`run [npm run move:init] to initialize a new CLI Profile.`)
  );
  console.log(
    chalk.green(`run [npm run move:compile] to compile your contract.`)
  );
  console.log(
    chalk.green(`run [npm run move:publish] to publish your contract.`)
  );
};
