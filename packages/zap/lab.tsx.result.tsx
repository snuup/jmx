import { jsx, patch } from "../jmx";
let Counter = function ({
  name
}) {
  this.count = 456;
  return {
    tag: "DIV",
    cn: () => [{
      tag: "H3",
      cn: () => [name]
    }, {
      tag: "B",
      cn: () => [this.count]
    }, {
      tag: "BR"
    }, {
      tag: "BR"
    }, {
      tag: "BUTTON",
      p: () => ({
        onclick: () => this.count++
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
      name: "hasen"
    }
  }]
});