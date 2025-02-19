import jmxplugin from './/vite-plugin-jmx'

export default {
    esbuild: {
        ignoreAnnotations: true,
        target: 'esnext',
    },
    plugins: [
        jmxplugin({ debug: 1 }),
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
