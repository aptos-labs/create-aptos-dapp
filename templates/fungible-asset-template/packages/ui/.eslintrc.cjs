/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
  },
  root: true,
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  plugins: ["@typescript-eslint"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    project: true,
  },
  rules: {
    "@typescript-eslint/no-non-null-assertion": "off",
  },
  ignorePatterns: [".eslintrc.cjs"],
};
