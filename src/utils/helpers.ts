import { exec } from "child_process";
import path from "path";
import fs from "node:fs";
import os from "node:os";

// Run a command. Must return a Promise so we dont block execution context
// (to run the spinner for example)
export const runCommand = (command) =>
  new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout ? stdout : stderr);
    });
  });

// Copy a full source directory into a destination directory
export const copy = (src: string, dest: string) => {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
};

// Copy a source directory into a destination directory
export const copyDir = (srcDir: string, destDir: string) => {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
};

// Get the user OS
export const getOS = () => {
  const platform = os.platform();
  switch (platform) {
    case "darwin":
      return "MacOS";
    case "linux":
      return "Ubuntu";
    case "win32":
      return "Windows";
    default:
      return `Unsupported OS ${platform}`;
  }
};

/**
 * Figures out what package manager to use based on how you ran the command
 * E.g. npx, pnpm dlx, yarn dlx...
 * Then it returns the package manager initial index to use in the
 * package manager prompt
 *
 * @returns number
 */
export const getUserPackageManager = () => {
  const NPM_CONFIG_USER_AGENT = process.env.npm_config_user_agent || "";
  const DEFAULT_PACKAGE_MANAGER = NPM_CONFIG_USER_AGENT.startsWith("yarn")
    ? "yarn"
    : NPM_CONFIG_USER_AGENT.startsWith("pnpm")
    ? "pnpm"
    : "npm";
  const packageManagerInitialIndex =
    DEFAULT_PACKAGE_MANAGER === "npm"
      ? 0
      : DEFAULT_PACKAGE_MANAGER === "yarn"
      ? 1
      : DEFAULT_PACKAGE_MANAGER === "pnpm"
      ? 2
      : 0;
  return packageManagerInitialIndex;
};
