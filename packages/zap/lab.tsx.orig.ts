import { jsx, jsxf, updateview, patch } from "../jmx/jmx";
import { mount } from "../jmx/base";
let Counter = function({ name }) {
  this.count = 50;
  this.uc = [{ patchElementOnly: true }];
  return jsx("counter", { class: this.count.toString() }, jsx("i", null, name, " - ", Date.now), jsx("b", null, this.count), jsx("button", { onclick: () => {
    this.count++;
    this.update("i");
  } }, "i"), jsx("button", { onclick: () => {
    this.count++;
    this.update("b");
  } }, "b"), jsx("button", { onclick: () => {
    this.count++;
    this.update(this.element);
  } }, "this.element"), jsx("button", { onclick: () => {
    this.count++;
    this.update("i", "b");
  } }, "i + b"), jsx("button", { onclick: () => {
    this.count++;
    this.update({ patchElementOnly: true });
  } }, "patchelementonly"), jsx("button", { onclick: () => {
    this.count++;
    this.update();
  } }, "empty"));
};
let m = {
  name: "cuuuu"
};
let F = jsx(jsxf, null, jsx("b", null, "1"));
let A = jsx("div", null, jsx(F, null), jsx("article", null), jsx("aside", null));
patch(document.body, jsx("body", null, jsx(Counter, { name: m.name }), jsx(Counter, { name: m.name + " no2" })));
let updateall = () => updateview(document.body);
let updatecounter = () => updateview("counter");
mount({ updateview, Counter, updateall, updatecounter });
