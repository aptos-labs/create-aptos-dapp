require("dotenv").config();
const axios = require("axios");
const fs = require("node:fs");

const moduleName = "aptogotchi";

const url = `https://fullnode.${process.env.NEXT_PUBLIC_APP_NETWORK}.aptoslabs.com/v1/accounts/${process.env.NEXT_PUBLIC_MODULE_ADDRESS}/module/${moduleName}`;

async function getAbi() {
  axios
    .get(url)
    .then((response) => {
      const abi = response.data.abi;
      const abiString = `export const ABI = ${JSON.stringify(abi)} as const;`;
      fs.writeFileSync("src/utils/abi.ts", abiString);
      console.log("ABI saved to src/utils/abi.ts");
    })
    .catch((error) => {
      console.error("Error fetching ABI:", error);
    });
}

getAbi();
