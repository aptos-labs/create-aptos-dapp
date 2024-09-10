require("dotenv").config();
const cli = require("@aptos-labs/ts-sdk/dist/common/cli/index.js");
const aptosSDK = require("@aptos-labs/ts-sdk")

async function compile() {

  const aptosConfig = new aptosSDK.AptosConfig({network:process.env.VITE_APP_NETWORK})
  const aptos = new aptosSDK.Aptos(aptosConfig)
  
  // Make sure VITE_COLLECTION_CREATOR_ADDRESS is set
  if (!process.env.VITE_COLLECTION_CREATOR_ADDRESS) {
    throw new Error("VITE_COLLECTION_CREATOR_ADDRESS variable is not set, make sure you set it on the .env file");
  }

  // Make sure VITE_COLLECTION_CREATOR_ADDRESS exists
  try {
    await aptos.getAccountInfo({ accountAddress: process.env.VITE_COLLECTION_CREATOR_ADDRESS });
  } catch (error) {
    throw new Error(
      "Account does not exist. Make sure you have set up the correct address as the VITE_COLLECTION_CREATOR_ADDRESS in the .env file",
    );
  }
  
  if (!process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS) {
    throw new Error(
      "VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS variable is not set, make sure you have set the publisher account address",
    );
  }

  let tokenMinterContractAddress;
  switch(process.env.VITE_APP_NETWORK){
    case "testnet":
      tokenMinterContractAddress = "0x3c41ff6b5845e0094e19888cba63773591be9de59cafa9e582386f6af15dd490"
      break;
    case "mainnet":
      tokenMinterContractAddress = "0x5ca749c835f44a9a9ff3fb0bec1f8e4f25ee09b424f62058c561ca41ec6bb146"
      break;
    default:
      throw new Error(`Invalid network used. Make sure process.env.VITE_APP_NETWORK is either mainnet or testnet`)
  }

  const move = new cli.Move();

  await move.compile({
    packageDirectoryPath: "contract",
    namedAddresses: {
      // Publish module to account address
      launchpad_addr: process.env.VITE_MODULE_PUBLISHER_ACCOUNT_ADDRESS,
      // This is the address you want to use to create collection with, e.g. an address in Petra so you can create collection in UI using Petra
      initial_creator_addr: process.env.VITE_COLLECTION_CREATOR_ADDRESS,
      // Our contract depends on the token-minter contract to provide some common NFT functionalities like managing refs and mint stages
      // You can read the source code of it here: https://github.com/aptos-labs/token-minter/
      // Please find it on the network you are using, This is testnet deployment
      minter: tokenMinterContractAddress,
    },
  });
}
compile();
