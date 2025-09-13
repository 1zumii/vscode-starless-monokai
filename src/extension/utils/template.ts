/**
 * Defines the data type that can be injected into the template.
 */
export type InjectionData = Record<string, string | boolean | number | null>;

/**
 * Generates an injection code block string from a given data object.
 * @param data - The data to be injected.
 * @returns The generated `const $Inject = { ... };` code string.
 */
export function generateInjectString(data: InjectionData): string {
    const properties = Object.entries(data).map(([key, value]) => {
        const valueAsString = JSON.stringify(value);
        return `\t${key}: () => ${valueAsString}`;
    });

    return `const $Inject = {\n${properties.join(",\n")}\n};`;
}

/**
 * Performs a replacement operation within a template string.
 * @param templateContent - The original string content of the template file.
 * @param replacementString - The string to replace the injection block with.
 * @returns The processed template string.
 */
export function replaceInjectionBlock(templateContent: string, replacementString: string): string {
    const injectionBlockRegex = /\/\/ #INJECTION_START[\s\S]*?\/\/ #INJECTION_END/;

    if (!injectionBlockRegex.test(templateContent)) {
        throw new Error("Injection block not found in template content.");
    }

    return templateContent.replace(injectionBlockRegex, replacementString);
}
