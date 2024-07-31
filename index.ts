#!/usr/bin/env node

import { white } from "kolorist";
import { startWorkflow } from "./src/workflow.js";
import { generateDapp } from "./src/generateDapp.js";
import { generateExample } from "./src/generateExample.js";
import { Command } from "commander";

const program = new Command();
program
  .name("")
  .description("")
  .version("aasd")
  .option("-pn, --name [value]", "Enter a new project name")
  .option(
    "-t, --template [value]",
    "Choose a template to start your application from"
  )
  .option(
    "-n, --network [value]",
    "select the network on which your application will run"
  )
  .parse(process.argv);

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
  // get the passed cli arguments
  const args = process.argv.slice(2);
  // if passed argument is `--example`
  if (args[0] === "--example") {
    // check there is a second argument
    if (!args[1]) throw new Error("Please provide an example name to generate");
    const exampleName = args[1];
    return generateExample(exampleName.trim(), args);
  }
  const selection = await startWorkflow();
  generateDapp(selection);
}

main().catch((e) => {
  console.error(e);
});
