# Starless Monokai
[![code style](https://antfu.me/badge-code-style.svg)](https://github.com/antfu/eslint-config)

![](./assets/screenshot-1.png)

## 🛠️ Develop

### debug extension
refer to [*Debugging the extension*](https://code.visualstudio.com/api/get-started/your-first-extension#debugging-the-extension)

### npm scripts
- `generate`: run node script to generate extension

### dev references
- [Extension API](https://code.visualstudio.com/api)
- [Tasks](https://code.visualstudio.com/docs/editor/tasks)
    - [Schema for tasks.json](https://code.visualstudio.com/docs/editor/tasks-appendix)
    - [background task & prelaunchTask](https://code.visualstudio.com/docs/editor/tasks#_can-a-background-task-be-used-as-a-prelaunchtask-in-launchjson)
    - [Launch.json attributes](https://code.visualstudio.com/docs/editor/debugging#_launchjson-attributes)
- [UX Guidelines](https://code.visualstudio.com/api/ux-guidelines/overview)
- [Theme Color](https://code.visualstudio.com/api/references/theme-color)

### explore syntax highlighting
use built-in [scope inspector tool](https://code.visualstudio.com/api/language-extensions/syntax-highlight-guide#scope-inspector)
1. open Command Palette
2. `Developer: Inspect Editor Tokens and Scopes`

### inspect vscode element style
use built-in devtool
1. debug, to launch extension dev host
2. open Command Palette
3. `Developer: Toggle Developer Tools`

### lint and git hooks
- [`postinstall`](https://docs.npmjs.com/cli/v10/using-npm/scripts#life-cycle-operation-order) in `scripts` will auto register git hooks set by [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks), after `npm install`
- `npm run register-hooks` manually each time changed git hooks in `simple-git-hooks` field of `package.json`
