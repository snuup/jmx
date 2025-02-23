import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
    test: {
        include: ['packages/**/tests/**/*.{test,spec}.{js,ts}'], // Include tests in all packages
        exclude: ['node_modules'], // Exclude node_modules
    },
    resolve: {
        alias: {
            // Add aliases for each package (optional but recommended)
            'jmx-test': 'A:\\h\dev\\jmx25\\jmx\\packages\\jmx-test'
        },
    },
})