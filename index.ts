#!/usr/bin/env node

import chalk from "chalk";
import { Command } from "commander";
import { startStandardWorkflow } from "./standardWorkflow.js";
import { generateDapp } from "./generateDapp.js";

const program = new Command();
program
  .option("-n, --app_name [value]", "specify a name for your dapp")
  .option(
    "-t, --template [value]",
    "specify a template to start your application from"
  )
  .option(
    "-c, --chain [value]",
    "select the chain on which your application will run"
  )
  .option(
    "-pm, --package-manager [value]",
    "specify the package manager your application will use"
  )
  .parse(process.argv);

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
                                                                                   ..                                   
                                                   create-apt-dapp                                                                              
`)
);
console.log("Welcome to the create-apt-dapp wizard 🔮");

async function main() {
  const options = await startStandardWorkflow();
  generateDapp(options);
}

main();
