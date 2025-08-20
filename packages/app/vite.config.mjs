import jmxplugin from 'jmx-vite-plugin'

export default {
    esbuild: {
        ignoreAnnotations: true,
        target: 'esnext',
    },
    plugins: [jmxplugin({ debug: false })],
    build: {
        target: 'esnext',

        minify: false,

        sourcemap: true,
        rollupOptions: {
            output: {
                entryFileNames: `app.js`,
                assetFileNames: `[name].[ext]`,
            },
        },
        css: {
            devSourcemap: true,
        },
        modulePreload: {
            polyfill: false,
        },
    },
}
