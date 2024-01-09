
export function mount(x) {
    Object.assign(globalThis, x)
}

export function rebind(o) {
    const proto = Object.getPrototypeOf(o)
    const names =
        Object.entries(Object.getOwnPropertyDescriptors(proto))
            .filter(([, p]) => p.value instanceof Function)
            .filter(([name,]) => name != "constructor")
            .map(([name,]) => name)
    for (const name of names) {
        o[name] = o[name].bind(o)
    }
    return o
}

export function setAttributeSmooth(n: Element, name, value) {
    if (n.getAttribute(name) != value) n.setAttribute(name, value)
}
