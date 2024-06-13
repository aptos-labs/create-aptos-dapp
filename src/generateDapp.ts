import { green, bold, white } from "kolorist";
import path from "path";
import { fileURLToPath } from "node:url";
import fs from "fs/promises";
import type { Ora } from "ora";
import ora from "ora";
import { exec } from "child_process";
import { Selections } from "./types.js";
import { copy } from "./utils/helpers.js";

const spinner = (text) => ora({ text, stream: process.stdout });
let currentSpinner: Ora | null = null;

const runCommand = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout ? stdout : stderr);
    });
  });

export async function generateDapp(selection: Selections) {
  const projectName = selection.projectName || "my-aptos-dapp";

  // internal template directory path
  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../templates",
    selection.template
  );

  // current working directory
  const cwd = process.cwd();

  // target directory - current directory + chosen project name
  const targetDirectory = path.join(cwd, projectName);

  console.log(); // print new line
  const scaffoldingSpinner = spinner(
    `Scaffolding project in ${targetDirectory}`
  ).start();
  currentSpinner = scaffoldingSpinner;

  try {
    // make target directory if not exist
    await fs.mkdir(targetDirectory, { recursive: true });

    // internal template directory files
    const files = await fs.readdir(templateDir);

    // write to file
    const write = async (file: string, content?: string) => {
      // file to copy to target directory
      const targetPath = path.join(targetDirectory, file);
      if (content) {
        await fs.writeFile(targetPath, content);
      } else {
        await copy(path.join(templateDir, file), targetPath);
      }
    };

    // loop over template files and write to target directory
    // ignore .DS_Store, node_modules, package-lock.json, .aptos, build, .env
    await Promise.all(
      files
        .filter(
          (f) =>
            f !== ".DS_Store" &&
            f !== "node_modules" &&
            f !== "package-lock.json" &&
            f !== ".aptos" &&
            f !== "build" &&
            f !== ".env"
        )
        .map((file) => write(file))
    );

    // cd into target directory
    process.chdir(targetDirectory);

    scaffoldingSpinner.succeed();

    const npmSpinner = spinner("Installing dependencies.....").start();

    // install dependencies
    const installRootDepsCommand = `npm install --silent --no-progress`;
    await runCommand(installRootDepsCommand);

    npmSpinner.succeed();
    currentSpinner = npmSpinner;

    // create .env file
    const network = selection.network || "testnet";
    await write(".env", `VITE_APP_NETWORK=${network}`);

    // Log next steps
    console.log(
      green("\nSuccess! You're ready to start building your dapp on Aptos.")
    );

    console.log(bold("\nNext steps:") + "\n");
    console.log(
      green(`1. run ${white(`cd ${projectName}`)} to your dapp directory.`) +
        "\n"
    );
    console.log(
      green(
        `2. run ${white("npm run move:init")} to initialize a new CLI Profile.`
      ) + "\n"
    );
    console.log(
      green(
        `2. run ${white("npm run move:test")} to run move module unit tests.`
      ) + "\n"
    );
    console.log(
      green(
        `3. run ${white("npm run move:compile")} to compile your move contract.`
      ) + "\n"
    );
    console.log(
      green(
        `4. run ${white("npm run move:publish")} to publish your contract.`
      ) + "\n"
    );
    console.log(
      green(`5. run ${white("npm run dev")} to run your dapp.`) + "\n"
    );

    console.log(
      green(`6. open up your project in your favorite IDE and start coding!`) +
        "\n"
    );
  } catch (error: any) {
    currentSpinner?.fail(`Failed to scaffold project: ${error.message}`);
    console.error(error);
  }
}
