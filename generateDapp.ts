import chalk from "chalk";
import { execSync } from "child_process";

export const generateDapp = async () => {
  const runCommand = (command) => {
    try {
      execSync(`${command}`, { stdio: "inherit" });
    } catch (e) {
      console.error(`Failed to execute ${command}`, e);
      return false;
    }
    return true;
  };

  const repoName = "my-aptos-dapp";
  const gitCheckoutCommand = `git clone --depth 1 https://github.com/0xmaayan/aptos-todolist ${repoName}`;
  const installDepsCommand = `cd ${repoName}/client && npm install`;

  console.log(chalk.blue(`Cloning the repository with name ${repoName}`));
  const checkedOut = runCommand(gitCheckoutCommand);
  if (!checkedOut) process.exit(-1);

  // console.log(`Installing dependencies for ${repoName}`);
  // const installedDeps = runCommand(installDepsCommand);
  // if (!installedDeps) process.exit(-1);

  console.log(
    chalk.blue(
      "Congratulations! You are ready. Follow the following commands to start"
    )
  );
  console.log(chalk.red(`cd ${repoName} && npm start`));
};
