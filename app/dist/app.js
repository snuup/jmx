function p(e) {
	Object.assign(globalThis, e)
}
function u(e, t, n, o) {
	n && (j(e, t, o), x(e, t)), t && (O(e, t), e.propsset && e.propsset())
}
function y(e, t) {
	return (
		['href', 'value', 'model', 'checked', 'mounted', 'fargs'].includes(e) ||
		t instanceof Object ||
		t instanceof Function ||
		t instanceof Number ||
		t === void 0 ||
		t === null
	)
}
function h(e) {
	return e.startsWith('on')
}
function w(e) {
	return e instanceof Number || e instanceof String ? e.valueOf() : e
}
function O(e, t) {
	let n = {}
	for (let o in t) {
		let i = t[o]
		h(o) ? (n[o] = i) : y(o, i) ? E(e, o, w(i)) : N(e, o, i)
	}
	C(e, n)
}
function N(e, t, n) {
	n == null || n === !1 ? e.removeAttribute(t) : e.setAttribute(t, n)
}
function j(e, t, n) {
	if (t) {
		for (const o in t) t[o] || e.removeAttribute(o)
		n ||
			e.getAttributeNames().forEach(o => {
				;(!t || !(o in t)) && o != 'comp' && e.removeAttribute(o)
			})
	}
}
function E(e, t, n) {
	let o = (e.defaultprops = e.defaultprops || {})
	o.hasOwnProperty(t) || (o[t] = e[t])
	try {
		e[t] = n
	} catch (i) {
		console.error(i)
	}
}
function x(e, t) {
	for (var n in e.defaultprops) (!t || t[n] == null) && (e[n] = e.defaultprops[n])
}
function C(e, t) {
	e.events &&
		Object.keys(e.events)
			.filter(n => t[n] != e.events[n])
			.forEach(n => (delete e.events[n], e.removeEventListener(n, e.events[n]))),
		Object.keys(t)
			.filter(n => h(n) && (!e.events || !e.events[n]))
			.forEach(n => {
				let o = t[n]
				e.addEventListener(n.slice(2), o), (e.events = e.events || {}), (e.events[n] = o)
			})
}
function A(e) {
	let t = Object.getPrototypeOf(e),
		n = Object.entries(Object.getOwnPropertyDescriptors(t))
			.filter(([, o]) => o.value instanceof Function)
			.filter(([o]) => o != 'constructor')
			.map(([o]) => o)
	for (const o of n) e[o] = e[o].bind(e)
	return e
}
let k = (e, t) => {
		let n
		for (; (n = e.childNodes[t]); ) n.remove()
	},
	M = e => e.tag.includes('-')
const c = e => (e instanceof Function ? c(e()) : e)
let T = e => typeof e.tag == 'function',
	f = e => e.tag.prototype?.view
function P(e, t) {
	const n = c(e.props)
	if (f(e)) {
		let o
		return (
			(o = t?.h)?.i
				? ((o.i.props = n), console.log('best is to cancel view here if update exists'))
				: ((o = e).i = A(new e.tag(n))),
			o.i.view()
		)
	} else {
		let o = e.tag,
			i = c(e.children),
			s
		return (
			(s = t?.h && n?.update) && (s?.(t), console.log('can do: update and exit here!', n?.update?.(t))), o(n, i)
		)
	}
}
function B(e, t, n, o, i) {
	const s = e.childNodes[t]
	if (!s || s.tagName != n) {
		const r = document.createElement(n)
		return s ? s.replaceWith(r) : e.appendChild(r), u(r, o, !1, !1), o?.mounted?.(r), r
	} else return u(s, o, !0, !1), o?.update?.(s), s
}
function D(e, t, n) {
	const o = e.childNodes[t]
	if (o && o.nodeType == 3) o.textContent != n && (o.textContent = n)
	else {
		const i = document.createTextNode(n)
		o ? o.replaceWith(i) : e.appendChild(i)
	}
}
function a(e, t, n, o) {
	switch ((console.log('sync', e.tagName, t, n, e.childNodes[t]), typeof n)) {
		case 'string':
		case 'number':
		case 'boolean':
			return D(e, t, n), t + 1
		case 'object':
			switch (typeof n.tag) {
				case 'function':
					let i = e.childNodes[t]
					if (i && i.h) {
						if (f(n)) {
							if (i.h.i.update?.(o)) return t + 1
						} else if (c(n.props)?.update?.(i)) return t + 1
					}
					const s = P(n, i)
					return s ? a(e, t, s, o) : t
				case 'string':
					switch (n.tag) {
						case 'jsxf':
							return d(e, n, t, o)
						default:
							let r = c(n.props),
								l = B(e, t, n.tag, r)
							if (!r?.update(l)) {
								if (!o.patchElementOnly && !M(n)) {
									const b = d(l, n, 0, o)
									k(l, b)
								}
							}
					}
			}
			return t + 1
		default:
			throw `invalid h ${n}. did you forget to define a component as function, like const C = () => <div>hare</div> ?`
	}
}
function d(e, t, n, o) {
	return (
		console.log('synchchildren', e.tagName, t, n),
		(c(t.children) ?? [])
			.flatMap(c)
			.filter(i => i != null)
			.forEach(i => {
				let s = n
				if (((n = a(e, n, i, o)), T(i))) {
					let r = e.childNodes[s]
					if (!r.h) {
						if (f(i)) (i.i.element = r), i.i.mounted?.(r)
						else {
							let l = c(i.props)
							l && l.mounted?.(r)
						}
						r.h = i
					}
				}
			}),
		n
	)
}
function m(e, t, n = {}) {
	const o = e.parentElement,
		i = [].indexOf.call(o.childNodes, e)
	;(e.h = t), a(o, i, t, n)
}
function v(e = 'body', t = {}) {
	const n = typeof e == 'string' ? document.querySelectorAll(e) : [e]
	let o
	for (o of n) {
		for (; o && !o.h; ) o = o.parentElement
		if (o) {
			if ((t.replace && o.replaceChildren(), !o.h))
				throw ['cannot update, because html was not created with jmx: no h exists on the node', o]
			m(o, o.h, t)
		}
	}
}
class F {
	constructor(t) {
		this.props = t
	}
	element
	mounted(t) {}
	update(t) {
		return !1
	}
	updateview() {
		v(this.element)
	}
}
let g = { i: 10 }
p({ m: g })
class W extends F {
	state = 500
	mounted(t) {
		console.log('Map mounted', t)
	}
	update(t) {
		return console.log('Map update', this, t), !0
	}
	increment() {
		this.state++, this.updateview()
	}
	view() {
		return (
			console.log('Map view'),
			{
				tag: 'DIV',
				props: () => ({ class: 'map' }),
				children: () => [
					this.props.a,
					this.state,
					{ tag: 'BUTTON', props: () => ({ onclick: this.increment }), children: () => ['increment'] },
				],
			}
		)
	}
}
let L = { tag: 'BODY', children: () => [{ tag: W, props: () => ({ a: g.i, s: 's' }), children: () => [] }] }
m(document.body, L)
p({ u: v })
