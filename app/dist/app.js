function y(e) {
  Object.assign(globalThis, e)
}
function v(e) {
  let l = Object.getPrototypeOf(e),
    n = Object.entries(Object.getOwnPropertyDescriptors(l))
      .filter(([, t]) => t.value instanceof Function)
      .filter(([t]) => t != "constructor")
      .map(([t]) => t)
  for (const t of n) e[t] = e[t].bind(e)
  return e
}
let s = (e) => (e instanceof Function ? e() : e),
  O = (e, l) => {
    let n
    for (; (n = e.childNodes[l]); ) n.remove()
  },
  k = (e) => e.tag.includes("-"),
  N = (e) => e.tag?.prototype?.view,
  C = (e) => e.kind == "element",
  w = (e) => e.tag == null && e.children != null,
  x = (e) => typeof e == "object",
  h = (e, l) =>
    ["value", "checked", "disabled", "className", "style", "href", "src", "selected", "readOnly", "tabIndex"].includes(
      e
    ) ||
    l instanceof Object ||
    l instanceof Function,
  b = (e, l = {}) => {
    let n = s(e.h?.props) ?? {}
    for (let t in n) !(t in l) && h(t, n[t]) ? (e[t] = null) : e.removeAttribute(t)
    for (let t in l) h(t, l[t]) ? (e[t] = l[t]) : e.setAttribute(t, l[t])
  }
function u(e, l, n, t) {
  if (((n = s(n)), n == null)) return l
  let o = e.childNodes[l]
  function j(a) {
    if (o && o.nodeType == 3) o.textContent != a && (o.textContent = a)
    else {
      let r = document.createTextNode(a)
      o ? o.replaceWith(r) : e.appendChild(r)
    }
  }
  if (x(n)) {
    let a = function (i, c, d) {
      return s(c.children)?.forEach((f) => (d = u(i, d, f, t))), d
    }
    if (w(n)) return a(e, n, l)
    const r = s(n.props)
    if (C(n)) {
      let i
      if (o?.tagName != n.tag)
        (i = document.createElement(n.tag)), o ? o.replaceWith(i) : e.appendChild(i), b(i, r), r?.mounted?.(i)
      else if (((i = o), b(i, r), r?.update?.(o, t))) return console.log("no update for ", i), l + 1
      if (((i.h = n), !t.patchElementOnly && !k(n))) {
        const c = a(i, n, 0)
        O(i, c)
      }
      return l + 1
    }
    switch (typeof n.tag) {
      case "function":
        let i = o?.h?.tag == n.tag,
          c
        if (N(n) && ((n.i = c = o?.h?.i ?? v(new n.tag(r))), (c.props = r), i && c.update(t))) return l + 1
        let d = c?.view() ?? n.tag(r, s(n.children)),
          f = u(e, l, d, t),
          g = e.childNodes[l]
        return (g.h = n), c && (c.element = g), i || c?.mounted(), f != l + 1 && console.error("can this happen?"), f
      case "object":
        return u(e, l, n.tag, t)
    }
  }
  return j(n), l + 1
}
function m(e, l, n = {}) {
  const t = e.parentElement,
    o = [].indexOf.call(t.childNodes, e)
  u(t, o, l, n)
}
function A(e = "body", l = {}) {
  const n = typeof e == "string" ? document.querySelectorAll(e) : [e]
  let t
  for (t of n) {
    if ((l.replace && t.replaceChildren(), !t.h)) throw ["jmx: no h exists on the node", t]
    m(t, t.h, l)
  }
}
let p = {i: 10, name: ""}
y({m: p})
let E = {
  kind: "element",
  tag: "BODY",
  children: () => [
    {kind: "element", tag: "H2", children: () => ["header"]},
    {kind: "element", tag: "H3", children: () => ["liste"]},
    {kind: "element", tag: "DIV", children: () => ["anzahl = ", p.i]},
    {kind: "element", tag: "ARTICLE", children: () => [{kind: "element", tag: "B", children: () => ["anzahl = ", p.i]}]}
  ]
}
y({u: A, patch: m})
m(document.body, {kind: "component", tag: E})
