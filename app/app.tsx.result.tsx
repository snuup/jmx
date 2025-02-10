import { jsx, jsxf, patch } from "../jmx/jmx";
let F = {
  kind: "<>",
  children: () => ["aa", "bb"]
};
let FE = () => ({
  kind: "<>",
  children: () => ["aa", "bb"]
});
let App4 = "hase";
patch(document.body, App4);