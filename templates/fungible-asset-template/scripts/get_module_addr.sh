#! /bin/bash

export $(cat .env | xargs) && echo 0x$(npx aptos config show-profiles --profile=$VITE_APP_NETWORK | grep 'account' | sed -n 's/.*"account": \"\(.*\)\".*/\1/p');