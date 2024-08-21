#!/usr/bin/env node

import { white } from "kolorist";
import { startWorkflow } from "./src/workflow.js";
import { generateDapp } from "./src/generateDapp.js";
import { program } from "commander";
import { parseCommandOptions } from "./src/utils/parseCommandOptions.js";

program
  .name("")
  .description("")
  .option("-e, --example [value]", "Enter an example name");

program.parse();

console.log(
  white(`
   ###    ########  ########  #######   ######  
  ## ##   ##     ##    ##    ##     ## ##    ## 
 ##   ##  ##     ##    ##    ##     ## ##       
##     ## ########     ##    ##     ##  ######  
######### ##           ##    ##     ##       ## 
##     ## ##           ##    ##     ## ##    ## 
##     ## ##           ##     #######   ######                                                     
`)
);
console.log("Welcome to the create-aptos-dapp wizard 🌐");

async function main() {
  const options = {
    example: program.opts().example,
  };
  await parseCommandOptions(options);

  const selections = await startWorkflow();
  generateDapp(selections);
}

main().catch((e) => {
  console.error(e);
});
