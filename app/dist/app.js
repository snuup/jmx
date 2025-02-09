function y(e) {
	Object.assign(globalThis, e)
}
function j(e, ...t) {
	let o = Object.getOwnPropertyDescriptors(e.prototype)
	delete o.constructor,
		t.forEach(n => Object.defineProperties(n.prototype, o)),
		(o = Object.getOwnPropertyDescriptors(e)),
		Object.entries(o).forEach(([n, c]) => !c.writable && delete o[n]),
		t.forEach(n => Object.defineProperties(n, o))
}
j(
	class extends Object {
		log(e) {
			return console.log(e, this), this
		}
	},
	Object
)
function p(e, t = {}) {
	let o = r => {
			b(r, t[r]) ? (e[r] = t[r]) : e.setAttribute(r, t[r])
		},
		n = r => {
			b(r, c[r]) ? (e[r] = null) : e.removeAttribute(r)
		},
		c = s(e.h?.props) ?? {}
	for (let r in c) !(r in t) && n(r)
	for (let r in t) o(r)
}
function b(e, t) {
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
		t instanceof Object ||
		t instanceof Function
	)
}
function O(e) {
	let t = Object.getPrototypeOf(e),
		o = Object.entries(Object.getOwnPropertyDescriptors(t))
			.filter(([, n]) => n.value instanceof Function)
			.filter(([n]) => n != 'constructor')
			.map(([n]) => n)
	for (const n of o) e[n] = e[n].bind(e)
	return e
}
let v = (e, t) => {
		console.log('removeexcesschildren', e.tagName, t)
		let o
		for (; (o = e.childNodes[t]); ) o.remove()
	},
	w = e => e.tag.includes('-')
const s = e => (e instanceof Function ? s(e()) : e)
let x = e => e.tag?.prototype?.view
function d(e, t, o, n) {
	if (o == null) return t
	o = s(o)
	const c = s(o.props),
		r = e.childNodes[t]
	function a(i) {
		if (r && r.nodeType == 3) r.textContent != i && (r.textContent = i)
		else {
			const l = document.createTextNode(i)
			r ? r.replaceWith(l) : e.appendChild(l)
		}
	}
	function m(i) {
		if (r?.tagName != i) {
			const l = document.createElement(i)
			return r ? r.replaceWith(l) : e.appendChild(l), p(l, c), c?.mounted?.(l), l
		} else return p(r, c), c?.update?.(n), r
	}
	function h(i, l) {
		if (x(i)) {
			let f = ((l?.h).i ??= O(new i.tag(c)))
			return (f.props = c), f.view()
		} else return i.tag(c, s(i.children))
	}
	switch (typeof o) {
		case 'string':
		case 'number':
		case 'boolean':
			return a(o), t + 1
		case 'object':
			switch (typeof o.tag) {
				case 'function':
					return d(e, t, h(o, r), n)
				case 'string':
					let i = m(o.tag)
					if (!n.patchElementOnly && !w(o)) {
						const l = C(i, o, 0, n)
						v(i, l)
					}
					return t + 1
			}
	}
	throw 'invalid execution - code is wrong'
}
let E = e => e.tag == null && e.children != null,
	N = e => e.tag instanceof Function && e.children == null && e.props == null
function P(e) {
	return (s(e.children) ?? [])
		.log('children')
		.flatMap(t => (N(t) ? s(s(t.tag).children) : t))
		.flatMap(t => (t.tag && E(t.tag) ? s(t?.tag?.children) : t))
		.filter(t => t != null)
}
function C(e, t, o, n) {
	return (
		P(t).forEach(c => {
			let r = o
			o = d(e, o, c, n)
			let a = e.childNodes[r]
			a && !a.h && (a.h = c)
		}),
		o
	)
}
function u(e, t, o = {}) {
	const n = e.parentElement,
		c = [].indexOf.call(n.childNodes, e)
	d(n, c, t, o), (e.h = t)
}
function F(e = 'body', t = {}) {
	const o = typeof e == 'string' ? document.querySelectorAll(e) : [e]
	let n
	for (n of o) {
		for (; n && !n.h; ) n = n.parentElement
		if (n) {
			if ((t.replace && n.replaceChildren(), !n.h))
				throw ['cannot update, because html was not created with jmx: no h exists on the node', n]
			u(n, n.h, t)
		}
	}
}
jsxa('body', null)
let A = () => jsxa(jsxf, null, 'aa', 'bb'),
	g = jsxa('body', null, jsxa(A, null))
u(document.body, g)
y({ u: F, patch: u, App3: g })
