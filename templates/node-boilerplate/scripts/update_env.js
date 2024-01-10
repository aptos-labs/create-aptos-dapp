const fs = require("node:fs");
const yaml = require("js-yaml");
require("dotenv").config();

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress = config["profiles"][process.env.APP_NETWORK]["account"];

fs.appendFileSync(".env", `\nMODULE_ADDRESS=0x${accountAddress}`);
fs.appendFileSync("node/.env", `\nMODULE_ADDRESS=0x${accountAddress}`);
