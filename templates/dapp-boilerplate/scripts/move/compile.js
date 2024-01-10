const { spawn } = require("child_process");
const fs = require("node:fs");
const yaml = require("js-yaml");
require("dotenv").config();

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][process.env.VITE_APP_NETWORK]["account"];

const command = "npx";
const args = [
  "aptos",
  "move",
  "compile",
  "--package-dir",
  "move",
  "--skip-fetch-latest-git-deps",
  "--named-addresses",
  `module_addr=${accountAddress}`,
];

var child = spawn(command, args);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
process.stdin.pipe(child.stdin);
