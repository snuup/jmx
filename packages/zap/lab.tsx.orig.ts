import { jsx, mount, patch, updateview } from "../jmx";
let Counter = function({ name }) {
  this.count = 144;
  this.update = "b";
  return jsx("counter", null, jsx("i", null, name), jsx("b", null, this.count), jsx("button", { onclick: () => {
    this.count++;
    updateview({ root: this.element }, "b");
  } }, "clicks"));
};
patch(document.body, jsx("body", null, jsx(Counter, { name: "here the counterotti:" })));
let updateall = () => updateview(document.body);
let updatecounter = () => updateview("counter");
mount({ updateview, Counter, updateall, updatecounter });
