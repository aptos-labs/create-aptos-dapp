find . -name ".env" -type f -prune -exec rm -rf '{}' +
find . -name "config.yaml" -type f -prune -exec rm -rf '{}' +
find . -name "package-lock.json" -type f -prune -exec rm -rf '{}' +
find . -name ".idea" -type d -prune -exec rm -rf '{}' +
find . -name ".next" -type d -prune -exec rm -rf '{}' +
find . -name "dist" -type d -prune -exec rm -rf '{}' +
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
find . -name "target" -type d -prune -exec rm -rf '{}' +
find . -name "build" -type d -prune -exec rm -rf '{}' +
find . -name ".aptos" -type d -prune -exec rm -rf '{}' +
