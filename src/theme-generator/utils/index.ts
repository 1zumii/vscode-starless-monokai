export * from "./api.ts";
export * from "./proxy.ts";
export * from "./theme.ts";
export * from "./color.ts";

export const clonePlainObject = <Obj extends Record<string, unknown>>(obj: Obj): Obj => JSON.parse(JSON.stringify(obj));

export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);
