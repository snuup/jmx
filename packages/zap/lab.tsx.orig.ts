import { jsx, mount, patch, updateview } from "../jmx";
let Counter = function({ name }) {
  this.count ??= 100;
  return jsx("counter", null, jsx("i", null, name), jsx("b", null, this.count), jsx("button", { onclick: () => {
    this.count++;
    this.update();
  } }, "clicks"));
};
patch(document.body, jsx("body", null, jsx(Counter, { name: "here the counterotti:" })));
mount({ updateview });
