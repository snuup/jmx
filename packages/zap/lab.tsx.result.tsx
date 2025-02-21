import { jsx, mount, patch, updateview } from "../jmx";
let Counter = function ({
  name
}) {
  console.log("Counter.ctor", name);
  this.count = 144;
  this.update = "i, b";
  return {
    tag: "COUNTER",
    cn: () => [{
      tag: "I",
      cn: () => [name, " - ", Date.now]
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
let m = {
  name: "cuuuu"
};
patch(document.body, {
  tag: "BODY",
  cn: () => [{
    tag: Counter,
    p: () => ({
      name: m.name
    })
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