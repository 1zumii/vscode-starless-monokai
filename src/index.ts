import path from "node:path";
import process from "node:process";
import fse from "fs-extra";
import { build } from "tsdown";
import { generateTheme } from "./theme-generator/index.ts";
import { COMMON_FILES, EXTENSION_ENTRY_DIR, MANIFEST, MANIFEST_SOURCES_KEY } from "./extension-manifest.ts";
import { copyResourcesToOutput } from "./extension/resources/index.ts";

// same as extensionDevelopmentPath in .vscode/launch.json args
export const OUTPUT_EXTENSION_DIR_PATH = "dist/output-ext";

(async () => {
    const projectRoot = process.cwd();

    // Phase 0: Data Generation
    // Perform all data generation and network requests first to fail fast.
    const themes = await generateTheme();

    // Phase 1: Prepare Output Directory
    // Clear any previous build artifacts to ensure a clean slate.
    const outputExtensionRoot = path.resolve(projectRoot, OUTPUT_EXTENSION_DIR_PATH);
    await fse.emptyDir(outputExtensionRoot);

    // Phase 2: Output Extension Files
    // Write all generated data and compiled code to the output directory.

    // 2.1. Compile extension source code
    // This bundles the TypeScript code from `src/extension` into a single `main.js` file.
    await build({
        platform: "node",
        entry: path.resolve(projectRoot, "src/extension", "index.ts"),
        outDir: path.resolve(outputExtensionRoot, EXTENSION_ENTRY_DIR),
        external: ["vscode"],
        // NOTE: VS Code extension host doesn't support ESM as entry format yet, until v1.100, using CommonJS for compatibility
        // https://code.visualstudio.com/updates/v1_100#_extension-authoring
        format: "commonjs",
    });

    // 2.2. Output theme files
    const themesRoot = path.resolve(outputExtensionRoot, "themes");
    await fse.emptyDir(themesRoot);
    await Promise.all(
        themes.map(({ fileName, themeConfig }) => fse.writeJSON(
            path.resolve(themesRoot, fileName),
            themeConfig,
            { spaces: 4 },
        )),
    );

    // 2.3. Output package.json
    const packageJson = {
        ...MANIFEST,
        [MANIFEST_SOURCES_KEY]: themes.reduce(
            (sources, { sourceExtension }) => {
                const { publisher, versions, extensionName } = sourceExtension;
                const { publisherName } = publisher;
                const latestVersion = versions[0].version;

                const sourceExtensionKey = `${publisherName}.${extensionName}`;
                if (!sources.find(([key]) => sourceExtensionKey === key))
                    sources.push([sourceExtensionKey, latestVersion]);

                return sources;
            },
            [] as [string, string][],
        ),
    };

    packageJson.contributes.themes = themes.map(
        theme => ({
            label: theme.themeConfig.name,
            uiTheme: "vs-dark",
            path: `./themes/${theme.fileName}`,
        }),
    );

    await fse.writeJSON(
        path.resolve(outputExtensionRoot, "package.json"),
        packageJson,
        { spaces: 4 },
    );

    // 2.4. Copy common files and resources
    await Promise.all([
        // Copy files from the project root (e.g., README, LICENSE)
        ...COMMON_FILES.map(
            ([filePath, renamePath]) => fse.copy(
                path.resolve(projectRoot, filePath),
                path.resolve(outputExtensionRoot, renamePath ?? filePath),
            ),
        ),
        // Copy extension resources (e.g., templates, css)
        copyResourcesToOutput(path.resolve(outputExtensionRoot, EXTENSION_ENTRY_DIR)),
    ]);
})();
