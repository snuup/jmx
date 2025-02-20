import { jsx, mount, patch, updateview } from "../jmx";
let Counter = function ({
  name
}) {
  this.count ??= 100;
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
          this.update();
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
mount({
  updateview
});