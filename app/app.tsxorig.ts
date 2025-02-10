import { jsx, jsxf, patch } from "../jmx/jmx";
let F = jsx(jsxf, null, "aa", "bb");
let FE = () => jsx(jsxf, null, "aa", "bb");
let App4 = "hase";
patch(document.body, App4);
