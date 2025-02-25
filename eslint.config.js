// eslint.config.js
module.exports = {
    root: true,
    env: {
      node: true,
      es2021: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
    ],
    ignores: ["node_modules/", "dist/"], // instead of .eslintignore
    rules: {
      // Add or override rules here
    },
  };
  