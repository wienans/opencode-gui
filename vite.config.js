"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    plugins: [(0, plugin_react_1.default)()],
    build: {
        outDir: 'out',
        rollupOptions: {
            input: {
                main: (0, path_1.resolve)(__dirname, 'src/webview/index.html')
            },
            output: {
                entryFileNames: 'main.js',
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === 'style.css')
                        return 'main.css';
                    return assetInfo.name || 'asset';
                }
            }
        },
        sourcemap: true
    },
    resolve: {
        alias: {
            '@': (0, path_1.resolve)(__dirname, 'src/webview')
        }
    }
});
//# sourceMappingURL=vite.config.js.map