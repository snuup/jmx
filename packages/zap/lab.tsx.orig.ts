import { jsx, mount, patch, updateview } from "../jmx";
let Counter = function({ name }) {
  console.log("Counter.ctor", name);
  this.count = 144;
  this.update = "counter";
  return jsx("counter", null, jsx("i", null, name), jsx("b", null, this.count), jsx("button", { onclick: () => {
    this.count++;
    updateview({ root: this.element }, "b");
  } }, "clicks"), jsx("button", { onclick: () => {
    this.count++;
    updateview(this.element);
  } }, "clicks 2"));
};
patch(document.body, jsx("body", null, jsx(Counter, { name: "here the counterotti:" })));
let updateall = () => updateview(document.body);
let updatecounter = () => updateview("counter");
mount({ updateview, Counter, updateall, updatecounter });
