import { green, bold, red } from "kolorist";
import prompts from "prompts";
import path from "path";
import { fileURLToPath } from "node:url";
import type { Ora } from "ora";
import ora from "ora";
import fs from "fs/promises";
import { existsSync } from "node:fs";
import { copy, runCommand } from "./utils/helpers.js";
import { recordTelemetry } from "./telemetry.js";

const spinner = (text) => ora({ text, stream: process.stdout });

export async function generateExample(example: string, cliArgs: string[]) {
  let currentSpinner: Ora | null = null;

  // internal examples directory path
  const exampleDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../examples",
    example
  );

  // validate existing example folder for the provided example name
  try {
    await fs.access(exampleDir);
  } catch (error) {
    throw new Error(`${example} is not a valid example name`);
  }

  // Check if `example` folder already exists, if so ask the user whether to override
  // or not.
  const projectPath = path.resolve(example);
  const dirExists: boolean = existsSync(projectPath);

  if (dirExists) {
    const { confirm } = await prompts(
      [
        {
          type: "confirm",
          name: "confirm",
          message: `${example} folder already exists, override? (Default is Yes)`,
          initial: true,
        },
      ],
      {
        onCancel: () => {
          throw new Error(red("✖") + " Operation cancelled");
        },
      }
    );
    if (!confirm) {
      throw new Error(
        "decline override, please use another folder to generate the example in"
      );
    }
  }

  // current working directory
  const cwd = process.cwd();

  // target directory - current directory + chosen example
  const targetDirectory = path.join(cwd, example);

  console.log(); // print new line
  const scaffoldingSpinner = spinner(
    `Generating example in ${targetDirectory}`
  ).start();
  currentSpinner = scaffoldingSpinner;

  try {
    // make target directory if not exist
    await fs.mkdir(targetDirectory, { recursive: true });

    // internal example directory files
    const files = await fs.readdir(exampleDir);

    // write to file
    const write = async (file: string, content?: string) => {
      // file to copy to target directory
      const targetPath = path.join(targetDirectory, renameFiles[file] ?? file);

      if (content) {
        await fs.writeFile(targetPath, content);
      } else {
        await copy(path.join(exampleDir, file), targetPath);
      }
    };

    // Map of files to rename on build time
    const renameFiles: Record<string, string | undefined> = {
      // `npm publish` doesnt include the .gitignore file
      _gitignore: ".gitignore",
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

    // create .env file
    const envContent = `PROJECT_NAME=${example}\nVITE_APP_NETWORK=testnet`;
    await write(".env", envContent);

    await recordTelemetry({
      command: `npx create-aptos-dapp ${cliArgs.join(" ")}`,
      example: cliArgs[1],
    });

    scaffoldingSpinner.succeed();

    const npmSpinner = spinner("Installing dependencies.....").start();

    // install dependencies
    const installRootDepsCommand = `npm install --silent --no-progress`;
    await runCommand(installRootDepsCommand);

    npmSpinner.succeed();
    currentSpinner = npmSpinner;

    // Log next steps
    console.log(
      green(
        `\nSuccess! You're ready to start exploring the ${example} example.`
      )
    );

    console.log(bold("\nNext steps:") + "\n");

    console.log(green(`1. cd ${example}`) + "\n");
    console.log(green(`2. open in your favorite IDE`) + "\n");
  } catch (error: any) {
    currentSpinner?.fail(`Failed to scaffold project: ${error.message}`);
    console.error(error);
  }
}
