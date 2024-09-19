#! /bin/bash

NETWORK=testnet

CONTRACT_ADDRESS=$(cat ./contract_address.txt)

MODULE_NAME=message_board

ABI="export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" 

NEXT_APP_ABI_DIR="../../next-app/src/lib/abi"
mkdir -p $NEXT_APP_ABI_DIR
echo $ABI > $NEXT_APP_ABI_DIR/${MODULE_NAME}_abi.ts

NODE_SCRIPTS_ABI_DIR="../../node-scripts/src/lib/abi"
mkdir -p $NODE_SCRIPTS_ABI_DIR
echo $ABI > $NODE_SCRIPTS_ABI_DIR/${MODULE_NAME}_abi.ts
