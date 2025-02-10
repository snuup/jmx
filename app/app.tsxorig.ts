import { mount } from "../base/common";
import { jsx, patch, updateview } from "../jmx/jmx";
import { JMXComp } from "../jmx/lib";
import { m } from "./model";
class TextComp extends JMXComp {
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
export class Map extends JMXComp {
  state = 500;
  // life
  constructor(p) {
    super(p);
    console.log("Map ctor");
  }
  mounted() {
    console.log("Map.mounted", this);
  }
  update(uc) {
    console.log("Map.update", this, uc);
    return true;
  }
  // core
  increment() {
    this.state++;
    this.updateview();
  }
  // view
  view() {
    console.log("Map.view");
    return jsx("div", { class: "map" }, this.props.a, " ", this.state, " ", m.i, jsx("button", { onclick: this.increment }, "increment"));
  }
}
let App = jsx("body", null, jsx(Map, { a: m.i, s: "s" }));
let App4 = "hase";
mount({ u: updateview, patch });
patch(document.body, jsx(App, null));
