import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import importPlugin from "eslint-plugin-import"
import obsidianPlugin from "eslint-plugin-obsidianmd"

export default tseslint.config(
    {
        // Global ignores
        ignores: [
            "node_modules/",
            "main.js",
            "*.js",
            "*.mjs",
            "test/"
        ],
    },
    // Base ESLint recommended rules for all files
    eslint.configs.recommended,
    // TypeScript ESLint recommended rules (without type checking)
    ...tseslint.configs.recommended,
    {
        // Main configuration for TypeScript files
        files: ["**/*.ts"],
        extends: [
            ...tseslint.configs.recommendedTypeChecked,
        ],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
                project: "./tsconfig.json",
            },
            globals: {
                // Browser globals
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                console: "readonly",
                // Node globals
                process: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                module: "readonly",
                require: "readonly",
                // ES2022 globals
                Promise: "readonly",
                Set: "readonly",
                Map: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            "import": importPlugin,
            "obsidianmd": obsidianPlugin,
        },
        rules: {
            // Stylistic rules
            "semi": ["error", "never"],
            "quotes": ["error", "double"],
            "indent": ["error", 4],
            "comma-dangle": ["error", "always-multiline"],
            "arrow-body-style": ["error", "as-needed"],
            "prefer-arrow-callback": "error",
            "curly": ["error", "all"],
            "brace-style": ["error", "1tbs"],
            
            // TypeScript-specific rules
            "@typescript-eslint/explicit-function-return-type": ["error", {
                "allowExpressions": false,
                "allowTypedFunctionExpressions": true,
                "allowHigherOrderFunctions": true,
            }],
            "@typescript-eslint/explicit-module-boundary-types": "error",
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-unused-vars": ["error", {
                "argsIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
            }],
            "@typescript-eslint/consistent-type-assertions": ["error", {
                "assertionStyle": "as",
            }],
            "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
            "@typescript-eslint/prefer-nullish-coalescing": "error",
            "@typescript-eslint/prefer-optional-chain": "error",
            "@typescript-eslint/no-unnecessary-condition": "warn",
            "@typescript-eslint/strict-boolean-expressions": ["error", {
                "allowString": false,
                "allowNumber": false,
                "allowNullableObject": false,
            }],
            
            // Console and debugging
            "no-console": ["warn", {
                "allow": ["warn", "error"],
            }],
            
            // Code complexity
            "no-magic-numbers": ["error", {
                "ignore": [0, 1, -1],
                "ignoreArrayIndexes": true,
                "enforceConst": true,
                "detectObjects": false,
            }],
            "complexity": ["error", 10],
            "max-depth": ["error", 4],
            "max-lines-per-function": ["error", {
                "max": 50,
                "skipBlankLines": true,
                "skipComments": true,
            }],
            "max-params": ["error", 4],
            "no-nested-ternary": "error",
            
            // Modern JavaScript
            "prefer-const": "error",
            "no-var": "error",
            "object-shorthand": "error",
            "prefer-template": "error",
            "prefer-destructuring": ["error", {
                "object": true,
                "array": false,
            }],
            "no-duplicate-imports": "error",
            "eqeqeq": ["error", "always"],
            
            // Import rules
            "import/order": ["error", {
                "groups": [
                    "builtin",
                    "external",
                    "internal",
                    ["parent", "sibling"],
                    "index",
                ],
                "pathGroups": [
                    {
                        "pattern": "obsidian",
                        "group": "external",
                        "position": "before",
                    },
                ],
                "pathGroupsExcludedImportTypes": ["builtin"],
                "newlines-between": "always",
                "alphabetize": {
                    "order": "asc",
                    "caseInsensitive": true,
                },
            }],
            "import/no-unresolved": "off",
            "import/extensions": ["error", "never", {
                "json": "always",
            }],
            
            // Async/Promise rules
            "no-throw-literal": "error",
            "require-await": "error",
            "@typescript-eslint/no-floating-promises": "error",
            "@typescript-eslint/await-thenable": "error",
            "@typescript-eslint/no-misused-promises": "error",
            "prefer-promise-reject-errors": "error",
        },
    }
)
