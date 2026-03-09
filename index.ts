#!/usr/bin/env node

import { white } from "kolorist";
import { program } from "commander";
import { parseCommandOptions } from "./src/utils/parseCommandOptions.js";
import type { CliFlags } from "./src/types.js";

program
  .name("create-aptos-dapp")
  .description("Bootstrap an Aptos dapp")
  .argument("[project-name]", "Project name")
  .option("-e, --example [value]", "specify the example to generate")
  .option("-ver, --verbose", "add error level logging verbosity")
  .option("-p, --project-type <type>", "project type (move, fullstack)")
  .option("-t, --template <id>", "template ID")
  .option("-f, --framework <fw>", "framework (vite, nextjs)")
  .option("-n, --network <net>", "network (mainnet, testnet, devnet)")
  .option("--use-surf", "use Surf type-safety tool (boilerplate only)")
  .option("--api-key <key>", "API key for Aptos API")
  .option("--name <name>", "project name (alternative to positional arg)")
  .option("--list", "output valid options as JSON and exit");

program.parse();

const opts = program.opts();
const positionalName = program.args[0];

// Skip banner for --list (clean JSON output)
if (!opts.list) {
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
}

async function main() {
  const options: CliFlags = {
    example: opts.example,
    verbose: opts.verbose,
    name: positionalName || opts.name,
    projectType: opts.projectType,
    template: opts.template,
    framework: opts.framework,
    network: opts.network,
    useSurf: opts.useSurf,
    apiKey: opts.apiKey,
    list: opts.list,
  };
  await parseCommandOptions(options);
}

main().catch((e) => {
  console.error(e);
});
