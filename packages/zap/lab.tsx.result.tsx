import { jsx, mount, patch, updateview } from "../jmx";
let Counter = function ({
  name
}) {
  this.count = 144;
  this.update = "b";
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