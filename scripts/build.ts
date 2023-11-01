import path from 'node:path';
import url from 'node:url';
import { Project, ScriptTarget } from 'ts-morph';
import chalk from 'chalk';

console.log(chalk.blue('[ts-morph] Start Compiling'));

// project root
const rootPath = url.fileURLToPath(new URL('../../', import.meta.url));

// initial project with config
const project = new Project({
    compilerOptions: {
        tsConfigFilePath: path.resolve(rootPath, './tsconfig.json'),
        target: ScriptTarget.ES2022,
    },
});

// FIXME: why i need add manually, Project doesn't resolve and add source files in construction
project.addSourceFilesAtPaths(path.resolve(rootPath, './src/**/*'));

// manipulate import's module file extension
project
    .getSourceFiles()
    .forEach((sourceFile) => {
        const importDeclarations = sourceFile.getImportDeclarations();
        importDeclarations.forEach((declaration) => {
            const importPathLiteral = declaration.getModuleSpecifier();
            const importPath = importPathLiteral.getLiteralValue();

            const matchResult = importPath.match(/^((\.|\.\.)\/.+)\.ts$/);
            if (!matchResult)
                return;

            const convertedPath = `${matchResult[1]}.js`;
            importPathLiteral.setLiteralValue(convertedPath);
        });
    });

project
    .emit()
    .then(result => result.getDiagnostics());
