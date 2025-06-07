// @ts-check

import eslintReact from "@eslint-react/eslint-plugin";
import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import prettier from "eslint-config-prettier/flat";
import perfectionist from "eslint-plugin-perfectionist";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import unicornPlugin from "eslint-plugin-unicorn";
import globals from "globals";
import tseslint from "typescript-eslint";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],

    plugins: {
      perfectionist,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    extends: [
      eslintReact.configs["recommended-typescript"],
      pluginReactRefresh.configs.vite,
      eslint.configs.recommended,
      tseslint.configs.recommended,
      unicornPlugin.configs.recommended,
    ],
  },
  {
    ignores: ["dist/**", ".next/**", "node_modules/**"],
  },
  prettier,
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // rules last to ensure application
  {
    rules: {
      "@eslint-react/no-class-component": "error",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/react-in-jsx-scope": "off",
      "react/no-unescaped-entities": "off",
      "react-refresh/only-export-components": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-useless-undefined": [
        "error",
        {
          checkArrowFunctionBody: false,
        },
      ],
      "unicorn/prefer-query-selector": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          ignore: [/param/i, /ref/i, /props/i, /args/i, /prev/i, /dev/i],
        },
      ],
      "unicorn/filename-case": [
        "error",
        {
          cases: {
            kebabCase: true,
          },
        },
      ],
      "perfectionist/sort-imports": [
        "error",
        {
          internalPattern: [
            // default
            "^~/.+",
            // internal path alias (see package.json `imports`)
            "^#.+",
          ],
        },
      ],
    },
  },
);
