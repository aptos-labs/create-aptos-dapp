require("dotenv").config();
const axios = require("axios");
const fs = require("node:fs");
const yaml = require("js-yaml");

const config = yaml.load(fs.readFileSync("./.aptos/config.yaml", "utf8"));
const accountAddress =
  config["profiles"][process.env.VITE_APP_NETWORK]["account"];

// Replace with the name of your module
const moduleName = "launchpad";

// Fetch ABI from the full node
const url = `https://fullnode.${process.env.VITE_APP_NETWORK}.aptoslabs.com/v1/accounts/0x${accountAddress}/module/${moduleName}`;

async function getAbi() {
  axios
    .get(url)
    .then((response) => {
      const abi = response.data.abi;
      const abiString = `export const ABI = ${JSON.stringify(abi)} as const;`;

      // Write ABI to abi.ts file
      fs.writeFileSync("frontend/utils/abi.ts", abiString);
      console.log("ABI saved to frontend/utils/abi.ts");
    })
    .catch((error) => {
      console.error("Error fetching ABI:", error);
    });
}

getAbi();
