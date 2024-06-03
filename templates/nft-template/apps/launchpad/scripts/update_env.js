const fs = require("node:fs");
const yaml = require("js-yaml");
require("dotenv").config();

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][process.env.VITE_APP_NETWORK]["account"];

fs.appendFileSync(".env", `\nVITE_MODULE_ADDRESS=0x${accountAddress}`);
