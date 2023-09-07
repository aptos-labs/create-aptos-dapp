#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { startWorkflow } from "./src/workflow.js";
import { generateDapp } from "./src/generateDapp.js";
import { ArgumentOption } from "./src/constants.js";

const argumentOptions: ArgumentOption[] = [
  {
    shorthand: "n",
    flag: "name",
    description: "specify a name for your dapp",
  },
  {
    shorthand: "t",
    flag: "template",
    description: "specify a template to start your application from",
  },
  {
    shorthand: "c",
    flag: "network",
    description: "select the network on which your application will run",
  },
  {
    shorthand: "pm",
    flag: "packageManager",
    description: "specify the package manager your application will use",
  },
];

const program = new Command();
for (const option of argumentOptions) {
  program.option(
    `-${option.shorthand}, --${option.flag} [value]", "${option.description}`
  );
}
program.parse(process.argv);

console.log(
  chalk.white(`
                                                                               ./&@@@@@%*                   /%@@@#,
            @@.               #@@@@@@@@@@@@@*   (@@@@@@@@@@@@@@@@@@@@%     *@@@@@@@@@@@@@@@@@           *@@@@/..,@@@@@
           @@@@/              #@@*        /@@@           /@@(            /((((((((((((((*   *((*       ,@@@         %
          @@/ @@&             #@@*         @@@,          /@@(                         (@               .@@@
        ,@@,   &@@            #@@*         @@@           /@@(          @@@@@@@@@@@@@@@@@@@@@@@@@@@      .@@@@&.
       (@@      /@@           #@@#////#%@@@@&            /@@(                                              ,@@@@@@&
      %@@        .@@,         #@@@&&&&&&/                /@@(                    @@,                             &@@@@.
     @@@@@@@@@@@@@@@@#        #@@*                       /@@(          @@@@@@@@@%@@@@@@@@@@@@@@@@&                  @@@%
    @@%             @@@       #@@*                       /@@(                                            ,          .@@@
  .@@&               @@@      #@@*                       /@@(              &@@/                        @@@@        .@@@,
 #@@%                 @@@     #@@*                       /@@(               .@@@@@@@@@@@@@@@             %@@@@@@@@@@@/
`)
);
console.log("Welcome to the create-apt-dapp wizard 🔮");
process.on("SIGINT", () => {
  process.exit(0);
}); // CTRL+C
process.on("SIGQUIT", () => {
  process.exit(0);
}); // Keyboard quit
process.on("SIGTERM", () => {
  process.exit(0);
}); // `kill` command

async function main() {
  const programOptions = program.opts();
  const options = await startWorkflow(programOptions);
  generateDapp(options);
}

main().catch(console.error);
