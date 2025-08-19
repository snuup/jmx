import { jsx, jsxf, updateview, patch } from "../jmx/jmx";
import { mount } from "../jmx/base";
let Counter = function ({
  name
}) {
  this.count = 50;
  this.uc = [{
    patchElementOnly: true
  }];
  return {
    tag: "COUNTER",
    p: () => ({
      class: this.count.toString()
    }),
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
          this.update("i");
        }
      }),
      cn: ["i"]
    }, {
      tag: "BUTTON",
      p: () => ({
        onclick: () => {
          this.count++;
          this.update("b");
        }
      }),
      cn: ["b"]
    }, {
      tag: "BUTTON",
      p: () => ({
        onclick: () => {
          this.count++;
          this.update(this.element);
        }
      }),
      cn: ["this.element"]
    }, {
      tag: "BUTTON",
      p: () => ({
        onclick: () => {
          this.count++;
          this.update("i", "b");
        }
      }),
      cn: ["i + b"]
    }, {
      tag: "BUTTON",
      p: () => ({
        onclick: () => {
          this.count++;
          this.update({
            patchElementOnly: true
          });
        }
      }),
      cn: ["patchelementonly"]
    }, {
      tag: "BUTTON",
      p: () => ({
        onclick: () => {
          this.count++;
          this.update();
        }
      }),
      cn: ["empty"]
    }]
  };
};
let m = {
  name: "cuuuu"
};
let F = {
  cn: () => [{
    tag: "B",
    cn: ["1"]
  }]
};
let A = {
  tag: "DIV",
  cn: () => [{
    tag: F
  }, {
    tag: "ARTICLE"
  }, {
    tag: "ASIDE"
  }]
};
patch(document.body, {
  tag: "BODY",
  cn: () => [{
    tag: Counter,
    p: () => ({
      name: m.name
    })
  }, {
    tag: Counter,
    p: () => ({
      name: m.name + " no2"
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