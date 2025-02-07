import { jmxplugin } from "./jmx/vite-plugin-jmx" // "./jmx/ plugin/plugin/vite-plugin-jmx"
//import * as shared from "./vite.config.shared"
import { defineConfig } from 'vitest/config'

export default defineConfig({
    // ...shared,
    // base: "/",
    build: {
        rollupOptions: {
                input: {
                    tests: 'tests/demos.test.tsx', // Replace with your test entry file
                },
                //outDir: 'dist-tests', // Separate output for tests
        }
    },
    plugins: [
            jmxplugin()
        ],
    test: {
        environment: 'happy-dom', // Set Happy DOM as the test environment
        globals: true, // Enables Jest-like global functions (`describe`, `it`, `expect`)
        //  exclude: [...configDefaults.exclude, 'e2e/*'], // Optional: Exclude end-to-end tests
    },
})
