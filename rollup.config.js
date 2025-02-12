//import typescript from '@rollup/plugin-typescript';
//import { terser } from 'rollup-plugin-terser';

export default {
  input: 'jmx/index.ts',
  output: [
    {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    //typescript(),
  //  terser(),
  ],
  external: [
    // List external dependencies here
  ],
};