import { exec } from "child_process";
import { Context } from "./context";

/**
 * Install npm dependencies for the user project
 */
export const installDependencies = (context: Context) => {
  return new Promise((resolve, reject) => {
    const npmInstall = exec(
      "npm install --color --no-audit --verbose --progress"
    );

    // if verbos is set, pipe std to console output
    if (context.verbose) {
      npmInstall.stdout?.pipe(process.stdout);
      npmInstall.stderr?.pipe(process.stderr);
    }

    npmInstall.on("close", (code) => {
      resolve(code);
    });

    npmInstall.on("error", (err) => {
      reject(err);
    });
  });
};
