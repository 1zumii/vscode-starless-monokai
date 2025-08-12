// FIXME:
// "resolveJsonModule": true
// effect ts-morph output directory structure, if import package.json
// some fields is required
// https://code.visualstudio.com/api/references/extension-manifest

const VERSION = "0.4.2" satisfies `${number}.${number}.${number}`;

// relative from root dir
export const COMMON_FILES: ([file: string] | [sourceFile: string, rename: string])[] = [
    ["EXTENSION_README.md", "README.md"],
    ["LICENSE"],
    ["CHANGELOG.md"],
    ["assets/markdown-preview.css"],
    ["assets/icon.png"],
    ["assets/screenshot-1.png"],
];

// output as extension's package.json
export const MANIFEST = {
    name: "starless-monokai",
    displayName: "Starless Monokai",
    description: "✨ Monokai flavor colorscheme with classic VS Code workbench UI",
    version: VERSION,
    publisher: "izumii",
    engines: {
        vscode: "^1.57.0",
    },
    repository: {
        type: "git",
        url: "https://github.com/1zumii/vscode-starless-monokai",
    },
    categories: ["Themes"],
    icon: "assets/icon.png",
    // TODO: better vscode extension manifest type
    contributes: {
        "markdown.previewStyles": [
            "./assets/markdown-preview.css",
        ],
        "themes": [] as unknown[],
    },
    files: COMMON_FILES.map(([filePath, renamePath]) => renamePath ?? filePath),
};

export const MANIFEST_SOURCES_KEY = "sources";
