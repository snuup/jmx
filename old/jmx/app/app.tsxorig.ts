import { mount } from "../base/common";
import { jsx, jsxf, patch, updateview } from "../jmx/jmx";
export const When = ({ cond }, children) => cond ? jsx(jsxf, null, children) : void 0;
let None = () => {
};
let App = jsx("body", null, jsx("div", null, jsx(None, null), jsx(When, { cond: 1 }, "1"), jsx(When, { cond: 1 }, "2")), jsx("b", null, "boldo"));
mount({ u: updateview, patch, App });
patch(document.body, jsx(App, null));
