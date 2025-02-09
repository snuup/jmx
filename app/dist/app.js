let N = (e, o) => {
		let i
		for (; (i = e.childNodes[o]); ) i.remove()
	},
	x = e => e.tag.includes('-')
const s = e => (e instanceof Function ? s(e()) : e)
let C = e => typeof e.tag == 'function',
	h = e => e.tag?.prototype?.view,
	v = e => e.tag == null && e.children != null,
	w = e => e.tag instanceof Function && e.children == null && e.props == null
y({ isfragment: v, isfragment2: w })
function g(e, o = {}) {
	let i = t => {
			b(t, o[t]) ? (e[t] = o[t]) : e.setAttribute(t, o[t])
		},
		n = t => {
			b(t, l[t]) ? (e[t] = null) : e.removeAttribute(t)
		},
		l = s(e.h?.props) ?? {}
	for (let t in l) !(t in o) && n(t)
	for (let t in o) i(t)
}
function b(e, o) {
	return (
		[
			'value',
			'checked',
			'disabled',
			'className',
			'style',
			'href',
			'src',
			'selected',
			'readOnly',
			'tabIndex',
		].includes(e) ||
		o instanceof Object ||
		o instanceof Function
	)
}
function u(e, o, i, n) {
	if (i == null) return o
	i = s(i)
	const l = s(i.props),
		t = e.childNodes[o]
	function f(r) {
		if (t && t.nodeType == 3) t.textContent != r && (t.textContent = r)
		else {
			const c = document.createTextNode(r)
			t ? t.replaceWith(c) : e.appendChild(c)
		}
	}
	function a(r) {
		if (t?.tagName != r) {
			const c = document.createElement(r)
			return t ? t.replaceWith(c) : e.appendChild(c), g(c, l), l?.mounted?.(c), c
		} else return g(t, l), l?.update?.(n), t
	}
	function d(r, c) {
		if (h(r)) {
			let m = ((c?.h).i ??= j(new r.tag(l)))
			return (m.props = l), m.view()
		} else return r.tag(l, s(r.children))
	}
	switch (typeof i) {
		case 'string':
		case 'number':
		case 'boolean':
			return f(i), o + 1
		case 'object':
			switch (typeof i.tag) {
				case 'function':
					return u(e, o, d(i, t), n)
				case 'string':
					let r = a(i.tag)
					if (!n.patchElementOnly && !x(i)) {
						const c = F(r, i, 0, n)
						N(r, c)
					}
					return o + 1
			}
	}
	throw 'invalid execution - code is wrong'
}
let E = e => {
	let o = e
	return w(e) && (o = s(s(e.tag).children)), o
}
function F(e, o, i, n) {
	let l = (s(o.children) ?? [])
		.map(E)
		.flatMap(s)
		.flatMap(t => (t.tag && v(t.tag) ? s(t?.tag?.children) : t))
		.filter(t => t != null)
	return (
		console.log({ kids: l }),
		l.forEach(t => {
			let f = i
			i = u(e, i, t, n)
			let a = e.childNodes[f]
			if (C(t) && !a.h)
				if (h(t)) (t.i.element = a), t.i.mounted?.(a)
				else {
					let d = s(t.props)
					d && d.mounted?.(a)
				}
			a && !a.h && (a.h = t)
		}),
		i
	)
}
function p(e, o, i = {}) {
	const n = e.parentElement,
		l = [].indexOf.call(n.childNodes, e)
	u(n, l, o, i), (e.h = o)
}
function A(e = 'body', o = {}) {
	const i = typeof e == 'string' ? document.querySelectorAll(e) : [e]
	let n
	for (n of i) {
		for (; n && !n.h; ) n = n.parentElement
		if (n) {
			if ((o.replace && n.replaceChildren(), !n.h))
				throw ['cannot update, because html was not created with jmx: no h exists on the node', n]
			p(n, n.h, o)
		}
	}
}
