import { mount } from "../base/common";
import { jsx, jsxf, patch, updateview } from "../jmx/jmx";
let F = jsx(jsxf, null, "aa", "bb");
let FE = () => jsx(jsxf, null, "aa", "bb");
let App2 = jsx("body", null, jsx(FE, null), jsx("div", null));
let App3 = jsx("body", null, jsx(F, null), jsx("div", null));
mount({ u: updateview, patch, App2, App3 });
patch(document.body, App3);
