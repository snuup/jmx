import typescript from "@rollup/plugin-typescript"
import copy from 'rollup-plugin-copy'
import clean from 'rollup-plugin-clean'
//import dts from "rollup-plugin-dts";
//import { terser } from 'rollup-plugin-terser';

export default {
    input: 'jmx/index.ts',
    output: [
        {
            file: 'dist/index.js',
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
        copy({
            targets: [
                { src: 'jmx/vite-plugin-jmx.ts', dest: 'dist' } // Copy a specific file
            ],
        }),
        clean({
            targetFiles: ['dist']
        })
    ],
    //  terser(),
    external: [
        // List external dependencies here
    ],
}