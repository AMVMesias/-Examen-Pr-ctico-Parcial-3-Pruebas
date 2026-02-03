import js from "@eslint/js";
import security from "eslint-plugin-security";

export default [
  js.configs.recommended,
  {
    plugins: {
      security
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-possible-timing-attacks": "warn",
      "eqeqeq": "error",
      "no-eval": "error",
      "no-implied-eval": "error",
      "prefer-const": "warn"
    }
  },
  {
    ignores: ["node_modules/**", "coverage/**", "docs/**", "k6-tests/**"]
  }
];
