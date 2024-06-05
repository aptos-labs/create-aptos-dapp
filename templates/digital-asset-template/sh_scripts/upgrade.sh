#!/bin/sh

set -e

echo "##### Upgrade module #####"

# Profile is the account you used to execute transaction
# Run "aptos init" to create the profile, then get the profile name from .aptos/config.yaml
PUBLISHER_PROFILE=testnet-profile-1

CONTRACT_ADDRESS=$(cat contract_address.txt)
MINTER_ADDR="0x9d7365d7a09ee3a5610a2131d6ee395531d581e7a7c42582de51a3f111534bbd"

aptos move upgrade-object-package \
  --skip-fetch-latest-git-deps \
  --package-dir move \
  --object-address $CONTRACT_ADDRESS \
  --named-addresses "launchpad_addr=$CONTRACT_ADDRESS,minter=$MINTER_ADDR"\
  --profile $PUBLISHER_PROFILE \
  --assume-yes
