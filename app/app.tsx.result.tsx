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
    return {
      kind: "element",
      tag: "DIV",
      props: () => ({
        class: "map"
      }),
      children: () => [this.props.a, " ", this.state, " ", m.i, {
        kind: "element",
        tag: "BUTTON",
        props: () => ({
          onclick: this.increment
        }),
        children: () => ["increment"]
      }]
    };
  }
}
let App = {
  kind: "element",
  tag: "BODY",
  children: () => [{
    kind: "component",
    tag: Map,
    props: () => ({
      a: m.i,
      s: "s"
    })
  }]
};
let App4 = "hase";
mount({
  u: updateview,
  patch
});
patch(document.body, {
  kind: "component",
  tag: App
});