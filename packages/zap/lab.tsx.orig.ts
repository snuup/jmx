import { jsx, mount, patch, updateview } from "../jmx";
let Counter = function({ name }) {
  console.log("Counter.ctor", name);
  this.count = 144;
  this.update = "i, b";
  return jsx("counter", null, jsx("i", null, name, " - ", Date.now), jsx("b", null, this.count), jsx("button", { onclick: () => {
    this.count++;
    updateview({ root: this.element }, "b");
  } }, "clicks"), jsx("button", { onclick: () => {
    this.count++;
    updateview(this.element);
  } }, "clicks 2"));
};
let m = {
  name: "cuuuu"
};
patch(document.body, jsx("body", null, jsx(Counter, { name: m.name })));
let updateall = () => updateview(document.body);
let updatecounter = () => updateview("counter");
mount({ updateview, Counter, updateall, updatecounter });
