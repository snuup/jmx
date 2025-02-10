function g(e, o = {}) {
  let n = a(e.h?.props) ?? {}
  for (let t in n) !(t in o) && b(t, n[t]) ? (e[t] = null) : e.removeAttribute(t)
  for (let t in o) b(t, o[t]) ? (e[t] = o[t]) : e.setAttribute(t, o[t])
}
let b = (e, o) =>
    ["value", "checked", "disabled", "className", "style", "href", "src", "selected", "readOnly", "tabIndex"].includes(
      e
    ) ||
    o instanceof Object ||
    o instanceof Function,
  a = (e) => (e instanceof Function ? e() : e),
  O = (e, o) => {
    let n
    for (; (n = e.childNodes[o]); ) n.remove()
  },
  j = (e) => e.tag.includes("-"),
  k = (e) => e.tag?.prototype?.view,
  x = (e) => e.kind == "element",
  C = (e) => e.tag == null && e.children != null
function u(e, o, n, t) {
  if (((n = a(n)),
    n == null)
  )
    return o
  const c = e.childNodes[o]
  function v(s) {
    if (c && c.nodeType == 3) c.textContent != s && (c.textContent = s)
    else {
      const d = document.createTextNode(s)
      c ? c.replaceWith(d) : e.appendChild(d)
    }
  }
  switch (typeof n) {
    case "string":
    case "number":
    case "boolean":
      return v(n), o + 1
    case "object":
      let s = function (l, i, p) {
          return a(i.children)?.forEach((w) => (p = u(l, p, w, t))), p
        },
        d = function (l) {
          if (c?.tagName != l) {
            const i = document.createElement(l)
            return c ? c.replaceWith(i) : e.appendChild(i), g(i, r), r?.mounted?.(i), i
          } else return g(c, r), r?.update?.(t), c
        }
      if (C(n)) return s(e, n, o)
      const r = a(n.props)
      if (x(n)) {
        let l = d(n.tag)
        if (((l.h = n), !t.patchElementOnly && !j(n))) {
          const i = s(l, n, 0)
          O(l, i)
        }
        return o + 1
      }
      switch (typeof n.tag) {
        case "function":
          let l, i
          return (
            k(n)
              ? ((n.i = c?.h?.i ?? N(new n.tag(r))), (n.i.props = r), (i = n.i.view()))
              : (i = n.tag(r, a(n.children))),
            (l = u(e, o, i, t)),
            (e.childNodes[o].h = n),
            l
          )
        case "object":
          return u(e, o, n.tag, t)
      }
  }
}
function f(e, o, n = {}) {
  const t = e.parentElement,
    c = [].indexOf.call(t.childNodes, e)
  u(t, c, o, n)
}
function y(e = "body", o = {}) {
  const n = typeof e == "string" ? document.querySelectorAll(e) : [e]
  let t
  for (t of n) {
    for (; t && !t.h; ) t = t.parentElement
    if (t) {
      if ((o.replace && t.replaceChildren(), !t.h))
        throw ["cannot update, because html was not created with jmx: no h exists on the node", t]
      f(t, t.h, o)
    }
  }
}
class E {
  constructor(o) {
    this.props = o
  }
  element
  mounted(o) {}
  update(o) {
    return !1
  }
  updateview() {
    y(this.element)
  }
}
let m = {i: 10}
h({m})
let M = ({n: e}) => ({kind: "element", tag: "DIV", props: () => ({class: "carrots"}), children: () => [e]})
class A extends E {
  state = 500
  mounted(o) {
    console.log("Map mounted", o)
  }
  update(o) {
    return console.log("Map update", this, o), !0
  }
  increment() {
    this.state++, this.updateview()
  }
  view() {
    return console.log("Map view"), {kind: "element", tag: "ASIDE", children: () => ["map"]}
  }
}
let D = {
  kind: "element",
  tag: "BODY",
  children: () => [
    {
      kind: "component",
      tag: M,
      props: () => ({
        n: m.i * 10,
        mounted: (e) => console.log("Numerotti mounted", e),
        update: (e) => console.log("Numerotti update", e)
      })
    },
    {kind: "component", tag: A, props: () => ({a: m.i, s: "s"})}
  ]
}
h({u: y, patch: f})
f(document.body, D)
