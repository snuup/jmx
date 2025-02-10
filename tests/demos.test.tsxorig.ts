import { jsx, jsxf, patch } from "../jmx/jmx";
import { describe, expect, beforeEach, it } from "vitest";
import { JMXComp } from "../jmx/lib";
beforeEach(() => {
  document.body.replaceChildren();
  document.body.getAttributeNames().forEach((a) => document.body.removeAttribute(a));
});
describe("JMX dom tests", () => {
  it("HTag 1", () => {
    var _h = /* @__PURE__ */ jsx("body", null, "hase");
    let h = {
      kind: "element",
      tag: "BODY",
      children: () => ["hase"]
    };
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 1 thunked", () => {
    var _h = /* @__PURE__ */ jsx("body", null, "hase");
    let h = () => ({
      kind: "element",
      tag: "BODY",
      children: () => ["hase"]
    });
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 2", () => {
    let _h = /* @__PURE__ */ jsx("body", { class: "cc" }, "hase", 42, true, false);
    let h = {
      kind: "element",
      tag: "BODY",
      props: () => ({
        class: "cc"
      }),
      children: () => ["hase", 42, true, false]
    };
    patch(document.body, h);
    expect(document.body.className).toBe("cc");
    expect(document.body.innerHTML).toBe("hase42truefalse");
  });
  it("HFunction", () => {
    let F = ({ x }) => /* @__PURE__ */ jsx("div", { class: "classo" + x * 3 }, x * 2);
    let a = /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(F, { x: 7 }));
    let _F = ({ x }) => ({
      kind: "element",
      tag: "DIV",
      props: () => ({
        class: "classo" + x * 3
      }),
      children: () => [x * 2]
    });
    let _a = {
      tag: "BODY",
      children: () => [
        {
          kind: "component",
          tag: _F,
          props: () => ({
            x: 7
          }),
          children: () => []
        }
      ]
    };
    patch(document.body, a);
    expect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>');
  });
  it("clear styles after update", () => {
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx("div", { class: "hase" }, "div")));
    expect(document.body.innerHTML).toBe('<div class="hase">div</div>');
    patch(document.querySelector("div"), /* @__PURE__ */ jsx("div", null, "snuff"));
    expect(document.body.innerHTML).toBe("<div>snuff</div>");
  });
  it("fragments", () => {
    let F = /* @__PURE__ */ jsx(jsxf, null, /* @__PURE__ */ jsx("b", null, "1"), /* @__PURE__ */ jsx("b", null, "2"), /* @__PURE__ */ jsx("b", null, "3"));
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(F, null)));
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
  });
  it("fragment thunked", () => {
    let F = () => /* @__PURE__ */ jsx(jsxf, null, /* @__PURE__ */ jsx("b", null, "1"), /* @__PURE__ */ jsx("b", null, "2"), /* @__PURE__ */ jsx("b", null, "3"));
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(F, null)));
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
  });
  it("fragments many", () => {
    let F = /* @__PURE__ */ jsx(jsxf, null, /* @__PURE__ */ jsx("b", null, "1"), /* @__PURE__ */ jsx("b", null, "2"), /* @__PURE__ */ jsx("b", null, "3"));
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(F, null), /* @__PURE__ */ jsx(F, null)));
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b><b>1</b><b>2</b><b>3</b>");
  });
  it("element as object", () => {
    let D = /* @__PURE__ */ jsx("div", null);
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(D, null)));
    expect(document.body.innerHTML).toBe("<div></div>");
  });
  it("element as thunked object", () => {
    let D = () => /* @__PURE__ */ jsx("div", null);
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(D, null)));
    expect(document.body.innerHTML).toBe("<div></div>");
  });
  it("class component is constructed", () => {
    class C extends JMXComp {
      view() {
        return "bunny component";
      }
    }
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(C, null)));
    expect(document.body.innerHTML).toBe("bunny component");
  });
  it("class component h is attached", () => {
    class C extends JMXComp {
      view() {
        return /* @__PURE__ */ jsx("div", null);
      }
    }
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(C, null)));
    expect(document.querySelector("div")?.h).toBeDefined();
  });
  it("class component instance h.i is attached", () => {
    class C extends JMXComp {
      view() {
        return /* @__PURE__ */ jsx("div", null);
      }
    }
    patch(document.body, /* @__PURE__ */ jsx("body", null, /* @__PURE__ */ jsx(C, null)));
    let h = document.querySelector("div")?.h;
    expect(h.i).toBeDefined();
  });
});
