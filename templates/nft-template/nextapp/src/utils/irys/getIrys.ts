// import { WebIrys } from "@irys/sdk";
// import { ethers } from "ethers";

// import BigNumber from "bignumber.js";
// import getRpcUrl from "./getRpcUrl";
// import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
// import WalletConnectProvider from "@walletconnect/web3-provider";

// const checkEthersConnection = async () => {
// 	try {
// 		if (window.ethereum) {
// 			//@ts-ignore
// 			const ethProvider = new ethers.BrowserProvider(window.ethereum);
// 			const accounts = await ethProvider.listAccounts();

// 			if (accounts.length > 0) {
// 				return true; // Connected
// 			}
// 		}
// 	} catch (error) {
// 		console.error("Error checking Ethereum wallet connection:", error);
// 	}
// 	return false; // Not connected
// };

// // Check Solana
// const checkSolanaConnection = async () => {
// 	try {
// 		if (window.solana && window.solana.isPhantom) {
// 			// Attempt to connect (this is just a placeholder - adapt based on your Solana logic)
// 			const response = await window.solana.connect({ onlyIfTrusted: true });
// 			if (response.publicKey) {
// 				return true;
// 			}
// 		}
// 	} catch (error) {
// 		console.error("Error checking Solana wallet connection:", error);
// 	}
// 	return false;
// };

// /**
//  * Creates a new Irys object with the specified configuration.
//  *
//  * @param {string} url - The Irys network URL.
//  * @param {string} currency - The currency to use (e.g., "ethereum").
//  * @param {string} providerUrl - The provider URL for the Ethereum network.
//  * @returns {Promise<WebIrys>} - A reference to the initialized Irys object.
//  */
// const getIrysEvm = async (
// 	network: string = process.env.NEXT_PUBLIC_NETWORK || "devnet",
// 	token: string = process.env.NEXT_PUBLIC_TOKEN || "ethereum",
// ): Promise<WebIrys> => {
// 	await window.ethereum.enable();
// 	const provider = new ethers.BrowserProvider(window.ethereum);
// 	const wallet = { name: "ethersv6", provider: provider };
// 	const webIrys = new WebIrys({ network, token, wallet });
// 	//@ts-ignore
// 	webIrys.tokenConfig.getFee = async (): Promise<any> => {
// 		return 0;
// 	};
// 	await webIrys.ready();

// 	console.log(`Connected to webIrys from ${webIrys.address}`);
// 	return webIrys;
// };

// const getIrysSol = async (
// 	network: string = process.env.NEXT_PUBLIC_NETWORK || "devnet",
// 	token: string = process.env.NEXT_PUBLIC_TOKEN || "ethereum",
// ): Promise<WebIrys> => {
// 	await window.solana.connect();
// 	const provider = new PhantomWalletAdapter();
// 	await provider.connect();
// 	let wallet;
// 	if (network === "devnet") {
// 		wallet = { rpcUrl: process.env.NEXT_PUBLIC_RPC_SOLANA, name: "solana", provider };
// 	} else {
// 		wallet = { name: "solana", provider };
// 	}

// 	const webIrys = new WebIrys({
// 		network: process.env.NEXT_PUBLIC_NETWORK || "devnet",
// 		token: "solana",
// 		wallet,
// 	});
// 	await webIrys.ready();

// 	return webIrys;
// };

// const getIrys = async (
// 	network: string = process.env.NEXT_PUBLIC_NETWORK || "devnet",
// 	token: string = process.env.NEXT_PUBLIC_TOKEN || "ethereum",
// ): Promise<WebIrys> => {
// 	if (await checkSolanaConnection()) {
// 		console.log("getIrys returning SOL");
// 		return getIrysSol();
// 	}
// 	console.log("getIrys returning EVM");
// 	return getIrysEvm();
// };

// export default getIrys;
