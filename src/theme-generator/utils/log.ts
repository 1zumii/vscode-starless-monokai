import chalk from "chalk";

export const Logger = {
    error: (...messages: unknown[]) => {
        console.error(chalk.red(...messages));
    },
};
