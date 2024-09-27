import { platform } from "os";
import { spawn } from "child_process";

/**
 * Install the aptos cli node wrapper while suppressing the process log output
 */
export const installAptosCli = async () => {
  return new Promise((resolve, reject) => {
    const currentPlatform = platform();
    let childProcess;
    let stdout = "";
    let stderr = "";

    // Check if current OS is Windows
    if (currentPlatform === "win32") {
      childProcess = spawn("npx", ["aptos"], { shell: true });
    } else {
      childProcess = spawn("npx", ["aptos"]);
    }

    // Collect stdout and stderr without piping to the console
    childProcess.stdout.on("data", (data) => {
      stdout += data.toString(); // Accumulate stdout data
    });

    childProcess.stderr.on("data", (data) => {
      stderr += data.toString(); // Accumulate stderr data
    });

    // Listen for the process to close and resolve or reject the promise
    childProcess.on("close", (code) => {
      if (code === 0) {
        resolve(stdout); // Resolve with the collected stdout data
      } else {
        reject();
      }
    });
  });
};
