import { existsSync } from "fs";
import path from "path";

export const validateProjectName = (projectName: string) => {
  const tempPath = projectName.trim();
  const projectPath = path.resolve(tempPath);
  const dirExists: boolean = existsSync(projectPath);

  if (!tempPath.length) {
    return "Error: invalid project name length: name can't be empty\n";
  }
  if (dirExists) {
    return "Error: project already exists: a project with this name already exists, please use a different name\n";
  }
  if (projectName.length >= 214) {
    return "Error: invalid project name length: name must contain less than 214 characters\n";
  }
  if (!isValidPackageName(projectName)) {
    return "Error: invalid project name: name must only include URL-friendly characters\n";
  }

  return true;
};

const isValidPackageName = (path: string) => {
  const regex = /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/g;
  return regex.test(path);
};
