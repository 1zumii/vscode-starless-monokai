import path from "node:path";
import process from "node:process";
import fse from "fs-extra";
import { COMMON_FILES, MANIFEST, MANIFEST_SOURCES_KEY, OUTPUT_EXTENSION_DIR_PATH } from "./constants/index.ts";
import type { MonokaiGenerateResult } from "./monokai-generator.ts";

const outputExtension = async (themes: MonokaiGenerateResult[]) => {
    // output
    const outputExtensionRoot = path.resolve(process.cwd(), OUTPUT_EXTENSION_DIR_PATH);
    await fse.emptyDir(outputExtensionRoot);

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
    const projectRoot = process.cwd();
    await Promise.all(COMMON_FILES.map(([filePath, renamePath]) => fse.copy(
        path.resolve(projectRoot, filePath),
        path.resolve(outputExtensionRoot, renamePath ?? filePath),
    )));

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

export default outputExtension;
