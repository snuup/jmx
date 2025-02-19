import typescript from "@rollup/plugin-typescript"
import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import clean from "rollup-plugin-cleanup"

export default {
    input: 'index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: true,
        }
    ],
    plugins: [
        resolve({
            extensions: [".js", ".ts", ".d.ts"]
        }),
        commonjs(), // Convert CommonJS modules to ES modules
        typescript({
            //tsconfig: "./tsconfig.json", // Explicitly point to your tsconfig
            //include: ["jmx/**/*.ts"], // Include all TypeScript files in the jmx directory
        }),
        clean({
            targetFiles: ['dist']
        })
    ]
}