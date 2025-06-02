import typescript from "@rollup/plugin-typescript";
import clean from "rollup-plugin-cleanup";
import babel from "@rollup/plugin-babel";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";

export default {
    input: "vite-plugin-jmx.ts",
    output: {
        file: "dist/vite-plugin-jmx.js",
        format: "es",
        sourcemap: true
    },
    plugins: [
        clean(),
        json(),
        resolve(), // ✅ Resolves node_modules imports
        commonjs(), // ✅ Converts CommonJS to ES
        typescript(), // ✅ Transpiles TypeScript
        babel({
            babelHelpers: "bundled", // ✅ Embed Babel helpers
            presets: ["@babel/preset-env"], // ✅ Target modern ES versions
            extensions: [".ts", ".tsx", ".js", ".jsx"], // ✅ Ensure TS/JS files are processed
        })
    ]
};
