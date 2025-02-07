import { jmxplugin } from "./jmx/vite-plugin-jmx" // "./jmx/ plugin/plugin/vite-plugin-jmx"
import * as shared from "./vite.config.shared"

export default {
    ...shared,
    build: {
        rollupOptions: {},
        css: {
            devSourcemap: true,
        },
        modulePreload: {
            polyfill: false
        }
    },
    test: {
        environment: 'happy-dom', // Set Happy DOM as the test environment
        globals: true, // Enables Jest-like global functions (`describe`, `it`, `expect`)
        //  exclude: [...configDefaults.exclude, 'e2e/*'], // Optional: Exclude end-to-end tests
    },
}
