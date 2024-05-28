#!/bin/sh

set -e

echo "##### Running tests #####"

aptos move test \
  --package-dir move \
  --skip-fetch-latest-git-deps \
  --dev
