const { spawn } = require("child_process");
require("dotenv").config();

const command = "npx";
const args = [
  "aptos",
  "init",
  `--network=${process.env.VITE_APP_NETWORK}`,
  `--profile=${process.env.VITE_APP_NETWORK}`,
];

var child = spawn(command, args);

child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);
process.stdin.pipe(child.stdin);
