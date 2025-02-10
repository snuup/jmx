let y = (e, n) =>
    ["value", "checked", "disabled", "className", "style", "href", "src", "selected", "readOnly", "tabIndex"].includes(
      e
    ) ||
    n instanceof Object ||
    n instanceof Function,
  b = (e, n = {}) => {
    let i = p(e.h?.props) ?? {}
    for (let t in i) !(t in n) && y(t, i[t]) ? (e[t] = null) : e.removeAttribute(t)
    for (let t in n) y(t, n[t]) ? (e[t] = n[t]) : e.setAttribute(t, n[t])
  },
  p = (e) => (e instanceof Function ? e() : e),
  C = (e, n) => {
    let i
    for (; (i = e.childNodes[n]); ) i.remove()
  },
  T = (e) => e.tag.includes("-"),
  E = (e) => e.tag?.prototype?.view,
  M = (e) => e.kind == "element",
  A = (e) => e.tag == null && e.children != null
function h(e, n, i = {}) {
  const t = e.parentElement,
    w = [].indexOf.call(t.childNodes, e)
  f(t, w, n)
  function f(a, s, o) {
    if (((o = p(o)), o == null)) return s
    let l = a.childNodes[s]
    function N(d) {
      if (l && l.nodeType == 3) l.textContent != d && (l.textContent = d)
      else {
        let m = document.createTextNode(d)
        l ? l.replaceWith(m) : a.appendChild(m)
      }
    }
    switch (typeof o) {
      case "object":
        let d = function (r, c, g) {
            return p(c.children)?.forEach((k) => (g = f(r, g, k))), g
          },
          m = function (r) {
            if (l?.tagName != r) {
              const c = document.createElement(r)
              return l ? l.replaceWith(c) : a.appendChild(c), b(c, u), u?.mounted?.(c), c
            } else return b(l, u), u?.update?.(i), l
          }
        if (A(o)) return d(a, o, s)
        const u = p(o.props)
        if (M(o)) {
          let r = m(o.tag)
          if (((r.h = o), !i.patchElementOnly && !T(o))) {
            const c = d(r, o, 0)
            C(r, c)
          }
          return s + 1
        }
        switch (typeof o.tag) {
          case "function":
            let r, c
            return (
              E(o) ? (((o.i ??= x(new o.tag())).props = u), (c = o.i.view())) : (c = o.tag(u, p(o.children))),
              (r = f(a, s, c)),
              (a.childNodes[s].h = o),
              r
            )
          case "object":
            return f(a, s, o.tag)
        }
      default:
        return N(o), s + 1
    }
  }
}
function O(e = "body", n = {}) {
  const i = typeof e == "string" ? document.querySelectorAll(e) : [e]
  let t
  for (t of i) {
    if ((n.replace && t.replaceChildren(), !t.h)) throw ["jmx: no h exists on the node", t]
    h(t, t.h, n)
  }
}
