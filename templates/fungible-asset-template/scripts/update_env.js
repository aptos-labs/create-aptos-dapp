const fs = require("node:fs");
const yaml = require("js-yaml");
require("dotenv").config();

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][process.env.PROFILE_NAME]["account"];

const filePath = ".env";
let envContent = "";

// Check .env file exists and read it
if (fs.existsSync(filePath)) {
  envContent = fs.readFileSync(filePath, "utf8");
}

// Regular expression to match the VITE_MODULE_ADDRESS variable
const regex = /^VITE_MODULE_ADDRESS=.*$/m;
const newEntry = `VITE_MODULE_ADDRESS=0x${accountAddress}`;

// Check if VITE_MODULE_ADDRESS is already defined
if (envContent.match(regex)) {
  // If the variable exists, replace it with the new value
  envContent = envContent.replace(regex, newEntry);
} else {
  // If the variable does not exist, append it
  envContent += `\n${newEntry}`;
}

// Write the updated content back to the .env file
fs.writeFileSync(filePath, envContent, "utf8");
