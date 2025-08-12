import eslint from "@antfu/eslint-config";

export default eslint(
    {
        stylistic: {
            indent: 4,
            quotes: "double",
        },
        ignores: [
            "./dist",
            "**/bin/**/*.js",
        ],
    },
    {
        rules: {
            "style/semi": ["error", "always"],
            "antfu/top-level-function": "off",
        },
    },
    {
        files: ["**/*.ts"],
        rules: {
            "ts/consistent-type-definitions": ["error", "type"],
            "style/member-delimiter-style": [
                "error",
                {
                    multiline: { delimiter: "semi", requireLast: true },
                    singleline: { delimiter: "semi", requireLast: false },
                    multilineDetection: "brackets",
                },
            ],
        },
    },
);
