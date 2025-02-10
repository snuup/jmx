function b(e, c = {}) {
  let n = a(e.h?.props) ?? {}
  for (let t in n) !(t in c) && y(t, n[t]) ? (e[t] = null) : e.removeAttribute(t)
  for (let t in c) y(t, c[t]) ? (e[t] = c[t]) : e.setAttribute(t, c[t])
}
let y = (e, c) =>
    ["value", "checked", "disabled", "className", "style", "href", "src", "selected", "readOnly", "tabIndex"].includes(
      e
    ) ||
    c instanceof Object ||
    c instanceof Function,
  a = (e) => (e instanceof Function ? a(e()) : e),
  h = (e, c) => {
    let n
    for (; (n = e.childNodes[c]); ) n.remove()
  },
  j = (e) => e.tag.includes("-"),
  N = (e) => e.tag?.prototype?.view,
  w = (e) => e.kind == "element",
  C = (e) => e.tag == null && e.children != null
function u(e, c, n, t) {
  if (((n = a(n)), n == null)) return c
  const o = e.childNodes[c]
  function g(s) {
    if (o && o.nodeType == 3) o.textContent != s && (o.textContent = s)
    else {
      const d = document.createTextNode(s)
      o ? o.replaceWith(d) : e.appendChild(d)
    }
  }
  switch (typeof n) {
    case "string":
    case "number":
    case "boolean":
      return g(n), c + 1
    case "object":
      let s = function (i, l, f) {
          return (
            a(l.children)?.forEach((p) => {
              let v = f
              f = u(i, f, p, t)
              let m = i.childNodes[v]
              m && !m.h && (m.h = p)
            }),
            f
          )
        },
        d = function (i) {
          if (o?.tagName != i) {
            const l = document.createElement(i)
            return o ? o.replaceWith(l) : e.appendChild(l), b(l, r), r?.mounted?.(l), l
          } else return b(o, r), r?.update?.(t), o
        }
      if (C(n)) return s(e, n, c)
      const r = a(n.props)
      if (w(n)) {
        let i = d(n.tag)
        if (!t.patchElementOnly && !j(n)) {
          const l = s(i, n, 0)
          h(i, l)
        }
        return c + 1
      }
      switch (typeof n.tag) {
        case "function":
          let i
          if (N(n)) {
            let l = o?.h?.i ?? O(new n.tag(r))
            ;(l.props = r), (i = l.view())
          } else i = n.tag(r, a(n.children))
          return u(e, c, i, t)
        case "object":
          return u(e, c, n.tag, t)
      }
  }
}
function E(e, c, n = {}) {
  const t = e.parentElement,
    o = [].indexOf.call(t.childNodes, e)
  u(t, o, c, n), (e.h = c)
}
E(document.body, "hasen")
