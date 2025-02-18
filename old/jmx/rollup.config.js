import typescript from "@rollup/plugin-typescript"
import noderesolve from "@rollup/plugin-node-resolve"
import clean from 'rollup-plugin-clean'
import commonjs from "@rollup/plugin-commonjs"
import alias from "@rollup/plugin-alias" // Add this to handle path aliases

export default {
    input: 'jmx/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: true,
        }
    ],
    plugins: [
        noderesolve(),
        commonjs(), // Convert CommonJS modules to ES modules
        typescript({
            tsconfig: "./tsconfig.json", // Explicitly point to your tsconfig
            include: ["jmx/**/*.ts"], // Include all TypeScript files in the jmx directory
        }),
        // clean({
        //     targetFiles: ['dist']
        // }),
        // alias({
        //     entries: [
        //         { find: "jmx", replacement: "./jmx" }, // Map "jmx" to "./jmx"
        //     ],
        // }),
    ]
}