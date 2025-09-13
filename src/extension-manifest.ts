// FIXME:
// "resolveJsonModule": true
// effect ts-morph output directory structure, if import package.json
// some fields is required
// https://code.visualstudio.com/api/references/extension-manifest

const VERSION = "1.1.2" satisfies `${number}.${number}.${number}`;

export const EXTENSION_ENTRY_DIR = "runtime";

// relative from root dir
export const COMMON_FILES: ([file: string] | [sourceFile: string, rename: string])[] = [
    ["EXTENSION_README.md", "README.md"],
    ["LICENSE"],
    ["CHANGELOG.md"],
    ["assets/markdown-preview.css"],
    ["assets/icon.png"],

    // DO NOT includes README assets - `vsce` may automatically processes them to GitHub CDN
];

type Command = { command: `${string}.${string}`; title: string };

export const RegisterCommand = {
    ApplyVibrancy: {
        command: "starless-monokai.apply-vibrancy",
        title: "Starless Monokai: Apply Vibrancy",
    },
    RevertVibrancy: {
        command: "starless-monokai.revert-vibrancy",
        title: "Starless Monokai: Revert Vibrancy",
    },
} as const satisfies Record<string, Command>;

// output as extension's package.json
export const MANIFEST = {
    name: "starless-monokai",
    displayName: "Starless Monokai",
    description: "✨ Monokai flavor colorscheme with classic VS Code workbench UI",
    version: VERSION,
    publisher: "izumii",
    engines: {
        vscode: "^1.99.3", // Electron: 34.5.1（from VSCode 1.98)
    },
    repository: {
        type: "git",
        url: "https://github.com/1zumii/vscode-starless-monokai",
    },
    categories: ["Themes"],
    icon: "assets/icon.png",
    main: `${EXTENSION_ENTRY_DIR}/index.cjs`,
    // TODO: better vscode extension manifest type
    contributes: {
        "markdown.previewStyles": [
            "./assets/markdown-preview.css",
        ],
        "themes": [] as unknown[],
        "commands": [
            RegisterCommand.ApplyVibrancy,
            RegisterCommand.RevertVibrancy,
        ] satisfies Command[],
    },
    files: [
        ...COMMON_FILES.map(([filePath, renamePath]) => renamePath ?? filePath),
        "themes/*.json",
    ],
};

export const MANIFEST_SOURCES_KEY = "sources";
