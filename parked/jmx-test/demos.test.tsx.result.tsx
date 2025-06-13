import { jsx, jsxf, patch } from "@snupo/jmx";
import { describe, expect, beforeEach, it } from "vitest";
import { JMXComp } from "@snupo/jmx";
beforeEach(() => {
  document.body.replaceChildren();
  document.body.getAttributeNames().forEach(a => document.body.removeAttribute(a));
  window.requestAnimationFrame = cb => {
    cb(0);
    return 0;
  };
});
describe("JMX dom tests", () => {
  it("HTag 1", () => {
    var _h = {
      tag: "BODY",
      cn: ["hase"]
    };
    let h = {
      tag: "BODY",
      cn: () => ["hase"]
    };
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 1 thunked", () => {
    var _h = {
      tag: "BODY",
      cn: ["hase"]
    };
    let h = () => ({
      tag: "BODY",
      cn: () => ["hase"]
    });
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 2", () => {
    let _h = {
      tag: "BODY",
      p: {
        class: "cc"
      },
      cn: ["hase", 42, true, false]
    };
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
    let F = ({
      x
    }) => ({
      tag: "DIV",
      p: () => ({
        class: "classo" + x * 3
      }),
      cn: () => [x * 2]
    });
    let a = {
      tag: "BODY",
      cn: () => [{
        tag: F,
        p: {
          x: 7
        }
      }]
    };
    let _F = ({
      x
    }) => ({
      tag: "DIV",
      p: () => ({
        class: "classo" + x * 3
      }),
      cn: () => [x * 2]
    });
    let _a = {
      tag: "BODY",
      cn: () => [{
        tag: _F,
        p: () => ({
          x: 7
        }),
        cn: () => []
      }
      // as HCompFun // tbd - why ??
      ]
    };
    patch(document.body, a);
    expect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>');
  });
  it("clear styles after update", () => {
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: "DIV",
        p: {
          class: "hase"
        },
        cn: ["div"]
      }]
    });
    expect(document.body.innerHTML).toBe('<div class="hase">div</div>');
    patch(document.querySelector("div"), {
      tag: "DIV",
      cn: ["snuff"]
    });
    expect(document.body.innerHTML).toBe("<div>snuff</div>");
  });
  it("fragments", () => {
    let F = {
      cn: () => [{
        tag: "B",
        cn: ["1"]
      }, {
        tag: "B",
        cn: ["2"]
      }, {
        tag: "B",
        cn: ["3"]
      }]
    };
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: F
      }]
    });
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
  });
  it("fragment thunked", () => {
    let F = () => ({
      cn: () => [{
        tag: "B",
        cn: ["1"]
      }, {
        tag: "B",
        cn: ["2"]
      }, {
        tag: "B",
        cn: ["3"]
      }]
    });
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: F
      }]
    });
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
  });
  it("fragments many", () => {
    let F = {
      cn: () => [{
        tag: "B",
        cn: ["1"]
      }, {
        tag: "B",
        cn: ["2"]
      }, {
        tag: "B",
        cn: ["3"]
      }]
    };
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: F
      }, {
        tag: F
      }]
    });
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b><b>1</b><b>2</b><b>3</b>");
  });
  it("element as object", () => {
    let D = {
      tag: "DIV"
    };
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: D
      }]
    });
    expect(document.body.innerHTML).toBe("<div></div>");
  });
  it("element as thunked object", () => {
    let D = () => ({
      tag: "DIV"
    });
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: D
      }]
    });
    expect(document.body.innerHTML).toBe("<div></div>");
  });
  it("class component is constructed", () => {
    class C extends JMXComp {
      view() {
        return "bunny component";
      }
    }
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: C
      }]
    });
    expect(document.body.innerHTML).toBe("bunny component");
  });
  it("class component h is attached", () => {
    class C extends JMXComp {
      view() {
        return {
          tag: "DIV"
        };
      }
    }
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: C
      }]
    });
    expect(document.querySelector("div")?.h).toBeDefined();
  });
  it("class component instance h.i is attached", () => {
    class C extends JMXComp {
      view() {
        return {
          tag: "DIV"
        };
      }
    }
    patch(document.body, {
      tag: "BODY",
      cn: () => [{
        tag: C
      }]
    });
    let h = document.querySelector("div")?.h;
    expect(h.i).toBeDefined();
  });
  it("fragments in context", () => {
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
        tag: A
      }]
    });
    expect(document.body.innerHTML).toBe("<div><b>1</b><article></article><aside></aside></div>");
  });
  it("fragments in context2", () => {
    let F = () => ({
      cn: () => [{
        tag: "B",
        cn: ["1"]
      }]
    });
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
        tag: A
      }]
    });
    expect(document.body.innerHTML).toBe("<div><b>1</b><article></article><aside></aside></div>");
  });
});