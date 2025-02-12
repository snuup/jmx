import { mount } from "../base/common";
import { jsx, patch, updateview } from "../jmx/jmx";
import { JMXComp } from "../jmx/lib";
import { m } from "./model";
class TextComp extends JMXComp {
  view() {
    return "hase" + this.props.s + Date.now();
  }
  mounted() {
    console.log("TextComp mounted", this.element);
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
  h;
  // life
  // constructor(p) {
  //     super(p)
  //     console.log("Map ctor")
  // }
  // override mounted() {
  //     console.log("Map.mounted", this)
  // }
  update(uc) {
    console.log("Map.update", this, uc);
    return true;
  }
  // core
  increment() {
    this.state++;
    patch(this.element, this.h);
  }
  // view
  view() {
    console.log("Map.view");
    return this.h = {
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
export class Counter extends JMXComp {
  count = this.props.start;
  h;
  update(uc) {
    console.log("Map.update", this, uc);
    return true;
  }
  increment() {
    this.count++;
    let ch = this.element.h;
    patch(this.element, this.h);
  }
  view() {
    return this.h = {
      kind: "element",
      tag: "DIV",
      props: () => ({
        class: "map"
      }),
      children: () => [this.props.name, ": ", this.count, {
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
let Island = {
  kind: "element",
  tag: "DIV",
  props: () => ({
    update: () => true
  }),
  children: () => ["island - ", m.i, " -."]
};
let App = {
  kind: "element",
  tag: "BODY",
  children: () => [{
    kind: "component",
    tag: Counter,
    props: () => ({
      name: "count-sheeps",
      start: m.i
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