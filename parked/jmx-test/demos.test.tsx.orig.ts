import { jsx, jsxf, patch } from "@snupo/jmx";
import { describe, expect, beforeEach, it } from "vitest";
import { JMXComp } from "@snupo/jmx";
beforeEach(() => {
  document.body.replaceChildren();
  document.body.getAttributeNames().forEach((a) => document.body.removeAttribute(a));
  window.requestAnimationFrame = (cb) => {
    cb(0);
    return 0;
  };
});
describe("JMX dom tests", () => {
  it("HTag 1", () => {
    var _h = jsx("body", null, "hase");
    let h = {
      tag: "BODY",
      cn: () => ["hase"]
    };
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 1 thunked", () => {
    var _h = jsx("body", null, "hase");
    let h = () => ({
      tag: "BODY",
      cn: () => ["hase"]
    });
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 2", () => {
    let _h = jsx("body", { class: "cc" }, "hase", 42, true, false);
    let h = {
      tag: "BODY",
      p: () => ({
        class: "cc"
      }),
      cn: () => ["hase", 42, true, false]
    };
    patch(document.body, h);
    expect(document.body.className).toBe("cc");
    expect(document.body.innerHTML).toBe("hase42truefalse");
  });
  it("HFunction", () => {
    let F = ({ x }) => jsx("div", { class: "classo" + x * 3 }, x * 2);
    let a = jsx("body", null, jsx(F, { x: 7 }));
    let _F = ({ x }) => ({
      tag: "DIV",
      p: () => ({
        class: "classo" + x * 3
      }),
      cn: () => [x * 2]
    });
    let _a = {
      tag: "BODY",
      cn: () => [
        {
          tag: _F,
          p: () => ({ x: 7 }),
          cn: () => []
        }
        // as HCompFun // tbd - why ??
      ]
    };
    patch(document.body, a);
    expect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>');
  });
  it("clear styles after update", () => {
    patch(document.body, jsx("body", null, jsx("div", { class: "hase" }, "div")));
    expect(document.body.innerHTML).toBe('<div class="hase">div</div>');
    patch(document.querySelector("div"), jsx("div", null, "snuff"));
    expect(document.body.innerHTML).toBe("<div>snuff</div>");
  });
  it("fragments", () => {
    let F = jsx(jsxf, null, jsx("b", null, "1"), jsx("b", null, "2"), jsx("b", null, "3"));
    patch(document.body, jsx("body", null, jsx(F, null)));
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
  });
  it("fragment thunked", () => {
    let F = () => jsx(jsxf, null, jsx("b", null, "1"), jsx("b", null, "2"), jsx("b", null, "3"));
    patch(document.body, jsx("body", null, jsx(F, null)));
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
  });
  it("fragments many", () => {
    let F = jsx(jsxf, null, jsx("b", null, "1"), jsx("b", null, "2"), jsx("b", null, "3"));
    patch(document.body, jsx("body", null, jsx(F, null), jsx(F, null)));
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b><b>1</b><b>2</b><b>3</b>");
  });
  it("element as object", () => {
    let D = jsx("div", null);
    patch(document.body, jsx("body", null, jsx(D, null)));
    expect(document.body.innerHTML).toBe("<div></div>");
  });
  it("element as thunked object", () => {
    let D = () => jsx("div", null);
    patch(document.body, jsx("body", null, jsx(D, null)));
    expect(document.body.innerHTML).toBe("<div></div>");
  });
  it("class component is constructed", () => {
    class C extends JMXComp {
      view() {
        return "bunny component";
      }
    }
    patch(document.body, jsx("body", null, jsx(C, null)));
    expect(document.body.innerHTML).toBe("bunny component");
  });
  it("class component h is attached", () => {
    class C extends JMXComp {
      view() {
        return jsx("div", null);
      }
    }
    patch(document.body, jsx("body", null, jsx(C, null)));
    expect(document.querySelector("div")?.h).toBeDefined();
  });
  it("class component instance h.i is attached", () => {
    class C extends JMXComp {
      view() {
        return jsx("div", null);
      }
    }
    patch(document.body, jsx("body", null, jsx(C, null)));
    let h = document.querySelector("div")?.h;
    expect(h.i).toBeDefined();
  });
  it("fragments in context", () => {
    let F = jsx(jsxf, null, jsx("b", null, "1"));
    let A = jsx("div", null, jsx(F, null), jsx("article", null), jsx("aside", null));
    patch(document.body, jsx("body", null, jsx(A, null)));
    expect(document.body.innerHTML).toBe("<div><b>1</b><article></article><aside></aside></div>");
  });
  it("fragments in context2", () => {
    let F = () => jsx(jsxf, null, jsx("b", null, "1"));
    let A = jsx("div", null, jsx(F, null), jsx("article", null), jsx("aside", null));
    patch(document.body, jsx("body", null, jsx(A, null)));
    expect(document.body.innerHTML).toBe("<div><b>1</b><article></article><aside></aside></div>");
  });
});
