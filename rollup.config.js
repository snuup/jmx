import typescript from "@rollup/plugin-typescript";
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
  //  terser(),
  ],
  external: [
    // List external dependencies here
  ],
};