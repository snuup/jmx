import copy from 'rollup-plugin-copy'
import { jmxplugin } from "./jmx/vite-plugin-jmx" // "./jmx/ plugin/plugin/vite-plugin-jmx"
import clean from 'vite-plugin-clean'

export default {
    root: "jmx",
    base: "/",
    esbuild: {
        ignoreAnnotations: true,
        target: 'esnext',
    },
    plugins: [
        jmxplugin(),
        copy({
            targets: [
                { src: 'jmx/vite-plugin-jmx.ts', dest: 'dist' }
            ]
        }),
        clean({
            targetFiles: ['dist'], // Clean the `dist` folder
        }),
    ],
    build: {
        target: 'esnext',
        minify: false,
        rollupOptions: {
            output: {
                entryFileNames: `app.js`,
                assetFileNames: `[name].[ext]`
            }
        },
        modulePreload: {
            polyfill: false
        }
    }
}