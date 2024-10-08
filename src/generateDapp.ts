import fs from "fs/promises";
import { blue, bold, green, red } from "kolorist";
import type { Ora } from "ora";
import ora from "ora";
import path from "path";

// internal files
import { recordTelemetry } from "./utils/telemetry.js";
import type { Selections } from "./types.js";
import { context } from "./utils/context.js";
import { copy } from "./utils/helpers.js";
import { installDependencies } from "./utils/installDependencies.js";
import { generateTemplateEnvFile } from "./utils/generateTemplateEnvFile.js";
import { getTemplateDirectory } from "./utils/resolveTemplateDirectory.js";
import { installAptosCli } from "./utils/installAptosCli.js";
import { cleanupFilesForSurf } from "./utils/cleanupFilesForSurf.js";
import { FullstackBoilerplateTemplateInfo } from "./utils/constants.js";

const spinner = (text) => ora({ text, stream: process.stdout, color: "green" });
let currentSpinner: Ora | null = null;

export async function generateDapp(selection: Selections) {
  const projectName = selection.projectName || "my-aptos-dapp";
  // internal template directory path
  const templateDir = getTemplateDirectory(selection);

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
      const targetPath = path.join(targetDirectory, renameFiles[file] ?? file);

      if (content) {
        await fs.writeFile(targetPath, content);
      } else {
        copy(path.join(templateDir, file), targetPath);
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
            f !== ".env" &&
            f !== ".next" &&
            f !== "target" // this is for the rust template
        )
        .map((file) => write(file))
    );

    scaffoldingSpinner.succeed();

    // Change to target directory
    process.chdir(targetDirectory);

    if (
      selection.template.path === FullstackBoilerplateTemplateInfo.value.path
    ) {
      cleanupFilesForSurf(selection);
    }
    // Generate and write to template .env file
    const envFileContent = await generateTemplateEnvFile(selection, spinner);
    await write(".env", `${envFileContent}`);

    // Build instructions
    let docsInstructions = blue(
      `\n📖 Visit the ${selection.template.name} docs: ${red(
        selection.template.doc
      )}`
    );
    if (selection.template.video) {
      docsInstructions += blue(
        `\n🎬 Check out the walkthrough video: ${red(selection.template.video)}`
      );
    }

    console.log(
      `\nNeed to install dependencies, this might take a while - in the meantime:\n ${docsInstructions}\n`
    );

    // Install dependencies
    const npmSpinner = spinner(`Installing the dependencies\n`).start();
    currentSpinner = npmSpinner;
    await installDependencies(context);
    npmSpinner.succeed();

    // Install Aptos CLI
    const aptosCliSpinner = spinner(`Installing Aptos CLI`).start();
    currentSpinner = aptosCliSpinner;
    try {
      await installAptosCli();
      aptosCliSpinner.succeed();
    } catch (error) {
      console.log(
        `\nFailed to install Aptos CLI, will try to install it later, error: ${error}`
      );
      aptosCliSpinner.fail();
    }

    // Record telemetry
    await recordTelemetry({
      command: "npx create-aptos-dapp",
      project_name: selection.projectName,
      project_type: selection.projectType,
      template: selection.template.name,
      framework: selection.framework,
      network: selection.network,
      signing_option: selection.signingOption,
      use_surf: selection.useSurf,
    });

    // Log next steps
    console.log(
      green("\nSuccess! You're ready to start building your dapp on Aptos.")
    );

    console.log(bold("\nNext steps:"));

    console.log(green(`\nRun: cd ${projectName}`));

    console.log(green(`\nOpen in your favorite IDE && follow the README file`));

    console.log("\n");
  } catch (error: any) {
    currentSpinner?.fail(`Failed to scaffold project: ${error.message}`);
    console.error(error);
  }
}
