import jmxplugin from "jmx-plugin"

export default {
    root: "app",
    base: "/",
    esbuild: {
        ignoreAnnotations: true,
        target: 'esnext',
    },
    plugins: [
        jmxplugin({ debug: 0 })
    ],
    build: {
        target: 'esnext',
        minify: false,
        rollupOptions: {
            output: {
                entryFileNames: `app.js`,
                assetFileNames: `[name].[ext]`
            },
        },
        css: {
            devSourcemap: true,
        },
        modulePreload: {
            polyfill: false
        }
    },
    // test: {
    //     environment: 'happy-dom', // Set Happy DOM as the test environment
    //     globals: true, // Enables Jest-like global functions (`describe`, `it`, `expect`)
    //     //  exclude: [...configDefaults.exclude, 'e2e/*'], // Optional: Exclude end-to-end tests
    // }
}