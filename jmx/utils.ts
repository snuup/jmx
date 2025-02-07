export function rebind(o) {
    let proto = Object.getPrototypeOf(o)
    let names = Object.entries(Object.getOwnPropertyDescriptors(proto))
        .filter(([, p]) => p.value instanceof Function)
        .filter(([name]) => name != 'constructor')
        .map(([name]) => name)
    for (const name of names) o[name] = o[name].bind(o)
    return o
}

/** remove all children from n with index >= i */
export let removeexcesschildren = (n: HTMLElement, i: number) => { let c: ChildNode; while ((c = n.childNodes[i])) c.remove() }

export let iswebcomponent = (h: HTag) => (h.tag as string).includes('-')

// lib
export let When = ({ cond }, { children }) => cond && jsxf(null, { children })
