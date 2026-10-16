import powerbiVisuals from "eslint-plugin-powerbi-visuals";
import typescript from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";

export default [
    {
        ignores: [".tmp/**", "dist/**", "node_modules/**", "webpack.statistics.prod.html"]
    },
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module"
            }
        },
        plugins: {
            "@typescript-eslint": typescript,
            "powerbi-visuals": powerbiVisuals
        },
        rules: {
            "powerbi-visuals/no-http-string": "error",
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }]
        }
    }
];
