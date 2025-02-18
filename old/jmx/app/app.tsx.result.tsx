import { mount } from "../base/common";
import { jsx, jsxf, patch, updateview } from "../jmx/jmx";
export const When = ({
  cond
}, children) => cond ? {
  kind: "<>",
  children: () => [children]
} : void 0;
let None = () => {};
let App = {
  kind: "element",
  tag: "BODY",
  children: () => [{
    kind: "element",
    tag: "DIV",
    children: () => [{
      kind: "component",
      tag: None
    }, {
      kind: "component",
      tag: When,
      props: () => ({
        cond: 1
      }),
      children: () => ["1"]
    }, {
      kind: "component",
      tag: When,
      props: () => ({
        cond: 1
      }),
      children: () => ["2"]
    }]
  }, {
    kind: "element",
    tag: "B",
    children: () => ["boldo"]
  }]
};
mount({
  u: updateview,
  patch,
  App
});
patch(document.body, {
  kind: "component",
  tag: App
});