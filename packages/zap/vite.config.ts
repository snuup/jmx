// import jmxplugin from './vite-plugin-jmx'

// import traverse from "@babel/traverse"
// import generate from "@babel/generator"
// import * as t from "@babel/types"
// import * as fs from "fs"

import jmxplugin from './vite-plugin-jmx'

//console.log("vite-plugin-jmx traverse", traverse.name);

export default {
    esbuild: {
        ignoreAnnotations: true,
        target: 'esnext',
    },
    plugins: [
        jmxplugin({ debug: 1 }),
//        commonjs()
    ],
    build: {
        target: 'esnext',
        minify: 0,
        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: `app.js`,
                assetFileNames: `[name].[ext]`,
            },
        },
        modulePreload: {
            polyfill: false,
        },
    },
}
