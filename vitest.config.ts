import { jmxplugin } from "./jmx/vite-plugin-jmx" // "./jmx/ plugin/plugin/vite-plugin-jmx"

export default {
    build: {
        rollupOptions: {
            input: {
                tests: 'tests/demos.test.tsx', // Replace with your test entry file
            },
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
}
