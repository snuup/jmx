import { jmxplugin } from "./vite-plugin-jmx" // "./jmx/ plugin/plugin/vite-plugin-jmx"

export default {
    base: "/",
    esbuild: {
        ignoreAnnotations: true,
        target: 'esnext',
    },
    plugins: [
        jmxplugin()
    ],
    build: {
        target: 'esnext', // !!
        minify: false,
        rollupOptions: {
            output: {
                entryFileNames: `app.js`,
                assetFileNames: `[name].[ext]`
            }
        }
    }
}
