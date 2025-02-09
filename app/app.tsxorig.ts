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
export let Numerotti = ({ n }) => {
  return jsx("div", { class: "carrots" }, n);
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
    return jsx("aside", null, "map");
    let r = jsx("div", { class: "map" }, this.props.a, this.state, jsx("button", { onclick: this.increment }, "increment"));
    return r;
  }
}
let App = jsx("body", null, jsx(Numerotti, { n: m.i * 10, mounted: (e) => console.log("Numerotti mounted", e), update: (e) => console.log("Numerotti update", e) }), jsx(Map, { a: m.i, s: "s" }));
let F = jsx(jsxf, null, "aa", "bb");
let App3 = jsx("body", null, jsx(F, null), jsx("div", null));
mount({ u: updateview, patch, App3 });
patch(document.body, App3);
