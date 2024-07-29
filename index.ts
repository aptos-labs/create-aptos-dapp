#!/usr/bin/env node

import { white } from "kolorist";
import { startWorkflow } from "./src/workflow.js";
import { generateDapp } from "./src/generateDapp.js";
import { generateExample } from "./src/generateExample.js";

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
    return generateExample(exampleName.trim());
  }
  const selection = await startWorkflow();
  generateDapp(selection);
}

main().catch((e) => {
  console.error(e);
});
