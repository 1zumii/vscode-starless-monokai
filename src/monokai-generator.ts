import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import stream from "node:stream";
import streamp from "node:stream/promises";
import fse from "fs-extra";
import UnZipper from "unzipper";
import ColorConvert from "color";
import type { AnsiColor, Color, GeneratorConfig, ThemeConfig } from "./types/index.ts";
import {
    capitalize,
    clonePlainObject,
    isLegacyThemeConfig,
    queryExtensionInfoFromMarketplace,
    transformLegacyThemeConfig,
} from "./utils/index.ts";
import { TEMP_DIR_PATH, THEME_APPEND_CONFIG } from "./constants/index.ts";
import { generateWorkBenchColors } from "./generate-workbench-colors.ts";

const tempDirPath = path.resolve(process.cwd(), TEMP_DIR_PATH);

const createMonokaiGenerator = ({
    themeName,
    sourceExtension,
    findThemeConfigInPackage,
    presetAnsiColors,
    preprocessThemeConfig,
}: GeneratorConfig) => {
    const downloadThemePackage = async (fetchPackage: () => Promise<Response>, packageFilePath: string) => {
        // for local dev
        const isPackageCached = fs.existsSync(packageFilePath);
        if (isPackageCached)
            return;

        const response = await fetchPackage();

        if (!response.body)
            // TODO: better error description
            throw new Error("response body is empty");

        await fse.ensureDir(tempDirPath);

        // write to disk as zip extension, instead of vsix
        await streamp.pipeline(
            stream.Readable.fromWeb(response.body),
            fs.createWriteStream(packageFilePath),
        );
    };

    const formateThemeConfig = (rawConfig: Record<string, unknown>): ThemeConfig => {
        if (isLegacyThemeConfig(rawConfig))
            return transformLegacyThemeConfig(rawConfig);

        return rawConfig as ThemeConfig;
    };

    const getThemeConfig = async (version: string, fetchPackage: () => Promise<Response>): Promise<ThemeConfig | void> => {
        const packageFilePath = path.resolve(
            tempDirPath,
            [sourceExtension.name, version, "source.zip"].join("-"),
        );
        const themeConfigFilePath = path.resolve(
            tempDirPath,
            [...themeName, version, "source.json"].join("-"),
        );

        await downloadThemePackage(fetchPackage, packageFilePath);

        // get theme json file from package.zip
        await fs.createReadStream(packageFilePath)
            .pipe(UnZipper.Parse())
            .on("entry", (entry) => {
                const fileName: string = entry.path;
                const type: "Directory" | "File" = entry.type;

                if (type !== "File") {
                    entry.autodrain();
                    return;
                }
                const isThemeConfig = findThemeConfigInPackage(fileName);
                if (!isThemeConfig) {
                    entry.autodrain();
                    return;
                }

                entry.pipe(fs.createWriteStream(themeConfigFilePath));
            })
            .promise();

        // read theme json file, parse to object
        const themeConfigFileContent = await fsp.readFile(themeConfigFilePath, { encoding: "utf-8" });
        try {
            const themeRawConfig = JSON.parse(themeConfigFileContent);
            return formateThemeConfig(themeRawConfig);
        }
        catch {
            // TODO:
            throw new Error(" ");
        }
    };

    const collectTokenColors = (themeConfig: ThemeConfig): Color[] => {
        const foregroundColors = themeConfig.tokenColors
            .map(({ settings }) => settings.foreground)
            .filter((color): color is Color => !!color);

        return Array.from(new Set(foregroundColors));
    };

    const generateAnsiColor = (themeConfig: ThemeConfig): AnsiColor => {
        const colors = collectTokenColors(themeConfig);
        const ansi: AnsiColor = { } as AnsiColor;

        Object.keys(presetAnsiColors).forEach((colorKey) => {
            const presetColor = presetAnsiColors[colorKey as keyof AnsiColor];
            const [presetColorRed, presetColorGreen, presetColorBlue] = ColorConvert(presetColor).rgb().array();

            const matchResult: { delta: number; color: Color } = colors.reduce(
                (result, currentColor) => {
                    const [r, g, b] = ColorConvert(currentColor).rgb().array();
                    const delta = Math.abs((presetColorRed - r))
                        + Math.abs((presetColorGreen - g))
                        + Math.abs((presetColorBlue - b));

                    if (delta < result.delta) {
                        return {
                            delta,
                            color: currentColor,
                        };
                    }
                    else {
                        return result;
                    }
                },
                { delta: Number.POSITIVE_INFINITY, color: "#ff007f" as Color },
            );
            if (!matchResult.color)
                return;

            ansi[colorKey as keyof AnsiColor] = matchResult.color;
        });

        return ansi;
    };

    const setWorkbenchColors = (themeConfig: ThemeConfig, ansiColor: AnsiColor): ThemeConfig => {
        const workbenchColors = generateWorkBenchColors(ansiColor);

        return {
            ...themeConfig,
            colors: workbenchColors,
        };
    };

    return {
        run: async () => {
            const extensionInfo = await queryExtensionInfoFromMarketplace(
                `${sourceExtension.publisher}.${sourceExtension.name}`,
            );
            const targetExtension = extensionInfo.results
                .map(({ extensions }) => extensions)
                .flat(1)
                .find(({ extensionName }) => extensionName === sourceExtension.name);

            const latestVersionAsset = targetExtension?.versions[0];
            if (!latestVersionAsset) {
                // TODO: better error description
                throw new Error("extension not found");
            }

            const latestVersion = latestVersionAsset.version;
            const latestVersionExtensionUrl = latestVersionAsset.files.find(({ assetType }) => assetType === "Microsoft.VisualStudio.Services.VSIXPackage")?.source;

            if (!latestVersionExtensionUrl) {
                // TODO: better error description
                throw new Error("extension url not found");
            }

            const sourceThemeConfig = await getThemeConfig(
                latestVersion,
                async () => {
                    const response = await fetch(latestVersionExtensionUrl);

                    if (!response.ok) {
                        const { status, statusText } = response;
                        const body = await response.json();
                        // TODO: better error description
                        throw new Error(JSON.stringify({ status, statusText, body }, undefined, 4));
                    }

                    return response;
                },
            );

            if (!sourceThemeConfig)
                return;

            let themeConfig = preprocessThemeConfig
                ? preprocessThemeConfig(clonePlainObject(sourceThemeConfig))
                : sourceThemeConfig;

            const ansiColor = generateAnsiColor(themeConfig);

            themeConfig = setWorkbenchColors(themeConfig, ansiColor);

            const { type, colorSpaceName, colors, tokenColors } = themeConfig;

            return {
                fileName: `${themeName.join("-")}.json`,
                sourceExtension: targetExtension,
                themeConfig: {
                    name: themeName.map(s => capitalize(s)).join(" "),
                    ...THEME_APPEND_CONFIG,
                    type,
                    colorSpaceName,
                    colors,
                    tokenColors,
                },
            };
        },
    };
};

export type MonokaiGenerateResult = NonNullable<Awaited<ReturnType<ReturnType<typeof createMonokaiGenerator>["run"]>>>;

export default createMonokaiGenerator;
