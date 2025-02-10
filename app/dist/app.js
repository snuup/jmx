function m(e) {
	Object.assign(globalThis, e)
}
function D(e) {
	Object.assign(globalThis, e)
}
function P(e, ...t) {
	let n = Object.getOwnPropertyDescriptors(e.prototype)
	delete n.constructor,
		t.forEach(o => Object.defineProperties(o.prototype, n)),
		(n = Object.getOwnPropertyDescriptors(e)),
		Object.entries(n).forEach(([o, c]) => !c.writable && delete n[o]),
		t.forEach(o => Object.defineProperties(o, n))
}
const w = e => (e instanceof Function ? w(e()) : e)
P(
	class extends Object {
		log(e) {
			return console.log(e, this), D({ x: this }), this
		}
		eval() {
			return w(this)
		}
		eve() {
			return globalThis.eve(this)
		}
	},
	Object
)
function v(e, t = {}) {
	let n = r => {
			O(r, t[r]) ? (e[r] = t[r]) : e.setAttribute(r, t[r])
		},
		o = r => {
			O(r, c[r]) ? (e[r] = null) : e.removeAttribute(r)
		},
		c = s(e.h?.props) ?? {}
	for (let r in c) !(r in t) && o(r)
	for (let r in t) n(r)
}
function O(e, t) {
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
function x(e) {
	let t = Object.getPrototypeOf(e),
		n = Object.entries(Object.getOwnPropertyDescriptors(t))
			.filter(([, o]) => o.value instanceof Function)
			.filter(([o]) => o != 'constructor')
			.map(([o]) => o)
	for (const o of n) e[o] = e[o].bind(e)
	return e
}
let F = (e, t) => {
		console.log('removeexcesschildren', e.tagName, t)
		let n
		for (; (n = e.childNodes[t]); ) n.remove()
	},
	T = e => e.tag.includes('-')
const s = e => (e instanceof Function ? s(e()) : e)
let A = e => e.tag?.prototype?.view
function b(e, t) {
	if (e.kind != 'component') throw 'evalComponent called with non-component'
	let n = e.props?.eval()
	if (A(e)) {
		let o = ((t?.h).i ??= x(new e.tag(n)))
		return (o.props = n), o.view()
	} else return e.tag(n, s(e.children))
}
let I = e => e.tag == null && e.children != null
function p(e, t, n, o) {
	if (
		(console.log('%csync', 'background:orange', e.tagName, t, n, 'html = ' + document.body.outerHTML),
		(n = s(n)),
		n == null)
	)
		return t
	const c = e.childNodes[t]
	function r(a) {
		if (c && c.nodeType == 3) c.textContent != a && (c.textContent = a)
		else {
			const d = document.createTextNode(a)
			c ? c.replaceWith(d) : e.appendChild(d)
		}
	}
	switch (typeof n) {
		case 'string':
		case 'number':
		case 'boolean':
			return r(n), t + 1
		case 'object':
			let a = function (l, i, f) {
					return (
						s(i.children)?.forEach(y => {
							let C = f
							f = p(l, f, y, o)
							let g = l.childNodes[C]
							g && !g.h && (g.h = y)
						}),
						f
					)
				},
				d = function (l) {
					if (c?.tagName != l) {
						const i = document.createElement(l)
						return c ? c.replaceWith(i) : e.appendChild(i), v(i, u), u?.mounted?.(i), i
					} else return v(c, u), u?.update?.(o), c
				}
			if (I(n)) return a(e, n, t)
			const u = s(n.props)
			switch (typeof n.tag) {
				case 'function':
					return p(e, t, b(n, c), o)
				case 'string':
					let l = d(n.tag)
					if (!o.patchElementOnly && !T(n)) {
						const i = a(l, n, 0)
						F(l, i)
					}
					return t + 1
				case 'object':
					switch (n.kind) {
						case '<>':
							throw (console.log(n), 'case <>')
						case 'component':
							return console.log(n), p(e, t, n.tag, o)
					}
			}
	}
	throw 'invalid execution - code is wrong'
}
function h(e, t, n = {}) {
	const o = e.parentElement,
		c = [].indexOf.call(o.childNodes, e)
	p(o, c, t, n), (e.h = t)
}
function B(e = 'body', t = {}) {
	const n = typeof e == 'string' ? document.querySelectorAll(e) : [e]
	let o
	for (o of n) {
		for (; o && !o.h; ) o = o.parentElement
		if (o) {
			if ((t.replace && o.replaceChildren(), !o.h))
				throw ['cannot update, because html was not created with jmx: no h exists on the node', o]
			h(o, o.h, t)
		}
	}
}
let j = e => e.kind == 'component',
	V = e => e.kind == 'element',
	k = e => e.kind == '<>'
m({ iscomponent: j, iselement: V, isfrag: k, evalComponent: b })
function E(e) {
	let t = s(e)
	return t == null ? t : j(t) ? b(t) : k(t) ? s(t.children) : t
}
m({ eve: E })
m({ eve: E })
let W = { kind: '<>', children: () => ['aa', 'bb'] },
	Y = () => ({ kind: '<>', children: () => ['aa', 'bb'] }),
	$ = {
		kind: 'element',
		tag: 'BODY',
		children: () => [
			{ kind: 'component', tag: Y },
			{ kind: 'element', tag: 'DIV' },
		],
	},
	N = {
		kind: 'element',
		tag: 'BODY',
		children: () => [
			{ kind: 'component', tag: W },
			{ kind: 'element', tag: 'DIV' },
		],
	}
m({ u: B, patch: h, App2: $, App3: N })
h(document.body, N)
