import { jsx, mount, patch, updateview } from "../jmx";
let Counter = function ({
  name
}) {
  console.log("Counter.ctor", name);
  this.count = 144;
  this.update = "counter";
  return {
    tag: "COUNTER",
    cn: () => [{
      tag: "I",
      cn: () => [name]
    }, {
      tag: "B",
      cn: () => [this.count]
    }, {
      tag: "BUTTON",
      p: () => ({
        onclick: () => {
          this.count++;
          updateview({
            root: this.element
          }, "b");
        }
      }),
      cn: ["clicks"]
    }, {
      tag: "BUTTON",
      p: () => ({
        onclick: () => {
          this.count++;
          updateview(this.element);
        }
      }),
      cn: ["clicks 2"]
    }]
  };
};
patch(document.body, {
  tag: "BODY",
  cn: () => [{
    tag: Counter,
    p: {
      name: "here the counterotti:"
    }
  }]
});
let updateall = () => updateview(document.body);
let updatecounter = () => updateview("counter");
mount({
  updateview,
  Counter,
  updateall,
  updatecounter
});