import { jsx, jsxf, patch } from "../jmx/jmx";
import { describe, it, expect, beforeEach } from "vitest";
beforeEach(() => {
  document.body.replaceChildren();
  document.body.getAttributeNames().forEach(a => document.body.removeAttribute(a));
});
describe("JMX dom tests", () => {
  it("HTag 1", () => {
    var _h =
    /* @__PURE__ */
    {
      kind: "element",
      tag: "BODY",
      children: () => ["hase"]
    };
    let h = {
      kind: "element",
      tag: "BODY",
      children: () => ["hase"]
    };
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 1 thunked", () => {
    var _h =
    /* @__PURE__ */
    {
      kind: "element",
      tag: "BODY",
      children: () => ["hase"]
    };
    let h = () => ({
      kind: "element",
      tag: "BODY",
      children: () => ["hase"]
    });
    patch(document.body, h);
    expect(document.body.outerHTML).toBe("<body>hase</body>");
  });
  it("HTag 2", () => {
    let _h =
    /* @__PURE__ */
    {
      kind: "element",
      tag: "BODY",
      props: () => ({
        class: "cc"
      }),
      children: () => ["hase", 42, true, false]
    };
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
    let F = ({
      x
    }) => (/* @__PURE__ */{
      kind: "element",
      tag: "DIV",
      props: () => ({
        class: "classo" + x * 3
      }),
      children: () => [x * 2]
    });
    let a =
    /* @__PURE__ */
    {
      kind: "element",
      tag: "BODY",
      children: () => [
      /* @__PURE__ */
      {
        kind: "component",
        tag: F,
        props: () => ({
          x: 7
        })
      }]
    };
    let _F = ({
      x
    }) => ({
      kind: "element",
      tag: "DIV",
      props: () => ({
        class: "classo" + x * 3
      }),
      children: () => [x * 2]
    });
    let _a = {
      tag: "BODY",
      children: () => [{
        kind: "component",
        tag: _F,
        props: () => ({
          x: 7
        }),
        children: () => []
      }]
    };
    patch(document.body, a);
    expect(document.body.outerHTML).toBe('<body><div class="classo21">14</div></body>');
  });
  it("clear styles after update", () => {
    patch(document.body,
    /* @__PURE__ */
    {
      kind: "element",
      tag: "BODY",
      children: () => [
      /* @__PURE__ */
      {
        kind: "element",
        tag: "DIV",
        props: () => ({
          class: "hase"
        }),
        children: () => ["div"]
      }]
    });
    expect(document.body.innerHTML).toBe('<div class="hase">div</div>');
    patch(document.querySelector("div"),
    /* @__PURE__ */
    {
      kind: "element",
      tag: "DIV",
      children: () => ["snuff"]
    });
    expect(document.body.innerHTML).toBe("<div>snuff</div>");
  });
  it("fragments", () => {
    let F =
    /* @__PURE__ */
    {
      kind: "<>",
      children: () => [
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["1"]
      },
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["2"]
      },
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["3"]
      }]
    };
    patch(document.body,
    /* @__PURE__ */
    {
      kind: "element",
      tag: "BODY",
      children: () => [
      /* @__PURE__ */
      {
        kind: "component",
        tag: F
      }]
    });
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
  });
  it("fragment thunked", () => {
    let F = () => (/* @__PURE__ */{
      kind: "<>",
      children: () => [
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["1"]
      },
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["2"]
      },
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["3"]
      }]
    });
    patch(document.body,
    /* @__PURE__ */
    {
      kind: "element",
      tag: "BODY",
      children: () => [
      /* @__PURE__ */
      {
        kind: "component",
        tag: F
      }]
    });
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b>");
  });
  it("fragments many", () => {
    let F =
    /* @__PURE__ */
    {
      kind: "<>",
      children: () => [
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["1"]
      },
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["2"]
      },
      /* @__PURE__ */
      {
        kind: "element",
        tag: "B",
        children: () => ["3"]
      }]
    };
    patch(document.body,
    /* @__PURE__ */
    {
      kind: "element",
      tag: "BODY",
      children: () => [
      /* @__PURE__ */
      {
        kind: "component",
        tag: F
      },
      /* @__PURE__ */
      {
        kind: "component",
        tag: F
      }]
    });
    expect(document.body.innerHTML).toBe("<b>1</b><b>2</b><b>3</b><b>1</b><b>2</b><b>3</b>");
  });
});