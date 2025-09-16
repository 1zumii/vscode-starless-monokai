import path from "node:path";
import process from "node:process";
import fse from "fs-extra";
import { build } from "tsdown";
import { COMMON_FILES, EXTENSION_ENTRY_DIR, MANIFEST, MANIFEST_SOURCES_KEY } from "./extension-manifest.ts";
import type { MonokaiGenerateResult } from "./theme-generator/monokai-generator.ts";

// same as extensionDevelopmentPath in .vscode/launch.json args
export const OUTPUT_EXTENSION_DIR_PATH = "dist/output-ext";

export const outputExtension = async (themes: MonokaiGenerateResult[]) => {
    const projectRoot = process.cwd();

    // output
    const outputExtensionRoot = path.resolve(projectRoot, OUTPUT_EXTENSION_DIR_PATH);
    await fse.emptyDir(outputExtensionRoot);

    // compile extension source code
    await build({
        platform: "node",
        entry: path.resolve(projectRoot, "src/extension", "index.ts"),
        outDir: path.resolve(outputExtensionRoot, EXTENSION_ENTRY_DIR),
        external: ["vscode"],
        // NOTE: VS Code extension host doesn't support ESM as entry format yet, until v1.100, using CommonJS for compatibility
        // https://code.visualstudio.com/updates/v1_100#_extension-authoring
        format: "commonjs",
    });

    // output package.json
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
        path.resolve(process.cwd(), OUTPUT_EXTENSION_DIR_PATH, "package.json"),
        packageJson,
        { spaces: 4 },
    );

    // copy some files from root dir
    await Promise.all(
        COMMON_FILES.map(
            ([filePath, renamePath]) => fse.copy(
                path.resolve(projectRoot, filePath),
                path.resolve(outputExtensionRoot, renamePath ?? filePath),
            ),
        ),
    );

    // output themes
    await fse.emptyDir(
        path.resolve(process.cwd(), OUTPUT_EXTENSION_DIR_PATH, "themes"),
    );
    await Promise.all(
        themes.map(({ fileName, themeConfig }) => fse.writeJSON(
            path.resolve(
                process.cwd(),
                OUTPUT_EXTENSION_DIR_PATH,
                "themes",
                fileName,
            ),
            themeConfig,
            { spaces: 4 },
        )),
    );
};
