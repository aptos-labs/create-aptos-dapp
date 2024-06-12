import { green, bold } from "kolorist";
import path from "path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

import { Selections } from "./types.js";
import { copy, runCommand } from "./utils/helpers.js";

export const generateDapp = async (selection: Selections) => {
  const projectName = selection.projectName || "my-aptos-dapp";

  // internal template directory path
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../templates",
    selection.template
  );
  // internal template directory files
  const files = fs.readdirSync(templateDir);

  // current working directory
  const cwd = process.cwd();

  // target directory - current directory + chosen project name
  const targetDirectory = path.join(cwd, projectName);

  // make target directory if not exist
  if (!fs.existsSync(targetDirectory)) {
    fs.mkdirSync(targetDirectory, { recursive: true });
  }

  // write to file
  const write = (file: string, content?: string) => {
    // file to copy to target directory
    const targetPath = path.join(targetDirectory, file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  // loop over template files and write to target directory
  // TODO - why does it include .DS_Store?
  for (const file of files.filter((f) => f !== ".DS_Store")) {
    write(file);
  }

  // cd into target directory
  process.chdir(targetDirectory);

  // install dependencies
  console.log(green(`\nScaffolding project in ${targetDirectory}`));

  const installRootDepsCommand = `npm install --silent --no-progress`;
  runCommand(installRootDepsCommand);

  // create .env file
  const network = selection.network || "testnet";
  write(".env", `VITE_APP_NETWORK=${network}`);

  // Log next steps
  console.log(
    green("\nSuccess! You're ready to start building your dapp on Aptos.")
  );

  console.log(bold("\nNext steps:") + "\n");
  console.log(
    green(`1. run [cd ${projectName}] to your dapp directory.`) + "\n"
  );
  console.log(
    green(`2. run [npm run move:init] to initialize a new CLI Profile.`) + "\n"
  );
  console.log(
    green(`2. run [npm run move:test] to run move module unit tests.`) + "\n"
  );
  console.log(
    green(`3. run [npm run move:compile] to compile your move contract.`) + "\n"
  );
  console.log(
    green(`4. run [npm run move:publish] to publish your contract.`) + "\n"
  );
  console.log(green(`5. run [npm run dev] to run your dapp.`) + "\n");
};
