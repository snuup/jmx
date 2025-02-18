import typescript from "@rollup/plugin-typescript"
//import copy from 'rollup-plugin-copy'
//import clean from 'rollup-plugin-clean'
//import dts from "rollup-plugin-dts";
//import { terser } from 'rollup-plugin-terser';

export default {
    input: 'jmx/vite-plugin-jmx.ts',
    output: [
        {
            file: 'dist/vite-plugin-jmx.js',
            format: 'es',
            sourcemap: true,
        },
        // {
        //   file: 'dist/index.esm.js',
        //   format: 'esm',
        //   sourcemap: true,
        // },
    ],
    plugins: [
        typescript(),
        // clean({
        //     targetFiles: ['dist']
        // })
    ]
}