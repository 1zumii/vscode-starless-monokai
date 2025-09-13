import fs from "node:fs/promises";
import { Logger } from "./utils/logger";
import { INJECT_TRUST_TYPE } from "./constants";

/**
 * Adds the custom trust type to a given CSP string.
 * This function is a pure "strategy" that only operates on the CSP content.
 *
 * @param cspContent The original Content-Security-Policy content string.
 * @returns The modified CSP content string with the new type injected.
 */
function injectTrustedType(cspContent: string): string {
    // 1. Check if the policy is already injected to prevent redundant writes.
    if (new RegExp(`\\b${INJECT_TRUST_TYPE}\\b`).test(cspContent)) {
        return cspContent;
    }

    // 2. Find the 'trusted-types' directive.
    const trustedTypesRegex = /(?<!-)\b(trusted-types)\b(?!-)/i;
    if (!trustedTypesRegex.test(cspContent)) {
        Logger.warn("The 'trusted-types' directive is missing from the Content-Security-Policy. Skipping injection.");
        return cspContent;
    }

    // 3. Add the new trust type after the directive name.
    return cspContent.replace(
        trustedTypesRegex,
        `$1 ${INJECT_TRUST_TYPE}`,
    );
}

/**
 * Removes the custom trust type from a given CSP string.
 * This function is a pure "strategy" that only operates on the CSP content.
 *
 * @param cspContent The original Content-Security-Policy content string.
 * @returns The modified CSP content string with the type removed.
 */
function removeTrustedType(cspContent: string): string {
    // 1. Check if the policy exists. If not, no need to do anything.
    const removalRegex = new RegExp(`\\s+\\b${INJECT_TRUST_TYPE}\\b`);
    if (!removalRegex.test(cspContent)) {
        return cspContent;
    }

    // 2. Remove the type and the space preceding it.
    return cspContent.replace(removalRegex, "");
}

/**
 * A generic workflow function that finds the CSP in HTML, applies a transformation to it,
 * and returns the updated HTML.
 *
 * @param workbenchHTML The full content of the workbench.html file.
 * @param patcher A function that takes the original CSP string and returns the modified one.
 * @returns The potentially modified workbenchHTML content.
 */
function transformCspInHtml(workbenchHTML: string, patcher: (csp: string) => string): string {
    // 1. Locate CSP meta content attribute's value.
    const cspContentRegex = /(?<=<meta\s+http-equiv="Content-Security-Policy"\s+content=")([^"]+)(?=")/i;
    const cspContentMatch = workbenchHTML.match(cspContentRegex);

    if (!cspContentMatch) {
        Logger.warn("Could not find Content-Security-Policy meta tag. Skipping transformation.");
        return workbenchHTML;
    }
    const originalCspContent = cspContentMatch[0];

    // 2. Apply the patcher function to the CSP content.
    const newCspContent = patcher(originalCspContent);

    // 3. If nothing changed, return the original HTML.
    if (originalCspContent.length === newCspContent.length) {
        return workbenchHTML;
    }

    // 4. Replace the old CSP content with the new one in the original HTML.
    return workbenchHTML.replace(originalCspContent, newCspContent);
}

/**
 * Applies the CSP trusted-types patch to the workbench file on disk for installation.
 *
 * @param filePath Absolute path to the VS Code workbench HTML file.
 */
export async function installWorkbenchHTML(filePath: string) {
    const workbenchHTML = await fs.readFile(filePath, "utf-8");
    const patchedWorkbenchHTML = transformCspInHtml(workbenchHTML, injectTrustedType);

    if (patchedWorkbenchHTML === workbenchHTML) {
        Logger.info("Vibrancy CSP already injected. Skipping write.");
        return;
    }

    await fs.writeFile(filePath, patchedWorkbenchHTML, "utf-8");
}

/**
 * Reverts the CSP trusted-types patch from the workbench file on disk.
 *
 * @param filePath Absolute path to the VS Code workbench HTML file.
 * @param silent If true, will suppress log output.
 */
export async function uninstallWorkbenchHTML(
    filePath: string,
    silent: boolean = false,
) {
    const workbenchHTML = await fs.readFile(filePath, "utf-8");
    const revertedWorkbenchHTML = transformCspInHtml(workbenchHTML, removeTrustedType);

    if (revertedWorkbenchHTML === workbenchHTML) {
        if (!silent) {
            Logger.info("Vibrancy CSP not found. Skipping reversion.");
        }
        return;
    }

    await fs.writeFile(filePath, revertedWorkbenchHTML, "utf-8");
    if (!silent) {
        Logger.info(`Successfully reverted Vibrancy CSP from: ${filePath}`);
    }
}
