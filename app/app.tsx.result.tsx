import { mount } from "../base/common";
import { BaseComp, jsx, jsxf, patch, updateview } from "../jmx/jmx";
import { m } from "./model";
class TextComp extends BaseComp {
  view() {
    return "hase" + this.props.s + Date.now();
  }
  mounted(e) {
    console.log("TextComp mounted", e, this.element);
  }
  update(uc) {
    console.log("TextComp update");
    return true;
  }
}
let a;
export let Numerotti = ({
  n
}) => {
  return {
    kind: "element",
    tag: "DIV",
    props: () => ({
      class: "carrots"
    }),
    children: () => [n]
  };
};
export class Map extends BaseComp {
  state = 500;
  // life
  mounted(e) {
    console.log("Map mounted", e);
  }
  update(uc) {
    console.log("Map update", this, uc);
    return true;
  }
  // core
  increment() {
    this.state++;
    this.updateview();
  }
  // view
  view() {
    console.log("Map view");
    return {
      kind: "element",
      tag: "ASIDE",
      children: () => ["map"]
    };
    let r = {
      kind: "element",
      tag: "DIV",
      props: () => ({
        class: "map"
      }),
      children: () => [this.props.a, this.state, {
        kind: "element",
        tag: "BUTTON",
        props: () => ({
          onclick: this.increment
        }),
        children: () => ["increment"]
      }]
    };
    return r;
  }
}
let App = {
  kind: "element",
  tag: "BODY",
  children: () => [{
    kind: "component",
    tag: Numerotti,
    props: () => ({
      n: m.i * 10,
      mounted: e => console.log("Numerotti mounted", e),
      update: e => console.log("Numerotti update", e)
    })
  }, {
    kind: "component",
    tag: Map,
    props: () => ({
      a: m.i,
      s: "s"
    })
  }]
};
let F = {
  kind: "<>",
  children: () => ["aa", "bb"]
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
  App3
});
patch(document.body, App3);