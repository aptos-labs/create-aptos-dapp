#! /bin/bash

MODULE_ADDR=$(./scripts/get_module_addr.sh)
PACKAGE_NAME=$(cat move/sources/$(ls move/sources/ | head -n 1) | head -n 1 | sed -n 's/module [^:]*::\(.*\) {/\1/p')
export $(cat .env | xargs) && echo "export const ABI = $(curl https://fullnode.$APP_NETWORK.aptoslabs.com/v1/accounts/$MODULE_ADDR/module/$PACKAGE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > node/abi.ts