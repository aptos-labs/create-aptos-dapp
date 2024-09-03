require('dotenv').config()
const axios = require('axios')
const fs = require('node:fs')

const ABI_FILE_PATH = 'src/utils/abi.ts'

const files = fs.readdirSync('move/sources')
const moveFile = files.find((file) => file.endsWith('.move'))
const moduleName = moveFile.split('.')[0]

const url = `https://fullnode.${process.env.NEXT_PUBLIC_APP_NETWORK}.aptoslabs.com/v1/accounts/${process.env.NEXT_PUBLIC_MODULE_ADDRESS}/module/${moduleName}`

async function getAbi() {
	axios
		.get(url)
		.then((response) => {
			const abi = response.data.abi
			const abiString = `export const ABI = ${JSON.stringify(abi)} as const;`
			fs.writeFileSync(ABI_FILE_PATH, abiString)
			console.log(`ABI saved to ${ABI_FILE_PATH}`)
		})
		.catch((error) => {
			console.error('Error fetching ABI:', error)
		})
}

getAbi()
