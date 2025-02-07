import { jmxplugin } from "./jmx/vite-plugin-jmx" // "./jmx/ plugin/plugin/vite-plugin-jmx"
import * as shared from "./vite.config.shared"

export default {
    ...shared,
    // base: "/",
    build: {
        rollupOptions: {
                // output: {
                //     entryFileNames: `app.js`,
                //     assetFileNames: `[name].[ext]`
                // },
                input: {
                    tests: 'tests/demos.test.tsx', // Replace with your test entry file
                },
                outDir: 'dist-tests', // Separate output for tests
        },
        // css: {
        //     devSourcemap: true,
        // },
        // modulePreload: {
        //     polyfill: false
        // }
    },
    test: {
        environment: 'happy-dom', // Set Happy DOM as the test environment
        globals: true, // Enables Jest-like global functions (`describe`, `it`, `expect`)
        //  exclude: [...configDefaults.exclude, 'e2e/*'], // Optional: Exclude end-to-end tests
    },
}
