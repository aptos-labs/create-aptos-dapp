module.exports = {
  root: true,
  reportUnusedDisableDirectives: true,
  ignorePatterns: ["/*", "!/src", "/src/utils/getTheme.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  plugins: ["@typescript-eslint", "simple-import-sort", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "next/core-web-vitals",
    "prettier",
  ],
  rules: {
    "@typescript-eslint/array-type": ["error", { default: "generic" }],
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-floating-promises": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/unbound-method": "off",
    curly: ["error", "multi-line"],
    "object-shorthand": ["error", "always"],
    "react/self-closing-comp": ["error", { component: true, html: true }],
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "import/no-default-export": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
  },
  overrides: [
    {
      files: [
        "./src/app/**/?(layout|page|loading|not-found|error|global-error|template|default).tsx",
      ],
      rules: {
        "import/no-default-export": "off",
      },
    },
  ],
};
