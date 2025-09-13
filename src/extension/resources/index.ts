import path from "node:path";
import { fileURLToPath } from "node:url";
import fse from "fs-extra";

/**
 * Gets the absolute path to a file within the extension's 'resources' directory.
 *
 * NOTE: This function is designed to work only within the packaged extension.
 * It assumes that a 'resources' directory exists alongside the main extension script.
 *
 * @param pathSegments - Path segments relative to the 'resources' directory.
 * @returns The absolute path to the resource.
 */
export function getResourcePath(...pathSegments: string[]): string {
    // In the packaged extension, __dirname will be the directory of the main script
    // (e.g., /path/to/output-ext/extension), and our resources are in a subdirectory.
    return path.join(__dirname, "resources", ...pathSegments);
}

/**
 * Copies the source 'resources' directory to the specified output directory.
 * This is a static function intended for build-time use.
 * It uses `import.meta.url` to robustly locate the source directory.
 * @param outputDir - The root directory of the extension output (e.g., /path/to/project/dist).
 */
export async function copyResourcesToOutput(outputDir: string): Promise<void> {
    // 1. Get the URL of the current file using import.meta.url
    const currentFileURL = import.meta.url;

    // 2. Convert the file: URL to a platform-specific absolute path
    const currentFilePath = fileURLToPath(currentFileURL);

    // 3. The sourceDir is the directory containing the current file
    const sourceDir = path.dirname(currentFilePath);

    // 4. Check if sourceDir exists, and throw an error if it doesn't
    if (!(await fse.pathExists(sourceDir))) {
        throw new Error(`Resource source directory not found at: ${sourceDir}`);
    }

    const targetDir = path.join(outputDir, "resources");
    await fse.ensureDir(targetDir);

    await fse.copy(sourceDir, targetDir, {
        filter: (src) => {
            // Filter out the TS file itself, as it's a build-time utility
            const fileName = path.basename(src);
            return fileName !== "index.ts";
        },
    });
}
