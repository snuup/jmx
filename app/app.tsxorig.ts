import { jsx, patch } from "../jmx/jmx";
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
let App = jsx("body", null, jsx(Map, { a: m.i, s: "s" }));
let App4 = "hase";
patch(document.body, "hasen");
