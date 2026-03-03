import typescript from "@rollup/plugin-typescript"
import clean from "rollup-plugin-cleanup"
import copy from 'rollup-plugin-copy'
//import { createPathTransform } from 'rollup-sourcemap-path-transform'

export default {
    input: 'index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: true,
        }
    ],
    // sourcemapPathTransform: createPathTransform({
    //     prefixes: {
    //         '*src/components/': '/compi/comps/',
    //         '/node_modules/': '/compi/deps/',
    //         "../../../../../../../jmxa": "hase"
    //     }
    // }),
    plugins: [
        typescript(),
        copy({
            targets: [
                { src: '*.d.ts', dest: 'dist' }, // Copy all d.ts files to dist
            ],
        }),
        clean()
    ]
}