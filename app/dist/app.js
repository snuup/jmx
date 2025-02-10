function y(e, n = {}) {
  let t = (o) => {
      g(o, n[o]) ? (e[o] = n[o]) : e.setAttribute(o, n[o])
    },
    c = (o) => {
      g(o, l[o]) ? (e[o] = null) : e.removeAttribute(o)
    },
    l = d(e.h?.props) ?? {}
  for (let o in l) !(o in n) && c(o)
  for (let o in n) t(o)
}
let g = (e, n) =>
  ["value", "checked", "disabled", "className", "style", "href", "src", "selected", "readOnly", "tabIndex"].includes(
    e
  ) ||
  n instanceof Object ||
  n instanceof Function
function O(e) {
  let n = Object.getPrototypeOf(e),
    t = Object.entries(Object.getOwnPropertyDescriptors(n))
      .filter(([, c]) => c.value instanceof Function)
      .filter(([c]) => c != "constructor")
      .map(([c]) => c)
  for (const c of t) e[c] = e[c].bind(e)
  return e
}
let h = (e, n) => {
    let t
    for (; (t = e.childNodes[n]); ) t.remove()
  },
  j = (e) => e.tag.includes("-")
const d = (e) => (e instanceof Function ? d(e()) : e)
let N = (e) => e.tag?.prototype?.view,
  w = (e) => e.kind == "element",
  C = (e) => e.tag == null && e.children != null
function m(e, n, t, c) {
  if (((t = d(t)), t == null)) return n
  const l = e.childNodes[n]
  function o(a) {
    if (l && l.nodeType == 3) l.textContent != a && (l.textContent = a)
    else {
      const f = document.createTextNode(a)
      l ? l.replaceWith(f) : e.appendChild(f)
    }
  }
  switch (typeof t) {
    case "string":
    case "number":
    case "boolean":
      return o(t), n + 1
    case "object":
      let a = function (i, r, u) {
          return (
            d(r.children)?.forEach((b) => {
              let v = u
              u = m(i, u, b, c)
              let p = i.childNodes[v]
              p && !p.h && (p.h = b)
            }),
            u
          )
        },
        f = function (i) {
          if (l?.tagName != i) {
            const r = document.createElement(i)
            return l ? l.replaceWith(r) : e.appendChild(r), y(r, s), s?.mounted?.(r), r
          } else return y(l, s), s?.update?.(c), l
        }
      if (C(t)) return a(e, t, n)
      const s = d(t.props)
      if (w(t)) {
        let i = f(t.tag)
        if (!c.patchElementOnly && !j(t)) {
          const r = a(i, t, 0)
          h(i, r)
        }
        return n + 1
      }
      switch (typeof t.tag) {
        case "function":
          let i
          if (N(t)) {
            let r = ((l?.h).i ??= O(new t.tag(s)))
            ;(r.props = s), (i = r.view())
          } else i = t.tag(s, d(t.children))
          return m(e, n, i, c)
        case "object":
          return m(e, n, t.tag, c)
      }
  }
}
function E(e, n, t = {}) {
  const c = e.parentElement,
    l = [].indexOf.call(c.childNodes, e)
  m(c, l, n, t), (e.h = n)
}
let x = "hase"
E(document.body, x)
