require("dotenv").config();
const axios = require("axios");
const fs = require("node:fs");

const modules = [
  { address: process.env.NEXT_PUBLIC_MODULE_ADDRESS, name: "message_board" },
  { address: "0x1", name: "coin" },
];

async function getAbi() {
  // Wait for 5 seconds to ensure the module is deployed
  await new Promise((resolve) => setTimeout(resolve, 5000));
  modules.forEach((module) => {
    const url = `https://fullnode.${process.env.NEXT_PUBLIC_APP_NETWORK}.aptoslabs.com/v1/accounts/${module.address}/module/${module.name}`;
    axios
      .get(url)
      .then((response) => {
        const abi = response.data.abi;
        const abiString = `export const ${module.name.toUpperCase()}_ABI = ${JSON.stringify(abi)} as const;`;
        fs.writeFileSync(`src/utils/${module.name}_abi.ts`, abiString);
        console.log(`${module.name} ABI saved to src/utils/${module.name}_abi.ts`);
      })
      .catch((error) => {
        console.error("Error fetching ABI:", error);
      });
  });
}

getAbi();
