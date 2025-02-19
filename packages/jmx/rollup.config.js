import typescript from "@rollup/plugin-typescript"
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
        typescript(),
        clean()
    ]
}