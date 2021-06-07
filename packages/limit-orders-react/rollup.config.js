import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import image from "@rollup/plugin-image";
import scss from "rollup-plugin-scss";
import json from "@rollup/plugin-json";
import { terser } from "rollup-plugin-terser";

// this override is needed because Module format cjs does not support top-level await
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("./package.json");

const globals = {
  ...packageJson.devDependencies,
};

const extensions = [".ts", ".js", ".tsx", "jsx"];

export default {
  input: "./src/index.tsx",
  output: [
    {
      file: packageJson.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: packageJson.module,
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: ".",
    }),
    peerDepsExternal(),
    resolve({ extensions }),
    commonjs(),
    babel({
      babelHelpers: "inline",
      include: ["src/**/*"],
      exclude: "node_modules/**",
      extensions,
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript",
      ],
      plugins: [
        "babel-plugin-styled-components",
        "macros",
        "babel-plugin-inline-react-svg",
      ],
    }),
    image(),
    scss(),
    json(),
    terser(),
  ],
  external: Object.keys(globals),
};
