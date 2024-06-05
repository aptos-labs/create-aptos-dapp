#!/bin/sh

set -e

echo "##### Deploy module under a new object #####"

# Profile is the account you used to execute transaction
# Run "aptos init" to create the profile, then get the profile name from .aptos/config.yaml
PUBLISHER_PROFILE=testnet-profile-1

PUBLISHER_ADDR=0x$(aptos config show-profiles --profile=$PUBLISHER_PROFILE | grep 'account' | sed -n 's/.*"account": \"\(.*\)\".*/\1/p')

# Please find the token-minter contract address on the network you deploy to
# This is my testnet token-minter contract address
MINTER_ADDR="0x9d7365d7a09ee3a5610a2131d6ee395531d581e7a7c42582de51a3f111534bbd"

OUTPUT=$(aptos move create-object-and-publish-package \
  --skip-fetch-latest-git-deps \
  --package-dir move \
  --address-name launchpad_addr \
  --named-addresses "launchpad_addr=$PUBLISHER_ADDR,minter=$MINTER_ADDR"\
  --profile $PUBLISHER_PROFILE \
	--assume-yes)

# Extract the deployed contract address and save it to a file
echo "$OUTPUT" | grep "Code was successfully deployed to object address" | awk '{print $NF}' | sed 's/\.$//' > contract_address.txt
echo "Contract deployed to address: $(cat contract_address.txt)"
echo "Contract address saved to contract_address.txt"

