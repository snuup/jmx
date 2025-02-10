import { mount } from "../base/common";
import { jsx, jsxf, patch, updateview } from "../jmx/jmx";
let F = {
  kind: "<>",
  children: () => ["aa", "bb"]
};
let FE = () => ({
  kind: "<>",
  children: () => ["aa", "bb"]
});
let App2 = {
  kind: "element",
  tag: "BODY",
  children: () => [{
    kind: "component",
    tag: FE
  }, {
    kind: "element",
    tag: "DIV"
  }]
};
let App3 = {
  kind: "element",
  tag: "BODY",
  children: () => [{
    kind: "component",
    tag: F
  }, {
    kind: "element",
    tag: "DIV"
  }]
};
mount({
  u: updateview,
  patch,
  App2,
  App3
});
patch(document.body, App3);