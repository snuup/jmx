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
let App4 = "hase";
mount({
  u: updateview,
  patch
});
patch(document.body, App);