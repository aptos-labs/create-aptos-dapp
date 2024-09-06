#!/usr/bin/env node

import { white } from "kolorist";
import { program } from "commander";
import { parseCommandOptions } from "./src/utils/parseCommandOptions.js";

program
  .name("")
  .description("")
  .option("-e, --example [value]", "specify the example to generate")
  .option("-ver, --verbose", "sdd error level logging verbosity");

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
    verbose: program.opts().verbose,
  };
  await parseCommandOptions(options);
}

main().catch((e) => {
  console.error(e);
});
