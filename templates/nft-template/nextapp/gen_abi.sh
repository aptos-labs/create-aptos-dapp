#! /bin/bash

NETWORK=testnet

CONTRACT_ADDRESS=$(cat ../contract_address.txt)

SOURCE_DIR="../move/sources"

# Iterate over each file in the source directory
for file in "$SOURCE_DIR"/*; do
  # Extract the package name from the first line of each file
  PACKAGE_NAME=$(head -n 1 "$file" | sed -n 's/module [^:]*::\(.*\) {/\1/p')

  # If PACKAGE_NAME is not empty, proceed to download the ABI and create a new file
  if [ -n "$PACKAGE_NAME" ]; then
    echo "Processing module: $PACKAGE_NAME"
    ABI=$(curl -s "https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$PACKAGE_NAME" | sed -n 's/.*"abi":\({.*}\).*}$/\1/p')
    echo "export const ABI = $ABI as const" > "src/utils/abi_$PACKAGE_NAME.ts"
  fi
done

# download abi for 0x4::collection
APTOS_TOKEN_OBJECT_CONTRACT_ADDRESS="0x4"
COLLECTION_PACKAGE_NAME="collection"
echo "Processing module: $COLLECTION_PACKAGE_NAME"
ABI=$(curl -s "https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$APTOS_TOKEN_OBJECT_CONTRACT_ADDRESS/module/$COLLECTION_PACKAGE_NAME" | sed -n 's/.*"abi":\({.*}\).*}$/\1/p')
echo "export const ABI = $ABI as const" > "src/utils/abi_$COLLECTION_PACKAGE_NAME.ts"
