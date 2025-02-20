import { jsx, patch } from "../jmx";
let Counter = function({ name }) {
  this.count = 456;
  return jsx("div", null, jsx("h3", null, name), jsx("b", null, this.count), jsx("br", null), jsx("br", null), jsx("button", { onclick: () => this.count++ }, "clicks"));
};
patch(document.body, jsx("body", null, jsx(Counter, { name: "hasen" })));
