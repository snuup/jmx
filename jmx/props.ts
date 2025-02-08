// special handling of attributes: https://github.com/jorgebucaran/hyperapp/blob/main/index.js

export function setprops(e: HTMLElement, newprops: Props = {}) {

    let set = p => {
		if (isproperty(p, newprops[p])) e[p] = newprops[p]
		else e.setAttribute(p, newprops[p])
	}

	let rem = p => {
		if (isproperty(p, oldprops[p])) e[p] = null // tbd: not sure if that is correct, should be rare border cases where this matters
		else e.removeAttribute(p)
	}

	let oldprops = e.h?.props?.() ?? {}
	for (let p in oldprops) if (p in newprops) set(p); else rem(p)
	for (let p in newprops) if (!(p in oldprops)) set(p)
}

function isproperty(name: string, value: any) {
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
		].includes(name) ||
		value instanceof Object ||
		value instanceof Function
	)
}
