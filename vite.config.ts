import { jmxplugin } from "./vite-plugin-jmx" // "./jmx/ plugin/plugin/vite-plugin-jmx"

export default {
    base: "/",
    esbuild: {
        ignoreAnnotations: true,
        target: 'esnext', // this should be the default target anway, but I remember that once there were problems without this.
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
